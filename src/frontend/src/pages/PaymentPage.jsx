import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/PaymentPage.css";

export default function PaymentPage() {
  const location = useLocation();
  const { plan } = location.state || {}; // coming from QuotePage
  const token = localStorage.getItem("token");

  const [paymentData, setPaymentData] = useState({
    mode: "",
    upiId: "",
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    bankName: "",
    accountNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [showDownload, setShowDownload] = useState(false);
  const [policyId, setPolicyId] = useState(null);
  const [receiptId, setReceiptId] = useState(null);

  /*useEffect(() => {
    if (!plan) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserId(payload.id);
    fetchSavedDetails(payload.id);
  }, [plan]);*/

  useEffect(() => {
    if (!plan) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserId(payload.id);
  }, [plan]);

  // new useEffect that triggers only when user selects mode
  useEffect(() => {
    if (userId && paymentData.mode) {
        fetchSavedDetails(userId, paymentData.mode);
    }
  }, [userId, paymentData.mode]);

  /*const fetchSavedDetails = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/payment/fetch/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.exists) {
        setPaymentData({
          mode: data.data.mode || "",
          upiId: data.data.upi_id || "",
          cardNumber: data.data.card_number || "",
          cardHolder: data.data.card_holder || "",
          expiryDate: data.data.expiry_date || "",
          bankName: data.data.bank_name || "",
          accountNumber: data.data.account_number || "",
        });
        setStatusMsg("💾 Payment details loaded automatically.");
      } else {
        setStatusMsg("ℹ️ No saved payment details found. Please enter them below.");
      }
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };*/
  const fetchSavedDetails = async (id, mode) => {
    try {
        const res = await fetch(`http://localhost:5000/api/payment/fetch/${id}?mode=${mode}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.exists) {
        setPaymentData({
          mode: data.data.payment_mode || "",
          upiId: data.data.upi_id || "",
          cardNumber: data.data.card_number || "",
          cardHolder: data.data.card_holder || "",
          expiryDate: data.data.expiry_date || "",
          bankName: data.data.bank_name || "",
          accountNumber: data.data.account_number || "",
        });
        setStatusMsg("Payment details loaded automatically.");
        } else {
        setStatusMsg(""); // no message shown
        }
    } catch (err) {
        console.error("Error fetching details:", err);
    }
  };


  const handleSaveDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payment/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            userId,
            mode: paymentData.mode,
            upiId: paymentData.upiId,
            cardNumber: paymentData.cardNumber,
            cardHolder: paymentData.cardHolder,
            expiryDate: paymentData.expiryDate,
            bankName: paymentData.bankName,
            accountNumber: paymentData.accountNumber,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Payment details saved!");
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    if (!paymentData.mode) {
      alert("Please select a payment mode before proceeding.");
      return;
    }

    setStatusMsg("Processing payment... Please wait⏳");
    try {
      const res = await fetch("http://localhost:5000/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          userId, 
          amount: plan.premium,
          mode: paymentData.mode, 
          policy: {
            policyName: plan.name,
            policyType: plan.insuranceType,
            coverage: plan.coverage,
            premium: plan.premium,
            termYears: plan.term_years,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg("✅ Payment Successful!");
        setShowDownload(true);
        setPolicyId(data.policyId);   // store ids returned from backend
        setReceiptId(data.receiptId || null);
      } else {
        setStatusMsg("❌ Payment Declined by Admin");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setStatusMsg("❌ Payment failed due to server issue.");
    } finally {
      setLoading(false);
    }
  };

  /*const storePurchasedPolicy = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payment/store-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          policyName: plan.name,
          policyType: plan.insuranceType,
          coverage: plan.coverage,
          premium: plan.premium,
          termYears: plan.term_years,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg("📦 Policy stored successfully!");
      }
    } catch (err) {
      console.error("Error storing policy:", err);
    }
  };*/

  /*const downloadPolicy = () => {
    if (policyId)
      window.open(`http://localhost:5000/api/payment/download-policy/${policyId}`, "_blank");
  };*/
  const downloadPolicy = async () => {
    if (!policyId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/payment/download-policy/${policyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Policy_${policyId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  /*const downloadReceipt = () => {
    if (receiptId)
      window.open(`http://localhost:5000/api/payment/download-receipt/${receiptId}`, "_blank");
  };*/
  const downloadReceipt = async () => {
    if (!receiptId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/payment/download-receipt/${receiptId}`, {
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
    <div className="payment-page">
      <main className="payment-container">
        {plan ? (
          <>
            <h2 className="payment-header">
              You have selected the <b>{plan.name}</b> under <b>{plan.insuranceType}</b> insurance
              which requires payment of <b>₹{plan.premium}</b> annually for{" "}
              <b>{plan.term_years}</b> years.
            </h2>

            <p className="status-msg">{statusMsg}</p>

            <form className="payment-form">
              <div>
                <label>Amount (₹)</label>
                <input type="number" value={plan.premium} readOnly className="readonly-input" />
              </div>

              <div>
                <label>Payment Mode</label>
                <select
                  value={paymentData.mode}
                  onChange={(e) => setPaymentData({ ...paymentData, mode: e.target.value })}
                >
                  <option value="">Select mode</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                </select>
              </div>

              {paymentData.mode === "UPI" && (
                <div>
                  <label>UPI ID</label>
                  <input
                    type="text"
                    value={paymentData.upiId}
                    onChange={(e) => setPaymentData({ ...paymentData, upiId: e.target.value })}
                  />
                </div>
              )}

              {paymentData.mode === "CARD" && (
                <>
                  <div>
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Card Holder</label>
                    <input
                      type="text"
                      value={paymentData.cardHolder}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardHolder: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, expiryDate: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {paymentData.mode === "NET_BANKING" && (
                <>
                  <div>
                    <label>Bank Name</label>
                    <input
                      type="text"
                      value={paymentData.bankName}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, bankName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Account Number</label>
                    <input
                      type="text"
                      value={paymentData.accountNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, accountNumber: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              <div className="button-group">
                <button type="button" onClick={handleSaveDetails} disabled={loading}>
                  Save Details
                </button>
                <button type="button" onClick={handleProcessPayment} disabled={loading}>
                  Make Payment
                </button>
              </div>
            </form>

            {showDownload && (
              <div className="download-section">
                <h3>Payment completed successfully</h3>
                <button onClick={downloadPolicy}>Download Policy PDF</button>
                <button onClick={downloadReceipt}>Download E-Receipt</button>
              </div>
            )}
          </>
        ) : (
          <p className="error-msg">No plan selected. Please go back to Quote Page.</p>
        )}
      </main>
    </div>
  );
}
