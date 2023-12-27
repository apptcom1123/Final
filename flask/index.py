import os
from flask import Flask, request, render_template, send_file, flash, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from inference.infer_tool import Svc
import soundfile
import os
import librosa
import numpy as np
import soundfile
import librosa
from dotenv import load_dotenv
from pymongo import MongoClient
from pusher import Pusher

load_dotenv()

pusher = Pusher(
    app_id=os.getenv("PUSHER_ID"),
    key=os.getenv("PUSHER_KEY"),
    secret=os.getenv("PUSHER_SECRET"),
    cluster=os.getenv("PUSHER_CLUSTER"),
    ssl=True
)
MONGODB_URI = os.getenv("MONGODB_URI")
try:
    mongo_client = MongoClient(MONGODB_URI)
except:
    print("Cannot connect to MongoDB")

db = mongo_client["wp_final"]
collection = db["data"]

UPLOAD_FOLDER = './uploads'
RESULT_FOLDER = './results'
ALLOWED_EXTENSIONS = {'wav'}

app = Flask(__name__)
app.secret_key = '123123' 
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

# 預設模型和配置路徑，請根據您的路徑進行修改
default_model_path = "./model/G_680000.pth"
default_config_path = "./model/config.json"

# 全局模型變量
model = None

# 判斷文件類型
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 初始化模型
def initialize_model():
    global model
    try:
        model = Svc(default_model_path, default_config_path)
        print("模型初始化成功")
    except Exception as e:
        print("模型初始化失敗:", e)
        #if debug: traceback.print_exc()

# 在Flask啟動時初始化模型
app.before_request_funcs = [(None,initialize_model())]

# 音頻處理功能
def process_audio(docId, tone, f0):
    file_path = os.path.join(UPLOAD_FOLDER, f"{docId}.wav")
    if not os.path.exists(file_path):
        return None, "File not found"

    # Read audio file
    audio_data, audio_sr = soundfile.read(file_path)

    # adjust format
    if audio_data.dtype.kind in ['i', 'u']:
        # 如果音频数据是整数类型，进行规范化
        audio_data = (audio_data / np.iinfo(audio_data.dtype).max).astype(np.float32)
    if len(audio_data.shape) > 1:
        # 如果音频是立体声，转换为单声道
        audio_data = librosa.to_mono(audio_data.T)

    # 写入临时文件
    temp_path = "temp.wav"
    soundfile.write(temp_path, audio_data, audio_sr, format="wav")

    # 處理音頻
    # 假設 spk, slice_db, cluster_infer_ratio, noice_scale 等參數已經設置
    spk = "Tanya"  # 需要根據您的模型設定正確的值
    slice_db = -40  # 音頻切片分貝閾值
    cluster_infer_ratio = 0  # 聚類推理比例
    noice_scale = 0.4  # 噪音比例

    # 假設 pad_seconds, clip_seconds, lg_num, lgr_num, F0_mean_pooling, enhancer_adaptive_key 使用預設值
    pad_seconds = 0.5
    clip_seconds = 0
    lg_num = 0
    lgr_num = 0.75
    F0_mean_pooling = False
    enhancer_adaptive_key = 0

    auto_f0 = f0 == 1

    result_audio = model.slice_inference(file_path, spk, tone, slice_db, cluster_infer_ratio, auto_f0, noice_scale, pad_seconds, clip_seconds, lg_num, lgr_num, F0_mean_pooling, enhancer_adaptive_key)

    # 清理临时文件
    os.remove(temp_path)

    # 保存处理后的音频
    result_file_path = os.path.join(RESULT_FOLDER, f"result_{docId}.wav")
    soundfile.write(result_file_path, result_audio, audio_sr, format="wav")


    return result_file_path, None


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        docId = request.form['docId']
        tone = request.form.get('tone', 0, type=int)
        f0 = request.form.get('f0', 0, type=int)
        result_path, error = process_audio(docId, tone, f0)
        
        if error:
            flash(error)
            return redirect(url_for('index'))
        return render_template('download.html', docId=docId)
    return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Flask App</title>
        </head>
        <body>
            <h2>Upload File</h2>
            <form action="/uploads" method="post" enctype="multipart/form-data">
                <input type="file" name="file" id="file">
                <input type="submit" value="Upload File" name="submit">
            </form>

            <h2>Process Audio</h2>
            <form action="/predict" method="post">
                <label for="docId">Document ID (Filename without extension):</label>
                <input type="text" id="docId" name="docId"><br><br>
                <label for="tone">Tone:</label>
                <input type="number" id="tone" name="tone"><br><br>
                <label for="f0">F0:</label>
                <input type="number" id="f0" name="f0"><br><br>
                <input type="submit" value="Process Audio">
            </form>
        </body>
        </html>
        '''
@app.route('/react_predict', methods=['GET', 'POST'])
def react_predict():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            docId = data.get("docID", None)
            tone = int(request.args.get("tone"))
            f0 = int(request.args.get("f0"))
            result_file_path = os.path.join(RESULT_FOLDER, f"result_{docId}.wav")
            
            if os.path.exists(result_file_path):
                os.remove(result_file_path)

            
            result_path, error = process_audio(docId, tone, f0)
            collection.update_one({"docID": str(docId)}, {"$set": {"done":True}})
            pusher.trigger(f"{docId}", 'update', "generation_complete")
            if error:
                flash(error)
                return redirect(url_for('index'))
        return redirect(url_for('index'))
    return redirect(url_for('index'))


@app.route('/download', methods=['GET'])
def download():
    docId = request.args.get('docId')
    return send_file(os.path.join(RESULT_FOLDER, f"result_{docId}.wav"), as_attachment=True)

@app.route('/download/<params>', methods=['GET'])
def download_result(params):
    docId = params
    return send_file(os.path.join(RESULT_FOLDER, f"result_{docId}.wav"), as_attachment=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploads', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        print(file)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            return redirect(url_for('upload_file',
                                    filename=filename))
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flask App</title>
    </head>
    <body>
        <h2>Upload File</h2>
        <form action="/uploads" method="post" enctype="multipart/form-data">
            <input type="file" name="file" id="file">
            <input type="submit" value="Upload File" name="submit">
        </form>

        <h2>Process Audio</h2>
        <form action="/predict" method="post">
            <label for="docId">Document ID (Filename without extension):</label>
            <input type="text" id="docId" name="docId"><br><br>
            <label for="tone">Tone:</label>
            <input type="number" id="tone" name="tone"><br><br>
            <label for="f0">F0:</label>
            <input type="number" id="f0" name="f0"><br><br>
            <input type="submit" value="Process Audio">
        </form>
    </body>
    </html>
    '''

@app.route('/delete', methods=['GET', 'POST'])
def delete_page():
    if request.method == 'POST':
        docId = request.form['docId']
        # 调用删除函数
        return delete(docId)
    return render_template('delete.html')

@app.route("/delete/<params>", methods=["DELETE"])
def react_delete(params):
    if request.method == "DELETE":
        docID = params
        return delete(docID)

def delete(docId):
    upload_file_path = os.path.join(UPLOAD_FOLDER, f"{docId}.wav")
    result_file_path = os.path.join(RESULT_FOLDER, f"result_{docId}.wav")

    try:
        if os.path.exists(upload_file_path):
            os.remove(upload_file_path)
        if os.path.exists(result_file_path):
            os.remove(result_file_path)
        return jsonify({"message": "File deleted successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/react_uploads', methods=['POST'])
def reactUpload():
    if request.method == 'POST':
        # check if the post request has the file part
        file = request.files["file"]
        print(f"Uploading {file.filename}")
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return "ok"
    

# @app.route('/predict/<docId>', methods=['GET', 'POST'])
# def predict(docId):
#     tone = request.args.get('tone', 0, type=int)
#     f0 = request.args.get('f0', 0, type=int)

#     result_path, error = process_audio(docId, tone, f0)
#     if error:
#         return jsonify({"error": error}), 404

#     return jsonify({"prediction_result": result_path})


# @app.route('/delete/<docId>', methods=['DELETE'])
# def delete(docId):
#     upload_file_path = os.path.join(UPLOAD_FOLDER, f"{docId}.wav")  # 添加 .wav 扩展名
#     result_file_path = os.path.join(RESULT_FOLDER, f"result_{docId}.wav")  # 添加 .wav 扩展名

#     try:
#         # 删除上传的文件
#         if os.path.exists(upload_file_path):
#             os.remove(upload_file_path)

#         # 删除处理结果的文件
#         if os.path.exists(result_file_path):
#             os.remove(result_file_path)

#         return jsonify({"message": "File deleted successfully"})

#     except Exception as e:
#         # 返回一个错误信息
#         return jsonify({"error": str(e)}), 500


# @app.route("/download/<params>", methods=["GET"])
# def download(params):
#     if request.method == "GET":
#         return send_file(f"./result/result_{params}.wav")

@app.route("/pusher", methods=["GET"])
def pu():
    pusher.trigger("test", "test_event", {"content": "test pusher"})
    return "pusher test"

if __name__ == '__main__':
    app.run()
