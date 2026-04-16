/**
 * @fileoverview Landing page — hero section, features, and call-to-action.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: '🧠',
    title: 'Persistent AI Memory',
    desc: 'CareerPilot remembers your goals, applications, and interview prep across sessions — no repeating yourself.',
  },
  {
    icon: '🎤',
    title: 'Voice Input & Audio Coaching',
    desc: 'Speak your questions hands-free. Get AI coaching read back to you with natural speech synthesis.',
  },
  {
    icon: '📊',
    title: 'Proactive Insights',
    desc: 'CareerPilot surfaces personalized nudges: "You haven\'t practiced interview answers in 3 days."',
  },
  {
    icon: '⚡',
    title: 'Real-Time Streaming',
    desc: 'Responses stream word-by-word with full markdown formatting. No waiting for complete answers.',
  },
  {
    icon: '🔍',
    title: 'Multi-Step Reasoning',
    desc: 'Complex questions get broken down step-by-step. Resume critique, salary strategy, career pivots — all handled.',
  },
  {
    icon: '🔒',
    title: 'Privacy-First',
    desc: 'Your data is yours. Secured by Firebase, stored in your own Firestore, deleted on request.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-900 bg-glow-indigo overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-sidebar border-b border-navy-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-slate-50 gradient-text">CareerPilot</span>
        </div>
        <Link to="/login" className="btn-primary text-sm">
          Get Started Free
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center" aria-labelledby="hero-heading">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse2" aria-hidden="true" />
            Powered by Gemini 1.5 Pro · Built for Hack2Skill PromptWars
          </div>

          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-50 leading-tight mb-6 text-balance"
          >
            Your AI Career <br />
            <span className="gradient-text">Intelligence Co-pilot</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 text-balance">
            Job seekers waste 40+ hours per job cycle scattered across 10 tools. CareerPilot is the single AI assistant that knows your story, tracks your pipeline, and coaches you to your next offer.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login" className="btn-primary text-base px-8 py-3.5 shadow-glow">
              Start Free Coaching →
            </Link>
            <a
              href="#features"
              className="btn-ghost text-base px-8 py-3.5 border border-navy-600 rounded-btn"
            >
              See Features
            </a>
          </div>

          {/* Social proof */}
          <p className="text-sm text-slate-500 mt-8">
            Gemini API · Firebase · Google Cloud Run · React · TailwindCSS
          </p>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          className="mt-16 max-w-2xl mx-auto glass-card p-1 shadow-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="rounded-[11px] bg-navy-950 p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
              <div className="w-2 h-2 rounded-full bg-warning" aria-hidden="true" />
              <div className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
            </div>
            {/* Mock chat */}
            <div className="space-y-4">
              <div className="flex gap-3 items-start flex-row-reverse">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white flex-shrink-0">RK</div>
                <div className="message-user px-4 py-2.5 text-sm text-slate-100 max-w-xs">
                  I have a Google SWE interview in 48 hours and I'm panicking. Help me.
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="message-ai px-4 py-2.5 text-sm text-slate-200 max-w-sm">
                  <p className="mb-2">Take a breath. 48 hours is enough for a focused sprint. Here's your plan:</p>
                  <p className="font-semibold text-slate-50 mb-1">📋 Hour 1–8: Data Structures</p>
                  <p className="text-slate-400 text-xs mb-2">Focus on arrays, hashmaps, and trees. These cover ~70% of L4 questions.</p>
                  <p className="font-semibold text-slate-50 mb-1">🎯 Hour 9–16: Behavioral Stories</p>
                  <p className="text-slate-400 text-xs">Prep 5 STAR stories. I remember you mentioned the fintech project last month — lead with that.</p>
                  <div className="mt-2 h-2 w-3 bg-indigo-400 rounded-sm animate-blink inline-block" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" aria-labelledby="features-heading">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 id="features-heading" className="text-3xl font-bold text-slate-50 mb-4">
              Features built for real job seekers
            </h2>
            <p className="text-slate-400">Not a generic chatbot. A career co-pilot that knows your story.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.title}
                className="glass-card p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-3xl mb-3 block" aria-hidden="true">{f.icon}</span>
                <h3 className="text-sm font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center" aria-labelledby="cta-heading">
        <motion.div
          className="max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 id="cta-heading" className="text-2xl font-bold text-slate-50 mb-4">Ready to land your next offer?</h2>
          <p className="text-slate-400 mb-8">Join thousands of job seekers who prep smarter with CareerPilot.</p>
          <Link to="/login" className="btn-primary text-base px-10 py-4 shadow-glow">
            Start Free — No Credit Card
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-navy-700 text-center">
        <p className="text-xs text-slate-600">
          CareerPilot · Built for Hack2Skill PromptWars · MIT License
        </p>
      </footer>
    </div>
  );
}
