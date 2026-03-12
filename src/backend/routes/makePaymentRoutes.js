import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getPolicyForPayment, makePremiumPayment,getSavedPaymentDetails, downloadReceipt } from "../controllers/makePaymentController.js";

const router = express.Router();

router.get("/policy/:policyId", verifyToken, getPolicyForPayment);
router.post("/pay", verifyToken, makePremiumPayment);
router.get("/payment-details", verifyToken, getSavedPaymentDetails);
router.get("/download-receipt/:receiptId", verifyToken, downloadReceipt);

export default router;
