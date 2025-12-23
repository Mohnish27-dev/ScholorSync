import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

// Get the scholarships index
export const getScholarshipsIndex = () => {
  return pinecone.index(process.env.PINECONE_INDEX_NAME || 'scholarships');
};

// Upsert scholarship embeddings
export const upsertScholarshipEmbedding = async (
  scholarshipId: string,
  embedding: number[],
  metadata: RecordMetadata
) => {
  const index = getScholarshipsIndex();
  await index.upsert([
    {
      id: scholarshipId,
      values: embedding,
      metadata,
    },
  ]);
};

// Query similar scholarships based on user profile embedding
export const querySimilarScholarships = async (
  queryEmbedding: number[],
  topK: number = 10,
  filter?: RecordMetadata
) => {
  const index = getScholarshipsIndex();
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter,
  });
  return results.matches || [];
};

// Delete scholarship embedding
export const deleteScholarshipEmbedding = async (scholarshipId: string) => {
  const index = getScholarshipsIndex();
  await index.deleteOne(scholarshipId);
};

// Batch upsert scholarship embeddings
export const batchUpsertScholarshipEmbeddings = async (
  scholarships: Array<{
    id: string;
    embedding: number[];
    metadata: RecordMetadata;
  }>
) => {
  const index = getScholarshipsIndex();
  const vectors = scholarships.map((s) => ({
    id: s.id,
    values: s.embedding,
    metadata: s.metadata,
  }));
  
  // Pinecone recommends batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
};

export default pinecone;
