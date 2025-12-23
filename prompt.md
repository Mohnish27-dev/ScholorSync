# 🏆 ScholarSync — Smart Fee & Scholarship Tracker

*A hackathon-winning reimagination*

---

## 💡 The Winning Angle

Don't just build a "scholarship finder" — build a **Financial Aid Copilot** that feels like having a rich friend who knows all the loopholes.

### Tagline:

> *"Never miss money you deserve."*
> 

---

## 🚀 Killer Features (Beyond Basic)

### 1. **"Scholarship Radar" — Real-time Discovery**

- Puppeteer scrapes NSP, state portals, college sites **daily**
- AI detects NEW scholarships and instantly notifies matching students
- *"A new scholarship was posted 2 hours ago — you're 94% eligible"*

### 2. **"Why Not Me?" Analyzer**

- Shows scholarships you *almost* qualify for
- AI explains what's missing: *"You need 2% more marks"* or *"Get a domicile certificate"*
- Suggests actions to become eligible

### 3. **Document Vault + Auto-Fill**

- Upload documents once (income cert, caste cert, marksheets)
- AI extracts data using OCR
- One-click auto-fill for any application

### 4. **Fee Anomaly Detector**

- Students upload their fee receipts
- AI compares with official fee structure
- Flags: *"You were charged ₹2000 extra for 'Development Fee' — here's the official breakdown"*

### 5. **Scholarship Success Predictor**

- Based on past data: *"Students like you have 73% success rate for this scholarship"*
- Suggests where to focus effort

### 6. **Community Intelligence**

- Anonymous tips: *"The XYZ scholarship actually accepts applications till 15th, not 10th"*
- Students share which scholarships they got (builds success data)

---

## 🛠️ Tech Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                         │
│                    (Tailwind CSS + shadcn/ui)                   │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard │ Scholarship Feed │ Document Vault │ Fee Analyzer   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE + FIRESTORE                        │
├─────────────────────────────────────────────────────────────────┤
│  Users Collection    │  Scholarships Collection  │  Documents   │
│  - profile           │  - eligibility criteria   │  - uploads   │
│  - savedScholarships │  - deadlines              │  - extracted │
│  - appliedList       │  - source URL             │    data      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────────┐
   │  PINECONE  │   │  GEMINI /  │   │   PUPPETEER    │
   │  Vector DB │   │  OPENAI    │   │   Scraper      │
   ├────────────┤   ├────────────┤   ├────────────────┤
   │ Scholarship│   │ Eligibility│   │ NSP, State     │
   │ embeddings │   │ reasoning  │   │ portals,       │
   │ for search │   │ + chat     │   │ college sites  │
   └────────────┘   └────────────┘   └────────────────┘
```

---

## 📁 Firestore Schema

```jsx
// users/{userId}
{
  uid: "firebase-uid",
  email: "[student@college.edu](mailto:student@college.edu)",
  profile: {
    name: "Anurag Mishra",
    category: "General",
    income: 450000,
    percentage: 78.5,
    branch: "Computer Science",
    year: 2,
    state: "Bihar",
    college: "NIT Patna",
    gender: "Male",
    achievements: ["NCC-C", "State-level Chess"]
  },
  documents: {
    incomeCert: { fileUrl: "...", extractedData: {...} },
    marksheet: { fileUrl: "...", extractedData: {...} }
  },
  savedScholarships: ["scholarship-id-1", "scholarship-id-2"],
  appliedScholarships: [
    { id: "...", status: "applied", appliedOn: "..." }
  ],
  notifications: true,
  createdAt: timestamp
}

// scholarships/{scholarshipId}
{
  name: "Post Matric Scholarship for OBC",
  provider: "Ministry of Social Justice",
  type: "government", // government | private | college
  amount: { min: 10000, max: 25000 },
  eligibility: {
    categories: ["OBC"],
    incomeLimit: 800000,
    minPercentage: 50,
    states: ["all"],
    branches: ["all"],
    gender: "all",
    yearRange: [1, 5]
  },
  eligibilityText: "Full raw text for AI parsing...",
  deadline: "2025-03-31",
  applicationUrl: "https://...",
  documentsRequired: ["income_cert", "caste_cert", "marksheet"],
  sourceUrl: "https://...", // where we scraped it from
  scrapedAt: timestamp,
  embedding: [0.023, -0.041, ...] // stored in Pinecone
}

// feeStructures/{collegeId}
{
  collegeName: "NIT Patna",
  branches: {
    "CSE": {
      tuition: 125000,
      hostel: 25000,
      mess: 30000,
      other: { "Development Fee": 5000, "Exam Fee": 2000 }
    }
  },
  lastUpdated: timestamp
}
```

---

## 🔥 API Routes (Next.js)

```
/api/auth/*                → Firebase Auth handlers
/api/profile/update        → Update user profile
/api/scholarships/match    → Get matched scholarships (Pinecone + Firestore)
/api/scholarships/explain  → AI explains eligibility
/api/documents/upload      → Upload + OCR extraction
/api/documents/autofill    → Generate auto-fill data
/api/fees/analyze          → Compare receipt vs official fees
/api/scraper/run           → Trigger Puppeteer scrape (cron job)
/api/notifications/send    → Firebase Cloud Messaging
```

---

## 🎯 Hackathon Demo Flow (5 mins)

| Time | What You Show |
| --- | --- |
| 0:00 | Problem statement — "₹1000 Cr scholarships go unclaimed yearly" |
| 0:30 | Quick profile setup (show pre-filled demo) |
| 1:00 | **WOW moment:** Instant 12 matched scholarships with match % |
| 1:30 | Click one → AI explains eligibility in plain English |
| 2:00 | "Why Not Me?" — Shows near-miss scholarships |
| 2:30 | Upload fee receipt → AI flags ₹2000 discrepancy |
| 3:00 | Document vault → One-click auto-fill demo |
| 3:30 | Show notification: "New scholarship posted 1 hour ago!" |
| 4:00 | Community tips section |
| 4:30 | Tech stack + scalability slide |
| 5:00 | Impact metrics + call to action |

---

## 📅 48-Hour Hackathon Timeline

### Day 1

| Hours | Task |
| --- | --- |
| 0-2 | Setup: Next.js + Firebase + Tailwind + Pinecone |
| 2-5 | Auth + Profile form + Firestore schema |
| 5-8 | Manually add 30 scholarships + embed in Pinecone |
| 8-10 | Matching API (rule-based + vector search) |
| 10-12 | Dashboard UI — scholarship cards with match % |

### Day 2

| Hours | Task |
| --- | --- |
| 12-15 | AI eligibility explainer (Gemini API) |
| 15-17 | Fee analyzer (upload receipt + compare) |
| 17-19 | "Why Not Me?" feature |
| 19-21 | Polish UI + animations |
| 21-23 | Puppeteer scraper (even if basic, show it works) |
| 23-24 | Demo prep + edge case handling |

---

## 🏅 What Makes This a Winner

| Criteria | How You Nail It |
| --- | --- |
| **Innovation** | "Why Not Me?" + Fee Anomaly Detector = novel angles |
| **Impact** | Direct money in students' pockets |
| **Technical Depth** | Pinecone vectors + Puppeteer scraping + AI reasoning |
| **Completeness** | Full flow from discovery → apply → track |
| **Scalability** | Firebase handles scale, Pinecone handles search |
| **Demo Quality** | Clear WOW moments, not just feature list |

---

## 💬 Pitch One-Liner

> *"We're building the CRED for scholarships — students upload their profile once, and we make sure they never miss money they deserve."*
> 

---

Want me to help you with:

- **Detailed component breakdown** for the frontend?
- **Puppeteer scraper code** for NSP/specific portals?
- **Pinecone integration** for semantic scholarship matching?