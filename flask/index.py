import os
from flask import Flask, flash, request, redirect, url_for, send_file, jsonify
from werkzeug.utils import secure_filename
from torch_utils import transforms_voice, get_predicition
from flask_cors import CORS
import uuid

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'mp4','wav'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = uuid.uuid4().hex

@app.route("/")
def hello_world():
    return {"content": "hello world"}

@app.route("/predict")
def predict():
    file = request.files.get('file')
    if file is None or file.filename == "":
        return jsonify({'error':'no file'})
    if not allowed_file(file.filename):
        return jsonify({'error':'format not support'})
    
    try:
        voice_bytes=file.read()
        tensor = transforms_voice(voice_bytes)
        prediction = get_predicition(tensor)
        data = {'prediction': prediction.item(), 'class_name': str(prediction.item())}
        return jsonify(data)
    except:
        return jsonify({'error': 'error during prediction'})
    



    return jsonify({'result': 1})


@app.route("/api/<params>")
def api(params):
    return {"content": params   }

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
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@app.route('/react_uploads', methods=['POST'])
def reactUpload():
    if request.method == 'POST':
        # check if the post request has the file part
        file = request.files["file"]
        print(f"Uploading {file.filename}")
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return "ok"

@app.route("/download/<params>", methods=["GET"])
def download(params):
    if request.method == "GET":
        return send_file(f"./uploads/{params}")

if (__name__ == __name__):
    app.run()