import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './home/Home';
import Biblioteca from './apps/biblioteca/pages/Biblioteca';
import MeGustan from './apps/biblioteca/pages/MeGustan';
import Login from './apps/biblioteca/pages/Login';
import PeliculaDetalle from './apps/biblioteca/pages/PeliculaDetalle';
import NavbarGlobal from './layout/NavbarGlobal';
import RutaPrivada from './apps/biblioteca/components/RutaPrivada';
import LoginCalendario from './apps/calendario/pages/LoginCalendario';
import HomeCalendario from './apps/calendario/pages/HomeCalendario';
import './App.css';
import Tetris from './apps/tetris/Tetris';

// 🚗 Rentacar Imports
import Informacion from './apps/rentacar/pages/Informacion';
import Oficina from './apps/rentacar/pages/Oficina';
import Reservas from './apps/rentacar/pages/Reservas';
import Garaje from './apps/rentacar/pages/Garaje';
import NavbarRentacar from './apps/rentacar/components/NavbarRentacar';
import MisWebs from './apps/miswebs/MisWebs';
import TruSoundCloud from './apps/trusound/pages/TruSoundCloud';


function AppWrapper() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuario'));
    setUsuario(user);

    const actualizarUsuario = () => {
      const newUser = JSON.parse(localStorage.getItem('usuario'));
      setUsuario(newUser);
    };

    window.addEventListener('storage', actualizarUsuario);
    return () => window.removeEventListener('storage', actualizarUsuario);
  }, []);

  return (
    <BrowserRouter>
      <NavbarGlobal usuario={usuario} onLogout={() => setUsuario(null)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logincalendario" element={<LoginCalendario />} />
        <Route path="/homecalendario" element={<HomeCalendario />} />
        <Route path="/login" element={<Login onLogin={setUsuario} />} />
        <Route path="/biblioteca" element={
          <RutaPrivada usuario={usuario}>
            <Biblioteca />
          </RutaPrivada>
        } />
        <Route path="/megustan" element={
          <RutaPrivada usuario={usuario}>
            <MeGustan />
          </RutaPrivada>
        } />
        <Route path="/pelicula/:id" element={
          <RutaPrivada usuario={usuario}>
            <PeliculaDetalle />
          </RutaPrivada>
        } />

        {/* 🚗 Rentacar Layout con subrutas */}
        <Route path="/rentacar" element={<NavbarRentacar />}>
          <Route index element={<Navigate to="informacion" replace />} />
           <Route path="informacion" element={<Informacion />} />
          <Route path="oficina" element={<Oficina />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="garaje" element={<Garaje />} />
        </Route>
        <Route path="/tetris" element={<Tetris />} />
        <Route path="/MisWebs" element={<MisWebs />} />
        <Route path="/trusound" element={<TruSoundCloud />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWrapper;
