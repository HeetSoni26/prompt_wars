/**
 * @fileoverview Vitest + React Testing Library setup.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../services/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: {},
  default: {},
}));

// Mock API service
vi.mock('../services/api', () => ({
  createSession: vi.fn().mockResolvedValue({ sessionId: 'test-session', title: 'Test' }),
  sendMessage: vi.fn().mockResolvedValue({
    read: vi.fn().mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"chunk":"Hello"}\n\n') })
      .mockResolvedValueOnce({ done: true }),
  }),
  getSessionMessages: vi.fn().mockResolvedValue([]),
  getMemoryProfile: vi.fn().mockResolvedValue({
    profile: { displayName: 'Test User', targetRole: 'SWE', expertiseLevel: 'intermediate' },
    memorySummary: 'Test memory',
    sessions: [],
  }),
  getSessions: vi.fn().mockResolvedValue([]),
  getInsights: vi.fn().mockResolvedValue({ proactiveInsight: null, insightCards: [] }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({ start: vi.fn() }),
}));

// Suppress console warnings in tests
global.console = { ...console, warn: vi.fn(), error: vi.fn() };
