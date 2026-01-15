# 📡 ScholarSync API Documentation

> Complete reference for all API endpoints, request/response formats, and authentication.

---

## 🔐 Authentication

All API routes require authentication via Firebase Auth. Include the user's `uid` in request bodies or query parameters.

### Headers

```http
Content-Type: application/json
```

> **Note**: For file uploads, use `multipart/form-data`.

---

## 📚 API Modules Overview

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Scholarships](#-scholarships-api) | 5 | Matching, explanation, and saving |
| [Documents](#-documents-api) | 2 | Upload and delete with OCR |
| [Fees](#-fees-api) | 1 | Receipt analysis |
| [Profile](#-profile-api) | 2 | User profile management |
| [Payments](#-payments-api) | 3 | Razorpay integration |
| [Email](#-email-api) | 3 | Verification system |
| [Admin](#-admin-api) | 9 | Administrative operations |
| [Chatbot](#-chatbot-api) | 1 | AI assistant |
| [Community](#-community-api) | 1 | Tips and discussions |
| [Scraper](#-scraper-api) | 1 | Web scraping trigger |

---

## 🎓 Scholarships API

### Match Scholarships

Get personalized scholarship matches for a user.

```http
POST /api/scholarships/match
```

**Request Body:**

```json
{
  "uid": "firebase-user-id",
  "useVectorSearch": true
}
```

**Response:**

```json
{
  "success": true,
  "scholarships": [
    {
      "id": "scholarship-1",
      "name": "National Merit Scholarship",
      "provider": "Ministry of Education",
      "type": "government",
      "amount": { "min": 50000, "max": 100000 },
      "matchPercentage": 95,
      "matchReasons": [
        "Category: SC",
        "Income within limit",
        "Academic: 85%"
      ],
      "missingCriteria": [],
      "deadline": "2026-03-31",
      "applicationUrl": "https://nsp.gov.in"
    }
  ],
  "count": 25
}
```

| Field | Type | Description |
|-------|------|-------------|
| `matchPercentage` | number | 0-100 score based on eligibility |
| `matchReasons` | string[] | Criteria the user meets |
| `missingCriteria` | string[] | Criteria the user doesn't meet |

---

### Get Scholarships (GET Method)

```http
GET /api/scholarships/match?userId={uid}&vectorSearch=true
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | Firebase user ID |
| `vectorSearch` | boolean | No | Enable semantic search |

---

### Explain Eligibility

Get AI-powered explanation for a specific scholarship match.

```http
POST /api/scholarships/explain
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "scholarshipId": "scholarship-id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "eligible": true,
    "matchPercentage": 92,
    "explanation": "You are an excellent match for this scholarship! Your SC category and academic performance of 85% exceed the minimum requirements.",
    "meetsCriteria": [
      "Category matches (SC)",
      "Income below ₹2.5L limit",
      "Percentage above 60% minimum"
    ],
    "missedCriteria": [
      "State preference (available in 5 states)"
    ],
    "suggestions": [
      "Apply before the deadline on March 31st",
      "Ensure income certificate is updated"
    ]
  }
}
```

---

### Why Not Me Analysis

Analyze why a user doesn't fully qualify and get improvement suggestions.

```http
POST /api/scholarships/why-not-me
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "scholarshipId": "scholarship-id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "gapPercentage": 15,
    "missingCriteria": [
      {
        "criterion": "Minimum Percentage",
        "currentValue": "72%",
        "requiredValue": "75%",
        "actionable": true,
        "suggestion": "Focus on improving grades by 3% in the next semester"
      },
      {
        "criterion": "State Requirement",
        "currentValue": "Maharashtra",
        "requiredValue": "Karnataka, Tamil Nadu",
        "actionable": false,
        "suggestion": "This criterion cannot be changed, but consider similar scholarships in your state"
      }
    ]
  }
}
```

---

### Save Scholarship

Save a scholarship to user's favorites.

```http
POST /api/scholarships/save
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "scholarshipId": "scholarship-id",
  "action": "save"
}
```

| Action | Description |
|--------|-------------|
| `save` | Add to saved scholarships |
| `unsave` | Remove from saved scholarships |

**Response:**

```json
{
  "success": true,
  "message": "Scholarship saved successfully"
}
```

---

### Get All Scholarships

Retrieve all scholarships from the database.

```http
GET /api/scholarships
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "scholarship-1",
      "name": "National Merit Scholarship",
      "provider": "Ministry of Education",
      "type": "government",
      "amount": { "min": 50000, "max": 100000 },
      "eligibility": {
        "categories": ["SC", "ST", "OBC"],
        "incomeLimit": 250000,
        "minPercentage": 60,
        "states": ["all"],
        "gender": "all",
        "yearRange": [1, 4]
      },
      "deadline": "2026-03-31"
    }
  ]
}
```

---

## 📄 Documents API

### Upload Document

Upload a document with automatic OCR extraction.

```http
POST /api/documents/upload
```

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document image/PDF |
| `userId` | string | Yes | Firebase user ID |
| `documentType` | string | Yes | Type of document |

**Document Types:**

- `incomeCert` - Income Certificate
- `casteCert` - Caste/Category Certificate
- `marksheet` - Academic Marksheet
- `domicile` - Domicile Certificate
- `aadhaar` - Aadhaar Card

**Response:**

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.firebase.com/...",
    "fileName": "income_certificate.pdf",
    "documentType": "incomeCert",
    "extractedData": {
      "name": "John Doe",
      "annualIncome": 200000,
      "issuedBy": "Revenue Department",
      "issueDate": "2025-01-15"
    }
  }
}
```

---

### Delete Document

Remove a document from storage.

```http
DELETE /api/documents/delete
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "documentType": "incomeCert"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 💰 Fees API

### Analyze Fee Receipt

Upload a fee receipt and compare against official structure.

```http
POST /api/fees/analyze
```

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Fee receipt image |
| `userId` | string | Yes | Firebase user ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "receiptTotal": 125000,
    "expectedTotal": 110000,
    "overchargeAmount": 15000,
    "anomalies": [
      {
        "category": "Tuition Fee",
        "expectedAmount": 75000,
        "chargedAmount": 80000,
        "difference": 5000,
        "explanation": "Tuition fee exceeds official structure by ₹5,000"
      },
      {
        "category": "Development Fee",
        "expectedAmount": 5000,
        "chargedAmount": 15000,
        "difference": 10000,
        "explanation": "Development fee charged is 3x the official rate"
      }
    ],
    "recommendation": "Contact the fee department with this report to request clarification and potential refund of ₹15,000"
  }
}
```

---

## 👤 Profile API

### Get User Profile

```http
GET /api/profile?userId={uid}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "profile": {
      "name": "John Doe",
      "category": "OBC",
      "income": 300000,
      "percentage": 82.5,
      "branch": "Computer Science",
      "year": 3,
      "state": "Maharashtra",
      "college": "IIT Bombay",
      "gender": "Male",
      "achievements": ["Hackathon Winner", "Published Paper"]
    },
    "documents": {
      "incomeCert": { "fileUrl": "...", "uploadedAt": "..." },
      "marksheet": { "fileUrl": "...", "uploadedAt": "..." }
    },
    "savedScholarships": ["scholarship-1", "scholarship-2"],
    "appliedScholarships": [
      { "id": "scholarship-3", "status": "pending", "appliedOn": "2026-01-10" }
    ]
  }
}
```

---

### Update User Profile

```http
POST /api/profile/update
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "profile": {
    "name": "John Doe",
    "category": "OBC",
    "income": 300000,
    "percentage": 85.0,
    "branch": "Computer Science",
    "year": 3,
    "state": "Maharashtra",
    "college": "IIT Bombay",
    "gender": "Male",
    "achievements": ["Hackathon Winner", "Published Paper", "Dean's List"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 💳 Payments API

### Create Payment Order

Initialize a Razorpay payment for fellowship escrow.

```http
POST /api/payments/create-order
```

**Request Body:**

```json
{
  "amount": 50000,
  "challengeId": "challenge-id",
  "proposalId": "proposal-id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderId": "order_XYZ123",
    "amount": 50000,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

---

### Verify Payment

Verify Razorpay payment signature after completion.

```http
POST /api/payments/verify-payment
```

**Request Body:**

```json
{
  "razorpay_order_id": "order_XYZ123",
  "razorpay_payment_id": "pay_ABC456",
  "razorpay_signature": "signature-hash",
  "challengeId": "challenge-id",
  "proposalId": "proposal-id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "roomId": "project-room-id"
  }
}
```

---

### Confirm Escrow Release

Release funds from escrow after project completion.

```http
POST /api/payments/escrow-confirm
```

**Request Body:**

```json
{
  "roomId": "project-room-id",
  "action": "release"
}
```

| Action | Description |
|--------|-------------|
| `release` | Release funds to student |
| `dispute` | Raise dispute for review |

---

## 📧 Email API

### Send Verification Email

```http
POST /api/email/send-verification
```

**Request Body:**

```json
{
  "userId": "firebase-user-id",
  "email": "student@university.edu"
}
```

---

### Verify Email Token

```http
POST /api/email/verify
```

**Request Body:**

```json
{
  "token": "verification-token",
  "userId": "firebase-user-id"
}
```

---

### Check Verification Status

```http
GET /api/email/check-status?userId={uid}
```

---

## 🔧 Admin API

### Admin Login

```http
POST /api/admin/login
```

**Request Body:**

```json
{
  "email": "admin@scholarsync.com",
  "password": "admin-password"
}
```

---

### Admin Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin` | GET | Get admin dashboard data |
| `/api/admin/users` | GET | List all users |
| `/api/admin/scholarships` | GET/POST | Manage scholarships |
| `/api/admin/applications` | GET | View applications |
| `/api/admin/proposals` | GET | Manage fellowship proposals |
| `/api/admin/rooms` | GET | List project rooms |
| `/api/admin/stats` | GET | Platform statistics |
| `/api/admin/fellowships` | GET | Fellowship management |
| `/api/admin/notifications` | POST | Send notifications |

---

## 🤖 Chatbot API

### Chat with AI Assistant

```http
POST /api/chatbot
```

**Request Body:**

```json
{
  "message": "What scholarships am I eligible for?",
  "userId": "firebase-user-id",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help you?" }
  ]
}
```

**Response (Streaming):**

Server-Sent Events with chunks of AI response.

---

## 👥 Community API

### Get Community Tips

```http
GET /api/community?scholarshipId={id}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "tip-1",
      "scholarshipId": "scholarship-1",
      "tip": "Apply before the 15th - they usually accept late applications till then",
      "createdBy": "anonymous",
      "upvotes": 42,
      "verified": true
    }
  ]
}
```

---

## 🕷️ Scraper API

### Trigger Web Scraper (Admin Only)

```http
POST /api/scraper/run
```

**Request Body:**

```json
{
  "sources": ["nsp", "state-portals"],
  "adminCredentials": {
    "email": "admin@scholarsync.com",
    "password": "admin-password"
  }
}
```

---

## ⚠️ Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## 📊 Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10 req/min |
| AI Endpoints | 30 req/min |
| Document Upload | 5 req/min |
| General API | 100 req/min |

---

## 🔄 WebSocket Events

For real-time features, see [Socket.IO Events](./ARCHITECTURE.md#socket-events).

---

*Last Updated: January 2026*
