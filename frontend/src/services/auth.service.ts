import api from './api';

export function login() {
  window.location.href = '/api/auth/github';
}

export function logout() {
  localStorage.removeItem('jwt_token');
}

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}
