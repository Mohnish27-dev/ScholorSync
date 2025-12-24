# 🤝 Contributing to ScholarSync

Thank you for your interest in contributing to ScholarSync! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Project Structure](#project-structure)
8. [Testing Guidelines](#testing-guidelines)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting comments, or personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## 🎯 How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/JaiswalShivang/ScholarSync/issues)
- Ensure you're using the latest version
- Collect relevant information (browser, OS, error messages)

**How to submit a bug report:**

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce
3. Provide specific examples
4. Describe the behavior you observed and expected
5. Include screenshots if applicable
6. Mention your environment (OS, browser, Node version)

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node Version: [e.g., 18.17.0]
- ScholarSync Version: [e.g., 0.1.0]
```

---

### Suggesting Features

**Before submitting a feature request:**
- Check if the feature is already proposed
- Consider if it aligns with project goals
- Think about edge cases and implementation

**Feature Request Template:**

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
```

---

### Contributing Code

We welcome code contributions! Here's what you can work on:

#### Good First Issues

Look for issues labeled `good first issue`:
- UI improvements
- Documentation updates
- Bug fixes
- Adding tests

#### Areas Needing Help

- **Frontend**: New components, UI/UX improvements
- **Backend**: API optimization, new endpoints
- **AI/ML**: Improve matching algorithm, OCR accuracy
- **Documentation**: Tutorials, guides, examples
- **Testing**: Unit tests, integration tests
- **Accessibility**: WCAG compliance, keyboard navigation

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Git
- Firebase account
- Pinecone account
- Google AI API key

### Setup Steps

1. **Fork the repository**

   Click the "Fork" button on GitHub

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/ScholarSync.git
   cd ScholarSync
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/JaiswalShivang/ScholarSync.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials in `.env.local`

6. **Run development server**

   ```bash
   npm run dev
   ```

7. **Open browser**

   Navigate to http://localhost:3000

---

## 📝 Coding Standards

### TypeScript

- **Always use TypeScript** - No JavaScript files in `src/`
- **Strict mode enabled** - Fix all type errors
- **Define interfaces** - Create types in `src/types/index.ts`
- **Avoid `any`** - Use proper types or `unknown`

**Example:**

```typescript
// ❌ Bad
function processData(data: any) {
  return data.map(item => item.value);
}

// ✅ Good
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

---

### React Components

**Functional components with TypeScript:**

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

**Component organization:**

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // 4. Hooks
  const [count, setCount] = useState(0);
  
  // 5. Event handlers
  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  
  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>{count}</Button>
    </div>
  );
}
```

---

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ScholarshipCard.tsx` |
| Functions | camelCase | `calculateMatchPercentage()` |
| Variables | camelCase | `const userName = "John"` |
| Constants | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| Types/Interfaces | PascalCase | `interface UserProfile` |
| Files (non-component) | kebab-case | `firebase-utils.ts` |
| API Routes | kebab-case | `/api/scholarships/match` |

---

### File Structure

**Component files:**

```
src/components/scholarships/
├── ScholarshipCard.tsx       # Main component
├── ScholarshipCard.test.tsx  # Tests (if applicable)
└── index.ts                  # Re-export
```

**API route files:**

```
src/app/api/scholarships/match/
└── route.ts                  # POST handler
```

---

### Code Style

**Use Prettier and ESLint:**

```bash
# Format code
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Key rules:**

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline
- Max line length: 100 characters

**Example:**

```typescript
// ✅ Good
const scholarships = await db
  .collection('scholarships')
  .where('type', '==', 'government')
  .get();

const data = {
  name: 'John',
  age: 25,
  city: 'Delhi', // trailing comma
};

// ❌ Bad
const scholarships = await db.collection('scholarships').where('type', '==', 'government').get();

const data = {
  name: "John",
  age: 25,
  city: "Delhi" // no trailing comma
}
```

---

### Comments

**Use JSDoc for functions:**

```typescript
/**
 * Calculates match percentage between user profile and scholarship
 * @param profile - User profile data
 * @param scholarship - Scholarship eligibility criteria
 * @returns Match percentage (0-100)
 */
function calculateMatchPercentage(
  profile: UserProfile,
  scholarship: Scholarship
): number {
  // Implementation
}
```

**Inline comments for complex logic:**

```typescript
// Calculate weighted score based on priority
const score = 
  categoryMatch * 0.25 +  // Category is 25% of total
  incomeMatch * 0.20 +    // Income is 20% of total
  percentageMatch * 0.20; // Marks are 20% of total
```

---

## 🎯 Commit Guidelines

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(scholarships): add "Why Not Me?" analysis feature

Implement AI-powered gap analysis for near-miss scholarships.
Shows actionable steps to improve eligibility.

Closes #42

---

fix(auth): resolve OAuth redirect issue

Fixed bug where OAuth redirect failed on mobile browsers
by updating authorized domains configuration.

Fixes #38

---

docs(readme): update installation instructions

Added clarification for Pinecone index setup
and Firebase configuration steps.
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork:**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes:**

   - Follow coding standards
   - Add tests if applicable
   - Update documentation

4. **Test locally:**

   ```bash
   npm run dev
   npm run lint
   npm run build
   ```

5. **Commit your changes:**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork:**

   ```bash
   git push origin feature/amazing-feature
   ```

---

### Submitting PR

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

**PR Template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No ESLint errors

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

---

### PR Review Process

1. **Automated Checks**
   - Vercel deployment preview
   - TypeScript compilation
   - ESLint checks

2. **Code Review**
   - Maintainer reviews code
   - May request changes
   - Discussion and iteration

3. **Approval & Merge**
   - Once approved, maintainer merges
   - Your contribution is live!

---

## 📂 Project Structure

Understanding the structure helps you navigate:

```
ScholarSync/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Auth pages
│   │   └── dashboard/      # Dashboard pages
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Feature components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities
│   │   ├── firebase/      # Firebase config
│   │   ├── langchain/     # AI config
│   │   └── pinecone/      # Vector DB config
│   └── types/             # TypeScript types
├── public/                # Static assets
├── .env.example           # Environment template
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

---

## 🧪 Testing Guidelines

### Manual Testing

Before submitting PR, test these flows:

1. **Authentication**
   - Sign up with email
   - Login with email
   - Logout

2. **Scholarship Matching**
   - Create/update profile
   - View matched scholarships
   - Check match percentages

3. **Document Upload**
   - Upload document
   - Verify OCR extraction
   - Test auto-fill

4. **Fee Analysis**
   - Upload receipt
   - Check anomaly detection
   - Verify report generation

---

### Writing Tests (Future Enhancement)

```typescript
// Example test structure
describe('calculateMatchPercentage', () => {
  it('should return 100% for perfect match', () => {
    const profile = { category: 'OBC', income: 300000 };
    const scholarship = { 
      eligibility: { categories: ['OBC'], incomeLimit: 500000 }
    };
    
    const result = calculateMatchPercentage(profile, scholarship);
    expect(result.percentage).toBe(100);
  });
  
  it('should return 0% for complete mismatch', () => {
    // Test case
  });
});
```

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Simplicity**: Clear, uncluttered interfaces
2. **Accessibility**: WCAG 2.1 AA compliance
3. **Responsiveness**: Mobile-first design
4. **Consistency**: Use shadcn/ui components

### Component Usage

**Always use shadcn/ui components:**

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Button variant="default">Click Me</Button>

// ❌ Bad
<button className="bg-blue-500...">Click Me</button>
```

---

## 📚 Documentation

### When to Update Docs

- Adding new features → Update README.md
- Changing API → Update API_DOCUMENTATION.md
- Architectural changes → Update ARCHITECTURE.md
- New setup steps → Update SETUP.md

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Link to related docs

---

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for "Contributor" badge

---

## ❓ Questions?

- **GitHub Discussions**: For general questions
- **Issues**: For bugs and feature requests
- **Email**: For private inquiries

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

<div align="center">
  <h3>Thank you for contributing to ScholarSync! 🎓</h3>
  <p>Together, we're helping students access the education they deserve.</p>
</div>
