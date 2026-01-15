# 🎨 ScholarSync UI Components Documentation

> Complete guide to UI components, design system, and visual elements.

---

## 🧩 Component Library Overview

ScholarSync uses **shadcn/ui** as the primary component library, built on **Radix UI** primitives with **Tailwind CSS** styling.

### Component Count by Category

| Category | Count | Description |
|----------|-------|-------------|
| Base UI | 26 | Core shadcn/ui components |
| Special Effects | 8 | Animated/premium components |
| Feature Components | 12 | Domain-specific components |
| **Total** | **46** | All UI components |

---

## 📦 Base Components (`src/components/ui/`)

### Form Components

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | Primary actions, CTAs |
| Input | `input.tsx` | Text inputs |
| Textarea | `textarea.tsx` | Multi-line text |
| Label | `label.tsx` | Input labels |
| Select | `select.tsx` | Dropdown selections |
| Switch | `switch.tsx` | Toggle switches |
| Slider | `slider.tsx` | Range selection |
| Calendar | `calendar.tsx` | Date picker |
| Form | `form.tsx` | Form wrapper with validation |

### Layout Components

| Component | File | Usage |
|-----------|------|-------|
| Card | `card.tsx` | Content containers |
| Dialog | `dialog.tsx` | Modal dialogs |
| Sheet | `sheet.tsx` | Slide-out panels |
| Tabs | `tabs.tsx` | Tab navigation |
| Separator | `separator.tsx` | Visual dividers |
| Scroll Area | `scroll-area.tsx` | Custom scrollbars |

### Navigation Components

| Component | File | Usage |
|-----------|------|-------|
| Dropdown Menu | `dropdown-menu.tsx` | Contextual menus |
| Popover | `popover.tsx` | Floating content |
| Command | `command.tsx` | Command palette |

### Feedback Components

| Component | File | Usage |
|-----------|------|-------|
| Alert | `alert.tsx` | Status messages |
| Badge | `badge.tsx` | Labels/tags |
| Progress | `progress.tsx` | Loading bars |
| Sonner | `sonner.tsx` | Toast notifications |

### Data Display

| Component | File | Usage |
|-----------|------|-------|
| Avatar | `avatar.tsx` | User avatars |
| Table | `table.tsx` | Data tables |
| Carousel | `carousel.tsx` | Image/card carousels |

---

## ✨ Special Effects Components

### Shooting Stars (`shooting-stars.tsx`)

Animated meteor/shooting stars background effect.

```tsx
import { ShootingStars } from '@/components/ui/shooting-stars';

<div className="relative">
  <ShootingStars />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</div>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | - | Additional classes |
| `minSpeed` | number | 10 | Minimum animation speed |
| `maxSpeed` | number | 30 | Maximum animation speed |
| `minDelay` | number | 1200 | Minimum delay between stars |
| `maxDelay` | number | 4200 | Maximum delay between stars |
| `starColor` | string | `#9E00FF` | Star color |
| `trailColor` | string | `#2EB9DF` | Trail gradient color |

---

### Stars Background (`stars-background.tsx`)

Static starry night background.

```tsx
import { StarsBackground } from '@/components/ui/stars-background';

<div className="relative min-h-screen">
  <StarsBackground />
  {/* Content */}
</div>
```

---

### Apple Cards Carousel (`apple-cards-carousel.tsx`)

3D rotating card carousel inspired by Apple's design.

```tsx
import { AppleCardsCarousel } from '@/components/ui/apple-cards-carousel';

const cards = [
  {
    title: "Scholarship Radar",
    description: "AI-powered matching",
    image: "/images/radar.png",
    link: "/dashboard/scholarships"
  },
  // ... more cards
];

<AppleCardsCarousel cards={cards} />
```

---

### Auth Fuse (`auth-fuse.tsx`)

Animated authentication form with visual effects.

```tsx
import { AuthFuse } from '@/components/ui/auth-fuse';

<AuthFuse 
  mode="login"
  onSubmit={handleLogin}
/>
```

---

### Sky Toggle (`sky-toggle.tsx`)

Animated day/night theme toggle with sky transition.

```tsx
import { SkyToggle } from '@/components/ui/sky-toggle';

<SkyToggle />
```

---

### Banner (`banner.tsx`)

Announcement banner for important messages.

```tsx
import { Banner } from '@/components/ui/banner';

<Banner
  variant="info"
  title="New Scholarships Available"
  description="Check out 50 new scholarships added this week"
  action={{
    label: "View Now",
    onClick: () => router.push('/dashboard/scholarships')
  }}
/>
```

---

### Bento Grid (`bento-grid.tsx`)

Modern grid layout for feature showcases.

```tsx
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';

<BentoGrid>
  <BentoGridItem
    title="Feature 1"
    description="Description"
    header={<ImageComponent />}
    icon={<Icon />}
    className="col-span-2"
  />
  {/* More items */}
</BentoGrid>
```

---

### Background Pattern (`bg-pattern.tsx`)

Decorative background patterns.

```tsx
import { BackgroundPattern } from '@/components/ui/bg-pattern';

<BackgroundPattern variant="dots" />
// or
<BackgroundPattern variant="grid" />
```

---

### Stagger Testimonials (`stagger-testimonials.tsx`)

Animated testimonial cards with staggered entrance.

```tsx
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';

const testimonials = [
  {
    name: "Priya S.",
    role: "Engineering Student",
    content: "ScholarSync helped me find scholarships I never knew existed!",
    avatar: "/avatars/priya.jpg"
  },
  // ... more testimonials
];

<StaggerTestimonials testimonials={testimonials} />
```

---

## 🎯 Feature Components

### Auth Components (`src/components/auth/`)

| Component | Purpose |
|-----------|---------|
| `LoginForm` | Email/password login |
| `RegisterForm` | User registration |

---

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose |
|-----------|---------|
| `DashboardAnalytics` | Stats and charts |
| `DashboardSidebar` | Navigation sidebar |

---

### Scholarship Components (`src/components/scholarships/`)

| Component | Purpose |
|-----------|---------|
| `ScholarshipCard` | Display scholarship info |
| `ScholarshipList` | List of scholarships |
| `MatchIndicator` | Match percentage display |

---

### Document Components (`src/components/documents/`)

| Component | Purpose |
|-----------|---------|
| `DocumentUploader` | File upload with OCR |
| `DocumentList` | Display uploaded docs |

---

### Fee Components (`src/components/fees/`)

| Component | Purpose |
|-----------|---------|
| `FeeAnalyzer` | Receipt upload and analysis |
| `AnomalyReport` | Display fee discrepancies |

---

### Fellowship Components (`src/components/fellowships/`)

| Component | Purpose |
|-----------|---------|
| `ChallengeCard` | Display challenge info |
| `RoleSelector` | Student/Corporate toggle |
| `ProposalForm` | Submit proposal |
| `ProjectRoom` | Chat interface |

---

### Chatbot Components (`src/components/chatbot/`)

| Component | Purpose |
|-----------|---------|
| `ChatInterface` | AI assistant chat |
| `MessageBubble` | Chat message display |

---

## 🎨 Design Tokens

### Colors

```css
/* Light Theme */
:root {
  --background: 0 0% 100%;           /* White */
  --foreground: 222.2 84% 4.9%;      /* Near black */
  --primary: 222.2 47.4% 11.2%;      /* Dark blue */
  --primary-foreground: 210 40% 98%; /* Light blue */
  --secondary: 210 40% 96.1%;        /* Light gray */
  --accent: 210 40% 96.1%;           /* Light gray */
  --muted: 210 40% 96.1%;            /* Muted gray */
  --destructive: 0 84.2% 60.2%;      /* Red */
  --border: 214.3 31.8% 91.4%;       /* Light border */
  --ring: 222.2 84% 4.9%;            /* Focus ring */
}

/* Dark Theme */
.dark {
  --background: 222.2 84% 4.9%;      /* Near black */
  --foreground: 210 40% 98%;         /* Off white */
  --primary: 210 40% 98%;            /* Light */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark */
  --secondary: 217.2 32.6% 17.5%;    /* Dark gray */
  --accent: 217.2 32.6% 17.5%;       /* Dark gray */
  --muted: 217.2 32.6% 17.5%;        /* Muted */
  --destructive: 0 62.8% 30.6%;      /* Dark red */
  --border: 217.2 32.6% 17.5%;       /* Dark border */
  --ring: 212.7 26.8% 83.9%;         /* Focus ring */
}
```

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 0.25rem (4px) | Tiny gaps |
| `space-2` | 0.5rem (8px) | Small padding |
| `space-4` | 1rem (16px) | Standard spacing |
| `space-6` | 1.5rem (24px) | Section padding |
| `space-8` | 2rem (32px) | Large gaps |
| `space-12` | 3rem (48px) | Section margins |

### Border Radius

| Token | Value |
|-------|-------|
| `radius-sm` | 0.25rem |
| `radius-md` | 0.5rem |
| `radius-lg` | 0.75rem |
| `radius-xl` | 1rem |
| `radius-full` | 9999px |

---

## 🖌️ Component Variants

### Button Variants

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Alert Variants

```tsx
<Alert variant="default">Default Info</Alert>
<Alert variant="destructive">Error Message</Alert>
```

---

## 📱 Responsive Patterns

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Example Usage

```tsx
<div className="
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-4
">
  {items.map(item => (
    <Card key={item.id}>{/* ... */}</Card>
  ))}
</div>
```

---

## 🌗 Dark Mode

### Theme Provider

```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Theme Toggle

```tsx
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

---

## ♿ Accessibility

### Focus Management

```tsx
// All interactive elements have visible focus states
<Button className="focus-visible:ring-2 focus-visible:ring-ring">
  Click me
</Button>
```

### Screen Reader Support

```tsx
// Use sr-only for screen reader text
<button>
  <Heart className="h-4 w-4" />
  <span className="sr-only">Save scholarship</span>
</button>
```

### Keyboard Navigation

All components support full keyboard navigation:
- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Activate buttons
- `Arrow keys` - Navigate within components
- `Escape` - Close modals/popovers

---

## 📐 Layout Patterns

### Dashboard Layout

```tsx
<div className="flex min-h-screen">
  {/* Sidebar */}
  <aside className="w-64 border-r">
    <Sidebar />
  </aside>
  
  {/* Main content */}
  <main className="flex-1 p-6">
    {children}
  </main>
</div>
```

### Card Grid

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {scholarships.map(scholarship => (
    <ScholarshipCard key={scholarship.id} {...scholarship} />
  ))}
</div>
```

### Split View

```tsx
<div className="grid lg:grid-cols-2 gap-8">
  <div className="space-y-6">
    {/* Left column */}
  </div>
  <div className="space-y-6">
    {/* Right column */}
  </div>
</div>
```

---

## 🚀 Performance Tips

1. **Lazy load heavy components**
   ```tsx
   const HeavyChart = dynamic(() => import('./HeavyChart'), {
     loading: () => <Skeleton />,
   });
   ```

2. **Use CSS for animations when possible**
   ```css
   .animate-pulse { animation: pulse 2s infinite; }
   ```

3. **Optimize images with Next.js Image**
   ```tsx
   import Image from 'next/image';
   <Image src="/hero.jpg" width={800} height={600} alt="Hero" />
   ```

4. **Minimize bundle size**
   - Import only needed icons: `import { Heart } from 'lucide-react'`
   - Use tree-shakeable imports

---

*Last Updated: January 2026*
