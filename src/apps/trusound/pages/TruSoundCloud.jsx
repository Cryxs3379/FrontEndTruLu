import React, { useEffect, useMemo, useState } from 'react';
import {
  loginTruSound,
  logoutTruSound,
  getTruSoundSession,
  fetchArtists,
  fetchArtistTracks,
  buildTrackStreamUrl,
} from '../api/api';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import LoginPanel from '../components/LoginPanel';

const TruSoundCloud = () => {
  const [session, setSession] = useState(getTruSoundSession());
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (!session?.token) return;

    const loadArtists = async () => {
      try {
        setLoadingArtists(true);
        setErrorMessage(null);
        const data = await fetchArtists();
        setArtists(data);
        if (data.length) {
          handleSelectArtist(data[0]);
        } else {
          setSelectedArtist(null);
          setTracks([]);
        }
      } catch (err) {
        console.error('Error cargando artistas', err);
        setErrorMessage('No se pudieron cargar los artistas.');
      } finally {
        setLoadingArtists(false);
      }
    };

    loadArtists();
  }, [session?.token]);

  const handleSelectArtist = async (artist) => {
    setSelectedArtist(artist);
    setTracks([]);
    setLoadingTracks(true);
    try {
      const data = await fetchArtistTracks(artist.id);
      setTracks(data);
    } catch (err) {
      console.error('Error cargando tracks', err);
      setErrorMessage('No se pudieron cargar las canciones de este artista.');
    } finally {
      setLoadingTracks(false);
    }
  };

  const handlePlayTrack = async (track) => {
    setCurrentTrack(track);
    setAudioUrl(buildTrackStreamUrl(track.id));
  };

  const handleLogin = async ({ email, password }) => {
    try {
      setLoginError(null);
      const data = await loginTruSound(email, password);
      setSession(data);
    } catch (err) {
      console.error('Login TruSound fallido', err);
      const message = err?.response?.data?.message || 'Credenciales incorrectas';
      setLoginError(message);
    }
  };

  const handleLogout = () => {
    logoutTruSound();
    setSession(null);
    setArtists([]);
    setTracks([]);
    setAudioUrl(null);
    setCurrentTrack(null);
  };

  const subtitle = useMemo(() => {
    if (!selectedArtist) return 'Selecciona un artista para empezar.';
    return `${selectedArtist.name} · ${tracks.length} canciones disponibles`;
  }, [selectedArtist, tracks.length]);

  return (
    <div className="trusound-page">
      <nav className="trusound-nav">
        <div>
          <h1>TruSoundCloud</h1>
          <p>Tu colección musical auto-hosted</p>
        </div>
        {session?.user ? (
          <button className="ghost" onClick={handleLogout} type="button">
            Cerrar sesión · {session.user.email}
          </button>
        ) : null}
      </nav>

      {!session?.token && (
        <div className="login-overlay">
          <LoginPanel onSubmit={handleLogin} errorMessage={loginError} />
        </div>
      )}

      <main className="trusound-layout">
        <aside className="sidebar">
          <h3>Artistas</h3>
          {loadingArtists && <p>Cargando artistas...</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}
          <div className="artist-list">
            {artists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                isActive={artist.id === selectedArtist?.id}
                onSelect={handleSelectArtist}
              />
            ))}
            {!loadingArtists && artists.length === 0 && (
              <p>No hay artistas registrados todavía.</p>
            )}
          </div>
        </aside>

        <section className="content">
          <header className="hero">
            <div>
              <p className="eyebrow">PLAYLIST DESTACADA</p>
              <h2>{selectedArtist?.name || 'Explora TruSoundCloud'}</h2>
              <p>{subtitle}</p>
            </div>
            {selectedArtist && (
              <button
                type="button"
                className="primary"
                onClick={() => handleSelectArtist(selectedArtist)}
                disabled={loadingTracks}
              >
                {loadingTracks ? 'Actualizando...' : 'Actualizar lista'}
              </button>
            )}
          </header>

          <div className="tracks-panel">
            {loadingTracks && <p>Cargando canciones...</p>}
            {!loadingTracks && tracks.length === 0 && (
              <p>Este artista todavía no tiene canciones.</p>
            )}
            {tracks.map((track) => (
              <TrackRow
                key={track.id}
                track={track}
                isActive={track.id === currentTrack?.id}
                onPlay={handlePlayTrack}
              />
            ))}
          </div>
        </section>
      </main>

      {currentTrack && (
        <footer className="player-bar">
          <div className="track-meta">
            <strong>{currentTrack.title}</strong>
            <span>{selectedArtist?.name}</span>
          </div>
          <audio src={audioUrl} controls autoPlay preload="metadata" />
        </footer>
      )}

      <style>{`
        .trusound-page {
          min-height: 100vh;
          background: radial-gradient(circle at top, #1f2937, #0f172a 70%);
          color: #fff;
          font-family: 'Poppins', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .trusound-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
        }

        .trusound-nav h1 {
          margin: 0;
          font-size: 1.8rem;
        }

        .trusound-layout {
          display: flex;
          padding: 0 3rem 3rem;
          gap: 1.5rem;
        }

        .sidebar {
          width: 320px;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          padding: 1.5rem;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .artist-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .artist-card {
          border: none;
          text-align: left;
          padding: 1rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          cursor: pointer;
          display: flex;
          gap: 1rem;
          align-items: center;
          transition: transform 0.2s, background 0.2s;
        }

        .artist-card.active,
        .artist-card:hover {
          background: rgba(99, 102, 241, 0.25);
          transform: translateX(4px);
        }

        .artist-card .artwork {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(145deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .artist-card .info h4 {
          margin: 0;
          font-size: 1rem;
        }

        .artist-card .info p {
          margin: 0;
          font-size: 0.85rem;
          color: #cbd5f5;
        }

        .content {
          flex: 1;
          background: rgba(15, 23, 42, 0.55);
          border-radius: 24px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(120deg, rgba(99,102,241,0.6), rgba(14,165,233,0.6));
          border-radius: 20px;
          padding: 2rem;
        }

        .hero .eyebrow {
          letter-spacing: 2px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.8);
        }

        .hero h2 {
          margin: 0.3rem 0;
          font-size: 2rem;
        }

        .hero p {
          margin: 0;
          color: rgba(255,255,255,0.85);
        }

        .tracks-panel {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .track-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1.2rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
        }

        .track-row.active {
          background: rgba(99, 102, 241, 0.25);
        }

        .play-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .track-info h5 {
          margin: 0;
        }

        .track-info small {
          color: rgba(255,255,255,0.6);
        }

        .track-meta {
          display: flex;
          gap: 0.8rem;
          color: rgba(255,255,255,0.75);
        }

        .player-bar {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 1rem;
          width: min(900px, calc(100% - 2rem));
          background: rgba(15,23,42,0.9);
          backdrop-filter: blur(10px);
          padding: 0.8rem 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .player-bar audio {
          flex: 1;
        }

        .ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 20px;
          padding: 0.4rem 1rem;
          color: #fff;
          cursor: pointer;
        }

        .primary {
          background: #22d3ee;
          border: none;
          color: #0f172a;
          border-radius: 999px;
          padding: 0.6rem 1.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .login-panel {
          background: rgba(15, 23, 42, 0.95);
          border-radius: 20px;
          padding: 2rem;
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .login-panel input {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          color: #fff;
        }

        .login-panel button {
          background: linear-gradient(135deg, #34d399, #10b981);
          border: none;
          border-radius: 999px;
          padding: 0.7rem;
          font-weight: 600;
          cursor: pointer;
        }

        .login-panel .error,
        .error {
          color: #f87171;
        }

        @media (max-width: 960px) {
          .trusound-layout {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            max-height: none;
          }
          .player-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .track-row {
            grid-template-columns: 1fr;
          }
          .track-meta {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default TruSoundCloud;

