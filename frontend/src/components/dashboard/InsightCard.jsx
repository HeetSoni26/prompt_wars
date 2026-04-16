/**
 * @fileoverview InsightCard — displays a proactive career insight card.
 */

import { motion } from 'framer-motion';

const PRIORITY_STYLES = {
  high: 'border-indigo-500/40 bg-indigo-900/20',
  medium: 'border-warning/30 bg-yellow-900/10',
  low: 'border-navy-600 bg-navy-800/50',
  welcome: 'border-indigo-500/50 bg-gradient-to-br from-indigo-900/30 to-purple-900/20',
};

const ICONS = {
  welcome: '🚀',
  stats: '📊',
  reminder: '⏰',
  milestone: '🏆',
};

/**
 * Renders a proactive insight card.
 * @param {Object} props
 * @param {Object} props.insight - Insight data {type, title, message, action, priority}
 * @param {Function} props.onAction - Callback when action button is clicked
 * @param {number} props.index - Animation delay index
 */
export default function InsightCard({ insight, onAction, index = 0 }) {
  return (
    <motion.article
      className={`p-4 rounded-card border ${PRIORITY_STYLES[insight.priority] || PRIORITY_STYLES.low}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      aria-label={`Insight: ${insight.title}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
          {ICONS[insight.type] || '💡'}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">{insight.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{insight.message}</p>

          {insight.action && onAction && (
            <motion.button
              onClick={() => onAction(insight)}
              className="mt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              whileHover={{ x: 2 }}
            >
              {insight.action}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
