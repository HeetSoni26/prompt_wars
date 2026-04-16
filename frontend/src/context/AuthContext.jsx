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
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and exposes auth state and methods.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Signs in with Google popup.
   * @returns {Promise<import('firebase/auth').UserCredential>}
   */
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Signs in with email and password.
   * @param {string} email
   * @param {string} password
   */
  const signInWithEmail = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setAuthError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Creates a new account with email, password, and display name.
   * @param {string} email
   * @param {string} password
   * @param {string} displayName
   */
  const signUpWithEmail = useCallback(async (email, password, displayName) => {
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
  }, []);

  /**
   * Signs out the current user.
   */
  const logout = useCallback(async () => {
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
      logout,
      clearError,
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
