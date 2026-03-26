import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

export const login = async (email: string, password: string): Promise<{ token: string }> => {
  const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
  return response.data.data;
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ token: string }> => {
  const response = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password });
  return response.data.data;
};
