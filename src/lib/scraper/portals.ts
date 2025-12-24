// Complete list of all Indian state scholarship portals
export const STATE_SCHOLARSHIP_PORTALS = [
  // Northern States
  { state: 'Jammu and Kashmir', url: 'https://jkscholarship.gov.in', selectors: { card: '.scholarship-item', name: '.scheme-name', deadline: '.deadline' } },
  { state: 'Himachal Pradesh', url: 'https://hpepass.cgg.gov.in', selectors: { card: '.scheme-card', name: 'h4', deadline: '.last-date' } },
  { state: 'Punjab', url: 'https://scholarships.punjab.gov.in', selectors: { card: '.scholarship-row', name: '.title', deadline: '.date' } },
  { state: 'Haryana', url: 'https://hryedumis.gov.in', selectors: { card: '.scheme-item', name: '.name', deadline: '.deadline' } },
  { state: 'Uttarakhand', url: 'https://escholarship.uk.gov.in', selectors: { card: '.scholarship-card', name: 'h3', deadline: '.last-date' } },
  { state: 'Uttar Pradesh', url: 'https://scholarship.up.gov.in', selectors: { card: '.scheme-list-item', name: '.scheme-title', deadline: '.apply-date' } },
  { state: 'Rajasthan', url: 'https://sje.rajasthan.gov.in/Scholarship', selectors: { card: '.scheme-box', name: '.scheme-name', deadline: '.date' } },
  { state: 'Delhi', url: 'https://edistrict.delhigovt.nic.in', selectors: { card: '.service-item', name: '.service-name', deadline: '.deadline' } },
  { state: 'Chandigarh', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  { state: 'Ladakh', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  
  // Western States
  { state: 'Gujarat', url: 'https://digitalgujarat.gov.in', selectors: { card: '.scheme-item', name: '.scheme-title', deadline: '.end-date' } },
  { state: 'Maharashtra', url: 'https://mahadbt.maharashtra.gov.in', selectors: { card: '.scheme-card', name: '.scheme-name', deadline: '.deadline' } },
  { state: 'Goa', url: 'https://scholarships.goa.gov.in', selectors: { card: '.scholarship-item', name: 'h4', deadline: '.last-date' } },
  { state: 'Dadra and Nagar Haveli', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  { state: 'Daman and Diu', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  
  // Central States
  { state: 'Madhya Pradesh', url: 'https://scholarshipportal.mp.nic.in', selectors: { card: '.scheme-row', name: '.scheme-name', deadline: '.deadline' } },
  { state: 'Chhattisgarh', url: 'https://cgscholarship.cg.nic.in', selectors: { card: '.scheme-item', name: '.title', deadline: '.last-date' } },
  
  // Eastern States
  { state: 'Bihar', url: 'https://state.bihar.gov.in/socialwelfare', selectors: { card: '.scheme-card', name: 'h3', deadline: '.deadline' } },
  { state: 'Jharkhand', url: 'https://ekalyan.jharkhand.gov.in', selectors: { card: '.scheme-item', name: '.scheme-title', deadline: '.end-date' } },
  { state: 'West Bengal', url: 'https://wbmdfcscholarship.in', selectors: { card: '.scholarship-row', name: '.name', deadline: '.date' } },
  { state: 'Odisha', url: 'https://scholarship.odisha.gov.in', selectors: { card: '.scheme-card', name: '.scheme-name', deadline: '.deadline' } },
  
  // Southern States
  { state: 'Andhra Pradesh', url: 'https://jnanabhumi.ap.gov.in', selectors: { card: '.scheme-item', name: '.scheme-title', deadline: '.last-date' } },
  { state: 'Telangana', url: 'https://telanganaepass.cgg.gov.in', selectors: { card: '.scheme-card', name: 'h4', deadline: '.deadline' } },
  { state: 'Karnataka', url: 'https://karepass.cgg.gov.in', selectors: { card: '.scholarship-item', name: '.title', deadline: '.end-date' } },
  { state: 'Tamil Nadu', url: 'https://tn.gov.in/scheme', selectors: { card: '.scheme-row', name: '.scheme-name', deadline: '.date' } },
  { state: 'Kerala', url: 'https://dcescholarship.kerala.gov.in', selectors: { card: '.scheme-card', name: 'h3', deadline: '.last-date' } },
  { state: 'Puducherry', url: 'https://scholarship.py.gov.in', selectors: { card: '.scheme-item', name: '.name', deadline: '.deadline' } },
  { state: 'Lakshadweep', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  { state: 'Andaman and Nicobar', url: 'https://scholarships.gov.in', selectors: { card: '.scheme-card', name: '.name', deadline: '.date' } },
  
  // Northeastern States
  { state: 'Assam', url: 'https://directorateofhighereducation.assam.gov.in', selectors: { card: '.scheme-item', name: '.title', deadline: '.deadline' } },
  { state: 'Meghalaya', url: 'https://meghalaya.gov.in/scholarship', selectors: { card: '.scheme-card', name: 'h4', deadline: '.last-date' } },
  { state: 'Manipur', url: 'https://manipur.gov.in/scholarship', selectors: { card: '.scheme-item', name: '.name', deadline: '.date' } },
  { state: 'Mizoram', url: 'https://scholarship.mizoram.gov.in', selectors: { card: '.scholarship-row', name: '.title', deadline: '.deadline' } },
  { state: 'Tripura', url: 'https://scholarships.tripura.gov.in', selectors: { card: '.scheme-card', name: '.scheme-name', deadline: '.end-date' } },
  { state: 'Nagaland', url: 'https://nagaland.gov.in/scholarship', selectors: { card: '.scheme-item', name: 'h3', deadline: '.last-date' } },
  { state: 'Arunachal Pradesh', url: 'https://arunachal.gov.in/scholarship', selectors: { card: '.scheme-card', name: '.title', deadline: '.deadline' } },
  { state: 'Sikkim', url: 'https://sikkim.gov.in/scholarship', selectors: { card: '.scheme-row', name: '.name', deadline: '.date' } },
];

// National Portal URLs
export const NATIONAL_PORTALS = [
  { 
    name: 'National Scholarship Portal (NSP)', 
    url: 'https://scholarships.gov.in',
    apiUrl: 'https://scholarships.gov.in/public/schemeGuidelines',
    selectors: {
      schemeList: '.scheme-list',
      schemeCard: '.scheme-card, .scheme-item, tr.scheme-row',
      name: '.scheme-name, .scheme-title, h4, .schemeName',
      provider: '.ministry, .ministry-name, .provider',
      eligibility: '.eligibility, .eligible-criteria, .criteria',
      amount: '.amount, .award-amount, .scholarship-amount',
      deadline: '.deadline, .last-date, .end-date',
    }
  },
  {
    name: 'Buddy4Study',
    url: 'https://www.buddy4study.com/scholarships',
    selectors: {
      schemeCard: '.scholarship-card, .b4s-scholarship-card',
      name: 'h3, .scholarship-name',
      provider: '.provider, .org-name',
      eligibility: '.eligibility-text',
      amount: '.award, .amount',
      deadline: '.deadline, .last-date',
    }
  },
  {
    name: 'Vidyasaarathi',
    url: 'https://vidyasaarathi.co.in/Vidyasaarathi/index',
    selectors: {
      schemeCard: '.scheme-card',
      name: '.scheme-name',
      provider: '.provider-name',
      amount: '.amount',
      deadline: '.deadline',
    }
  },
];

// AICTE Scholarship URLs
export const AICTE_SCHOLARSHIPS = [
  { name: 'PRAGATI', url: 'https://www.aicte-pragati-saksham-gov.in/pragati' },
  { name: 'SAKSHAM', url: 'https://www.aicte-pragati-saksham-gov.in/saksham' },
  { name: 'SWANATH', url: 'https://www.aicte-india.org/bureaus/swanath' },
  { name: 'PG Scholarship', url: 'https://pgscholarship.aicte-india.org' },
];

// UGC Scholarship URLs
export const UGC_SCHOLARSHIPS = [
  { name: 'Ishan Uday', url: 'https://ugc.ac.in/ishan-uday' },
  { name: 'Single Girl Child', url: 'https://ugc.ac.in/single-girl-child' },
  { name: 'NET-JRF', url: 'https://ugc.ac.in/ugc-net' },
];

// Ministry-wise scholarship sources
export const MINISTRY_SOURCES = [
  { ministry: 'Ministry of Social Justice and Empowerment', url: 'https://socialjustice.gov.in' },
  { ministry: 'Ministry of Tribal Affairs', url: 'https://tribal.nic.in' },
  { ministry: 'Ministry of Minority Affairs', url: 'https://minorityaffairs.gov.in' },
  { ministry: 'Ministry of Education', url: 'https://education.gov.in' },
  { ministry: 'Department of Science and Technology', url: 'https://dst.gov.in' },
  { ministry: 'CSIR', url: 'https://csirhrdg.res.in' },
];

// Corporate scholarship sources
export const CORPORATE_SOURCES = [
  { name: 'Tata Trusts', url: 'https://tatatrusts.org' },
  { name: 'Reliance Foundation', url: 'https://reliancefoundation.org' },
  { name: 'Infosys Foundation', url: 'https://infosys.com/infosys-foundation' },
  { name: 'Wipro Foundation', url: 'https://wiprofoundation.org' },
  { name: 'HDFC Bank', url: 'https://hdfcbank.com/csr' },
  { name: 'ICICI Foundation', url: 'https://icicifoundation.org' },
  { name: 'Kotak Mahindra', url: 'https://kotak.com/csr' },
  { name: 'Larsen & Toubro', url: 'https://lntscholarships.com' },
  { name: 'Bharti Foundation', url: 'https://bhartifoundation.org' },
  { name: 'Azim Premji Foundation', url: 'https://azimpremjifoundation.org' },
];
