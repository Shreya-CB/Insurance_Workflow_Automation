import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SidebarMenu from '../data/SidebarMenu';
import { submitClaim } from '../services/api';
import { API } from '../api';

export default function ClaimSubmit() {
  const [form, setForm] = useState({
    policy_id: '',
    incident_type: '',
    description: '',
    claim_amount: ''
  });
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleFile = (e) => {
    setEvidence(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('policy_id', form.policy_id);
      formData.append('incident_type', form.incident_type);
      formData.append('description', form.description);
      formData.append('claim_amount', form.claim_amount);
      if (evidence) {
        formData.append('evidence', evidence);
      }

      const result = await submitClaim(formData);
      setMessage(`✅ Claim submitted successfully! Claim ID: ${result.claim_id}`);
      setForm({
        policy_id: '',
        incident_type: '',
        description: '',
        claim_amount: ''
      });
      setEvidence(null);
      // Reset file input
      document.querySelector('input[type="file"]').value = '';
    } catch (err) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <SidebarMenu />
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
      >
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Submit Insurance Claim
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy ID *
            </label>
            <input
              type="text"
              name="policy_id"
              value={form.policy_id}
              onChange={handleChange}
              required
              placeholder="Enter your policy ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Type *
            </label>
            <select
              name="incident_type"
              value={form.incident_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select incident type</option>
              <option value="Vehicle">Vehicle Accident</option>
              <option value="Health">Health Emergency</option>
              <option value="Theft">Theft</option>
              <option value="Property">Property Damage</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount (₹) *
            </label>
            <input
              type="number"
              name="claim_amount"
              value={form.claim_amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Enter claim amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Describe the incident in detail..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence Document (Optional)
            </label>
            <input
              type="file"
              onChange={handleFile}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {evidence && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {evidence.name}
              </p>
            )}
          </div>

          {message && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </button>
        </form>
      </motion.div>
    </div>
    </div>
  );
}
