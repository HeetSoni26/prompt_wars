/**
 * @fileoverview MainLayout — top-level layout with sidebar, topbar, and content area.
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useMemory } from '../../hooks/useMemory';

/**
 * Main application layout with collapsible sidebar.
 * @param {Object} props
 * @param {string} props.title - Current page title for TopBar
 * @param {string} props.activeSessionId - Currently active session ID
 * @param {Function} props.onNewSession - Start new session callback
 * @param {Function} props.onSelectSession - Select existing session callback
 */
export default function MainLayout({ title, activeSessionId, onNewSession, onSelectSession }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { sessions, loading: memoryLoading } = useMemory();

  // Keyboard shortcut: B to toggle sidebar
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        setSidebarOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen-safe bg-navy-900 overflow-hidden bg-glow-indigo">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        loading={memoryLoading}
        activeSessionId={activeSessionId}
        onNewSession={onNewSession}
        onSelectSession={onSelectSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          title={title}
        />

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
