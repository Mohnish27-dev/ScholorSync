import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Types
interface ScholarshipAmount {
  min: number;
  max: number;
}

interface ScholarshipEligibility {
  categories: string[];
  incomeLimit: number;
  minPercentage: number;
  states: string[];
  gender: string;
  courses: string[];
  levels: string[];
  yearRange: [number, number];
  disabilities?: boolean;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  type: 'government' | 'private' | 'corporate' | 'college';
  amount: ScholarshipAmount;
  eligibility: ScholarshipEligibility;
  eligibilityText: string;
  deadline: string;
  applicationUrl: string;
  documentsRequired: string[];
  benefits: string;
  howToApply: string;
  sourceUrl: string;
  tags: string[];
  isActive: boolean;
  renewalAvailable: boolean;
  competitionLevel: 'low' | 'medium' | 'high';
}

interface ScholarshipsData {
  scholarships: Scholarship[];
}

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } else {
      // Try loading from file
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (fs.existsSync(serviceAccountPath)) {
        initializeApp({
          credential: cert(serviceAccountPath),
        });
      } else {
        throw new Error('Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT_KEY env variable or place serviceAccountKey.json in root.');
      }
    }
  }
  return getFirestore();
}

// Initialize Pinecone
function initPinecone() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY environment variable not set');
  }
  return new Pinecone({ apiKey });
}

// Initialize Google AI for embeddings
function initGoogleAI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY environment variable not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

// Generate embedding for a scholarship
async function generateEmbedding(genAI: GoogleGenerativeAI, scholarship: Scholarship): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
  const text = [
    `Name: ${scholarship.name}`,
    `Provider: ${scholarship.provider}`,
    `Type: ${scholarship.type}`,
    `Amount: ₹${scholarship.amount.min.toLocaleString()} to ₹${scholarship.amount.max.toLocaleString()}`,
    `Deadline: ${scholarship.deadline}`,
    `Eligibility: ${scholarship.eligibilityText}`,
    `Categories: ${scholarship.eligibility.categories.join(', ')}`,
    `States: ${scholarship.eligibility.states.join(', ')}`,
    `Gender: ${scholarship.eligibility.gender}`,
    `Income Limit: ₹${scholarship.eligibility.incomeLimit.toLocaleString()}`,
    `Minimum Percentage: ${scholarship.eligibility.minPercentage}%`,
    `Courses: ${scholarship.eligibility.courses.join(', ')}`,
    `Education Levels: ${scholarship.eligibility.levels.join(', ')}`,
    `Benefits: ${scholarship.benefits}`,
    `Tags: ${scholarship.tags.join(', ')}`,
  ].join('\n');

  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Seed Firestore with scholarships
async function seedFirestore(db: FirebaseFirestore.Firestore, scholarships: Scholarship[]): Promise<void> {
  console.log('\n📦 Seeding Firestore with scholarships...\n');
  
  const batch = db.batch();
  const scholarshipsRef = db.collection('scholarships');
  
  let count = 0;
  const batchSize = 500; // Firestore batch limit
  
  for (const scholarship of scholarships) {
    const docRef = scholarshipsRef.doc(scholarship.id);
    batch.set(docRef, {
      ...scholarship,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: Math.floor(Math.random() * 10000) + 1000,
      applicationCount: Math.floor(Math.random() * 5000) + 500,
    });
    
    count++;
    
    if (count % batchSize === 0) {
      await batch.commit();
      console.log(`  ✅ Committed batch of ${batchSize} scholarships`);
    }
  }
  
  // Commit remaining
  if (count % batchSize !== 0) {
    await batch.commit();
  }
  
  console.log(`\n✅ Seeded ${count} scholarships to Firestore\n`);
}

// Seed Pinecone with embeddings
async function seedPinecone(
  pinecone: Pinecone, 
  genAI: GoogleGenerativeAI, 
  scholarships: Scholarship[]
): Promise<void> {
  console.log('\n🧠 Generating embeddings and seeding Pinecone...\n');
  
  const indexName = process.env.PINECONE_INDEX || 'scholarships';
  const index = pinecone.index(indexName);
  
  const batchSize = 50;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < scholarships.length; i += batchSize) {
    const batch = scholarships.slice(i, i + batchSize);
    
    try {
      const vectors = await Promise.all(
        batch.map(async (scholarship) => {
          try {
            const embedding = await generateEmbedding(genAI, scholarship);
            return {
              id: scholarship.id,
              values: embedding,
              metadata: {
                name: scholarship.name,
                provider: scholarship.provider,
                type: scholarship.type,
                amountMin: scholarship.amount.min,
                amountMax: scholarship.amount.max,
                deadline: scholarship.deadline,
                applicationUrl: scholarship.applicationUrl,
                categories: scholarship.eligibility.categories,
                incomeLimit: scholarship.eligibility.incomeLimit,
                minPercentage: scholarship.eligibility.minPercentage,
                states: scholarship.eligibility.states,
                gender: scholarship.eligibility.gender,
                courses: scholarship.eligibility.courses,
                levels: scholarship.eligibility.levels,
                tags: scholarship.tags,
                isActive: scholarship.isActive,
                competitionLevel: scholarship.competitionLevel,
                benefits: scholarship.benefits,
                eligibilityText: scholarship.eligibilityText,
              },
            };
          } catch (error) {
            console.error(`  ❌ Failed embedding for ${scholarship.name}:`, error);
            failCount++;
            return null;
          }
        })
      );
      
      const validVectors = vectors.filter((v): v is NonNullable<typeof v> => v !== null);
      
      if (validVectors.length > 0) {
        await index.upsert(validVectors);
        successCount += validVectors.length;
        console.log(`  ✅ Batch ${Math.floor(i / batchSize) + 1}: ${validVectors.length} embeddings`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      failCount += batch.length;
    }
  }
  
  console.log(`\n✅ Pinecone seeding complete: ${successCount} success, ${failCount} failed\n`);
}

// Seed community data
async function seedCommunityData(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log('\n💬 Seeding community data...\n');
  
  const users = [
    { id: 'user-1', name: 'Priya Sharma', avatar: 'PS', reputation: 1250, badges: ['helper', 'top-contributor'] },
    { id: 'user-2', name: 'Rahul Kumar', avatar: 'RK', reputation: 890, badges: ['verified'] },
    { id: 'user-3', name: 'Anita Desai', avatar: 'AD', reputation: 2100, badges: ['expert', 'mentor'] },
    { id: 'user-4', name: 'Vikram Singh', avatar: 'VS', reputation: 560, badges: ['newcomer'] },
    { id: 'user-5', name: 'Meera Patel', avatar: 'MP', reputation: 1800, badges: ['helper', 'verified'] },
    { id: 'user-6', name: 'Arjun Nair', avatar: 'AN', reputation: 720, badges: ['verified'] },
    { id: 'user-7', name: 'Kavitha Reddy', avatar: 'KR', reputation: 3200, badges: ['expert', 'top-contributor', 'mentor'] },
    { id: 'user-8', name: 'Suresh Menon', avatar: 'SM', reputation: 450, badges: [] },
  ];
  
  const posts = [
    {
      id: 'post-1',
      title: 'How I got the Central Sector Scholarship - Complete Guide',
      content: `I wanted to share my experience getting the Central Sector Scholarship last year. Here's everything you need to know:

**Eligibility:**
- You need to be in the top 20% of your Class 12 board
- Family income should be less than 8 lakh per annum
- Must be pursuing a regular degree course

**Documents I prepared:**
1. Class 12 marksheet (attested)
2. Income certificate from Tehsildar
3. Bank account details
4. Aadhaar card
5. College admission letter

**Tips:**
- Apply early on NSP portal
- Keep all documents ready in PDF format
- The income certificate should be recent (within 6 months)
- Track your application status regularly

I received ₹10,000 for UG and it really helped with my expenses. Feel free to ask any questions!`,
      authorId: 'user-3',
      authorName: 'Anita Desai',
      authorAvatar: 'AD',
      category: 'success-story',
      tags: ['central-sector', 'nsp', 'merit-based', 'guide'],
      upvotes: 156,
      downvotes: 3,
      commentCount: 42,
      createdAt: new Date('2025-12-20'),
      updatedAt: new Date('2025-12-20'),
      isPinned: true,
    },
    {
      id: 'post-2',
      title: 'NSP Portal Not Working - Anyone Else Facing Issues?',
      content: `I've been trying to submit my scholarship application on NSP for the past 3 days but keep getting errors. The OTP is not being sent to my mobile number. Has anyone else faced this issue? Any workarounds?

I've tried:
- Different browsers (Chrome, Firefox)
- Clearing cache
- Using mobile data instead of WiFi

Nothing seems to work. The deadline is approaching and I'm getting worried.`,
      authorId: 'user-4',
      authorName: 'Vikram Singh',
      authorAvatar: 'VS',
      category: 'help',
      tags: ['nsp', 'technical-issue', 'otp'],
      upvotes: 89,
      downvotes: 1,
      commentCount: 67,
      createdAt: new Date('2025-12-22'),
      updatedAt: new Date('2025-12-23'),
      isPinned: false,
    },
    {
      id: 'post-3',
      title: 'List of Scholarships for Engineering Students 2025-26',
      content: `I've compiled a comprehensive list of scholarships available for engineering students. Bookmark this post!

**Government Scholarships:**
1. AICTE Pragati (for girls) - ₹50,000/year
2. AICTE Saksham (for PwD) - ₹50,000/year
3. Central Sector Scheme - ₹10,000-20,000/year
4. Post Matric Scholarship (SC/ST/OBC)

**Corporate Scholarships:**
1. L&T Build India - Up to ₹1.8 lakh/year
2. Reliance Foundation - Up to ₹6 lakh
3. Bharti Airtel Scholarship - Up to ₹4 lakh/year
4. Kotak Kanya (for girls) - ₹1.5 lakh/year

**Private Scholarships:**
1. Sitaram Jindal Foundation
2. Tata Trusts
3. HDFC ECSS

Will keep updating this list. Drop a comment if I missed any!`,
      authorId: 'user-7',
      authorName: 'Kavitha Reddy',
      authorAvatar: 'KR',
      category: 'resource',
      tags: ['engineering', 'list', 'comprehensive', '2025-26'],
      upvotes: 342,
      downvotes: 5,
      commentCount: 89,
      createdAt: new Date('2025-12-15'),
      updatedAt: new Date('2025-12-23'),
      isPinned: true,
    },
    {
      id: 'post-4',
      title: 'Income Certificate vs ITR - Which One to Submit?',
      content: `I'm confused about the income proof requirement. My father is a government employee and we file ITR every year. But some scholarships ask for income certificate from Tehsildar.

Questions:
1. Can I submit ITR instead of income certificate?
2. If I need income certificate, how do I get it?
3. What should be the validity period?

Please help, deadline is in 2 weeks!`,
      authorId: 'user-6',
      authorName: 'Arjun Nair',
      authorAvatar: 'AN',
      category: 'question',
      tags: ['income-certificate', 'itr', 'documents', 'help'],
      upvotes: 45,
      downvotes: 0,
      commentCount: 23,
      createdAt: new Date('2025-12-21'),
      updatedAt: new Date('2025-12-21'),
      isPinned: false,
    },
    {
      id: 'post-5',
      title: 'KVPY Preparation Strategy - Scored AIR 156',
      content: `Just got my KVPY results and scored AIR 156! Here's my preparation strategy for juniors:

**Books I Used:**
- NCERT (thoroughly)
- HC Verma for Physics
- MS Chauhan for Organic Chemistry
- Cengage for Maths

**Study Schedule:**
- 4 hours daily for 6 months
- Solved previous 10 years papers
- Joined a test series

**Interview Tips:**
- Be honest about what you know
- Think out loud
- It's okay to say "I don't know"

The fellowship amount (₹5000-7000/month) is great for research aspirants. Happy to answer questions!`,
      authorId: 'user-1',
      authorName: 'Priya Sharma',
      authorAvatar: 'PS',
      category: 'success-story',
      tags: ['kvpy', 'preparation', 'strategy', 'science'],
      upvotes: 234,
      downvotes: 2,
      commentCount: 56,
      createdAt: new Date('2025-12-18'),
      updatedAt: new Date('2025-12-18'),
      isPinned: false,
    },
    {
      id: 'post-6',
      title: 'Scholarship Stacking - Can I Apply for Multiple?',
      content: `I'm eligible for multiple scholarships:
- Post Matric SC Scholarship (state)
- Central Sector Scholarship
- HDFC ECSS

Can I apply for and receive all of them simultaneously? Or are there restrictions? Has anyone successfully stacked scholarships?`,
      authorId: 'user-2',
      authorName: 'Rahul Kumar',
      authorAvatar: 'RK',
      category: 'question',
      tags: ['stacking', 'multiple-scholarships', 'eligibility'],
      upvotes: 78,
      downvotes: 1,
      commentCount: 34,
      createdAt: new Date('2025-12-19'),
      updatedAt: new Date('2025-12-20'),
      isPinned: false,
    },
    {
      id: 'post-7',
      title: 'PM YASASVI Scholarship 2025 - Application Open!',
      content: `The PM YASASVI scholarship applications are now open for 2025-26. Key details:

**Eligibility:**
- OBC/EBC/DNT students
- Class 9 to 12
- Family income up to ₹2.5 lakh
- Must clear entrance test

**Important Dates:**
- Application Start: December 1, 2025
- Last Date: January 31, 2026
- Exam Date: March 2026 (tentative)

**Award Amount:**
- Class 9-10: ₹75,000/year
- Class 11-12: ₹1,25,000/year

This is a great opportunity for students in residential schools. Apply early!`,
      authorId: 'user-5',
      authorName: 'Meera Patel',
      authorAvatar: 'MP',
      category: 'announcement',
      tags: ['pm-yasasvi', 'obc', 'ebc', 'dnt', 'application-open'],
      upvotes: 167,
      downvotes: 0,
      commentCount: 45,
      createdAt: new Date('2025-12-01'),
      updatedAt: new Date('2025-12-01'),
      isPinned: true,
    },
    {
      id: 'post-8',
      title: 'Rejected Due to Minor Document Error - What Now?',
      content: `My Post Matric scholarship application was rejected because my caste certificate had a spelling mistake in my father's name. The deadline has passed now.

Is there any way to appeal? Can I apply in the next cycle? This is really frustrating as I was otherwise fully eligible.`,
      authorId: 'user-8',
      authorName: 'Suresh Menon',
      authorAvatar: 'SM',
      category: 'help',
      tags: ['rejected', 'document-error', 'appeal', 'post-matric'],
      upvotes: 34,
      downvotes: 0,
      commentCount: 28,
      createdAt: new Date('2025-12-22'),
      updatedAt: new Date('2025-12-22'),
      isPinned: false,
    },
  ];

  const comments = [
    {
      id: 'comment-1',
      postId: 'post-2',
      content: 'I faced the same issue last week. Try using incognito mode and make sure your Aadhaar is linked to the mobile number. That worked for me.',
      authorId: 'user-1',
      authorName: 'Priya Sharma',
      authorAvatar: 'PS',
      upvotes: 45,
      createdAt: new Date('2025-12-22T10:30:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-2',
      postId: 'post-2',
      content: 'The NSP helpline number is 0120-6619540. They helped me resolve a similar issue. Call them during working hours.',
      authorId: 'user-3',
      authorName: 'Anita Desai',
      authorAvatar: 'AD',
      upvotes: 67,
      createdAt: new Date('2025-12-22T11:15:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-3',
      postId: 'post-2',
      content: 'Thanks @Priya! Incognito mode worked! Finally got the OTP.',
      authorId: 'user-4',
      authorName: 'Vikram Singh',
      authorAvatar: 'VS',
      upvotes: 12,
      createdAt: new Date('2025-12-22T14:00:00'),
      parentCommentId: 'comment-1',
    },
    {
      id: 'comment-4',
      postId: 'post-4',
      content: 'For government scholarships on NSP, income certificate from Tehsildar/SDM is mandatory. ITR alone won\'t work. Get the certificate - it takes about 7-10 days.',
      authorId: 'user-7',
      authorName: 'Kavitha Reddy',
      authorAvatar: 'KR',
      upvotes: 34,
      createdAt: new Date('2025-12-21T15:00:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-5',
      postId: 'post-4',
      content: 'Adding to @Kavitha\'s answer - for some state scholarships, you can submit ITR if father is a salaried employee. Check the specific scheme guidelines.',
      authorId: 'user-5',
      authorName: 'Meera Patel',
      authorAvatar: 'MP',
      upvotes: 23,
      createdAt: new Date('2025-12-21T16:30:00'),
      parentCommentId: 'comment-4',
    },
    {
      id: 'comment-6',
      postId: 'post-6',
      content: 'Yes, you can stack! But there are some rules:\n1. You cannot receive two central government scholarships simultaneously\n2. State + Central is usually allowed\n3. Private/corporate scholarships can be stacked with government ones\n\nI received both state scholarship and Tata Trust together.',
      authorId: 'user-3',
      authorName: 'Anita Desai',
      authorAvatar: 'AD',
      upvotes: 56,
      createdAt: new Date('2025-12-19T18:00:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-7',
      postId: 'post-8',
      content: 'You can file a grievance on the NSP portal under "Grievance Redressal" section. Explain the situation with proof. Sometimes they reopen applications for genuine cases.',
      authorId: 'user-7',
      authorName: 'Kavitha Reddy',
      authorAvatar: 'KR',
      upvotes: 28,
      createdAt: new Date('2025-12-22T17:00:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-8',
      postId: 'post-5',
      content: 'Congratulations! Can you share more about the interview experience? What kind of questions did they ask?',
      authorId: 'user-2',
      authorName: 'Rahul Kumar',
      authorAvatar: 'RK',
      upvotes: 15,
      createdAt: new Date('2025-12-18T20:00:00'),
      parentCommentId: null,
    },
    {
      id: 'comment-9',
      postId: 'post-5',
      content: '@Rahul They asked about my interest in science, some conceptual questions from Physics and Chemistry, and about a project I mentioned in my application. Very conversational, not stressful.',
      authorId: 'user-1',
      authorName: 'Priya Sharma',
      authorAvatar: 'PS',
      upvotes: 32,
      createdAt: new Date('2025-12-18T21:30:00'),
      parentCommentId: 'comment-8',
    },
    {
      id: 'comment-10',
      postId: 'post-3',
      content: 'You missed the ONGC Scholarship for SC/ST students in engineering. It\'s around ₹48,000/year. Please add it!',
      authorId: 'user-6',
      authorName: 'Arjun Nair',
      authorAvatar: 'AN',
      upvotes: 18,
      createdAt: new Date('2025-12-16T10:00:00'),
      parentCommentId: null,
    },
  ];

  // Seed users
  const usersRef = db.collection('communityUsers');
  for (const user of users) {
    await usersRef.doc(user.id).set({
      ...user,
      joinedAt: new Date('2025-01-01'),
      postsCount: posts.filter(p => p.authorId === user.id).length,
      commentsCount: comments.filter(c => c.authorId === user.id).length,
    });
  }
  console.log(`  ✅ Seeded ${users.length} community users`);

  // Seed posts
  const postsRef = db.collection('communityPosts');
  for (const post of posts) {
    await postsRef.doc(post.id).set(post);
  }
  console.log(`  ✅ Seeded ${posts.length} community posts`);

  // Seed comments
  const commentsRef = db.collection('communityComments');
  for (const comment of comments) {
    await commentsRef.doc(comment.id).set(comment);
  }
  console.log(`  ✅ Seeded ${comments.length} community comments`);

  console.log('\n✅ Community data seeding complete!\n');
}

// Main seed function
async function main() {
  console.log('\n🚀 Starting ScholarSync Database Seeding...\n');
  console.log('='.repeat(50));
  
  try {
    // Load scholarships data
    const dataPath = path.join(process.cwd(), 'scholorships.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error('scholorships.json not found in project root');
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: ScholarshipsData = JSON.parse(rawData);
    
    console.log(`\n📄 Loaded ${data.scholarships.length} scholarships from JSON\n`);
    
    // Initialize services
    const db = initFirebaseAdmin();
    const pinecone = initPinecone();
    const genAI = initGoogleAI();
    
    // Seed Firestore
    await seedFirestore(db, data.scholarships);
    
    // Seed Pinecone with embeddings
    await seedPinecone(pinecone, genAI, data.scholarships);
    
    // Seed community data
    await seedCommunityData(db);
    
    console.log('='.repeat(50));
    console.log('\n🎉 All seeding complete!\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
