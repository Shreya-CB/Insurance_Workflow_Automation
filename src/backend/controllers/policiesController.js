import db from "../config/db.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads/policyPDFs");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/* 1️⃣ Fetch all policies for the logged-in user */
export const getUserPolicies = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM user_policies WHERE user_id = ? ORDER BY purchase_date DESC",
      [userId]
    );

    if (!rows.length) {
      return res.json({ success: true, policies: [] });
    }

    res.json({ success: true, policies: rows });
  } catch (err) {
    console.error("❌ Fetch policies error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch policies." });
  }
};

/* 2️⃣ Download specific policy PDF */
export const downloadPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;

    const [rows] = await db.query("SELECT * FROM user_policies WHERE policy_id = ?", [policyId]);
    if (!rows.length) return res.status(404).json({ message: "Policy not found" });

    const policy = rows[0];
    const pdfPath = path.join(uploadsDir, `policy_${policy.policy_id}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text("Insurance Policy Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Policy ID: ${policy.policy_id}`);
    doc.text(`User ID: ${policy.user_id}`);
    doc.text(`Policy Name: ${policy.policy_name}`);
    doc.text(`Insurance Type: ${policy.insurance_type}`);
    doc.text(`Coverage: ₹${policy.coverage}`);
    doc.text(`Premium: ₹${policy.premium}`);
    doc.text(`Purchase Date: ${policy.purchase_date}`);
    doc.text(`Expiry Date: ${policy.expiry_date}`);
    doc.text(`Term (Years): ${policy.term_years}`);
    doc.end();

    stream.on("finish", () => res.download(pdfPath));
  } catch (err) {
    console.error("❌ PDF download error:", err.message);
    res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};
