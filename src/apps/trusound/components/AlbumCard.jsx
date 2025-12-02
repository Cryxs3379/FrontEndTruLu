import React from 'react';

const AlbumCard = ({ album, isActive, onSelect }) => (
  <button
    className={`album-card ${isActive ? 'active' : ''}`}
    onClick={() => onSelect?.(album)}
    type="button"
  >
    <div className="album-artwork">
      <span>{album.name?.slice(0, 2).toUpperCase() || 'AL'}</span>
    </div>
    <div className="album-info">
      <h4>{album.name}</h4>
      <p>{album.track_count} {album.track_count === 1 ? 'canción' : 'canciones'}</p>
    </div>
  </button>
);

export default AlbumCard;

