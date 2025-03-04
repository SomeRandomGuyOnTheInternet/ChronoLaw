import os
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

from models.data import data

if not os.environ.get('LLM_MODEL_PATH'):
    load_dotenv()

chat_bp = Blueprint('chat', __name__)

def create_timeline_context(events):
    if not events or len(events) == 0:
        return "No timeline events available."
    
    return "\n".join([
        f"""Date: {event.get('date', '')}
      Summary: {event.get('summary', '')}
      Document: {event.get('documentName', '')}
      Context: {event.get('context', '')}
      ---"""
        for event in events
    ])

@chat_bp.route('/', methods=['POST'])
def process_chat():
    try:
        request_data = request.get_json()
        message = request_data.get('message')
        
        if not message:
            return jsonify({"message": "No message provided"}), 400
        
        timeline_context = create_timeline_context(data.timeline_events)
        
        prompt = f"""
        [INST]
        <<SYS>>
        You are an assistant for a legal case timeline. You have access to the following timeline of events extracted from legal documents:
        
        {timeline_context}
        
        Answer questions based on the timeline above. If the information is not in the timeline, say that you don't have that information.
        Be concise, accurate, and helpful. Cite the document names when providing information.
        <</SYS>>

        {message}

        [/INST]
        """
        
        llm_endpoint = os.environ.get('LLM_ENDPOINT_PATH')
        response = requests.post(
            llm_endpoint,
            headers={'Content-Type': 'application/json'},
            json={
                "prompt": prompt,
                "n_predict": int(os.environ.get('LLM_CONTEXT_SIZE', '2048'))
            }
        )
        
        response_text = response.text
        print(f'Chat LLM response: {response_text}')
        
        return jsonify({"response": response_text})
    
    except Exception as e:
        print(f'Error processing chat message: {e}')
        return jsonify({"message": "Error processing chat message", "error": str(e)}), 500
