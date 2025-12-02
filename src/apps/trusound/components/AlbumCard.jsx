import React from 'react';

const AlbumCard = ({ album, isActive, onSelect }) => {
  const getInitials = (name) => {
    if (!name) return 'AL';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <button
      className={`album-card ${isActive ? 'active' : ''}`}
      onClick={() => onSelect?.(album)}
      type="button"
    >
      <div className="album-artwork">
        <span>{getInitials(album.name)}</span>
      </div>
      <div className="album-info">
        <h4>{album.name}</h4>
        <p>{album.track_count} {album.track_count === 1 ? 'canción' : 'canciones'}</p>
      </div>
    </button>
  );
};

export default AlbumCard;

