// src/apps/tetris/api/tetris.js
import axios from 'axios';

const DEFAULT_BASE_URL = 'http://localhost:3000';

const guessApiBase = () => {
  if (typeof window === 'undefined') return DEFAULT_BASE_URL;

  const { protocol, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEFAULT_BASE_URL;
  }

  return `${protocol}//${hostname}:3000`;
};

const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_TETRIS_API_BASE;
  if (configured) return configured.replace(/\/$/, '');
  return guessApiBase().replace(/\/$/, '');
};

const API_BASE = resolveBaseUrl();

const withPath = (path) => `${API_BASE}${path}`;

export const fetchLeaderboard = async () => {
  const res = await axios.get(withPath('/api/leaderboard'));
  return res.data;
};

export const submitScore = async ({ username, score }) => {
  const res = await axios.post(
    withPath('/api/score'),
    { username, score },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return res.data;
};

