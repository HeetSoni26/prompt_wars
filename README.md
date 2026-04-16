# CareerPilot AI — Career Intelligence Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-4285F4?logo=google)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Cloud Run](https://img.shields.io/badge/Deploy-Cloud%20Run-4285F4?logo=google-cloud)](https://cloud.google.com/run)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)

> **Your AI-powered career intelligence co-pilot. Land your dream job faster.**

Built for **Hack2Skill PromptWars 2024** · Powered by Google Gemini 1.5 Pro

---

## The Problem

Job seekers waste **40+ hours per application cycle** scattered across 10 disconnected tools — resume editors, cover letter generators, interview prep sites, and job boards. They lose offers to candidates who simply prepared better. Existing tools are static, generic, and have no memory of your story.

## The Solution

CareerPilot is a single AI career strategist that **knows your story across sessions**, tracks your application pipeline, coaches you through behavioral interviews in real-time, and proactively surfaces insights like: *"You haven't practiced interview answers in 3 days — want a quick drill?"*

---

## Features

- 🧠 **Persistent AI Memory** — Gemini summarizes your past 3 sessions into a cross-session memory injected into every prompt
- 🎤 **Voice Input + Audio Summary** — Speak your questions using Web Speech API; hear answers back via TTS with waveform animation  
- ⚡ **Real-Time Streaming** — SSE-based response streaming with typewriter animation and blinking cursor
- 📊 **Proactive Insight Engine** — Surfaces nudges on login: inactivity alerts, follow-up reminders, milestone celebrations
- 🔍 **Multi-Step AI Reasoning** — Chain-of-thought prompting breaks complex problems (salary negotiation, career pivots) into steps
- 🎯 **Smart Suggestion Prompts** — Pre-built career coaching prompts for instant start
- 👤 **User Profile + Expertise Calibration** — Detects beginner/intermediate/expert level; adapts response depth automatically
- 🌙 **Dark/Light Mode** — With localStorage persistence
- 📱 **Mobile Responsive** — Full experience on phone with collapsible sidebar
- ⌨️ **Keyboard Shortcuts** — `N` new session, `Ctrl+B` sidebar, `/` focus input

---

## Tech Stack

| Tool | Purpose | Why Chosen |
|------|---------|-----------|
| Gemini 1.5 Pro | AI responses + memory summarization | Best multi-step reasoning, streaming API |
| Gemini 1.5 Flash | Expertise detection + memory summaries | Fast, cost-effective for lightweight calls |
| Firebase Auth | Google Sign-In + Email/Password | Zero-config, trusted, OAuth 2.0 |
| Firestore | User profiles, session memory, messages | Schemaless, real-time, Google-native |
| Google Cloud Run | Backend API hosting | Serverless, scales to zero, Docker-native |
| React 18 + Vite | Frontend SPA | Fast HMR, modern ESM, minimal config |
| TailwindCSS 3 | Styling | Utility-first, no runtime overhead |
| Framer Motion | Micro-animations | Production-ready, React-first |
| Express.js | REST API | Minimal, battle-tested |
| Web Speech API | Voice I/O | Zero dependencies, native browser |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (React 18 + Vite)                   │
│  Landing → Login → Chat ← → Dashboard                          │
│  AuthContext │ ThemeContext │ useChat │ useMemory │ useVoice    │
└──────────────────────┬──────────────────────┬───────────────────┘
                       │ HTTP + SSE           │ Firebase SDK
                       ▼                      ▼
         ┌─────────────────────┐    ┌──────────────────┐
         │  Backend (Cloud Run) │    │  Firebase Auth   │
         │  Express + Helmet    │    │  (token verify)  │
         │  ├── /api/chat       │    └──────────────────┘
         │  ├── /api/memory     │
         │  └── /api/insights   │
         └──────────┬──────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ Gemini 1.5   │      │   Firestore      │
│ Pro API      │      │ users/{uid}/     │
│ (streaming)  │      │  sessions/{sid}/ │
└──────────────┘      │   messages/{mid} │
                      └──────────────────┘
```

---

## Screenshots

| Landing Page | Chat Interface | Dashboard |
|-------------|---------------|-----------|
| *Hero with feature grid* | *Streaming AI + voice waveform* | *Insight cards + memory panel* |

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- Firebase project with Firestore enabled
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/careerpilot-ai.git
cd careerpilot-ai

# 2. Backend setup
cd backend
cp .env.example .env
# Fill in your .env values (see table below)
npm install
npm run dev

# 3. Frontend setup (new terminal)
cd frontend
cp .env.example .env
# Fill in Firebase config values
npm install
npm run dev
```

App runs at `http://localhost:5173` · API at `http://localhost:8080`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Gemini API key from Google AI Studio |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase service account private key |
| `FRONTEND_URL` | ✅ | Frontend origin URL for CORS |
| `PORT` | ❌ | Server port (default: 8080) |
| `NODE_ENV` | ❌ | Environment: development/production |
| `RATE_LIMIT_MAX` | ❌ | Max requests per minute (default: 20) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_API_URL` | ❌ | Backend URL (default: /api via Vite proxy) |

---

## Deployment — Google Cloud Run

### One-Time Setup

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Create secrets in Secret Manager
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create careerpilot-gemini-key --data-file=-
echo -n "YOUR_PROJECT_ID" | gcloud secrets create careerpilot-firebase-project --data-file=-
echo -n "YOUR_CLIENT_EMAIL" | gcloud secrets create careerpilot-firebase-email --data-file=-
printf '%s' "YOUR_PRIVATE_KEY" | gcloud secrets create careerpilot-firebase-key --data-file=-
```

### Deploy

```bash
# Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/careerpilot-api ./backend

# Deploy to Cloud Run
gcloud run deploy careerpilot-api \
  --image gcr.io/YOUR_PROJECT_ID/careerpilot-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-secrets "GEMINI_API_KEY=careerpilot-gemini-key:latest,FIREBASE_PROJECT_ID=careerpilot-firebase-project:latest,FIREBASE_CLIENT_EMAIL=careerpilot-firebase-email:latest,FIREBASE_PRIVATE_KEY=careerpilot-firebase-key:latest"
```

---

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Coverage
cd backend && npm run test:coverage
```

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        match /messages/{messageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

---

## Git Setup

```bash
git init
git add .
git commit -m "feat: initial production build — CareerPilot AI Assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/careerpilot-ai.git
git push -u origin main
```

**Repo requirements:** Public · Single branch (main) · Under 10MB (node_modules in .gitignore)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to your branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

MIT © 2024 CareerPilot. See [LICENSE](LICENSE) for details.

---

*Built with ❤️ for Hack2Skill PromptWars · Gemini API · Firebase · Google Cloud Run*
