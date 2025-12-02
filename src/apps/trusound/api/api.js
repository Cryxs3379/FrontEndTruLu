import axios from 'axios';

const API_BASE =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://10.0.0.10:3000') + '/api';
const SESSION_KEY = 'trusound_session';

const client = axios.create({
  baseURL: API_BASE,
});

client.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  const token = session?.token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export const loginTruSound = async (email, password) => {
  const { data } = await axios.post(`${API_BASE}/trusound/login`, {
    email,
    password,
  });
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
};

export const logoutTruSound = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getTruSoundSession = () =>
  JSON.parse(localStorage.getItem(SESSION_KEY));

export const fetchArtists = async () => {
  const { data } = await client.get('/TruSoundCloud/artists');
  return data;
};

export const fetchArtist = async (artistId) => {
  const { data } = await client.get(`/TruSoundCloud/artists/${artistId}`);
  return data;
};

export const fetchArtistTracks = async (artistId) => {
  const { data } = await client.get(
    `/TruSoundCloud/artists/${artistId}/tracks`,
  );
  return data;
};

export const fetchArtistAlbums = async (artistId) => {
  const { data } = await client.get(
    `/TruSoundCloud/artists/${artistId}/albums`,
  );
  return data;
};

export const fetchTrack = async (trackId) => {
  const { data } = await client.get(`/TruSoundCloud/tracks/${trackId}`);
  return data;
};

export const buildTrackStreamUrl = (trackId) => {
  const token = getTruSoundSession()?.token || '';
  return `${API_BASE}/TruSoundCloud/tracks/${trackId}/stream?token=${encodeURIComponent(
    token,
  )}`;
};

export const TruSoundSessionKey = SESSION_KEY;

export const fetchFavorites = async () => {
  const { data } = await client.get('/TruSoundCloud/favorites');
  return data;
};

export const addFavorite = async (trackId) => {
  const { data } = await client.post('/TruSoundCloud/favorites', { trackId });
  return data;
};

export const removeFavorite = async (trackId) => {
  const { data } = await client.delete(`/TruSoundCloud/favorites/${trackId}`);
  return data;
};

export const fetchMyPlaylists = async () => {
  const { data } = await client.get('/TruSoundCloud/playlists/mine');
  return data;
};

export const fetchPublicPlaylists = async () => {
  const { data } = await client.get('/TruSoundCloud/playlists/public');
  return data;
};

export const createPlaylist = async (payload) => {
  const { data } = await client.post('/TruSoundCloud/playlists', payload);
  return data;
};

export const fetchPlaylistDetail = async (playlistId) => {
  const { data } = await client.get(`/TruSoundCloud/playlists/${playlistId}`);
  return data;
};

export const addTrackToPlaylist = async (playlistId, trackId, position) => {
  const payload = { trackId };
  if (position !== undefined) payload.position = position;
  const { data } = await client.post(
    `/TruSoundCloud/playlists/${playlistId}/tracks`,
    payload,
  );
  return data;
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
  const { data } = await client.delete(
    `/TruSoundCloud/playlists/${playlistId}/tracks/${trackId}`,
  );
  return data;
};

export const deletePlaylist = async (playlistId) => {
  const { data } = await client.delete(`/TruSoundCloud/playlists/${playlistId}`);
  return data;
};

