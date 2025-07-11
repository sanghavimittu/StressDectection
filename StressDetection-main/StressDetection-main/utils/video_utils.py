import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
MODEL_DIR = os.path.join("models")
labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
face_cascade = cv2.CascadeClassifier(os.path.join(MODEL_DIR, "haarcascade_frontalface_default.xml"))
video_model = load_model(os.path.join(MODEL_DIR, "model.h5"))
cap = None
is_streaming = False
uploaded_video_path = None

def preprocess_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)
    processed, boxes = [], []
    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = face.astype("float") / 255.0
        face = img_to_array(face)
        face = np.expand_dims(face, axis=0)
        processed.append(face)
        boxes.append((x, y, w, h))
    return processed, boxes

def generate_frames_from(cap_obj):
    global is_streaming
    while is_streaming:
        ret, frame = cap_obj.read()
        if not ret:
            break
        faces, boxes = preprocess_frame(frame)
        for face, box in zip(faces, boxes):
            pred = video_model.predict(face)[0]
            label = labels[np.argmax(pred)]
            x, y, w, h = box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, label, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

def upload_video_file(files, upload_folder):
    global uploaded_video_path, is_streaming
    file = files.get('file')
    if not file:
        return "No file uploaded", 400
    path = os.path.join(upload_folder, file.filename)
    file.save(path)
    uploaded_video_path = path
    is_streaming = True
    return "Video uploaded", 200

def generate_uploaded_video_stream():
    global cap, uploaded_video_path
    if uploaded_video_path:
        cap = cv2.VideoCapture(uploaded_video_path)
        return generate_frames_from(cap)

def generate_live_video_stream():
    global cap
    cap = cv2.VideoCapture(0)
    return generate_frames_from(cap)

def start_uploaded_video_stream():
    global is_streaming
    is_streaming = True
    return "Uploaded video started", 200

def start_live_video_stream():
    global is_streaming
    is_streaming = True
    return "Live video started", 200

def stop_video_stream():
    global is_streaming, cap
    is_streaming = False
    if cap:
        cap.release()
    return "Video stopped", 200

def clear_uploaded_path():
    global uploaded_video_path
    uploaded_video_path = None

