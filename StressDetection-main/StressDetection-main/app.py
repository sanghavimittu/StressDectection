# # ===========================
# # COMMON IMPORTS (used for all)
# # ===========================
# # (No need to split here yet, these are general libraries)
# import os
# import cv2
# import numpy as np
# import librosa
# import torch
# import shutil
# from flask import Flask, request, render_template, Response, jsonify
# from tensorflow.keras.models import load_model
# from tensorflow.keras.preprocessing.image import img_to_array
# from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification
# from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

# # ===========================
# # TEXT MODEL (Text Emotion Classification)
# # ===========================
# model = AutoModelForSequenceClassification.from_pretrained("./emotion-model")
# tokenizer = AutoTokenizer.from_pretrained("./emotion-model")
# classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=1)

# # ===========================
# # FLASK APP SETUP
# # ===========================
# app = Flask(__name__)

# # ===========================
# # VIDEO MODEL (Video Emotion Recognition)
# # ===========================
# video_model = load_model("model.h5")  # Load trained model for face/emotion detection from video

# # ===========================
# # AUDIO MODEL (Audio Emotion Recognition)
# # ===========================
# audio_processor = Wav2Vec2Processor.from_pretrained('./saved_model')
# audio_model = Wav2Vec2ForSequenceClassification.from_pretrained('./saved_model')
# audio_model.eval()

# # ===========================
# # LABELS
# # ===========================
# labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']  # For video (face)
# audio_labels = ["sad", "fear", "disgust", "happy", "pleasant_surprise", "anger", "neutral"]  # For audio

# # ===========================
# # FACE DETECTOR (Video)
# # ===========================
# face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

# # ===========================
# # UPLOAD CONFIG (Common for Audio/Video Uploads)
# # ===========================
# UPLOAD_FOLDER = "uploads"
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# # ===========================
# # GLOBAL VARIABLES (Common)
# # ===========================
# cap = None
# is_streaming = False
# uploaded_video_path = None

# # ===========================
# # VIDEO PROCESSING FUNCTIONS
# # ===========================
# def preprocess_frame(image):
#     """ Preprocess frame: grayscale, detect face, resize for model input """
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
#     processed_faces = []
#     face_boxes = []
#     for (x, y, w, h) in faces:
#         face = gray[y:y+h, x:x+w]
#         face = cv2.resize(face, (48, 48))
#         face = face.astype("float") / 255.0
#         face = img_to_array(face)
#         face = np.expand_dims(face, axis=0)
#         processed_faces.append(face)
#         face_boxes.append((x, y, w, h))
#     return processed_faces, face_boxes






# # ===========================
# # FLASK ROUTES - FRONTEND & STREAMING VIDEO
# # ===========================

# @app.route('/')
# def index():
#     """ Frontend page """
#     return render_template("index.html")

# # ----------- Video Stream for Uploaded Video ------------
# def generate_frames(video_path=None):
#     """ Generate video frames with face emotion prediction for uploaded video """
#     global cap, is_streaming
#     cap = cv2.VideoCapture(video_path) if video_path else None
    
#     while is_streaming:
#         ret, frame = cap.read()
#         if not ret:
#             break
        
#         faces, boxes = preprocess_frame(frame)
#         for face, box in zip(faces, boxes):
#             pred = video_model.predict(face)[0]
#             emotion = labels[np.argmax(pred)]
#             (x, y, w, h) = box
#             cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
#             cv2.putText(frame, emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
#         _, buffer = cv2.imencode('.jpg', frame)
#         yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

# # ----------- Video Stream for Live Camera ------------
# def generate_live_stream_frames():
#     """ Generate live webcam frames with face emotion prediction """
#     global cap
#     cap = cv2.VideoCapture(0)  # Webcam

#     while is_streaming:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         faces, boxes = preprocess_frame(frame)
#         for face, box in zip(faces, boxes):
#             pred = video_model.predict(face)[0]
#             emotion = labels[np.argmax(pred)]
#             (x, y, w, h) = box
#             cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
#             cv2.putText(frame, emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        
#         _, buffer = cv2.imencode('.jpg', frame)
#         yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

# # ----------- Routes for Video Upload, Start, Stop ----------
# @app.route('/upload-video', methods=['POST'])
# def upload_video():
#     """ Upload a video for emotion detection """
#     global uploaded_video_path, is_streaming
#     file = request.files.get('file')
#     if not file or file.filename == '':
#         return "No file selected", 400
    
#     file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
#     file.save(file_path)
#     uploaded_video_path = file_path
#     is_streaming = True
#     return "Video uploaded successfully", 200

# @app.route('/start-video', methods=['POST'])
# def start_video():
#     """ Start video emotion analysis (uploaded video) """
#     global is_streaming
#     if not is_streaming:
#         is_streaming = True

#     if not uploaded_video_path:
#         is_streaming = True
#         return Response(generate_live_stream_frames(), mimetype='multipart/x-mixed-replace;boundary=frame')

#     return jsonify({"error": "Invalid video source"}), 400

# @app.route('/video-stream')
# def video_stream():
#     """ Stream uploaded video with emotion detection """
#     if uploaded_video_path:
#         return Response(generate_frames(uploaded_video_path), mimetype='multipart/x-mixed-replace;boundary=frame')
#     return "No video uploaded", 400

# @app.route('/video-stream-live')
# def video_stream_live():
#     """ Stream webcam video """
#     if not uploaded_video_path:
#         return Response(generate_live_stream_frames(), mimetype='multipart/x-mixed-replace;boundary=frame')
#     return "No video uploaded", 400

# @app.route('/start-video-live', methods=['POST'])
# def start_video_live():
#     """ Start webcam video """
#     global is_streaming
#     is_streaming = True
#     return 'Live Video started', 200

# @app.route('/stop-video', methods=['POST'])
# def stop_video():
#     """ Stop uploaded video streaming """
#     global is_streaming, cap
#     if is_streaming:
#         is_streaming = False
#         if cap:
#             cap.release()
#             cap = None
#         return "Video stream stopped", 200
#     return "No video stream running", 400

# @app.route('/stop-video-live', methods=['POST'])
# def stop_video_live():
#     """ Stop webcam streaming """
#     global is_streaming, cap
#     if is_streaming:
#         is_streaming = False
#         if cap:
#             cap.release()
#             cap = None
#         return "Video stream stopped", 200
#     return "No video stream running", 400

# @app.route('/clear-uploaded-video', methods=['POST'])
# def clear_uploaded_video():
#     """ Clear uploaded video path """
#     global uploaded_video_path
#     uploaded_video_path = None
#     return "Uploaded video cleared", 200

# # ===========================
# # AUDIO PROCESSING FUNCTIONS
# # ===========================
# def preprocess_audio(audio_path):
#     """ Preprocess audio for Wav2Vec2 model input """
#     speech, _ = librosa.load(audio_path, sr=16000)
#     speech = np.pad(speech, (0, max(32000 - len(speech), 0)), 'constant')[:32000]
#     return audio_processor(speech, sampling_rate=16000, return_tensors="pt", padding=True).input_values

# def predict_emotion(audio_path):
#     """ Predict emotion from audio file """
#     input_values = preprocess_audio(audio_path).to(audio_model.device)
#     with torch.no_grad():
#         logits = audio_model(input_values).logits
#     return audio_labels[torch.argmax(logits, dim=1).item()]

# # ----------- Routes for Audio Upload and Prediction ----------
# @app.route('/upload-audio', methods=['POST'])
# def upload_audio():
#     """ Upload audio and predict emotion """
#     audio_file = request.files.get('audio')
#     if not audio_file:
#         return jsonify({"error": "No audio file found."}), 400
    
#     file_path = os.path.join(app.config["UPLOAD_FOLDER"], 'uploaded_audio.wav')
#     audio_file.save(file_path)
#     predicted_emotion = predict_emotion(file_path)
#     return jsonify({"predicted_emotion": predicted_emotion}), 200

# # ===========================
# # TEXT PROCESSING ROUTE
# # ===========================
# @app.route('/predict-text-emotion', methods=['POST'])
# def predict_text_emotion():
#     """ Predict emotion from text """
#     data = request.get_json() 
#     text = data.get('text')

#     if not text:
#         return jsonify({'error': 'No text provided'}), 400

#     result = classifier(text)
    
#     return jsonify({'result': result})

# # ===========================
# # MAIN
# # ===========================
# if __name__ == '__main__':
#     app.run(debug=True)





























































from flask import Flask
from utils.utils import register_routes

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "uploads"

register_routes(app)

if __name__ == '__main__':
    app.run(debug=True)
