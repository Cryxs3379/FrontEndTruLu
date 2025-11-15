import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  loginTruSound,
  logoutTruSound,
  getTruSoundSession,
  fetchArtists,
  fetchArtistTracks,
  buildTrackStreamUrl,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchMyPlaylists,
  fetchPublicPlaylists,
  createPlaylist,
  fetchPlaylistDetail,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
} from '../api/api';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import LoginPanel from '../components/LoginPanel';

const TABS = [
  { id: 'tracks', label: 'Canciones' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'my-playlists', label: 'Mis playlists' },
  { id: 'public-playlists', label: 'Playlists públicas' },
];

const TruSoundCloud = () => {
  const [session, setSession] = useState(getTruSoundSession());
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playQueue, setPlayQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [favoriteError, setFavoriteError] = useState(null);

  const [myPlaylists, setMyPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loadingMyPlaylists, setLoadingMyPlaylists] = useState(false);
  const [loadingPublicPlaylists, setLoadingPublicPlaylists] = useState(false);
  const [playlistError, setPlaylistError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [selectedPlaylistDetail, setSelectedPlaylistDetail] = useState(null);
  const [selectedPlaylistScope, setSelectedPlaylistScope] = useState('mine');
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState('');
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    is_public: true,
  });
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [selectedTab, setSelectedTab] = useState('tracks');

  useEffect(() => {
    if (!session?.token) return;
    loadArtists();
    loadFavorites();
    loadMyPlaylists();
    loadPublicPlaylists();
  }, [session?.token]);

  useEffect(() => {
    if (!actionMessage) return;
    const timeout = setTimeout(() => setActionMessage(null), 4000);
    return () => clearTimeout(timeout);
  }, [actionMessage]);

  useEffect(() => {
    if (!selectedPlaylistForAdd && myPlaylists.length) {
      setSelectedPlaylistForAdd(String(myPlaylists[0].id));
    }
  }, [myPlaylists, selectedPlaylistForAdd]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((track) => track.id)),
    [favorites],
  );

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

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      setFavoriteError(null);
      const data = await fetchFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Error cargando favoritos', err);
      setFavoriteError('No se pudieron cargar tus favoritos.');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const loadMyPlaylists = async () => {
    try {
      setLoadingMyPlaylists(true);
      setPlaylistError(null);
      const data = await fetchMyPlaylists();
      setMyPlaylists(data);
    } catch (err) {
      console.error('Error cargando mis playlists', err);
      setPlaylistError('No se pudieron cargar tus playlists.');
    } finally {
      setLoadingMyPlaylists(false);
    }
  };

  const loadPublicPlaylists = async () => {
    try {
      setLoadingPublicPlaylists(true);
      const data = await fetchPublicPlaylists();
      setPublicPlaylists(data);
    } catch (err) {
      console.error('Error cargando playlists públicas', err);
      setPlaylistError('No se pudieron cargar las playlists públicas.');
    } finally {
      setLoadingPublicPlaylists(false);
    }
  };

  const loadPlaylistDetail = async (playlistId, scope = 'mine') => {
    try {
      setPlaylistError(null);
      const detail = await fetchPlaylistDetail(playlistId);
      setSelectedPlaylistDetail(detail);
      setSelectedPlaylistScope(scope);
    } catch (err) {
      console.error('Error cargando playlist', err);
      setPlaylistError('No se pudo cargar la playlist seleccionada.');
    }
  };

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

  const playTrackAtIndex = (index, queue = playQueue) => {
    if (!queue || index < 0 || index >= queue.length) return;
    const nextTrack = queue[index];
    setPlayQueue(queue);
    setCurrentIndex(index);
    setCurrentTrack(nextTrack);
    setAudioUrl(buildTrackStreamUrl(nextTrack.id));
  };

  const handlePlayFromList = (list, index) => {
    playTrackAtIndex(index, list);
  };

  const handleNextTrack = () => {
    if (currentIndex == null || !playQueue.length) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= playQueue.length) return;
    playTrackAtIndex(nextIndex);
  };

  const handlePrevTrack = () => {
    if (currentIndex == null || !playQueue.length) return;
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return;
    playTrackAtIndex(prevIndex);
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
    setFavorites([]);
    setMyPlaylists([]);
    setPublicPlaylists([]);
    setSelectedPlaylistDetail(null);
    setSelectedPlaylistForAdd('');
    setAudioUrl(null);
    setCurrentTrack(null);
    setSelectedTab('tracks');
  };

  const handleToggleFavorite = async (track) => {
    try {
      if (favoriteIds.has(track.id)) {
        await removeFavorite(track.id);
      } else {
        await addFavorite(track.id);
      }
      await loadFavorites();
    } catch (err) {
      console.error('Error actualizando favoritos', err);
      setFavoriteError('No se pudo actualizar la lista de favoritos.');
    }
  };

  const handleAddTrackToPlaylist = async (track) => {
    if (!selectedPlaylistForAdd) {
      setPlaylistError('Selecciona una playlist para añadir canciones.');
      return;
    }
    try {
      setPlaylistError(null);
      const playlistId = Number(selectedPlaylistForAdd);
      await addTrackToPlaylist(playlistId, track.id);
      setActionMessage('Canción añadida a la playlist.');
      if (selectedPlaylistDetail?.playlist?.id === playlistId) {
        await loadPlaylistDetail(playlistId, selectedPlaylistScope);
      }
    } catch (err) {
      console.error('Error añadiendo canción a playlist', err);
      const message =
        err?.response?.data?.message ||
        'No pudimos añadir la canción a la playlist.';
      setPlaylistError(message);
    }
  };

  const handleRemoveTrackFromPlaylist = async (track) => {
    const playlistId = selectedPlaylistDetail?.playlist?.id;
    if (!playlistId) return;
    try {
      await removeTrackFromPlaylist(playlistId, track.id);
      setActionMessage('Canción eliminada de la playlist.');
      await loadPlaylistDetail(playlistId, selectedPlaylistScope);
    } catch (err) {
      console.error('Error quitando canción de playlist', err);
      setPlaylistError('No se pudo quitar la canción de la playlist.');
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim()) {
      setPlaylistError('El nombre de la playlist es obligatorio.');
      return;
    }
    try {
      setCreatingPlaylist(true);
      setPlaylistError(null);
      const payload = {
        name: newPlaylist.name.trim(),
        description: newPlaylist.description.trim()
          ? newPlaylist.description.trim()
          : undefined,
        is_public: newPlaylist.is_public,
      };
      await createPlaylist(payload);
      setActionMessage('Playlist creada correctamente.');
      setNewPlaylist({ name: '', description: '', is_public: true });
      await loadMyPlaylists();
    } catch (err) {
      console.error('Error creando playlist', err);
      setPlaylistError('No se pudo crear la playlist.');
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const handleSelectPlaylistCard = async (playlist, scope) => {
    setSelectedPlaylistDetail(null);
    await loadPlaylistDetail(playlist.id, scope);
  };

  const handleDeletePlaylist = async (playlistId) => {
    const confirmDelete = window.confirm(
      '¿Eliminar esta playlist? No se puede deshacer.',
    );
    if (!confirmDelete) return;
    try {
      await deletePlaylist(playlistId);
      setActionMessage('Playlist eliminada.');
      await loadMyPlaylists();
      if (selectedPlaylistDetail?.playlist?.id === playlistId) {
        setSelectedPlaylistDetail(null);
      }
    } catch (err) {
      console.error('Error eliminando playlist', err);
      setPlaylistError('No se pudo eliminar la playlist.');
    }
  };

  const subtitle = useMemo(() => {
    if (!selectedArtist) return 'Selecciona un artista para empezar.';
    return `${selectedArtist.name} · ${tracks.length} canciones disponibles`;
  }, [selectedArtist, tracks.length]);

  const playlistTracks = selectedPlaylistDetail?.tracks ?? [];
  const canEditPlaylist =
    selectedPlaylistScope === 'mine' &&
    selectedPlaylistDetail?.playlist?.user_id === session?.user?.id;

  const renderTrackList = (
    list,
    {
      enableAdd = false,
      enableRemove = false,
      playSourceList = list,
    } = {},
  ) => (
    <div className="tracks-panel">
      {list.length === 0 && <p>No hay canciones disponibles.</p>}
      {list.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          isActive={track.id === currentTrack?.id}
          onPlay={() => handlePlayFromList(playSourceList, index)}
          isFavorite={favoriteIds.has(track.id)}
          onToggleFavorite={handleToggleFavorite}
          onAddToPlaylist={
            enableAdd && myPlaylists.length
              ? () => handleAddTrackToPlaylist(track)
              : undefined
          }
          onRemoveFromPlaylist={
            enableRemove ? () => handleRemoveTrackFromPlaylist(track) : undefined
          }
        />
      ))}
    </div>
  );

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
          <div className="tab-bar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={selectedTab === tab.id ? 'active' : ''}
                onClick={() => {
                  setSelectedTab(tab.id);
                  if (tab.id === 'my-playlists') {
                    setSelectedPlaylistScope('mine');
                  } else if (tab.id === 'public-playlists') {
                    setSelectedPlaylistScope('public');
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {actionMessage && <p className="success">{actionMessage}</p>}
          {playlistError && <p className="error">{playlistError}</p>}

          {selectedTab === 'tracks' && (
            <>
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

              {myPlaylists.length > 0 && (
                <div className="add-playlist-widget">
                  <label htmlFor="playlistSelect">
                    Selecciona una playlist para añadir canciones:
                  </label>
                  <select
                    id="playlistSelect"
                    value={selectedPlaylistForAdd}
                    onChange={(e) => setSelectedPlaylistForAdd(e.target.value)}
                  >
                    <option value="">-- Selecciona --</option>
                    {myPlaylists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name}
                        {playlist.is_public ? ' · Pública' : ' · Privada'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {renderTrackList(tracks, { enableAdd: true, playSourceList: tracks })}
            </>
          )}

          {selectedTab === 'favorites' && (
            <div className="favorites-panel">
              <h3>Mis favoritos</h3>
              {loadingFavorites && <p>Cargando favoritos...</p>}
              {favoriteError && <p className="error">{favoriteError}</p>}
              {!loadingFavorites && favorites.length === 0 && (
                <p>Todavía no tienes canciones favoritas.</p>
              )}
              {renderTrackList(favorites, {
                enableAdd: true,
                playSourceList: favorites,
              })}
            </div>
          )}

          {selectedTab === 'my-playlists' && (
            <div className="playlist-layout">
              <div className="playlist-column">
                <h3>Mis playlists</h3>
                {loadingMyPlaylists && <p>Cargando...</p>}
                <div className="playlist-list">
                  {myPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`playlist-card ${
                        selectedPlaylistDetail?.playlist?.id === playlist.id &&
                        selectedPlaylistScope === 'mine'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleSelectPlaylistCard(playlist, 'mine')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectPlaylistCard(playlist, 'mine');
                      }}
                    >
                      <div>
                        <h4>{playlist.name}</h4>
                        <small>
                          {playlist.is_public ? 'Pública' : 'Privada'} ·{' '}
                          {new Date(playlist.created_at).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="playlist-actions">
                        <button
                          type="button"
                          className="icon-btn remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(playlist.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {!loadingMyPlaylists && myPlaylists.length === 0 && (
                    <p>Aún no has creado playlists.</p>
                  )}
                </div>

                <form className="playlist-form" onSubmit={handleCreatePlaylist}>
                  <h4>Crear playlist</h4>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newPlaylist.name}
                    onChange={(e) =>
                      setNewPlaylist((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={newPlaylist.description}
                    onChange={(e) =>
                      setNewPlaylist((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={newPlaylist.is_public}
                      onChange={(e) =>
                        setNewPlaylist((prev) => ({
                          ...prev,
                          is_public: e.target.checked,
                        }))
                      }
                    />
                    Playlist pública
                  </label>
                  <button type="submit" disabled={creatingPlaylist}>
                    {creatingPlaylist ? 'Creando...' : 'Crear playlist'}
                  </button>
                </form>
              </div>

              <div className="playlist-detail">
                {selectedPlaylistDetail && selectedPlaylistScope === 'mine' ? (
                  <>
                    <header>
                      <div>
                        <p className="eyebrow">Playlist seleccionada</p>
                        <h3>{selectedPlaylistDetail.playlist.name}</h3>
                        <small>
                          {selectedPlaylistDetail.playlist.is_public
                            ? 'Pública'
                            : 'Privada'}{' '}
                          · {selectedPlaylistDetail.playlist.owner_email}
                        </small>
                      </div>
                    </header>
                    {renderTrackList(playlistTracks, {
                      enableRemove: canEditPlaylist,
                      enableAdd: false,
                      playSourceList: playlistTracks,
                    })}
                  </>
                ) : (
                  <p>Selecciona una playlist para ver sus canciones.</p>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'public-playlists' && (
            <div className="playlist-layout">
              <div className="playlist-column">
                <h3>Playlists públicas</h3>
                {loadingPublicPlaylists && <p>Cargando...</p>}
                <div className="playlist-list">
                  {publicPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className={`playlist-card ${
                        selectedPlaylistDetail?.playlist?.id === playlist.id &&
                        selectedPlaylistScope === 'public'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleSelectPlaylistCard(playlist, 'public')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSelectPlaylistCard(playlist, 'public');
                      }}
                    >
                      <div>
                        <h4>{playlist.name}</h4>
                        <small>{playlist.owner_email}</small>
                      </div>
                    </div>
                  ))}
                  {!loadingPublicPlaylists && publicPlaylists.length === 0 && (
                    <p>No hay playlists públicas disponibles.</p>
                  )}
                </div>
              </div>

              <div className="playlist-detail">
                {selectedPlaylistDetail && selectedPlaylistScope === 'public' ? (
                  <>
                    <header>
                      <div>
                        <p className="eyebrow">Playlist pública</p>
                        <h3>{selectedPlaylistDetail.playlist.name}</h3>
                        <small>
                          Por {selectedPlaylistDetail.playlist.owner_email}
                        </small>
                      </div>
                    </header>
                    {renderTrackList(playlistTracks, {
                      playSourceList: playlistTracks,
                    })}
                  </>
                ) : (
                  <p>Selecciona una playlist pública para ver su contenido.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {currentTrack && (
        <footer className="player-bar">
          <div className="track-meta">
            <strong>{currentTrack.title}</strong>
            <span>{selectedArtist?.name}</span>
          </div>
          <div className="player-controls">
            <button
              type="button"
              onClick={handlePrevTrack}
              className="control-btn"
              disabled={currentIndex === 0}
            >
              ⏮
            </button>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              autoPlay
              preload="metadata"
              onEnded={handleNextTrack}
            />
            <button
              type="button"
              onClick={handleNextTrack}
              className="control-btn"
              disabled={
                currentIndex == null ||
                currentIndex >= playQueue.length - 1 ||
                !playQueue.length
              }
            >
              ⏭
            </button>
          </div>
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

        .tab-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tab-bar button {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          border-radius: 999px;
          padding: 0.4rem 1rem;
          cursor: pointer;
          font-weight: 500;
        }

        .tab-bar button.active {
          background: #22d3ee;
          color: #0f172a;
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
          grid-template-columns: auto 1fr auto auto;
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

        .track-actions {
          display: flex;
          gap: 0.4rem;
        }

        .icon-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 10px;
          padding: 0.2rem 0.5rem;
          color: #fff;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s, border 0.2s;
        }

        .icon-btn.heart.active {
          border-color: #f87171;
        }

        .icon-btn.add {
          border-color: #34d399;
        }

        .icon-btn.remove {
          border-color: #f87171;
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

        .player-controls {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
        }

        .control-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
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

        .success {
          color: #34d399;
          font-weight: 500;
        }

        .favorites-panel,
        .playlist-layout {
          background: rgba(15,23,42,0.45);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .playlist-layout {
          display: flex;
          gap: 1.5rem;
        }

        .playlist-column {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .playlist-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .playlist-card {
          border-radius: 14px;
          padding: 0.9rem 1rem;
          background: rgba(255,255,255,0.05);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .playlist-card.active {
          background: rgba(99,102,241,0.3);
        }

        .playlist-detail {
          flex: 1;
          background: rgba(15,23,42,0.35);
          border-radius: 18px;
          padding: 1.5rem;
          min-height: 300px;
        }

        .playlist-form {
          background: rgba(255,255,255,0.03);
          border-radius: 14px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .playlist-form input,
        .playlist-form textarea,
        .add-playlist-widget select {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 0.6rem 0.8rem;
          color: #fff;
        }

        .playlist-form textarea {
          min-height: 80px;
          resize: vertical;
        }

        .playlist-form button,
        .add-playlist-widget select {
          font-family: inherit;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
        }

        .add-playlist-widget {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .playlist-detail header {
          margin-bottom: 1rem;
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

          .playlist-layout {
            flex-direction: column;
          }

          .playlist-column {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TruSoundCloud;

