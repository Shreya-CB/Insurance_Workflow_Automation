import db from "../config/db.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir2 = path.join(__dirname, "../uploads/eReceipts");
if (!fs.existsSync(uploadsDir2)) fs.mkdirSync(uploadsDir2, { recursive: true });

/* 1️⃣ Fetch Policy Info for Payment */
export const getPolicyForPayment = async (req, res) => {
  const { policyId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT policy_id, policy_name, insurance_type, premium FROM user_policies WHERE policy_id = ?",
      [policyId]
    );

    if (!rows.length)
      return res.json({ success: false, message: "No policy found with this ID" });

    res.json({ success: true, policy: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 2️⃣ Process Premium Payment */
export const makePremiumPayment = async (req, res) => {
  const { userId, policyId, amount, mode } = req.body;

  try {
    // Insert pending transaction
    const [tx] = await db.query(
      "INSERT INTO payment_transactions (user_id, policy_id, amount, payment_mode, status) VALUES (?, ?, ?, ?, 'PENDING')",
      [userId, policyId, amount, mode]
    );
    const transactionId = tx.insertId;

    console.log("❔ Approve payment? (yes/no)");

    const stdin = process.openStdin();
    stdin.once("data", async (input) => {
      const approve = input.toString().trim().toLowerCase();

      if (approve === "yes") {
        // Mark transaction success
        await db.query(
          "UPDATE payment_transactions SET status='SUCCESS', transaction_ref=? WHERE transaction_id=?",
          [`TXN-${Date.now()}`, transactionId]
        );

        // Insert receipt
        const [receipt] = await db.query(
          "INSERT INTO payment_receipts (transaction_id, user_id, policy_id, amount) VALUES (?, ?, ?, ?)",
          [transactionId, userId, policyId, amount]
        );

        res.json({
          success: true,
          message: "Payment Successful",
          receiptId: receipt.insertId,
        });
      } else {
        await db.query(
          "UPDATE payment_transactions SET status='FAILED' WHERE transaction_id=?",
          [transactionId]
        );
        res.json({ success: false, message: "Payment Declined" });
      }

      stdin.end();
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 3️⃣ Fetch saved payment details (specific to MakePaymentPage) */
export const getSavedPaymentDetails = async (req, res) => {
  console.log(" [API HIT] /make-payment/payment-details");
  const userId = req.user.id;
  const { mode } = req.query; // must be UPI / CARD / NET_BANKING

  try {
    if (!mode) return res.status(400).json({ success: false, message: "Payment mode required" });

    const [rows] = await db.query(
      "SELECT * FROM payment_details WHERE user_id = ? AND payment_mode = ?",
      [userId, mode]
    );

    if (!rows.length) {
      return res.json({ success: true, exists: false });
    }

    return res.json({ success: true, exists: true, details: rows[0] });

  } catch (err) {
    console.error("❌ Error fetching payment info:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const downloadReceipt = async (req, res) => {
  console.log(" [API HIT] /make-payment/download-receipt");
  try {
    const { receiptId } = req.params;
    const [rows] = await db.query("SELECT * FROM payment_receipts WHERE receipt_id = ?", [receiptId]);
    if (!rows.length) return res.status(404).json({ message: "Receipt not found" });

    const receipt = rows[0];
    const receiptpdfPath = path.join(uploadsDir2, `receipt_${receipt.receipt_id}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(receiptpdfPath);
    doc.pipe(stream);

    doc.fontSize(16).text("E-Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Receipt ID: ${receipt.receipt_id}`);
    doc.text(`Transaction ID: ${receipt.transaction_id}`);
    doc.text(`User ID: ${receipt.user_id}`);
    doc.text(`Policy ID: ${receipt.policy_id}`);
    doc.text(`Amount: ₹${receipt.amount}`);
    doc.text(`Generated At: ${receipt.generated_at}`);
    doc.end();

    stream.on("finish", () => res.download(receiptpdfPath));
  } catch (err) {
    console.error("❌ Receipt error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
