import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavbarGlobal = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const rutaBiblioteca = usuario ? "/biblioteca" : "/login";

  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 20000);

    return () => clearTimeout(timer); // limpieza por si el componente se desmonta
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar-global">
        <NavItem to="/"><span role="img" aria-label="Home">🏠</span> Home</NavItem>
        <NavItem to={rutaBiblioteca}><span role="img" aria-label="Biblioteca">🎬</span> Biblioteca</NavItem>
        <NavItem to="/logincalendario"><span role="img" aria-label="Calendario">📅</span> Calendario</NavItem>
        <NavItem to="/rentacar"><span role="img" aria-label="Rentacar">🚗</span> Rentacar</NavItem>
        <NavItem to="/tetris"><span role="img" aria-label="Tetris">🧩</span> Tetris</NavItem>
        <NavItem to="/trusound"><span role="img" aria-label="TruSound">🎧</span> TruSoundCloud</NavItem>
        <NavItem to="/miswebs"><span role="img" aria-label="miswebs">🧩</span> Mis Webs</NavItem>
      </nav>

      {showWarning && (
        <div className="navbar-info">
          ⚠️ Esta web puede tardar hasta 60 segundos en conectarse con el backend.
        </div>
      )}

      <style>{`
        .navbar-global {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0.8rem 0.5rem;
          background-color: #111111;
          font-family: 'Poppins, sans-serif';
          font-size: 1.1rem;
          border-bottom: 3px solid #000000;
        }

        .nav-item {
          text-decoration: none;
          color: #000000;
          padding: 0.5rem 0.8rem;
          border: 2px solid #000000;
          border-radius: 8px;
          transition: all 0.3s ease;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          flex: 0 1 auto;
          text-align: center;
          min-width: 90px;
          max-width: 150px;
          font-size: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.4rem;
        }

        .nav-item:hover {
          background-color: #000000;
          color: #ffffff;
          transform: scale(1.05);
        }

        .navbar-info {
          text-align: center;
          padding: 0.5rem;
          font-size: 0.95rem;
          background-color: #ffeeba;
          color: #856404;
          font-family: 'Poppins, sans-serif';
          transition: opacity 0.5s ease-in-out;
        }

        @media (max-width: 768px) {
          .navbar-global {
            gap: 0.35rem;
            padding: 0.5rem;
            font-size: 0.9rem;
          }

          .nav-item {
            padding: 0.35rem 0.6rem;
            min-width: 80px;
            max-width: 130px;
            font-size: 0.85rem;
            gap: 0.3rem;
          }

          .navbar-info {
            font-size: 0.85rem;
            padding: 0.4rem;
          }
        }

        @media (max-width: 480px) {
          .navbar-global {
            padding: 0.4rem;
            font-size: 0.8rem;
            gap: 0.25rem;
          }

          .nav-item {
            padding: 0.25rem 0.4rem;
            min-width: 70px;
            max-width: 120px;
            font-size: 0.75rem;
            gap: 0.25rem;
          }

          .navbar-info {
            font-size: 0.75rem;
            padding: 0.3rem;
          }
        }
      `}</style>
    </>
  );
};

const NavItem = ({ to, children }) => {
  return (
    <Link to={to} className="nav-item">
      {children}
    </Link>
  );
};

export default NavbarGlobal;
