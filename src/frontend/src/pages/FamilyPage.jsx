import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { API } from "../api";
import SidebarMenu from "../data/SidebarMenu";
import "../styles/FamilyPage.css";

export default function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [kycRecords, setKycRecords] = useState([]);
  const [form, setForm] = useState({
    name: "",
    relationship: "",
    age: "",
    occupation: "",
    maritalStatus: "Single",
  });

  const token = localStorage.getItem("token");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await API.get("/family");
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  }, []);

  const fetchKyc = useCallback(async () => {
    try {
      const res = await API.get("/kyc/mykyc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycRecords(res.data);
    } catch (err) {
      console.error("Error fetching KYC:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchMembers();
    fetchKyc();
  }, [fetchMembers, fetchKyc]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addMember = async (e) => {
    e.preventDefault();
    await API.post("/family", form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setForm({ name: "", relationship: "", age: "", occupation: "", maritalStatus: "Single" });
    fetchMembers();
  };

  const deleteMember = async (id) => {
    await API.delete(`/family/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMembers();
  };

  const getKycForMember = (memberId) =>
    kycRecords.filter((rec) => rec.memberId === memberId);

  const checkMissingDocs = (member) => {
    const docs = getKycForMember(member.id).map((r) => r.documentType);
    const missing = [];
    if (!docs.includes("Aadhar")) missing.push("Aadhar");
    if (member.age > 18 && !docs.includes("PAN")) missing.push("PAN");
    return missing;
  };

  return (
    <div className="family-page">
    <SidebarMenu />
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Family Members</h2>

      {/* Add new member */}
      <form onSubmit={addMember} className="grid grid-cols-2 gap-4 mb-6">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
        <input type="text" name="relationship" placeholder="Relationship" value={form.relationship} onChange={handleChange} className="border p-2 rounded" required />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="border p-2 rounded" />
        <input type="text" name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} className="border p-2 rounded" />

        <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="border p-2 rounded col-span-2">
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>

        <button type="submit" className="bg-green-600 text-white py-2 rounded col-span-2 hover:bg-green-700">
          ➕ Add Member
        </button>
      </form>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => {
          const memberKyc = getKycForMember(m.id);
          const missingDocs = checkMissingDocs(m);

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 bg-gray-50 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-blue-700">{m.name}</h3>

              <p className="text-sm text-gray-600 mt-1">
                {m.relationship} • {m.age || "N/A"} yrs • {m.occupation || "N/A"}
              </p>
              <p className="text-xs text-gray-500">Status: {m.maritalStatus}</p>

              {/* KYC section */}
              <div className="mt-3 border-t pt-3 text-sm">
                <p className="font-semibold text-gray-700 mb-1">KYC:</p>

                {memberKyc.length === 0 && <p className="text-red-500">❌ No documents uploaded</p>}

                {memberKyc.map((rec) => (
                  <p key={rec.id}>
                    • {rec.documentType} →
                    {rec.status === "Verified" ? " 🟢 Verified" :
                     rec.status === "Pending" ? " 🟡 Pending" :
                     " 🔴 Rejected"}
                  </p>
                ))}

                {missingDocs.length > 0 && (
                  <p className="mt-2 text-red-600">⚠ Missing: {missingDocs.join(", ")}</p>
                )}
              </div>

              <button
                onClick={() => deleteMember(m.id)}
                className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
