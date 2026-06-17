import db from "../config/db.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const receiptsDir = path.join(__dirname, "../uploads/eReceipts");
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });

/* 1️⃣ Fetch user transactions */
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT pt.*, pr.receipt_id, up.policy_name
       FROM payment_transactions pt
       LEFT JOIN payment_receipts pr ON pt.transaction_id = pr.transaction_id
       LEFT JOIN user_policies up ON pt.policy_id = up.policy_id
       WHERE pt.user_id = ?
       ORDER BY pt.created_at DESC`,
      [userId]
    );

    res.json({ success: true, transactions: rows });
  } catch (err) {
    console.error("❌ Fetch transactions error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch transactions." });
  }
};

/* 2️⃣ Download transaction receipt */
export const downloadReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const [rows] = await db.query(
      `SELECT * FROM payment_receipts WHERE receipt_id = ?`,
      [receiptId]
    );
    if (!rows.length) return res.status(404).json({ message: "Receipt not found" });

    const receipt = rows[0];
    const pdfPath = path.join(receiptsDir, `receipt_${receipt.receipt_id}.pdf`);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
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

    stream.on("finish", () => res.download(pdfPath));
  } catch (err) {
    console.error("❌ Receipt download error:", err.message);
    res.status(500).json({ success: false, message: "Error generating receipt PDF" });
  }
};
