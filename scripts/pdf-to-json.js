/**
 * PDF to JSON Converter Script
 * 
 * This script attempts to extract MCQ questions from a PDF file
 * and convert them to JSON format.
 * 
 * Usage: node scripts/pdf-to-json.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to import pdf-parse
let pdfParse;
try {
  pdfParse = (await import('pdf-parse')).default;
} catch (error) {
  console.error('pdf-parse module not found. Please install it:');
  console.error('npm install pdf-parse');
  process.exit(1);
}

const PDF_PATH = path.join(__dirname, '..', 'GE_MCQ_UNIT_1,2.pdf');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'questions.json');

/**
 * Parse PDF and extract questions
 */
async function convertPdfToJson() {
  try {
    console.log('Reading PDF file...');
    const dataBuffer = fs.readFileSync(PDF_PATH);

    console.log('Parsing PDF content...');
    const data = await pdfParse(dataBuffer);

    console.log('Extracted text length:', data.text.length);
    console.log('\n--- First 500 characters ---');
    console.log(data.text.substring(0, 500));
    console.log('\n--- End of preview ---\n');

    // Save raw text for manual processing
    const rawTextPath = path.join(__dirname, '..', 'pdf-raw-text.txt');
    fs.writeFileSync(rawTextPath, data.text);
    console.log(`Raw text saved to: ${rawTextPath}`);

    console.log('\n⚠️  MANUAL CONVERSION REQUIRED ⚠️');
    console.log('Due to complex PDF formatting, automatic extraction may not work perfectly.');
    console.log('Please follow these steps:');
    console.log('1. Review the raw text in pdf-raw-text.txt');
    console.log('2. Manually format questions into the JSON structure');
    console.log('3. Save the result as public/questions.json');
    console.log('\nSee public/questions.json for the required format.');

    // Attempt basic parsing (this is a simple example and may need adjustment)
    const questions = attemptAutoParse(data.text);

    if (questions.length > 0) {
      console.log(`\nFound ${questions.length} potential questions.`);
      console.log('Saving to:', OUTPUT_PATH);

      // Ensure public directory exists
      const publicDir = path.join(__dirname, '..', 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(questions, null, 2));
      console.log('✓ Conversion complete!');
    } else {
      console.log('\nAutomatic parsing failed. Please convert manually.');
    }
  } catch (error) {
    console.error('Error converting PDF:', error);
    console.log('\n📝 Please convert the PDF manually using the template in public/questions.json');
  }
}

/**
 * Attempt to automatically parse questions from text
 * This is a basic implementation and may need customization based on PDF format
 */
function attemptAutoParse(text) {
  const questions = [];
  
  // This is a placeholder - you'll need to adjust the regex based on your PDF format
  // Common patterns:
  // 1. Question text
  // a) Option A
  // b) Option B
  // c) Option C
  // d) Option D
  // Answer: a
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Try to detect question patterns
  // This is highly dependent on PDF structure
  let currentQuestion = null;
  let questionId = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect question (customize this regex based on your PDF)
    if (/^\d+[\.\)]\s+/.test(line) || /^Q\d+/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length === 4) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        id: questionId++,
        question: line.replace(/^\d+[\.\)]\s+/, '').replace(/^Q\d+[\.\:\s]*/i, ''),
        options: [],
        answerIndex: 0 // Default, needs manual verification
      };
    }
    // Detect options (customize based on your PDF)
    else if (currentQuestion && /^[a-d][\.\)]/i.test(line)) {
      const option = line.replace(/^[a-d][\.\)]\s*/i, '');
      currentQuestion.options.push(option);
    }
  }
  
  // Add last question
  if (currentQuestion && currentQuestion.options.length === 4) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Run the conversion
convertPdfToJson();
