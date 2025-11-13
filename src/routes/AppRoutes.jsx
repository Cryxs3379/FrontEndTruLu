import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../home/Home';
import Biblioteca from '../apps/biblioteca/pages/Biblioteca';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/biblioteca" element={<Biblioteca />} />
    </Routes>
  );
};

export default AppRoutes;
