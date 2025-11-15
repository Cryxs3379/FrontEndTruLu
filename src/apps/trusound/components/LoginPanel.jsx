import React, { useState } from 'react';

const LoginPanel = ({ onSubmit, errorMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await onSubmit?.({ email, password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-panel" onSubmit={handleSubmit}>
      <h3>TruSoundCloud</h3>
      <p>Inicia sesión para acceder a tu biblioteca musical.</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {errorMessage && <span className="error">{errorMessage}</span>}
      <button type="submit" disabled={loading}>
        {loading ? 'Conectando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginPanel;

