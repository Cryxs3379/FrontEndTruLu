const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://10.0.0.10:3000') + '/api';

const handleResponse = async (res, errorMessage) => {
  if (!res.ok) {
    const text = await res.text();
    const error = new Error(`${errorMessage}: ${res.status} ${text}`);
    console.error('❌ Error en handleResponse:', {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
      errorText: text
    });
    throw error;
  }
  return res.json();
};

export async function getLeaderboard() {
  const url = `${API_BASE_URL}/leaderboard`;
  console.log('🔄 [getLeaderboard] Iniciando petición...');
  console.log('🌐 [getLeaderboard] URL:', url);
  console.log('🌐 [getLeaderboard] API_BASE_URL:', API_BASE_URL);
  console.log('🌐 [getLeaderboard] VITE_API_URL:', import.meta.env.VITE_API_URL);
  
  try {
    const res = await fetch(url);
    console.log('📡 [getLeaderboard] Respuesta recibida:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      url: res.url,
      headers: Object.fromEntries(res.headers.entries())
    });
    
    const data = await handleResponse(res, 'Error al obtener el leaderboard');
    console.log('✅ [getLeaderboard] Datos parseados:', data);
    console.log('✅ [getLeaderboard] Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data);
    console.log('✅ [getLeaderboard] Cantidad de elementos:', Array.isArray(data) ? data.length : 'N/A');
    
    return data;
  } catch (error) {
    console.error('❌ [getLeaderboard] Error completo:', error);
    console.error('❌ [getLeaderboard] Error message:', error.message);
    console.error('❌ [getLeaderboard] Error stack:', error.stack);
    throw error;
  }
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

