// src/apps/tetris/api/tetris.js
import axios from 'axios';

//const API_BASE = 'http://localhost:10000/api/supabase';
const API_BASE = 'https://trujillolucenabackend.onrender.com/api/supabase';

export const getPuntuacionTetris = async () => {
  const res = await axios.get(`${API_BASE}/tetris`);
  return res.data;
};

export const crearPuntuacionTetris = async (tetris) => {
  const res = await axios.post(`${API_BASE}/tetris`, tetris);
  return res.data;
};

