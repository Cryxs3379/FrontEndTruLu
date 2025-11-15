import React from 'react';
import { useNavigate } from 'react-router-dom';

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return 'Tamaño desconocido';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
};

const MovieCard = ({ pelicula, onPlay, isPlaying = false }) => {
  const navigate = useNavigate();

  const handleClickDetalle = () => {
    navigate(`/pelicula/${pelicula.id}`);
  };

  const handlePlay = (event) => {
    event.stopPropagation();
    onPlay?.(pelicula);
  };

  return (
    <div
      className="card h-100 shadow-sm"
      style={{ cursor: 'pointer', borderRadius: '14px', overflow: 'hidden' }}
      onClick={handleClickDetalle}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1d4ed8)',
          color: '#fff',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
          {pelicula.year || 'Sin año'}
        </span>
        <h5 style={{ marginBottom: 0 }}>{pelicula.title}</h5>
      </div>

      <div className="card-body d-flex flex-column">
        <p className="mb-1 text-muted">
          Archivo: <strong>{pelicula.filename}</strong>
        </p>
        <p className="mb-1 text-muted">
          Peso: <strong>{formatSize(pelicula.size)}</strong>
        </p>
        <p className="text-muted mb-3">
          Subido: {new Date(pelicula.created_at).toLocaleString()}
        </p>
        <button
          onClick={handlePlay}
          type="button"
          className="btn btn-primary mt-auto"
          disabled={isPlaying}
        >
          {isPlaying ? 'Preparando vídeo…' : '▶️ Ver ahora'}
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
