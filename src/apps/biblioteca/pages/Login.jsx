// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../api/api';
import { useAuth } from '../../../context/AuthContext';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const data = await loginRequest(email, contrasena);
      setAuth(data);
      onLogin?.(data);
      navigate('/biblioteca');
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Credenciales incorrectas';
      setError(message);
    }
  };

  return (
    <div style={styles.container}>
      {/* Panel informativo optimizado */}
      <div style={styles.left}>
        <h2 style={styles.heading}>🎬 Netflix de Bolsillo</h2>
        <p>
          Una aplicación fullstack desarrollada con el stack <strong>MERN</strong> (MongoDB, Express, React y Node.js)
          que replica funcionalidades de una plataforma de streaming.
        </p>

        <h3 style={styles.subheading}>🚀 Funcionalidades principales</h3>
        <ul>
          <li>Explora un catálogo dinámico de películas y accede a detalles completos.</li>
          <li>Marca tus películas favoritas y gestiona tu lista personal.</li>
          <li>Recomendaciones personalizadas basadas en títulos similares.</li>
          <li>Autenticación segura y gestión de sesión con rutas protegidas.</li>
          <li>Persistencia de datos y favoritos en MongoDB.</li>
        </ul>

        <h3 style={styles.subheading}>🛠️ Tecnologías utilizadas</h3>
        <ul>
          <li>Frontend: React, React Router, Bootstrap.</li>
          <li>Backend: Node.js y Express (API REST).</li>
          <li>Base de datos: MongoDB con listas personalizadas de favoritos.</li>
          <li>Gestión de estado: localStorage para la sesión y los favoritos.</li>
        </ul>

        <h3 style={styles.subheading}>🎯 ¿Qué aprendí con este proyecto?</h3>
        <ul>
          <li>Diseño de rutas protegidas y gestión de sesiones de usuario.</li>
          <li>Construcción de componentes reutilizables y escalables.</li>
          <li>Implementación de recomendaciones dinámicas.</li>
          <li>Uso de React Router para una experiencia SPA fluida.</li>
        </ul>

        <h3 style={styles.subheading}>🔑 Usuarios de prueba</h3>
        <ul>
          <li><code>usuariobiblioteca1@gmail.com / 123456</code></li>
          <li><code>usuariobiblioteca2@gmail.com / 123456</code></li>
        </ul>

        <p style={styles.summary}>
          Este proyecto demuestra mis habilidades fullstack y mi enfoque en la experiencia de usuario.
        </p>
      </div>

      {/* Formulario de inicio de sesión */}
      <div style={styles.right}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>🔐 Iniciar sesión</h2>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Entrar</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f7f7f7',
    flexWrap: 'wrap',
  },
  left: {
    flex: 1,
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #ddd',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    minWidth: '300px',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '300px',
    padding: '2rem',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '480px', // Aumentamos el ancho
  },
  title: {
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#333',
    fontSize: '2rem', // Título más grande
  },
  input: {
    padding: '0.9rem', // Inputs más grandes
    marginBottom: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '1.1rem',
    outline: 'none',
  },
  button: {
    padding: '0.9rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '1.2rem', // Botón más grande
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    marginTop: '1rem',
    color: '#dc3545',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heading: {
    color: '#333',
    marginBottom: '1rem',
  },
  subheading: {
    marginTop: '1.2rem',
    color: '#333',
  },
  summary: {
    marginTop: '1rem',
    fontStyle: 'italic',
    color: '#555',
  },
};

export default Login;
