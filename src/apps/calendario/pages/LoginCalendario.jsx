import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCalendario } from '../api/apiCalendario';

const LoadingOverlay = ({ visible, text = 'Iniciando sesión…' }) => {
  if (!visible) return null;
  return (
    <div style={overlayStyles.backdrop} aria-live="polite" aria-busy="true">
      {/* Spinner SVG con animación propia (sin CSS externo) */}
      <svg width="72" height="72" viewBox="0 0 50 50" role="img" aria-label="Cargando">
        <circle cx="25" cy="25" r="20" stroke="#0d6efd" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.2"/>
        <path d="M25 5 a20 20 0 0 1 0 40" stroke="#0d6efd" strokeWidth="5" fill="none" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/>
        </path>
      </svg>
      <div style={overlayStyles.text}>{text}</div>
    </div>
  );
};

const LoginCalendario = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await loginCalendario(email, password);
      localStorage.setItem('tokenCalendario', token);
      localStorage.setItem('userCalendario', JSON.stringify(user));
      navigate('/homecalendario');
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <LoadingOverlay visible={loading} />

      {/* Panel informativo */}
      <div style={styles.left}>
        <h2 style={styles.heading}>📅 Calendario colaborativo con historial de acciones</h2>
        <p>
          Aplicación web para gestionar eventos colaborativos, con historial en vivo.
          Stack <strong>MERN</strong> + FullCalendar.
        </p>

        <h3 style={styles.subheading}>🚀 Funcionalidades</h3>
        <ul>
          <li>Permisos por rol: <code>editor</code> / <code>viewer</code>.</li>
          <li>Crear, editar, mover y eliminar (solo editor).</li>
          <li>Historial en vivo y autenticación JWT.</li>
        </ul>

        <h3 style={styles.subheading}>🔑 Usuarios de prueba</h3>
        <ul>
          <li><code>prueba1@gmail.com / 123456</code> (editor)</li>
          <li><code>prueba4@gmail.com / 123456</code> (viewer)</li>
        </ul>
      </div>

      {/* Formulario */}
      <div style={styles.right}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>🔐 Iniciar sesión</h2>
          <input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

const overlayStyles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255,255,255,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#0d6efd',
    fontWeight: 600,
  },
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
    maxWidth: '480px',
  },
  title: {
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#333',
    fontSize: '2rem',
  },
  input: {
    padding: '0.9rem',
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
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    marginTop: '1rem',
    color: '#dc3545',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heading: { color: '#333', marginBottom: '1rem' },
  subheading: { marginTop: '1.2rem', color: '#333' },
};

export default LoginCalendario;



