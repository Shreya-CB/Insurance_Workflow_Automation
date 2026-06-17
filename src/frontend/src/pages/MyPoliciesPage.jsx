import React, { useEffect, useState } from "react";
import "../styles/MyPoliciesPage.css";
import SidebarMenu from "../data/SidebarMenu";

export default function MyPoliciesPage() {
  const token = localStorage.getItem("token");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/policies/my-policies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setPolicies(data.policies);
        } else {
          setError(data.message || "Failed to fetch policies.");
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
        setError("Unable to fetch policies at the moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [token]);

  const downloadPolicy = async (policyId) => {

    try {
      const res = await fetch(`http://localhost:5000/api/policies/download/${policyId}`, {
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

  if (loading) return <div className="mypolicies-loader">Loading your policies...</div>;

  return (
    <div>
    <SidebarMenu />
    <div className="mypolicies-page">
      <h2 className="mypolicies-header">📜 My Purchased Policies</h2>

      {error && <p className="mypolicies-error">{error}</p>}

      {policies.length === 0 ? (
        <p className="mypolicies-empty">You haven't purchased any policies yet.</p>
      ) : (
        <div className="mypolicies-grid">
          {policies.map((policy) => (
            <div className="policy-card" key={policy.policy_id}>
              <h3>{policy.policy_name}</h3>
              <p><strong>Type:</strong> {policy.insurance_type}</p>
              <p><strong>Coverage:</strong> ₹{policy.coverage}</p>
              <p><strong>Premium:</strong> ₹{policy.premium}</p>
              <p><strong>Purchase Date:</strong> {new Date(policy.purchase_date).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(policy.expiry_date).toLocaleDateString()}</p>
              <p><strong>Term (Years):</strong> {policy.term_years}</p>

              <button className="download-btn" onClick={() => downloadPolicy(policy.policy_id)}>
                ⬇️ Download Policy PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
