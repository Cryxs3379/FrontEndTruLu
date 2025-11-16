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
    <div className="login-container">
      <form className="login-panel" onSubmit={handleSubmit}>
        <div className="login-header">
          <h2>🎧 TruSoundCloud</h2>
          <p>Inicia sesión para acceder a tu biblioteca musical</p>
        </div>
        <div className="login-fields">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          {errorMessage && <div className="login-error">{errorMessage}</div>}
        </div>
        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? 'Conectando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPanel;

