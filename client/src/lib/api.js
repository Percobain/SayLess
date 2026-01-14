const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function checkSession(sessionId) {
  const response = await fetch(`${API_URL}/api/session/${sessionId}`);
  return response.json();
}

export async function submitReport(sessionId, payload) {
  const response = await fetch(`${API_URL}/api/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId, payload })
  });
  return response.json();
}

export async function getAuthorityReports() {
  const response = await fetch(`${API_URL}/api/authority/reports`);
  return response.json();
}

export async function decryptReport(reportId) {
  const response = await fetch(`${API_URL}/api/authority/decrypt/${reportId}`, {
    method: 'POST'
  });
  return response.json();
}

export async function verifyReport(reportId, rewardAmount = '0.005') {
  const response = await fetch(`${API_URL}/api/authority/verify/${reportId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rewardAmount })
  });
  return response.json();
}

export async function rejectReport(reportId) {
  const response = await fetch(`${API_URL}/api/authority/reject/${reportId}`, {
    method: 'POST'
  });
  return response.json();
}

export async function getAuthorityStats() {
  const response = await fetch(`${API_URL}/api/authority/stats`);
  return response.json();
}


