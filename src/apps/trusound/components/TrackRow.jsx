import React from 'react';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '–';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrackRow = ({
  track,
  isActive,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) => (
  <div className={`track-row ${isActive ? 'active' : ''}`}>
    <button type="button" onClick={() => onPlay?.(track)} className="play-btn">
      {isActive ? '⏸️' : '▶️'}
    </button>
    <div className="track-info">
      <h5>{track.title}</h5>
      <small>{track.year ?? 's/f'}</small>
    </div>
    <div className="track-meta">
      <span>{(track.size / (1024 * 1024)).toFixed(1)} MB</span>
      <span>{formatDuration(track.duration_seconds)}</span>
    </div>
    <div className="track-actions">
      {onToggleFavorite && (
        <button
          type="button"
          className={`icon-btn heart ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(track)}
          aria-label="Toggle favorite"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}
      {onAddToPlaylist && (
        <button
          type="button"
          className="icon-btn add"
          onClick={() => onAddToPlaylist(track)}
          aria-label="Add to playlist"
        >
          ➕
        </button>
      )}
      {onRemoveFromPlaylist && (
        <button
          type="button"
          className="icon-btn remove"
          onClick={() => onRemoveFromPlaylist(track)}
          aria-label="Remove from playlist"
        >
          🗑️
        </button>
      )}
    </div>
  </div>
);

export default TrackRow;

