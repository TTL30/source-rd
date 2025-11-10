# Source-RD: Claude Code Plugin Marketplace

## Session Startup Protocol

**IMPORTANT:** At the start of EVERY fresh session (when user sends their first message), check for `.claude/sessions/startup-message.txt`:

1. If the file exists, immediately read its contents
2. Display the message to the user (it contains important info about unfinished work or setup suggestions)
3. Delete the file after displaying it
4. This enables automatic smart resumption despite plugin hook STDOUT limitations

## Project Overview

**Source-RD** is a Claude Code plugin marketplace that provides a curated collection of reusable development plugins for AI-assisted workflows. The primary plugin, **Context-Aware Development**, implements a multi-phase system for organizational knowledge sharing, guided workflows, and persistent context management across Claude Code sessions.

**Current Phase:** Phase 3 (Guided Workflow Commands) - In Progress

## Architecture Overview

### High-Level Structure

```
source-rd (Root Marketplace Repository)
├── .claude-plugin/marketplace.json      # Marketplace manifest
├── plugins/
│   └── context-aware-dev/               # Primary plugin
│       ├── .claude-plugin/plugin.json   # Plugin manifest (v0.3.0)
│       ├── hooks/                       # Lifecycle hooks
│       ├── skills/                      # Reusable knowledge patterns
│       ├── commands/                    # Slash commands for workflows
│       └── src/                         # TypeScript source code
├── .claude/                             # Session artifacts (local)
└── [Root documentation & CI configs]
```

### Plugin Architecture (Context-Aware Dev)

The plugin uses a **hook-based reactive architecture** with three subsystems:

1. **Hooks System** - Reactive lifecycle hooks that trigger on Claude Code events
   - `SessionStart` - Initializes session context and artifact directories
   - `PostToolUse` - Tracks tool usage and output for session awareness

2. **Skills System** (Phase 2) - Reusable knowledge patterns organized by domain
   - Located in `/plugins/context-aware-dev/skills/{skill-name}/`
   - Each skill is a markdown file (SKILL.md) with implementation patterns
   - Auto-discovered and suggested by Claude when relevant
   - Current skills: stripe-payment, auth-oauth, testing-e2e, database-migration, pattern-detector

3. **Commands System** (Phase 3) - Guided slash commands for structured workflows
   - Located in `/plugins/context-aware-dev/commands/{command-name}.md`
   - Provides interactive, step-by-step guidance
   - Current commands: /elaborate, /plan, /implement
   - Integration with artifact persistence system

## Technology Stack

### Languages & Runtimes
- **TypeScript 5.3** - Primary source language
- **Node.js 20.0.0+** - Runtime requirement
- **JavaScript (CommonJS)** - Compiled output format

### Build & Development Tools
- **TypeScript Compiler (tsc)** - Builds src/ → dist/
- **npm** - Package manager and task runner
- **Git** - Version control

### Key Dependencies
- `@types/node` - TypeScript types for Node.js APIs
- `typescript` - Compilation and type checking

### Deployment
- **GitHub** - Marketplace distribution (compiled dist/ directory in repo)
- **Claude Code CLI** - Plugin installation and management

## Build & Development Workflow

### Build Pipeline

```typescript
// Source: src/
TypeScript (.ts) 
    ↓
[TypeScript Compiler with CommonJS]
    ↓
// Output: dist/
Compiled JavaScript (.js) + Source Maps (.js.map) + Type Definitions (.d.ts)
    ↓
[Committed to Git]
    ↓
// Distribution: GitHub Marketplace
Users install via: claude plugin install context-aware-dev@source-rd
```

### Development Commands

```bash
npm run build      # Compile TypeScript → JavaScript
npm run watch      # Watch mode for development
npm run clean      # Remove dist/ directory
npm run rebuild    # Clean + build
npm run prepare    # Runs on npm install (runs build)
```

### Critical Build Notes
- **dist/ must be committed** to Git for GitHub marketplace installation
- The compiled JavaScript in dist/ is what Claude Code executes at runtime
- Hook entry points are in `dist/hooks/*.js` and referenced in `hooks/hooks.json`

## Session & Artifact System

### Directory Structure

When a Claude Code session starts, the plugin creates:

```
.claude/
├── sessions/
│   └── current-session.txt              # Contains active session ID
├── artifacts/
│   └── {session-id}/
│       ├── spec.md                      # Feature specification (Phase 3)
│       ├── plan.md                      # Technical plan (Phase 3)
│       └── metadata.json                # Artifact metadata
└── settings.local.json                  # Local configuration
```

### Session Lifecycle

1. **SessionStart Hook** (Phase 1)
   - Triggered on Claude Code startup, resume, clear, or compact
   - Creates .claude/ directory structure
   - Generates unique session ID
   - Stores current session ID for commands to access

2. **PostToolUse Hook** (Phase 1)
   - Triggers after each tool execution
   - Logs tool name and output length
   - Foundation for future context awareness

3. **Slash Commands** (Phase 3)
   - Read current session ID from `.claude/sessions/current-session.txt`
   - Create and persist artifacts to `.claude/artifacts/{session-id}/`
   - Commands: /elaborate, /plan, /implement

## Core Plugins & Features

### Phase 1: Plugin Foundation (COMPLETE)
- SessionStart hook - Session initialization and directory setup
- PostToolUse hook - Tool usage tracking
- Basic logging system
- GitHub marketplace distribution

### Phase 2: Organizational Knowledge Hub (COMPLETE)
- 5 plugin Skills for common development patterns
- Skill auto-discovery system
- Markdown-based skill definitions with implementation guidance
- Skills categories: Stripe payments, OAuth, Testing, Database migrations, Pattern detection

### Phase 3: Guided Workflow Commands (IN PROGRESS)
- `/elaborate` - Interactive requirements gathering with specification creation
- `/plan` - Technical planning from specifications
- `/implement` - Step-by-step guided implementation
- Session artifact persistence (spec.md, plan.md, metadata.json)
- Session ID bridge for commands to access current session

### Phase 4: Persistent Context & Smart Resumption (PLANNED)
- CLAUDE.md auto-generation and refresh detection
- Smart session resumption with context summary
- Cross-session artifact awareness
- Observation system for progress tracking

### Phase 5: Production Polish (PLANNED)
- Comprehensive error handling
- Performance optimization
- Full test coverage
- Complete documentation

## Plugin Manifest System

### Marketplace Manifest (`.claude-plugin/marketplace.json`)
Defines the marketplace repository structure and available plugins.

**Key fields:**
- `name` - Marketplace identifier (context-aware-marketplace)
- `version` - Marketplace version (1.0.0)
- `plugins` - Array of available plugins with metadata
- `owner` - Marketplace owner information

### Plugin Manifest (`.claude-plugin/plugin.json`)
Defines individual plugin configuration and capabilities.

**Key fields:**
- `name` - Plugin identifier (context-aware-dev)
- `version` - Plugin version (0.3.0)
- `skills` - Path to skills directory
- `commands` - Path to commands directory
- `description` - Plugin purpose and capabilities
- `keywords` - Discovery tags (development, workflow, patterns, skills, commands, stripe, oauth, testing, database)

### Hooks Configuration (`hooks/hooks.json`)
Maps lifecycle events to hook implementations.

**Structure:**
```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "node \"$CLAUDE_PLUGIN_ROOT/dist/hooks/session-start.js\"",
        "timeout": 60
      }]
    }],
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "node \"$CLAUDE_PLUGIN_ROOT/dist/hooks/post-tool-use.js\"",
        "timeout": 60
      }]
    }]
  }
}
```

## Development Patterns & Conventions

### Hook Implementation Pattern

Hooks are Node.js scripts that:
1. Read input from stdin as JSON
2. Parse environment variables provided by Claude Code
3. Perform actions (directory creation, tracking, etc.)
4. Exit with status 0 (success) or non-zero (failure)

**Environment variables available to hooks:**
- `${CLAUDE_PLUGIN_ROOT}` - Absolute path to plugin installation
- `${CLAUDE_SESSION_ID}` - Unique session identifier
- `${CLAUDE_MATCHER}` - Session start type (startup/resume/clear/compact)
- `${CLAUDE_PROJECT_DIR}` - Current project directory
- `${CLAUDE_TOOL_NAME}` - Name of tool that was used
- `${CLAUDE_TOOL_OUTPUT}` - Output from tool execution

### Skill Definition Pattern

Skills are Markdown files with YAML frontmatter:
```markdown
---
name: skill-name
description: What problem this solves and when to use it
---

# Implementation Pattern

## When to Use This Skill
Conditions and scenarios

## Implementation Steps
1. Step-by-step guidance
2. Code examples
3. Best practices
4. Common pitfalls
```

### Command Definition Pattern

Commands are Markdown files with YAML frontmatter that provide:
- Interactive conversation flow guidance
- Step-by-step instructions
- Artifact creation templates
- Integration with session system

## Git Workflow & Versioning

### Current Status
- **Branch:** main (primary development branch)
- **Version:** Plugin v0.3.0, Marketplace v1.0.0
- **Recent focus:** Phase 3 - Adding guided workflow commands

### Important Files to Know
- `.gitignore` - Carefully configured to:
  - Exclude node_modules
  - **INCLUDE dist/** (needed for GitHub marketplace)
  - Exclude IDE config and OS files
  
### Version Management
- Plugin version: `plugins/context-aware-dev/package.json` and `.claude-plugin/plugin.json`
- Marketplace version: `.claude-plugin/marketplace.json`
- Always update both when releasing changes

### Commit Convention
- Clear, descriptive messages focusing on what changed
- Examples: "feat: Add Phase 3", "fix: SessionStart hook", "chore: Update version"

## Key Files Reference

| File | Purpose |
|------|---------|
| `README.md` | Top-level marketplace documentation |
| `.claude-plugin/marketplace.json` | Marketplace registry and metadata |
| `plugins/context-aware-dev/README.md` | Plugin-specific documentation |
| `plugins/context-aware-dev/.claude-plugin/plugin.json` | Plugin manifest and capabilities |
| `plugins/context-aware-dev/hooks/hooks.json` | Hook lifecycle configuration |
| `plugins/context-aware-dev/package.json` | Dependencies and build scripts |
| `plugins/context-aware-dev/tsconfig.json` | TypeScript compilation config |
| `plugins/context-aware-dev/src/index.ts` | Plugin activation/deactivation |
| `plugins/context-aware-dev/src/hooks/*.ts` | Hook implementations |
| `plugins/context-aware-dev/skills/{*}/SKILL.md` | Reusable knowledge patterns |
| `plugins/context-aware-dev/commands/*.md` | Guided workflow commands |
| `PROJECT.md` | Implementation roadmap and planning document |

## Common Development Tasks

### Adding a New Skill
1. Create `plugins/context-aware-dev/skills/{skill-name}/SKILL.md`
2. Write YAML frontmatter (name, description)
3. Document implementation patterns, examples, and best practices
4. Reference any related code files
5. Commit and push

### Adding a New Command
1. Create `plugins/context-aware-dev/commands/{command-name}.md`
2. Define command purpose and flow in frontmatter
3. Create interactive guidance with step-by-step instructions
4. Integrate with artifact system using session ID
5. Commit and push

### Updating the Plugin
1. Make code changes in `src/`
2. Build: `npm run build` from plugin directory
3. Update version in both `package.json` and `.claude-plugin/plugin.json`
4. Commit dist/ directory along with source changes
5. Push to GitHub
6. Users update with: `claude plugin update context-aware-dev`

### Local Development
```bash
cd plugins/context-aware-dev
npm install
npm run build
chmod +x dist/hooks/*.js  # Ensure executability
claude plugin link .       # Link locally for testing
```

## Integration Points with Claude Code

### How Claude Discovers the Plugin
1. User adds marketplace: `claude plugin marketplace add {user}/source-rd`
2. Claude reads `.claude-plugin/marketplace.json` from GitHub
3. User installs: `claude plugin install context-aware-dev@source-rd`
4. Claude downloads plugin and registers hooks via `hooks/hooks.json`

### How Commands Work
1. User types `/command-name` in Claude Code
2. Claude loads markdown file from `commands/` directory
3. Markdown frontmatter provides command metadata
4. Markdown content provides interactive guidance to Claude
5. Commands can read session ID from `.claude/sessions/current-session.txt`
6. Commands save artifacts to `.claude/artifacts/{session-id}/`

### How Skills Work
1. Claude detects user is working on a problem
2. Claude searches skill descriptions for relevance keywords
3. Claude suggests applicable skills in the conversation
4. User can invoke skill with `/skill {skill-name}` or similar
5. Claude loads SKILL.md content and applies patterns

## Security & Best Practices

1. **No Secrets in Repo** - .env files are gitignored
2. **Executable Permissions** - Hook scripts need execute bit set
3. **Input Validation** - Hooks validate JSON input from stdin
4. **Error Handling** - Hooks exit with proper status codes
5. **Idempotency** - Hook operations are safe to run multiple times
6. **Logging** - All operations log to console for debugging

## Testing & Verification

### Manual Testing Flow
```bash
# 1. Build the plugin
cd plugins/context-aware-dev
npm run build

# 2. Link locally
claude plugin link .

# 3. Start a new project and test
cd /path/to/test/project
claude

# 4. Look for activation messages in console
# [Context-Aware Plugin] Session ... started (startup)
# [Context-Aware Plugin] ✓ Plugin ready

# 5. Test hooks manually
node dist/hooks/session-start.js < test-input.json
```

### Artifact Verification
After running commands, verify artifacts:
```bash
# Check session ID
cat .claude/sessions/current-session.txt

# Check artifacts created
ls -la .claude/artifacts/{session-id}/
```

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| Plugin doesn't activate | 1. Check `claude plugin list` 2. Verify dist/ exists 3. Rebuild with `npm run build` |
| Hooks not triggering | 1. Verify hooks.json syntax 2. Check hook files are executable 3. Review Claude Code logs |
| Session ID not available | 1. Verify SessionStart hook completed 2. Check `.claude/sessions/current-session.txt` exists 3. Inspect hook output |
| Commands not visible | 1. Check plugin.json has `"commands": "./commands"` 2. Verify command .md files exist 3. Rebuild and reinstall plugin |
| Skills not discovered | 1. Check plugin.json has `"skills": "./skills"` 2. Verify SKILL.md frontmatter format 3. Ensure description keywords match use case |

## Next Development Priorities

Based on PROJECT.md roadmap:

1. **Complete Phase 3** - Finish /implement command and metadata persistence
2. **Phase 4** - Smart session resumption and CLAUDE.md auto-generation
3. **Error Handling** - Robust error handling across all hooks and commands
4. **Documentation** - Complete API documentation for plugin developers
5. **Testing** - Add test suite for hooks and artifact system

## Resources

- **Installation Guide:** README.md and plugins/context-aware-dev/README.md
- **Implementation Details:** PROJECT.md (detailed roadmap and technical specs)
- **Skill Examples:** plugins/context-aware-dev/skills/*/SKILL.md
- **Command Examples:** plugins/context-aware-dev/commands/*.md
- **Git History:** Recent commits show evolution from Phase 1 → Phase 3

---

**Last Updated:** 2025-11-10
**Current Version:** Plugin v0.3.0, Marketplace v1.0.0
**Status:** Phase 3 In Progress
