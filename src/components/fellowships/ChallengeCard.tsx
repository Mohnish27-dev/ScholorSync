'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Clock, Users, IndianRupee, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Challenge } from '@/types/fellowships';
import { CHALLENGE_CATEGORIES, CHALLENGE_STATUS_LABELS } from '@/types/fellowships';

interface ChallengeCardProps {
    challenge: Challenge;
    showActions?: boolean;
    isOwner?: boolean;
}

export function ChallengeCard({ challenge, showActions = true, isOwner = false }: ChallengeCardProps) {
    const category = CHALLENGE_CATEGORIES[challenge.category];
    const status = CHALLENGE_STATUS_LABELS[challenge.status];
    const isOpen = challenge.status === 'open';
    const deadline = new Date(challenge.deadline);
    const isExpired = deadline < new Date();
    const timeLeft = isExpired
        ? 'Expired'
        : formatDistanceToNow(deadline, { addSuffix: true });

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-700">
            {/* Category Banner */}
            <div className={cn("absolute top-0 left-0 right-0 h-1",
                challenge.category === 'design' && "bg-pink-500",
                challenge.category === 'content' && "bg-blue-500",
                challenge.category === 'development' && "bg-emerald-500",
                challenge.category === 'research' && "bg-purple-500",
                challenge.category === 'marketing' && "bg-amber-500",
            )} />

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className={cn("text-xs", category.color)}>
                        {category.icon} {category.label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", status.color)}>
                        {status.label}
                    </Badge>
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-tight line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {challenge.title}
                </h3>
                {challenge.companyName && (
                    <p className="text-sm text-muted-foreground">{challenge.companyName}</p>
                )}
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {challenge.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        <span>{challenge.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5",
                        isExpired ? "text-red-500" : "text-muted-foreground"
                    )}>
                        <Clock className="h-4 w-4" />
                        <span>{timeLeft}</span>
                    </div>
                    {challenge.proposalCount !== undefined && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{challenge.proposalCount} proposals</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {showActions && (
                <CardFooter className="pt-3 border-t">
                    <div className="flex w-full gap-2">
                        <Link href={`/fellowships/challenges/${challenge.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full group/btn">
                                View Details
                                <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </Link>
                        {isOpen && !isOwner && !isExpired && (
                            <Link href={`/fellowships/challenges/${challenge.id}?apply=true`}>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                                    Apply Now
                                </Button>
                            </Link>
                        )}
                        {isOwner && (
                            <Link href={`/fellowships/challenges/${challenge.id}/proposals`}>
                                <Button size="sm" variant="secondary">
                                    View Proposals
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

export function ChallengeCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="h-1 bg-muted animate-pulse" />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                </div>
                <div className="mt-2 h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="pb-3">
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                </div>
                <div className="mt-4 flex gap-4">
                    <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
                <div className="h-9 w-full bg-muted rounded animate-pulse" />
            </CardFooter>
        </Card>
    );
}
