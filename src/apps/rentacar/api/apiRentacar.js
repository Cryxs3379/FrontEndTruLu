// src/apps/rentacar/api/apiRentacar.js
import axios from 'axios';

//const API_BASE = 'http://localhost:10000/api/supabase';
 const API_BASE = 'https://trujillolucenabackend.onrender.com/api/supabase';

export const getCoches = async () => {
  const res = await axios.get(`${API_BASE}/coches`);
  return res.data;
};

export const getClientes = async () => {
  const res = await axios.get(`${API_BASE}/clientes`);
  return res.data;
};

export const crearReserva = async (reserva) => {
  const res = await axios.post(`${API_BASE}/reservas`, reserva);
  return res.data;
};

export const getReservas = async () => {
  const res = await axios.get(`${API_BASE}/reservas`);
  return res.data;
};

// ⚠️ Este endpoint necesita estar creado en tu backend
export const confirmarCliente = async (reserva) => {
  const res = await axios.post(`${API_BASE}/confirmar-cliente`, reserva);
  return res.data;
};

export const eliminarCliente = async (clienteId, idcoche) => {
  const res = await axios.delete(`${API_BASE}/eliminar-cliente/${clienteId}?idcoche=${idcoche}`);
  return res.data;
};

export const actualizarCliente = async (id, campos) => {
  const res = await axios.patch(`${API_BASE}/clientes/${id}`, campos);
  return res.data;
};


