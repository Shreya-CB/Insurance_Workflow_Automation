import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserClaims } from '../services/api';
import SidebarMenu from '../data/SidebarMenu';
import "../styles/ClaimsList.css";
import { Link } from 'react-router-dom';

export default function ClaimsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await getUserClaims();
      setClaims(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load claims');
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading claims...</div>
      </div>
    );
  }

  return (
    <div>
      <SidebarMenu />
    <div className='claim-list'>
    <div className="min-h-screen max-w-screen g-gradient-to-b from-gray-100 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-700">My Claims</h2>
            <Link
              to="/submit-claim"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Submit New Claim
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          )}

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No claims submitted yet.</p>
              <Link
                to="/submit-claim"
                className="text-blue-600 hover:underline"
              >
                Submit your first claim
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Claim ID</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Policy ID</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Incident Type</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Amount</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Date</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.claim_id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">#{claim.claim_id}</td>
                      <td className="border border-gray-300 px-4 py-3">{claim.policy_id}</td>
                      <td className="border border-gray-300 px-4 py-3">{claim.incident_type || 'N/A'}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold">
                        {formatCurrency(claim.claim_amount)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                          {claim.status || 'Pending Review'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        {formatDate(claim.created_at)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <button
                          onClick={() => {
                            // Show claim details in a modal or navigate to detail page
                            alert(`Description: ${claim.description}\n\nEvidence: ${claim.evidence_url || 'No evidence uploaded'}`);
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
    </div>
    </div>
  );
}

