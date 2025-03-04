import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path
import hashlib

from faster_nougat.utils import get_model_and_processor, extract_pdf_pages_as_images
from faster_nougat import generate

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
SAVE_DIR = Path("./pdfs")
NOUGAT_MODEL_NAME = "facebook/nougat-small"
RESOLUTION = 200

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SAVE_DIR, exist_ok=True)

# Global variables for model and processor
model = None
processor = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_model():
    global model, processor
    if model is None or processor is None:
        model, processor = get_model_and_processor(NOUGAT_MODEL_NAME)


@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Faster Nougat Service is running"
    })


@app.route('/parse', methods=['POST'])
def parse():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({
            "status": "error",
            "message": "No file part in the request"
        }), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({
            "status": "error",
            "message": "No file selected"
        }), 400
    
    if file and allowed_file(file.filename):
        # Get optional parameters
        start_page = request.form.get('start_page', type=int)
        end_page = request.form.get('end_page', type=int)
        
        # Save the file
        filename = secure_filename(file.filename)
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(pdf_path)
        
        # Calculate MD5 hash for caching
        with open(pdf_path, 'rb') as f:
            pdfbin = f.read()
            md5 = hashlib.md5(pdfbin).hexdigest()
        
        save_path = SAVE_DIR / md5
        save_path.mkdir(parents=True, exist_ok=True)
        
        # Load model if not loaded
        load_model()
        
        # Extract images from PDF
        images = extract_pdf_pages_as_images(pdf_path, resolution=RESOLUTION)
        
        # Determine which pages to process
        if start_page is not None and end_page is not None:
            pages = list(range(start_page - 1, min(end_page, len(images))))
        else:
            pages = list(range(len(images)))
        
        # Process each page
        results = []
        for page_idx in pages:
            # Check if we already have this page processed
            page_path = save_path / f"page_{page_idx + 1}.mmd"
            if page_path.exists():
                with open(page_path, 'r') as f:
                    results.append(f.read())
                continue
            
            # Process the page
            image = images[page_idx]
            pixel_values = processor(image, return_tensors="pt").pixel_values
            outputs = generate(model, pixel_values, max_new_tokens=4096, disable_tqdm=True)
            sequence = processor.batch_decode([outputs], skip_special_tokens=True)[0]
            sequence = processor.post_process_generation(sequence, fix_markdown=False)
            
            # Save the result
            with open(page_path, "w") as f:
                f.write(sequence)
            
            results.append(sequence)
        
        # Combine all results
        final_text = "\n\n".join(results)
        
        # Save the combined result
        with open(save_path / "doc.mmd", "w") as f:
            f.write(final_text)
        
        return jsonify({
            "status": "success",
            "text": final_text,
            "pages_processed": len(results)
        })
    
    return jsonify({
        "status": "error",
        "message": "File type not allowed"
    }), 400


if __name__ == "__main__":
    # Load model at startup
    load_model()
    app.run(host='0.0.0.0', port=5003, debug=False)
