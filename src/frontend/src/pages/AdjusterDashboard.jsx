import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getAdjusterClaims, claimDecision } from '../services/api';

export default function AdjusterDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await getAdjusterClaims();
      setClaims(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load claims');
      console.error('Error fetching adjuster claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (claimId, status) => {
    try {
      setProcessing(claimId);
      let payoutAmount = null;
      
      if (status === 'Approved') {
        const amount = prompt('Enter payout amount (₹):');
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
          alert('Please enter a valid payout amount');
          setProcessing(null);
          return;
        }
        payoutAmount = parseFloat(amount);
      }

      await claimDecision(claimId, {
        status,
        payout_amount: payoutAmount
      });

      alert(`Claim ${status} successfully!`);
      fetchClaims(); // Refresh the list
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(null);
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
        <div className="text-xl">Loading assigned claims...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Adjuster Dashboard</h2>
          <p className="text-gray-600 mb-6">Review and process assigned insurance claims</p>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
              {error}
            </div>
          )}

          {claims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No claims assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {claims.map((claim) => (
                <motion.div
                  key={claim.claim_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Claim ID</p>
                      <p className="font-semibold">#{claim.claim_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy ID</p>
                      <p className="font-semibold">{claim.policy_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Incident Type</p>
                      <p className="font-semibold">{claim.incident_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Claim Amount</p>
                      <p className="font-semibold text-blue-600">{formatCurrency(claim.claim_amount)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded">{claim.description || 'No description provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {claim.status || 'Pending Review'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-sm">{formatDate(claim.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Evidence</p>
                      {claim.evidence_url ? (
                        <a
                          href={`http://localhost:5000${claim.evidence_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400">No evidence</p>
                      )}
                    </div>
                  </div>

                  {claim.status === 'Under Review' || claim.status === 'Pending Review' ? (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleDecision(claim.claim_id, 'Approved')}
                        disabled={processing === claim.claim_id}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === claim.claim_id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDecision(claim.claim_id, 'Rejected')}
                        disabled={processing === claim.claim_id}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === claim.claim_id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">This claim has been processed.</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
