import { createClaim, getClaimById, updateClaim } from '../models/claimModel.js';
import { routeClaim } from '../services/routingService.js';
import db from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function submitClaim(req, res) {
  try {
    if (!db) throw new Error("Database connection not available");
    
    // Get user ID from token (set by auth middleware)
    const userId = req.user?.id || req.body.user_id;
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }

    const payload = {
      policy_id: req.body.policy_id,
      user_id: userId,
      incident_type: req.body.incident_type,
      description: req.body.description,
      claim_amount: req.body.claim_amount,
      evidence_url: req.file ? `/uploads/claims/${req.file.filename}` : null
    };
    const id = await createClaim(payload);
    // optional auto-route
    await routeClaim(id);
    res.status(201).json({ message: 'Claim submitted successfully', claim_id: id });
  } catch (err) {
    console.error("Claim submission error:", err);
    res.status(500).json({ message: err.message || "Error submitting claim" });
  }
}

export async function getUserClaims(req, res) {
  try {
    if (!db) throw new Error("Database connection not available");
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User authentication required" });
    }

    const [claims] = await db.execute(
      'SELECT * FROM claims WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(claims);
  } catch (err) {
    console.error("Error fetching user claims:", err);
    res.status(500).json({ message: err.message || "Error fetching claims" });
  }
}

export async function getClaimByIdController(req, res) {
  try {
    if (!db) throw new Error("Database connection not available");
    const claimId = req.params.id;
    const claim = await getClaimById(claimId);
    
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Check if user owns the claim or is admin/adjuster
    const userId = req.user?.id;
    if (claim.user_id !== userId && req.user?.role !== 'admin' && req.user?.role !== 'adjuster') {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(claim);
  } catch (err) {
    console.error("Error fetching claim:", err);
    res.status(500).json({ message: err.message || "Error fetching claim" });
  }
}

export async function getAdjusterClaims(req, res) {
  try {
    if (!db) throw new Error("Database connection not available");
    const adjusterId = req.user?.id;
    if (!adjusterId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const [claims] = await db.execute(
      'SELECT * FROM claims WHERE assigned_adjuster_id = ? ORDER BY created_at DESC',
      [adjusterId]
    );
    res.json(claims);
  } catch (err) {
    console.error("Error fetching adjuster claims:", err);
    res.status(500).json({ message: err.message || "Error fetching claims" });
  }
}

export async function decision(req, res) {
  try {
    if (!db) throw new Error("Database connection not available");
    const id = req.params.id;
    const { status, remarks, payout_amount } = req.body;
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Approved' or 'Rejected'" });
    }

    if (status === 'Approved') {
      if (!payout_amount) {
        return res.status(400).json({ message: "Payout amount is required for approval" });
      }
      await updateClaim(id, { status: 'Approved' });
      // create payout
      await db.execute(
        'INSERT INTO payouts (claim_id,user_id,amount,status) SELECT claim_id,user_id,?,? FROM claims WHERE claim_id = ?',
        [payout_amount, 'Processed', id]
      );
    } else {
      await updateClaim(id, { status: 'Rejected' });
    }
    res.json({ message: `Claim ${status}`, claim_id: id });
  } catch (err) {
    console.error("Claim decision error:", err);
    res.status(500).json({ message: err.message || "Error processing claim decision" });
  }
}

