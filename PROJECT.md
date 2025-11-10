# Context-Aware Development Plugin: Implementation Project

**Status:** Planning → Implementation
**Approach:** Iterative (Simple → Complex)
**Date:** 2025-11-10

---

## 🎯 What We're Building

A Claude Code plugin that solves three critical problems in AI-assisted development:

1. **Scattered Organizational Knowledge** → Build a cross-project knowledge hub
2. **Ad-Hoc Development Methodology** → Provide guided workflows
3. **Context Loss Across Sessions** → Persistent artifacts and smart resumption

---

## 🚀 The Solution (Three Pillars)

### Pillar 1: Organizational Knowledge Hub
**What:** Share patterns, standards, and best practices across all projects
**How:** Plugin Skills that Claude auto-discovers
**Value:** Stop reinventing the wheel, maintain consistency

### Pillar 2: Guided Workflow
**What:** Structured methodology for feature development
**How:** Slash commands (`/elaborate`, `/plan`, `/implement`)
**Value:** Better planning upfront, fewer corrections later

### Pillar 3: Persistent Context & Artifacts
**What:** Specs, plans, and context that survive sessions
**How:** Artifacts linked to native session IDs, smart resumption
**Value:** Pick up where you left off, no context loss

---

## 📋 Implementation Roadmap (Simple → Complex)

```
Step 1: Basic Plugin Foundation (Week 1-2)
├─ Plugin loads successfully
├─ Hooks work (SessionStart, PostToolUse)
└─ Basic file operations

Step 2: Organizational Knowledge Hub (Week 3-4)
├─ Plugin Skills framework
├─ Pattern library (5+ patterns)
└─ Auto-discovery working

Step 3: Guided Workflow (Week 5-6)
├─ /elaborate command
├─ /plan command
└─ /implement command

Step 4: Persistent Context & Smart Resumption (Week 7-8)
├─ Session artifact storage
├─ Smart resumption prompt
├─ CLAUDE.md auto-refresh
└─ Observation system

Step 5: Polish & Testing (Week 9-10)
├─ Error handling
├─ Performance optimization
└─ Documentation
```

---

## Step 1: Basic Plugin Foundation

### 🎯 Goal
Get a minimal plugin running that can hook into Claude Code lifecycle events.

### ✅ Success Criteria
- [ ] Plugin loads without errors
- [ ] SessionStart hook triggers and receives session_id
- [ ] PostToolUse hook captures tool usage
- [ ] Can create `.claude/` directory structure
- [ ] Basic logging works

### 🔧 Components to Build

#### 1.1 Plugin Infrastructure
**File:** `package.json`
```json
{
  "name": "context-aware-dev-plugin",
  "version": "0.1.0",
  "main": "dist/index.js",
  "claudeCode": {
    "hooks": "./hooks/hooks.json"
  }
}
```

**File:** `src/index.ts`
```typescript
// Main plugin entry point
export async function activate() {
  console.log('Context-Aware Dev Plugin activated')
}

export async function deactivate() {
  console.log('Plugin deactivated')
}
```

#### 1.2 Hook Configuration
**File:** `hooks/hooks.json`
```json
{
  "SessionStart": {
    "bash": "node ./dist/hooks/session-start.js '${CLAUDE_SESSION_ID}' '${CLAUDE_MATCHER}' '${CLAUDE_PROJECT_DIR}'",
    "description": "Initialize session context"
  },
  "PostToolUse": {
    "bash": "node ./dist/hooks/post-tool-use.js '${CLAUDE_TOOL_NAME}' '${CLAUDE_TOOL_OUTPUT}'",
    "description": "Track tool usage"
  }
}
```

#### 1.3 SessionStart Hook
**File:** `src/hooks/session-start.ts`
```typescript
#!/usr/bin/env node

async function handleSessionStart(
  sessionId: string,
  matcher: 'startup' | 'resume' | 'clear' | 'compact',
  projectDir: string
) {
  console.log(`Session ${sessionId} started (${matcher})`)

  // Ensure .claude directory exists
  await ensureDirectory(path.join(projectDir, '.claude'))
  await ensureDirectory(path.join(projectDir, '.claude', 'artifacts'))

  // Log event
  console.log('✓ Plugin ready')
}

const [sessionId, matcher, projectDir] = process.argv.slice(2)
handleSessionStart(sessionId, matcher as any, projectDir).catch(console.error)
```

#### 1.4 PostToolUse Hook
**File:** `src/hooks/post-tool-use.ts`
```typescript
#!/usr/bin/env node

async function handlePostToolUse(
  toolName: string,
  toolOutput: string
) {
  // Log tool usage (for now, just console)
  console.log(`Tool used: ${toolName}`)
}

const [toolName, toolOutput] = process.argv.slice(2)
handlePostToolUse(toolName, toolOutput).catch(console.error)
```

### 📦 Dependencies
```json
{
  "dependencies": {
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 🧪 Testing
```bash
# Install plugin locally
cd /path/to/plugin
npm install
npm run build
claude-code plugin link .

# Test in a project
cd /path/to/test-project
claude
# Should see: "Context-Aware Dev Plugin activated"
```

### 📝 Deliverables
- [ ] Plugin package.json configured
- [ ] Hooks configuration file created
- [ ] SessionStart hook implemented (basic)
- [ ] PostToolUse hook implemented (basic)
- [ ] Directory structure creation works
- [ ] Plugin can be installed and loaded

---

## Step 2: Organizational Knowledge Hub (Plugin Skills)

### 🎯 Goal
Create a discoverable pattern library using Plugin Skills that Claude can automatically suggest.

### ✅ Success Criteria
- [ ] 5+ patterns packaged as Plugin Skills
- [ ] Claude auto-suggests patterns based on keywords
- [ ] Skills are installable as a package
- [ ] Pattern Detection Skill identifies reusable code

### 🔧 Components to Build

#### 2.1 Skills Directory Structure
```
.claude/skills/
├── stripe-payment/
│   ├── SKILL.md
│   ├── examples/
│   │   └── webhook-handler.ts
│   └── templates/
│       └── config.ts
├── auth-oauth/
│   ├── SKILL.md
│   └── examples/
│       └── passport-setup.ts
├── testing-e2e/
│   └── SKILL.md
├── database-migration/
│   └── SKILL.md
└── pattern-detector/
    └── SKILL.md
```

#### 2.2 Pattern Skill Template
**File:** `.claude/skills/stripe-payment/SKILL.md`
```markdown
---
name: stripe-payment-pattern
description: Stripe payment integration with webhook handling and signature verification. Use when implementing payments, Stripe, webhooks, or checkout flows.
keywords: [payments, stripe, checkout, webhooks, billing, subscriptions]
category: payments
version: 1.0.0
---

# Stripe Payment Pattern

## Problem
Need to implement payment processing securely and reliably with webhook support.

## Solution
Use Stripe with webhook-based processing for async payment events and proper signature verification.

## Rationale
- Battle-tested payment provider (PCI compliance handled)
- Webhook-based for reliability (retry logic built-in)
- Strong TypeScript SDK
- Excellent documentation and testing tools

## Trade-offs
**Pros:**
- Secure and compliant out of the box
- Handles complex edge cases (refunds, disputes)
- Easy to test (Stripe CLI for webhooks)

**Cons:**
- Vendor lock-in
- Fees on transactions
- Learning curve for webhooks

## Implementation Guide

### Step 1: Install Dependencies

npm install stripe
npm install --save-dev @types/stripe

### Step 2: Environment Configuration
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

### Step 3: Initialize Stripe Client

// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

### Step 4: Webhook Handler with Signature Verification
// src/api/webhooks/stripe.ts
import { stripe } from '@/lib/stripe'

export async function handleStripeWebhook(req: Request) {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  // Verify webhook signature (CRITICAL for security)
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  // Handle event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
  }

  return { received: true }
}

## Example Usage
See full implementation: `examples/webhook-handler.ts`

## Related Patterns
- API Design Standard (for webhook endpoint structure)
- Error Handling Pattern (for payment failures)

## Version History
- v1.0.0 (2025-01-20): Initial pattern
```

#### 2.3 Pattern Detection Skill
**File:** `.claude/skills/pattern-detector/SKILL.md`
```markdown
---
name: pattern-detector
description: Analyzes completed work to detect reusable patterns worth sharing. Use after implementing significant features.
keywords: [patterns, reusable, contribution, documentation]
category: meta
version: 1.0.0
---

# Pattern Detector

## Purpose
Identifies when an implementation is generic enough to become an organizational pattern.

## Detection Heuristics

**Trigger when ALL of these are true:**
1. Multiple files created (3+)
2. Has tests
3. Uses configuration (not hardcoded)
4. Follows org conventions
5. NOT already in pattern library
6. Common domain (auth, payments, email, caching, testing)

## Suggested Prompt

"💡 This implementation looks reusable! It has:
• Multiple files with clear structure
• Configuration-based approach
• Tests included
• Common domain: [payments/auth/etc]

Would you like to create a pattern from this?"

## Implementation
```typescript
function shouldSuggestPattern(implementation: CodeAnalysis): boolean {
  return (
    implementation.files.length >= 3 &&
    implementation.hasTests &&
    implementation.usesConfig &&
    !implementation.hasHardcodedValues &&
    implementation.followsOrgStyle &&
    !existsInOrgStandards(implementation.topic) &&
    isCommonDomain(implementation.topic)
  )
}
```
```

#### 2.4 Pattern Library Package
**File:** `org-knowledge-plugin/package.json`
```json
{
  "name": "@myorg/knowledge-plugin",
  "version": "1.0.0",
  "description": "Organizational patterns and standards",
  "claudeCode": {
    "skills": "./skills"
  }
}
```

#### 2.5 CLAUDE.md Pattern Index
**File:** `.claude/CLAUDE.md` (auto-generated)
```markdown
# Project Overview

**Tech Stack:** [auto-detected]

## Available Patterns

Our organization has the following patterns available:

### Payments
- **Stripe Payment Pattern** - Webhook-based payment processing
  - Use: `/search-pattern stripe`
  - Skill: `@.claude/skills/stripe-payment/SKILL.md`

### Authentication
- **OAuth Pattern** - Social authentication with Passport.js
  - Use: `/search-pattern oauth`
  - Skill: `@.claude/skills/auth-oauth/SKILL.md`

### Testing
- **E2E Testing Pattern** - End-to-end tests with Playwright
  - Use: `/search-pattern e2e`
  - Skill: `@.claude/skills/testing-e2e/SKILL.md`

> 💡 Claude will automatically suggest these patterns when you mention relevant keywords (payments, auth, testing, etc.)
```

### 🧪 Testing
```bash
# Test pattern discovery
claude
> "I need to add payment processing"
# Expected: Claude suggests Stripe pattern

# Test manual search
> "/search-pattern stripe"
# Expected: Shows Stripe pattern skill

# Test pattern detection
> [After implementing OAuth]
# Expected: "This looks reusable, create a pattern?"
```

### 📝 Deliverables
- [ ] Skills directory structure created
- [ ] 5+ patterns documented as Skills
- [ ] Pattern Detection Skill implemented
- [ ] CLAUDE.md includes pattern index
- [ ] Skills are discoverable by Claude
- [ ] Manual `/search-pattern` command works

---

## Step 3: Guided Workflow (Slash Commands)

### 🎯 Goal
Implement `/elaborate`, `/plan`, `/implement` commands that guide feature development.

### ✅ Success Criteria
- [ ] `/elaborate` creates spec.md through conversation
- [ ] `/plan` generates technical plan from spec
- [ ] `/implement` guides execution with plan reference
- [ ] Artifacts saved to `.claude/artifacts/${session_id}/`
- [ ] Works seamlessly across sessions

### 🔧 Components to Build

#### 3.1 Command Structure
```
.claude/commands/
├── elaborate.md
├── plan.md
└── implement.md
```

#### 3.2 /elaborate Command
**File:** `.claude/commands/elaborate.md`
```markdown
# Functional Planning: /elaborate

You are helping the developer create a functional specification through an interactive conversation.

## Your Role
- Ask clarifying questions about requirements
- Explore edge cases and user flows
- Reference existing patterns when relevant
- Keep the conversation focused

## Conversation Flow

### Step 1: Understand the Goal
Ask: "What feature are you building? What problem does it solve?"

### Step 2: Explore Requirements
Ask about:
- User flows (who does what, when?)
- Edge cases (what could go wrong?)
- Integration points (what systems are involved?)
- Success criteria (how do we know it works?)

### Step 3: Reference Patterns
Search for relevant organizational patterns:
- If "payment" mentioned → suggest Stripe pattern
- If "auth" mentioned → suggest OAuth pattern
- If "testing" mentioned → suggest E2E pattern

### Step 4: Generate Spec
Once you have enough information, create:

**File:** `.claude/artifacts/${session_id}/spec.md`
```markdown
# Functional Spec: [Feature Name]

## Problem
[What problem are we solving?]

## Solution
[High-level approach]

## User Flows
1. [Primary flow]
2. [Alternative flows]
3. [Error cases]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Edge Cases
- Case 1: [description and handling]
- Case 2: [description and handling]

## Related Patterns
- [Pattern 1] - [Why relevant]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

Also create metadata:
**File:** `.claude/artifacts/${session_id}/metadata.json`
```json
{
  "session_id": "${session_id}",
  "created": "[timestamp]",
  "description": "[one-line feature description]",
  "tags": ["tag1", "tag2"],
  "status": "planning",
  "hasSpec": true,
  "hasPlan": false
}
```

## Final Message
"✅ Spec created! Next steps:
1. Review the spec: @.claude/artifacts/${session_id}/spec.md
2. Create technical plan: /plan
3. Start implementation: /implement"
```

#### 3.3 /plan Command
**File:** `.claude/commands/plan.md`
```markdown
# Technical Planning: /plan

You are creating a technical implementation plan based on the functional spec.

## Prerequisites
Check that spec exists: `.claude/artifacts/${session_id}/spec.md`
- If not found: "Please run /elaborate first to create a spec"

## Your Process

### Step 1: Load Context
1. Read @.claude/artifacts/${session_id}/spec.md
2. Read @.claude/CLAUDE.md (project context)
3. Search for relevant patterns based on spec requirements

### Step 2: Design Technical Approach
Consider:
- **Architecture:** How does this fit into existing structure?
- **Data Model:** What data structures are needed?
- **API Design:** What endpoints/functions?
- **Error Handling:** How to handle failures?
- **Testing:** What tests are needed?

### Step 3: Reference Patterns
Apply relevant organizational patterns:
- If payments: Reference Stripe pattern implementation steps
- If auth: Reference OAuth pattern setup
- If testing: Reference E2E pattern structure

### Step 4: Generate Plan
**File:** `.claude/artifacts/${session_id}/plan.md`
```markdown
# Technical Plan: [Feature Name]

## Overview
[High-level technical approach]

## Architecture
[How this fits into existing system]

## Implementation Steps

### Phase 1: [Foundation]
1. [Step with file references]
2. [Step with file references]

### Phase 2: [Core Logic]
1. [Step with file references]
2. [Step with file references]

### Phase 3: [Testing & Polish]
1. [Step with file references]
2. [Step with file references]

## Files to Create/Modify
- `path/to/file1.ts` - [Purpose]
- `path/to/file2.ts` - [Purpose]

## Data Model
interface Model {
  // ...
}
## API Design
// Endpoint signatures

## Error Handling
- Error 1: [handling strategy]
- Error 2: [handling strategy]

## Testing Strategy
- Unit tests: [what to test]
- Integration tests: [what to test]
- E2E tests: [what to test]

## Related Patterns Applied
- [Pattern name]: [how applied]

## Estimated Complexity
[Low/Medium/High] - [reasoning]
```

Update metadata:
```json
{
  "status": "in_progress",
  "hasPlan": true
}
```

## Final Message
"✅ Plan created! Next steps:
1. Review the plan: @.claude/artifacts/${session_id}/plan.md
2. Start implementation: /implement"
```

#### 3.4 /implement Command
**File:** `.claude/commands/implement.md`
```markdown
# Guided Implementation: /implement

You are guiding the developer through implementing the feature based on the technical plan.

## Prerequisites
Check that plan exists: `.claude/artifacts/${session_id}/plan.md`
- If not found: "Please run /plan first to create a technical plan"

## Your Process

### Step 1: Load Plan
Read @.claude/artifacts/${session_id}/plan.md

### Step 2: Review with Developer
Show a summary:
"📋 Implementation Plan Summary:
- Phase 1: [name] ([X] steps)
- Phase 2: [name] ([X] steps)
- Phase 3: [name] ([X] steps)

Files to create/modify: [X]

Ready to start? I'll guide you through each step."

### Step 3: Step-by-Step Execution
For each step in the plan:
1. Explain what we're building
2. Show the code
3. Wait for confirmation before proceeding
4. Reference relevant patterns as needed

### Step 4: Testing Checkpoints
After each phase:
- Suggest running tests
- Verify functionality works
- Address any issues before moving forward

### Step 5: Completion
When done:
- Update metadata to "completed"
- Suggest next steps (documentation, deployment, etc.)

## Execution Style
- **Reference plan frequently:** "According to our plan..."
- **One step at a time:** Don't jump ahead
- **Explain decisions:** Why this approach
- **Offer alternatives:** If better approach found
- **Stay flexible:** Plan is guide, not law
```

#### 3.5 Command Handler Logic
**File:** `src/commands/command-handler.ts`
```typescript
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function handleCommand(
  command: string,
  sessionId: string,
  projectDir: string
) {
  const commandsDir = path.join(projectDir, '.claude', 'commands')

  switch (command) {
    case 'elaborate':
      return await executeCommand(path.join(commandsDir, 'elaborate.md'), sessionId)
    case 'plan':
      return await executeCommand(path.join(commandsDir, 'plan.md'), sessionId)
    case 'implement':
      return await executeCommand(path.join(commandsDir, 'implement.md'), sessionId)
    default:
      throw new Error(`Unknown command: ${command}`)
  }
}

async function executeCommand(commandFile: string, sessionId: string) {
  // Commands are markdown files that Claude Code executes
  // The markdown contains instructions for Claude
  return {
    commandFile,
    sessionId,
    // Claude Code handles the actual execution
  }
}
```

### 🧪 Testing
```bash
# Test elaborate
claude
> "/elaborate"
> "Add payment processing with Stripe"
# Expected: Interactive conversation → spec.md created

# Test plan
> "/plan"
# Expected: Technical plan created referencing spec

# Test implement
> "/implement"
# Expected: Step-by-step guidance with code

# Test artifacts persist
[Exit and restart Claude]
claude --resume [select session]
# Expected: @spec.md and @plan.md are accessible
```

### 📝 Deliverables
- [ ] `/elaborate` command implemented
- [ ] `/plan` command implemented
- [ ] `/implement` command implemented
- [ ] Artifacts saved to session-specific directory
- [ ] Metadata tracking works
- [ ] Commands reference each other properly
- [ ] Workflow is intuitive and helpful

---

## Step 4: Persistent Context & Smart Resumption

### 🎯 Goal
Ensure context persists across sessions and Claude proactively helps resume work.

### ✅ Success Criteria
- [ ] Smart resumption prompt on fresh startup
- [ ] Artifacts auto-load on native --resume
- [ ] CLAUDE.md auto-refresh detects significant changes
- [ ] Observation system tracks and summarizes work
- [ ] Cross-session knowledge persists

### 🔧 Components to Build

#### 4.1 Smart Resumption (SessionStart Hook Enhancement)
**File:** `src/hooks/session-start.ts` (enhanced)
```typescript
#!/usr/bin/env node
import fs from 'fs-extra'
import path from 'path'

interface SessionMetadata {
  session_id: string
  created: string
  description: string
  tags: string[]
  status: 'planning' | 'in_progress' | 'completed'
  hasSpec: boolean
  hasPlan: boolean
  lastActivity?: string
}

async function handleSessionStart(
  sessionId: string,
  matcher: 'startup' | 'resume' | 'clear' | 'compact',
  projectDir: string
) {
  const artifactsDir = path.join(projectDir, '.claude', 'artifacts')
  await fs.ensureDir(artifactsDir)

  // Case 1: Fresh startup - check for incomplete work
  if (matcher === 'startup') {
    const recentSessions = await findRecentSessions(artifactsDir)
    const incompleteWork = recentSessions.find(s => s.status !== 'completed')

    if (incompleteWork) {
      console.log(formatResumptionPrompt(incompleteWork, recentSessions))
    } else {
      console.log('Welcome! What are you working on today?')
    }
    return
  }

  // Case 2: Resume - load artifacts
  if (matcher === 'resume') {
    const metadata = await loadSessionMetadata(artifactsDir, sessionId)
    if (metadata) {
      console.log(formatResumptionMessage(metadata))
      // Artifacts will be accessible via @file references
    }
    return
  }
}

async function findRecentSessions(artifactsDir: string): Promise<SessionMetadata[]> {
  const sessions: SessionMetadata[] = []
  const dirs = await fs.readdir(artifactsDir, { withFileTypes: true })

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue

    const metadataPath = path.join(artifactsDir, dir.name, 'metadata.json')
    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJson(metadataPath)
      sessions.push(metadata)
    }
  }

  // Sort by most recent
  return sessions.sort((a, b) =>
    new Date(b.lastActivity || b.created).getTime() -
    new Date(a.lastActivity || a.created).getTime()
  )
}

function formatResumptionPrompt(
  incomplete: SessionMetadata,
  allRecent: SessionMetadata[]
): string {
  const timeAgo = getTimeAgo(incomplete.lastActivity || incomplete.created)

  return `
Welcome! I see you were working on **${incomplete.description}** ${timeAgo}.

📋 Last session (${incomplete.session_id.slice(0, 8)}):
${incomplete.hasSpec ? '• ✅ Completed functional spec' : '• ⏳ Spec in progress'}
${incomplete.hasPlan ? '• ✅ Created technical plan' : '• ⏳ Plan pending'}
• Status: ${incomplete.status}

Would you like to:
1. **Continue that work** (I'll load the context)
2. **Start fresh** on something new
3. **See other recent sessions** (${allRecent.length - 1} more)

> You can also use \`claude --resume\` and select the session directly.
`
}

function formatResumptionMessage(metadata: SessionMetadata): string {
  return `
Resuming: **${metadata.description}**

📋 Where we left off:
• Status: ${metadata.status}
${metadata.hasSpec ? `• Spec: @.claude/artifacts/${metadata.session_id}/spec.md` : ''}
${metadata.hasPlan ? `• Plan: @.claude/artifacts/${metadata.session_id}/plan.md` : ''}

Ready to continue${metadata.status === 'planning' ? ' planning' : metadata.status === 'in_progress' ? ' implementation' : ''}?
`
}

function getTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

async function loadSessionMetadata(
  artifactsDir: string,
  sessionId: string
): Promise<SessionMetadata | null> {
  const metadataPath = path.join(artifactsDir, sessionId, 'metadata.json')
  if (await fs.pathExists(metadataPath)) {
    return await fs.readJson(metadataPath)
  }
  return null
}

// Run handler
const [sessionId, matcher, projectDir] = process.argv.slice(2)
handleSessionStart(sessionId, matcher as any, projectDir).catch(console.error)
```

#### 4.2 CLAUDE.md Auto-Generation
**File:** `src/utils/claude-md-generator.ts`
```typescript
import fs from 'fs-extra'
import path from 'path'

interface ProjectAnalysis {
  techStack: string[]
  architecture: string[]
  conventions: string[]
  patterns: string[]
}

export async function generateClaudeMd(projectDir: string): Promise<string> {
  const analysis = await analyzeProject(projectDir)

  return `# Project Overview

**Tech Stack:** ${analysis.techStack.join(', ')}

**Architecture:**
${analysis.architecture.map(a => `- ${a}`).join('\n')}

**Key Conventions:**
${analysis.conventions.map(c => `- ${c}`).join('\n')}

## Available Patterns

${analysis.patterns.map(p => `- **${p}** - @.claude/skills/${p}/SKILL.md`).join('\n')}

> 💡 Claude will automatically suggest these patterns when relevant keywords are mentioned.

---

*This file is auto-generated. Last updated: ${new Date().toISOString()}*
`
}

async function analyzeProject(projectDir: string): Promise<ProjectAnalysis> {
  const techStack = await detectTechStack(projectDir)
  const architecture = await detectArchitecture(projectDir)
  const conventions = await detectConventions(projectDir)
  const patterns = await listAvailablePatterns(projectDir)

  return { techStack, architecture, conventions, patterns }
}

async function detectTechStack(projectDir: string): Promise<string[]> {
  const stack: string[] = []

  // Check package.json
  const packageJsonPath = path.join(projectDir, 'package.json')
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath)
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

    if (deps['next']) stack.push('Next.js')
    if (deps['react']) stack.push('React')
    if (deps['@apollo/server']) stack.push('GraphQL')
    if (deps['prisma']) stack.push('Prisma ORM')
    if (deps['typescript']) stack.push('TypeScript')
    // Add more detection logic...
  }

  // Check requirements.txt (Python)
  const requirementsPath = path.join(projectDir, 'requirements.txt')
  if (await fs.pathExists(requirementsPath)) {
    stack.push('Python')
    // Parse dependencies...
  }

  return stack
}

async function detectArchitecture(projectDir: string): Promise<string[]> {
  const arch: string[] = []

  // Check directory structure
  const srcDir = path.join(projectDir, 'src')
  if (await fs.pathExists(srcDir)) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        arch.push(`${entry.name}/ - ${getDirectoryDescription(entry.name)}`)
      }
    }
  }

  return arch
}

function getDirectoryDescription(dirName: string): string {
  const descriptions: Record<string, string> = {
    'api': 'REST API endpoints',
    'graphql': 'GraphQL schema and resolvers',
    'components': 'React components',
    'pages': 'Next.js pages',
    'lib': 'Utility libraries',
    'prisma': 'Database schema and migrations',
    'tests': 'Test files',
  }
  return descriptions[dirName] || 'Application code'
}

async function detectConventions(projectDir: string): Promise<string[]> {
  // Analyze code patterns and conventions
  // This could be enhanced with actual code analysis
  return [
    'Use TypeScript for type safety',
    'Colocate tests with source files',
    'Use ESLint and Prettier for code formatting',
  ]
}

async function listAvailablePatterns(projectDir: string): Promise<string[]> {
  const skillsDir = path.join(projectDir, '.claude', 'skills')
  if (!await fs.pathExists(skillsDir)) return []

  const entries = await fs.readdir(skillsDir, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
}
```

#### 4.3 CLAUDE.md Refresh Detection (PostToolUse Hook)
**File:** `src/hooks/post-tool-use.ts` (enhanced)
```typescript
#!/usr/bin/env node
import fs from 'fs-extra'
import path from 'path'

interface ChangeSignal {
  type: 'dependency' | 'structure' | 'architecture' | 'tech_stack'
  severity: 'low' | 'medium' | 'high'
  description: string
  files_affected: string[]
}

// Track changes in memory (per session)
const sessionChanges = new Map<string, ChangeSignal[]>()

async function handlePostToolUse(
  toolName: string,
  toolInput: string,
  toolOutput: string,
  projectDir: string
) {
  // Detect significant changes
  const signal = await detectSignificantChange(toolName, toolInput, projectDir)

  if (signal) {
    const sessionId = getCurrentSessionId() // Get from environment
    const signals = sessionChanges.get(sessionId) || []
    signals.push(signal)
    sessionChanges.set(sessionId, signals)

    // Check if we should suggest refresh
    if (shouldSuggestRefresh(signals)) {
      console.log(generateRefreshSuggestion(signals, projectDir))
      sessionChanges.delete(sessionId) // Reset after suggesting
    }
  }
}

async function detectSignificantChange(
  toolName: string,
  toolInput: string,
  projectDir: string
): Promise<ChangeSignal | null> {
  // Parse tool input (it's JSON string)
  let input: any
  try {
    input = JSON.parse(toolInput)
  } catch {
    return null
  }

  // Signal 1: Dependency file changes
  if (toolName === 'Edit' || toolName === 'Write') {
    const file = input.file_path || input.path
    const depFiles = ['package.json', 'requirements.txt', 'go.mod', 'Cargo.toml']

    if (depFiles.some(df => file.endsWith(df))) {
      return {
        type: 'dependency',
        severity: 'high',
        description: 'Dependency file modified',
        files_affected: [file]
      }
    }
  }

  // Signal 2: New directory created
  if (toolName === 'Write') {
    const file = input.file_path || input.path
    const parts = file.split('/')

    if (parts.length >= 3 && parts[0] === 'src') {
      const dir = parts[1]
      const dirPath = path.join(projectDir, 'src', dir)

      // Check if this is a new top-level directory
      const isNew = !(await fs.pathExists(path.join(dirPath, '..', '..', '.git')))

      if (isNew) {
        return {
          type: 'structure',
          severity: 'high',
          description: `New directory created: src/${dir}`,
          files_affected: [dirPath]
        }
      }
    }
  }

  // Signal 3: Tech stack keyword in new files
  if (toolName === 'Write') {
    const file = input.file_path || input.path
    const techKeywords = ['graphql', 'prisma', 'trpc', 'grpc', 'microservice']

    if (techKeywords.some(kw => file.toLowerCase().includes(kw))) {
      return {
        type: 'tech_stack',
        severity: 'high',
        description: 'New technology detected in file structure',
        files_affected: [file]
      }
    }
  }

  return null
}

function shouldSuggestRefresh(signals: ChangeSignal[]): boolean {
  const highSeverity = signals.filter(s => s.severity === 'high').length
  const totalSignals = signals.length

  // Suggest if: 2+ high-severity OR 3+ total signals
  return highSeverity >= 2 || totalSignals >= 3
}

function generateRefreshSuggestion(signals: ChangeSignal[], projectDir: string): string {
  const grouped = groupSignalsByType(signals)

  return `
💡 I notice we've made significant changes to the project:

${Object.entries(grouped).map(([type, sigs]) =>
  `${getTypeEmoji(type)} ${getTypeDescription(type)}: ${sigs.length} change(s)`
).join('\n')}

Your CLAUDE.md might be outdated. Would you like me to refresh it?
1. **Update CLAUDE.md automatically**
2. **Show preview first**
3. **Skip for now**
`
}

function groupSignalsByType(signals: ChangeSignal[]): Record<string, ChangeSignal[]> {
  const grouped: Record<string, ChangeSignal[]> = {}

  for (const signal of signals) {
    if (!grouped[signal.type]) grouped[signal.type] = []
    grouped[signal.type].push(signal)
  }

  return grouped
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    dependency: '📦',
    structure: '📁',
    architecture: '🏗️',
    tech_stack: '⚡'
  }
  return emojis[type] || '•'
}

function getTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    dependency: 'Dependencies modified',
    structure: 'Directory structure changed',
    architecture: 'Architecture updated',
    tech_stack: 'New technology added'
  }
  return descriptions[type] || type
}

function getCurrentSessionId(): string {
  // This would come from Claude Code environment
  return process.env.CLAUDE_SESSION_ID || 'unknown'
}

// Run handler
const [toolName, toolInput, toolOutput, projectDir] = process.argv.slice(2)
handlePostToolUse(toolName, toolInput, toolOutput, projectDir).catch(console.error)
```

#### 4.4 Observation System (Basic)
**File:** `src/observation/observer.ts`
```typescript
import Database from 'better-sqlite3'
import path from 'path'

interface Observation {
  id?: number
  session_id: string
  timestamp: string
  tool_name: string
  tool_input: string
  tool_output: string
  context?: string
}

export class ObservationSystem {
  private db: Database.Database

  constructor(projectDir: string) {
    const dbPath = path.join(projectDir, '.claude', 'observations.db')
    this.db = new Database(dbPath)
    this.initializeSchema()
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        tool_name TEXT NOT NULL,
        tool_input TEXT,
        tool_output TEXT,
        context TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_session
        ON observations(session_id);

      CREATE INDEX IF NOT EXISTS idx_timestamp
        ON observations(timestamp DESC);
    `)
  }

  recordObservation(obs: Observation) {
    const stmt = this.db.prepare(`
      INSERT INTO observations
        (session_id, tool_name, tool_input, tool_output, context)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(
      obs.session_id,
      obs.tool_name,
      obs.tool_input,
      obs.tool_output,
      obs.context || null
    )
  }

  getRecentObservations(sessionId: string, limit: number = 10): Observation[] {
    const stmt = this.db.prepare(`
      SELECT * FROM observations
      WHERE session_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)

    return stmt.all(sessionId, limit) as Observation[]
  }

  close() {
    this.db.close()
  }
}
```

### 🧪 Testing
```bash
# Test smart resumption
claude
# Expected: "I see you were working on X 2 hours ago. Continue?"

# Test native resume
claude --resume
# [Select a session]
# Expected: "Resuming: X. Where we left off: ..."

# Test CLAUDE.md refresh
# [Make significant changes: add GraphQL, Prisma, 15 new files]
# Expected: "💡 I notice significant changes. Refresh CLAUDE.md?"

# Test observation tracking
# [Use various tools]
# Check: .claude/observations.db should have entries
```

### 📝 Deliverables
- [ ] Smart resumption prompt implemented
- [ ] Artifact auto-loading on resume
- [ ] CLAUDE.md auto-generation works
- [ ] CLAUDE.md refresh detection works
- [ ] Observation system tracks tool usage
- [ ] All features work together seamlessly

---

## Step 5: Polish & Testing

### 🎯 Goal
Production-ready plugin with error handling, performance optimization, and documentation.

### ✅ Success Criteria
- [ ] All features work reliably
- [ ] Error handling is graceful
- [ ] Performance is acceptable (<2s session start)
- [ ] Documentation is complete
- [ ] Tests cover critical paths

### 🔧 Components to Build

#### 5.1 Error Handling
```typescript
// src/utils/error-handler.ts
export class PluginError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message)
    this.name = 'PluginError'
  }
}

export function handleError(error: unknown): string {
  if (error instanceof PluginError) {
    console.error(`[${error.code}] ${error.message}`)
    return error.userMessage
  }

  console.error('Unexpected error:', error)
  return 'An unexpected error occurred. Please try again.'
}
```

#### 5.2 Performance Optimization
- Cache CLAUDE.md parsing
- Lazy-load skills (only when needed)
- Optimize database queries with indexes
- Limit observation history (retention policy)

#### 5.3 Documentation
```markdown
# README.md

## Installation
npm install
npm run build
claude-code plugin link .

## Usage
See docs/USAGE.md

## Development
See docs/DEVELOPMENT.md

## Architecture
See docs/ARCHITECTURE.md
```

#### 5.4 Testing
```typescript
// tests/session-start.test.ts
import { handleSessionStart } from '../src/hooks/session-start'

describe('SessionStart Hook', () => {
  it('suggests resumption when incomplete work exists', async () => {
    // Setup: Create incomplete session
    // Execute: handleSessionStart('new-id', 'startup', '/project')
    // Assert: Output contains resumption prompt
  })

  it('loads artifacts on resume', async () => {
    // Test artifact loading
  })
})
```

### 📝 Deliverables
- [ ] Comprehensive error handling
- [ ] Performance benchmarks met
- [ ] README and documentation complete
- [ ] Test suite with >70% coverage
- [ ] Release notes prepared

---

## 🎯 Success Metrics

### Week 2 (After Step 1)
- ✅ Plugin loads successfully
- ✅ Hooks trigger correctly

### Week 4 (After Step 2)
- ✅ 5+ patterns available
- ✅ Claude auto-suggests patterns
- ✅ Manual pattern search works

### Week 6 (After Step 3)
- ✅ Full workflow completed 5+ times
- ✅ Artifacts persist across sessions
- ✅ Commands are intuitive

### Week 8 (After Step 4)
- ✅ Smart resumption works consistently
- ✅ CLAUDE.md stays up to date
- ✅ Observations tracked

### Week 10 (After Step 5)
- ✅ No critical bugs
- ✅ Session start < 2s
- ✅ Documentation complete
- ✅ **v1.0 RELEASED** 🚀

---

## 📚 References

- **PROJECT_SCOPE.md** - Detailed problem analysis and architecture decisions
- **Claude Code Docs** - https://code.claude.com/docs
- **Plugin Skills Guide** - https://code.claude.com/docs/en/skills
- **Hooks Reference** - https://code.claude.com/docs/en/hooks

---

**Next Action:** Start Step 1 - Basic Plugin Foundation
