import os
import time
import json
from datetime import datetime
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import requests
import pymupdf
import docx2txt

from models.data import data
from utils import get_file_path, log_message

documents_bp = Blueprint('documents', __name__)

UPLOAD_FOLDER = get_file_path('uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

PDF_PARSER_ENDPOINT = os.environ.get('PDF_PARSER_ENDPOINT_PATH', 'http://localhost:8503/predict')
LLM_ENDPOINT = os.environ.get('LLM_ENDPOINT_PATH', "http://localhost:8080/answer")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    filename = secure_filename(file.filename)
    document_id = str(int(time.time() * 1000))
    file_path = os.path.join(UPLOAD_FOLDER, f"{document_id}-{filename}")
    document_type = os.path.splitext(filename)[1].lower()
    file.save(file_path)
    
    return document_id, filename, document_type, file_path

def nougat_pdf_text_extraction(file_path, start_page=None, end_page=None):
    with open(file_path, 'rb') as pdf_file:
        files = {'file': pdf_file}
        
        data = {}
        if start_page is not None:
            data['start'] = start_page
        if end_page is not None:
            data['stop'] = end_page
            
        log_message(f"Sending PDF to Nougat service with params: {data}", prefix="Sending PDF")
        response = requests.post(PDF_PARSER_ENDPOINT, files=files, data=data)
        
    if response.status_code != 200:
        log_message(f"Error from nougat service: {response.text}")
        raise Exception(f"Nougat service returned status code {response.status_code}")
    
    try:
        result = response.json()
        log_message(result, prefix="Parsed PDF")
        if isinstance(result, dict) and 'text' in result:
            text = result['text']
        else:
            text = str(result)
    except ValueError:
        text = response.text
    
    log_message(f"Extracted text length: {len(text)}")
    return text

def fallback_pdf_text_extraction(file_path):
    reader = pymupdf.open(file_path)
    text = ""
    for page in reader:
        text += page.get_text() + "\n"
    log_message(text, prefix="pymupdf")
    return text

def extract_text_from_pdf(file_path):
    try:
        return nougat_pdf_text_extraction(file_path)
    except Exception as e:
        log_message(f"Error extracting text from PDF: {e}")
        try:
            log_message("Falling back to PyPDF2 for text extraction")
            return fallback_pdf_text_extraction(file_path)
        except Exception as fallback_error:
            log_message(f"Fallback extraction also failed: {fallback_error}")
            raise e

def extract_text_from_docx(file_path):
    try:
        text = docx2txt.process(file_path)
        return text
    except Exception as e:
        log_message(f"Error extracting text from DOCX: {e}")
        raise e

def extract_events_from_text(text, document_id, document_name):
    try:
        prompt = f"""
        Extract all events that would be pertinent to a court case mentioned in the following document along with the dates in which they occured. Every event you select must have a date associated with it according to the text.
        Format your response as a JSON array of objects, where each object has:
        - date: The date in YYYY-MM-DD or MM-DD or YYYY format depending on the dates mentioned in the document. If the event occurs over a range of time, this would be the start date.
        - end_date: If the event occurs over a range of time, enter the end date of the event in YYYY-MM-DD or MM-DD or YYYY format depending on the dates mentioned in the document.
        - summary: A concise summary of the event.
        - context: The relevant text from the document that mentions the event. If the text is split across multiple sentences, add the following characters: [...]. The context should always contain the event date.
        
        Document text:
        {text}
        
        JSON response:
        """

        response = requests.post(
            LLM_ENDPOINT,
            headers={'Content-Type': 'application/json'},
            json={
                "prompt": prompt,
                "n_predict": int(5000)
            }
        )

        events = []
        try:
            response_text = response.text
            log_message(f'LLM response: {response_text}')
            
            response_json = json.loads(response_text)
            events = json.loads(response_json['content'])
            events = [
                {**event, "documentId": document_id, "documentName": document_name}
                for event in events
            ]
        except Exception as e:
            log_message(f'Error parsing LLM response: {e}')
            log_message(f'Raw response: {response.text}')
        
        return events
    except Exception as e:
        log_message(f'Error extracting events: {e}')
        return []

@documents_bp.route('/upload', methods=['POST'])
def upload_documents():
    try:
        if 'documents' not in request.files:
            return jsonify({"message": "No files uploaded"}), 400
        
        files = request.files.getlist('documents')
        if not files or len(files) == 0:
            return jsonify({"message": "No files uploaded"}), 400

        uploaded_documents = []
        new_events = []

        for file in files:
            if file and allowed_file(file.filename):
                document_id, filename, document_type, file_path = save_file(file)
                
                text = ""
                if document_type == '.pdf':
                    text = extract_text_from_pdf(file_path)
                    return jsonify({"message": "There was no text in one of the files that was uploaded"}), 400
                elif document_type == '.docx':
                    text = extract_text_from_docx(file_path)
                
                if not text:
                    return jsonify({"message": "There was no text in one of the files that was uploaded"}), 400
                
                document = {
                    "id": document_id,
                    "name": filename,
                    "path": file_path,
                    "type": document_type,
                    "uploadDate": datetime.now().isoformat(),
                    "text": text
                }
                
                data.documents.append(document)
                uploaded_documents.append(document)
                
                events = extract_events_from_text(text, document_id, filename)
                new_events.extend(events)
        
        data.timeline_events.extend(new_events)
        data.timeline_events.sort(key=lambda x: x.get('date', ''))
        
        return jsonify({
            "message": "Documents uploaded and processed successfully",
            "documents": uploaded_documents,
            "events": new_events
        }), 200
    
    except Exception as e:
        log_message(f"Error processing documents: {e}")
        return jsonify({"message": "Error processing documents", "error": str(e)}), 500

@documents_bp.route('/', methods=['GET'])
def get_documents():
    return jsonify(data.documents)

@documents_bp.route('/<document_id>', methods=['GET'])
def get_document(document_id):
    document = next((doc for doc in data.documents if doc['id'] == document_id), None)
    if not document:
        return jsonify({"message": "Document not found"}), 404
    return jsonify(document)

@documents_bp.route('/timeline/events', methods=['GET'])
def get_timeline_events():
    return jsonify(data.timeline_events)
