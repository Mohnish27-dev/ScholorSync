# 🎨 ScholarSync Frontend Documentation

> Complete guide to the frontend architecture, components, and development patterns.

---

## 🏗️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1 | React framework with App Router |
| TypeScript | 5.0 | Type-safe JavaScript |
| Tailwind CSS | 4.0 | Utility-first styling |
| shadcn/ui | Latest | Component library (Radix UI) |
| Framer Motion | 12.x | Animations |
| React Hook Form | 7.x | Form management |
| Zod | 4.x | Schema validation |
| Lucide React | 0.562 | Icons |

---

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                    # Authentication Pages
│   │   ├── login/
│   │   │   └── page.tsx         # Login form
│   │   └── register/
│   │       └── page.tsx         # Registration form
│   │
│   ├── dashboard/               # User Dashboard
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Main dashboard
│   │   ├── scholarships/        # Scholarship search
│   │   ├── documents/           # Document vault
│   │   ├── fees/                # Fee analyzer
│   │   ├── profile/             # User profile
│   │   ├── saved/               # Saved scholarships
│   │   ├── why-not-me/          # Gap analysis
│   │   ├── community/           # Community tips
│   │   ├── applications/        # Application tracking
│   │   └── insights/            # Analytics
│   │
│   ├── fellowships/             # Fellowships Module
│   │   ├── layout.tsx           # Fellowship layout
│   │   ├── page.tsx             # Fellowship home
│   │   ├── challenges/          # Browse challenges
│   │   ├── create-challenge/    # Create new challenge
│   │   ├── my-challenges/       # Manage challenges
│   │   ├── my-proposals/        # Track proposals
│   │   ├── room/                # Project room
│   │   ├── rooms/               # All rooms
│   │   ├── onboarding/          # User onboarding
│   │   ├── verify/              # Email verification
│   │   └── admin/               # Fellowship admin
│   │
│   ├── admin/                   # Admin Panel
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── ui/                      # 34 shadcn/ui components
│   ├── auth/                    # Auth components
│   ├── dashboard/               # Dashboard widgets
│   ├── documents/               # Document management
│   ├── fees/                    # Fee analysis
│   ├── scholarships/            # Scholarship cards
│   ├── fellowships/             # Fellowship UI
│   ├── blocks/                  # UI blocks
│   ├── analytics/               # Charts/analytics
│   ├── calendar/                # Calendar
│   └── chatbot/                 # AI chatbot
│
├── contexts/                     # React Contexts
│   └── AuthContext.tsx          # Authentication (425 lines)
│
├── hooks/                        # Custom Hooks
│   ├── use-outside-click.ts     # Click detection
│   ├── useRoomPresence.ts       # Socket presence
│   └── useSocket.ts             # Socket.IO (268 lines)
│
└── types/                        # TypeScript Types
    ├── index.ts                 # Core types (178 lines)
    ├── fellowships.ts           # Fellowship types
    └── css.d.ts                 # CSS modules
```

---

## 🧩 Component Library (shadcn/ui)

### Available Components

| Component | File | Description |
|-----------|------|-------------|
| Alert | `alert.tsx` | Notification alerts |
| Avatar | `avatar.tsx` | User avatars |
| Badge | `badge.tsx` | Status badges |
| Banner | `banner.tsx` | Announcement banners |
| Button | `button.tsx` | Action buttons |
| Calendar | `calendar.tsx` | Date picker |
| Card | `card.tsx` | Content cards |
| Carousel | `carousel.tsx` | Image carousel |
| Command | `command.tsx` | Command palette |
| Dialog | `dialog.tsx` | Modal dialogs |
| Dropdown Menu | `dropdown-menu.tsx` | Dropdown menus |
| Form | `form.tsx` | Form components |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Popover | `popover.tsx` | Popovers |
| Progress | `progress.tsx` | Progress bars |
| Scroll Area | `scroll-area.tsx` | Scrollable areas |
| Select | `select.tsx` | Select dropdowns |
| Separator | `separator.tsx` | Visual dividers |
| Sheet | `sheet.tsx` | Slide-out panels |
| Slider | `slider.tsx` | Range sliders |
| Switch | `switch.tsx` | Toggle switches |
| Table | `table.tsx` | Data tables |
| Tabs | `tabs.tsx` | Tab navigation |
| Textarea | `textarea.tsx` | Text areas |

### Special UI Components

| Component | Description |
|-----------|-------------|
| `apple-cards-carousel.tsx` | Apple-style 3D card carousel |
| `auth-fuse.tsx` | Auth form with animations |
| `bento-grid.tsx` | Bento grid layout |
| `bg-pattern.tsx` | Background patterns |
| `shooting-stars.tsx` | Animated stars background |
| `sky-toggle.tsx` | Day/night theme toggle |
| `stagger-testimonials.tsx` | Staggered testimonial cards |
| `stars-background.tsx` | Starry background effect |

---

## 🎭 State Management

### AuthContext

The primary context for authentication state:

```typescript
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  isAdmin: boolean;
  adminCredentials: { email: string; password: string } | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}
```

**Usage:**

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/auth/login" />;
  
  return <Dashboard user={user} />;
}
```

---

## 🪝 Custom Hooks

### useSocket

Real-time communication via Socket.IO:

```typescript
interface UseSocketOptions {
  roomId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  onNewMessage?: (message: RoomMessage) => void;
  onUserTyping?: (data: TypingInfo) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (user: User) => void;
  onRoomUsers?: (users: User[]) => void;
}

interface UseSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string, type?: MessageType) => string | null;
  sendFileMessage: (url: string, name: string) => string | null;
  startTyping: () => void;
  stopTyping: () => void;
  onlineUsers: User[];
}
```

**Usage:**

```tsx
const {
  isConnected,
  sendMessage,
  onlineUsers,
  startTyping,
  stopTyping
} = useSocket({
  roomId: 'project-123',
  userId: user.uid,
  userName: user.profile.name,
  userRole: 'student',
  onNewMessage: (message) => {
    setMessages(prev => [...prev, message]);
  }
});
```

### useRoomPresence

Track user presence across rooms:

```typescript
interface UseRoomPresenceReturn {
  presence: Record<string, User[]>;
  isLoading: boolean;
}
```

### useOutsideClick

Detect clicks outside an element:

```typescript
function useOutsideClick(ref: RefObject<HTMLElement>, callback: () => void): void;
```

---

## 📱 Page Components

### Landing Page (`app/page.tsx`)

Features:
- Hero section with animated background
- Stats display (10,000+ scholarships, ₹500Cr+ funding)
- Feature cards with icons
- Dual CTA (Students / Corporates)
- Testimonials carousel
- Footer with links

### Dashboard (`app/dashboard/page.tsx`)

Features:
- Welcome message with user name
- Stats cards (matched, saved, applied scholarships)
- Upcoming deadlines widget
- Profile completion progress
- Quick action buttons
- Analytics integration

### Fellowships Layout (`app/fellowships/layout.tsx`)

Features:
- Role-based navigation (Student vs Corporate)
- Verification status indicator
- Real-time room count
- Responsive sidebar

---

## 🎨 Styling Architecture

### Tailwind Configuration

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

### Theme Toggle

Using `next-themes` for dark/light mode:

```tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}
```

---

## 📝 Form Handling

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']),
  income: z.number().min(0).max(10000000),
  percentage: z.number().min(0).max(100),
  state: z.string().min(1, 'Please select a state'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfileForm() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      category: 'General',
      income: 0,
      percentage: 0,
      state: '',
    },
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    // Handle form submission
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

---

## 🌊 Animations

### Framer Motion Usage

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// Staggered list
<motion.ul>
  {items.map((item, index) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// Animate Presence for exit animations
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🔔 Notifications

### Sonner Toast Library

```tsx
import { toast } from 'sonner';

// Success toast
toast.success('Profile updated successfully!');

// Error toast
toast.error('Failed to upload document');

// Promise toast
toast.promise(uploadDocument(file), {
  loading: 'Uploading document...',
  success: 'Document uploaded!',
  error: 'Upload failed',
});

// Custom toast
toast('New scholarship matches found!', {
  description: '3 new scholarships match your profile',
  action: {
    label: 'View',
    onClick: () => router.push('/dashboard/scholarships'),
  },
});
```

---

## 🛣️ Routing

### App Router Navigation

```tsx
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Client-side navigation
function NavigationExample() {
  const router = useRouter();
  
  return (
    <>
      {/* Link component */}
      <Link href="/dashboard/scholarships">
        View Scholarships
      </Link>
      
      {/* Programmatic navigation */}
      <Button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
      
      {/* Replace current history entry */}
      <Button onClick={() => router.replace('/auth/login')}>
        Logout
      </Button>
    </>
  );
}
```

### Protected Routes

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}
```

---

## 📊 Analytics Components

### DashboardAnalytics

```tsx
import { DashboardAnalytics } from '@/components/dashboard/DashboardAnalytics';

<DashboardAnalytics
  matchedCount={25}
  savedCount={10}
  appliedCount={5}
  successRate={85}
/>
```

---

## 🎯 Best Practices

### Component Structure

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Scholarship } from '@/types';

// 2. Types/Interfaces
interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSave: (id: string) => void;
  isSaved?: boolean;
}

// 3. Component
export function ScholarshipCard({
  scholarship,
  onSave,
  isSaved = false,
}: ScholarshipCardProps) {
  // 4. Hooks
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [scholarship.id]);
  
  // 6. Handlers
  const handleSave = async () => {
    setIsLoading(true);
    await onSave(scholarship.id);
    setIsLoading(false);
  };
  
  // 7. Render
  return (
    <Card>
      {/* Component JSX */}
    </Card>
  );
}
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ScholarshipCard.tsx` |
| Hooks | camelCase with `use` prefix | `useSocket.ts` |
| Types | PascalCase | `UserProfile` |
| Utilities | camelCase | `formatDate.ts` |
| Pages | `page.tsx` in folder | `app/dashboard/page.tsx` |

---

*Last Updated: January 2026*
