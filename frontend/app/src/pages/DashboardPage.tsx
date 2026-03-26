import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getProfile } from '../services/userService';
import { User } from '@saas/types';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/login');
      return;
    }
    getProfile(token)
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem('token');
        history.push('/login');
      });
  }, [history]);

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DashboardPage;
