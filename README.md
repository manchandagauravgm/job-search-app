# Job Search Tracker

An AI-powered job application tracker built with React and Google Gemini. Manage your job pipeline across stages, auto-tailor resumes for each application, and practice interviews with a real-time multimodal AI session.

---

## Features

### 📊 Dashboard & Kanban Board
- **Live stats** showing total tracked, applied, interviewing, and offer counts.
- **Kanban-style columns** for Wishlist → Applied → Interviewing → Offer → Rejected.
- **Inline status updates** — change a job's stage directly from its card via dropdown.
- **Edit and delete** any tracked application.

### 📝 Job Application Modal
- Add or edit job applications with Company, Role, Status, Date, Job Description, and Personal Notes.
- **AI Resume Tailor** — paste a job description and auto-generate a tailored resume using Google Gemini (`gemini-flash-latest`).
- **Download** the tailored resume as `.md` (Markdown) or `.pdf` (styled PDF via `html2pdf.js`).
- **Viewport-constrained modal** with CSS Grid layout (`auto 1fr auto`) ensuring header and footer are always pinned and visible.

### 📄 Resume Hub
- Paste and save your **Master Resume** in plain text or Markdown.
- Stored in `localStorage` and used as the source of truth for AI-tailored resume generation.

### 🎙 Gemini Live (Multimodal)
- **Real-time WebSocket connection** to Google Gemini's `BidiGenerateContent` streaming API (`gemini-2.0-flash-exp`).
- **Screen sharing** — share your desktop and have Gemini analyze what it sees in real time (1 FPS JPEG frame capture).
- **Camera input** — stream your webcam for mock interview practice.
- **Live chat** — send text messages and receive streaming AI responses alongside the video feed.

### 💾 Data Persistence
- All job data is automatically persisted to **localStorage** on every change.
- Firebase/Firestore scaffold is included for future cloud sync (not yet wired up).

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.2.4 |
| **Build Tool** | Vite | 8.0.1 |
| **AI (Text)** | Google Generative AI SDK (`@google/generative-ai`) | 0.24.1 |
| **AI (Live/Multimodal)** | Gemini BidiGenerateContent WebSocket API | v1alpha |
| **Markdown Parsing** | marked | 17.0.5 |
| **PDF Generation** | html2pdf.js | 0.14.0 |
| **Cloud (Scaffold)** | Firebase / Firestore | 12.11.0 |
| **Styling** | Vanilla CSS with glassmorphism design system | — |
| **Linting** | ESLint + eslint-plugin-react-hooks | 9.39.4 |

---

## Project Structure

```
job-search-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── DashboardStats.jsx   # Stats cards (Total, Applied, Interviewing, Offers)
│   │   ├── GeminiLiveModal.jsx  # Multimodal live session (WebSocket + camera/screen)
│   │   ├── JobBoard.jsx         # Kanban board with status columns
│   │   ├── JobModal.jsx         # Add/Edit modal with AI resume tailoring
│   │   └── ResumeHub.jsx        # Master resume editor (localStorage-backed)
│   ├── services/
│   │   ├── aiService.js         # Gemini text generation (resume tailoring)
│   │   └── liveAiService.js     # WebSocket service for Gemini Live streaming
│   ├── firebase.js              # Firebase/Firestore config scaffold
│   ├── App.jsx                  # Root component & state management
│   ├── App.css
│   ├── index.css                # Global design system & modal layout classes
│   └── main.jsx                 # React entry point
├── .env                         # VITE_GEMINI_API_KEY
├── index.html
├── vite.config.js               # Vite config (port 3000)
├── eslint.config.js
└── package.json
```

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- A **Google Gemini API Key** (get one at [Google AI Studio](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd job-search-app

# Install dependencies
npm install

# Configure your API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Yes | Google Gemini API key for AI features |

---

## Architecture

### State Management
- **React `useState` + `useEffect`** — all application state lives in `App.jsx` and is synced to `localStorage` on every change.
- No external state library; props are passed down to child components.

### AI Integration

#### Resume Tailoring (`aiService.js`)
- Uses the `@google/generative-ai` SDK with the `gemini-flash-latest` model.
- Sends a structured prompt containing the user's Master Resume and the target Job Description.
- Returns a Markdown-formatted tailored resume.

#### Gemini Live (`liveAiService.js`)
- Opens a persistent **WebSocket** to `wss://generativelanguage.googleapis.com/ws/...BidiGenerateContent`.
- Sends a setup message specifying `gemini-2.0-flash-exp` with a system instruction for interview coaching.
- Supports three input modes:
  - **Text** — sent as `clientContent` turns.
  - **Screen capture** — desktop frames captured to a hidden `<canvas>`, encoded as base64 JPEG, sent as `realtimeInput.mediaChunks`.
  - **Camera** — webcam frames, same pipeline as screen capture.
- Frame capture runs at **1 FPS** to conserve token usage.

### Design System
- **Dark glassmorphism** theme with CSS custom properties (`--bg-primary`, `--accent-primary`, etc.).
- `backdrop-filter: blur()` for frosted-glass panels.
- Fade-in-up entrance animations with staggered delays.
- **Modal layout** uses a dedicated CSS Grid system (`modal-overlay`, `modal-panel`, `modal-body`, `modal-footer`) with `!important` constraints to guarantee viewport containment.

---

## License

This project is private and not currently licensed for public distribution.
