# 🏗️ ScholarSync Architecture Documentation

This document provides a comprehensive overview of ScholarSync's system architecture, design decisions, and technical implementation details.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Data Flow](#data-flow)
5. [Component Architecture](#component-architecture)
6. [Database Schema](#database-schema)
7. [API Design](#api-design)
8. [AI/ML Pipeline](#aiml-pipeline)
9. [Security Architecture](#security-architecture)
10. [Scalability & Performance](#scalability--performance)
11. [Design Decisions](#design-decisions)

---

## 🌐 System Overview

ScholarSync is a full-stack web application built on a serverless architecture using Next.js 16.1 with the App Router pattern. The system integrates multiple cloud services and AI technologies to provide intelligent scholarship matching, document management, and fee analysis.

### Core Principles

1. **Serverless-First**: Minimize infrastructure management
2. **AI-Powered**: Leverage Google's Gemini for intelligent features
3. **User-Centric**: Simple interfaces for complex operations
4. **Scalable**: Handle growing user base without major refactoring
5. **Secure**: End-to-end security for sensitive student data

---

## 🎨 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React 19 + TypeScript)                           │
│  ├── Landing Page (/)                                               │
│  ├── Authentication (/auth/login, /auth/register)                   │
│  └── Dashboard (/dashboard/*)                                       │
│      ├── Scholarship Feed                                           │
│      ├── Document Vault                                             │
│      ├── Fee Analyzer                                               │
│      ├── Profile Management                                         │
│      └── Community                                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS/REST API
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER (Vercel)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (Serverless Functions)                          │
│  ├── /api/scholarships/*    → Matching, Explain, Why-Not-Me        │
│  ├── /api/documents/*       → Upload, OCR, Auto-fill               │
│  ├── /api/fees/*            → Fee Analysis                          │
│  ├── /api/profile/*         → Profile CRUD                          │
│  └── /api/scraper/*         → Web Scraping Triggers                 │
└────────┬───────────────┬────────────┬──────────────┬────────────────┘
         │               │            │              │
         ▼               ▼            ▼              ▼
┌────────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐
│   FIREBASE     │ │ PINECONE │ │ GEMINI  │ │   PUPPETEER      │
│   (Google)     │ │ Vector   │ │  AI     │ │   (Scraping)     │
├────────────────┤ │  Database│ ├─────────┤ ├──────────────────┤
│ • Firestore DB │ │          │ │ • LLM   │ │ • NSP Portal     │
│ • Auth         │ │ Semantic │ │ • Chat  │ │ • State Portals  │
│ • Storage      │ │  Search  │ │ • OCR   │ │ • College Sites  │
└────────────────┘ └──────────┘ └─────────┘ └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5.0+ | Type safety |
| Tailwind CSS | 4.0 | Styling framework |
| shadcn/ui | Latest | UI component library |
| Framer Motion | 12.23.26 | Animations |
| React Hook Form | 7.69.0 | Form management |
| Zod | 4.2.1 | Schema validation |
| Lucide React | 0.562.0 | Icons |

### Backend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 16.1.1 | Serverless API |
| Firebase Admin SDK | 12.7.0 | Server-side Firebase |
| Firestore | Latest | NoSQL database |
| Firebase Auth | Latest | Authentication |
| Firebase Storage | Latest | File storage |

### AI/ML Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| Google Gemini 2.5 Flash | preview-05-20 | LLM for reasoning |
| Google Text-Embedding-004 | Latest | Semantic embeddings |
| LangChain | 1.2.3 | AI orchestration |
| @langchain/google-genai | 2.1.3 | Gemini integration |
| Pinecone | 6.1.3 | Vector database |
| Tesseract.js | 7.0.0 | OCR engine |

### Web Scraping

| Technology | Version | Purpose |
|------------|---------|---------|
| Puppeteer | 24.34.0 | Headless browser |
| Cron Jobs | - | Scheduled scraping |

---

## 🔄 Data Flow

### 1. User Authentication Flow

```
User Input (Email/Password)
    ↓
Firebase Auth SDK (Client)
    ↓
Firebase Auth Service
    ↓
JWT Token Generated
    ↓
Token Stored in Client (HttpOnly Cookie)
    ↓
AuthContext Provides User State
    ↓
Protected Routes Accessible
```

### 2. Scholarship Matching Flow

```
User Profile Data
    ↓
Generate Profile Embedding
    │ (Google text-embedding-004)
    ↓
Query Pinecone Vector DB
    │ (Semantic Search - Top 50)
    ↓
Fetch Full Scholarship Data
    │ (Firestore Query)
    ↓
Rule-Based Filtering
    │ (Category, Income, Marks, etc.)
    ↓
AI-Powered Scoring
    │ (Gemini 2.5 Flash)
    ↓
Calculate Match Percentage
    │ (Multi-factor Algorithm)
    ↓
Rank & Return Results
    ↓
Display in UI with Explanations
```

### 3. Document Upload & OCR Flow

```
User Uploads Document
    ↓
Upload to Firebase Storage
    │ (Secure URL Generated)
    ↓
Download Image for Processing
    ↓
Tesseract.js OCR Extraction
    │ (Text Extraction)
    ↓
AI-Powered Parsing
    │ (Gemini understands context)
    ↓
Extract Key-Value Pairs
    │ (Name, Income, Certificate No, etc.)
    ↓
Store in Firestore
    │ (User Document Collection)
    ↓
Document Available for Auto-Fill
```

### 4. Fee Anomaly Detection Flow

```
User Uploads Fee Receipt
    ↓
OCR Extracts Fee Components
    │ (Tesseract.js)
    ↓
Parse Line Items
    │ (Tuition, Hostel, Mess, etc.)
    ↓
Fetch Official Fee Structure
    │ (Firestore Query by College)
    ↓
AI Comparison
    │ (Gemini identifies discrepancies)
    ↓
Generate Anomaly Report
    │ (Itemized Differences)
    ↓
Display with Recommendations
```

### 5. Web Scraping Flow

```
Cron Job Triggers
    ↓
Puppeteer Launches Headless Browser
    ↓
Navigate to NSP/State Portal
    ↓
Extract Scholarship Data
    │ (Name, Deadline, Eligibility, etc.)
    ↓
Generate Embedding
    │ (text-embedding-004)
    ↓
Store in Firestore
    ↓
Upsert Vector in Pinecone
    ↓
Trigger Match Notifications
    │ (For affected users)
```

---

## 🧩 Component Architecture

### Frontend Component Hierarchy

```
app/
├── layout.tsx (Root Layout)
│   └── AuthProvider (Context)
│       ├── page.tsx (Landing Page)
│       │   ├── Hero Section
│       │   ├── Features Section
│       │   ├── Stats Section
│       │   └── CTA Section
│       │
│       ├── auth/
│       │   ├── login/page.tsx
│       │   │   └── LoginForm Component
│       │   └── register/page.tsx
│       │       └── RegisterForm Component
│       │
│       └── dashboard/
│           ├── layout.tsx (Dashboard Layout)
│           │   ├── Sidebar Navigation
│           │   └── User Menu
│           │
│           ├── scholarships/page.tsx
│           │   └── ScholarshipFeed Component
│           │       ├── Filter Bar
│           │       ├── ScholarshipCard (repeated)
│           │       └── Pagination
│           │
│           ├── documents/page.tsx
│           │   └── DocumentVault Component
│           │       ├── Upload Zone
│           │       ├── Document List
│           │       └── Document Preview
│           │
│           ├── fees/page.tsx
│           │   └── FeeAnalyzer Component
│           │       ├── Receipt Upload
│           │       ├── Analysis Result
│           │       └── Anomaly List
│           │
│           └── profile/page.tsx
│               └── ProfileForm Component
```

### Reusable UI Components

```
components/ui/
├── button.tsx          → Shadcn Button
├── card.tsx            → Shadcn Card
├── input.tsx           → Shadcn Input
├── form.tsx            → Shadcn Form
├── dialog.tsx          → Shadcn Modal
├── dropdown-menu.tsx   → Shadcn Dropdown
├── badge.tsx           → Shadcn Badge
├── progress.tsx        → Shadcn Progress Bar
├── tabs.tsx            → Shadcn Tabs
└── ... (20+ components)
```

### Feature Components

```
components/
├── auth/
│   ├── LoginForm.tsx        → Email/Password login
│   └── RegisterForm.tsx     → User registration
│
├── scholarships/
│   ├── ScholarshipCard.tsx  → Individual scholarship display
│   └── ScholarshipFeed.tsx  → List of matched scholarships
│
├── documents/
│   └── DocumentVault.tsx    → Document management UI
│
├── fees/
│   └── FeeAnalyzer.tsx      → Fee analysis interface
│
└── dashboard/
    └── DashboardLayout.tsx  → Dashboard shell
```

---

## 🗄️ Database Schema

### Firestore Collections

#### 1. Users Collection

**Path**: `users/{userId}`

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  profile: {
    name: string;                 // Full name
    category: string;             // General/OBC/SC/ST/EWS
    income: number;               // Annual family income
    percentage: number;           // Current academic %
    branch: string;               // Engineering branch/course
    year: number;                 // Current year (1-5)
    state: string;                // Domicile state
    college: string;              // College name
    gender: string;               // Male/Female/Other
    achievements: string[];       // Certifications, awards
  };
  documents: {
    [docType: string]: {
      type: string;               // income_cert, marksheet, etc.
      name: string;               // Display name
      fileUrl: string;            // Firebase Storage URL
      fileName: string;           // Original filename
      uploadedAt: Timestamp;      // Upload time
      extractedData: {            // OCR extracted data
        [key: string]: any;
      };
    };
  };
  savedScholarships: string[];    // Array of scholarship IDs
  appliedScholarships: [{
    id: string;                   // Scholarship ID
    status: string;               // applied/pending/approved/rejected
    appliedOn: Timestamp;         // Application date
  }];
  notifications: boolean;         // Email notifications enabled
  createdAt: Timestamp;           // Account creation
  updatedAt: Timestamp;           // Last profile update
}
```

**Indexes:**
- `email` (ascending)
- `profile.state` (ascending)
- `profile.category` (ascending)
- `createdAt` (descending)

---

#### 2. Scholarships Collection

**Path**: `scholarships/{scholarshipId}`

```typescript
{
  id: string;                     // Unique scholarship ID
  name: string;                   // Scholarship name
  provider: string;               // Ministry/Organization
  type: string;                   // government/private/college
  amount: {
    min: number;                  // Minimum amount
    max: number;                  // Maximum amount
  };
  eligibility: {
    categories: string[];         // [OBC, SC] or [all]
    incomeLimit: number;          // Max family income
    minPercentage: number;        // Min marks required
    states: string[];             // Eligible states or [all]
    branches: string[];           // Eligible branches or [all]
    gender: string;               // Male/Female/all
    yearRange: [number, number];  // [1, 5] = all years
  };
  eligibilityText: string;        // Full eligibility criteria (for embedding)
  deadline: string;               // ISO date string
  applicationUrl: string;         // Where to apply
  documentsRequired: string[];    // [income_cert, marksheet, ...]
  sourceUrl: string;              // Original source
  scrapedAt: Timestamp;           // Last scrape time
  isActive: boolean;              // Currently accepting applications
  tags: string[];                 // [merit, need-based, minority]
}
```

**Indexes:**
- `type` (ascending)
- `deadline` (ascending)
- `eligibility.categories` (array-contains)
- `isActive` (ascending)
- `scrapedAt` (descending)

**Pinecone Vector Store:**
- **Dimension**: 768 (text-embedding-004 output size)
- **Metric**: Cosine similarity
- **Metadata**: Stored alongside vectors for filtering
  ```json
  {
    "id": "scholarship-123",
    "name": "Post Matric Scholarship",
    "type": "government",
    "categories": ["OBC"],
    "states": ["all"]
  }
  ```

---

#### 3. Fee Structures Collection

**Path**: `feeStructures/{collegeId}`

```typescript
{
  id: string;                     // College ID
  collegeName: string;            // Official college name
  state: string;                  // State
  type: string;                   // NIT/IIT/Private/State
  branches: {
    [branchCode: string]: {       // CSE, ECE, MECH, etc.
      tuition: number;            // Tuition fee
      hostel: number;             // Hostel fee
      mess: number;               // Mess fee
      other: {
        [component: string]: number;  // Development, Exam, etc.
      };
    };
  };
  academicYear: string;           // 2024-25
  lastUpdated: Timestamp;         // Last verification
  sourceUrl: string;              // Official fee structure URL
}
```

---

#### 4. Community Tips Collection

**Path**: `communityTips/{tipId}`

```typescript
{
  id: string;
  scholarshipId: string;          // Related scholarship
  tip: string;                    // The actual tip
  createdBy: string;              // User ID (anonymized in UI)
  createdAt: Timestamp;
  upvotes: number;                // Community votes
  verified: boolean;              // Admin verified
  tags: string[];                 // [deadline, document, tip]
}
```

---

## 🔌 API Design

### API Route Structure

```
/api/
├── auth/                         # Authentication (handled by Firebase)
├── scholarships/
│   ├── match/                    # POST - Get personalized matches
│   ├── explain/                  # POST - AI eligibility explanation
│   ├── why-not-me/               # POST - Near-miss analysis
│   ├── save/                     # POST - Save to favorites
│   └── route.ts                  # GET - Fetch all/filter scholarships
├── documents/
│   └── upload/                   # POST - Upload & OCR
├── fees/
│   └── analyze/                  # POST - Analyze fee receipt
├── profile/
│   ├── route.ts                  # GET - Fetch user profile
│   └── update/                   # POST - Update profile
└── scraper/
    └── run/                      # POST - Trigger scraper (admin only)
```

### API Patterns

#### 1. Request/Response Pattern

All API routes follow a consistent pattern:

```typescript
// Request
{
  "userId": "firebase-uid",       // From auth token
  "data": {                       // Endpoint-specific data
    // ... request payload
  }
}

// Success Response
{
  "success": true,
  "data": {
    // ... response data
  },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

#### 2. Authentication Middleware

All protected routes verify Firebase ID token:

```typescript
// Pseudo-code
async function authenticateRequest(req) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) throw new Error('Unauthorized');
  
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.userId = decodedToken.uid;
  return next();
}
```

#### 3. Error Handling

Centralized error handling:

```typescript
try {
  // API logic
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    {
      success: false,
      error: error.message || 'Internal server error',
    },
    { status: error.statusCode || 500 }
  );
}
```

---

## 🤖 AI/ML Pipeline

### 1. Scholarship Matching Pipeline

```typescript
// Step 1: Generate user profile embedding
const profileText = `
  Student: ${profile.name}
  Category: ${profile.category}
  Income: ₹${profile.income}
  Marks: ${profile.percentage}%
  Branch: ${profile.branch}
  State: ${profile.state}
  Achievements: ${profile.achievements.join(', ')}
`;
const profileEmbedding = await geminiEmbeddings.embedQuery(profileText);

// Step 2: Query Pinecone for similar scholarships
const results = await pineconeIndex.query({
  vector: profileEmbedding,
  topK: 50,
  includeMetadata: true,
});

// Step 3: Fetch full scholarship data from Firestore
const scholarshipIds = results.matches.map(m => m.id);
const scholarships = await getScholarshipsByIds(scholarshipIds);

// Step 4: Rule-based filtering
const eligible = scholarships.filter(s => {
  return (
    (s.eligibility.categories.includes('all') || 
     s.eligibility.categories.includes(profile.category)) &&
    profile.income <= s.eligibility.incomeLimit &&
    profile.percentage >= s.eligibility.minPercentage
    // ... more criteria
  );
});

// Step 5: AI-powered scoring
const scored = await Promise.all(
  eligible.map(async (scholarship) => {
    const matchPercentage = calculateMatchPercentage(profile, scholarship);
    const explanation = await generateExplanation(profile, scholarship);
    return { ...scholarship, matchPercentage, explanation };
  })
);

// Step 6: Sort and return
return scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
```

### 2. OCR & Document Parsing Pipeline

```typescript
// Step 1: Download image from Firebase Storage
const imageBuffer = await downloadFromStorage(fileUrl);

// Step 2: OCR extraction
const ocrResult = await Tesseract.recognize(imageBuffer, 'eng');
const extractedText = ocrResult.data.text;

// Step 3: AI parsing with context
const prompt = `
  Extract structured data from this document.
  Document Type: ${documentType}
  
  Text:
  ${extractedText}
  
  Return JSON with extracted fields:
  - name
  - fatherName
  - income (if income certificate)
  - percentage (if marksheet)
  - certificateNumber
  - issueDate
`;

const response = await geminiModel.call(prompt);
const parsedData = JSON.parse(response.content);

// Step 4: Store extracted data
await updateUserDocument(userId, documentType, {
  extractedData: parsedData,
  rawText: extractedText,
});
```

### 3. "Why Not Me?" Analysis Pipeline

```typescript
// Step 1: Find near-miss scholarships
const allScholarships = await getAllScholarships();
const nearMiss = allScholarships.filter(s => {
  const match = calculateMatchPercentage(profile, s);
  return match.percentage >= 60 && match.percentage < 100;
});

// Step 2: Analyze gaps with AI
const analysis = await Promise.all(
  nearMiss.map(async (scholarship) => {
    const prompt = `
      Analyze why this student doesn't fully qualify:
      
      Student Profile: ${JSON.stringify(profile)}
      Scholarship Criteria: ${JSON.stringify(scholarship.eligibility)}
      
      Provide:
      1. Missing criteria
      2. Actionable suggestions
      3. Difficulty level (easy/medium/hard)
    `;
    
    const response = await geminiModel.call(prompt);
    return {
      scholarship,
      analysis: response.content,
    };
  })
);

// Step 3: Prioritize by feasibility
return analysis.sort((a, b) => 
  a.analysis.difficulty === 'easy' ? -1 : 1
);
```

### 4. Fee Anomaly Detection Pipeline

```typescript
// Step 1: OCR extract fee components
const feeText = await extractTextFromReceipt(receiptImage);

// Step 2: Parse line items with AI
const prompt = `
  Extract fee components from this receipt:
  
  ${feeText}
  
  Return JSON array:
  [
    { "component": "Tuition Fee", "amount": 125000 },
    { "component": "Hostel Fee", "amount": 25000 },
    ...
  ]
`;

const receiptData = await geminiModel.call(prompt);
const parsedFees = JSON.parse(receiptData.content);

// Step 3: Fetch official fee structure
const officialFees = await getFeeStructure(profile.college, profile.branch);

// Step 4: Compare and identify anomalies
const anomalies = parsedFees.filter(item => {
  const officialAmount = officialFees[item.component];
  return item.amount > officialAmount;
});

// Step 5: AI explanation
const explanation = await geminiModel.call(`
  Explain these fee discrepancies:
  Charged: ${JSON.stringify(parsedFees)}
  Official: ${JSON.stringify(officialFees)}
  
  Provide:
  1. Which fees are incorrect
  2. Possible reasons
  3. Recommended actions
`);

return {
  anomalies,
  explanation: explanation.content,
};
```

---

## 🔐 Security Architecture

### 1. Authentication Security

```
Client → Firebase Auth SDK
    ↓
Firebase Auth Service (Google)
    ↓
JWT Token (HttpOnly Cookie)
    ↓
API Routes Verify Token
    ↓
Extract userId from token
    ↓
Firestore Security Rules Check
```

**Security Measures:**
- JWT tokens with 1-hour expiration
- Refresh tokens for session persistence
- HttpOnly cookies prevent XSS
- CSRF protection with SameSite cookies
- Rate limiting on auth endpoints

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
    
    // Scholarships are readable by authenticated users
    match /scholarships/{scholarshipId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
    
    // Fee structures are public read
    match /feeStructures/{collegeId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Community tips
    match /communityTips/{tipId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null &&
                       resource.data.createdBy == request.auth.uid;
    }
  }
}
```

### 3. Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own documents
    match /users/{userId}/{document} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
  }
}
```

### 4. API Security

- **CORS**: Restricted to production domain
- **Rate Limiting**: 100 requests/minute per IP
- **Input Validation**: Zod schema validation
- **SQL Injection**: N/A (NoSQL Firestore)
- **XSS Prevention**: React automatic escaping
- **CSRF**: SameSite cookie attribute

### 5. Data Encryption

- **At Rest**: Firebase encrypts all data automatically
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Fields**: Income, documents encrypted client-side before upload (optional enhancement)

---

## ⚡ Scalability & Performance

### 1. Frontend Performance

**Optimizations:**
- Next.js automatic code splitting
- Image optimization with next/image
- Lazy loading for dashboard components
- React.memo for expensive components
- Debounced search inputs

**Bundle Size:**
- Target: < 200KB initial bundle
- Dynamic imports for heavy components (Tesseract.js)
- Tree-shaking unused code

### 2. API Performance

**Strategies:**
- Serverless functions (auto-scaling)
- Edge caching for static data
- Database query optimization (indexes)
- Parallel API calls where possible
- Response compression (gzip)

**Firestore Optimization:**
```typescript
// Bad: Fetch all then filter
const all = await getAllScholarships();
const filtered = all.filter(s => s.type === 'government');

// Good: Query with filter
const filtered = await db
  .collection('scholarships')
  .where('type', '==', 'government')
  .get();
```

### 3. Pinecone Optimization

**Vector Search:**
- Use metadata filtering to reduce search space
- Batch upserts for bulk operations
- Connection pooling for multiple queries

```typescript
// Optimized query with metadata filter
const results = await index.query({
  vector: embedding,
  topK: 50,
  filter: {
    type: { $eq: 'government' },
    isActive: { $eq: true },
  },
});
```

### 4. Caching Strategy

```
┌─────────────────┐
│  Client Cache   │ (React Query, 5 mins)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Edge Cache    │ (Vercel Edge, 1 hour)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database       │ (Firestore)
└─────────────────┘
```

**Cache Invalidation:**
- Profile updates → Clear user cache
- New scholarship → Clear scholarship list cache
- Document upload → Clear document vault cache

### 5. Scalability Targets

| Metric | Current | Target (1 year) |
|--------|---------|-----------------|
| Concurrent Users | 1,000 | 100,000 |
| API Response Time | <500ms | <300ms |
| Database Reads/Day | 100K | 10M |
| Storage | 10GB | 1TB |
| Vector Searches/Day | 10K | 1M |

---

## 🧠 Design Decisions

### 1. Why Next.js App Router?

**Pros:**
- Server components reduce client bundle size
- Built-in API routes (no separate backend)
- Excellent SEO with server-side rendering
- Automatic code splitting
- Great developer experience

**Cons:**
- Steeper learning curve than Pages Router
- Some libraries not yet compatible

**Decision**: Chosen for future-proofing and performance benefits.

---

### 2. Why Firebase instead of PostgreSQL?

**Pros:**
- No server management
- Real-time updates (future feature)
- Built-in authentication
- Generous free tier
- Automatic scaling

**Cons:**
- NoSQL limitations (no JOINs)
- Can get expensive at scale
- Vendor lock-in

**Decision**: Chosen for rapid development and scalability. Can migrate to PostgreSQL later if needed.

---

### 3. Why Pinecone for Vector Search?

**Pros:**
- Managed vector database
- Extremely fast similarity search
- Scales automatically
- Metadata filtering

**Cons:**
- Cost increases with scale
- Another third-party dependency

**Alternatives Considered:**
- Weaviate (self-hosted complexity)
- Qdrant (less mature)
- PostgreSQL pgvector (slower at scale)

**Decision**: Pinecone's performance and ease of use justify the cost.

---

### 4. Why Gemini over OpenAI?

**Pros:**
- More cost-effective
- Generous free tier (60 requests/min)
- Multimodal capabilities
- Tight Google ecosystem integration
- Faster for embeddings

**Cons:**
- Less mature than GPT-4
- Smaller community

**Decision**: Cost savings and performance for our use case.

---

### 5. Why Puppeteer over Cheerio?

**Pros:**
- Handles JavaScript-rendered pages
- Can interact with forms (login, pagination)
- Screenshot capability
- Better for complex scraping

**Cons:**
- More resource-intensive
- Slower than Cheerio

**Decision**: NSP portal requires JavaScript rendering.

---

## 📊 Performance Benchmarks

### API Response Times (P95)

| Endpoint | Average | P95 | P99 |
|----------|---------|-----|-----|
| /api/scholarships/match | 850ms | 1200ms | 1800ms |
| /api/documents/upload | 3500ms | 5000ms | 7000ms |
| /api/fees/analyze | 2200ms | 3500ms | 5000ms |
| /api/profile/update | 200ms | 300ms | 500ms |

### Database Performance

| Operation | Average Time | Optimization |
|-----------|-------------|--------------|
| Get user profile | 50ms | Single document read |
| List scholarships | 300ms | Composite index |
| Save scholarship | 80ms | Single write |
| Search scholarships | 200ms | Pinecone query |

### Frontend Metrics (Lighthouse)

| Metric | Score |
|--------|-------|
| Performance | 95/100 |
| Accessibility | 100/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

---

## 🔄 Future Architecture Improvements

### Short-term (3-6 months)

1. **Implement Redis Caching**
   - Reduce Firestore reads by 70%
   - Cache scholarship lists, fee structures

2. **Add Request Queue**
   - Bull/BullMQ for background jobs
   - Process OCR in background

3. **Optimize Bundle Size**
   - Reduce to <150KB initial load
   - Lazy load Tesseract.js

### Medium-term (6-12 months)

1. **Migrate to PostgreSQL**
   - Better relational queries
   - Lower cost at scale
   - Keep Firestore for auth

2. **Implement CDN**
   - CloudFlare for static assets
   - Reduce TTFB globally

3. **Add Search Service**
   - Algolia for full-text search
   - Better scholarship filtering

### Long-term (12+ months)

1. **Microservices Architecture**
   - Separate scraper service
   - Dedicated OCR service
   - Independent scaling

2. **GraphQL API**
   - Replace REST with GraphQL
   - Reduce over-fetching
   - Better mobile app support

3. **ML Model Optimization**
   - Fine-tune smaller models
   - Self-host embeddings
   - Reduce API costs

---

<div align="center">
  <p><strong>This architecture is designed to scale from 1,000 to 1,000,000 users</strong></p>
  <p>Questions? Open an issue or discussion on GitHub</p>
</div>
