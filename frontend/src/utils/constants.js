/**
 * @fileoverview Application-wide constants.
 */

export const APP_NAME = 'CareerPilot';
export const APP_TAGLINE = 'Your AI Career Intelligence Assistant';

export const EXPERTISE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', desc: 'New to job searching' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–5 years experience' },
  { value: 'expert', label: 'Expert', desc: '5+ years, senior level' },
];

export const SUGGESTION_PROMPTS = [
  { icon: '📄', text: 'Review my resume for a Software Engineer role' },
  { icon: '🎯', text: 'Help me prep for a behavioral interview at Google' },
  { icon: '💰', text: 'How do I negotiate a $150K+ salary offer?' },
  { icon: '🔗', text: 'Optimize my LinkedIn headline and summary' },
  { icon: '✉️', text: 'Write a cover letter for a Product Manager position' },
  { icon: '🗺️', text: 'Create a 30-day job search strategy for me' },
];

export const KEYBOARD_SHORTCUTS = {
  newSession: 'n',
  toggleSidebar: 'b',
  focusInput: '/',
  toggleVoice: 'v',
};

export const MAX_MESSAGE_LENGTH = 2000;
export const SESSIONS_PER_PAGE = 20;
