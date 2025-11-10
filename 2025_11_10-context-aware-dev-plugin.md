# Instruction: Context-Aware Development Plugin Implementation

## Feature

- **Summary**: Build a Claude Code plugin incrementally to solve scattered organizational knowledge, provide guided development workflows, and maintain persistent context across sessions through 5 substantial testable phases
- **Stack**: `TypeScript ^5.3.0`, `Node.js ^20.0.0`, `fs-extra ^11.2.0`, `better-sqlite3 ^9.0.0`

## Existing files

- @PROJECT.md

### New files to create

- package.json
- tsconfig.json
- src/index.ts
- src/hooks/session-start.ts
- src/hooks/post-tool-use.ts
- src/commands/command-handler.ts
- src/utils/claude-md-generator.ts
- src/utils/error-handler.ts
- src/observation/observer.ts
- hooks/hooks.json
- .claude/commands/elaborate.md
- .claude/commands/plan.md
- .claude/commands/implement.md
- .claude/skills/stripe-payment/SKILL.md
- .claude/skills/auth-oauth/SKILL.md
- .claude/skills/testing-e2e/SKILL.md
- .claude/skills/database-migration/SKILL.md
- .claude/skills/pattern-detector/SKILL.md
- tests/session-start.test.ts
- README.md
- docs/USAGE.md
- docs/DEVELOPMENT.md
- docs/ARCHITECTURE.md

## Implementation phases

### Phase 1: Plugin Foundation and GitHub Marketplace Setup

> Create proper GitHub-based marketplace with working plugin infrastructure

**Goal:** Real-world plugin distribution via GitHub marketplace with hooks using ${CLAUDE_PLUGIN_ROOT}

**Key Architecture Decisions:**
- GitHub repo structure: `plugins/context-aware-dev/` subdirectory
- marketplace.json at repo root in `.claude-plugin/`
- Hooks use `${CLAUDE_PLUGIN_ROOT}` environment variable for path resolution
- TypeScript compiled to `dist/` with executable hook scripts

**Steps:**

1. **Setup repository structure**
   - Create GitHub repo: `YOUR_USERNAME/claude-marketplace`
   - Directory layout:
     ```
     .claude-plugin/
       └── marketplace.json
     plugins/
       └── context-aware-dev/
           ├── .claude-plugin/
           │   └── plugin.json
           ├── hooks/
           │   └── hooks.json
           ├── src/
           │   └── hooks/
           ├── package.json
           ├── tsconfig.json
           └── README.md
     ```

2. **Create marketplace.json at repo root**
   ```json
   {
     "name": "your-marketplace-name",
     "version": "1.0.0",
     "description": "Claude Code plugin marketplace",
     "owner": {
       "name": "Your Name",
       "url": "https://github.com/YOUR_USERNAME"
     },
     "plugins": [
       {
         "name": "context-aware-dev",
         "source": "./plugins/context-aware-dev",
         "version": "0.1.0",
         "description": "Organizational knowledge sharing, guided workflows, and persistent context",
         "author": {
           "name": "Your Name",
           "email": "your@email.com"
         },
         "keywords": ["development", "workflow", "context", "hooks"]
       }
     ]
   }
   ```

3. **Create plugin.json manifest**
   - Location: `plugins/context-aware-dev/.claude-plugin/plugin.json`
   - Include: name, version, description, author, keywords

4. **Setup TypeScript build for hooks**
   - package.json with dependencies: typescript, fs-extra, @types/node, @types/fs-extra
   - tsconfig.json targeting ES2020, output to dist/
   - Build script: `"build": "tsc"`

5. **Implement hooks with ${CLAUDE_PLUGIN_ROOT}**
   - Create `hooks/hooks.json`:
     ```json
     {
       "hooks": {
         "SessionStart": [
           {
             "hooks": [
               {
                 "type": "command",
                 "command": "node ${CLAUDE_PLUGIN_ROOT}/dist/hooks/session-start.js '${CLAUDE_SESSION_ID}' '${CLAUDE_MATCHER}' '${CLAUDE_PROJECT_DIR}'",
                 "timeout": 60
               }
             ]
           }
         ],
         "PostToolUse": [
           {
             "hooks": [
               {
                 "type": "command",
                 "command": "node ${CLAUDE_PLUGIN_ROOT}/dist/hooks/post-tool-use.js '${CLAUDE_TOOL_NAME}' '${CLAUDE_TOOL_OUTPUT}'",
                 "timeout": 60
               }
             ]
           }
         ]
       }
     }
     ```

6. **Implement hook scripts**
   - `src/hooks/session-start.ts`: Log session, create `.claude/` directories
   - `src/hooks/post-tool-use.ts`: Log tool usage (basic for Phase 1)
   - Add shebang `#!/usr/bin/env node` to TypeScript sources
   - Ensure compiled .js files are executable

7. **Build and commit plugin**
   ```bash
   cd plugins/context-aware-dev
   npm install
   npm run build
   chmod +x dist/hooks/*.js
   cd ../..
   git add .
   git commit -m "Phase 1: Plugin foundation"
   git push origin main
   ```

8. **Test marketplace installation**
   ```bash
   # Add GitHub marketplace
   claude plugin marketplace add YOUR_USERNAME/claude-marketplace

   # Verify marketplace added
   claude plugin marketplace list

   # Install plugin
   claude plugin install context-aware-dev@your-marketplace-name

   # Test in any project
   cd /tmp/test-project
   claude
   # Expected: "Session <id> started", .claude/ dirs created, tool usage logged
   ```

**Success Criteria:**
- Plugin installs from GitHub marketplace
- SessionStart hook creates `.claude/` and `.claude/artifacts/` directories
- PostToolUse hook logs tool names to console
- Hooks work from any directory (no path errors)
- Plugin can be updated via git push + reinstall

**Deliverables:**
- GitHub repo with marketplace structure
- Working plugin with compiled hooks
- marketplace.json and plugin.json manifests
- README with installation instructions
- Verified end-to-end: marketplace add → plugin install → hooks execute

### Phase 2: Organizational Knowledge Hub (Skills System)

> Create discoverable pattern library using Claude Code Plugin Skills

1. Create .claude/skills directory structure with 5 pattern subdirectories
2. Write stripe-payment/SKILL.md with frontmatter (keywords, description) and implementation guide
3. Write auth-oauth/SKILL.md following same pattern structure
4. Write testing-e2e/SKILL.md for E2E testing patterns
5. Write database-migration/SKILL.md for database patterns
6. Write pattern-detector/SKILL.md with heuristics for identifying reusable patterns
7. Add example files (webhook-handler.ts, passport-setup.ts) to skill directories
8. Update package.json claudeCode.skills field to point to skills directory
9. Test: Mention payment/auth keywords to Claude, verify pattern suggestions appear

### Phase 3: Guided Workflow Commands

> Implement /elaborate, /plan, /implement commands with artifact generation

1. Create .claude/commands directory
2. Write elaborate.md with conversation flow instructions and spec.md generation logic
3. Write plan.md with technical planning instructions and plan.md generation logic
4. Write implement.md with step-by-step execution guidance
5. Implement src/commands/command-handler.ts to route commands to markdown files
6. Update hooks/hooks.json to register custom commands
7. Add metadata.json generation logic in commands for tracking (session_id, status, hasSpec, hasPlan)
8. Create .claude/artifacts/${session_id} directory structure in SessionStart hook
9. Test: Run /elaborate, create spec, run /plan, generate plan, run /implement, verify artifacts saved

### Phase 4: Persistent Context and Smart Resumption

> Context survives sessions with smart resumption and CLAUDE.md auto-refresh

1. Enhance src/hooks/session-start.ts with findRecentSessions and formatResumptionPrompt functions
2. Implement loadSessionMetadata and formatResumptionMessage for native resume
3. Create src/utils/claude-md-generator.ts with analyzeProject, detectTechStack, detectArchitecture functions
4. Enhance src/hooks/post-tool-use.ts with detectSignificantChange for dependency/structure changes
5. Implement shouldSuggestRefresh and generateRefreshSuggestion logic
6. Create src/observation/observer.ts with SQLite ObservationSystem class
7. Initialize observations.db schema with sessions and tool_usage tables
8. Integrate observation recording into PostToolUse hook
9. Test: Exit and restart, verify resumption prompt, make changes, verify CLAUDE.md refresh suggestion

### Phase 5: Production Polish (Error Handling, Docs, Testing)

> Production-ready with error handling, performance optimization, and documentation

1. Create src/utils/error-handler.ts with PluginError class and handleError function
2. Wrap all hook functions with try-catch using error handler
3. Add performance optimizations: cache CLAUDE.md parsing, lazy-load skills, add DB indexes
4. Implement observation retention policy to limit history growth
5. Write README.md with installation and usage instructions
6. Write docs/USAGE.md with command examples and workflows
7. Write docs/DEVELOPMENT.md with contribution guidelines
8. Write docs/ARCHITECTURE.md with system design overview
9. Create tests/session-start.test.ts with unit tests for resumption logic
10. Add test scripts to package.json and verify >70% coverage
11. Test: Break things intentionally, verify graceful errors, benchmark session start <2s

## Reviewed implementation

- [ ] Phase 1: Plugin Foundation and Infrastructure
- [ ] Phase 2: Organizational Knowledge Hub (Skills System)
- [ ] Phase 3: Guided Workflow Commands
- [ ] Phase 4: Persistent Context and Smart Resumption
- [ ] Phase 5: Production Polish (Error Handling, Docs, Testing)

## Validation flow

1. Install plugin: cd plugin-dir, npm install, npm run build, claude-code plugin link .
2. Test Phase 1: Open test project, run claude, verify activation message and .claude/ directory created
3. Test Phase 2: Say "I need payment processing", verify Stripe pattern suggested, run /search-pattern
4. Test Phase 3: Run /elaborate, answer questions, verify spec.md created, run /plan, verify plan.md, run /implement
5. Test Phase 4: Exit claude, restart, verify resumption prompt with incomplete work, use claude --resume, verify artifacts loaded
6. Test Phase 4b: Install new dependencies, create new directories, verify CLAUDE.md refresh suggestion
7. Test Phase 5: Trigger errors, verify graceful handling, check session start time <2s, review docs completeness
8. Final validation: Complete full workflow from /elaborate to /implement 3 times, verify consistency

## Estimations

- Confidence: 9/10
  - ✅ PROJECT.md provides complete architectural blueprint
  - ✅ Claude Code plugin APIs well-documented
  - ✅ Hook system straightforward (bash commands with env vars)
  - ✅ Skills system documented with clear frontmatter format
  - ✅ TypeScript/Node.js ecosystem mature and stable
  - ❌ Minor risk: Claude auto-suggestion behavior for skills may need tuning
  - ❌ Minor risk: Session resumption UX may need iteration based on testing
- Time to implement: 8-10 weeks (2 weeks per phase with 1 week buffer)
  - Phase 1: 2 weeks (basic infrastructure, learning Claude Code APIs)
  - Phase 2: 2 weeks (creating 5+ quality patterns)
  - Phase 3: 2 weeks (command system and artifact generation)
  - Phase 4: 2 weeks (resumption logic and CLAUDE.md automation)
  - Phase 5: 1 week (polish and testing)
  - Buffer: 1 week (unexpected issues)
