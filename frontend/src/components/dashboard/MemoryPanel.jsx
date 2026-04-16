/**
 * @fileoverview MemoryPanel — displays AI-generated cross-session memory summary.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MemorySkeleton } from '../ui/SkeletonLoader';
import Button from '../ui/Button';

/**
 * Panel showing the AI memory summary with refresh capability.
 * @param {Object} props
 * @param {string} props.memorySummary - AI-generated memory text
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRefresh - Callback to regenerate summary
 */
export default function MemoryPanel({ memorySummary, loading, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <motion.section
      className="glass-card p-5"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      aria-label="AI Memory Summary"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-indigo-600/30 flex items-center justify-center" aria-hidden="true">
            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          AI Memory
        </h2>

        <Button
          variant="ghost"
          onClick={handleRefresh}
          loading={refreshing}
          className="text-xs px-2 py-1"
          aria-label="Regenerate memory summary"
        >
          {!refreshing && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </Button>
      </div>

      {loading ? (
        <MemorySkeleton />
      ) : memorySummary ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          aria-live="polite"
        >
          <p className="text-xs text-slate-400 leading-relaxed">{memorySummary}</p>
          <div className="mt-3 pt-3 border-t border-navy-700">
            <p className="text-[10px] text-slate-600">
              Powered by Gemini 1.5 · Updated on session end
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-xs text-slate-500">No memory generated yet.<br />Complete a session to build your AI memory.</p>
        </div>
      )}
    </motion.section>
  );
}
