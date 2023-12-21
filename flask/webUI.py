import io
import os

# os.system("wget -P cvec/ https://huggingface.co/spaces/innnky/nanami/resolve/main/checkpoint_best_legacy_500.pt")
import gradio as gr
import gradio.processing_utils as gr_pu
import librosa
import numpy as np
import soundfile
from inference.infer_tool import Svc
import logging
import re
import json

import subprocess
import edge_tts
import asyncio
from scipy.io import wavfile
import librosa
import torch
import time
import traceback
from itertools import chain
from utils import mix_model

logging.getLogger('numba').setLevel(logging.WARNING)
logging.getLogger('markdown_it').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)
logging.getLogger('matplotlib').setLevel(logging.WARNING)
logging.getLogger('multipart').setLevel(logging.WARNING)

model = None
spk = None
debug = False

cuda = {}
if torch.cuda.is_available():
    for i in range(torch.cuda.device_count()):
        device_name = torch.cuda.get_device_properties(i).name
        cuda[f"CUDA:{i} {device_name}"] = f"cuda:{i}"

def upload_mix_append_file(files,sfiles):
    try:
        if(sfiles == None):
            file_paths = [file.name for file in files]
        else:
            file_paths = [file.name for file in chain(files,sfiles)]
        p = {file:100 for file in file_paths}
        return file_paths,mix_model_output1.update(value=json.dumps(p,indent=2))
    except Exception as e:
        if debug: traceback.print_exc()
        raise gr.Error(e)

def mix_submit_click(js,mode):
    try:
        assert js.lstrip()!=""
        modes = {"凸组合":0, "线性组合":1}
        mode = modes[mode]
        data = json.loads(js)
        data = list(data.items())
        model_path,mix_rate = zip(*data)
        path = mix_model(model_path,mix_rate,mode)
        return f"成功，文件被保存在了{path}"
    except Exception as e:
        if debug: traceback.print_exc()
        raise gr.Error(e)

def updata_mix_info(files):
    try:
        if files == None : return mix_model_output1.update(value="")
        p = {file.name:100 for file in files}
        return mix_model_output1.update(value=json.dumps(p,indent=2))
    except Exception as e:
        if debug: traceback.print_exc()
        raise gr.Error(e)


default_model_path = "/home/wang/final/Final/flask/model/G_680000.pth"
default_config_path = "/home/wang/final/Final/flask/model/config.json"

def modelAnalysis(model_path,config_path,cluster_model_path,device,enhance):
    global model
    try:
        # 如果路径未提供，则使用默认路径
        if model_path is None:
            model_path = default_model_path
        else:
            model_path = model_path.name  # 假设 model_path 是一个文件对象

        if config_path is None:
            config_path = default_config_path
        else:
            config_path = config_path.name  # 假设 config_path 是一个文件对象


        device = cuda[device] if "CUDA" in device else device
        model = Svc(model_path, config_path, device=device if device != "Auto" else None, cluster_model_path=cluster_model_path.name if cluster_model_path is not None else "", nsf_hifigan_enhance=enhance)
        spks = list(model.spk2id.keys())
        device_name = torch.cuda.get_device_properties(model.dev).name if "cuda" in str(model.dev) else str(model.dev)
        msg = f"成功加载模型到設備{device_name}上\n"
        if cluster_model_path is None:
            msg += "未加載聚類模型\n"
        else:
            msg += f"聚類模型{cluster_model_path.name}加載成功\n"
        msg += "當前模型的可用音色：\n"
        for i in spks:
            msg += i + " "
        return sid.update(choices = spks,value=spks[0]), msg
    except Exception as e:
        if debug: traceback.print_exc()
        raise gr.Error(e)

    
def modelUnload():
    global model
    if model is None:
        return sid.update(choices = [],value=""),"沒有模型需要卸載!"
    else:
        model.unload_model()
        model = None
        torch.cuda.empty_cache()
        return sid.update(choices = [],value=""),"模型卸載完畢!"


def vc_fn(sid, input_audio, vc_transform, auto_f0,cluster_ratio, slice_db, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,F0_mean_pooling,enhancer_adaptive_key):
    global model
    try:
        sampling_rate, audio_array = input_audio
        print(f"採樣率: {sampling_rate}")
        if input_audio is None:
            raise gr.Error("你需要上傳音檔")
        if model is None:
            raise gr.Error("你需要指定模型")
        sampling_rate, audio = input_audio
        # print(audio.shape,sampling_rate)
        audio = (audio / np.iinfo(audio.dtype).max).astype(np.float32)
        if len(audio.shape) > 1:
            audio = librosa.to_mono(audio.transpose(1, 0))
        temp_path = "temp.wav"
        soundfile.write(temp_path, audio, sampling_rate, format="wav")
        _audio = model.slice_inference(temp_path, sid, vc_transform, slice_db, cluster_ratio, auto_f0, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,F0_mean_pooling,enhancer_adaptive_key)
        model.clear_empty()
        os.remove(temp_path)
        # 建構保存模型的路徑
        try:
            timestamp = str(int(time.time()))
            filename = sid + "_" + timestamp + ".wav"
            output_file = os.path.join("./results", filename)
            print(output_file)
            soundfile.write(output_file, _audio, model.target_sample, format="wav")
            return f"推理成功，音檔保存為results/{filename}", (model.target_sample, _audio)
        except Exception as e:
            if debug: traceback.print_exc()
            raise gr.Error(e)
    except Exception as e:
        if debug: traceback.print_exc()
        raise gr.Error(e)


def tts_func(_text,_rate,_voice):
    voice = "zh-CN-YunxiNeural"#男性
    if ( _voice == "女" ) : voice = "zh-CN-XiaoyiNeural"
    output_file = _text[0:10]+".wav"
    # communicate = edge_tts.Communicate(_text, voice)
    # await communicate.save(output_file)
    if _rate>=0:
        ratestr="+{:.0%}".format(_rate)
    elif _rate<0:
        ratestr="{:.0%}".format(_rate)#减号自带

    p=subprocess.Popen("edge-tts "+
                        " --text "+_text+
                        " --write-media "+output_file+
                        " --voice "+voice+
                        " --rate="+ratestr
                        ,shell=True,
                        stdout=subprocess.PIPE,
                        stdin=subprocess.PIPE)
    p.wait()
    return output_file

def text_clear(text):
    return re.sub(r"[\n\,\(\) ]", "", text)

def vc_fn2(sid, input_audio, vc_transform, auto_f0,cluster_ratio, slice_db, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,text2tts,tts_rate,tts_voice,F0_mean_pooling,enhancer_adaptive_key):
    # 使用edge-tts把文字轉換成音檔
    text2tts=text_clear(text2tts)
    output_file=tts_func(text2tts,tts_rate,tts_voice)

    # 調整採樣率
    sr2=44100
    wav, sr = librosa.load(output_file)
    wav2 = librosa.resample(wav, orig_sr=sr, target_sr=sr2)
    save_path2= text2tts[0:10]+"_44k"+".wav"
    wavfile.write(save_path2,sr2,
                (wav2 * np.iinfo(np.int16).max).astype(np.int16)
                )

    # 讀取音頻
    sample_rate, data=gr_pu.audio_from_file(save_path2)
    vc_input=(sample_rate, data)

    a,b=vc_fn(sid, vc_input, vc_transform,auto_f0,cluster_ratio, slice_db, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,F0_mean_pooling,enhancer_adaptive_key)
    os.remove(output_file)
    os.remove(save_path2)
    return a,b

def debug_change():
    global debug
    debug = debug_button.value

with gr.Blocks(
    theme=gr.themes.Base(
        primary_hue = gr.themes.colors.green,
        font=["Source Sans Pro", "Arial", "sans-serif"],
        font_mono=['JetBrains mono', "Consolas", 'Courier New']
    ),
) as app:
    with gr.Tabs():
        with gr.TabItem("推理"):
            gr.Markdown(value="""
                So-vits-svc 4.0 推理 webui
                """)
            with gr.Row(variant="panel"):
                with gr.Column():
                    gr.Markdown(value="""
                        <font size=2> 模型設置</font>
                        """)
                    model_path = gr.File(label="選擇模型文件")
                    config_path = gr.File(label="選擇配置文件")
                    cluster_model_path = gr.File(label="選擇cluster模型文件（没有可以不選）")
                    device = gr.Dropdown(label="推理設備，自動選擇CPU或GPU", choices=["Auto",*cuda.keys(),"CPU"], value="Auto")
                    enhance = gr.Checkbox(label="是否使用NSF_HIFIGAN增強,該選項對部份訓練集少的模型有一定的音質增強效果，但是對訓練良好的模型有反面效果，默認關閉", value=False)
                with gr.Column():
                    gr.Markdown(value="""
                        <font size=3>左側文件全部選擇完畢後（全部文件模塊顯示download），點擊'載入模型'進行解析：</font>
                        """)
                    model_load_button = gr.Button(value="載入模型", variant="primary")
                    model_unload_button = gr.Button(value="卸載模型", variant="primary")
                    sid = gr.Dropdown(label="音色（說話人）")
                    sid_output = gr.Textbox(label="Output Message")


            with gr.Row(variant="panel"):
                with gr.Column():
                    gr.Markdown(value="""
                        <font size=2> 推理設置</font>
                        """)
                    auto_f0 = gr.Checkbox(label="自動f0預測，配合聚類模型f0預測效果更好,會導致變調功能失效（僅限轉換語音，歌聲勾選此項會究極跑調）", value=False)
                    F0_mean_pooling = gr.Checkbox(label="是否對F0使用均值濾波器(池化)，對部分啞音有改善。注意，啟動該選項會導致推理速度下降，預設關閉", value=False)
                    vc_transform = gr.Number(label="變調（整數，可以正負，半音數量，升高八度就是12）", value=0)
                    cluster_ratio = gr.Number(label="聚類模型混合比例，0-1之間，0即不啟用聚類。使用聚類模型能提升音色相似度，但會導致咬字下降（如果使用建議0.5左右）", value=0)
                    slice_db = gr.Number(label="切片閾值", value=-40)
                    noise_scale = gr.Number(label="noise_scale 建議不要動，會影響音質，玄學參數", value=0.4)
                with gr.Column():
                    pad_seconds = gr.Number(label="推理音檔pad秒數，由於未知原因開頭結尾會有異響，pad一小段靜音段後就不會出現", value=0.5)
                    cl_num = gr.Number(label="音檔自動切片，0為不切片，單位為秒(s)", value=0)
                    lg_num = gr.Number(label="兩端音檔切片的交叉淡入長度，如果自動切片後出現人聲不連貫可調整該數值，如果連貫建議採用預設值0，注意，該設置會影響推理速度，單位為秒/s", value=0)
                    lgr_num = gr.Number(label="自動音檔切片後，需要捨棄每段切片的頭尾。該參數設置交叉長度保留的比例，範圍0-1,左開右閉", value=0.75)
                    enhancer_adaptive_key = gr.Number(label="使增強器適應更高的音域(單位為半音數)|預設為0", value=0)
            with gr.Tabs():
                with gr.TabItem("音檔轉音檔"):
                    vc_input3 = gr.Audio(label="選擇音檔")
                    vc_submit = gr.Button("音檔轉換", variant="primary")
            with gr.Row():
                with gr.Column():
                    vc_output1 = gr.Textbox(label="Output Message")
                with gr.Column():
                    vc_output2 = gr.Audio(label="Output Audio", interactive=False)

                    
                    
    with gr.Tabs():
        with gr.Row(variant="panel"):
            with gr.Column():
                gr.Markdown(value="""
                    <font size=2> WebUI設定</font>
                    """)
                # debug_button = gr.Checkbox(label="Debug模式", value=debug)
        vc_submit.click(vc_fn, [sid, vc_input3, vc_transform,auto_f0,cluster_ratio, slice_db, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,F0_mean_pooling,enhancer_adaptive_key], [vc_output1, vc_output2])
        # vc_submit2.click(vc_fn2, [sid, vc_input3, vc_transform,auto_f0,cluster_ratio, slice_db, noise_scale,pad_seconds,cl_num,lg_num,lgr_num,text2tts,tts_rate,tts_voice,F0_mean_pooling,enhancer_adaptive_key], [vc_output1, vc_output2])
        # debug_button.change(debug_change,[],[])
        model_load_button.click(modelAnalysis,[model_path,config_path,cluster_model_path,device,enhance],[sid,sid_output])
        model_unload_button.click(modelUnload,[],[sid,sid_output])
    app.launch(share=True)


 