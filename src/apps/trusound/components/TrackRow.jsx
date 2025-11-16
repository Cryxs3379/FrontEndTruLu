import React, { useRef } from 'react';

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '–';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Icon = ({ path, size = 20 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden
    focusable="false"
  >
    <path
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrackRow = ({
  track,
  isActive,
  isPlaying = false,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(diff) < 45) return;
    if (diff < 0) onSwipeLeft?.(track);
    else onSwipeRight?.(track);
  };

  return (
    <div
      className={`track-row ${isActive ? 'active' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={() => onPlay?.()}
        className="play-btn"
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? (
          <Icon path="M9 5v14M15 5v14" />
        ) : (
          <Icon path="M7 4l12 8-12 8z" />
        )}
      </button>
      <div className="track-info">
        <h5>{track.title}</h5>
        <small>{track.year ?? 's/f'}</small>
      {isActive && (
        <div className="eq-bars" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      )}
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
            aria-label="Favorito"
          >
            {isFavorite ? (
              <Icon
                path="M12 21s-6-4.35-6-9.5S8.5 3 12 6.5 18 3 18 11.5 12 21 12 21z"
              />
            ) : (
              <Icon path="M12 21s-6-4.35-6-9.5S8.5 3 12 6.5 18 3 18 11.5 12 21 12 21z" />
            )}
          </button>
        )}
        {onAddToPlaylist && (
          <button
            type="button"
            className="icon-btn add"
            onClick={() => onAddToPlaylist(track)}
            aria-label="Añadir a playlist"
          >
            <Icon path="M12 5v14M5 12h14" />
          </button>
        )}
        {onRemoveFromPlaylist && (
          <button
            type="button"
            className="icon-btn remove"
            onClick={() => onRemoveFromPlaylist(track)}
            aria-label="Quitar de playlist"
          >
            <Icon path="M5 6h14M10 11v6M14 11v6M9 6V4h6v2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TrackRow;

