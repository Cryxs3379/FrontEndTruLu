import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const NavbarBiblioteca = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="container-fluid py-2 px-3 border-bottom d-flex justify-content-between align-items-center bg-white shadow-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="d-flex gap-2 flex-wrap">
        <NavItem to="/biblioteca" icon="🎞️" label="Películas" />
        <NavItem to="/megustan" icon="❤️" label="Favoritos" />
      </div>
      <LogoutButton onClick={handleLogout} />
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => (
  <Link
    to={to}
    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 fw-medium"
  >
    <span style={{ fontSize: '1.2rem' }}>{icon}</span> {label}
  </Link>
);

const LogoutButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 fw-medium"
  >
    <span style={{ fontSize: '1.2rem' }}>🚪</span> Salir
  </button>
);

export default NavbarBiblioteca;
