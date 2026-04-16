/**
 * @fileoverview useMemory hook — fetches and manages user profile and memory data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMemoryProfile, updateProfile, getSessions, triggerMemorySummarize } from '../services/api';

/**
 * useMemory hook for profile and session memory management.
 * @returns {Object} Memory state and actions
 */
export function useMemory() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [memorySummary, setMemorySummary] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Loads profile and session data from backend.
   */
  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMemoryProfile(user);
      setProfile(data.profile);
      setMemorySummary(data.memorySummary || '');
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Updates user profile fields (target role, expertise level).
   * @param {Object} updates - Fields to update
   */
  const saveProfile = useCallback(async (updates) => {
    if (!user) return;
    try {
      await updateProfile(user, updates);
      setProfile((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  /**
   * Refreshes the session list.
   */
  const refreshSessions = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getSessions(user);
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  /**
   * Triggers a memory re-summarization via Gemini.
   */
  const refreshMemory = useCallback(async () => {
    if (!user) return;
    try {
      const result = await triggerMemorySummarize(user);
      setMemorySummary(result.summary || '');
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  return {
    profile,
    memorySummary,
    sessions,
    loading,
    error,
    saveProfile,
    refreshSessions,
    refreshMemory,
    reload: loadProfile,
  };
}
