import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App', () => {
  it('renders home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Welcome to/i })).toBeInTheDocument();
  });

  it('redirects unauthenticated users from dashboard to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    // Should redirect to login - look for the form heading
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
  });
});
