import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScrapedScholarship } from '../scraper';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'scholarships';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

// Initialize clients
let pinecone: Pinecone | null = null;
let genAI: GoogleGenerativeAI | null = null;

function getPinecone(): Pinecone {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
  }
  return pinecone;
}

function getGoogleAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  }
  return genAI;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const ai = getGoogleAI();
  const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export function scholarshipToText(scholarship: ScrapedScholarship): string {
  const parts = [
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
  ];
  
  return parts.join('\n');
}

export async function upsertScholarshipEmbeddings(
  scholarships: ScrapedScholarship[]
): Promise<{ success: number; failed: number }> {
  const pc = getPinecone();
  const index = pc.index(PINECONE_INDEX);
  
  let success = 0;
  let failed = 0;
  
  // Process in batches of 100
  const batchSize = 100;
  
  for (let i = 0; i < scholarships.length; i += batchSize) {
    const batch = scholarships.slice(i, i + batchSize);
    
    try {
      const vectors = await Promise.all(
        batch.map(async (scholarship) => {
          try {
            const text = scholarshipToText(scholarship);
            const embedding = await generateEmbedding(text);
            
            return {
              id: scholarship.id || `scholarship-${Date.now()}-${Math.random()}`,
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
              },
            };
          } catch (error) {
            console.error(`Failed to generate embedding for ${scholarship.name}:`, error);
            throw error;
          }
        })
      );
      
      // Filter out any null values and upsert
      const validVectors = vectors.filter(Boolean);
      
      if (validVectors.length > 0) {
        await index.upsert(validVectors);
        success += validVectors.length;
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}: ${validVectors.length} embeddings`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Failed to process batch starting at ${i}:`, error);
      failed += batch.length;
    }
  }
  
  return { success, failed };
}

export async function searchScholarships(
  query: string,
  filters?: {
    categories?: string[];
    states?: string[];
    gender?: string;
    maxIncome?: number;
    minPercentage?: number;
    levels?: string[];
  },
  topK: number = 20
): Promise<Array<{ id: string; score: number; metadata: Record<string, unknown> }>> {
  const pc = getPinecone();
  const index = pc.index(PINECONE_INDEX);
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Build filter
  const filter: Record<string, unknown> = {};
  
  if (filters) {
    if (filters.categories && filters.categories.length > 0) {
      filter.categories = { $in: filters.categories };
    }
    if (filters.states && filters.states.length > 0) {
      filter.states = { $in: [...filters.states, 'all'] };
    }
    if (filters.gender && filters.gender !== 'all') {
      filter.gender = { $in: [filters.gender, 'all'] };
    }
    if (filters.maxIncome) {
      filter.incomeLimit = { $gte: filters.maxIncome };
    }
    if (filters.minPercentage) {
      filter.minPercentage = { $lte: filters.minPercentage };
    }
    if (filters.levels && filters.levels.length > 0) {
      filter.levels = { $in: filters.levels };
    }
  }
  
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });
  
  return results.matches.map(match => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata || {},
  }));
}

export async function deleteAllEmbeddings(): Promise<void> {
  const pc = getPinecone();
  const index = pc.index(PINECONE_INDEX);
  
  await index.deleteAll();
  console.log('All embeddings deleted');
}

export async function getIndexStats(): Promise<{
  totalVectors: number;
  dimension: number;
}> {
  const pc = getPinecone();
  const index = pc.index(PINECONE_INDEX);
  
  const stats = await index.describeIndexStats();
  
  return {
    totalVectors: stats.totalRecordCount || 0,
    dimension: stats.dimension || 768,
  };
}
