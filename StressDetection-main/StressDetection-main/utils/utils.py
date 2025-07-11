from flask import request, render_template, jsonify, Response
# from utils.audio_utils import predict_audio_emotion, handle_audio_upload

from utils.audio_utils import handle_audio_upload
from utils.video_utils import (
    start_uploaded_video_stream, start_live_video_stream,
    stop_video_stream, upload_video_file,
    generate_uploaded_video_stream, generate_live_video_stream,clear_uploaded_path
)
from utils.text_utils import predict_text_emotion

def register_routes(app):

    @app.route('/')
    def index():
        return render_template("index.html")
    
    @app.route('/predict-text-emotion', methods=['POST'])
    def handle_text():
        data = request.get_json()
        response, status = predict_text_emotion(data)
        return jsonify(response), status

    # AUDIO ROUTES
    @app.route('/upload-audio', methods=['POST'])
    def upload_audio():
        return handle_audio_upload(request.files)

    # VIDEO ROUTES
    @app.route('/upload-video', methods=['POST'])
    def upload_video():
        return upload_video_file(request.files, app.config["UPLOAD_FOLDER"])

    @app.route('/video-stream')
    def stream_uploaded_video():
        return Response(generate_uploaded_video_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

    @app.route('/video-stream-live')
    def stream_live_video():
        return Response(generate_live_video_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

    @app.route('/start-video-live', methods=['POST'])
    def start_live():
        return start_live_video_stream()

    @app.route('/start-video', methods=['POST'])
    def start_uploaded():
        return start_uploaded_video_stream()

    @app.route('/stop-video', methods=['POST'])
    def stop_uploaded():
        return stop_video_stream()

    @app.route('/stop-video-live', methods=['POST'])
    def stop_live():
        return stop_video_stream()

    @app.route('/clear-uploaded-video', methods=['POST'])
    def clear_uploaded():
        from utils.video_utils import clear_uploaded_path
        clear_uploaded_path()
        return "Uploaded video cleared", 200
