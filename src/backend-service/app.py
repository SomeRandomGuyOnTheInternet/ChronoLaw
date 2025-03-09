import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import pathlib

load_dotenv(override=True)

current_dir = pathlib.Path(__file__).parent.absolute()
uploads_dir = current_dir / 'uploads'
uploads_dir.mkdir(exist_ok=True)

app = Flask(__name__, static_folder='../client/build')
CORS(app)

from routes.documents import documents_bp
from routes.chat import chat_bp

app.register_blueprint(documents_bp, url_prefix='/api/documents')
app.register_blueprint(chat_bp, url_prefix='/api/chat')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
