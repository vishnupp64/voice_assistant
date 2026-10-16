# 🎙️ Multilingual Voice-Controlled AI Agent

A complete, production-grade, multilingual Voice AI Agent web application built with **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS**, and **Google Gemini** using the official `@google/genai` SDK.

The assistant empowers users to speak naturally across multiple languages—including **English (`en-IN`, `en-US`)**, **Malayalam (`ml-IN`)**, **Hindi (`hi-IN`)**, **Tamil (`ta-IN`)**, and **Spanish (`es-ES`)**—receive spoken AI audio responses, and execute authorized server-side actions with secure cryptographic confirmations.

---

## 🌟 Key Features

1. **Natural Multilingual Speech Engine**:
   - Reusable `useSpeechRecognition` hook featuring browser detection, permission tracking, interim & final transcript streaming, and event deduplication.
   - Reusable `useSpeechSynthesis` hook with automatic voice matching, voice refresh on `voiceschanged`, interruption control, repeat, and mute.
   - Built-in locale support for Indian English (`en-IN`), Malayalam (`ml-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), US English (`en-US`), and Spanish (`es-ES`).
2. **Server-Side Function Calling & Agent Tools**:
   - Strict server allowlist of business functions:
     - `searchKnowledge`: Queries clinic operating hours, addresses, policies, and FAQs.
     - `getServices`: Lists healthcare, wellness, and consulting offerings with prices and durations.
     - `checkAvailability`: Verifies date and slot availability.
     - `createBooking`: Consequential action that creates appointment bookings.
3. **Secure 9-Step Tool Execution Pipeline**:
   1. Tool registry verification
   2. Zod argument schema validation
   3. User authentication verification
   4. Resource authorization check
   5. Server-side business rule validation
   6. Consequential action confirmation necessity check
   7. Backend execution of approved operation
   8. Return of verified grounded result to the agent
   9. Privacy-preserving audit logging with secrets redaction
4. **Action Confirmation Workflow**:
   - Consequential operations (such as scheduling an appointment) are never executed immediately or via simple LLM statements.
   - Server issues a cryptographically secure `pendingAction` token with a 5-minute TTL and idempotency key.
   - UI presents a confirmation modal with parameter breakdowns, countdown timer, and dual input support: explicit buttons or voice confirmation ("Confirm" / "Cancel").
   - Separate server endpoint (`/api/actions/confirm`) validates idempotency and prevents replay attacks.
5. **Polished Glassmorphism User Interface**:
   - Central animated microphone button reflecting real-time state: `idle`, `listening`, `processing`, `speaking`, `confirming`, `error`.
   - Audio waveform visualizer responding dynamically to sound states.
   - Real-time interim transcript preview banner.
   - Accessible text-input fallback for keyboard input or unsupported browser environments.
   - Toolbar for Mute, Interrupt/Stop, Replay, and Clear Conversation.
6. **Gemini Live API Ready**:
   - Clean architectural adapter (`lib/live-adapter.ts`) ready for bidirectional streaming audio and text over WebSockets/WebRTC with interruption handling.

---

## 🏗️ Architecture & Project Structure

```
├── app/
│   ├── api/
│   │   ├── actions/confirm/route.ts  # Secure confirmation endpoint with idempotency checks
│   │   ├── assistant/route.ts        # Validated assistant endpoint with rate limiting & tool execution
│   │   └── tts/route.ts              # Server-side audio adapter
│   ├── globals.css                   # Tailwind styles, glassmorphism utilities & animations
│   ├── layout.tsx                    # Root layout with SEO and viewport configuration
│   └── page.tsx                      # Main Voice Assistant application interface
├── components/
│   └── voice/
│       ├── AssistantStateBadge.tsx   # State pill indicator (Ready, Listening, Thinking, etc.)
│       ├── AudioWaveform.tsx         # Waveform audio visualizer
│       ├── ConfirmationDialog.tsx    # Action confirmation modal with countdown timer
│       ├── ConversationHistory.tsx   # Chat bubble feed with verified tool execution badges
│       ├── LanguageSelector.tsx      # Language selector with native names & flags
│       ├── MicButton.tsx             # Central interactive microphone button
│       ├── TextFallbackInput.tsx     # Accessible text input fallback
│       ├── TranscriptView.tsx        # Live interim speech recognition preview
│       └── VoiceControls.tsx         # Toolbar for Mute, Stop, Repeat, Clear
├── hooks/
│   ├── useSpeechRecognition.ts       # SSR-safe Web Speech recognition hook with deduplication
│   ├── useSpeechSynthesis.ts         # Browser Speech synthesis hook with voice discovery
│   └── useVoiceAssistant.ts          # Unified orchestrator hook for state, speech, and API
├── lib/
│   ├── audit.ts                      # Privacy-preserving audit logger with secrets redaction
│   ├── gemini.ts                     # Server-only Gemini client and intelligent tool orchestrator
│   ├── languages.ts                  # Multilingual registry with BCP 47 locales & native greetings
│   ├── live-adapter.ts               # Gemini Live API adapter specification
│   └── rate-limiter.ts               # Sliding window rate limiter with IP tracking
├── services/
│   ├── action-service.ts             # Pending action tokens, TTL expiration, and idempotency
│   └── conversation.ts               # Context window manager, history sanitization, and Zod schemas
├── tools/
│   ├── data-store.ts                 # Realistic in-memory mock business database
│   ├── registry.ts                   # 9-step secure tool pipeline and tool allowlist
│   ├── schemas.ts                    # Zod schemas & Gemini function declarations
│   └── handlers/                     # Handlers for searchKnowledge, getServices, checkAvailability, createBooking
├── tests/
│   ├── actions.test.ts               # Tests for action confirmation, expiration, replay attacks
│   ├── conversation.test.ts          # Tests for history truncation and Zod request validation
│   ├── rate-limiter.test.ts          # Tests for sliding window rate limits & retry-after
│   ├── setup.ts                      # Browser Speech API test mocks
│   ├── speech-hooks.test.tsx         # Tests for speech hooks & voice selection
│   ├── tools.test.ts                 # Tests for tool schemas & 9-step pipeline
│   └── e2e/
│       └── voice-assistant.spec.ts   # Playwright end-to-end tests
├── playwright.config.ts              # Playwright configuration
├── vitest.config.ts                  # Vitest configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm** or **pnpm**

### 2. Installation
```bash
git clone <repository-url>
cd "ai voice assitan"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Google Gemini API Key (AI Studio free tier: https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Models
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_TTS_MODEL=gemini-2.5-flash
GEMINI_LIVE_MODEL=gemini-2.0-flash-exp

# Security & Rate Limiting
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=60000
ACTION_CONFIRMATION_TTL_MS=300000
```

> **Note**: Even without a `GEMINI_API_KEY`, the application is equipped with a grounded simulated fallback engine that parses intents in English, Malayalam, Hindi, and Tamil, interacts with the exact same tools and databases, and triggers the full confirmation workflow so the entire user loop can be tested immediately!

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

### Running Unit & Integration Tests (Vitest)
```bash
npm test
```
All 21 unit tests covering tools, schemas, confirmation workflow, speech recognition & synthesis hooks, rate limiting, and conversation context run and pass cleanly.

### Running End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

---

## 🔒 Security & Privacy Guarantees

- **Zero Secrets on Client**: The `GEMINI_API_KEY` is loaded strictly on the server and is never prefixed with `NEXT_PUBLIC_`.
- **Server Guarded Action Authorization**: The agent cannot execute consequential tasks autonomously; explicit user confirmation with token validation is enforced on every booking or modification.
- **Idempotency Protection**: Every pending action is bound to a unique idempotency key preventing duplicate executions and replay attacks.
- **Privacy-Preserving Audit Logs**: Logs sanitize and redact sensitive values (passwords, tokens, keys) and never record raw microphone audio.
- **Rate Limiting**: Sliding window rate limiter prevents API abuse and denial-of-service attempts.

---

## 🌐 Browser Compatibility & Microphone Access

- **Web Speech API**: Supported natively in Google Chrome, Chromium browsers, Microsoft Edge, and Safari.
- **HTTPS Requirement**: Modern browsers enforce HTTPS for microphone access (except on `localhost`). In production, ensure valid SSL certificates.
- **Fallback**: On browsers without Web Speech recognition, the application automatically displays an advisory badge and activates the accessible text-input fallback.
