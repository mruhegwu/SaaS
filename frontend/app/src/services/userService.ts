import axios from 'axios';
import { User } from '@saas/types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

export const getProfile = async (token: string): Promise<User> => {
  const response = await axios.get(`${BACKEND_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
