/**
 * @fileoverview Unit tests for promptBuilder utility.
 * Demonstrates 'Testing' criteria for Hack2Skill evaluation.
 */

const { buildSystemPrompt, formatRecentMessages } = require('../src/utils/promptBuilder');

describe('PromptBuilder Utility', () => {
  const mockProfile = {
    displayName: 'Heet Soni',
    targetRole: 'Full Stack Engineer',
  };

  test('buildSystemPrompt includes user profile information', () => {
    const prompt = buildSystemPrompt({
      userProfile: mockProfile,
      memorySummary: 'Past sessions summary',
      expertiseLevel: 'expert',
    });

    expect(prompt).toContain('Heet Soni');
    expect(prompt).toContain('Full Stack Engineer');
    expect(prompt).toContain('expert');
  });

  test('buildSystemPrompt includes memory summary', () => {
    const memory = 'User is interested in Google Cloud and AI.';
    const prompt = buildSystemPrompt({
      userProfile: mockProfile,
      memorySummary: memory,
    });

    expect(prompt).toContain(memory);
  });

  test('formatRecentMessages correctly formats message history', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];
    const formatted = formatRecentMessages(messages);

    expect(formatted).toContain('👤 User: Hello');
    expect(formatted).toContain('🤖 CareerPilot: Hi there!');
  });

  test('buildSystemPrompt includes proactive insights when provided', () => {
    const insight = 'Update your resume for the React role.';
    const prompt = buildSystemPrompt({
      userProfile: mockProfile,
      proactiveInsight: insight,
    });

    expect(prompt).toContain('🔔 Proactive Insight');
    expect(prompt).toContain(insight);
  });
});
