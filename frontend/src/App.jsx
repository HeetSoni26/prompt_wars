/**
 * @fileoverview App root — route configuration with auth guards.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

/**
 * Protected route — redirects to /login if user is not authenticated.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected component
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"
            role="status"
            aria-label="Loading application"
          />
          <p className="text-slate-500 text-sm">Loading CareerPilot…</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

/**
 * Public-only route — redirects to /chat if already authenticated.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Public component
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/chat" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />

            {/* Protected routes */}
            <Route path="/chat" element={
              <ProtectedRoute><Chat /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
