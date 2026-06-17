// Claims API functions

export async function submitClaim(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/claims/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to submit claim');
  }
  return res.json();
}

export async function getUserClaims() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/claims/my-claims', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch claims');
  }
  return res.json();
}

export async function getClaimById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/claims/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch claim');
  }
  return res.json();
}

export async function claimDecision(id, payload) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:5000/api/claims/decision/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to process decision');
  }
  return res.json();
}

export async function getAdjusterClaims() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/claims/adjuster/assigned', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch adjuster claims');
  }
  return res.json();
}
  