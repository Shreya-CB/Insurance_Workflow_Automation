//src/backend/controllers/paymentController.js
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import db from "../config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir1 = path.join(__dirname, "../uploads/policyPDFs");
if (!fs.existsSync(uploadsDir1)) fs.mkdirSync(uploadsDir1, { recursive: true });

const uploadsDir2 = path.join(__dirname, "../uploads/eReceipts");
if (!fs.existsSync(uploadsDir2)) fs.mkdirSync(uploadsDir2, { recursive: true });

/* 1️⃣ FETCH EXISTING PAYMENT DETAILS */
export const fetchPaymentDetails = async (req, res) => {
  console.log(" [API HIT] /payment/fetch");
  const { userId } = req.params;
  const { mode } = req.query;

  try {
    let query = "SELECT * FROM payment_details WHERE user_id = ?";
    const values = [userId];
    if (mode) {
      query += " AND payment_mode = ?";
      values.push(mode);
    }

    const [rows] = await db.query(query, values);
    if (!rows.length) return res.json({ success: true, exists: false });
    res.json({ success: true, exists: true, data: rows[0] });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 2️⃣ SAVE PAYMENT DETAILS */
export const savePaymentDetails = async (req, res) => {
  console.log(" [API HIT] /payment/save");
  try {
    const {
      userId,
      mode,
      upiId,
      cardNumber,
      cardHolder,
      expiryDate,
      bankName,
      accountNumber,
    } = req.body;

    console.log(
      `Saving Info => UserID: ${userId}, Mode: ${mode}, UPI: ${upiId || "-"}, Card: ${cardNumber || "-"}, Bank: ${bankName || "-"}`
    );

    // check if details already exist for this user + mode
    const [exists] = await db.query(
      "SELECT * FROM payment_details WHERE user_id = ? AND payment_mode = ?",
      [userId, mode]
    );
    if (exists.length) {
      return res.json({ success: true, message: "Details already exist for this mode" });
    }

    let query = "";
    let values = [];

    if (mode === "UPI") {
      query = `
        INSERT INTO payment_details (user_id, payment_mode, upi_id)
        VALUES (?, ?, ?)
      `;
      values = [userId, mode, upiId];
    } else if (mode === "CARD") {
      query = `
        INSERT INTO payment_details (user_id, payment_mode, card_number, card_holder, expiry_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      values = [userId, mode, cardNumber, cardHolder, expiryDate];
    } else if (mode === "NET_BANKING") {
      query = `
        INSERT INTO payment_details (user_id, payment_mode, bank_name, account_number)
        VALUES (?, ?, ?, ?)
      `;
      values = [userId, mode, bankName, accountNumber];
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment mode" });
    }

    await db.query(query, values);
    res.json({ success: true, message: "Payment details saved successfully" });
  } catch (err) {
    console.error("❌ Save error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 3️⃣ PROCESS PAYMENT */
export const processPayment = async (req, res) => {
  console.log(" [API HIT] /payment/process");
  const { userId, amount, mode, policy } = req.body;
  try {
    console.log(`🔹 Initiating transaction for user ${userId} ₹${amount}`);

    // Step 1: Create new transaction (PENDING)
    const [txResult] = await db.query(
      "INSERT INTO payment_transactions (user_id, amount, payment_mode, status) VALUES (?, ?, ?, 'PENDING')",
      [userId, amount, mode]
    );
    const transactionId = txResult.insertId;

    console.log("❔ Approve payment? (yes/no)");

    const stdin = process.openStdin();
    stdin.once("data", async (input) => {
      const approval = input.toString().trim().toLowerCase();

      if (approval === "yes") {
        console.log("✅ Payment approved!");
        /*await db.query(
          "UPDATE payment_transactions SET policy_id = ?, status='SUCCESS', transaction_ref=? WHERE transaction_id=?",
          [policyId, `TXN-${Date.now()}`, transactionId]
        );*/

        // Step 2: Store purchased policy
        const [policyInsert] = await db.query(
          "INSERT INTO user_policies (user_id, policy_name, insurance_type, coverage, premium, term_years, expiry_date) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? YEAR))",
          [
            userId,
            policy.policyName,
            policy.policyType,
            policy.coverage,
            policy.premium,
            policy.termYears,
            policy.termYears,
          ]
        );
        const policyId = policyInsert.insertId;
        console.log("Policy term years:", policy.termYears);
        
        // ✅ Step 3: Update transaction with policy_id + success reference
        await db.query(
          `UPDATE payment_transactions 
          SET policy_id = ?, status = 'SUCCESS', transaction_ref = ? 
          WHERE transaction_id = ?`,
          [policyId, `TXN-${Date.now()}`, transactionId]
        );

        // Step 4: Insert receipt
        const [receiptInsert] = await db.query(
          "INSERT INTO payment_receipts (transaction_id, user_id, policy_id, amount) VALUES (?, ?, ?, ?)",
          [transactionId, userId, policyId, amount]
        );
        const receiptId = receiptInsert.insertId;  // ✅ capture this

        res.json({
          success: true,
          status: "APPROVED",
          message: "Payment successful",
          transactionId,
          policyId,
          receiptId
        });
      } else {
        console.log("❌ Payment declined by admin.");
        await db.query(
          "UPDATE payment_transactions SET status='FAILED' WHERE transaction_id=?",
          [transactionId]
        );
        res.json({ success: false, status: "DECLINED", message: "Payment declined" });
      }
      stdin.end();
    });
  } catch (err) {
    console.error("❌ Payment error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 4️⃣ DOWNLOAD POLICY PDF */
export const downloadPolicyPDF = async (req, res) => {
  console.log(" [API HIT] /payment/download-policy");
  try {
    const { policyId } = req.params;
    const [rows] = await db.query("SELECT * FROM user_policies WHERE policy_id = ?", [policyId]);
    if (!rows.length) return res.status(404).json({ message: "Policy not found" });

    const policy = rows[0];
    const policypdfPath = path.join(uploadsDir1, `policy_${policy.policy_id}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(policypdfPath);
    doc.pipe(stream);

    doc.fontSize(18).text("Policy Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Policy ID: ${policy.policy_id}`);
    doc.text(`User ID: ${policy.user_id}`);
    doc.text(`Policy Name: ${policy.policy_name}`);
    doc.text(`Insurance Type: ${policy.insurance_type}`);
    doc.text(`Coverage: ₹${policy.coverage}`);
    doc.text(`Premium: ₹${policy.premium}`);
    doc.text(`Purchase Date: ${policy.purchase_date}`);
    doc.text(`Expiry Date: ${policy.expiry_date}`);
    doc.text(`Term Years: ${policy.term_years}`);
    doc.end();

    stream.on("finish", () => res.download(policypdfPath));
  } catch (err) {
    console.error("❌ Policy PDF error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* 5️⃣ DOWNLOAD RECEIPT */
export const downloadReceipt = async (req, res) => {
  console.log(" [API HIT] /payment/download-receipt");
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
