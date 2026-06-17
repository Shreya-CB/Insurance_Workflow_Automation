// src/backend/utils/verifyHelper.js
/* import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";
import { extractText, matchPattern, convertPdfToImage } from "./ocrHelper.js";

export const verifyDocument = async (documentType, filePath) => {
  try {
    if (!filePath || typeof filePath !== "string") {
      console.warn("⚠️ verifyDocument: invalid filePath:", filePath);
      return { status: "Pending", remarks: "Invalid file path" };
    }

    // 1) API-based verification (when enabled)
    if (process.env.USE_API_VERIFICATION === "true") {
      try {
        const ok = await verifyWithAPI(documentType, filePath);
        if (ok) return { status: "Verified", remarks: "Verified via API" };
      } catch (apiErr) {
        console.warn("⚠️ API verification failed:", apiErr.message);
      }
    }

    // 2) OCR fallback
    let text;
    try {
      text = await extractText(filePath);
    } catch (ocrErr) {
      // OCR failed -> pending with error
      return { status: "Pending", remarks: "Verification error: " + ocrErr.message };
    }

    const isValid = matchPattern(documentType, text || "");
    if (isValid) {
      return { status: "Verified", remarks: "Verified via OCR pattern match" };
    }

    // 3) Not matched -> pending
    return { status: "Pending", remarks: "Awaiting re-verification" };
  } catch (err) {
    return { status: "Pending", remarks: "Verification error: " + err.message };
  }
};

const verifyWithAPI = async (documentType, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    console.warn("⚠️ Skipping API verify: Invalid file path:", filePath);
    return false;
  }

  // Only attempt for AADHAR (you can expand)
  if ((documentType || "").toUpperCase() !== "AADHAR") return false;

  // Ensure we send an image to API (convert PDF -> PNG)
  const ext = path.extname(filePath).toLowerCase();
  let sendPath = filePath;
  if (ext === ".pdf") {
    try {
      sendPath = await convertPdfToImage(filePath);
    } catch (err) {
      console.warn("⚠️ PDF->image conversion failed for API verify:", err.message);
      return false;
    }
  }

  if (!fs.existsSync(sendPath)) {
    console.warn("⚠️ File not found for API verify:", sendPath);
    return false;
  }

  // Build multipart/form-data
  const form = new FormData();
  form.append("file", fs.createReadStream(sendPath));

  const headers = {
    ...form.getHeaders(),
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
  };

  try {
    const res = await axios.post(`https://${process.env.RAPIDAPI_HOST}/ocr`, form, {
      headers,
      maxBodyLength: Infinity,
      timeout: 30_000,
    });

    // adapt to provider response shape - example uses field 'aadhaar_number'
    const extracted = res.data?.aadhaar_number || res.data?.data?.aadhaar_number || "";
    return /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(extracted);
  } catch (err) {
    // log and return false to let OCR fallback run
    console.warn("⚠️ API verification failed:", err.message || err.toString());
    return false;
  }
};
*/

import axios from 'axios';
import fs from 'fs';
import { extractText, matchPattern } from './ocrHelper.js';

// place API verify above usage to avoid no-use-before-define rule
async function verifyWithAPI(documentType, filePath) {
  if (documentType.toUpperCase() !== 'AADHAR') return false;

  if (!filePath || !fs.existsSync(filePath)) {
    console.warn('⚠️ Skipping API — invalid file:', filePath);
    return false;
  }

  const fileStream = fs.createReadStream(filePath);

  const options = {
    method: 'POST',
    url: `https://${process.env.RAPIDAPI_HOST}/ocr`,
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': process.env.RAPIDAPI_HOST,
    },
    data: { file: fileStream },
  };

  const res = await axios.request(options);
  const extracted = res.data?.aadhaar_number || '';

  return /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(extracted);
}

export const verifyDocument = async (documentType, filePath) => {
  try {
    // ------- API VERIFICATION -------
    if (process.env.USE_API_VERIFICATION === 'true') {
      try {
        const result = await verifyWithAPI(documentType, filePath);
        if (result) {
          return { status: 'Verified', remarks: 'Verified via API' };
        }
      } catch (err) {
        console.warn('⚠️ API verification failed:', err.message);
      }
    }

    // ------- OCR FALLBACK -------
    const text = await extractText(filePath);
    const ok = matchPattern(documentType, text);

    if (ok) {
      return { status: 'Verified', remarks: 'Verified via OCR' };
    }

    return { status: 'Pending', remarks: 'OCR could not match pattern' };
  } catch (err) {
    return { status: 'Pending', remarks: `Verification error: ${err.message}` };
  }
};

// -------------------- API VERIFY -----------------------
// (function moved above verifyDocument to satisfy ESLint no-use-before-define)
