import axios from 'axios';

//const API_BASE = 'http://localhost:10000/api';
const API_BASE = 'https://trujillolucenabackend.onrender.com/api';

export const login = async (email, contrasena) => {
  const res = await axios.post(`${API_BASE}/login`, { email, contrasena });
  return res.data;
};

export const getPeliculas = async () => {
  const res = await axios.get(`${API_BASE}/biblioteca`);
  return res.data;
};

export const likeMatrix = async (userId) => {
    const res = await axios.put(`${API_BASE}/usuarios/${userId}/matrix`);
    return res.data;
  };

  export const likePelicula = async (userId, pelicula) => {
    const res = await axios.put(`${API_BASE}/usuarios/${userId}/like`, pelicula);
    return res.data;
  };

  export const removeLike = async (userId, pelicula) => {
    const res = await axios.delete(`${API_BASE}/usuarios/${userId}/like`, {
      data: pelicula // 👈 se pasa en el body con método DELETE
    });
    return res.data;
  };
 