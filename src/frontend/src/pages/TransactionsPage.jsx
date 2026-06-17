import React, { useEffect, useState } from "react";
import "../styles/TransactionsPage.css";
import SidebarMenu from "../data/SidebarMenu";

export default function TransactionsPage() {
  const token = localStorage.getItem("token");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions/my-transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions);
        } else {
          setError(data.message || "Failed to fetch transactions.");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Unable to fetch transactions at the moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token]);

  /*const handleDownload = (receiptId) => {
    window.open(`http://localhost:5000/api/transactions/download/${receiptId}?token=${token}`, "_blank");
  };*/
  const downloadReceipt = async (receiptId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/download/${receiptId}`, {
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

  if (loading) return <div className="tx-loader">Loading your transactions...</div>;

  return (
    <div>
      <SidebarMenu />
    
    <div className="tx-page">
      <h2 className="tx-header">💳 My Transactions</h2>

      {error && <p className="tx-error">{error}</p>}

      {transactions.length === 0 ? (
        <p className="tx-empty">You haven’t made any transactions yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Policy Name</th>
              <th>Amount (₹)</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Date</th>
              <th>Download Receipt</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transaction_id}>
                <td>{t.transaction_id}</td>
                <td>{t.policy_name || "—"}</td>
                <td>{t.amount}</td>
                <td>{t.payment_mode}</td>
                <td
                  className={
                    t.status === "SUCCESS"
                      ? "tx-success"
                      : t.status === "FAILED"
                      ? "tx-failed"
                      : "tx-pending"
                  }
                >
                  {t.status}
                </td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td>
                  {t.receipt_id ? (
                    <button onClick={() => downloadReceipt(t.receipt_id)}>⬇️ E-Receipt</button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
}
