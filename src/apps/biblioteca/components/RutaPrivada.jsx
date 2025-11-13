import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaPrivada = ({ usuario, children }) => {
  return usuario ? children : <Navigate to="/login" />;
};

export default RutaPrivada;
