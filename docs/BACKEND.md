# ⚙️ ScholarSync Backend Documentation

> Complete guide to the backend architecture, services, and integrations.

---

## 🏗️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 16.1 | Serverless API endpoints |
| Firebase Admin | 13.6 | Server-side Firebase |
| Firebase Firestore | - | NoSQL database |
| Firebase Storage | - | File storage |
| LangChain | 1.2.3 | AI orchestration |
| Google Gemini | 2.5 Flash | LLM provider |
| Pinecone | 6.1 | Vector database |
| Socket.IO | 4.8.3 | Real-time communication |
| Razorpay | 2.9.6 | Payment gateway |
| Tesseract.js | 7.0 | OCR engine |
| Nodemailer | 7.0 | Email sending |
| Puppeteer | 24.x | Web scraping |

---

## 📁 Backend Structure

```
src/
├── app/api/                      # API Routes
│   ├── admin/                   # Admin operations
│   ├── analytics/               # User analytics
│   ├── calendar/                # Calendar events
│   ├── chatbot/                 # AI assistant
│   ├── community/               # Community features
│   ├── documents/               # Document management
│   ├── email/                   # Email verification
│   ├── fees/                    # Fee analysis
│   ├── intelligence/            # AI intelligence
│   ├── payments/                # Payment processing
│   ├── profile/                 # User profiles
│   ├── scholarships/            # Scholarship matching
│   ├── scraper/                 # Web scraping
│   └── stacking/                # Scholarship stacking
│
├── lib/                          # Backend Libraries
│   ├── chatbot/                 # Chatbot logic
│   ├── email/                   # Email configuration
│   ├── embeddings/              # Embedding utilities
│   ├── firebase/                # Firebase modules
│   │   ├── admin.ts             # Admin SDK
│   │   ├── config.ts            # Configuration
│   │   ├── fellowships.ts       # Fellowship operations
│   │   ├── firestore.ts         # Database operations
│   │   └── storage.ts           # File storage
│   ├── langchain/               # AI chains
│   │   ├── chains.ts            # LangChain chains
│   │   └── config.ts            # LLM configuration
│   ├── pinecone/                # Vector database
│   ├── razorpay/                # Payment client
│   ├── scraper/                 # Web scraper
│   └── socket/                  # Socket events
│
└── server.js                     # Custom Socket.IO server
```

---

## 🔥 Firebase Integration

### Configuration (`lib/firebase/config.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);
```

### Firestore Operations (`lib/firebase/firestore.ts`)

```typescript
// 23 Functions Available:

// User Operations
createUser(userId: string, userData: Partial<User>): Promise<void>
getUser(userId: string): Promise<User | null>
updateUser(userId: string, userData: Partial<User>): Promise<void>
updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void>

// Scholarship Operations
getScholarship(scholarshipId: string): Promise<Scholarship | null>
getAllScholarships(): Promise<Scholarship[]>
getScholarshipsByType(type: ScholarshipType): Promise<Scholarship[]>
createScholarship(scholarship: Omit<Scholarship, 'id'>): Promise<string>
updateScholarship(scholarshipId: string, data: Partial<Scholarship>): Promise<void>

// Fee Operations
getFeeStructure(collegeId: string): Promise<FeeStructure | null>
getFeeStructureByCollegeName(collegeName: string): Promise<FeeStructure | null>
createFeeStructure(feeStructure: Omit<FeeStructure, 'id'>): Promise<string>

// Community Tips
getCommunityTips(scholarshipId: string): Promise<CommunityTip[]>
createCommunityTip(tip: Omit<CommunityTip, 'id'>): Promise<string>

// Notifications
getUserNotifications(userId: string): Promise<Notification[]>
createNotification(notification: Omit<Notification, 'id'>): Promise<string>
markNotificationAsRead(notificationId: string): Promise<void>

// Scholarship Actions
saveScholarship(userId: string, scholarshipId: string): Promise<void>
unsaveScholarship(userId: string, scholarshipId: string): Promise<void>
applyForScholarship(userId: string, scholarshipId: string): Promise<void>
```

### Fellowship Operations (`lib/firebase/fellowships.ts`)

```typescript
// 37 Functions Available:

// Challenge Operations
createChallenge(challenge: Omit<Challenge, 'id'>): Promise<string>
getChallenge(challengeId: string): Promise<Challenge | null>
getChallenges(filters?: ChallengeFilters): Promise<Challenge[]>
getOpenChallenges(limitCount?: number): Promise<Challenge[]>
updateChallenge(challengeId: string, data: Partial<Challenge>): Promise<void>
updateChallengeStatus(challengeId: string, status: ChallengeStatus): Promise<void>

// Proposal Operations
createProposal(proposal: Omit<Proposal, 'id'>): Promise<string>
getProposal(proposalId: string): Promise<Proposal | null>
getProposalsByChallenge(challengeId: string): Promise<Proposal[]>
getProposalsByStudent(studentId: string): Promise<Proposal[]>
updateProposalStatus(proposalId: string, status: ProposalStatus): Promise<void>
hasStudentApplied(challengeId: string, studentId: string): Promise<boolean>

// Project Room Operations
createProjectRoom(room: Omit<ProjectRoom, 'id'>): Promise<string>
getProjectRoom(roomId: string): Promise<ProjectRoom | null>
getProjectRoomByChallenge(challengeId: string): Promise<ProjectRoom | null>
getProjectRoomsByUser(userId: string): Promise<ProjectRoom[]>
updateEscrowStatus(roomId: string, escrowStatus: EscrowStatus): Promise<void>

// Room Messages
createRoomMessage(message: Omit<RoomMessage, 'id'>): Promise<string>
getRoomMessages(roomId: string, limitCount?: number): Promise<RoomMessage[]>

// User Verification
getUserFellowshipProfile(userId: string): Promise<FellowshipUserProfile | null>
updateUserFellowshipProfile(userId: string, data: FellowshipUserProfile): Promise<void>
verifyStudentByEmail(userId: string, email: string): Promise<VerificationResult>
verifyStudentManually(userId: string): Promise<void>

// Escrow Flow
initiateProposalSelection(challengeId: string, proposalId: string): Promise<void>
confirmProposalSelection(challengeId: string, proposalId: string): Promise<string>
selectProposalAndCreateRoom(challengeId: string, proposalId: string): Promise<string>
```

---

## 🤖 AI/ML Integration

### LangChain Configuration (`lib/langchain/config.ts`)

```typescript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export const geminiModel = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-preview-05-20',
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.3,
});

export const embeddingModel = new GoogleGenerativeAIEmbeddings({
  model: 'text-embedding-004',
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  return embeddingModel.embedQuery(text);
}
```

### AI Chains (`lib/langchain/chains.ts`)

| Chain | Function | Purpose |
|-------|----------|---------|
| Eligibility Explainer | `explainEligibility()` | Explain scholarship match |
| Why Not Me | `analyzeWhyNotMe()` | Gap analysis |
| Success Predictor | `predictSuccess()` | Success rate prediction |
| Fee Analyzer | `analyzeFeeAnomaly()` | Compare fees |
| Document Extractor | `extractDocumentData()` | Parse OCR text |
| Profile Embedding | `generateProfileEmbedding()` | Create user vector |
| Scholarship Embedding | `generateScholarshipEmbedding()` | Create scholarship vector |

### Example Chain Implementation

```typescript
const eligibilityPrompt = PromptTemplate.fromTemplate(`
You are a scholarship eligibility expert. Analyze whether this student qualifies.

Student Profile:
- Name: {name}
- Category: {category}
- Income: ₹{income}
- Percentage: {percentage}%
...

Scholarship Requirements:
- Eligible Categories: {eligibleCategories}
- Income Limit: ₹{incomeLimit}
- Minimum Percentage: {minPercentage}%
...

Provide a JSON response with:
{
  "eligible": boolean,
  "matchPercentage": number,
  "explanation": "Friendly explanation",
  "meetsCriteria": [...],
  "missedCriteria": [...],
  "suggestions": [...]
}
`);

export async function explainEligibility(
  profile: UserProfile,
  scholarship: Scholarship
): Promise<EligibilityExplanation> {
  const chain = RunnableSequence.from([
    eligibilityPrompt,
    geminiModel,
    new StringOutputParser(),
  ]);
  
  const result = await chain.invoke({
    name: profile.name,
    category: profile.category,
    // ... more fields
  });
  
  return JSON.parse(result);
}
```

---

## 🎯 Pinecone Vector Database

### Client Setup (`lib/pinecone/client.ts`)

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

export const getScholarshipsIndex = () => {
  return pinecone.index(process.env.PINECONE_INDEX_NAME || 'scholarships');
};
```

### Operations

```typescript
// Upsert scholarship embedding
upsertScholarshipEmbedding(
  scholarshipId: string,
  embedding: number[],
  metadata: RecordMetadata
): Promise<void>

// Query similar scholarships
querySimilarScholarships(
  queryEmbedding: number[],
  topK: number = 10,
  filter?: RecordMetadata
): Promise<Match[]>

// Delete scholarship
deleteScholarshipEmbedding(scholarshipId: string): Promise<void>

// Batch upsert (batches of 100)
batchUpsertScholarshipEmbeddings(
  scholarships: Array<{
    id: string;
    embedding: number[];
    metadata: RecordMetadata;
  }>
): Promise<void>
```

---

## 💬 Socket.IO Server (`server.js`)

### Server Setup

```javascript
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? '*' : process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket event handlers...
});
```

### Socket Events

```javascript
const SOCKET_EVENTS = {
  // Room Management
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  ROOM_USERS: 'room-users',
  
  // Messaging
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  
  // Typing
  USER_TYPING: 'user-typing',
  
  // Files
  FILE_UPLOADED: 'file-uploaded',
  
  // Presence
  GET_ROOMS_PRESENCE: 'get-rooms-presence',
  ROOMS_PRESENCE: 'rooms-presence',
};
```

### Room Management

```javascript
// Track users in rooms
const roomUsers = new Map(); // roomId -> Set of users

function addUserToRoom(roomId, user) {
  if (!roomUsers.has(roomId)) {
    roomUsers.set(roomId, new Set());
  }
  roomUsers.get(roomId).add(user);
}

function removeUserFromRoom(roomId, socketId) {
  if (roomUsers.has(roomId)) {
    const users = roomUsers.get(roomId);
    for (const user of users) {
      if (user.socketId === socketId) {
        users.delete(user);
        break;
      }
    }
  }
}

function getUsersInRoom(roomId) {
  if (!roomUsers.has(roomId)) return [];
  return Array.from(roomUsers.get(roomId));
}
```

---

## 💳 Razorpay Integration

### Client Setup (`lib/razorpay/client.ts`)

```typescript
import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

### Payment Flow

1. **Create Order** (`/api/payments/create-order`)
   ```typescript
   const order = await razorpay.orders.create({
     amount: amount * 100, // in paise
     currency: 'INR',
     receipt: `challenge_${challengeId}_${Date.now()}`.slice(0, 40),
   });
   ```

2. **Verify Payment** (`/api/payments/verify-payment`)
   ```typescript
   import crypto from 'crypto';
   
   const generatedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
     .update(`${orderId}|${paymentId}`)
     .digest('hex');
   
   const isValid = generatedSignature === signature;
   ```

3. **Confirm Escrow** (`/api/payments/escrow-confirm`)
   ```typescript
   await updateEscrowStatus(roomId, 'released');
   ```

---

## 📧 Email Service

### Nodemailer Setup (`lib/email/config.ts`)

```typescript
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Email Types

| Endpoint | Purpose |
|----------|---------|
| `/api/email/send-verification` | Send verification link |
| `/api/email/verify` | Verify token |
| `/api/email/check-status` | Check verification status |

---

## 🔍 OCR with Tesseract.js

### Fee Receipt Analysis

```typescript
import Tesseract from 'tesseract.js';

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<string> {
  const result = await Tesseract.recognize(imageBuffer, 'eng');
  return result.data.text;
}

// Usage in API route
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const receiptText = await Tesseract.recognize(buffer, 'eng');
```

---

## 🕷️ Web Scraper (`lib/scraper/`)

### Puppeteer Scraper

```typescript
import puppeteer from 'puppeteer';

export async function scrapeScholarships(source: string) {
  const browser = await puppeteer.launch({
    headless: 'new',
  });
  
  const page = await browser.newPage();
  await page.goto(source);
  
  // Extract scholarship data
  const scholarships = await page.evaluate(() => {
    // DOM parsing logic
  });
  
  await browser.close();
  return scholarships;
}
```

### Supported Sources

| Source | URL | Data |
|--------|-----|------|
| NSP | scholarships.gov.in | Government scholarships |
| State Portals | Various | State-specific scholarships |
| College Websites | Various | Institutional scholarships |

---

## 🔐 Security

### Admin Authentication

```typescript
// api/admin/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  const isAdmin = 
    email === process.env.ADMIN_EMAIL && 
    password === process.env.ADMIN_PASSWORD;
  
  if (isAdmin) {
    return NextResponse.json({
      success: true,
      data: { isAdmin: true },
    });
  }
  
  return NextResponse.json(
    { success: false, error: 'Invalid credentials' },
    { status: 401 }
  );
}
```

### Firebase Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (for server-side)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# Google AI
GOOGLE_API_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=scholarships

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email
EMAIL_USER=
EMAIL_PASSWORD=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Database Collections

| Collection | Description |
|------------|-------------|
| `users` | User profiles and documents |
| `scholarships` | Scholarship listings |
| `feeStructures` | Official fee data |
| `communityTips` | User-submitted tips |
| `notifications` | User notifications |
| `challenges` | Fellowship challenges |
| `proposals` | Challenge proposals |
| `projectRooms` | Active project rooms |
| `roomMessages` | Chat messages |

---

*Last Updated: January 2026*
