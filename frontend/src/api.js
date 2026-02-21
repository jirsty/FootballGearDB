import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getLeaderboard = (category, params = {}) =>
  api.get(`/leaderboards/${category}`, { params }).then((r) => r.data);

export const getUnifiedLeaderboard = (params = {}) =>
  api.get('/leaderboards/all', { params }).then((r) => r.data);

export const getHighlights = (params = {}) =>
  api.get('/leaderboards/highlights', { params }).then((r) => r.data);

export const getGearDetail = (gearId, params = {}) =>
  api.get(`/gear/${gearId}`, { params }).then((r) => r.data);

export const getGearList = (params = {}) =>
  api.get('/gear', { params }).then((r) => r.data);

export const getPlayer = (playerId, params = {}) =>
  api.get(`/players/${playerId}`, { params }).then((r) => r.data);

export const getPlayers = (params = {}) =>
  api.get('/players', { params }).then((r) => r.data);

export const getWeeks = () =>
  api.get('/stats/weeks').then((r) => r.data);
