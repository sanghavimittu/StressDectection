import os
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

MODEL_PATH = os.path.join("models", "emotion-model")

model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer, top_k=1)

def predict_text_emotion(data):
    text = data.get('text')
    if not text:
        return {"error": "No text provided"}, 400
    result = classifier(text)
    return {"result": result[0]}, 200
