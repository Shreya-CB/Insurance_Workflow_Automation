/* import express from "express";
import { uploadKyc, fetchUserKyc, upload } from "../controllers/kycController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
console.log("[Routes] kycRoutes loaded");

router.post("/upload", verifyToken, upload.single("document"), uploadKyc);
router.get("/mykyc", verifyToken, fetchUserKyc);

export default router;
*/

import express from 'express';
import {
  uploadKyc, fetchUserKyc, reverifyKyc, upload,
} from '../controllers/kycController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', verifyToken, upload.single('document'), uploadKyc);
router.get('/mykyc', verifyToken, fetchUserKyc);
router.post('/reverify/:id', verifyToken, reverifyKyc);

export default router;
