import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_STATS = [
    { value: '10,000+', label: 'Scholarships Tracked' },
    { value: '₹500Cr+', label: 'In Available Funding' },
    { value: '50,000+', label: 'Students Helped' },
    { value: '95%', label: 'Match Accuracy' },
];

// GET - Fetch landing page stats
export async function GET() {
    try {
        if (!db) {
            return NextResponse.json({ stats: DEFAULT_STATS });
        }

        const statsDoc = await getDoc(doc(db, 'settings', 'siteStats'));
        if (statsDoc.exists()) {
            return NextResponse.json({ stats: statsDoc.data().stats || DEFAULT_STATS });
        }

        return NextResponse.json({ stats: DEFAULT_STATS });
    } catch (error) {
        console.error('Error fetching site stats:', error);
        return NextResponse.json({ stats: DEFAULT_STATS });
    }
}

// PUT - Update landing page stats (admin only)
export async function PUT(request: NextRequest) {
    try {
        if (!db) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { stats } = body;

        if (!stats || !Array.isArray(stats) || stats.length !== 4) {
            return NextResponse.json(
                { error: 'Stats must be an array of 4 items with value and label' },
                { status: 400 }
            );
        }

        // Validate each stat has value and label
        for (const stat of stats) {
            if (!stat.value || !stat.label) {
                return NextResponse.json(
                    { error: 'Each stat must have value and label' },
                    { status: 400 }
                );
            }
        }

        await setDoc(doc(db, 'settings', 'siteStats'), {
            stats,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating site stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}
