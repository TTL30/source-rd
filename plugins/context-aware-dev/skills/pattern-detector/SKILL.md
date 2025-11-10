---
name: pattern-detector
description: Detect reusable patterns in code and suggest when to apply organizational knowledge from other skills. Use when analyzing code, refactoring, or when asked about best practices, patterns, or how to implement common features.
---

# Pattern Detection and Knowledge Sharing

## When to Use This Skill

Use this skill when:
- Analyzing existing code for patterns
- User asks "how do I implement X?"
- Refactoring code to follow established patterns
- Detecting opportunities to apply organizational knowledge
- Code review and best practice suggestions

## Pattern Detection Heuristics

### Payment Processing Patterns

**Triggers to suggest stripe-payment skill:**
- Imports or mentions: `stripe`, `checkout`, `payment`
- Keywords: "payment processing", "checkout", "subscription", "billing"
- File names: `payment.ts`, `checkout.ts`, `webhook.ts`
- API endpoints: `/api/checkout`, `/api/webhooks/stripe`
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Detection logic:**
```typescript
function shouldSuggestStripePattern(context: CodeContext): boolean {
  const indicators = [
    context.hasImport('stripe'),
    context.mentionsKeyword(['payment', 'checkout', 'subscription']),
    context.hasFile('**/payment*.ts') || context.hasFile('**/checkout*.ts'),
    context.hasEnvVar('STRIPE_'),
  ];

  return indicators.filter(Boolean).length >= 2;
}
```

### Authentication Patterns

**Triggers to suggest auth-oauth skill:**
- Imports: `passport`, `oauth`, `google-auth`, `github-auth`
- Keywords: "authentication", "login", "OAuth", "social login"
- File names: `auth.ts`, `passport.ts`, `login.ts`
- Routes: `/auth/*`, `/login`, `/callback`
- Middleware patterns: `ensureAuthenticated`, `isAuthenticated`

**Detection logic:**
```typescript
function shouldSuggestOAuthPattern(context: CodeContext): boolean {
  const indicators = [
    context.hasImport(['passport', 'oauth', 'jwt']),
    context.mentionsKeyword(['authentication', 'login', 'oauth']),
    context.hasRoute('/auth/*'),
    context.hasMiddleware(['ensureAuthenticated', 'isAuthenticated']),
  ];

  return indicators.filter(Boolean).length >= 2;
}
```

### Testing Patterns

**Triggers to suggest testing-e2e skill:**
- Imports: `@playwright/test`, `cypress`, `puppeteer`
- Keywords: "E2E", "end-to-end", "browser test", "integration test"
- File names: `*.spec.ts`, `*.test.ts`, `*.e2e.ts`
- Directories: `/tests/e2e/`, `/cypress/`, `/e2e/`
- Configuration files: `playwright.config.ts`, `cypress.config.ts`

**Detection logic:**
```typescript
function shouldSuggestE2EPattern(context: CodeContext): boolean {
  const indicators = [
    context.hasImport(['@playwright/test', 'cypress', '@testing-library']),
    context.mentionsKeyword(['e2e', 'end-to-end', 'browser test']),
    context.hasDirectory('tests/e2e') || context.hasDirectory('cypress'),
    context.hasFile('playwright.config.ts') || context.hasFile('cypress.config.ts'),
  ];

  return indicators.filter(Boolean).length >= 1;
}
```

### Database Migration Patterns

**Triggers to suggest database-migration skill:**
- Imports: `prisma`, `typeorm`, `knex`, `sequelize`
- Keywords: "migration", "schema", "database", "ORM"
- File names: `schema.prisma`, `*migration*.ts`
- Directories: `/prisma/`, `/migrations/`, `/database/`
- CLI commands mentioned: `prisma migrate`, `typeorm migration`

**Detection logic:**
```typescript
function shouldSuggestMigrationPattern(context: CodeContext): boolean {
  const indicators = [
    context.hasImport(['prisma', 'typeorm', 'knex']),
    context.mentionsKeyword(['migration', 'schema', 'database']),
    context.hasDirectory('prisma') || context.hasDirectory('migrations'),
    context.hasFile('schema.prisma'),
  ];

  return indicators.filter(Boolean).length >= 1;
}
```

## Pattern Analysis Workflow

When analyzing code, follow this workflow:

### 1. Scan for Indicators

```typescript
interface CodeContext {
  imports: string[];
  keywords: string[];
  fileNames: string[];
  directories: string[];
  envVars: string[];
  routes: string[];
  dependencies: Record<string, string>;
}

function analyzeCodebase(projectPath: string): CodeContext {
  // Read package.json dependencies
  // Scan file names and directories
  // Parse imports from source files
  // Extract environment variables from .env.example
  // Parse route definitions
  return context;
}
```

### 2. Match Against Patterns

```typescript
interface Pattern {
  name: string;
  skill: string;
  confidence: number;
  matchedIndicators: string[];
}

function detectPatterns(context: CodeContext): Pattern[] {
  const patterns: Pattern[] = [];

  if (shouldSuggestStripePattern(context)) {
    patterns.push({
      name: 'stripe-payment',
      skill: 'stripe-payment',
      confidence: 0.8,
      matchedIndicators: ['stripe import', 'payment keywords'],
    });
  }

  // Check other patterns...

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
```

### 3. Suggest Relevant Skills

When patterns are detected, suggest the appropriate skill:

**Example suggestion format:**
```
I noticed you're working with [PATTERN]. Our team has an established pattern
for this in the [SKILL_NAME] skill. Would you like me to apply that pattern?

Key practices from our [SKILL_NAME] pattern:
- [Practice 1]
- [Practice 2]
- [Practice 3]
```

## Common Code Smells and Pattern Opportunities

### Payment Processing Without Standard Pattern

**Smell:**
```typescript
// Raw Stripe API calls scattered across codebase
const session = await stripe.checkout.sessions.create({...});
// No webhook verification
// Hardcoded amounts
```

**Suggestion:**
"I see you're implementing payment processing. We have a stripe-payment skill that includes webhook security, proper error handling, and subscription management. Should I help refactor this to follow that pattern?"

### Authentication Without OAuth Pattern

**Smell:**
```typescript
// Custom OAuth implementation
// No passport.js
// Manual token management
```

**Suggestion:**
"You're implementing OAuth authentication. We have an auth-oauth skill using Passport.js with Google and GitHub providers already configured. Would you like to use that pattern instead?"

### Tests Without Page Object Model

**Smell:**
```typescript
// Direct element selectors in tests
await page.click('#submit-button');
await page.fill('.email-input', 'test@example.com');
```

**Suggestion:**
"I notice you're writing E2E tests. Our testing-e2e skill uses the Page Object Model pattern for more maintainable tests. Should I help refactor these?"

### Manual Database Queries Instead of Migrations

**Smell:**
```typescript
// Raw SQL in application code
await db.query('ALTER TABLE users ADD COLUMN email VARCHAR(255)');
```

**Suggestion:**
"You're modifying the database schema directly. Our database-migration skill shows how to use Prisma migrations for version-controlled schema changes. Would you like to convert this?"

## Proactive Pattern Suggestions

### When to Proactively Suggest

1. **New Feature Request**: User says "I need to add X"
2. **Code Review**: Analyzing existing code
3. **Refactoring**: User wants to improve code
4. **Architecture Discussion**: Planning implementation
5. **Bug Fixing**: Issue related to pattern domain

### Suggestion Template

```
Based on your [REQUEST/CODE], I can apply our [SKILL_NAME] pattern which includes:

✓ [Benefit 1]
✓ [Benefit 2]
✓ [Benefit 3]

This pattern is already used in [X] other places in the codebase.

Would you like me to:
1. Apply this pattern to your current work
2. Show you the pattern documentation first
3. Customize the pattern for your specific needs
```

## Pattern Confidence Scoring

```typescript
function calculateConfidence(indicators: string[]): number {
  const weights = {
    import: 0.4,
    keyword: 0.2,
    file: 0.15,
    directory: 0.15,
    envVar: 0.1,
  };

  let score = 0;
  for (const indicator of indicators) {
    score += weights[indicator.type] || 0;
  }

  return Math.min(score, 1.0);
}
```

**Confidence thresholds:**
- >= 0.8: Strong suggestion, mention immediately
- 0.5-0.8: Moderate suggestion, ask if interested
- < 0.5: Weak signal, only mention if directly relevant

## Cross-Pattern Recognition

Some implementations require multiple patterns:

**E-commerce Platform:**
- stripe-payment (checkout)
- auth-oauth (user accounts)
- database-migration (product catalog)
- testing-e2e (user flows)

**SaaS Application:**
- stripe-payment (subscriptions)
- auth-oauth (SSO)
- database-migration (multi-tenancy)
- testing-e2e (critical paths)

When detecting these combinations, suggest integrated implementation strategy.

## Reference

This skill helps Claude autonomously detect when to apply organizational knowledge from other skills, ensuring consistency across the codebase.
