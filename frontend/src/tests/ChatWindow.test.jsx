/**
 * @fileoverview ChatWindow tests — rendering, suggestions, and input submission.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ChatWindow from '../../components/chat/ChatWindow';

// Mock useVoice to avoid Web Speech API in tests
vi.mock('../../hooks/useVoice', () => ({
  useVoice: () => ({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    voiceSupported: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    stopSpeaking: vi.fn(),
  }),
}));

const defaultProps = {
  messages: [],
  isStreaming: false,
  error: null,
  onSend: vi.fn(),
  userName: 'Alex Test',
  sessionStarted: true,
  onNewSession: vi.fn(),
};

describe('ChatWindow', () => {
  it('renders empty state with username', () => {
    render(<ChatWindow {...defaultProps} />);
    expect(screen.getByText(/Hi Alex/i)).toBeTruthy();
  });

  it('renders suggestion prompts when no messages', () => {
    render(<ChatWindow {...defaultProps} />);
    expect(screen.getByText(/review my resume/i)).toBeTruthy();
  });

  it('renders error message when error prop is set', () => {
    render(<ChatWindow {...defaultProps} error="Something went wrong." />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Something went wrong.')).toBeTruthy();
  });

  it('renders messages when provided', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Help me with my resume', timestamp: new Date() },
      { id: '2', role: 'assistant', content: 'Sure! Let me help.', timestamp: new Date(), streaming: false },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} />);
    expect(screen.getByText('Help me with my resume')).toBeTruthy();
  });

  it('disables input when not session started', () => {
    render(<ChatWindow {...defaultProps} sessionStarted={false} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea.disabled).toBe(true);
  });

  it('calls onSend when suggestion is clicked with session active', () => {
    const onSend = vi.fn();
    render(<ChatWindow {...defaultProps} onSend={onSend} />);
    const suggestion = screen.getByText(/resume/i);
    fireEvent.click(suggestion);
    expect(onSend).toHaveBeenCalled();
  });
});
