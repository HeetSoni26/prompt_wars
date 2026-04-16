/**
 * @fileoverview Jest test environment setup.
 * Sets required environment variables for testing.
 * NOTE: jest.mock() calls are hoisted by Jest before any variable declarations.
 * All mock implementations must be fully self-contained within jest.mock() factory fns.
 */

process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.iam.gserviceaccount.com';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.PORT = '8081';

// Mock Firebase Admin — fully self-contained factory
jest.mock('firebase-admin', () => {
  const mockProfileData = {
    uid: 'test-uid',
    displayName: 'Test User',
    memorySummary: 'Test summary',
    targetRole: 'SWE',
    expertiseLevel: 'intermediate',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Message sub-collection mock
  const mockMessageCol = {
    doc: jest.fn().mockReturnValue({
      set: jest.fn().mockResolvedValue({}),
    }),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };

  // Session document mock
  const mockSessionDoc = {
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ title: 'Test', messageCount: 0 }) }),
    collection: jest.fn().mockReturnValue(mockMessageCol),
  };

  // Sessions collection mock
  const mockSessionsCol = {
    doc: jest.fn().mockReturnValue(mockSessionDoc),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [] }),
  };

  // User document mock
  const mockUserDoc = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => mockProfileData,
    }),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    collection: jest.fn().mockReturnValue(mockSessionsCol),
  };

  // Root users collection mock
  const mockUsersCol = {
    doc: jest.fn().mockReturnValue(mockUserDoc),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
      }),
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn().mockReturnValue(mockUsersCol),
    })),
    FieldValue: {
      serverTimestamp: jest.fn(() => new Date()),
      increment: jest.fn((n) => n),
    },
  };
});

// Mock Gemini — fully self-contained factory
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      startChat: jest.fn().mockReturnValue({
        sendMessageStream: jest.fn().mockResolvedValue({
          // Async generator that yields one chunk then ends
          stream: (async function* () {
            yield { text: () => 'Mocked AI response' };
          })(),
        }),
      }),
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'intermediate' },
      }),
    }),
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));
