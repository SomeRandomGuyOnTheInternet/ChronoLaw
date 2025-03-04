import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example utility functions
const getFilePath = (fileName) => path.join(__dirname, fileName);

const logMessage = (message) => {
    console.log(`[LOG] ${message}`);
};

// Export multiple utilities
export { __dirname, getFilePath, logMessage };