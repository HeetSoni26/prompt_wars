/**
 * @fileoverview AuthContext tests — auth state and error handling.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import * as firebaseAuth from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // Start unauthenticated
    return () => {};
  }),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

// Test component that renders auth state
function AuthConsumer() {
  const { user, loading, signInWithGoogle } = useAuth();
  return (
    <div>
      <p data-testid="loading">{loading ? 'loading' : 'ready'}</p>
      <p data-testid="user">{user ? user.email : 'none'}</p>
      <button onClick={signInWithGoogle}>Google Sign In</button>
    </div>
  );
}

function TestWrapper({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthContext', () => {
  it('renders unauthenticated state initially', async () => {
    render(<AuthConsumer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('none');
  });

  it('provides signInWithGoogle function', async () => {
    firebaseAuth.signInWithPopup.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

    render(<AuthConsumer />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    fireEvent.click(screen.getByText('Google Sign In'));
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
  });

  it('sets authError on failed Google sign-in', async () => {
    firebaseAuth.signInWithPopup.mockRejectedValueOnce({ code: 'auth/popup-closed-by-user' });

    function ErrorConsumer() {
      const { authError, signInWithGoogle } = useAuth();
      return (
        <div>
          <p data-testid="error">{authError || 'no error'}</p>
          <button onClick={() => signInWithGoogle().catch(() => {})}>Sign In</button>
        </div>
      );
    }

    render(<ErrorConsumer />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByText('Sign In'));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Sign-in cancelled');
    });
  });
});
