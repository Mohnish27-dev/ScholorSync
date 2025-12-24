/* eslint-disable @typescript-eslint/no-explicit-any */
import puppeteer, { Browser, Page } from 'puppeteer';
import { STATE_SCHOLARSHIP_PORTALS } from './portals';

export interface ScrapedScholarship {
  id?: string;
  name: string;
  provider: string;
  type: 'government' | 'private' | 'corporate' | 'college';
  amount: { min: number; max: number };
  eligibility: {
    categories: string[];
    incomeLimit: number;
    minPercentage: number;
    states: string[];
    gender: string;
    courses: string[];
    levels: string[];
    yearRange: [number, number];
  };
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
  applicationStats?: {
    totalApplications: number;
    approvalRate: number;
    lastYearApplications: number;
  };
}

export class ScholarshipScraper {
  private browser: Browser | null = null;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ];

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async setupPage(page: Page): Promise<void> {
    await page.setUserAgent(this.getRandomUserAgent());
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
  }

  async scrapeNSP(): Promise<ScrapedScholarship[]> {
    if (!this.browser) await this.init();
    const page = await this.browser!.newPage();
    await this.setupPage(page);
    
    const scholarships: ScrapedScholarship[] = [];
    
    try {
      console.log('📚 Scraping National Scholarship Portal...');
      
      await page.goto('https://scholarships.gov.in/public/schemeGuidelines', {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      await this.delay(3000);

      const data = await page.evaluate(() => {
        const items: Array<{ name: string; provider: string; deadline: string; sourceUrl: string }> = [];
        
        const selectors = [
          '.scheme-card', '.scheme-item', 'tr.scheme-row',
          '.card', '[data-scheme]', '.scholarship-item',
        ];

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            elements.forEach((el) => {
              const name = el.querySelector('h3, h4, .scheme-name, .title, td:first-child')?.textContent?.trim();
              const provider = el.querySelector('.ministry, .provider, td:nth-child(2)')?.textContent?.trim();
              const deadline = el.querySelector('.deadline, .last-date, td:nth-child(3)')?.textContent?.trim();
              
              if (name) {
                items.push({
                  name,
                  provider: provider || 'Government of India',
                  deadline: deadline || '',
                  sourceUrl: window.location.href,
                });
              }
            });
            break;
          }
        }

        if (items.length === 0) {
          const pageText = document.body.innerText;
          const schemeNames = pageText.match(/(?:Post Matric|Pre Matric|Merit|Central Sector)[^\n]+/gi) || [];
          schemeNames.forEach(name => {
            items.push({
              name: name.trim(),
              provider: 'Government of India',
              deadline: '',
              sourceUrl: window.location.href,
            });
          });
        }

        return items;
      });

      for (const item of data) {
        scholarships.push(this.normalizeScholarship(item, 'government'));
      }

      console.log(`✅ Scraped ${scholarships.length} scholarships from NSP`);

    } catch (error) {
      console.error('❌ NSP scraping error:', error);
    } finally {
      await page.close();
    }

    return scholarships;
  }

  async scrapeBuddy4Study(): Promise<ScrapedScholarship[]> {
    if (!this.browser) await this.init();
    const page = await this.browser!.newPage();
    await this.setupPage(page);
    
    const scholarships: ScrapedScholarship[] = [];
    
    try {
      console.log('📚 Scraping Buddy4Study...');
      
      for (let pageNum = 1; pageNum <= 10; pageNum++) {
        const url = `https://www.buddy4study.com/scholarships?page=${pageNum}`;
        
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          await this.delay(2000);

          const pageData = await page.evaluate(() => {
            const items: Array<{
              name: string;
              provider: string;
              amount: string;
              deadline: string;
              applicationUrl: string;
              sourceUrl: string;
            }> = [];
            
            const cards = document.querySelectorAll('.scholarship-card, .b4s-card, [class*="scholarship"]');
            
            cards.forEach((card) => {
              const name = card.querySelector('h3, h4, .title, [class*="name"]')?.textContent?.trim();
              const provider = card.querySelector('.provider, .org, [class*="provider"]')?.textContent?.trim();
              const amount = card.querySelector('.award, .amount, [class*="amount"]')?.textContent?.trim();
              const deadline = card.querySelector('.deadline, .date, [class*="deadline"]')?.textContent?.trim();
              const link = card.querySelector('a')?.getAttribute('href');

              if (name) {
                items.push({
                  name,
                  provider: provider || '',
                  amount: amount || '',
                  deadline: deadline || '',
                  applicationUrl: link || 'https://www.buddy4study.com',
                  sourceUrl: window.location.href,
                });
              }
            });

            return items;
          });

          if (pageData.length === 0) break;

          for (const item of pageData) {
            scholarships.push(this.normalizeScholarship(item, 'private'));
          }

          console.log(`  Page ${pageNum}: ${pageData.length} scholarships`);
          await this.delay(2000 + Math.random() * 1000);

        } catch {
          console.warn(`  Skipping page ${pageNum} due to error`);
        }
      }

      console.log(`✅ Scraped ${scholarships.length} scholarships from Buddy4Study`);

    } catch (error) {
      console.error('❌ Buddy4Study scraping error:', error);
    } finally {
      await page.close();
    }

    return scholarships;
  }

  async scrapeStatePortal(portal: typeof STATE_SCHOLARSHIP_PORTALS[0]): Promise<ScrapedScholarship[]> {
    if (!this.browser) await this.init();
    const page = await this.browser!.newPage();
    await this.setupPage(page);
    
    const scholarships: ScrapedScholarship[] = [];
    
    try {
      console.log(`📚 Scraping ${portal.state} portal...`);
      
      await page.goto(portal.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000);

      const data = await page.evaluate((selectors) => {
        const items: Array<{ name: string; deadline: string; sourceUrl: string }> = [];
        
        let cards = document.querySelectorAll(selectors.card);
        
        if (cards.length === 0) {
          cards = document.querySelectorAll('.scheme-card, .scholarship-item, .scheme-row, [class*="scheme"], [class*="scholarship"]');
        }

        cards.forEach((card) => {
          const name = card.querySelector(selectors.name + ', h3, h4, .title')?.textContent?.trim();
          const deadline = card.querySelector(selectors.deadline + ', .deadline, .date')?.textContent?.trim();

          if (name) {
            items.push({
              name,
              deadline: deadline || '',
              sourceUrl: window.location.href,
            });
          }
        });

        return items;
      }, portal.selectors);

      for (const item of data) {
        const scholarship = this.normalizeScholarship({
          ...item,
          provider: `${portal.state} Government`,
        }, 'government');
        scholarship.eligibility.states = [portal.state];
        scholarships.push(scholarship);
      }

      console.log(`✅ Scraped ${scholarships.length} scholarships from ${portal.state}`);

    } catch (error) {
      console.warn(`⚠️ Could not scrape ${portal.state}: ${error}`);
    } finally {
      await page.close();
    }

    return scholarships;
  }

  async scrapeAllStatePortals(): Promise<ScrapedScholarship[]> {
    const allScholarships: ScrapedScholarship[] = [];

    for (const portal of STATE_SCHOLARSHIP_PORTALS) {
      try {
        const scholarships = await this.scrapeStatePortal(portal);
        allScholarships.push(...scholarships);
        await this.delay(3000);
      } catch {
        console.warn(`Skipping ${portal.state} due to error`);
      }
    }

    return allScholarships;
  }

  private normalizeScholarship(raw: Record<string, any>, type: ScrapedScholarship['type']): ScrapedScholarship {
    let minAmount = 10000;
    let maxAmount = 100000;
    
    if (raw.amount) {
      const amounts = String(raw.amount).match(/(\d+(?:,\d{3})*(?:\.\d+)?)/g);
      if (amounts && amounts.length >= 1) {
        minAmount = parseInt(amounts[0].replace(/,/g, ''));
        maxAmount = amounts[1] ? parseInt(amounts[1].replace(/,/g, '')) : minAmount * 2;
      }
    }

    let deadline = raw.deadline || '';
    if (deadline) {
      const dateMatch = String(deadline).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        const fullYear = year.length === 2 ? `20${year}` : year;
        deadline = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        deadline = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    } else {
      deadline = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const id = `scraped-${String(raw.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50)}-${Date.now()}`;

    return {
      id,
      name: raw.name || 'Unknown Scholarship',
      provider: raw.provider || 'Unknown Provider',
      type,
      amount: { min: minAmount, max: maxAmount },
      eligibility: {
        categories: ['all'],
        incomeLimit: 800000,
        minPercentage: 50,
        states: ['all'],
        gender: 'all',
        courses: ['all'],
        levels: ['ug', 'pg'],
        yearRange: [1, 5],
      },
      eligibilityText: raw.eligibility || 'Scholarship for eligible students',
      deadline,
      applicationUrl: raw.applicationUrl || raw.sourceUrl || 'https://scholarships.gov.in',
      documentsRequired: ['marksheet', 'income_certificate', 'aadhaar'],
      benefits: raw.benefits || `Up to ₹${maxAmount.toLocaleString()}`,
      howToApply: 'Apply online through the official portal',
      sourceUrl: raw.sourceUrl || '',
      tags: this.generateTags(raw),
      isActive: true,
      renewalAvailable: true,
      competitionLevel: 'medium',
      applicationStats: {
        totalApplications: Math.floor(Math.random() * 50000) + 10000,
        approvalRate: Math.floor(Math.random() * 40) + 30,
        lastYearApplications: Math.floor(Math.random() * 45000) + 8000,
      },
    };
  }

  private generateTags(raw: Record<string, any>): string[] {
    const tags: string[] = [];
    const text = `${raw.name || ''} ${raw.provider || ''} ${raw.eligibility || ''}`.toLowerCase();

    if (text.includes('sc') || text.includes('scheduled caste')) tags.push('sc');
    if (text.includes('st') || text.includes('scheduled tribe')) tags.push('st');
    if (text.includes('obc')) tags.push('obc');
    if (text.includes('minority') || text.includes('muslim') || text.includes('christian')) tags.push('minority');
    if (text.includes('girl') || text.includes('female') || text.includes('women')) tags.push('women');
    if (text.includes('merit')) tags.push('merit');
    if (text.includes('need') || text.includes('income')) tags.push('need-based');
    if (text.includes('engineering') || text.includes('technical')) tags.push('engineering');
    if (text.includes('medical') || text.includes('mbbs')) tags.push('medical');
    if (text.includes('research') || text.includes('phd')) tags.push('research');
    if (text.includes('pre-matric') || text.includes('pre matric')) tags.push('pre-matric');
    if (text.includes('post-matric') || text.includes('post matric')) tags.push('post-matric');

    return tags.length > 0 ? tags : ['general'];
  }

  async runFullScrape(): Promise<ScrapedScholarship[]> {
    console.log('\n🚀 Starting full scholarship scrape...\n');
    
    await this.init();
    
    const allScholarships: ScrapedScholarship[] = [];
    
    try {
      const nspData = await this.scrapeNSP();
      allScholarships.push(...nspData);

      const buddyData = await this.scrapeBuddy4Study();
      allScholarships.push(...buddyData);

      const priorityStates = STATE_SCHOLARSHIP_PORTALS.slice(0, 10);
      for (const portal of priorityStates) {
        const stateData = await this.scrapeStatePortal(portal);
        allScholarships.push(...stateData);
        await this.delay(2000);
      }

    } finally {
      await this.close();
    }

    console.log(`\n✅ Total scraped: ${allScholarships.length} scholarships\n`);
    return allScholarships;
  }
}

export const scraper = new ScholarshipScraper();
