import React from 'react';

const ArtistCard = ({ artist, isActive, onSelect }) => (
  <button
    className={`artist-card ${isActive ? 'active' : ''}`}
    onClick={() => onSelect?.(artist)}
    type="button"
  >
    <div className="artwork">
      <span>{artist.name?.slice(0, 2).toUpperCase()}</span>
    </div>
    <div className="info">
      <h4>{artist.name}</h4>
      <p>{artist.description || 'Sin descripción'}</p>
    </div>
  </button>
);

export default ArtistCard;

