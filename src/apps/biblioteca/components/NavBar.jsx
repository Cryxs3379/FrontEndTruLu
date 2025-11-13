import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    onLogout();
    navigate('/');
  };

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return null;

  return (
    <nav className="container-fluid py-3 px-4 bg-white shadow-sm d-flex justify-content-between align-items-center" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="d-flex gap-4 flex-wrap">
        <Link to="/biblioteca" className="text-decoration-none text-dark fw-medium">📚 Biblioteca</Link>
        <Link to="/megustan" className="text-decoration-none text-dark fw-medium">❤️ Me gustan</Link>
      </div>
      <button onClick={handleLogout} className="btn btn-danger fw-bold">
        🚪 Cerrar sesión
      </button>
    </nav>
  );
};

export default NavBar;
