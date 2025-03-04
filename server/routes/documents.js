import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import docxParser from 'docx-parser';
import dotenv from 'dotenv';
import { __dirname } from '../utils.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, './uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

import data from '../models/data.js';
const { documents, timelineEvents } = data;

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

async function extractTextFromDOCX(filePath) {
  return new Promise((resolve, reject) => {
    docxParser.parseDocx(filePath, (error, text) => {
      if (error) {
        console.error('Error extracting text from DOCX:', error);
        reject(error);
      } else {
        resolve(text);
      }
    });
  });
}

async function extractDatesAndInfo(text, documentId, documentName) {
  try {
    const prompt = `
    Extract all dates mentioned in the following document along with relevant information about what happened on those dates. 
    Format your response as a JSON array of objects, where each object has:
    - date: The date in YYYY-MM-DD format
    - summary: A concise summary of what happened on that date
    - context: The relevant text from the document that mentions this date
    
    Document text:
    ${text}
    
    JSON response:
    `;

    const response = await fetch(process.env.LLM_ENDPOINT_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "prompt": prompt,
        "n_predict": parseInt(process.env.LLM_CONTEXT_SIZE || '2048')
      }),
    });

    let events = [];
    try {
      const responseText = await response.text();
      console.log('LLM response:', responseText);
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);

        events = events.map(event => ({
          ...event,
          documentId,
          documentName
        }));
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      console.log('Raw response:', response);
    }

    return events;
  } catch (error) {
    console.error('Error extracting dates and info:', error);
    return [];
  }
}

// TODO: Create batch of documents with errors to show the user later
router.post('/upload', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedDocuments = [];
    const newEvents = [];

    for (const file of req.files) {
      const documentId = Date.now().toString();
      const documentPath = file.path;
      const documentName = file.originalname;
      const documentType = path.extname(file.originalname).toLowerCase();

      let text = '';
      if (documentType === '.pdf') {
        text = await extractTextFromPDF(documentPath);
      } else if (documentType === '.docx') {
        text = await extractTextFromDOCX(documentPath);
      }

      if (text == '') {
        return res.status(400).json({ message: 'There was no text in one of the files that was uploaded' });
      }

      const document = {
        id: documentId,
        name: documentName,
        path: documentPath,
        type: documentType,
        uploadDate: new Date().toISOString(),
        text
      };

      documents.push(document);
      uploadedDocuments.push(document);

      const events = await extractDatesAndInfo(text, documentId, documentName);
      newEvents.push(...events);
    }

    timelineEvents.push(...newEvents);
    timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      message: 'Documents uploaded and processed successfully',
      documents: uploadedDocuments,
      events: newEvents
    });
  } catch (error) {
    console.error('Error processing documents:', error);
    res.status(500).json({ message: 'Error processing documents', error: error.message });
  }
});

router.get('/', (req, res) => {
  res.json(documents);
});

router.get('/:id', (req, res) => {
  const document = documents.find(doc => doc.id === req.params.id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  res.json(document);
});


router.get('/timeline/events', (req, res) => {
  res.json(timelineEvents);
});

export default router;
