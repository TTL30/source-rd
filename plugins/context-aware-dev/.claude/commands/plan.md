---
name: plan
description: Create a detailed technical implementation plan based on the specification document
---

# Technical Planning Session

You are creating a **technical implementation plan** for a feature that has been specified.

## Prerequisites

Before running this command:
1. ✅ A specification document should exist at `.claude/artifacts/{session_id}/spec.md`
2. ✅ Requirements should be clearly defined and approved

If no spec exists, suggest running `/elaborate` first.

## Your Role

Transform the specification into an actionable technical plan that includes:

1. **Architecture decisions** - How components will be structured
2. **Implementation steps** - Ordered tasks to complete the work
3. **File changes** - What files need to be created/modified
4. **Dependencies** - External libraries or services needed
5. **Testing strategy** - How to verify it works
6. **Risks and mitigations** - What could go wrong and how to handle it

## Planning Process

### Step 1: Read and Analyze the Spec

First, read the specification:
- Use the Read tool to load `.claude/artifacts/{session_id}/spec.md`
- Understand all requirements, constraints, and success criteria
- Identify any ambiguities that need clarification

### Step 2: Design the Architecture

Consider:
- **Where does this fit?** - Existing codebase structure
- **What patterns apply?** - Check if any organizational skills match (stripe-payment, auth-oauth, etc.)
- **How will components interact?** - Data flow, API boundaries
- **What about edge cases?** - Error handling, validation

### Step 3: Break Down Into Tasks

Create a task breakdown:
1. High-level milestones
2. Specific implementation tasks
3. Testing tasks
4. Documentation tasks

Order tasks by:
- **Dependencies** - What must be done first
- **Risk** - Do riskiest/most uncertain parts early
- **Value** - Deliver user-facing value incrementally

### Step 4: Identify Technical Decisions

Document key decisions:
- Which libraries or frameworks to use
- Database schema changes
- API design choices
- Performance optimization strategies

## Creating the Plan

Create a comprehensive plan document at:

**`.claude/artifacts/{session_id}/plan.md`**

The plan should include:

```markdown
# Implementation Plan: [Feature Name]

## Overview
Summary of what we're building (reference spec.md)

## Architecture

### System Design
```
[ASCII diagram or description of components and their interactions]
```

### Key Components
- **Component 1**: Purpose and responsibilities
- **Component 2**: Purpose and responsibilities

### Data Flow
1. User action triggers...
2. System processes...
3. Result is...

## Technical Decisions

### Decision 1: [e.g., Database Choice]
- **Options considered**: PostgreSQL vs MongoDB
- **Choice**: PostgreSQL
- **Rationale**: Relational data, ACID compliance needed

### Decision 2: [e.g., Authentication Method]
- **Options considered**: JWT vs Sessions
- **Choice**: JWT with refresh tokens
- **Rationale**: Stateless, works with mobile apps

## Implementation Steps

### Phase 1: Foundation
- [ ] Task 1: Set up database schema
  - Files: `migrations/001_create_users.sql`
  - Estimate: 1 hour

- [ ] Task 2: Create base API structure
  - Files: `routes/api.ts`, `middleware/auth.ts`
  - Estimate: 2 hours

### Phase 2: Core Features
- [ ] Task 3: Implement authentication
  - Apply pattern: auth-oauth skill
  - Files: `services/auth.ts`, `controllers/login.ts`
  - Estimate: 3 hours

- [ ] Task 4: Build main feature logic
  - Files: `services/feature.ts`
  - Estimate: 4 hours

### Phase 3: Testing & Polish
- [ ] Task 5: Write unit tests
  - Files: `tests/feature.test.ts`
  - Estimate: 2 hours

- [ ] Task 6: Add E2E tests
  - Apply pattern: testing-e2e skill
  - Files: `tests/e2e/feature.spec.ts`
  - Estimate: 2 hours

## Dependencies

### New Dependencies to Install
```bash
npm install package1 package2
```

### External Services
- Service 1: Purpose and integration method
- Service 2: Purpose and integration method

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Target: >80% code coverage

### Integration Tests
- Test API endpoints with real database
- Verify component interactions

### E2E Tests
- Test critical user flows end-to-end
- Use Playwright/Cypress for browser testing

### Manual Testing Checklist
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test edge case 1

## Risks and Mitigations

### Risk 1: [e.g., Performance Issues]
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: Add caching layer, implement pagination

### Risk 2: [e.g., External API Downtime]
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Implement retry logic with exponential backoff

## Rollout Strategy

1. **Development**: Build and test locally
2. **Staging**: Deploy to staging environment
3. **Beta**: Limited rollout to 10% of users
4. **Production**: Full rollout with monitoring

## Success Metrics

How we'll measure success:
- Metric 1: Target value
- Metric 2: Target value

## Estimated Timeline

- Phase 1: X hours/days
- Phase 2: X hours/days
- Phase 3: X hours/days
- **Total**: X hours/days

## Next Steps

1. Review and approve this plan
2. Run `/implement` to begin execution
3. Follow the task list step-by-step
```

## Update Metadata

Update the metadata file at `.claude/artifacts/{session_id}/metadata.json`:

```json
{
  "session_id": "{session_id}",
  "created_at": "{original_timestamp}",
  "plan_created_at": "{current_timestamp}",
  "status": "planned",
  "has_spec": true,
  "has_plan": true,
  "has_implementation": false,
  "feature_name": "{name}",
  "estimated_hours": 14
}
```

## Instructions

1. **Load the spec** - Read and thoroughly understand the requirements
2. **Apply organizational patterns** - Check if stripe-payment, auth-oauth, testing-e2e, or database-migration skills apply
3. **Think architecturally** - Design before coding
4. **Break down granularly** - Tasks should be 1-4 hours each
5. **Estimate realistically** - Account for testing and debugging time
6. **Identify risks early** - Better to surface concerns now
7. **Use the TodoWrite tool** - Track planning progress

## Important Notes

- Plans should be detailed enough that someone else could implement from them
- Reference existing codebase patterns and conventions
- Consider non-functional requirements (performance, security, maintainability)
- The plan is a living document - it can be adjusted during implementation

Ready to create the technical implementation plan!
