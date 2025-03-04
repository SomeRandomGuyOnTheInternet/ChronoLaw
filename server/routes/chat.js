import express from 'express';
import dotenv from 'dotenv';
import data from '../models/data.js';

if (!process.env.LLM_MODEL_PATH) {
  dotenv.config();
}

const router = express.Router();

const { documents, timelineEvents } = data;

function createTimelineContext(events) {
  if (!events || events.length === 0) {
    return "No timeline events available.";
  }
  
  return events.map(event => {
    return `Date: ${event.date}
      Summary: ${event.summary}
      Document: ${event.documentName}
      Context: ${event.context}
      ---`;
  }).join('\n');
}

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'No message provided' });
    }
    
    const timelineContext = createTimelineContext(timelineEvents);
    
    const prompt = `
      [INST]
      <<SYS>>
      You are an assistant for a legal case timeline. You have access to the following timeline of events extracted from legal documents:
      
      ${timelineContext}
      
      Answer questions based on the timeline above. If the information is not in the timeline, say that you don't have that information.
      Be concise, accurate, and helpful. Cite the document names when providing information.
      <</SYS>>

      ${message}

      [/INST]
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
    
    const responseText = await response.text();
    console.log('Chat LLM response:', responseText);
    
    res.json({ response: responseText });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ message: 'Error processing chat message', error: error.message });
  }
});

export default router;
