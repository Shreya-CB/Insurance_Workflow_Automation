//src/backend/routes/paymentRoutes.js 
import express from "express";
import {
  fetchPaymentDetails,
  savePaymentDetails,
  processPayment,
  //storePurchasedPolicy,
  downloadPolicyPDF,
  downloadReceipt
} from "../controllers/paymentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/fetch/:userId", verifyToken, fetchPaymentDetails);
router.post("/save", verifyToken, savePaymentDetails);
router.post("/process", verifyToken, processPayment);

// Policy after payment
//router.post("/store-policy", verifyToken, storePurchasedPolicy);

// PDF Downloads
router.get("/download-policy/:policyId", verifyToken, downloadPolicyPDF);
router.get("/download-receipt/:receiptId", verifyToken, downloadReceipt);

export default router;
