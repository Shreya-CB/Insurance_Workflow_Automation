import { useState, useEffect, useCallback } from "react";
import { API } from "../api";
import SidebarMenu from "../data/SidebarMenu";
import "../styles/KycUpload.css";

export default function KycUpload() {
  const [form, setForm] = useState({ documentType: "", memberId: "" });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [members, setMembers] = useState([]);
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState(null); // popup image url

  const token = localStorage.getItem("token");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await API.get("/family");
      setMembers(res.data);
    } catch (err) {}
  }, []);

  const fetchKycRecords = useCallback(async () => {
    try {
      const res = await API.get("/kyc/mykyc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setKycRecords(res.data);
    } catch (err) {}
  }, [token]);

  useEffect(() => {
    fetchMembers();
    fetchKycRecords();
  }, [fetchMembers, fetchKycRecords]);

  const handleFile = (e) => setFile(e.target.files[0]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg("Please select a file");
    setLoading(true);

    const formData = new FormData();
    formData.append("documentType", form.documentType);
    formData.append("document", file);
    if (form.memberId) formData.append("memberId", form.memberId);

    try {
      const res = await API.post("/kyc/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg(res.data.message);
      fetchKycRecords();
      setForm({ documentType: "", memberId: "" });
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async (id) => {
    try {
      setMsg("Re-verifying...");
      const res = await API.post(`/kyc/reverify/${id}`);
      setMsg(res.data.message);
      fetchKycRecords();
    } catch {
      setMsg("Failed");
    }
  };

  const openPreview = (filePath) => {
    const normalized = filePath.replace(/\\/g, "/");
    const filename = normalized.split("/uploads/kyc/")[1];
    if (!filename) return;

    const url = `http://localhost:5000/uploads/kyc/${filename}`;
    setPreviewUrl(url);
  };

  return (
    <div className="kyc-upload">
    <SidebarMenu />
    <div className="p-6 bg-white rounded-lg shadow w-full">

      {/* Popup viewer */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow-lg relative">
            <img src={previewUrl} alt="Document" className="max-h-[70vh] rounded" />
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">Upload KYC</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select name="documentType" value={form.documentType} onChange={handleChange}
          className="border p-2 rounded" required>
          <option value="">Select Type</option>
          <option value="Aadhar">Aadhar</option>
          <option value="PAN">PAN</option>
          <option value="Driving License">Driving License</option>
        </select>

        <select name="memberId" value={form.memberId} onChange={handleChange}
          className="border p-2 rounded">
          <option value="">Self (Policy Owner)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
          ))}
        </select>

        <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFile} required />

        <button type="submit" disabled={loading}
          className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {msg && <p className="text-center mt-4 text-blue-600">{msg}</p>}

      {/* Records table */}
      <div className="mt-8">
        <h3 className="text-xl mb-3 font-semibold">Uploaded Documents</h3>
        {kycRecords.length === 0 ? (
          <p>No documents uploaded.</p>
        ) : (
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2">Type</th>
                <th className="p-2">Member</th>
                <th className="p-2">Status</th>
                <th className="p-2">View</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {kycRecords.map((rec) => {
                const normalized = rec.filePath.replace(/\\/g, "/");
                return (
                  <tr key={rec.id} className="border-t">
                    <td className="p-2">{rec.documentType}</td>
                    <td className="p-2">
                      {rec.memberId
                        ? members.find((m) => m.id === rec.memberId)?.name
                        : "Self"}
                    </td>
                    <td className="p-2">
                      {rec.status === "Verified" ? "🟢 Verified"
                        : rec.status === "Pending" ? "🟡 Pending"
                        : "🔴 Rejected"}
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => openPreview(rec.filePath)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        View
                      </button>
                    </td>

                    <td className="p-2">
                      {rec.status === "Pending" && (
                        <button
                          onClick={() => handleReverify(rec.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          Reverify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>
    </div>
    </div>
  );
}

