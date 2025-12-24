'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: 'deadline' | 'application' | 'reminder' | 'interview' | 'result';
  scholarshipId?: string;
  scholarshipName?: string;
  amount?: { min: number; max: number };
  provider?: string;
  url?: string;
  color?: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Scholarship {
  id: string;
  name: string;
  provider: string;
  deadline: string;
  amount: { min: number; max: number };
  applicationUrl?: string;
}

// Color mapping for event types
const eventColors = {
  deadline: '#ef4444', // red
  application: '#3b82f6', // blue
  reminder: '#f59e0b', // amber
  interview: '#8b5cf6', // purple
  result: '#10b981', // green
};

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const format = searchParams.get('format'); // 'ics' for iCal export
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const db = getFirestore(app);

    // Get user's saved and applied scholarships
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const savedScholarshipIds = userData.savedScholarships || [];
    const appliedScholarshipIds = Object.keys(userData.applications || {});

    // Get all scholarships with deadlines
    const scholarshipsRef = collection(db, 'scholarships');
    const scholarshipsSnap = await getDocs(scholarshipsRef);
    
    const events: CalendarEvent[] = [];
    const now = new Date();

    scholarshipsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const scholarshipId = docSnap.id;
      const deadline = data.deadline;

      if (!deadline) return;

      // Parse deadline date
      let deadlineDate: Date;
      try {
        deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) return;
      } catch {
        return;
      }

      // Filter by month/year if specified
      if (month && year) {
        const eventMonth = deadlineDate.getMonth() + 1;
        const eventYear = deadlineDate.getFullYear();
        if (eventMonth !== parseInt(month) || eventYear !== parseInt(year)) return;
      }

      // Only include future deadlines or within last 30 days
      const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < -30) return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isSaved = savedScholarshipIds.includes(scholarshipId);
      const isApplied = appliedScholarshipIds.includes(scholarshipId);

      // Add deadline event
      events.push({
        id: `deadline-${scholarshipId}`,
        title: `Deadline: ${data.name}`,
        start: deadline,
        end: deadline,
        allDay: true,
        type: 'deadline',
        scholarshipId,
        scholarshipName: data.name,
        amount: data.amount,
        provider: data.provider,
        url: data.applicationUrl,
        color: eventColors.deadline,
        description: `Application deadline for ${data.name} by ${data.provider}. Amount: ₹${data.amount?.min?.toLocaleString() || 'N/A'} - ₹${data.amount?.max?.toLocaleString() || 'N/A'}`,
      });

      // Add reminder event (7 days before deadline)
      if (daysDiff >= 7) {
        const reminderDate = new Date(deadlineDate);
        reminderDate.setDate(reminderDate.getDate() - 7);
        
        events.push({
          id: `reminder-7d-${scholarshipId}`,
          title: `Reminder: ${data.name} deadline in 7 days`,
          start: reminderDate.toISOString().split('T')[0],
          end: reminderDate.toISOString().split('T')[0],
          allDay: true,
          type: 'reminder',
          scholarshipId,
          scholarshipName: data.name,
          color: eventColors.reminder,
          description: `7 days until deadline for ${data.name}`,
        });
      }

      // Add reminder event (1 day before deadline)
      if (daysDiff >= 1) {
        const reminderDate = new Date(deadlineDate);
        reminderDate.setDate(reminderDate.getDate() - 1);
        
        events.push({
          id: `reminder-1d-${scholarshipId}`,
          title: `URGENT: ${data.name} deadline tomorrow!`,
          start: reminderDate.toISOString().split('T')[0],
          end: reminderDate.toISOString().split('T')[0],
          allDay: true,
          type: 'reminder',
          scholarshipId,
          scholarshipName: data.name,
          color: '#dc2626', // darker red for urgency
          description: `URGENT: Only 1 day left until deadline for ${data.name}`,
        });
      }

      // Add application submitted event if applied
      if (isApplied) {
        const applicationData = userData.applications[scholarshipId];
        if (applicationData?.submittedAt) {
          events.push({
            id: `application-${scholarshipId}`,
            title: `Applied: ${data.name}`,
            start: applicationData.submittedAt,
            end: applicationData.submittedAt,
            allDay: true,
            type: 'application',
            scholarshipId,
            scholarshipName: data.name,
            color: eventColors.application,
            description: `Application submitted for ${data.name}`,
          });
        }
      }
    });

    // Sort events by date
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // If iCal format requested, generate ICS file
    if (format === 'ics') {
      const icsContent = generateICS(events);
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': 'attachment; filename="scholarships.ics"',
        },
      });
    }

    // Group events by date for calendar view
    const groupedEvents: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const dateKey = event.start.split('T')[0];
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });

    return NextResponse.json({
      success: true,
      events,
      groupedEvents,
      totalEvents: events.length,
      upcomingDeadlines: events.filter(e => e.type === 'deadline').length,
    });

  } catch (error) {
    console.error('Error in calendar API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

function generateICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScholarSync//Scholarship Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ScholarSync Deadlines',
  ];

  events.forEach((event) => {
    const startDate = event.start.replace(/-/g, '');
    const endDate = event.end.replace(/-/g, '');
    
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@scholarsync.app`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }
    if (event.url) {
      lines.push(`URL:${event.url}`);
    }
    
    // Add alarm for reminders
    if (event.type === 'deadline') {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push('DESCRIPTION:Scholarship deadline approaching!');
      lines.push('TRIGGER:-P1D'); // 1 day before
      lines.push('END:VALARM');
    }
    
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Firebase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, action, eventId, reminderSettings } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const app = getFirebaseApp();
    const db = getFirestore(app);

    if (action === 'subscribe') {
      // Generate subscription URL for external calendar apps
      const subscriptionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar?userId=${userId}&format=ics`;
      
      return NextResponse.json({
        success: true,
        subscriptionUrl,
        instructions: {
          google: `1. Open Google Calendar\n2. Click + next to "Other calendars"\n3. Select "From URL"\n4. Paste the subscription URL`,
          apple: `1. Open Calendar app\n2. File > New Calendar Subscription\n3. Paste the subscription URL`,
          outlook: `1. Open Outlook Calendar\n2. Add calendar > Subscribe from web\n3. Paste the subscription URL`,
        },
      });
    }

    if (action === 'export') {
      // Generate one-time ICS file download
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calendar?userId=${userId}&format=ics`);
      const icsContent = await response.text();
      
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': 'attachment; filename="scholarships.ics"',
        },
      });
    }

    if (action === 'updateReminders' && reminderSettings) {
      // Update user's reminder preferences
      const userRef = doc(db, 'users', userId);
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(userRef, {
        'settings.calendarReminders': reminderSettings,
      });

      return NextResponse.json({
        success: true,
        message: 'Reminder settings updated',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in calendar POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process calendar action' },
      { status: 500 }
    );
  }
}
