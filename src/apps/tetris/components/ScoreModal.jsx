import React, { useState } from 'react';

const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: '#fff', padding: '2rem', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', width: '90%', maxWidth: '400px',
    textAlign: 'center'
  },
  input: {
    padding: '10px', fontSize: '1rem', width: '100%', marginBottom: '1rem'
  },
  button: {
    padding: '10px 20px', backgroundColor: '#28a745',
    color: 'white', fontWeight: 'bold', border: 'none',
    borderRadius: '5px', cursor: 'pointer'
  }
};

export default function ScoreModal({ score, onSave }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2>¡Felicidades! 🎉</h2>
        <p>Has hecho {score} puntos. Ingresa tu nombre:</p>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={modalStyles.input}
        />
        <button onClick={handleSubmit} style={modalStyles.button}>
          Guardar Puntuación
        </button>
      </div>
    </div>
  );
}
