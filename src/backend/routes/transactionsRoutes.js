import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUserTransactions, downloadReceipt } from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/my-transactions", verifyToken, getUserTransactions);
router.get("/download/:receiptId", verifyToken, downloadReceipt);

export default router;
