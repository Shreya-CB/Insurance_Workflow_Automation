// utils/ocrHelper.js
/* import Tesseract from "tesseract.js";
import fs from "fs";

// Extract text from image/PDF using Tesseract OCR
export const extractText = async (filePath) => {
  if (!fs.existsSync(filePath)) throw new Error("File not found");
  const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
  return result.data.text;
};

// Detect if extracted text matches document type patterns
export const matchPattern = (documentType, text) => {
  text = text.replace(/\s+/g, " ").toUpperCase();

  switch (documentType.toUpperCase()) {
    case "AADHAR":
      return /\b\d{4}\s\d{4}\s\d{4}\b/.test(text);
    case "PAN":
      return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(text);
    case "DRIVING LICENSE":
      return /[A-Z]{2}\d{2}\s?\d{11}/.test(text);
    default:
      return false;
  }
};
*/

// utils/ocrHelper.js
/* import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { convert } from "pdf-poppler";

// Extract text from image/PDF
export const extractText = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("Invalid file path: " + filePath);
  }

  // ---- PDF Handling ----
  if (filePath.toLowerCase().endsWith(".pdf")) {
    const dir = path.dirname(filePath);
    const base = path.basename(filePath, ".pdf");    // ONLY name, no drive letter

    const outputImage = path.join(dir, `${base}-1.jpg`);

    const options = {
      format: "jpeg",
      out_dir: dir,
      out_prefix: base,
      scale: 1024,
    };

    try {
      await convert(filePath, options);
      filePath = outputImage;  // switch to converted JPEG
    } catch (err) {
      console.error("PDF conversion failed:", err.message);
      throw new Error("PDF conversion failed");
    }
  }

  // ---- OCR ----
  try {
    const result = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
    return result.data.text;
  } catch (err) {
    console.error("OCR failed:", err.message);
    throw new Error("OCR failed");
  }
};

// Detect if extracted text matches document type patterns
export const matchPattern = (documentType, text) => {
  text = text.replace(/\s+/g, " ").toUpperCase();

  switch (documentType.toUpperCase()) {
    case "AADHAR":
      return /\b\d{4}\s\d{4}\s\d{4}\b/.test(text);
    case "PAN":
      return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(text);
    case "DRIVING LICENSE":
      return /[A-Z]{2}\d{2}\s?\d{11}/.test(text);
    default:
      return false;
  }
}; */

// src/backend/utils/ocrHelper.js
import fs from 'fs';
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import path from 'path';

export const convertPdfToImage = async (filePath) => {
  // convert first page of PDF to PNG, return generated image path
  if (!fs.existsSync(filePath)) throw new Error(`PDF file not found: ${filePath}`);
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.pdf') return filePath;

  const outputDir = path.dirname(filePath);
  const outputBase = path.basename(filePath, ext);

  try {
    const converter = fromPath(filePath, {
      density: 150,
      saveFilename: outputBase,
      savePath: outputDir,
      format: 'png',
      width: 1200,
      height: 1600,
    });

    // convert first page only
    const result = await converter(1);
    if (!result || !result.path) throw new Error('pdf2pic returned invalid result');
    return result.path;
  } catch (err) {
    // bubble a helpful message
    throw new Error(`PDF conversion failed: ${err.message}`);
  }
};

export const extractText = async (filePath) => {
  if (!filePath) throw new Error('extractText: filePath is required');
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  let targetPath = filePath;
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    // convert PDF -> image (first page)
    targetPath = await convertPdfToImage(filePath);
  }

  // sanity check file size / dimensions could be done here.
  try {
    const { data } = await Tesseract.recognize(targetPath, 'eng', { logger: () => {} });
    return data?.text || '';
  } catch (err) {
    throw new Error(`OCR failed: ${err.message}`);
  }
};

// Detect if extracted text matches document type patterns
export const matchPattern = (documentType, text) => {
  if (!text) return false;
  const t = text.replace(/\s+/g, ' ').toUpperCase();

  switch ((documentType || '').toUpperCase()) {
    case 'AADHAR':
      return /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(t);
    case 'PAN':
      return /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(t);
    case 'DRIVING LICENSE':
      // Driving license formats vary - this is a basic check
      return /[A-Z]{2}\d{2}\s?\d{1,11}/.test(t);
    default:
      return false;
  }
};
