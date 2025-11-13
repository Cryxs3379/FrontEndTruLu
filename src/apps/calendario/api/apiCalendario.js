// src/apps/calendario/api/apiCalendario.js
import axios from 'axios';

// Usa env si existe, si no Render
const BASE_URL =
  import.meta.env?.VITE_API_URL?.replace(/\/$/, '') ||
  'https://trujillolucenabackend.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

// Interceptor: añade JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tokenCalendario');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de respuesta: si 401 => limpia y redirige a login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('tokenCalendario');
      localStorage.removeItem('userCalendario');
      // Evita bucle si ya estás en login
      if (!location.pathname.includes('/logincalendario')) {
        window.location.href = '/logincalendario';
      }
    }
    return Promise.reject(err);
  }
);

// 🔐 Login para Calendario
export const loginCalendario = async (email, password) => {
  const { data } = await api.post('/logincalendario', { email, password });
  return data; // { token, user }
};

// 📅 Eventos
export const getEventos = async () => {
  const { data } = await api.get('/calendario');
  return data;
};

export const crearEvento = async (evento) => {
  const { data } = await api.post('/calendario', evento);
  return data;
};

export const actualizarEvento = async (id, eventoActualizado) => {
  const { data } = await api.put(`/calendario/${id}`, eventoActualizado);
  return data;
};

export const eliminarEvento = async (id) => {
  const { data } = await api.delete(`/calendario/${id}`);
  return data;
};

// 🕑 Historial
export const getHistorial = async () => {
  const { data } = await api.get('/historial');
  return data;
};

export const crearHistorial = async (accion) => {
  const { data } = await api.post('/historial', accion);
  return data;
};
