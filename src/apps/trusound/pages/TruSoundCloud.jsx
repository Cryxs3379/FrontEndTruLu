import React, { useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import {
  loginTruSound,
  logoutTruSound,
  getTruSoundSession,
  fetchArtists,
  fetchArtistTracks,
  fetchArtistAlbums,
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
import AlbumCard from '../components/AlbumCard';
import TrackRow from '../components/TrackRow';
import LoginPanel from '../components/LoginPanel';

const TABS = [
  { id: 'tracks', label: 'Canciones' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'my-playlists', label: 'Mis playlists' },
  { id: 'public-playlists', label: 'Playlists públicas' },
];

const generatePalette = (seed = 'TruSoundCloud') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return [
    `hsl(${(h + 360) % 360}, 85%, 65%)`,
    `hsl(${(h + 30) % 360}, 70%, 52%)`,
    `hsl(${(h + 60) % 360}, 75%, 55%)`,
  ];
};

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const formatDuration = (seconds = 0) => {
  if (!Number.isFinite(seconds) || !seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const TruSoundCloud = () => {
  const [session, setSession] = useState(getTruSoundSession());
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playQueue, setPlayQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queuePanelOpen, setQueuePanelOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((track) => track.id)),
    [favorites],
  );

  const activeArtistName = useMemo(() => {
    if (currentTrack?.artist_name) return currentTrack.artist_name;
    if (currentTrack?.artist_id) {
      const artist = artists.find((item) => item.id === currentTrack.artist_id);
      if (artist) return artist.name;
    }
    return selectedArtist?.name || session?.user?.email || 'TruSoundCloud';
  }, [artists, currentTrack, selectedArtist, session]);

  const [accent1, accent2, accent3] = useMemo(
    () => generatePalette(activeArtistName || currentTrack?.title || 'TruSoundCloud'),
    [activeArtistName, currentTrack],
  );

  const themeVars = useMemo(
    () => ({
      '--accent-1': accent1,
      '--accent-2': accent2,
      '--accent-3': accent3,
    }),
    [accent1, accent2, accent3],
  );

  const artworkInitial = (currentTrack?.title || activeArtistName || 'T')
    .slice(0, 1)
    .toUpperCase();
  const artworkStyle = {
    background: `linear-gradient(135deg, ${accent1}, ${accent2})`,
  };
  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 0;
  const displayProgress = safeDuration
    ? Math.min(progress, safeDuration)
    : 0;

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
    setAlbums([]);
    setSelectedAlbum(null);
    setTracks([]);
    setLoadingAlbums(true);
    try {
      const data = await fetchArtistAlbums(artist.id);
      setAlbums(data);
    } catch (err) {
      console.error('Error cargando álbumes', err);
      setErrorMessage('No se pudieron cargar los álbumes de este artista.');
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
    setTracks(album.tracks || []);
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

  const handleSeek = (value) => {
    if (!audioRef.current) return;
    const durationValue = audioRef.current.duration || 0;
    const nextTime = Math.max(0, Math.min(Number(value), durationValue));
    audioRef.current.currentTime = nextTime;
    setProgress(nextTime);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  // Media Session API para controles en pantalla bloqueada
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    const updateMediaSession = () => {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: activeArtistName,
        album: currentTrack.album || selectedAlbum?.name || '',
        artwork: [],
      });

      // Configurar acciones de Media Session
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current?.paused) {
          audioRef.current.play();
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (!audioRef.current?.paused) {
          audioRef.current.pause();
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextTrack();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audioRef.current) {
          const skipTime = details.seekOffset || 10;
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration,
            audioRef.current.currentTime + skipTime
          );
        }
      });
    };

    updateMediaSession();

    // Actualizar posición de reproducción
    const updatePositionState = () => {
      if (audioRef.current && 'setPositionState' in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audioRef.current.duration || 0,
            playbackRate: audioRef.current.playbackRate || 1,
            position: audioRef.current.currentTime || 0,
          });
        } catch (e) {
          // Algunos navegadores no soportan setPositionState
        }
      }
    };

    const interval = setInterval(updatePositionState, 1000);

    return () => {
      clearInterval(interval);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [currentTrack, activeArtistName, selectedAlbum, handlePrevTrack, handleNextTrack]);

  const handleQueueDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(playQueue);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    let newIndex = currentIndex;
    if (result.source.index === currentIndex) {
      newIndex = result.destination.index;
    } else if (
      currentIndex != null &&
      result.source.index < currentIndex &&
      result.destination.index >= currentIndex
    ) {
      newIndex -= 1;
    } else if (
      currentIndex != null &&
      result.source.index > currentIndex &&
      result.destination.index <= currentIndex
    ) {
      newIndex += 1;
    }

    setPlayQueue(reordered);
    setCurrentIndex(newIndex);
  };

  const handleSwipeLeft = (track) => {
    if (selectedPlaylistForAdd) {
      handleAddTrackToPlaylist(track);
    }
  };

  const handleSwipeRight = (track) => {
    handleToggleFavorite(track);
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
    setAlbums([]);
    setSelectedAlbum(null);
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
    if (!selectedAlbum) {
      const totalTracks = albums.reduce((sum, album) => sum + (album.track_count || 0), 0);
      return `${selectedArtist.name} · ${albums.length} álbumes · ${totalTracks} canciones`;
    }
    return `${selectedAlbum.name} · ${tracks.length} canciones`;
  }, [selectedArtist, selectedAlbum, albums, tracks.length]);

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
      {list.map((track, index) => {
        const isActiveTrack = track.id === currentTrack?.id;
        const handleTrackPlay = () => {
          if (isActiveTrack && isPlaying) {
            togglePlayback();
          } else {
            handlePlayFromList(playSourceList, index);
          }
        };
        return (
          <TrackRow
            key={track.id}
            track={track}
            isActive={isActiveTrack}
            isPlaying={isActiveTrack && isPlaying}
            onPlay={handleTrackPlay}
            isFavorite={favoriteIds.has(track.id)}
            onToggleFavorite={handleToggleFavorite}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onAddToPlaylist={
              enableAdd && myPlaylists.length
                ? () => handleAddTrackToPlaylist(track)
                : undefined
            }
            onRemoveFromPlaylist={
              enableRemove ? () => handleRemoveTrackFromPlaylist(track) : undefined
            }
          />
        );
      })}
    </div>
  );

  return (
    <div className="trusound-page" style={themeVars}>
      <nav className="trusound-nav">
        <div className="brand">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                d="M4 6h16M4 12h12M4 18h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div>
            <h1>TruSoundCloud</h1>
            <p>Stream privado con estilo</p>
          </div>
        </div>
        {session?.user ? (
          <button className="ghost" onClick={handleLogout} type="button">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path
                d="M15 3h4v18h-4M10 17l5-5-5-5M3 12h12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {session.user.email}
          </button>
        ) : null}
      </nav>

      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {!session?.token && (
        <div className="login-overlay">
          <LoginPanel onSubmit={handleLogin} errorMessage={loginError} />
        </div>
      )}

      <main className={`trusound-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <aside className={`sidebar ${sidebarOpen ? 'visible' : ''}`}>
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
          <div className="content-header">
            <button
              className="mobile-artists-btn"
              type="button"
              onClick={() => setSidebarOpen(true)}
              title="Ver artistas"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Artistas</span>
              {artists.length > 0 && (
                <span className="artists-badge">{artists.length}</span>
              )}
            </button>
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
            <div className="tab-actions">
              <button
                type="button"
                className="pill queue-toggle"
                onClick={() => setQueuePanelOpen(true)}
                disabled={!playQueue.length}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path
                    d="M4 6h16M4 12h10M4 18h6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Mi cola ({playQueue.length})
              </button>
            </div>
            {actionMessage && <p className="success">{actionMessage}</p>}
            {playlistError && <p className="error">{playlistError}</p>}
          </div>

          <div className="tab-panels">
            <AnimatePresence mode="wait">
              {selectedTab === 'tracks' && (
                <motion.section
                  key="tracks"
                  className="tab-panel tab-panel-tracks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {!selectedAlbum ? (
                    <>
                      <div className="artist-header">
                        <div className="artist-header-content">
                          <h1 className="artist-title">{selectedArtist?.name || 'Explora TruSoundCloud'}</h1>
                          <p className="artist-subtitle">
                            {albums.length} {albums.length === 1 ? 'álbum' : 'álbumes'} · {albums.reduce((sum, album) => sum + (album.track_count || 0), 0)} canciones
                          </p>
                        </div>
                        {selectedArtist && (
                          <button
                            type="button"
                            className="refresh-btn"
                            onClick={() => handleSelectArtist(selectedArtist)}
                            disabled={loadingAlbums}
                            title="Actualizar"
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20">
                              <path
                                d="M4 12a8 8 0 018-8V2l4 4-4 4V6a6 6 0 00-6 6M20 12a8 8 0 01-8 8v2l-4-4 4-4v4a6 6 0 006-6z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {loadingAlbums && (
                        <div className="loading-state">
                          <p>Cargando álbumes...</p>
                        </div>
                      )}
                      {!loadingAlbums && albums.length === 0 && selectedArtist && (
                        <div className="empty-state">
                          <p>Este artista no tiene álbumes disponibles.</p>
                        </div>
                      )}
                      {!loadingAlbums && albums.length > 0 && (
                        <div className="albums-section">
                          <h2 className="section-title">Álbumes</h2>
                          <div className="albums-grid">
                            {albums.map((album) => (
                              <AlbumCard
                                key={album.name}
                                album={album}
                                isActive={selectedAlbum?.name === album.name}
                                onSelect={handleSelectAlbum}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="album-header">
                        <button
                          type="button"
                          className="back-btn"
                          onClick={() => {
                            setSelectedAlbum(null);
                            setTracks([]);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20">
                            <path
                              d="M15 18l-6-6 6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Álbumes</span>
                        </button>
                        <div className="album-header-content">
                          <h1 className="album-title">{selectedAlbum.name}</h1>
                          <p className="album-subtitle">
                            {selectedArtist?.name} · {tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}
                          </p>
                        </div>
                      </div>

                      {myPlaylists.length > 0 && (
                        <div className="add-playlist-widget">
                          <label htmlFor="playlistSelect">
                            Añadir a playlist:
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

                      {renderTrackList(tracks, {
                        enableAdd: true,
                        playSourceList: tracks,
                      })}
                    </>
                  )}
                </motion.section>
              )}

              {selectedTab === 'favorites' && (
                <motion.section
                  key="favorites"
                  className="tab-panel tab-panel-favorites"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
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
                </motion.section>
              )}

              {selectedTab === 'my-playlists' && (
                <motion.section
                  key="my-playlists"
                  className="tab-panel tab-panel-my-playlists"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
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
                              if (e.key === 'Enter')
                                handleSelectPlaylistCard(playlist, 'mine');
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
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                  <path
                                    d="M5 6h14M10 11v6M14 11v6M9 6V4h6v2"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
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
                </motion.section>
              )}

              {selectedTab === 'public-playlists' && (
                <motion.section
                  key="public-playlists"
                  className="tab-panel tab-panel-public-playlists"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
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
                              if (e.key === 'Enter')
                                handleSelectPlaylistCard(playlist, 'public');
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
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {queuePanelOpen && (
          <motion.aside
            className="queue-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25 }}
          >
            <header>
              <div>
                <p className="eyebrow">Tu cola</p>
                <h3>{playQueue.length ? 'Reordenar y gestionar' : 'Sin canciones'}</h3>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setQueuePanelOpen(false)}
              >
                Cerrar
              </button>
            </header>
            {playQueue.length === 0 ? (
              <p>Reproduce una canción para comenzar a llenar la cola.</p>
            ) : (
              <DragDropContext onDragEnd={handleQueueDragEnd}>
                <Droppable droppableId="queue">
                  {(droppableProvided) => (
                    <div
                      className="queue-list"
                      ref={droppableProvided.innerRef}
                      {...droppableProvided.droppableProps}
                    >
                      {playQueue.map((track, index) => (
                        <Draggable
                          key={`queue-${track.id}-${index}`}
                          draggableId={`queue-${track.id}-${index}`}
                          index={index}
                        >
                          {(draggableProvided) => (
                            <motion.div
                              className={`queue-item ${
                                index === currentIndex ? 'active' : ''
                              }`}
                              ref={draggableProvided.innerRef}
                              {...draggableProvided.draggableProps}
                              {...draggableProvided.dragHandleProps}
                              onClick={() => playTrackAtIndex(index)}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="queue-pos">{index + 1}</span>
                              <div className="queue-info">
                                <strong>{track.title}</strong>
                                <small>{formatDuration(track.duration_seconds)}</small>
                              </div>
                              <button
                                type="button"
                                className="icon-btn add"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playTrackAtIndex(index);
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                  <path
                                    d="M7 4l12 8-12 8z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {currentTrack && (
        <footer className="player-bar">
          <div className="mini-left">
            <div className="artwork-chip" style={artworkStyle}>
              {artworkInitial}
            </div>
            <div className="track-meta">
              <strong>{currentTrack.title}</strong>
              <span>{activeArtistName}</span>
              <div className="eq-indicator" aria-hidden>
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
          <div className="player-controls">
            <button
              type="button"
              onClick={handlePrevTrack}
              className="control-btn"
              disabled={currentIndex === 0}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M10 7v10l-6-5 6-5zm10 10V7l-6 5 6 5z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="control-btn primary-btn"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M9 6h2v12H9zm4 0h2v12h-2z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </button>
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
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M14 7v10l6-5-6-5zm-10 10V7l6 5-6 5z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div className="progress-group">
              <span>{formatTime(displayProgress)}</span>
              <input
                type="range"
                min="0"
                max={safeDuration}
                step="0.1"
                value={safeDuration ? displayProgress : 0}
                onChange={(e) => handleSeek(e.target.value)}
                disabled={!safeDuration}
              />
              <span>{formatTime(safeDuration)}</span>
            </div>
          </div>
          <audio
            ref={audioRef}
            src={audioUrl}
            autoPlay
            preload="metadata"
            onEnded={handleNextTrack}
            style={{ display: 'none' }}
          />
        </footer>
      )}

      <style>{`
        :root {
          font-family: 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .trusound-page {
          min-height: 100vh;
          background: radial-gradient(circle at top, var(--accent-1, #4f46e5), #020617 70%);
          color: #fff;
          position: relative;
          overflow-x: hidden;
          padding-bottom: 5rem;
        }

        .trusound-nav {
          position: sticky;
          top: 0;
          z-index: 40;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem clamp(1.2rem, 5vw, 3rem);
          background: linear-gradient(180deg, rgba(4,7,15,0.95), rgba(4,7,15,0.6));
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .sidebar-toggle {
          border: 1px solid rgba(255,255,255,0.3);
          background: transparent;
          color: #fff;
          border-radius: 11px;
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .trusound-nav h1 {
          margin: 0;
          font-size: clamp(1.3rem, 2.4vw, 1.9rem);
          letter-spacing: 0.04em;
        }

        .trusound-nav p {
          margin: 0;
          color: rgba(226,232,240,0.8);
          font-size: 0.85rem;
        }

        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2,6,23,0.6);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-out;
          z-index: 35;
        }
        .sidebar-backdrop.show {
          opacity: 1;
          pointer-events: all;
        }

        .trusound-layout {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem clamp(1.2rem, 4vw, 3rem) 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .sidebar {
          flex-shrink: 0;
          width: clamp(260px, 28%, 330px);
          background: radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(2,6,23,0.95));
          border-radius: 20px;
          padding: 1.3rem;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 20px 40px rgba(2,6,23,0.9);
          max-height: calc(100vh - 200px);
          overflow-y: auto;
          transform: translateX(0);
          transition: transform 0.25s ease-in-out;
        }

        .sidebar h3 {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          color: rgba(241,245,249,0.7);
        }

        .sidebar.visible {
          transform: translateX(0);
        }

        .artist-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
        }

        .artist-card {
          border: 1px solid rgba(255,255,255,0.06);
          text-align: left;
          padding: 0.85rem;
          border-radius: 16px;
          background: rgba(9,9,20,0.8);
          color: #e5e7eb;
          cursor: pointer;
          display: flex;
          gap: 0.65rem;
          align-items: center;
          transition: transform 0.15s ease-out, border 0.15s ease-out, box-shadow 0.15s ease-out;
        }

        .artist-card.active,
        .artist-card:hover {
          border-color: rgba(255,255,255,0.35);
          box-shadow: 0 15px 35px rgba(4,7,15,0.8);
          transform: translateY(-1px);
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
        }

        .artist-card .artwork {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.95rem;
          color: #020617;
        }

        .content {
          flex: 1;
          background: rgba(2,6,23,0.8);
          border-radius: 26px;
          padding: 1.4rem clamp(1rem, 2vw, 2rem);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 30px 60px rgba(2,6,23,0.85);
          min-width: 0;
          padding-bottom: clamp(1.4rem, 8vw, 2rem);
        }

        .content-header {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .tab-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tab-bar button {
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          color: #eaeefe;
          border-radius: 999px;
          padding: 0.35rem 1rem;
          cursor: pointer;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          transition: all 0.18s ease;
        }
        .tab-bar button.active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: #020617;
          border-color: transparent;
        }

        .tab-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pill {
          border-radius: 999px;
          padding: 0.35rem 0.9rem;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(15,23,42,0.85);
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
        }

        .pill:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .tab-panels {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border-radius: 22px;
          padding: clamp(1rem, 2vw, 1.6rem);
          color: #020617;
        }

        .hero .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.7rem;
          margin-bottom: 0.2rem;
        }
        .hero h2 {
          margin: 0.1rem 0;
          font-size: clamp(1.4rem, 2.4vw, 1.8rem);
        }
        .hero p {
          margin: 0;
          color: rgba(2,6,23,0.7);
        }

        .tracks-panel {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .artist-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .artist-header-content {
          flex: 1;
          min-width: 0;
        }

        .artist-title {
          margin: 0 0 0.5rem 0;
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .artist-subtitle {
          margin: 0;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.7);
          font-weight: 400;
        }

        .refresh-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .refresh-btn:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.05);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .album-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .back-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .back-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }

        .album-header-content {
          flex: 1;
          min-width: 0;
        }

        .album-title {
          margin: 0 0 0.25rem 0;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .album-subtitle {
          margin: 0;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
        }

        .section-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .albums-section {
          margin-top: 0;
        }

        .albums-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1.25rem;
        }

        .album-card {
          background: transparent;
          border: none;
          text-align: left;
          padding: 0;
          border-radius: 0;
          color: #e5e7eb;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: transform 0.2s ease;
          width: 100%;
        }

        .album-card:hover {
          transform: translateY(-4px);
        }

        .album-card.active .album-artwork {
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .album-artwork {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          color: #020617;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .album-artwork::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%);
        }

        .album-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-height: 3.5rem;
        }

        .album-info h4 {
          margin: 0;
          font-size: 0.95rem;
          color: #fff;
          font-weight: 600;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .album-info p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
          font-weight: 400;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: rgba(255,255,255,0.6);
        }

        .track-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          transition: background 0.15s ease;
        }
        .track-row:hover {
          background: rgba(255,255,255,0.05);
        }
        .track-row.active {
          background: rgba(255,255,255,0.08);
        }

        .play-btn {
          border: 1px solid rgba(255,255,255,0.3);
          background: transparent;
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .track-info h5 {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .track-info small {
          color: rgba(226,232,240,0.75);
          margin-top: 0.15rem;
        }
        .track-info .eq-bars {
          display: inline-flex;
          gap: 2px;
          margin-left: 0.4rem;
        }
        .track-info .eq-bars span {
          width: 3px;
          height: 12px;
          background: var(--accent-1);
          display: inline-block;
          animation: eqBounce 1s ease-in-out infinite;
        }
        .track-info .eq-bars span:nth-child(2) {
          animation-delay: 0.15s;
        }
        .track-info .eq-bars span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes eqBounce {
          0%,100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        .track-meta {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
          flex: 1;
        }

        .track-meta strong {
          font-size: 0.95rem;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.3;
        }

        .track-meta span {
          font-size: 0.8rem;
          color: rgba(226,232,240,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .track-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-shrink: 0;
        }

        .icon-btn {
          border-radius: 50%;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.7);
          width: 36px;
          height: 36px;
          min-width: 36px;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          opacity: 0;
        }
        .track-row:hover .icon-btn,
        .track-row.active .icon-btn {
          opacity: 1;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          transform: scale(1.1);
        }
        .icon-btn.heart.active {
          color: #1db954;
          opacity: 1;
        }
        .icon-btn.heart.active:hover {
          color: #1ed760;
        }

        .favorites-panel,
        .playlist-layout {
          background: rgba(7,9,20,0.85);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          padding: 1.2rem;
        }

        .playlist-layout {
          display: flex;
          gap: 1.1rem;
        }
        .playlist-column {
          width: clamp(250px, 30%, 320px);
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .playlist-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .playlist-card {
          border-radius: 14px;
          padding: 0.8rem;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(8,10,22,0.9);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .playlist-card.active {
          border-color: rgba(255,255,255,0.35);
        }

        .playlist-form {
          background: rgba(5,7,16,0.9);
          border-radius: 14px;
          padding: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .playlist-form input,
        .playlist-form textarea,
        .add-playlist-widget select {
          background: rgba(2,6,23,0.9);
          border: 1px solid rgba(255,255,255,0.15);
          color: #e5e7eb;
          border-radius: 10px;
          padding: 0.6rem 0.8rem;
        }

        .add-playlist-widget {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .add-playlist-widget label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .player-bar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          max-width: 100vw;
          background: rgba(1,3,10,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px 20px 0 0;
          padding: 0.9rem 1.3rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          box-shadow: 0 25px 50px rgba(2,6,23,0.9);
          z-index: 1000;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .player-bar {
            left: 50%;
            transform: translateX(-50%);
            bottom: 1rem;
            width: min(960px, calc(100vw - 2.4rem));
            border-radius: 20px;
          }
        }

        .mini-left {
          display: flex;
          gap: 0.9rem;
          align-items: center;
          min-width: 0;
        }

        .artwork-chip {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #020617;
          font-weight: 700;
        }

        .player-controls {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .player-controls .progress-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex: 1;
        }
        .player-controls .progress-group span {
          font-size: 0.75rem;
          color: rgba(226,232,240,0.7);
        }
        .player-controls input[type="range"] {
          flex: 1;
          accent-color: var(--accent-1);
        }
        .primary-btn {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: #020617;
          border: none;
        }

        .eq-indicator {
          display: inline-flex;
          gap: 3px;
          margin-top: 0.2rem;
        }
        .eq-indicator span {
          width: 3px;
          height: 14px;
          background: var(--accent-1);
          animation: eqBounce 1s ease-in-out infinite;
        }
        .eq-indicator span:nth-child(2) { animation-delay: 0.15s; }
        .eq-indicator span:nth-child(3) { animation-delay: 0.3s; }

        .queue-panel {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2,6,23,0.98);
          border-radius: 24px 24px 0 0;
          padding: 1.3rem 1.4rem 2.5rem;
          border: 1px solid rgba(255,255,255,0.08);
          z-index: 50;
          max-height: 80vh;
          overflow-y: auto;
        }
        .queue-panel header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .queue-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .queue-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.7rem 0.9rem;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(3,7,18,0.9);
          cursor: grab;
        }
        .queue-item.active {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.06);
        }
        .queue-pos {
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .queue-info {
          flex: 1;
          min-width: 0;
        }
        .queue-info strong {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .queue-info small {
          color: rgba(226,232,240,0.7);
        }

        .ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.25);
          color: #fff;
          border-radius: 999px;
          padding: 0.35rem 0.9rem;
          cursor: pointer;
        }

        .primary {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border: none;
          color: #020617;
          border-radius: 999px;
          padding: 0.55rem 1.3rem;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .trusound-layout {
            flex-direction: column;
          }
          .sidebar {
            position: fixed;
            top: 4.5rem;
            left: 0;
            bottom: 0;
            width: min(320px, 80vw);
            transform: translateX(-100%);
            z-index: 45;
          }
          .sidebar.visible {
            transform: translateX(0);
          }
        }

        .mobile-artists-btn {
          display: none;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border: none;
          border-radius: 12px;
          padding: 0.6rem 1rem;
          color: #020617;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 0.8rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .mobile-artists-btn:active {
          transform: translateY(1px);
        }

        .artists-badge {
          background: rgba(2,6,23,0.3);
          border-radius: 999px;
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          min-width: 1.5rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .trusound-page {
            padding-bottom: 0;
          }

          .mobile-artists-btn {
            display: inline-flex;
          }

          .content {
            padding: 1rem;
            padding-bottom: calc(180px + env(safe-area-inset-bottom) + 56px);
            margin-bottom: 0;
          }

          .track-info {
            min-width: 0;
            flex: 1;
            overflow: hidden;
          }

          .track-info h5 {
            font-size: 0.875rem;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-word;
            margin: 0;
          }

          .track-info small {
            font-size: 0.7rem;
            margin-top: 0.1rem;
            opacity: 0.8;
          }

          .player-bar {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            border-radius: 0;
            padding: 0.875rem 1rem;
            padding-bottom: calc(0.875rem + env(safe-area-inset-bottom) + 56px);
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
            align-items: stretch;
            box-shadow: 0 -8px 24px rgba(2,6,23,0.8);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255,255,255,0.1);
            border-left: none !important;
            border-right: none !important;
            box-sizing: border-box;
            z-index: 1000;
            min-height: calc(140px + env(safe-area-inset-bottom) + 56px);
            transform: none !important;
          }

          .mini-left {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            min-width: 0;
            width: 100%;
            flex-shrink: 0;
          }

          .artwork-chip {
            width: 52px;
            height: 52px;
            flex-shrink: 0;
            border-radius: 12px;
          }

          .track-meta {
            min-width: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
            overflow: hidden;
          }

          .track-meta strong {
            font-size: 0.875rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
            font-weight: 600;
          }

          .track-meta span {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.7);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .eq-indicator {
            display: none;
          }

          .player-controls {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            width: 100%;
            flex-shrink: 0;
            padding: 0;
          }

          .control-btn {
            width: 52px;
            height: 52px;
            min-width: 52px;
            min-height: 52px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(15,23,42,0.95);
            color: #e5e7eb;
            cursor: pointer;
            flex-shrink: 0;
            padding: 0;
            box-sizing: border-box;
            overflow: visible;
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.1s ease;
          }

          .control-btn:active {
            transform: scale(0.95);
          }

          .control-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .control-btn.primary-btn {
            width: 60px;
            height: 60px;
            min-width: 60px;
            min-height: 60px;
            background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
            border: none;
            color: #020617;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          }

          .control-btn svg {
            width: 22px;
            height: 22px;
            flex-shrink: 0;
          }

          .control-btn.primary-btn svg {
            width: 24px;
            height: 24px;
          }

          .progress-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            width: 100%;
            order: -1;
            flex-shrink: 0;
            padding: 0;
          }

          .progress-group span {
            font-size: 0.7rem;
            color: rgba(226,232,240,0.8);
            min-width: 2.5rem;
            text-align: center;
            font-variant-numeric: tabular-nums;
            flex-shrink: 0;
          }

          .progress-group input[type="range"] {
            flex: 1;
            height: 5px;
            accent-color: var(--accent-1);
            min-width: 0;
            -webkit-appearance: none;
            appearance: none;
            background: rgba(255,255,255,0.2);
            border-radius: 2px;
          }

          .progress-group input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--accent-1);
            cursor: pointer;
          }

          .progress-group input[type="range"]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--accent-1);
            cursor: pointer;
            border: none;
          }

          .track-row {
            grid-template-columns: auto minmax(0, 1fr) auto;
            padding: 0.875rem 0.75rem;
            gap: 0.75rem;
            min-height: 60px;
            align-items: center;
          }

          .track-meta {
            display: none;
          }

          .track-actions {
            gap: 0.5rem;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }

          .icon-btn {
            width: 40px;
            height: 40px;
            min-width: 40px;
            min-height: 40px;
            opacity: 1;
            flex-shrink: 0;
          }

          .artist-title {
            font-size: 1.75rem;
            line-height: 1.2;
          }

          .album-title {
            font-size: 1.5rem;
            line-height: 1.2;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }

          .albums-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1rem;
          }

          .album-artwork {
            font-size: 1.75rem;
          }

          .album-info h4 {
            font-size: 0.875rem;
            min-height: 2.5rem;
            line-height: 1.3;
          }

          .album-info p {
            font-size: 0.8rem;
          }

          .artist-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
          }

          .artist-title {
            font-size: 2rem;
          }

          .refresh-btn {
            width: 40px;
            height: 40px;
            align-self: flex-end;
          }

          .album-header {
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
          }

          .back-btn {
            font-size: 0.875rem;
            padding: 0.4rem;
          }

          .album-title {
            font-size: 1.5rem;
          }

          .section-title {
            font-size: 1.25rem;
            margin-bottom: 1rem;
          }

          .albums-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 1rem;
          }

          .album-artwork {
            font-size: 1.5rem;
          }

          .album-info h4 {
            font-size: 0.875rem;
            min-height: 2.5rem;
          }

          .album-info p {
            font-size: 0.8rem;
          }

          .add-playlist-widget {
            padding: 0.75rem;
            margin-bottom: 1rem;
          }

          .add-playlist-widget label {
            font-size: 0.8rem;
          }

          .add-playlist-widget select {
            font-size: 0.875rem;
            padding: 0.5rem 0.75rem;
          }
        }

        .login-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at top, var(--accent-1, #4f46e5), #020617 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
        }

        .login-panel {
          background: rgba(2,6,23,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2.5rem clamp(1.5rem, 4vw, 2.5rem);
          box-shadow: 0 30px 60px rgba(2,6,23,0.9);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .login-header {
          text-align: center;
        }

        .login-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: clamp(1.8rem, 4vw, 2.2rem);
          color: #fff;
          font-weight: 700;
        }

        .login-header p {
          margin: 0;
          color: rgba(226,232,240,0.7);
          font-size: clamp(0.9rem, 2vw, 1rem);
        }

        .login-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-panel input {
          background: rgba(15,23,42,0.8);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 0.9rem 1.1rem;
          color: #e5e7eb;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .login-panel input::placeholder {
          color: rgba(226,232,240,0.5);
        }

        .login-panel input:focus {
          border-color: var(--accent-1, #4f46e5);
          background: rgba(15,23,42,0.95);
        }

        .login-panel input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-error {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          text-align: center;
        }

        .login-submit {
          background: linear-gradient(135deg, var(--accent-1, #4f46e5), var(--accent-2, #6366f1));
          border: none;
          border-radius: 12px;
          padding: 0.95rem 1.5rem;
          color: #020617;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.2s ease;
          width: 100%;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .login-panel {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }

          .login-header h2 {
            font-size: 1.6rem;
          }

          .login-panel input,
          .login-submit {
            padding: 0.85rem 1rem;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TruSoundCloud;

