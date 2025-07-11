import librosa
import numpy as np
import tensorflow as tf
from flask import jsonify

emotion_model = tf.keras.models.load_model('utils/model_clstm.h5')

emotion_labels = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']

def handle_audio_upload(files):
    if 'audio' not in files:
        return jsonify({"error": "No audio file found in the request"}), 400

    audio_file = files['audio']
    audio_path = 'uploaded_audio.wav'
    audio_file.save(audio_path)

    try:
        mfcc_input = process_audio(audio_path)

        # Predict
        predictions = emotion_model.predict(mfcc_input)
        predicted_index = np.argmax(predictions)

        if predicted_index >= len(emotion_labels):
            predicted_index = 0  # fallback to 'neutral'

        predicted_emotion = emotion_labels[predicted_index]

        return jsonify({"predicted_emotion": predicted_emotion}), 200

    except Exception as e:
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500


def process_audio(file_path):
    try:
       
        y, sr = librosa.load(file_path, sr=None)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=15)
        mfcc = mfcc.T 
        max_len = 352
        if mfcc.shape[0] < max_len:
            pad_width = max_len - mfcc.shape[0]
            mfcc_padded = np.pad(mfcc, ((0, pad_width), (0, 0)), mode='constant')
        else:
            mfcc_padded = mfcc[:max_len, :]
        mfcc_input = np.expand_dims(mfcc_padded, axis=0)
        return mfcc_input

    except Exception as e:
        raise ValueError(f"Audio processing error: {str(e)}")


        