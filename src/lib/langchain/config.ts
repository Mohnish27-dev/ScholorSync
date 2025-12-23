import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// Initialize Gemini 2.5 Flash model for chat/completion
export const geminiModel = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-preview-05-20',
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 2048,
});

// Initialize Gemini embeddings for vector search
export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: 'text-embedding-004',
  apiKey: process.env.GOOGLE_API_KEY,
});

// Generate embeddings for text
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const embedding = await geminiEmbeddings.embedQuery(text);
  return embedding;
};

// Generate embeddings for multiple texts
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const embeddings = await geminiEmbeddings.embedDocuments(texts);
  return embeddings;
};
