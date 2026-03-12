// src/backend/routes/quoteRoutes.js
import express from "express";
import { policyPayment } from "../controllers/quoteController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/payment", verifyToken, policyPayment);

export default router;
