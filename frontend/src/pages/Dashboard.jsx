/**
 * @fileoverview Dashboard page — profile overview, insights, and session history.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMemory } from '../hooks/useMemory';
import { getInsights } from '../services/api';
import InsightCard from '../components/dashboard/InsightCard';
import SessionHistory from '../components/dashboard/SessionHistory';
import MemoryPanel from '../components/dashboard/MemoryPanel';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { SkeletonBlock } from '../components/ui/SkeletonLoader';
import { EXPERTISE_OPTIONS } from '../utils/constants';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, memorySummary, sessions, loading, saveProfile, refreshMemory } = useMemory();
  const navigate = useNavigate();

  const [insights, setInsights] = useState({ proactiveInsight: null, insightCards: [] });
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [expertise, setExpertise] = useState('intermediate');
  const [saving, setSaving] = useState(false);

  // Load proactive insights on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getInsights(user);
        setInsights(data);
      } catch {
        // Fail silently — insights are supplementary
      } finally {
        setInsightsLoading(false);
      }
    })();
  }, [user]);

  // Pre-fill profile form when modal opens
  useEffect(() => {
    if (profileOpen && profile) {
      setTargetRole(profile.targetRole || '');
      setExpertise(profile.expertiseLevel || 'intermediate');
    }
  }, [profileOpen, profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await saveProfile({ targetRole, expertiseLevel: expertise });
      setProfileOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleInsightAction = (insight) => {
    if (insight.type === 'reminder' || insight.type === 'welcome') {
      navigate('/chat');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-navy-900 bg-glow-indigo">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Proactive insight banner */}
          <AnimatePresence>
            {insights.proactiveInsight && (
              <motion.div
                className="mb-6 p-4 rounded-card border border-indigo-500/30 bg-indigo-900/20 flex items-start gap-3"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
              >
                <span className="text-xl flex-shrink-0" aria-hidden="true">💡</span>
                <p className="text-sm text-slate-300">{insights.proactiveInsight}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-50 mb-1">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-slate-400 text-sm">
                {loading ? (
                  <SkeletonBlock className="w-48 h-3 mt-1" height="h-3" />
                ) : (
                  `${sessions.length} sessions · Target: ${profile?.targetRole || 'Not set'} · ${profile?.expertiseLevel || 'Intermediate'}`
                )}
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button variant="ghost" onClick={() => setProfileOpen(true)} className="text-sm border border-navy-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </Button>
              <Link to="/chat" className="btn-primary text-sm">
                New Session →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Sessions + Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Insight cards */}
            {insightsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-card p-4 space-y-3">
                    <SkeletonBlock className="w-1/3" />
                    <SkeletonBlock className="w-full h-3" height="h-3" />
                    <SkeletonBlock className="w-2/3 h-3" height="h-3" />
                  </div>
                ))}
              </div>
            ) : (
              insights.insightCards?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {insights.insightCards.map((card, i) => (
                    <InsightCard
                      key={card.type + i}
                      insight={card}
                      onAction={handleInsightAction}
                      index={i}
                    />
                  ))}
                </div>
              )
            )}

            {/* Session history */}
            <div className="glass-card p-6">
              <SessionHistory sessions={sessions} loading={loading} />
            </div>
          </div>

          {/* Right: Memory panel */}
          <div className="space-y-4">
            <MemoryPanel
              memorySummary={memorySummary}
              loading={loading}
              onRefresh={refreshMemory}
            />

            {/* Stats card */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Your Stats</h3>
              <div className="space-y-3">
                <Stat
                  label="Total Sessions"
                  value={loading ? '—' : sessions.length}
                  icon="🗂️"
                />
                <Stat
                  label="Target Role"
                  value={loading ? '—' : profile?.targetRole || 'Not set'}
                  icon="🎯"
                />
                <Stat
                  label="Expertise"
                  value={loading ? '—' : profile?.expertiseLevel || 'Intermediate'}
                  icon="⚡"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Profile edit modal */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="Edit Your Profile">
        <div className="space-y-4">
          <div>
            <label htmlFor="target-role" className="block text-xs font-medium text-slate-400 mb-1.5">
              Target Role
            </label>
            <input
              id="target-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="input-field"
              maxLength={100}
            />
          </div>

          <div>
            <fieldset>
              <legend className="block text-xs font-medium text-slate-400 mb-2">Expertise Level</legend>
              <div className="space-y-2">
                {EXPERTISE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-btn border cursor-pointer transition-all ${
                      expertise === opt.value
                        ? 'border-indigo-500/60 bg-indigo-900/20'
                        : 'border-navy-600 hover:border-navy-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="expertise"
                      value={opt.value}
                      checked={expertise === opt.value}
                      onChange={() => setExpertise(opt.value)}
                      className="accent-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSaveProfile}>Save Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 flex items-center gap-1.5">
        <span aria-hidden="true">{icon}</span> {label}
      </span>
      <span className="text-xs font-medium text-slate-200 capitalize">{value}</span>
    </div>
  );
}
