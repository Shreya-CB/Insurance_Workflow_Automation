import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  submitClaim, 
  decision, 
  getUserClaims, 
  getClaimByIdController,
  getAdjusterClaims 
} from '../controllers/claimController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: path.join(process.cwd(), '../uploads/claims/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// User routes (require authentication)
router.post('/submit', verifyToken, upload.single('evidence'), submitClaim);
router.get('/my-claims', verifyToken, getUserClaims);
router.get('/:id', verifyToken, getClaimByIdController);

// Adjuster routes
router.get('/adjuster/assigned', verifyToken, getAdjusterClaims);
router.put('/decision/:id', verifyToken, express.json(), decision);

export default router;
