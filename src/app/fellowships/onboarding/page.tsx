'use client';

import { useRouter } from 'next/navigation';
import { RoleSelector } from '@/components/fellowships/RoleSelector';

export default function OnboardingPage() {
    const router = useRouter();

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12">
            <RoleSelector onComplete={() => router.push('/fellowships/challenges')} />
        </div>
    );
}
