// src/apps/rentacar/components/NavbarRentacar.jsx
import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const NavbarRentacar = () => {
  const location = useLocation();

  const tabs = [
    { path: '/rentacar/informacion', label: '📅 Informacion' },
    { path: '/rentacar/reservas', label: '📅 Reservas' },
    { path: '/rentacar/oficina', label: '🏢 Oficina' },   
    { path: '/rentacar/garaje', label: '🚗 Garaje' }
  ];

  return (
    <div>
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '1rem',
        backgroundColor: '#f0f0f0',
        borderBottom: '2px solid #ccc'
      }}>
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === tab.path ? '#fff' : '#000',
              backgroundColor: location.pathname === tab.path ? '#000' : '#fff',
              padding: '0.5rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid #000',
              fontWeight: 'bold',
              transition: '0.3s'
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {/* Aquí se renderizarán las rutas hijas */}
      <Outlet />
    </div>
  );
};

export default NavbarRentacar;
