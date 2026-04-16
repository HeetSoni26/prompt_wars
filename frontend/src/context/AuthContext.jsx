/**
 * @fileoverview AuthContext — provides Firebase auth state to the entire app.
 * Handles Google Sign-In, Email/Password auth, and user session tracking.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isDemoMode } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // If in Demo Mode, simulate a logged-in guest user immediately
    if (isDemoMode) {
      const savedUser = localStorage.getItem('cp_guest_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Signs in as a guest (Demo Mode).
   */
  const signInAsGuest = useCallback(async () => {
    const guest = {
      uid: 'guest-' + Math.random().toString(36).substr(2, 9),
      displayName: 'Guest User',
      email: 'guest@example.com',
      isGuest: true,
      getIdToken: async () => 'mock-token',
    };
    setUser(guest);
    localStorage.setItem('cp_guest_user', JSON.stringify(guest));
    return { user: guest };
  }, []);

  /**
   * Signs in with Google popup.
   */
  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) return await signInAsGuest();
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, [signInAsGuest]);

  /**
   * Signs in with email and password.
   */
  const signInWithEmail = useCallback(async (email, password) => {
    if (isDemoMode) return await signInAsGuest();
    setAuthError(null);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, [signInAsGuest]);

  /**
   * Creates a new account with email, password, and display name.
   */
  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    if (isDemoMode) return await signInAsGuest();
    setAuthError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, [signInAsGuest]);

  /**
   * Signs out the current user.
   */
  const logout = useCallback(async () => {
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('cp_guest_user');
      return;
    }
    await signOut(auth);
  }, []);

  /**
   * Clears the current auth error.
   */
  const clearError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signInAsGuest,
      logout,
      clearError,
      isDemoMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context.
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Maps Firebase auth error codes to user-friendly messages.
 * @param {string} code - Firebase error code
 * @returns {string} Friendly error message
 */
function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
  };
  return messages[code] || 'Authentication failed. Please try again.';
}
