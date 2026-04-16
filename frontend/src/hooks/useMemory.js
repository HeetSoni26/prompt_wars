/**
 * @fileoverview useMemory hook — fetches and manages user profile and memory data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMemoryProfile, updateProfile, getSessions, triggerMemorySummarize, syncLinkedInProfile } from '../services/api';

export function useMemory() {
  const { user, isDemoMode } = useAuth();
  const [profile, setProfile] = useState(null);
  const [memorySummary, setMemorySummary] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Loads profile and session data from backend (or local fallback).
   */
  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (isDemoMode) {
        const saved = localStorage.getItem('cp_memory_data');
        if (saved) {
          const { profile: p, sessions: s } = JSON.parse(saved);
          setProfile(p);
          setSessions(s || []);
          setMemorySummary(p.memorySummary || '');
        } else {
          setProfile({ displayName: user.displayName, targetRole: 'Job Seeker', expertiseLevel: 'intermediate' });
        }
        return;
      }
      const data = await getMemoryProfile(user);
      setProfile(data.profile);
      setMemorySummary(data.memorySummary || '');
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
      // Fallback to minimal state on error
      if (!profile) setProfile({ displayName: user.displayName, targetRole: 'Not set' });
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Saves updates to profile.
   */
  const saveProfile = useCallback(async (updates) => {
    if (!user) return;
    try {
      if (isDemoMode) {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        localStorage.setItem('cp_memory_data', JSON.stringify({ profile: newProfile, sessions }));
        return;
      }
      await updateProfile(user, updates);
      setProfile((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      setError(err.message);
    }
  }, [user, isDemoMode, profile, sessions]);

  /**
   * Syncs profile with LinkedIn.
   */
  const syncLinkedIn = useCallback(async (accessToken) => {
    if (!user) return;
    try {
      const { data } = await syncLinkedInProfile(user, accessToken);
      const updates = {
        displayName: data.displayName,
        targetRole: data.headline,
        memorySummary: `LinkedIn Context: ${data.summary}`,
      };
      setProfile((prev) => ({ ...prev, ...updates }));
      if (isDemoMode) {
        localStorage.setItem('cp_memory_data', JSON.stringify({ profile: { ...profile, ...updates }, sessions }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user, isDemoMode, profile, sessions]);

  /**
   * Refreshes sessions and memory summary.
   */
  const refreshMemory = useCallback(async () => {
    if (!user || isDemoMode) return;
    try {
      const result = await triggerMemorySummarize(user);
      setMemorySummary(result.summary || '');
    } catch (err) {
      setError(err.message);
    }
  }, [user, isDemoMode]);

  return {
    profile,
    memorySummary,
    sessions,
    loading,
    error,
    saveProfile,
    syncLinkedIn,
    refreshMemory,
    reload: loadProfile,
  };
}
