---
name: elaborate
description: Start a guided requirements gathering conversation to create a detailed specification document
---

# Requirements Elaboration Session

You are starting a **requirements elaboration session** to gather detailed specifications for a new feature or project.

## Your Role

Lead an interactive conversation to understand:

1. **What** the user wants to build
2. **Why** they need it (goals, problems to solve)
3. **Who** will use it (users, stakeholders)
4. **How** it should work (key workflows, edge cases)
5. **Constraints** (technical, timeline, resources)

## Conversation Flow

### Step 1: Understand the Core Need

Ask clarifying questions like:
- "What problem are you trying to solve?"
- "What's the desired outcome?"
- "Who is this for?"

### Step 2: Explore Use Cases

Dig deeper into:
- Primary use cases and user flows
- Edge cases and error scenarios
- Success criteria and metrics

### Step 3: Define Scope

Clarify what's in scope and out of scope:
- Must-have features (MVP)
- Nice-to-have features (future)
- Explicitly out of scope

### Step 4: Technical Context

Gather technical details:
- Existing tech stack and architecture
- Integration requirements
- Performance and scalability needs
- Security and compliance requirements

## Creating the Specification

After gathering requirements, create a comprehensive spec document at:

**`.claude/artifacts/{session_id}/spec.md`**

The spec should include:

```markdown
# Feature Specification: [Feature Name]

## Overview
Brief description of what we're building and why.

## Goals
- Primary goal
- Secondary goals
- Success metrics

## User Stories
As a [user type], I want to [action], so that [benefit].

## Functional Requirements
### Must Have (MVP)
1. Requirement 1
2. Requirement 2

### Should Have (Future)
1. Future enhancement 1
2. Future enhancement 2

### Out of Scope
- Explicitly not included

## Technical Requirements
- Tech stack: [languages, frameworks]
- Integrations: [APIs, services]
- Performance: [response times, throughput]
- Security: [authentication, data protection]

## User Flows
### Primary Flow
1. Step 1
2. Step 2
3. Expected outcome

### Edge Cases
- What happens if...
- Error handling for...

## Open Questions
- [ ] Question 1 that needs answering
- [ ] Question 2 that needs answering

## Next Steps
1. Review and approve this spec
2. Run `/plan` to create technical implementation plan
3. Run `/implement` to execute the plan
```

## Metadata Tracking

After creating the spec, also create a metadata file:

**`.claude/artifacts/{session_id}/metadata.json`**

```json
{
  "session_id": "{session_id}",
  "created_at": "{timestamp}",
  "status": "elaborated",
  "has_spec": true,
  "has_plan": false,
  "has_implementation": false,
  "feature_name": "{extracted from conversation}"
}
```

## Instructions

1. **Start the conversation** - Ask open-ended questions to understand the need
2. **Iterate deeply** - Don't accept surface-level answers, dig deeper
3. **Summarize periodically** - Repeat back what you've understood for confirmation
4. **Document everything** - Capture all details in the spec.md
5. **Identify gaps** - Note any open questions or decisions needed
6. **Set clear next steps** - Guide user toward `/plan` command

## Important Notes

- Be thorough but not overwhelming - this should feel like a conversation
- Use the TodoWrite tool to track progress through the elaboration process
- Save artifacts to `.claude/artifacts/{session_id}/` directory
- The spec is a living document - it can be updated as understanding improves

Ready to begin the requirements elaboration session!
