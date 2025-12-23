import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { createScholarship } from '@/lib/firebase/firestore';
import { generateScholarshipEmbedding } from '@/lib/langchain/chains';
import { upsertScholarshipEmbedding } from '@/lib/pinecone/client';
import type { Scholarship } from '@/types';

interface ScrapedScholarship {
  name: string;
  provider: string;
  type: 'government' | 'private' | 'college';
  amount: { min: number; max: number };
  eligibilityText: string;
  deadline: string;
  applicationUrl: string;
  sourceUrl: string;
}

// Scraper for National Scholarship Portal (NSP)
async function scrapeNSP(): Promise<ScrapedScholarship[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Navigate to NSP scholarships page
    await page.goto('https://scholarships.gov.in/public/schemeGuidelines', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});

    // Extract scholarship data
    const scholarships = await page.evaluate(() => {
      const results: ScrapedScholarship[] = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const name = cells[1]?.textContent?.trim() || '';
          const provider = cells[0]?.textContent?.trim() || 'National Scholarship Portal';

          if (name) {
            results.push({
              name,
              provider,
              type: 'government' as const,
              amount: { min: 10000, max: 50000 }, // Default values
              eligibilityText: '',
              deadline: '',
              applicationUrl: 'https://scholarships.gov.in/',
              sourceUrl: 'https://scholarships.gov.in/public/schemeGuidelines',
            });
          }
        }
      });

      return results;
    });

    return scholarships;
  } catch (error) {
    console.error('Error scraping NSP:', error);
    return [];
  } finally {
    await browser.close();
  }
}

// Parse eligibility criteria from text using simple rules
function parseEligibility(text: string): Scholarship['eligibility'] {
  const eligibility: Scholarship['eligibility'] = {
    categories: ['all'],
    incomeLimit: 800000,
    minPercentage: 50,
    states: ['all'],
    branches: ['all'],
    gender: 'all',
    yearRange: [1, 5],
  };

  // Extract category mentions
  const categoryPatterns = {
    OBC: /\b(OBC|other backward class)/i,
    SC: /\b(SC|scheduled caste)/i,
    ST: /\b(ST|scheduled tribe)/i,
    EWS: /\b(EWS|economically weaker)/i,
    General: /\bgeneral\b/i,
  };

  const foundCategories: string[] = [];
  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(text)) {
      foundCategories.push(category);
    }
  }
  if (foundCategories.length > 0) {
    eligibility.categories = foundCategories;
  }

  // Extract income limit
  const incomeMatch = text.match(/income.*?(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lac|l)?/i);
  if (incomeMatch) {
    let income = parseFloat(incomeMatch[1].replace(/,/g, ''));
    if (text.toLowerCase().includes('lakh') || text.toLowerCase().includes('lac')) {
      income *= 100000;
    }
    eligibility.incomeLimit = income;
  }

  // Extract minimum percentage
  const percentageMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentageMatch) {
    eligibility.minPercentage = parseFloat(percentageMatch[1]);
  }

  // Extract gender requirement
  if (/\bgirl|female|women\b/i.test(text)) {
    eligibility.gender = 'Female';
  } else if (/\bboy|male|men\b/i.test(text)) {
    eligibility.gender = 'Male';
  }

  return eligibility;
}

export async function POST() {
  try {
    // Run scrapers
    const nspScholarships = await scrapeNSP();

    // Process and save scholarships
    const savedScholarships: string[] = [];

    for (const scraped of nspScholarships) {
      // Parse eligibility from text
      const eligibility = parseEligibility(scraped.eligibilityText);

      // Create scholarship object
      const scholarship: Omit<Scholarship, 'id'> = {
        name: scraped.name,
        provider: scraped.provider,
        type: scraped.type,
        amount: scraped.amount,
        eligibility,
        eligibilityText: scraped.eligibilityText,
        deadline: scraped.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        applicationUrl: scraped.applicationUrl,
        documentsRequired: ['income_cert', 'marksheet', 'aadhaar'],
        sourceUrl: scraped.sourceUrl,
        scrapedAt: new Date(),
      };

      // Save to Firestore
      const scholarshipId = await createScholarship(scholarship);
      savedScholarships.push(scholarshipId);

      // Generate and save embedding to Pinecone
      try {
        const embedding = await generateScholarshipEmbedding({
          ...scholarship,
          id: scholarshipId,
        });

        await upsertScholarshipEmbedding(scholarshipId, embedding, {
          name: scholarship.name,
          provider: scholarship.provider,
          type: scholarship.type,
          categories: scholarship.eligibility.categories.join(','),
          incomeLimit: scholarship.eligibility.incomeLimit,
          minPercentage: scholarship.eligibility.minPercentage,
        });
      } catch (embeddingError) {
        console.error('Error generating embedding:', embeddingError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraped and saved ${savedScholarships.length} scholarships`,
      data: {
        total: savedScholarships.length,
        ids: savedScholarships,
      },
    });
  } catch (error) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run scraper' },
      { status: 500 }
    );
  }
}
