# ChronoLaw

ChronoLaw is a web application that creates case timelines based on documents uploaded to it. The application analyzes documents using a locally hosted LLM to extract dates and relevant information, then displays them in a chronological timeline. Users can also chat with the timeline to ask questions about the documents and their dates.

## Features

- Drag and drop document upload (PDF and DOCX)
- Automatic extraction of dates and related information from documents
- Interactive timeline display with filtering and sorting options
- Chat interface to ask questions about the timeline and documents
- Fully local processing with no external API calls

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chronolaw
   ```

2. Run the setup script to install all dependencies:
   ```
   npm run setup
   ```

   This script will:
   - Install server dependencies
   - Install client dependencies
   - Create necessary directories
   - Check if the LLM model is available

3. Download a LLaMA model:
   
   You need to download a LLaMA model in GGUF format to use with the application. We recommend using Mistral-7B-Instruct-v0.3.Q8_0.gguf for a good balance of performance and accuracy.
   
   a. Download the model from [Hugging Face](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.3.Q8_0-GGUF/tree/main) or another source.
   
   b. Place the downloaded model file in the `models` directory:
      ```
      mv /path/to/downloaded/Mistral-7B-Instruct-v0.3.Q8_0.gguf ./models/
      ```
   
   c. The setup script creates a `.env` file with default settings. You can customize the model path and other settings by editing this file.

## Environment Variables

ChronoLaw uses environment variables for configuration. These are stored in a `.env` file in the project root. The setup script will create this file automatically from `.env.example` if it doesn't exist.

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_MODEL_PATH` | Path to the LLM model file (relative to project root) | `models/llama-2-7b-chat.gguf` |
| `LLM_CONTEXT_SIZE` | Context size for the LLM | `2048` |
| `LLM_BATCH_SIZE` | Batch size for the LLM | `512` |
| `LLM_GPU_LAYERS` | Number of layers to offload to GPU (0 for CPU only) | `0` |
| `PORT` | Port for the server to listen on | `5000` |

You can edit these variables to customize the application to your needs. For example, if you want to use a different model, you can change the `LLM_MODEL_PATH` variable.

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

   This will start both the backend server and the React frontend.

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Upload Documents**:
   - Drag and drop PDF or DOCX files into the upload area
   - Click "Process Documents" to analyze the files

2. **View Timeline**:
   - After processing, the application will display a timeline of events extracted from the documents
   - Use the search, sort, and filter options to navigate the timeline

3. **Chat with Timeline**:
   - Switch to the Chat tab to ask questions about the timeline
   - The AI will respond based on the information extracted from your documents

## Technical Details

- **Frontend**: React with Chakra UI
- **Backend**: Node.js with Express
- **Document Processing**: pdf-parse and docx-parser
- **LLM Integration**: node-llama-cpp for local LLM inference
- **File Upload**: multer for handling multipart/form-data

## Limitations

- The quality of date extraction depends on the clarity of dates in the documents
- Processing large documents may take several minutes depending on your hardware
- The LLM requires sufficient RAM to run efficiently (at least 8GB recommended)

## License

[MIT License](LICENSE)
