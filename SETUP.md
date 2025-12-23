# ScholarSync - Setup Guide

This guide covers all the third-party service configuration required to run ScholarSync.

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Pinecone Setup](#pinecone-setup)
3. [Google AI (Gemini) Setup](#google-ai-gemini-setup)
4. [Environment Variables](#environment-variables)

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if not needed)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:

#### Email/Password Authentication (Required)
- Click on **Email/Password**
- Toggle **Enable** to ON
- Click **Save**

#### Google Authentication (Optional but Recommended)
- Click on **Google**
- Toggle **Enable** to ON
- Select a support email
- Click **Save**

### 3. Add Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add the following domains:
   - `localhost` (for development)
   - Your production domain (e.g., `yourapp.vercel.app`)
   - Any IP addresses you use for local testing (e.g., `192.168.1.x`)

> ⚠️ **Important**: If you see the error "The current domain is not authorized for OAuth operations", you need to add your domain here.

### 4. Create Firestore Database

1. Go to **Firestore Database** in the sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or production mode
4. Select a Cloud Firestore location (choose one close to your users)
5. Click **Enable**

#### Firestore Security Rules (Development - Test Mode)
For development, set your rules to allow all access temporarily. Go to **Firestore Database** → **Rules** and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Warning**: These rules allow anyone to read/write your database. Only use for development!

#### Firestore Security Rules (Production)
For production, update your security rules in **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scholarships are readable by authenticated users
    match /scholarships/{scholarshipId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server can write
    }
  }
}
```

### 5. Enable Cloud Storage

1. Go to **Storage** in the sidebar
2. Click **Get started**
3. Start in test mode or configure rules
4. Choose a storage location

#### Storage Security Rules (Production)
Update your rules in **Storage** → **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Get Firebase Config

1. Go to **Project settings** (gear icon) → **General**
2. Scroll down to **Your apps**
3. Click **Web** icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

---

## Pinecone Setup

### 1. Create Pinecone Account

1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account
3. Verify your email

### 2. Create an Index

1. In the Pinecone dashboard, click **Create Index**
2. Configure the index:
   - **Index name**: `scholarships` (or your preferred name)
   - **Dimensions**: `768` (for Google's text-embedding-004 model)
   - **Metric**: `cosine`
   - **Cloud**: Choose your preferred cloud provider
   - **Region**: Select a region close to your users

### 3. Get API Key

1. Go to **API Keys** in the sidebar
2. Copy your API key
3. Note your environment/host URL

---

## Google AI (Gemini) Setup

### 1. Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select or create a Google Cloud project
5. Copy the generated API key

### 2. Model Information

ScholarSync uses the following models:
- **Text Generation**: `gemini-2.5-flash-preview-05-20`
- **Embeddings**: `text-embedding-004`

> Note: The free tier includes generous usage limits suitable for development and small-scale production.

---

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-index-name

# Google AI Configuration
GOOGLE_API_KEY=your-google-ai-api-key
```

---

## Troubleshooting

### Firebase Auth Errors

#### "auth/operation-not-allowed"
**Cause**: Email/Password sign-in is not enabled.
**Solution**: Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password.

#### "auth/unauthorized-domain"
**Cause**: Your domain is not in the authorized domains list.
**Solution**: Go to Firebase Console → Authentication → Settings → Authorized domains → Add your domain.

#### "400 Bad Request on signUp"
**Cause**: Usually means Email/Password authentication is not enabled.
**Solution**: Enable Email/Password in Firebase Console Authentication settings.

### Pinecone Errors

#### "Index not found"
**Cause**: The index name in your environment variable doesn't match Pinecone.
**Solution**: Verify the index name in Pinecone dashboard matches `PINECONE_INDEX` in `.env.local`.

### Google AI Errors

#### "API key not valid"
**Cause**: Invalid or expired API key.
**Solution**: Generate a new API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Quick Start Checklist

- [ ] Firebase project created
- [ ] Email/Password authentication enabled in Firebase Console > Authentication > Sign-in method
- [ ] Google authentication enabled (optional)
- [ ] Authorized domains configured (add `localhost` for development)
- [ ] Firestore database created with test mode rules (see section above)
- [ ] Cloud Storage enabled
- [ ] Firebase config values copied to `.env.local`
- [ ] Pinecone account created
- [ ] Pinecone index created (768 dimensions, cosine metric)
- [ ] Pinecone API key copied to `.env.local`
- [ ] Google AI API key generated and copied to `.env.local`
- [ ] Run `npm run dev` to start the application

## Current Status

### Working Features ✅
- **Authentication UI**: Login, Register, Forgot Password pages
- **Dashboard UI**: All dashboard pages (Dashboard, Scholarships, Documents, Fees, Community, Profile)
- **API Routes**: All API routes are implemented and respond correctly
- **Web Scraper**: Puppeteer-based scraper for NSP scholarships
- **AI Integration**: LangChain with Gemini 2.5 Flash for eligibility analysis
- **Vector Search**: Pinecone integration for semantic scholarship matching
- **OCR**: Tesseract.js for document text extraction

### Requires Firebase Console Configuration ⚠️
- **Email/Password Sign-up**: Enable in Firebase Console > Authentication > Sign-in method
- **Google Sign-in**: Enable and add authorized domains
- **Firestore Read/Write**: Set test mode rules for development

### API Testing Results
| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/profile | ✅ | Requires Firestore permissions |
| GET /api/scholarships/match | ✅ | Requires Firestore permissions |
| POST /api/scholarships/explain | ✅ | Requires Firestore permissions |
| POST /api/documents/upload | ✅ | Requires Firestore permissions |
| POST /api/fees/analyze | ✅ | Requires Firestore permissions |
| POST /api/scraper/run | ✅ | Working (16.5s execution time) |

---

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure all Firebase services are properly enabled
4. Check the Troubleshooting section above

For more help, refer to the official documentation:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Google AI Documentation](https://ai.google.dev/docs)
