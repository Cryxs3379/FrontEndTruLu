/////esto para que al hacer logout no se guarde en localtorage y se vuelva a habliri bilbioteca 
import React, { createContext, useContext, useEffect, useState } from 'react';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')));

  useEffect(() => {
    const listener = () => {
      setUsuario(JSON.parse(localStorage.getItem('usuario')));
    };

    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  const login = (userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUsuario(userData);
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
