import os
import pathlib
import json

def get_file_path(filename):
    """Get the absolute path for a file relative to the current directory"""
    current_dir = pathlib.Path(__file__).parent.absolute()
    return os.path.join(current_dir, filename)

def log_message(message, prefix=""):
    """Log a message with a prefix"""
    if prefix:
        print(f"[LOG] ========{prefix}========")
        print(f"[LOG] {message}")
        print(f"[LOG] ========{prefix}========")
    else:
        print(f"[LOG] {message}")
        
def document_extraction_prompt(text):
    return f"""
        Extract events from the provided text and return them in the following JSON format. Make sure to strictly use information from the text for each field.
        This text can be from a legal document, a news article, an email thread, or any other source. 
        Do not make inferences of your own. Only extract relevant events that are explicitly mentioned in the text.
        Format the timeline as a JSON array of objects, where each object has:
        - title: The title should summarize the event's key subject or communication 
        - date: The date in YYYY-MM-DD or MM-DD or YYYY format should be extracted from the document or indicated in the communication.
        - description: The description should summarize the event's content or topic.
        - participants: The participants should list individuals or groups mentioned in the text relevant to the event.
        - location: The location should reflect where the event took place or the medium of communication. If unknown, use "Unknown".
        - context: The relevant text from the document that mentions the event. The context should contain the event date.
        
        Document text:
        {text}
        
        JSON response:
        """
        
def document_extraction_grammar():
    return json.loads('''
    {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 200
                },
                "date": {
                    "type": "string",
                    "format": "date"
                },
                "description": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 500
                },
                "participants": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 100
                    },
                    "minItems": 1
                },
                "location": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 200
                },
                "context": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 500
                }
            },
            "required": ["title", "date", "description", "participants", "documents", "location", "context"],
            "additionalProperties": false
        },
        "minItems": 1,
        "maxItems": 100
    }       
    ''')
