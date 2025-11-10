---
name: status
description: Check for unfinished work and incomplete features in your project
---

# Project Status Check

You are helping the user understand their current project status and unfinished work.

## Your Task

1. **Scan for incomplete work** in `.claude/artifacts/` directory
2. **Check for CLAUDE.md** in the project root
3. **Report findings** to the user

## Step 1: Check for Incomplete Features

Scan `.claude/artifacts/` for session directories with metadata.json files.

For each session, check the `status` field:
- `elaborated` = Has spec, needs plan
- `planned` = Has spec + plan, needs implementation
- `implementing` = In progress
- `implemented`, `completed`, `done` = Finished (skip these)

## Step 2: Check for CLAUDE.md

Check if `CLAUDE.md` exists in the project root:
- If missing and project has code files → Suggest running `/init`
- If exists → Note that project context is available

## Step 3: Report to User

### If Incomplete Work Found:

Show a clear summary:

```
📊 Project Status

🔨 Unfinished Work:

1. **[Feature Name]** (status: [elaborated/planned/implementing])
   - Spec: [✅/⏳]
   - Plan: [✅/⏳]
   - Implementation: [✅/⏳]
   - Last updated: [time ago]
   - Location: .claude/artifacts/[session-id]/
   - Next step: [/plan or /implement]

2. **[Another Feature]** ...

📝 CLAUDE.md: [Present ✅ / Missing ⏳]
   [If missing: "Run /init to create project context file"]

💡 What would you like to do?
   - Continue working on any of these features
   - Start something new with /elaborate
   - Update project context with /init
```

### If No Incomplete Work:

```
✨ All Clear!

No unfinished features detected. Your project is in good shape.

📝 CLAUDE.md: [Present ✅ / Missing ⏳]
   [If missing: "Consider running /init to create project context"]

💡 Ready to start something new? Run: /elaborate
```

## Important Notes

- Read metadata.json files from all session directories
- Sort by most recent (use `last_updated_at`, `plan_created_at`, or `created_at`)
- Skip sessions without metadata.json
- Use the TodoWrite tool if you need to track progress while scanning
- Provide actionable next steps for each incomplete feature
