<div align="center">

  <img src="public/next.svg" alt="ScholarSync Logo" width="120"/>

  # 🎓 ScholarSync

  ### AI-Powered Scholarship Discovery & Fellowship Platform

  *Never miss money you deserve • Connect students with opportunities*

  [![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.7-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Gemini-2.5-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

  [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**ScholarSync** is a comprehensive platform combining:

1. **🎓 AI-Powered Scholarship Discovery** - Match students with scholarships using vector search and AI
2. **💼 Freelance Fellowships** - Connect students with corporates for paid projects with escrow

### 🎯 Problem Statement

| Problem | Impact |
|---------|--------|
| ₹1,000+ Cr scholarships unclaimed annually | Students miss free money |
| 100+ hours manual scholarship searching | Wasted student time |
| 60% eligible students miss deadlines | Lack of awareness |
| 45% students overpay fees | Unclear fee structures |
| No trusted student-corporate platform | Freelance payment issues |

### 💡 Our Solution

- **Scholarship Radar**: AI finds scholarships you qualify for (95% accuracy)
- **Why Not Me?**: Gap analysis for near-miss scholarships
- **Document Vault**: Upload once, auto-fill everywhere with OCR
- **Fee Detector**: Catch overcharges by comparing receipts
- **Fellowships**: Paid projects with escrow protection

---

## ✨ Features

### 🎓 Scholarship Module

| Feature | Description |
|---------|-------------|
| **Scholarship Radar** | AI-powered matching using Pinecone vector search |
| **Why Not Me?** | Gap analysis showing what you're missing |
| **Document Vault** | OCR extraction and auto-fill |
| **Fee Anomaly Detector** | Compare receipts vs official fees |
| **Smart Notifications** | Deadline reminders and new matches |
| **Community Tips** | Crowd-sourced scholarship insights |

### 💼 Fellowships Module

| Feature | Description |
|---------|-------------|
| **Challenge Marketplace** | Browse corporate challenges |
| **Proposal System** | Submit proposals with cover letters |
| **Escrow Payments** | Razorpay-protected transactions |
| **Project Rooms** | Real-time chat with file sharing |
| **Verification** | Email verification for students |
| **Analytics** | Track submissions and success |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1 | React framework (App Router) |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | 4.0 | Styling |
| shadcn/ui | Latest | Component library |
| Framer Motion | 12.x | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Firebase | 12.7 | Auth, Firestore, Storage |
| Socket.IO | 4.8 | Real-time messaging |
| Razorpay | 2.9 | Payment processing |

### AI/ML
| Technology | Version | Purpose |
|------------|---------|---------|
| Google Gemini | 2.5 Flash | LLM for analysis |
| LangChain | 1.2 | AI orchestration |
| Pinecone | 6.1 | Vector search |
| Tesseract.js | 7.0 | OCR extraction |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Firebase project
- Pinecone account
- Google AI API key
- Razorpay account (for payments)

### Installation

```bash
# Clone repository
git clone https://github.com/JaiswalShivang/ScholarSync.git
cd ScholarSync

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services
GOOGLE_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=scholarships

# Payments
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ScholarSync/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # 14 API modules
│   │   ├── auth/              # Login/Register
│   │   ├── dashboard/         # User dashboard (9 pages)
│   │   └── fellowships/       # Fellowship module (9 pages)
│   │
│   ├── components/            # React components
│   │   ├── ui/               # 34 shadcn components
│   │   └── [feature]/        # Feature components
│   │
│   ├── contexts/              # AuthContext
│   ├── hooks/                 # Custom hooks (3)
│   ├── lib/                   # Utilities (9 modules)
│   └── types/                 # TypeScript types
│
├── server.js                   # Socket.IO server
└── docs/                       # Documentation
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌─────────┐  ┌───────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Landing │  │ Dashboard │  │ Fellowships │  │   Auth   │ │
│  └────┬────┘  └─────┬─────┘  └──────┬──────┘  └────┬─────┘ │
└───────┼─────────────┼───────────────┼──────────────┼────────┘
        │             │               │              │
┌───────┴─────────────┴───────────────┴──────────────┴────────┐
│                     NEXT.JS APP ROUTER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages • Components • Hooks • Contexts               │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────┐
│                        API LAYER                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Scholarsh │ │Documents │ │ Payments │ │  Admin   │ ...   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────────────┐
│                     SERVICE LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │LangChain │ │ Pinecone │ │Socket.IO │ │ Razorpay │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴──────────────┐
│                   EXTERNAL SERVICES                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Firebase │ │  Gemini  │ │ Pinecone │ │ Razorpay │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, diagrams, data flow |
| [API_DOCS.md](docs/API_DOCS.md) | Complete API reference |
| [FRONTEND.md](docs/FRONTEND.md) | Frontend components, hooks, styling |
| [BACKEND.md](docs/BACKEND.md) | Backend services, Firebase, AI |
| [UI_COMPONENTS.md](docs/UI_COMPONENTS.md) | All 46 UI components |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

---

## 🔌 API Documentation

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scholarships/match` | POST | Get scholarship matches |
| `/api/scholarships/explain` | POST | AI eligibility explanation |
| `/api/scholarships/why-not-me` | POST | Gap analysis |
| `/api/documents/upload` | POST | Upload with OCR |
| `/api/fees/analyze` | POST | Fee receipt analysis |
| `/api/payments/create-order` | POST | Create Razorpay order |
| `/api/chatbot` | POST | AI assistant (streaming) |

See [API_DOCS.md](docs/API_DOCS.md) for complete reference.

---

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start with Socket.IO server
npm run dev:next     # Start Next.js only

# Build
npm run build        # Production build
npm start            # Start production server

# Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check
```

---

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JaiswalShivang/ScholarSync)

1. Push code to GitHub
2. Import on Vercel
3. Add environment variables
4. Deploy

> **Note**: Socket.IO requires separate deployment (Railway, Render, etc.)

---

## 🔐 Security

| Feature | Implementation |
|---------|---------------|
| Authentication | Firebase Auth |
| Authorization | Firestore Rules |
| Payments | Razorpay signature verification |
| File Storage | Firebase Storage Rules |
| Admin Access | Environment credentials |

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Application form builder
- [ ] Success rate predictor
- [ ] WhatsApp notifications
- [ ] College-specific pages
- [ ] Referral program

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing`
5. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👥 Team

Created with ❤️ by the ScholarSync team

- **GitHub**: [@JaiswalShivang](https://github.com/JaiswalShivang)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [Pinecone](https://pinecone.io/) - Vector database
- [Google AI](https://ai.google.dev/) - Gemini API
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Hosting

---

<div align="center">
  <p>If ScholarSync helped you, please ⭐ star this repository!</p>
  <p>Made with ❤️ for students across India</p>
</div>
