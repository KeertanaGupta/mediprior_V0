import pandas as pd
import json
import os

# 1. Define the Conversational Intents (Small talk, greetings, etc.)
conversational_intents = [
    {"tag": "greeting",
     "patterns": ["Hi", "Hey", "Is anyone there?","Hi there", "Hello", "Hey there", "Howdy", "Hola", "Bonjour","Hay", "Sasa", "Good Evening", "Good afternoon"],
     "responses": ["Hello! I'm Mediprior's AI Companion. How are you feeling today?", "Hi there! I'm here to listen.", "Greetings. How can I support you right now?"]
    },
    {"tag": "morning",
     "patterns": ["Good morning"],
     "responses": ["Good morning. I hope you had a good night's sleep. How are you feeling today?"]
    },
    {"tag": "afternoon",
     "patterns": ["Good afternoon"],
     "responses": ["Good afternoon. How is your day going?"]
    },
    {"tag": "evening",
     "patterns": ["Good evening"],
     "responses": ["Good evening. How has your day been?"]
    },
    {"tag": "night",
     "patterns": ["Good night"],
     "responses": ["Good night. Get some proper sleep.", "Good night. Sweet dreams."]
    },
    {"tag": "goodbye",
     "patterns": ["Bye", "See you later", "Goodbye", "Au revoir", "Sayonara", "ok bye", "Bye then", "Fare thee well"],
     "responses": ["See you later.", "Have a nice day.", "Bye! Come back again.", "I'll see you soon."]
    },
    {"tag": "thanks",
     "patterns": ["Thanks", "Thank you", "That's helpful", "Thanks for the help", "Thank you very much"],
     "responses": ["Happy to help!", "Any time!", "My pleasure", "You're most welcome!"]
    },
    {"tag": "sad",
     "patterns": ["I feel sad", "I am depressed", "I feel empty", "I don't want to do anything", "I am crying", "I feel low"],
     "responses": ["I'm sorry you're feeling this way. It takes strength to acknowledge that.", "It's okay not to be okay. I'm here with you.", "Sadness is a heavy feeling. Be gentle with yourself today."]
    },
    {"tag": "anxious",
     "patterns": ["I am anxious", "I'm panicking", "I can't breathe", "My heart is racing", "I am worried", "I feel restless"],
     "responses": ["Take a deep breath with me. Inhale... Exhale...", "Anxiety is tough, but it will pass. Let's focus on the present moment.", "You are safe. Try to name 5 things you can see right now."]
    },
    {"tag": "stressed",
     "patterns": ["I am stressed", "Too much work", "I am overwhelmed", "I can't take it anymore"],
     "responses": ["It sounds like you're carrying a heavy load. Remember to take it one step at a time.", "Stress is a signal to pause. Have you taken a break today?", "You're doing your best."]
    },
    {"tag": "lonely",
     "patterns": ["I feel lonely", "No one cares", "I am alone", "I feel isolated"],
     "responses": ["Loneliness is a universal human feeling, even if it feels personal right now.", "I'm here with you. You are connected.", "Reaching out is the first step. Is there a friend you can text just to say hi?"]
    },
    {"tag": "pain",
     "patterns": ["I am in pain", "My body hurts", "I have a headache", "stomach ache", "physical pain"],
     "responses": ["I'm sorry to hear that. If it persists, please book an appointment with a doctor via the dashboard.", "Have you logged this in your Vitals tab? It helps your doctor track it.", "Rest is important when you are in pain."]
    },
    {"tag": "suicide",
     "patterns": ["I want to kill myself", "I want to die", "I am going to kill myself", "I am going to commit suicide"],
     "responses": ["I'm hearing that you're in a lot of pain right now. You are not alone. \n\n🚨 **Emergency Resources**:\n• Emergency: 911 / 112\n• Suicide Helpline: 988\n\nPlease reach out to a human immediately."]
    }
]

def generate():
    print("Generating intents.json...")
    
    # 2. Process the CSV Data
    # Make sure Mental_Health_FAQ.csv is in the same folder!
    try:
        df = pd.read_csv('Mental_Health_FAQ.csv')
        
        csv_intents = []
        for index, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row['Questions']) or pd.isna(row['Answers']):
                continue
            
            # Create an intent object for each row
            intent = {
                "tag": f"fact-{row['Question_ID']}",
                "patterns": [row['Questions']],
                "responses": [row['Answers']]
            }
            csv_intents.append(intent)
            
        print(f"Processed {len(csv_intents)} Q&A pairs from CSV.")

        # 3. Merge and Save
        all_intents = conversational_intents + csv_intents
        final_data = {"intents": all_intents}

        with open('intents.json', 'w') as f:
            json.dump(final_data, f, indent=4)

        print(f"Success! 'intents.json' created with {len(all_intents)} total intents.")
        
    except FileNotFoundError:
        print("Error: Could not find 'Mental_Health_FAQ.csv'. Please make sure it is in this folder.")

if __name__ == "__main__":
    generate()