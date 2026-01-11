'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  FileText,
  Receipt,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Target,
  Bell,
  Shield,
} from 'lucide-react';
import SkyToggle from '@/components/ui/sky-toggle';

const features = [
  {
    icon: Target,
    title: 'Scholarship Radar',
    description: 'AI-powered matching finds scholarships you actually qualify for with personalized match scores.',
  },
  {
    icon: Sparkles,
    title: 'Why Not Me? Analyzer',
    description: 'Discover near-miss scholarships and get actionable steps to become eligible.',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Upload once, auto-fill everywhere. OCR extracts data from your documents automatically.',
  },
  {
    icon: Receipt,
    title: 'Fee Anomaly Detector',
    description: 'Compare your fees against official structures to catch discrepancies instantly.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Never miss a deadline with personalized alerts for scholarships and applications.',
  },
  {
    icon: Users,
    title: 'Community Intelligence',
    description: 'Learn from successful applicants and share insights with fellow students.',
  },
];

const stats = [
  { value: '10,000+', label: 'Scholarships Tracked' },
  { value: '₹500Cr+', label: 'In Available Funding' },
  { value: '50,000+', label: 'Students Helped' },
  { value: '95%', label: 'Match Accuracy' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0a0a12] dark:to-[#0d0d18]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-teal-900/30 dark:bg-[#0a0a12]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">ScholarSync</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-teal-400 transition-colors">
              Testimonials
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <SkyToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-transparent to-emerald-50 dark:from-teal-950/20 dark:via-transparent dark:to-emerald-950/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-b from-teal-400/20 to-transparent blur-3xl dark:from-teal-500/10" />
          <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-b from-emerald-400/15 to-transparent blur-3xl dark:from-emerald-500/10" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm text-teal-700 dark:border-teal-800/50 dark:bg-teal-950/50 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
              Powered by AI - Trusted by 50,000+ Students
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Your Smart
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent"> Scholarship </span>
              and Fee Tracker
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Stop missing scholarships you deserve. ScholarSync uses AI to match you with opportunities,
              auto-fill applications, and detect fee anomalies - all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">
                  Start Finding Scholarships
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/50">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Everything You Need to Secure Funding
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              From discovery to application, ScholarSync streamlines your entire scholarship journey.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 dark:border-slate-800/50 dark:bg-[#111118] dark:hover:border-teal-700/50 dark:hover:shadow-teal-500/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-teal-100 p-3 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50 py-20 sm:py-32 dark:bg-[#0d0d14]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="relative">
              <div className="text-6xl font-bold text-teal-100 dark:text-teal-900/50">01</div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Create Your Profile</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Tell us about your education, income, location, and goals. We handle the rest.</p>
            </div>
            <div className="relative">
              <div className="text-6xl font-bold text-teal-100 dark:text-teal-900/50">02</div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Upload Documents</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Add your certificates, income proofs, and ID cards. Our OCR extracts all details.</p>
            </div>
            <div className="relative">
              <div className="text-6xl font-bold text-teal-100 dark:text-teal-900/50">03</div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Get Matched</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Receive personalized scholarship matches with eligibility scores and deadline alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Students Love ScholarSync
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800/50 dark:bg-[#111118]">
              <div className="flex gap-1 text-amber-500">
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">&quot;ScholarSync helped me find 5 scholarships I didn&apos;t even know existed. I&apos;ve already received Rs.50,000 in funding!&quot;</p>
              <div className="mt-6">
                <div className="font-semibold text-slate-900 dark:text-white">Priya Sharma</div>
                <div className="text-sm text-slate-500 dark:text-slate-500">Engineering Student, IIT Delhi</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800/50 dark:bg-[#111118]">
              <div className="flex gap-1 text-amber-500">
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">&quot;The Why Not Me feature showed me exactly what I needed to qualify for more scholarships. Game changer!&quot;</p>
              <div className="mt-6">
                <div className="font-semibold text-slate-900 dark:text-white">Rahul Patel</div>
                <div className="text-sm text-slate-500 dark:text-slate-500">Medical Student, AIIMS</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800/50 dark:bg-[#111118]">
              <div className="flex gap-1 text-amber-500">
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
                <CheckCircle className="h-5 w-5 fill-current" />
              </div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">&quot;Document vault saved me hours of work. Upload once and auto-fill applications everywhere.&quot;</p>
              <div className="mt-6">
                <div className="font-semibold text-slate-900 dark:text-white">Ananya Gupta</div>
                <div className="text-sm text-slate-500 dark:text-slate-500">Commerce Student, SRCC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-emerald-600 py-20 dark:from-teal-700 dark:to-emerald-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Find Your Scholarships?
            </h2>
            <p className="mt-4 text-lg text-teal-100">
              Join 50,000+ students who are already using ScholarSync to fund their education.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="gap-2 bg-white text-teal-700 hover:bg-teal-50">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 dark:border-teal-900/30 dark:bg-[#0a0a12]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <span className="font-semibold text-slate-900 dark:text-white">ScholarSync</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <Link href="#" className="hover:text-slate-900 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-900 dark:hover:text-teal-400 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-slate-900 dark:hover:text-teal-400 transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
              <Shield className="h-4 w-4" />
              <span>Your data is secure</span>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-500">
            2024 ScholarSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
