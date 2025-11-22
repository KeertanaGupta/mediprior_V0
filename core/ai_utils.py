# core/ai_utils.py
import json
import os
import random
import numpy as np
from django.conf import settings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- 1. SAFETY FIRST: Hardcoded Crisis Logic ---
# AI models can make mistakes. Safety triggers MUST be hardcoded regex.
CRISIS_KEYWORDS = [
    "die", "kill myself", "suicide", "hurt myself", "end it all", 
    "disappear", "can't handle this", "hopeless"
]

CRISIS_RESPONSE = (
    "I'm hearing that you're in a lot of pain right now. You are not alone. \n\n"
    "🚨 **Emergency Resources**:\n"
    "• Emergency: 911 / 112\n"
    "• Suicide Helpline: 988\n\n"
    "Please reach out to a human immediately. You are safe here, but I am just a bot."
)

# --- 2. Quick Coping Tools ---
COPING_TOOLS = {
    "breathing": (
        "🌬️ **Box Breathing**:\n"
        "1. Inhale (4s)\n2. Hold (4s)\n3. Exhale (4s)\n4. Hold (4s)\n"
        "Repeat this 3 times. Focus only on the count."
    ),
    "grounding": (
        "🌍 **5-4-3-2-1 Technique**:\n"
        "Look around and name:\n"
        "• 5 things you see\n• 4 you touch\n• 3 you hear\n• 2 you smell\n• 1 you taste"
    ),
    "affirmation": (
        "✨ **Affirmation**:\n"
        "Repeat aloud: 'I am doing my best. This feeling is temporary. I am capable.'"
    )
}

# --- 3. Machine Learning Initialization ---
def load_and_train_model():
    """
    Loads the intents.json and trains a simple TF-IDF Vectorizer.
    This runs once when the server starts.
    """
    json_path = os.path.join(settings.BASE_DIR, 'core', 'intents.json')
    try:
        with open(json_path, 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print("ERROR: intents.json not found!")
        return None, None, None

    corpus = []
    tags = []
    
    # Flatten the data for training
    for intent in data['intents']:
        for pattern in intent['patterns']:
            corpus.append(pattern)
            tags.append(intent['tag'])
            
    # Train the vectorizer
    vectorizer = TfidfVectorizer().fit(corpus)
    return data, vectorizer, tags

# Initialize global model variables
INTENT_DATA, VECTORIZER, TAGS = load_and_train_model()

def get_ai_response(user_input):
    if not VECTORIZER:
        return "System Error: AI Brain not loaded."

    # Convert user text to numbers
    user_vec = VECTORIZER.transform([user_input])
    
    # Compare user text with all patterns in our "brain"
    # (We re-transform the original corpus here for simplicity in this scale)
    corpus_vectors = VECTORIZER.transform([p for intent in INTENT_DATA['intents'] for p in intent['patterns']])
    similarities = cosine_similarity(user_vec, corpus_vectors)
    
    # Find the best match
    best_match_index = np.argmax(similarities)
    confidence = similarities[0][best_match_index]

    # Threshold: If confidence is too low (< 0.3), the bot is confused
    if confidence < 0.3:
        return None

    # Get the tag associated with the best match
    matched_tag = TAGS[best_match_index]
    
    # Return a random response from that tag
    for intent in INTENT_DATA['intents']:
        if intent['tag'] == matched_tag:
            return {
                "response": random.choice(intent['responses']),
                "tag": matched_tag
            }
    return None

def analyze_message(text):
    text_lower = text.lower()

    # 1. Crisis Check (Priority #1)
    for keyword in CRISIS_KEYWORDS:
        if keyword in text_lower:
            return {
                "response": CRISIS_RESPONSE,
                "mood_score": 1,
                "emotion": "Crisis",
                "action": "CRISIS"
            }

    # 2. AI Response (Priority #2)
    ai_result = get_ai_response(text)
    
    if ai_result:
        # Map tags to emotions for the UI
        emotion = "Neutral"
        mood_score = 5
        if ai_result['tag'] in ['sad', 'lonely', 'pain']: 
            emotion = "Low/Sad"
            mood_score = 3
        elif ai_result['tag'] in ['anxious', 'stressed']: 
            emotion = "Anxious"
            mood_score = 4
        elif ai_result['tag'] in ['greeting', 'thanks']: 
            emotion = "Good"
            mood_score = 8

        return {
            "response": ai_result['response'],
            "mood_score": mood_score,
            "emotion": emotion,
            "action": "REPLY"
        }

    # 3. Fallback (If AI is confused)
    return {
        "response": "I'm listening. Could you tell me a bit more about that? I want to understand better.",
        "mood_score": 5,
        "emotion": "Neutral",
        "action": "REPLY"
    }