import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUserPolicies, downloadPolicy } from "../controllers/policiesController.js";

const router = express.Router();

router.get("/my-policies", verifyToken, getUserPolicies);
router.get("/download/:policyId", verifyToken, downloadPolicy);

export default router;
