import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  fetchFamily, createFamilyMember, removeFamilyMember, editFamilyMember,
} from '../controllers/familyController.js';

const router = express.Router();

router.get('/', verifyToken, fetchFamily);
router.post('/', verifyToken, createFamilyMember);
router.delete('/:id', verifyToken, removeFamilyMember);
router.put('/:id', verifyToken, editFamilyMember);

export default router;
