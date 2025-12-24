# 🔌 API Documentation

Complete API reference for ScholarSync backend services.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [API Endpoints](#api-endpoints)
   - [Scholarships](#scholarships-api)
   - [Documents](#documents-api)
   - [Fees](#fees-api)
   - [Profile](#profile-api)
   - [Scraper](#scraper-api)

---

## 🌐 Overview

ScholarSync API is built with Next.js API Routes running on serverless infrastructure. All endpoints return JSON responses and require authentication (except scraper webhook).

**Base Principles:**
- RESTful design
- JSON request/response
- JWT authentication
- Rate limiting: 100 req/min per user

---

## 🔐 Authentication

### Firebase Authentication

All protected endpoints require a valid Firebase ID token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <firebase-id-token>
```

**Getting a Token (Client-side):**

```typescript
import { auth } from '@/lib/firebase/config';

const user = auth.currentUser;
const token = await user?.getIdToken();

// Use in API calls
const response = await fetch('/api/scholarships/match', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

**Token Expiration:**
- Tokens expire after 1 hour
- Automatically refreshed by Firebase SDK
- 401 error if token is invalid

---

## 🌍 Base URL

**Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://your-domain.vercel.app/api
```

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // ... response data
  },
  "message": "Operation successful" // optional
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // optional, additional error info
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication token missing |
| `AUTH_INVALID` | Token is invalid or expired |
| `VALIDATION_ERROR` | Request data validation failed |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 🎓 Scholarships API

### 1. Match Scholarships

Get personalized scholarship matches for a user.

**Endpoint:** `POST /api/scholarships/match`

**Authentication:** Required

**Request Body:**

```typescript
{
  userId: string;  // Firebase UID (auto-extracted from token)
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "scholarship-123",
        "name": "Post Matric Scholarship for OBC",
        "provider": "Ministry of Social Justice",
        "type": "government",
        "amount": {
          "min": 10000,
          "max": 25000
        },
        "eligibility": {
          "categories": ["OBC"],
          "incomeLimit": 800000,
          "minPercentage": 50,
          "states": ["all"],
          "branches": ["all"],
          "gender": "all",
          "yearRange": [1, 5]
        },
        "deadline": "2025-03-31",
        "applicationUrl": "https://...",
        "documentsRequired": ["income_cert", "caste_cert"],
        "matchPercentage": 92,
        "matchReasons": [
          "Category: OBC",
          "Income within limit",
          "Academic: 78%",
          "State: Bihar"
        ],
        "missingCriteria": []
      }
    ],
    "count": 12,
    "processingTime": "850ms"
  }
}
```

**Example:**

```typescript
const response = await fetch('/api/scholarships/match', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ userId: 'firebase-uid' }),
});

const { data } = await response.json();
console.log(`Found ${data.count} scholarships`);
```

---

### 2. Explain Eligibility

Get AI-powered explanation of scholarship eligibility.

**Endpoint:** `POST /api/scholarships/explain`

**Authentication:** Required

**Request Body:**

```typescript
{
  userId: string;
  scholarshipId: string;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "eligible": true,
    "matchPercentage": 92,
    "explanation": "You are eligible for this scholarship because...",
    "meetsCriteria": [
      "Your category (OBC) matches the requirement",
      "Your family income (₹3,50,000) is below the limit (₹8,00,000)",
      "Your marks (78%) exceed the minimum requirement (50%)"
    ],
    "missedCriteria": [],
    "suggestions": [
      "Apply before the deadline: March 31, 2025",
      "Ensure you have income certificate and caste certificate ready"
    ]
  }
}
```

---

### 3. Why Not Me? Analysis

Analyze near-miss scholarships and get improvement suggestions.

**Endpoint:** `POST /api/scholarships/why-not-me`

**Authentication:** Required

**Request Body:**

```typescript
{
  userId: string;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "nearMissScholarships": [
      {
        "scholarship": {
          "id": "scholarship-456",
          "name": "Merit Scholarship",
          "amount": { "min": 50000, "max": 100000 }
        },
        "gapPercentage": 8,
        "missingCriteria": [
          {
            "criterion": "Minimum Percentage",
            "currentValue": "78%",
            "requiredValue": "85%",
            "actionable": true,
            "suggestion": "You need 7% more marks. Focus on improving grades in next semester to become eligible."
          }
        ]
      }
    ],
    "count": 5
  }
}
```

---

### 4. Save Scholarship

Save a scholarship to user's favorites.

**Endpoint:** `POST /api/scholarships/save`

**Authentication:** Required

**Request Body:**

```typescript
{
  userId: string;
  scholarshipId: string;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "saved": true,
    "scholarshipId": "scholarship-123"
  },
  "message": "Scholarship saved successfully"
}
```

---

### 5. Get All Scholarships

Fetch all scholarships with optional filtering.

**Endpoint:** `GET /api/scholarships`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type (government/private/college) |
| `category` | string | No | Filter by category (OBC/SC/ST/General) |
| `state` | string | No | Filter by state |
| `limit` | number | No | Max results (default: 50) |
| `offset` | number | No | Pagination offset (default: 0) |

**Example Request:**

```
GET /api/scholarships?type=government&category=OBC&limit=20
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "scholarships": [...],
    "count": 20,
    "total": 156,
    "hasMore": true
  }
}
```

---

## 📄 Documents API

### 1. Upload Document

Upload document with OCR extraction.

**Endpoint:** `POST /api/documents/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

```typescript
FormData {
  file: File;              // Document image/PDF
  documentType: string;    // income_cert, marksheet, etc.
  userId: string;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "documentId": "doc-789",
    "fileUrl": "https://storage.googleapis.com/...",
    "fileName": "income_certificate.pdf",
    "extractedData": {
      "name": "Rajesh Kumar",
      "fatherName": "Ram Kumar",
      "income": 350000,
      "certificateNumber": "INC/2024/12345",
      "issueDate": "2024-01-15",
      "validUntil": "2025-01-14"
    },
    "rawText": "Full OCR extracted text...",
    "uploadedAt": "2024-12-24T10:30:00Z"
  },
  "message": "Document uploaded and processed successfully"
}
```

**Example (Client-side):**

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('documentType', 'income_cert');
formData.append('userId', currentUser.uid);

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

---

## 💰 Fees API

### 1. Analyze Fee Receipt

Analyze fee receipt for anomalies.

**Endpoint:** `POST /api/fees/analyze`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

```typescript
FormData {
  file: File;          // Fee receipt image/PDF
  userId: string;
  college: string;
  branch: string;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "receiptTotal": 157000,
    "expectedTotal": 155000,
    "anomalies": [
      {
        "category": "Development Fee",
        "expectedAmount": 5000,
        "chargedAmount": 7000,
        "difference": 2000,
        "explanation": "Charged ₹2,000 more than official fee structure"
      }
    ],
    "overchargeAmount": 2000,
    "recommendation": "Contact college administration with official fee structure reference. You may be eligible for ₹2,000 refund.",
    "detailedBreakdown": {
      "Tuition Fee": { official: 125000, charged: 125000, status: "correct" },
      "Hostel Fee": { official: 25000, charged: 25000, status: "correct" },
      "Development Fee": { official: 5000, charged: 7000, status: "overcharged" }
    }
  }
}
```

---

## 👤 Profile API

### 1. Get User Profile

Fetch current user's profile.

**Endpoint:** `GET /api/profile`

**Authentication:** Required

**Response:**

```typescript
{
  "success": true,
  "data": {
    "uid": "firebase-uid-123",
    "email": "student@example.com",
    "profile": {
      "name": "Rajesh Kumar",
      "category": "OBC",
      "income": 350000,
      "percentage": 78,
      "branch": "Computer Science",
      "year": 2,
      "state": "Bihar",
      "college": "NIT Patna",
      "gender": "Male",
      "achievements": ["NCC-C Certificate"]
    },
    "documents": {
      "incomeCert": {
        "fileUrl": "https://...",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    },
    "savedScholarships": ["scholarship-123", "scholarship-456"],
    "appliedScholarships": [
      {
        "id": "scholarship-789",
        "status": "applied",
        "appliedOn": "2024-12-20T10:00:00Z"
      }
    ],
    "notifications": true,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-12-24T10:00:00Z"
  }
}
```

---

### 2. Update User Profile

Update user profile information.

**Endpoint:** `POST /api/profile/update`

**Authentication:** Required

**Request Body:**

```typescript
{
  userId: string;
  profile: {
    name?: string;
    category?: string;
    income?: number;
    percentage?: number;
    branch?: string;
    year?: number;
    state?: string;
    college?: string;
    gender?: string;
    achievements?: string[];
  };
  notifications?: boolean;
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "updated": true,
    "updatedFields": ["percentage", "year"]
  },
  "message": "Profile updated successfully"
}
```

**Example:**

```typescript
await fetch('/api/profile/update', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: currentUser.uid,
    profile: {
      percentage: 82,
      year: 3,
    },
  }),
});
```

---

## 🤖 Scraper API

### 1. Run Scraper

Trigger web scraper (admin only).

**Endpoint:** `POST /api/scraper/run`

**Authentication:** Admin API key

**Request Body:**

```typescript
{
  apiKey: string;        // Admin API key
  targets?: string[];    // Optional: specific targets
  force?: boolean;       // Force scrape even if recently scraped
}
```

**Response:**

```typescript
{
  "success": true,
  "data": {
    "jobId": "scrape-job-123",
    "status": "started",
    "targets": ["NSP Portal", "Bihar Scholarship Portal"],
    "estimatedDuration": "15 minutes"
  }
}
```

---

## 📊 Rate Limiting

### Limits

| User Type | Limit | Window |
|-----------|-------|--------|
| Authenticated | 100 requests | 1 minute |
| Anonymous | 10 requests | 1 minute |
| Admin | 1000 requests | 1 minute |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retryAfter": 42
}
```

---

## 🔍 Filtering & Pagination

### Query Parameters

**Pagination:**
```
?limit=20&offset=40
```

**Sorting:**
```
?sortBy=deadline&order=asc
```

**Filtering:**
```
?type=government&category=OBC&state=Bihar
```

**Combined:**
```
?type=government&limit=20&offset=0&sortBy=amount&order=desc
```

---

## 🛠️ SDK / Client Libraries

### TypeScript Client (Recommended)

```typescript
// api-client.ts
export class ScholarSyncAPI {
  private baseUrl: string;
  private token: string;

  constructor(token: string, baseUrl = '/api') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMatches(userId: string) {
    return this.request('/scholarships/match', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async uploadDocument(file: File, documentType: string, userId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('userId', userId);

    return fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    }).then(r => r.json());
  }

  // ... more methods
}

// Usage
const api = new ScholarSyncAPI(await getIdToken());
const matches = await api.getMatches(currentUser.uid);
```

---

## 🧪 Testing API Endpoints

### Using cURL

**Get Matches:**

```bash
curl -X POST https://your-domain.vercel.app/api/scholarships/match \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "firebase-uid"}'
```

**Upload Document:**

```bash
curl -X POST https://your-domain.vercel.app/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "documentType=income_cert" \
  -F "userId=firebase-uid"
```

### Using Postman

1. Import this collection: [ScholarSync API Collection](#)
2. Set environment variable `TOKEN` with your Firebase ID token
3. Run requests

### Using Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new request
3. Set Authorization header
4. Test endpoints

---

## 📝 API Versioning

Currently on **v1** (implicit). Future versions will use URL versioning:

```
/api/v2/scholarships/match
```

Breaking changes will be announced with migration guide.

---

## 🔒 Security Best Practices

### For API Consumers

1. **Never expose tokens** in client-side code
2. **Use HTTPS** for all requests
3. **Validate responses** before using data
4. **Handle errors** gracefully
5. **Implement retry logic** with exponential backoff

### Token Management

```typescript
// ✅ Good: Token refresh
let token = await user.getIdToken();

// Refresh token before expiry (50 minutes)
setInterval(async () => {
  token = await user.getIdToken(true); // force refresh
}, 50 * 60 * 1000);

// ❌ Bad: Hardcoded token
const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6..."; // Never do this!
```

---

## 📞 Support & Issues

- **Bug Reports**: [GitHub Issues](https://github.com/JaiswalShivang/ScholarSync/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/JaiswalShivang/ScholarSync/discussions)
- **API Status**: [Status Page](#)

---

## 📚 Related Documentation

- [Main README](README.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Setup Guide](SETUP.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

<div align="center">
  <p><strong>API Version 1.0</strong></p>
  <p>Last Updated: December 24, 2024</p>
</div>
