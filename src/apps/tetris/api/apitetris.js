const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://10.0.0.10:3000') + '/api';

const handleResponse = async (res, errorMessage) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${errorMessage}: ${res.status} ${text}`);
  }
  return res.json();
};

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE_URL}/leaderboard`);
  return handleResponse(res, 'Error al obtener el leaderboard');
}

export async function saveScore(username, score) {
  const res = await fetch(`${API_BASE_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score }),
  });
  return handleResponse(res, 'Error al guardar la puntuación');
}

export const apiClient = {
  getLeaderboard,
  saveScore,
};

