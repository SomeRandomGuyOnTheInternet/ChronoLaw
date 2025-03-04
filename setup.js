import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}ChronoLaw Setup${colors.reset}`);
console.log(`${colors.cyan}==============${colors.reset}\n`);

// Function to execute commands and handle errors
function runCommand(command, errorMessage) {
  try {
    console.log(`${colors.yellow}> ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}${errorMessage}${colors.reset}`);
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`${colors.yellow}Creating uploads directory...${colors.reset}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Install server dependencies
console.log(`\n${colors.bright}Installing server dependencies...${colors.reset}`);
if (!runCommand('npm install', 'Failed to install server dependencies.')) {
  process.exit(1);
}

// Install client dependencies
console.log(`\n${colors.bright}Installing client dependencies...${colors.reset}`);
if (!runCommand('cd client && npm install', 'Failed to install client dependencies.')) {
  process.exit(1);
}

// Check for .env file and create it if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log(`\n${colors.yellow}Creating .env file from .env.example...${colors.reset}`);
  fs.copyFileSync(envExamplePath, envPath);
  console.log(`${colors.green}Created .env file. You may want to edit it to customize your settings.${colors.reset}`);
}

if (!fs.existsSync(modelPath)) {
  console.log(`\n${colors.yellow}LLM model not found at: ${modelPath}${colors.reset}`);
  console.log(`${colors.yellow}You will need to download a LLaMA model in GGUF format.${colors.reset}`);
  console.log(`${colors.yellow}See models/README.md for instructions.${colors.reset}`);
  console.log(`${colors.yellow}You can also change the model path in the .env file.${colors.reset}`);
}

console.log(`\n${colors.green}${colors.bright}Setup completed successfully!${colors.reset}`);
console.log(`\nTo start the application, run: ${colors.cyan}npm run dev${colors.reset}`);
