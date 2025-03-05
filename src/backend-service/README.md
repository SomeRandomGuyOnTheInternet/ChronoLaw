# ChronoLaw Flask Server

This is the Flask backend for the ChronoLaw application, which processes legal documents and extracts timeline events.

## Setup

1. Create a virtual environment (recommended):
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   # LLM Model Configuration
   LLM_MODEL_PATH=models/Mistral-7B-Instruct-v0.3.Q8_0.gguf
   LLM_CONTEXT_SIZE=5000
   LLM_BATCH_SIZE=512
   LLM_GPU_LAYERS=0
   LLM_ENDPOINT_PATH=http://localhost:8080/completion

   # Server Configuration
   PORT=5000
   ```

## Running the Server

Start the Flask server:
```
python app.py
```

The server will run on http://localhost:5000 by default.

## API Endpoints

- `POST /api/documents/upload` - Upload and process documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a specific document
- `GET /api/documents/timeline/events` - Get all timeline events
- `POST /api/chat` - Process a chat message using the timeline context
