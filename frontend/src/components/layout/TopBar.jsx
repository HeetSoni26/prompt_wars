/**
 * @fileoverview TopBar — header with user avatar, theme toggle, and sidebar toggle.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import Modal from '../ui/Modal';
import { getInitials } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

/**
 * @param {Object} props
 * @param {Function} props.onToggleSidebar - Callback to toggle sidebar
 * @param {string} props.title - Current page/session title
 */
export default function TopBar({ onToggleSidebar, title }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const initials = getInitials(user?.displayName || user?.email || '?');

  const handleLogout = async () => {
    await logout();
    setLogoutConfirm(false);
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 border-b border-navy-700 glass-sidebar flex-shrink-0 z-10">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors flex-shrink-0"
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle sidebar (B)"
            id="sidebar-toggle"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          <h1 className="text-sm font-medium text-slate-300 truncate max-w-xs">
            {title || APP_NAME}
          </h1>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />

          {/* Notifications bell (visual indicator) */}
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors"
            aria-label="View dashboard and insights"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </Link>

          {/* User avatar */}
          <div className="relative">
            <motion.button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white ring-2 ring-transparent hover:ring-indigo-500/50 transition-all"
              whileTap={{ scale: 0.95 }}
              aria-label="User menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              id="user-menu-button"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User avatar'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : initials}
            </motion.button>

            {/* Dropdown */}
            {menuOpen && (
              <motion.div
                className="absolute right-0 top-12 w-56 glass-card shadow-card py-1 z-20"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                role="menu"
                aria-labelledby="user-menu-button"
              >
                <div className="px-4 py-3 border-b border-navy-700">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors"
                  onClick={() => setMenuOpen(false)}
                  role="menuitem"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setLogoutConfirm(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirm modal */}
      <Modal
        isOpen={logoutConfirm}
        onClose={() => setLogoutConfirm(false)}
        title="Sign Out"
      >
        <p className="text-slate-300 text-sm mb-6">Are you sure you want to sign out? Your session history is saved in the cloud.</p>
        <div className="flex gap-3 justify-end">
          <button
            className="btn-ghost text-sm px-4 py-2"
            onClick={() => setLogoutConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="btn-primary text-sm"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </Modal>
    </>
  );
}
