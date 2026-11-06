import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * Extracts plain text from uploaded files (TXT, MD, PDF, DOCX).
 * @param {Object} file - Multer file object
 * @returns {Promise<{ text: string, wordCount: number, format: string, fileName: string, fileSize: number }>}
 */
export async function extractTextFromFile(file) {
  if (!file || !file.path) {
    throw new Error('No valid file uploaded for text extraction.');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText = '';
  let format = 'text';

  try {
    if (ext === '.txt' || ext === '.md' || file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
      const buffer = await fs.readFile(file.path, 'utf8');
      extractedText = buffer;
      format = ext === '.md' ? 'Markdown' : 'Plain Text';
    } else if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      const buffer = await fs.readFile(file.path);
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text || '';
      format = 'PDF Document';
    } else if (
      ext === '.docx' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const docxData = await mammoth.extractRawText({ path: file.path });
      extractedText = docxData.value || '';
      format = 'Word Document (DOCX)';
    } else {
      throw new Error(`Unsupported document format "${ext}". Supported formats are TXT, Markdown (.md), PDF, and Word (.docx).`);
    }

    const cleanText = extractedText.replace(/\r\n/g, '\n').trim();
    const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

    return {
      text: cleanText,
      wordCount,
      format,
      fileName: file.originalname,
      fileSize: file.size,
      filePath: file.path,
    };
  } catch (err) {
    throw new Error(`Failed to extract text from ${file.originalname}: ${err.message}`);
  }
}
