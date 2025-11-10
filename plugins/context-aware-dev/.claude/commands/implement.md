---
name: implement
description: Execute the implementation plan step-by-step with guided coding assistance
---

# Implementation Execution Session

You are executing a **technical implementation plan** to build a feature.

## Prerequisites

Before running this command:
1. ✅ A specification exists at `.claude/artifacts/{session_id}/spec.md`
2. ✅ A plan exists at `.claude/artifacts/{session_id}/plan.md`
3. ✅ Plan has been reviewed and approved

If missing spec or plan, suggest running `/elaborate` or `/plan` first.

## Your Role

Guide the user through implementing the plan by:

1. **Following the plan** - Execute tasks in the defined order
2. **Writing code** - Create and modify files as specified
3. **Testing as you go** - Verify each piece works before moving on
4. **Handling issues** - Debug and adapt when things don't go as planned
5. **Documenting progress** - Update artifacts with status and learnings

## Implementation Process

### Step 1: Load Context

First, load all planning artifacts:
- Use Read tool to load `.claude/artifacts/{session_id}/spec.md`
- Use Read tool to load `.claude/artifacts/{session_id}/plan.md`
- Use Read tool to load `.claude/artifacts/{session_id}/metadata.json`

Review the requirements, architecture, and task breakdown.

### Step 2: Create Task List

Use the TodoWrite tool to create a task list from the plan:
- Extract all tasks from the plan
- Mark them as "pending"
- This gives you and the user clear progress tracking

Example:
```javascript
TodoWrite([
  { content: "Set up database schema", status: "pending", activeForm: "Setting up database" },
  { content: "Create API routes", status: "pending", activeForm: "Creating API routes" },
  { content: "Implement authentication", status: "pending", activeForm: "Implementing auth" },
  // ... more tasks
])
```

### Step 3: Execute Tasks One by One

For each task:

1. **Mark task as in_progress** using TodoWrite
2. **Apply relevant patterns** - Use organizational skills when applicable:
   - If task involves Stripe → Reference stripe-payment skill
   - If task involves OAuth → Reference auth-oauth skill
   - If task involves E2E tests → Reference testing-e2e skill
   - If task involves migrations → Reference database-migration skill

3. **Write the code**:
   - Use Write tool for new files
   - Use Edit tool for modifying existing files
   - Follow the codebase conventions
   - Add comments explaining complex logic

4. **Test immediately**:
   - Run relevant tests
   - Verify the code works
   - Fix any issues before moving on

5. **Mark task complete** using TodoWrite

6. **Ask if user wants to continue** or pause after major milestones

### Step 4: Handle Deviations

If something doesn't work as planned:
- **Debug thoroughly** - Use error messages to guide fixes
- **Adapt the plan** - Sometimes reality differs from planning
- **Document changes** - Update plan.md with what actually worked
- **Communicate clearly** - Explain why adjustments are needed

### Step 5: Testing and Validation

After implementing core functionality:

1. **Run unit tests**
   ```bash
   npm test
   ```

2. **Run E2E tests** (if applicable)
   ```bash
   npm run test:e2e
   ```

3. **Manual testing** - Follow the testing checklist from plan.md

4. **Code review** - Ask user to review critical changes

### Step 6: Documentation

Update documentation:
- Add/update README sections if needed
- Document new API endpoints
- Update code comments
- Create migration guides if breaking changes

## Progress Tracking

### Update Metadata Regularly

Throughout implementation, update `.claude/artifacts/{session_id}/metadata.json`:

```json
{
  "session_id": "{session_id}",
  "created_at": "{timestamp}",
  "plan_created_at": "{timestamp}",
  "implementation_started_at": "{timestamp}",
  "last_updated_at": "{current_timestamp}",
  "status": "implementing",
  "has_spec": true,
  "has_plan": true,
  "has_implementation": true,
  "feature_name": "{name}",
  "estimated_hours": 14,
  "tasks_total": 10,
  "tasks_completed": 5,
  "tasks_in_progress": 1,
  "tasks_blocked": 0,
  "current_task": "Implementing authentication",
  "files_created": ["file1.ts", "file2.ts"],
  "files_modified": ["existing.ts"],
  "tests_passing": true,
  "blockers": []
}
```

### Create Implementation Log

Keep a log of what was done at `.claude/artifacts/{session_id}/implementation-log.md`:

```markdown
# Implementation Log

## [Date/Time] - Session Start
- Started implementing plan
- Current status: Phase 1 - Foundation

## [Date/Time] - Database Setup
- Created migration: 001_create_users.sql
- Ran migration successfully
- ✅ Task completed

## [Date/Time] - API Routes
- Created routes/api.ts
- Added middleware/auth.ts
- ⚠️ Issue: CORS configuration needed
- Fixed: Added cors middleware

## [Date/Time] - Authentication
- Applied auth-oauth pattern from organizational skills
- Implemented Passport.js setup
- ✅ Task completed
- Note: Using JWT tokens as planned

... continue logging progress ...
```

## Best Practices

### Code Quality
- Write clean, readable code
- Follow existing code style
- Add appropriate error handling
- Include logging for debugging

### Git Workflow
- Commit logical chunks of work
- Write descriptive commit messages
- Consider creating feature branch

### Communication
- Explain what you're doing and why
- Ask for clarification when needed
- Celebrate progress milestones
- Surface issues early

### Efficiency
- Use organizational skills to avoid reinventing patterns
- Leverage existing code and libraries
- Don't over-engineer
- Focus on getting working code first, optimize later

## When Implementation is Complete

1. **Run full test suite** - Ensure everything passes
2. **Update metadata** - Mark status as "completed"
3. **Create summary** - Highlight what was built
4. **Suggest next steps**:
   - Code review
   - Deploy to staging
   - Create pull request
   - Write documentation

## Example Workflow

```
User runs: /implement

You:
1. Load spec.md and plan.md
2. Create task list with TodoWrite
3. Start with Task 1:
   - Mark as in_progress
   - Write the code
   - Test it
   - Mark complete
4. Move to Task 2
5. ... continue until done
6. Run tests
7. Create implementation summary
```

## Instructions

1. **Be systematic** - Follow the plan, don't skip steps
2. **Test continuously** - Catch issues early
3. **Apply patterns** - Use organizational skills when relevant
4. **Communicate clearly** - Keep user informed of progress
5. **Be adaptive** - Plans may need adjustment based on reality
6. **Document everything** - Logs help with debugging and learning
7. **Use TodoWrite** - Visual progress tracking helps everyone

## Important Notes

- Implementation is iterative - it's okay to discover issues and adjust
- Don't rush - quality matters more than speed
- Ask questions when stuck - it's better than guessing
- The goal is working, tested, documented code

Ready to start implementing! Let's build this feature step by step.
