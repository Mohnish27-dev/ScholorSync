# ScholarSync - Smart Fee & Scholarship TrackerThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



AI-powered scholarship matching, document vault, and fee anomaly detection for students in India.## Getting Started



## FeaturesFirst, run the development server:



### 🎯 Scholarship Radar```bash

AI-powered matching finds scholarships you actually qualify for with personalized match scores using:npm run dev

- Pinecone vector database for semantic search# or

- LangChain with Gemini 2.5 Flash for eligibility analysisyarn dev

- Rule-based filtering combined with AI scoring# or

pnpm dev

### ❓ Why Not Me? Analyzer# or

Discover near-miss scholarships and get actionable steps to become eligible:bun dev

- AI-powered gap analysis```

- Specific recommendations to improve eligibility

- Track progress toward qualificationOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.



### 📄 Document Vault + Auto-FillYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

Upload once, auto-fill everywhere:

- OCR extraction using Tesseract.jsThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- Automatic data parsing from documents

- Secure storage with Firebase Storage## Learn More

- Auto-fill for scholarship applications

To learn more about Next.js, take a look at the following resources:

### 💰 Fee Anomaly Detector

Compare your fees against official structures:- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- Receipt upload and parsing- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- AI-powered anomaly detection

- Comparison with official fee structuresYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- Detailed discrepancy reports

## Deploy on Vercel

### 🔔 Smart Notifications

Never miss a deadline:The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- Personalized alerts for deadlines

- Application status updatesCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- New scholarship matches

### 👥 Community Intelligence
Learn from successful applicants:
- Success stories and tips
- Discussion forums
- Leaderboard for top contributors

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Vector Database**: Pinecone
- **AI/ML**: 
  - LangChain for chain orchestration
  - Google Gemini 2.5 Flash (gemini-2.5-flash-preview-05-20)
  - Google text-embedding-004 for embeddings
- **Web Scraping**: Puppeteer (for NSP and state portals)
- **OCR**: Tesseract.js

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Pinecone account
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scholor-sync
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file and configure:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=scholarships

# Google AI (Gemini) Configuration
GOOGLE_API_KEY=your-google-ai-api-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── documents/     # Document upload & OCR
│   │   ├── fees/          # Fee analysis
│   │   ├── profile/       # User profile
│   │   ├── scholarships/  # Scholarship matching
│   │   └── scraper/       # Web scraping
│   ├── auth/              # Auth pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── auth/             # Auth forms
│   ├── dashboard/        # Dashboard layout
│   ├── documents/        # Document vault
│   ├── fees/             # Fee analyzer
│   ├── scholarships/     # Scholarship components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
├── lib/                  # Utilities
│   ├── firebase/        # Firebase setup
│   ├── langchain/       # LangChain chains
│   └── pinecone/        # Pinecone client
└── types/               # TypeScript types
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scholarships/match` | POST | Get matched scholarships |
| `/api/scholarships/explain` | POST | AI eligibility explanation |
| `/api/scholarships/why-not-me` | POST | Near-miss analysis |
| `/api/documents/upload` | POST | Upload document with OCR |
| `/api/fees/analyze` | POST | Analyze fee receipt |
| `/api/profile/update` | POST | Update user profile |
| `/api/scraper/run` | POST | Run web scraper |

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Create a Firestore database
4. Enable Storage
5. Get your config from Project Settings

## Pinecone Setup

1. Create a Pinecone account at [pinecone.io](https://pinecone.io)
2. Create an index with:
   - Dimension: 768 (for text-embedding-004)
   - Metric: cosine
3. Get your API key from the console

## Google AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Add to your environment variables

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Pages

- `/` - Landing page with features and testimonials
- `/auth/login` - User login
- `/auth/register` - User registration
- `/dashboard` - Main dashboard with overview
- `/dashboard/scholarships` - Scholarship finder with AI matching
- `/dashboard/documents` - Document vault with OCR
- `/dashboard/fees` - Fee analyzer
- `/dashboard/community` - Community discussions
- `/dashboard/profile` - Profile settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details
