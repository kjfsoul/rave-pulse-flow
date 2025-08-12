# Claude Code Optimization Instructions for Maximum Quality & Efficiency

## 1. Initial Setup & Context Engineering

### Project Initialization
```bash
# Always start with initialization
/init

# Then create comprehensive project context
```

Create and maintain these essential files:

### claude.md (System Prompt)
```markdown
# Project Memory & Rules

## Project Overview
- **Architecture**: [React SPA / FastAPI / Next.js / etc.]
- **Tech Stack**: [Supabase, Python, JavaScript, etc.]
- **Database**: [Supabase/PostgreSQL/etc.]
- **Deployment**: [Vercel/Netlify/etc.]

## Development Rules
- ALWAYS read planning.md and tasks.md at session start
- Mark completed tasks immediately in tasks.md
- Use TypeScript validation before any commits
- Follow existing code patterns and naming conventions
- Generate realistic test data when needed
- Never edit more code than necessary
- Be succinct and token-efficient

## Code Quality Standards
- Clean, modular, well-commented code
- Consistent styling (Prettier, ESLint)
- Proper error handling and validation
- Mobile-first responsive design
- WCAG accessibility compliance

## AI Integration Guidelines
- [Specific AI models and APIs used]
- [Authentication and API key management]
- [Rate limiting and error handling strategies]
```

### planning.md (Architecture & Vision)
```markdown
# Project Architecture & Vision

## Technical Architecture
- Frontend: [Framework and key libraries]
- Backend: [API structure and services]
- Database: [Schema and key relationships]
- Authentication: [Auth strategy]
- AI Integration: [Models and integration patterns]

## Key Features & Priorities
1. [Core feature 1 with acceptance criteria]
2. [Core feature 2 with acceptance criteria]
3. [Enhancement features]

## Technology Choices & Rationale
- [Why specific technologies were chosen]
- [Performance considerations]
- [Scalability plans]
```

### tasks.md (Living Roadmap)
```markdown
# Development Tasks

## In Progress
- [ ] Current task with clear acceptance criteria
- [ ] Another active task

## Planned (Next Sprint)
- [ ] Next priority task
- [ ] Follow-up enhancement

## Completed ✅
- [x] Previously completed task (Date: YYYY-MM-DD)
- [x] Another completed task (Date: YYYY-MM-DD)

## Blocked/Issues
- [ ] Task blocked by: [specific blocker]
```

## 2. Advanced Hooks Configuration

### Setup Comprehensive Hooks System
```bash
/hooks
```

Configure these essential hooks:

### Pre-Tool Use Hooks
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/validate-command.sh"
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/backup-and-validate.sh"
          }
        ]
      }
    ]
  }
}
```

### Post-Tool Use Hooks
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/auto-format-and-lint.sh"
          }
        ]
      },
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/log-activity.sh"
          }
        ]
      }
    ]
  }
}
```

### Notification & Stop Hooks
```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/send-notification.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/session-summary.sh"
          }
        ]
      }
    ]
  }
}
```

## 3. Essential Custom Commands

Create these commands in `.claude/commands/`:

### /ultrathink-plan.md
```markdown
# Ultra Think + Plan Mode

Before executing any complex task:

1. **ACTIVATE PLAN MODE** (Shift+Tab twice)
2. **USE ULTRATHINK** - Think through the problem deeply
3. **CREATE DETAILED PLAN** with:
   - Step-by-step breakdown
   - Dependencies and prerequisites
   - Potential edge cases
   - Testing strategy
   - Rollback plan if needed
4. **WAIT FOR APPROVAL** before execution
5. **EXECUTE SYSTEMATICALLY** following the approved plan

For complex problems, perform multiple rounds of critique and refinement (rev the engine).
```

### /feature-implement.md
```markdown
# Parallel Feature Implementation

IMMEDIATE EXECUTION: Launch 7-parallel-Task method:

1. **Component**: Create main component file
2. **Styles**: Create component styles/CSS  
3. **Tests**: Create test files
4. **Types**: Create type definitions
5. **Hooks**: Create custom hooks/utilities
6. **Integration**: Update routing, imports, exports
7. **Remaining**: Update package.json, docs, config files
8. **Review**: Coordinate integration, run tests, verify build

**Context Optimization**: Strip comments when reading code for analysis
**Critical**: Make MINIMAL changes, preserve existing patterns
**Critical**: Preserve naming conventions and file organization
```

### /code-review.md
```markdown
# Comprehensive Code Review

Review checklist:
- Code is simple and readable
- Functions and variables are well-named
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
- Performance considerations
- Time complexity analyzed
- WCAG accessibility compliance

Provide feedback organized by priority:
- **Critical issues** (must fix)
- **Warnings** (should fix)  
- **Suggestions** (consider improving)

Include specific examples of fixes.
```

### /sync-todos.md
```markdown
# Sync Internal ToDo List

Keep track of all to-do items across sessions:

1. Read current state from todos.md
2. Update with current internal to-do list
3. Mark completed items with timestamps
4. Add new discovered tasks
5. Prioritize by importance and dependencies
6. Save updated state to todos.md

Maintain persistent record of:
- Tasks in progress
- Pending tasks
- Completed tasks with dates
- Blocked tasks with reasons
```

### /security-audit.md
```markdown
# Security Audit & Compliance

Perform comprehensive security review:

1. **Authentication & Authorization**
   - Check for secure token handling
   - Validate session management
   - Review user permission systems

2. **Data Protection**
   - Identify exposed secrets/API keys
   - Validate input sanitization
   - Check for SQL injection vulnerabilities
   - Review XSS prevention

3. **Infrastructure Security**
   - Analyze HTTPS implementation
   - Review CORS policies
   - Check rate limiting

4. **Compliance**
   - WCAG accessibility audit
   - GDPR compliance for user data
   - Industry-specific requirements

Generate actionable security report with prioritized fixes.
```

## 4. Automated Workflow Optimizations

### Plan Mode + Ultrathink Strategy
```markdown
When encountering complex problems:

1. **ALWAYS** use ultrathink + Plan Mode combination
2. **REV THE ENGINE**: Perform multiple critique rounds
3. **SPLIT ROLE SUB-AGENTS**: Use multiple perspectives:
   - Security expert perspective
   - Performance optimization perspective  
   - User experience perspective
   - Code architecture perspective
   - Testing and QA perspective

4. **VALIDATE ASSUMPTIONS** before execution
5. **CREATE SAFETY NETS** with comprehensive tests
```

### Multi-Agent Orchestration
```markdown
For complex features requiring parallel work:

1. **CREATE GIT WORKTREES** for isolated development
2. **SPAWN SUB-AGENTS** for parallel tasks:
   - Research agents for documentation/APIs
   - Implementation agents for different features
   - Testing agents for validation
   - Integration agents for connecting components

3. **COORDINATE THROUGH SHARED FILES**:
   - Update coms.md with agent communications
   - Maintain shared task status in tasks.md
   - Log progress in session summaries

4. **MERGE SYSTEMATICALLY** with conflict resolution
```

### Context Management Rules
```markdown
CRITICAL CONTEXT RULES:

1. **NEVER USE /compact** - Instead:
   - Summarize work to markdown file
   - Clear context with /clear
   - Reference summary when continuing

2. **MAINTAIN SCOPE CONTEXT**:
   - Provide exact file paths
   - Reference specific functions/components
   - Include relevant code snippets

3. **OPTIMIZE TOKEN USAGE**:
   - Strip unnecessary comments when analyzing
   - Focus on specific areas of change
   - Use targeted edits rather than full rewrites
```

## 5. Quality Assurance Automation

### Automated Testing Strategy
```markdown
Testing Requirements:

1. **UNIT TESTS**: Generate for all business logic
2. **INTEGRATION TESTS**: API endpoints and data flows
3. **E2E TESTS**: Critical user journeys
4. **ACCESSIBILITY TESTS**: Screen reader compatibility
5. **PERFORMANCE TESTS**: Load and rendering metrics

Test Generation Rules:
- Cover happy paths, edge cases, and error conditions
- Include realistic test data generation
- Validate both positive and negative scenarios
- Test with various user roles and permissions
```

### Linting & Code Quality
```markdown
Automated Quality Checks:

1. **TYPESCRIPT VALIDATION**: Before any commit
2. **ESLINT RULES**: Code style and best practices
3. **PRETTIER FORMATTING**: Consistent code formatting
4. **SECURITY SCANNING**: Vulnerability detection
5. **PERFORMANCE ANALYSIS**: Bundle size and optimization

Integration with hooks ensures automatic execution.
```

## 6. AI Integration Best Practices

### Structured AI Outputs
```markdown
For AI-powered features:

1. **USE PYDANTIC AI** for validated outputs
2. **DEFINE CLEAR SCHEMAS** for AI responses
3. **IMPLEMENT FALLBACK STRATEGIES** for AI failures
4. **CACHE EXPENSIVE AI OPERATIONS**
5. **MONITOR AI USAGE AND COSTS**

Example schema enforcement:
- Message generation with length/tone constraints
- Image generation with specific dimensions/styles
- Data analysis with structured result formats
```

### Error Handling & Resilience
```markdown
AI Integration Resilience:

1. **GRACEFUL DEGRADATION**: Apps work without AI
2. **RETRY LOGIC**: Handle temporary AI service failures
3. **RATE LIMITING**: Respect AI service quotas
4. **COST MONITORING**: Track token usage and expenses
5. **USER FEEDBACK**: Allow manual override of AI decisions
```

## 7. Deployment & Monitoring

### Automated Deployment Pipeline
```markdown
Deployment Checklist:

1. **PRE-DEPLOYMENT VALIDATION**:
   - All tests passing
   - TypeScript compilation successful
   - Security scan clean
   - Performance benchmarks met

2. **DEPLOYMENT HOOKS**:
   - Database migrations
   - Environment variable validation
   - Service health checks
   - Rollback procedures ready

3. **POST-DEPLOYMENT MONITORING**:
   - Error rate monitoring
   - Performance metrics
   - User feedback collection
   - Cost tracking
```

## 8. Usage Instructions

### Daily Workflow
```bash
# Start each session
/init
# Review context
cat claude.md planning.md tasks.md

# For new features
/ultrathink-plan
/feature-implement

# For code review
/code-review

# For security
/security-audit

# Sync progress
/sync-todos
```

### Advanced Techniques
```bash
# Use Plan Mode for complex tasks
# Shift+Tab twice to activate

# Enable auto-accept for trusted operations
# Shift+Tab once for auto-accept mode

# Use speech-to-text for rapid input
# Integrate with tools like Super Whisper

# Monitor costs
ccusage daily
ccusage blocks --live
```

## 9. Troubleshooting & Optimization

### Performance Issues
```markdown
When Claude Code is slow or unresponsive:

1. **CHECK CONTEXT WINDOW**: Use /clear if near limit
2. **OPTIMIZE PROMPTS**: Be specific and concise
3. **USE PLAN MODE**: For complex multi-step operations
4. **SPLIT LARGE TASKS**: Break into atomic changes
5. **MONITOR HOOKS**: Ensure they're not slowing execution
```

### Quality Issues
```markdown
When output quality decreases:

1. **UPDATE CONTEXT**: Refresh claude.md with latest patterns
2. **PROVIDE EXAMPLES**: Show desired code style
3. **USE ULTRATHINK**: For complex reasoning tasks
4. **REV THE ENGINE**: Multiple critique rounds
5. **MANUAL REVIEW**: Always verify critical changes
```

This comprehensive setup will maximize Claude Code's efficiency and quality for your app development while providing robust automation, error prevention, and workflow optimization.