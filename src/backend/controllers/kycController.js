import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import db from '../config/db.js';
import { createKycRecord, getKycRecordsByUser, updateKycStatus } from '../models/KycRecord.js';
import { verifyDocument } from '../utils/verifyHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⛔ Image-only folder
const uploadDir = path.join(__dirname, '../uploads/kyc');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// ⛔ Reject PDFs at upload level
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPG/PNG images are allowed'), false);
  }
  cb(null, true);
}

export const upload = multer({ storage, fileFilter });

// --------------------- UPLOAD & VERIFY ------------------------
export const uploadKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, memberId } = req.body;

    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const filePath = req.file.path; // ✔ direct image path

    // Create KYC DB record
    const record = await createKycRecord(userId, documentType, filePath, memberId);

    // OCR / API verification
    const verification = await verifyDocument(documentType, filePath);

    await updateKycStatus(record.insertId, verification.status, verification.remarks);

    res.status(200).json({
      message: `${documentType} uploaded and ${verification.status}`,
    });
  } catch (err) {
    console.error('[KYC Upload Error]:', err);
    res.status(500).json({ message: err.message || 'KYC Upload Failed' });
  }
};

// --------------------- FETCH ------------------------
export const fetchUserKyc = async (req, res) => {
  try {
    const records = await getKycRecordsByUser(req.user.id);
    res.status(200).json(records);
  } catch (err) {
    console.error('[KYC Fetch Error]:', err);
    res.status(500).json({ message: 'Error fetching KYC' });
  }
};

// --------------------- REVERIFY ------------------------
export const reverifyKyc = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM KYCRecords WHERE id = ?', [id]);
    const record = rows[0];
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const verification = await verifyDocument(record.documentType, record.filePath);

    await updateKycStatus(record.id, verification.status, verification.remarks);

    res.json({ message: `Reverified: ${verification.status}` });
  } catch (err) {
    console.error('[KYC Reverify Error]:', err);
    res.status(500).json({ message: 'Error during reverification' });
  }
};
