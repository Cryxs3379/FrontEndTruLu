import axios from 'axios';

const API_BASE = '/api';
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

