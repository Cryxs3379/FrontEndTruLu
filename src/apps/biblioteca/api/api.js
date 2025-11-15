import axios from 'axios';

const API_BASE = '/api';

const authClient = axios.create({
  baseURL: API_BASE,
});

authClient.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('usuario'));
  const token = stored?.token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export const login = async (email, password) => {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  return res.data;
};

export const getPeliculas = async (config = {}) => {
  const res = await authClient.get('/biblioteca', config);
  return res.data;
};

export const streamPelicula = async (peliculaId, { signal } = {}) => {
  const res = await authClient.get(`/biblioteca/${peliculaId}/stream`, {
    responseType: 'blob',
    signal,
  });
  return res.data;
};

export const buildStreamUrl = (peliculaId) => `${API_BASE}/biblioteca/${peliculaId}/stream`;
 