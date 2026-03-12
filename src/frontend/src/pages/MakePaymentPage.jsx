import React, { useState } from "react";
import "../styles/MakePaymentPage.css";
import SidebarMenu from "../data/SidebarMenu";

export default function MakePaymentPage() {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  const [policyId, setPolicyId] = useState("");
  const [policy, setPolicy] = useState(null);
  const [mode, setMode] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [receiptId, setReceiptId] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    upiId: "",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    bankName: "",
    accountNumber: "",
  });

  const fetchPolicy = async () => {
    const res = await fetch(`http://localhost:5000/api/make-payment/policy/${policyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setPolicy(data.policy);
    else setStatusMsg(data.message);
  };

  const fetchPaymentDetails = async (selectedMode) => {
    try {
        const res = await fetch(`http://localhost:5000/api/make-payment/payment-details?mode=${selectedMode}`, {
        headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (data.exists) {
        // Auto-fill the info based on mode
        if (selectedMode === "UPI") {
            setStatusMsg("💾 Saved UPI details loaded.");
            setPaymentInfo({ upiId: data.details.upi_id });
        } 
        else if (selectedMode === "CARD") {
            setStatusMsg("💾 Saved Card details loaded.");
            setPaymentInfo({
            cardNumber: data.details.card_number,
            cardHolder: data.details.card_holder,
            expiryDate: data.details.expiry_date,
            });
        } 
        else if (selectedMode === "NET_BANKING") {
            setStatusMsg("💾 Saved Net Banking details loaded.");
            setPaymentInfo({
            bankName: data.details.bank_name,
            accountNumber: data.details.account_number,
            });
        }
        } 
        else {
        setStatusMsg("ℹ️ No saved details for this mode. Please enter manually.");
        setPaymentInfo({}); // Clear fields
        }
    } catch (err) {
        console.error("Error loading payment data:", err);
    }
  };


  const payPremium = async () => {
    if (!mode) return alert("Please select payment mode!");

    setStatusMsg("Processing payment ⏳...");

    const res = await fetch("http://localhost:5000/api/make-payment/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, policyId, amount: policy.premium, mode, ...paymentInfo }),
    });

    const data = await res.json();
    if (data.success) {
      setStatusMsg("✅ Payment Successful!");
      setReceiptId(data.receiptId);
      setShowDownload(true); //  show download receipt section
    } else {
      setStatusMsg("❌ Payment Failed");
    }
  };

  const downloadReceipt = async () => {
    if (!receiptId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/make-payment/download-receipt/${receiptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch receipt");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${receiptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div>
      <SidebarMenu />
    <div className="makepay-page">
      <div className="makepay-card">
        {/* Notice Message */}
        <p className="policy-hint">
          🔍 You can find your Policy IDs in the <b>My Policies</b> section.
        </p>
        <h2>Pay Policy Premium</h2>

        <input type="text" placeholder="Enter Policy ID" value={policyId}
          onChange={(e) => setPolicyId(e.target.value)} />

        <button onClick={fetchPolicy}>Fetch Policy</button>

        {policy && (
          <div className="policy-box">
            <div className="readonly-field">
                <label>Policy Name</label>
                <input type="text" value={policy.policy_name} readOnly />
            </div>

            <div className="readonly-field">
                <label>Insurance Type</label>
                <input type="text" value={policy.insurance_type} readOnly />
            </div>

            <div className="readonly-field">
                <label>Premium Amount (₹)</label>
                <input type="text" value={policy.premium} readOnly />
            </div>

            <select value={mode} onChange={(e) => {
              setMode(e.target.value);
              fetchPaymentDetails(e.target.value);  // ✅ Auto-fetch saved payment details
            }}>              
              <option value="">Select Payment Mode</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="NET_BANKING">Net Banking</option>
            </select>

            {/* UPI Mode */}
            {mode === "UPI" && (
                <div className="editable-field">
                    <label>UPI ID</label>
                    <input
                    type="text"
                    value={paymentInfo.upiId || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, upiId: e.target.value })}
                    />
                </div>
            )}

            {/* CARD Mode */}
            {mode === "CARD" && (
            <>
                <div className="editable-field">
                <label>Card Number</label>
                <input
                    type="text"
                    value={paymentInfo.cardNumber || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                />
                </div>

                <div className="editable-field">
                <label>Card Holder Name</label>
                <input
                    type="text"
                    value={paymentInfo.cardHolder || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })}
                />
                </div>

                <div className="editable-field">
                <label>Expiry Date (MM/YY)</label>
                <input
                    type="text"
                    value={paymentInfo.expiryDate || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                />
                </div>
            </>
            )}

            {/* NET BANKING Mode */}
            {mode === "NET_BANKING" && (
            <>
                <div className="editable-field">
                <label>Bank Name</label>
                <input
                    type="text"
                    value={paymentInfo.bankName || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                />
                </div>

                <div className="editable-field">
                <label>Account Number</label>
                <input
                    type="text"
                    value={paymentInfo.accountNumber || ""}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                />
                </div>
            </>
            )}

            <button className="pay-btn" onClick={payPremium}>Make Payment</button>
          </div>
        )}

        {showDownload && (
            <div className="download-section">
                <h3>Payment completed successfully</h3>
                <button onClick={downloadReceipt}>Download E-Receipt</button>
            </div>
        )}

        <p className="status-msg">{statusMsg}</p>
      </div>
    </div>
    </div>
  );
}
