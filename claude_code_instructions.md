# Complete Claude Code Advanced Techniques & Instructions

## IMPLEMENTATION STRATEGY

### How to Use These Instructions:

1. **Initial Setup**: Copy the core configuration files below into your project
2. **Feed to Claude Code**: Paste sections as needed during development sessions
3. **Customize**: Adapt the templates for your specific project needs
4. **Iterate**: Update based on what works best for your workflow

**Important**: Don't dump everything at once. Start with the core setup, then gradually introduce advanced techniques as needed.

---

## 1. FOUNDATIONAL SETUP & CONTEXT ENGINEERING

### claude.md (Master System Prompt)
```markdown
# Claude Code Master Instructions for [PROJECT_NAME]

## Project Context
- **Type**: [Mystic Arcana: Astrology Platform / BirthdayGen: Celebration Automation / EDM Shuffle: Digital Festival]
- **Tech Stack**: React/Next.js + Supabase/FastAPI + [AI Models]
- **Architecture**: [SPA/SSR] with [Backend API] and [Database]
- **Deployment**: [Platform] with [CI/CD setup]

## CRITICAL WORKFLOW REQUIREMENTS

### MANDATORY PLANNING STEP
Before executing ANY tool (Read, Write, Edit, Bash, etc.), you MUST:
1. FIRST: Use Plan Mode (Shift+Tab twice) to present your plan
2. WAIT: For explicit user approval before proceeding  
3. ONLY THEN: Execute the planned actions

ZERO EXCEPTIONS: This applies to EVERY INDIVIDUAL USER REQUEST involving tool usage.

### ALWAYS READ FIRST
- IMMEDIATELY read planning.md and tasks.md at session start
- Check tasks.md before starting work
- Mark completed tasks immediately with timestamps
- Add new discovered tasks to tasks.md

### CODE QUALITY IMPERATIVES
- MINIMAL CHANGES: Edit only what's necessary
- PRESERVE PATTERNS: Follow existing code style and architecture
- TOKEN EFFICIENCY: Be succinct, strip comments when analyzing
- SAFETY FIRST: Create tests before major refactors
- REAL-TIME VALIDATION: Run TypeScript/lint checks before commits

### ADVANCED THINKING PROTOCOLS
- Use "ultrathink" or "think harder" for complex problems
- Rev the engine: Multiple rounds of critique and refinement
- Split role sub-agents for multi-perspective analysis
- Plan → Critique → Refine → Execute workflow

## PROJECT-SPECIFIC RULES
[Customize based on your app]

### For Mystic Arcana:
- Prioritize calculation accuracy for astrological data
- Validate against reference sources (Astro.com, historical events)
- Handle edge cases: leap years, rare locations, timezone complexities
- Cache expensive ephemeris calculations
- Generate realistic astrological interpretations

### For BirthdayGen:
- Ensure DALL-E 3 integration handles fallbacks gracefully
- Validate all Supabase CRUD operations
- Test automation engine thoroughly before deployment
- Generate joyful, magical, intuitive user experiences
- Handle affiliate link integration properly

### For EDM Shuffle:
- Real, working code over documentation
- Every feature must be visible and testable
- Error-proof coding with TypeScript validation
- Interactive crowd effects must be performant
- Marketplace data must be consistent and accurate

## SECURITY & COMPLIANCE
- Never expose API keys or secrets
- Implement proper input validation
- WCAG accessibility compliance required
- Rate limiting for AI services
- User data protection (GDPR compliance)

## AI INTEGRATION STANDARDS
- Use Pydantic AI for structured LLM outputs
- Implement graceful degradation when AI fails
- Cache expensive AI operations
- Monitor token usage and costs
- Provide manual overrides for AI decisions
```

### planning.md Template
```markdown
# [PROJECT_NAME] Architecture & Vision

## Core Value Proposition
[What problem does this solve and for whom?]

## Technical Architecture

### Frontend
- Framework: [React/Next.js/Vue]
- Key Libraries: [UI framework, state management, etc.]
- Build System: [Vite/Webpack/etc.]
- Styling: [Tailwind/Styled Components/etc.]

### Backend
- API: [FastAPI/Express/Supabase Edge Functions]
- Database: [Supabase/PostgreSQL/MongoDB]
- Authentication: [Supabase Auth/Auth0/etc.]
- File Storage: [Supabase Storage/S3/etc.]

### AI Integration
- Models: [GPT-4/Claude/Gemini for specific tasks]
- Vector DB: [For embeddings/search if needed]
- Image Generation: [DALL-E 3/Midjourney/etc.]
- Caching Strategy: [Redis/In-memory/Database]

### Infrastructure
- Hosting: [Vercel/Netlify/Railway]
- CDN: [Cloudflare/AWS CloudFront]
- Monitoring: [Sentry/DataDog/etc.]
- Analytics: [PostHog/Google Analytics]

## Feature Priority Matrix

### P0 (MVP Core)
1. [Essential feature 1] - [Acceptance criteria]
2. [Essential feature 2] - [Acceptance criteria]
3. [Essential feature 3] - [Acceptance criteria]

### P1 (Post-Launch)
1. [Enhancement 1] - [Acceptance criteria]
2. [Enhancement 2] - [Acceptance criteria]

### P2 (Future)
1. [Nice-to-have 1]
2. [Nice-to-have 2]

## Data Models & Relationships
[Key database schemas and relationships]

## Performance Requirements
- Page load: < 2s
- API response: < 500ms
- Mobile-first responsive design
- 99.9% uptime target

## Security Requirements
- Input sanitization
- Rate limiting
- Secure token handling
- Data encryption at rest
```

---

## 2. ADVANCED HOOKS SYSTEM

### Complete Hooks Configuration
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/validate-bash-command.py"
          }
        ]
      },
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/backup-files.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/auto-format.sh"
          }
        ]
      },
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/activity-logger.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/prompt-enhancer.py"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/session-summary.py"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/send-notification.sh"
          }
        ]
      }
    ]
  }
}
```

### Advanced Hook Scripts

#### validate-bash-command.py
```python
#!/usr/bin/env python3
import json
import re
import sys

# Dangerous command patterns
DANGEROUS_PATTERNS = [
    r'\brm\s+-rf\s+/',
    r'\bsudo\s+rm',
    r'\bdd\s+if=',
    r'\bmkfs\.',
    r'\bformat\b',
    r'\>\s*/dev/sd[a-z]',
]

# Required tools validation
REQUIRED_TOOLS = {
    'grep': 'Use ripgrep (rg) for better performance',
    'find': 'Use fd or rg --files for better performance'
}

def validate_command(command):
    issues = []
    
    # Check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            issues.append(f"DANGEROUS: Command matches pattern {pattern}")
    
    # Check for deprecated tools
    for tool, suggestion in REQUIRED_TOOLS.items():
        if re.search(f'\\b{tool}\\b', command):
            issues.append(f"SUGGESTION: {suggestion}")
    
    return issues

try:
    input_data = json.load(sys.stdin)
    command = input_data.get("tool_input", {}).get("command", "")
    
    if not command:
        sys.exit(0)
    
    issues = validate_command(command)
    
    if issues:
        for issue in issues:
            print(f"⚠️  {issue}", file=sys.stderr)
        # Exit code 2 blocks execution and shows stderr to Claude
        sys.exit(2)
    
    print("✅ Command validation passed")
    sys.exit(0)
    
except Exception as e:
    print(f"Hook error: {e}", file=sys.stderr)
    sys.exit(1)
```

#### auto-format.sh
```bash
#!/bin/bash

# Auto-format code after edits
json_input=$(cat)
file_path=$(echo "$json_input" | jq -r '.tool_input.file_path // empty')

if [[ -z "$file_path" ]]; then
    exit 0
fi

# Format based on file type
case "$file_path" in
    *.py)
        black "$file_path" 2>/dev/null
        isort "$file_path" 2>/dev/null
        echo "🐍 Python file formatted"
        ;;
    *.js|*.jsx|*.ts|*.tsx)
        npx prettier --write "$file_path" 2>/dev/null
        npx eslint --fix "$file_path" 2>/dev/null
        echo "🚀 JavaScript/TypeScript file formatted"
        ;;
    *.json)
        npx prettier --write "$file_path" 2>/dev/null
        echo "📄 JSON file formatted"
        ;;
    *.css|*.scss)
        npx prettier --write "$file_path" 2>/dev/null
        echo "🎨 CSS file formatted"
        ;;
esac

# Run TypeScript check if applicable
if [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
    if npx tsc --noEmit 2>/dev/null; then
        echo "✅ TypeScript validation passed"
    else
        echo "❌ TypeScript validation failed" >&2
        exit 2
    fi
fi
```

#### session-summary.py
```python
#!/usr/bin/env python3
import json
import sys
from datetime import datetime
import os

def create_session_summary(input_data):
    session_id = input_data.get("session_id", "unknown")
    timestamp = datetime.now().isoformat()
    
    summary = f"""
# Session Summary - {timestamp}

## Session ID: {session_id}

## Work Completed:
[This would be populated by analyzing the transcript]

## Files Modified:
[List of files that were changed]

## Next Steps:
[Suggested next actions]

## Notes:
[Any important observations or decisions made]
"""
    
    # Save to project log
    log_file = f"{os.environ.get('CLAUDE_PROJECT_DIR', '.')}/.claude/session-logs/{session_id}.md"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    with open(log_file, 'w') as f:
        f.write(summary)
    
    print(f"📝 Session summary saved to {log_file}")

try:
    input_data = json.load(sys.stdin)
    create_session_summary(input_data)
except Exception as e:
    print(f"Summary error: {e}", file=sys.stderr)
    sys.exit(1)
```

---

## 3. POWER CUSTOM COMMANDS

### /ultrathink-plan.md
```markdown
# Ultra Think + Plan Mode + Rev the Engine

You are about to engage in the most sophisticated problem-solving approach:

## PHASE 1: ULTRA THINK
Think through this problem with maximum depth:
- What are all the possible approaches?
- What are the potential edge cases and failure modes?
- What dependencies and prerequisites exist?
- What are the performance and security implications?
- How does this fit into the broader architecture?

## PHASE 2: PLAN MODE ACTIVATION
Press Shift+Tab twice to enter Plan Mode, then create a comprehensive plan:

1. **Problem Analysis**
   - Root cause identification
   - Scope and boundaries
   - Success criteria

2. **Solution Design**
   - Step-by-step approach
   - Alternative approaches considered
   - Risk mitigation strategies

3. **Implementation Plan**
   - Specific files to modify
   - Testing strategy
   - Rollback procedures

4. **Validation Plan**
   - How to verify success
   - Performance benchmarks
   - Security checks

## PHASE 3: REV THE ENGINE
Before execution, critique your plan:

**Round 1 - Security Review**: Analyze from security expert perspective
**Round 2 - Performance Review**: Analyze from optimization perspective
**Round 3 - User Experience Review**: Analyze from UX perspective
**Round 4 - Architecture Review**: Analyze from system design perspective

## PHASE 4: EXECUTE
Only after approval, execute the refined plan systematically.

Remember: "Rev the engine" means multiple critique rounds create plans so robust they can save you from needing more expensive models.
```

### /multi-agent-research.md
```markdown
# Multi-Agent Research & Analysis

Launch parallel sub-agents for comprehensive research:

## RESEARCH ORCHESTRATION
Create sub-agents with different specializations:

**Agent 1 - Market Research**: Research competitive landscape, pricing models, user sentiment
**Agent 2 - Technical Research**: Investigate APIs, libraries, integration patterns, performance benchmarks  
**Agent 3 - User Research**: Analyze user feedback, reviews, pain points, feature requests
**Agent 4 - Security Research**: Investigate vulnerabilities, compliance requirements, best practices
**Agent 5 - Content Research**: Gather examples, templates, industry standards, style guides

## COORDINATION PROTOCOL
1. Each agent documents findings in separate markdown files
2. Agents cross-reference each other's work for validation
3. Final consolidation agent synthesizes all findings
4. Present unified research report with actionable insights

## OUTPUT FORMAT
- Executive Summary (key findings)
- Detailed Analysis by Category
- Competitive Intelligence Dashboard
- Technical Recommendations
- Implementation Roadmap
- Risk Assessment

Use this for: Feature research, competitive analysis, technology evaluation, market validation
```

### /feature-factory.md
```markdown
# Advanced Feature Implementation Factory

IMMEDIATE PARALLEL EXECUTION: 9-Agent System

## AGENT ASSIGNMENTS
**Agent 1 - Core Logic**: Implement main business logic and algorithms
**Agent 2 - API Endpoints**: Create/update backend API routes and validation
**Agent 3 - Frontend Components**: Build React components and UI elements
**Agent 4 - Database Layer**: Handle schema updates, migrations, queries
**Agent 5 - Integration Layer**: Connect frontend to backend, handle state management
**Agent 6 - Testing Suite**: Unit tests, integration tests, E2E scenarios
**Agent 7 - Documentation**: Update docs, add comments, create usage examples
**Agent 8 - Security & Validation**: Input sanitization, error handling, rate limiting
**Agent 9 - Performance Optimization**: Caching, lazy loading, bundle optimization

## COORDINATION RULES
- Each agent works on isolated branches/worktrees
- Agents document progress in shared `coms.md` file
- Dependencies clearly marked and communicated
- Integration happens in specific order: Database → API → Frontend → Tests
- Performance and security reviews happen continuously

## QUALITY GATES
- TypeScript compilation must pass before any merges
- All tests must pass before integration
- Security review required for any data handling
- Performance benchmarks must meet requirements
- Accessibility audit for any UI changes

This approach can reduce feature development from weeks to hours.
```

### /debug-detective.md
```markdown
# Advanced Debugging & Problem Resolution

SYSTEMATIC DEBUGGING PROTOCOL:

## PHASE 1: RECONNAISSANCE
- Gather all error logs, stack traces, and reproduction steps
- Identify patterns: When does it occur? What triggers it?
- Check recent changes: Git log analysis for correlation
- Environment factors: Browser, device, network conditions

## PHASE 2: HYPOTHESIS FORMATION
Generate multiple theories:
1. **Data Theory**: Bad input data or state corruption
2. **Logic Theory**: Algorithmic or business logic errors  
3. **Integration Theory**: API failures or network issues
4. **Environment Theory**: Configuration or deployment issues
5. **Race Condition Theory**: Timing or concurrency problems

## PHASE 3: SYSTEMATIC TESTING
For each hypothesis:
- Create minimal reproduction case
- Add targeted logging/debugging
- Test edge cases and boundary conditions
- Verify fixes don't break other functionality

## PHASE 4: ROOT CAUSE ANALYSIS
- Document the underlying cause
- Identify why it wasn't caught earlier
- Implement preventive measures
- Update tests to catch similar issues

## TOOLS & TECHNIQUES
- Browser DevTools for frontend issues
- Network tab for API problems  
- Performance profiler for slowness
- React DevTools for state issues
- Server logs for backend problems
- Database query analysis for data issues

Always document findings for future reference.
```

### /performance-optimizer.md
```markdown
# Performance Optimization & Monitoring

COMPREHENSIVE PERFORMANCE AUDIT:

## FRONTEND OPTIMIZATION
**Bundle Analysis**:
- Use webpack-bundle-analyzer or similar
- Identify large dependencies
- Implement code splitting and lazy loading
- Tree shake unused code

**Runtime Performance**:
- React.memo() for expensive components
- useMemo() and useCallback() for expensive computations
- Virtual scrolling for large lists
- Image optimization (WebP, lazy loading, responsive images)

**Loading Performance**:
- Critical CSS inlining
- Preload important resources
- Service worker for caching
- Progressive loading strategies

## BACKEND OPTIMIZATION
**Database Performance**:
- Query optimization and indexing
- Connection pooling
- Caching strategies (Redis, in-memory)
- Pagination for large datasets

**API Performance**:
- Response compression (gzip)
- API response caching
- Rate limiting implementation
- Background job processing

## MONITORING & ALERTS
- Core Web Vitals tracking
- Error rate monitoring
- Performance regression detection
- Cost monitoring for cloud services

## AI-SPECIFIC OPTIMIZATIONS
- Token usage optimization
- Response caching for expensive AI calls
- Batch processing where possible
- Fallback strategies for AI failures

Generate performance report with specific recommendations and implementation priorities.
```

---

## 4. MULTI-AGENT ORCHESTRATION TECHNIQUES

### Git Worktree Management
```bash
# Automated worktree creation script
cat > .claude/scripts/create-worktree.sh << 'EOF'
#!/bin/bash

FEATURE_NAME=$1
WORKTREE_DIR="../worktrees"

if [ -z "$FEATURE_NAME" ]; then
    echo "Usage: $0 <feature-name>"
    exit 1
fi

# Create worktree directory
mkdir -p "$WORKTREE_DIR"

# Create new branch and worktree
git worktree add "$WORKTREE_DIR/$FEATURE_NAME" -b "feature/$FEATURE_NAME"

# Copy essential config files
cp .env "$WORKTREE_DIR/$FEATURE_NAME/" 2>/dev/null || true
cp -r .claude "$WORKTREE_DIR/$FEATURE_NAME/" 2>/dev/null || true
cp -r .cursor "$WORKTREE_DIR/$FEATURE_NAME/" 2>/dev/null || true

echo "✅ Worktree created at $WORKTREE_DIR/$FEATURE_NAME"
echo "📂 Opening new terminal..."

# Open new terminal in worktree directory
if command -v warp &> /dev/null; then
    warp-cli open "$WORKTREE_DIR/$FEATURE_NAME"
elif command -v code &> /dev/null; then
    code "$WORKTREE_DIR/$FEATURE_NAME"
fi
EOF

chmod +x .claude/scripts/create-worktree.sh
```

### Multi-Agent Communication Protocol
```markdown
# Create coms.md for agent coordination

## Active Agents
- **Agent A**: [Claude-Main] - Architecture and complex logic
- **Agent B**: [Gemini-Fast] - API endpoints and data processing  
- **Agent C**: [GPT-UI] - Frontend components and styling
- **Agent D**: [Claude-Test] - Testing and quality assurance

## Current Tasks
### Agent A Status: 
- Working on: [Current task]
- Blocked by: [Dependencies]
- Next: [Planned next action]
- ETA: [Estimated completion]

### Agent B Status:
- Working on: [Current task]  
- Blocked by: [Dependencies]
- Next: [Planned next action]
- ETA: [Estimated completion]

## Shared Resources
- **Database Schema**: [Location of latest schema]
- **API Contracts**: [OpenAPI spec location]
- **Design System**: [Figma/Storybook location]
- **Test Data**: [Shared test fixtures]

## Integration Points
- [ ] API endpoints ready for frontend integration
- [ ] Database migrations applied
- [ ] Authentication flow tested
- [ ] Error handling implemented

## Blockers & Dependencies
1. [Blocker 1] - Assigned to: [Agent] - Due: [Date]
2. [Dependency 1] - Waiting on: [Agent] - Status: [Status]

## Merge Schedule
1. Database layer (Agent D) - [Date]
2. API layer (Agent B) - [Date]  
3. Frontend components (Agent C) - [Date]
4. Integration testing (Agent A) - [Date]
```

---

## 5. ADVANCED TESTING & QUALITY ASSURANCE

### Comprehensive Testing Strategy
```markdown
# Testing Requirements & Automation

## TEST PYRAMID IMPLEMENTATION

### Unit Tests (70%)
**For Every Feature**:
- Pure functions and business logic
- Component rendering and props
- Error handling and edge cases
- Mocking external dependencies

**Tools**: Jest, React Testing Library, Vitest

### Integration Tests (20%)  
**API Layer**:
- Endpoint functionality
- Database interactions
- Authentication flows
- Error responses

**Frontend Integration**:
- User workflows
- Form submissions  
- Data fetching and caching
- Route navigation

**Tools**: Supertest, Cypress Component Testing

### E2E Tests (10%)
**Critical User Journeys**:
- User registration and login
- Core feature workflows
- Payment processing (if applicable)
- Mobile responsive behavior

**Tools**: Playwright, Cypress

## AI-SPECIFIC TESTING

### LLM Output Validation
```python
# Example Pydantic AI schema for testing
from pydantic import BaseModel, Field
from typing import List, Optional

class HoroscopeOutput(BaseModel):
    prediction: str = Field(min_length=50, max_length=500)
    mood_score: int = Field(ge=1, le=10)
    lucky_numbers: List[int] = Field(max_items=6)
    advice: str = Field(min_length=20, max_length=200)
    confidence: float = Field(ge=0.0, le=1.0)

# Test AI outputs against schema
def test_horoscope_generation():
    result = generate_horoscope(birth_data)
    validated = HoroscopeOutput.parse_obj(result)
    assert validated.confidence > 0.7
```

### Performance Benchmarks
```javascript
// Performance testing for AI features
describe('AI Performance', () => {
  test('horoscope generation under 5 seconds', async () => {
    const start = Date.now();
    const result = await generateHoroscope(testData);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000);
    expect(result).toMatchSchema(horoscopeSchema);
  });
  
  test('handles concurrent requests', async () => {
    const requests = Array(10).fill().map(() => 
      generateHoroscope(testData)
    );
    
    const results = await Promise.all(requests);
    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toBeTruthy();
    });
  });
});
```

## ACCESSIBILITY TESTING
```javascript
// Automated accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
```

---

## 6. AI INTEGRATION & OPTIMIZATION TECHNIQUES

### Structured AI Output Management
```python
# Advanced Pydantic AI patterns
from pydantic_ai import Agent
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class CardDesignRequest(BaseModel):
    occasion: Literal["birthday", "anniversary", "holiday"]
    style: Literal["minimal", "elaborate", "playful", "elegant"]
    color_scheme: List[str] = Field(max_items=3)
    message_tone: Literal["formal", "casual", "humorous", "heartfelt"]
    recipient_age_group: Literal["child", "teen", "adult", "senior"]

class CardDesignOutput(BaseModel):
    design_prompt: str = Field(min_length=50, max_length=300)
    suggested_messages: List[str] = Field(min_items=3, max_items=5)
    color_palette: List[str] = Field(min_items=2, max_items=4)
    design_elements: List[str]
    estimated_appeal_score: float = Field(ge=0.0, le=1.0)

card_designer = Agent(
    'openai:gpt-4',
    result_type=CardDesignOutput,
    system_prompt="""
    You are an expert greeting card designer with 20 years of experience.
    Create card designs that are emotionally resonant and visually appealing.
    Consider cultural sensitivity and accessibility in your designs.
    Provide specific, actionable design guidance.
    """
)

# Usage with error handling and caching
async def generate_card_design(request: CardDesignRequest) -> CardDesignOutput:
    try:
        # Check cache first
        cache_key = f"card_{hash(request.json())}"
        if cached := await redis.get(cache_key):
            return CardDesignOutput.parse_raw(cached)
        
        # Generate new design
        result = await card_designer.run(request.json())
        
        # Cache for future use
        await redis.setex(cache_key, 3600, result.json())
        
        return result
    except Exception as e:
        logger.error(f"Card design generation failed: {e}")
        # Return fallback design
        return get_fallback_design(request.occasion)
```

### AI Cost Optimization
```python
# Token usage monitoring and optimization
import asyncio
from functools import wraps
import tiktoken

def monitor_tokens(model_name="gpt-4"):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            encoding = tiktoken.encoding_for_model(model_name)
            
            # Count input tokens
            input_text = str(args) + str(kwargs)
            input_tokens = len(encoding.encode(input_text))
            
            start_time = time.time()
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            
            # Count output tokens
            output_tokens = len(encoding.encode(str(result)))
            total_tokens = input_tokens + output_tokens
            
            # Log usage
            logger.info({
                "function": func.__name__,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "duration": duration,
                "cost_estimate": calculate_cost(total_tokens, model_name)
            })
            
            return result
        return wrapper
    return decorator

@monitor_tokens()
async def generate_personalized_content(user_data, content_type):
    # Your AI generation logic here
    pass
```

### Multi-Model Orchestration
```python
# Route different tasks to optimal models
class AIOrchestrator:
    def __init__(self):
        self.models = {
            "creative": "claude-3-opus-20240229",
            "analytical": "gpt-4-turbo-preview", 
            "fast": "claude-3-haiku-20240307",
            "visual": "gpt-4-vision-preview",
            "code": "claude-3-sonnet-20240229"
        }
    
    async def route_task(self, task_type: str, prompt: str, **kwargs):
        model = self.models.get(task_type, "claude-3-sonnet-20240229")
        
        # Add task-specific optimizations
        if task_type == "creative":
            prompt = f"Think creatively and originally. {prompt}"
        elif task_type == "analytical":
            prompt = f"Provide detailed analysis with data. {prompt}"
        elif task_type == "fast":
            prompt = f"Be concise and efficient. {prompt}"
        
        return await self.call_model(model, prompt, **kwargs)
    
    async def parallel_generation(self, tasks: List[dict]):
        """Run multiple AI tasks in parallel"""
        coroutines = [
            self.route_task(task["type"], task["prompt"], **task.get("kwargs", {}))
            for task in tasks
        ]
        return await asyncio.gather(*coroutines)

# Usage example
orchestrator = AIOrchestrator()

# Generate multiple content pieces simultaneously
tasks = [
    {"type": "creative", "prompt": "Write engaging social media caption"},
    {"type": "analytical", "prompt": "Analyze user engagement metrics"},
    {"type": "fast", "prompt": "Generate 5 hashtag suggestions"}
]

results = await orchestrator.parallel_generation(tasks)
```

---

## 7. PROJECT-SPECIFIC OPTIMIZATION STRATEGIES

### For Mystic Arcana (Astrology Platform)
```markdown
# Mystic Arcana Specific Optimizations

## Astrological Calculation Caching
```python
# Cache expensive ephemeris calculations
@lru_cache(maxsize=10000)
def calculate_planetary_positions(birth_date: date, birth_time: time, latitude: float, longitude: float):
    """Cache results for identical birth data"""
    # Swiss Ephemeris calculations here
    pass

# Database caching for common queries
async def get_cached_chart_data(user_id: str, chart_type: str):
    cache_key = f"chart_{user_id}_{chart_type}"
    if cached := await redis.get(cache_key):
        return json.loads(cached)
    
    # Generate new chart
    chart_data = await generate_chart(user_id, chart_type)
    await redis.setex(cache_key, 86400, json.dumps(chart_data))  # 24h cache
    return chart_data
```

## AI Horoscope Generation
```python
class HoroscopeGenerator:
    def __init__(self):
        self.agent = Agent(
            'openai:gpt-4',
            result_type=HoroscopeOutput,
            system_prompt="""
            You are a master astrologer with deep knowledge of traditional and modern astrology.
            Generate insightful, personalized horoscopes based on precise astronomical data.
            Be specific about planetary influences and avoid generic statements.
            """
        )
    
    async def generate_daily_horoscope(self, chart_data: dict) -> HoroscopeOutput:
        prompt = f"""
        Birth Chart Data: {chart_data}
        Current Transits: {get_current_transits()}
        
        Generate a personalized daily horoscope focusing on:
        1. Most significant planetary aspects today
        2. Areas of life most affected
        3. Specific guidance for opportunities and challenges
        4. Lucky numbers based on numerological calculations
        """
        
        return await self.agent.run(prompt)
```

## Accuracy Validation System
```python
async def validate_calculation_accuracy():
    """Test against known reference points"""
    test_cases = [
        {"name": "Einstein", "date": "1879-03-14", "time": "11:30", "location": "Ulm, Germany"},
        {"name": "Tesla", "date": "1856-07-10", "time": "00:00", "location": "Smiljan, Croatia"}
    ]
    
    for case in test_cases:
        our_result = calculate_birth_chart(case)
        reference_result = get_astro_com_reference(case)
        
        accuracy = compare_calculations(our_result, reference_result)
        assert accuracy > 0.99, f"Accuracy too low for {case['name']}: {accuracy}"
```
```

### For BirthdayGen (Celebration Platform)
```markdown
# BirthdayGen Specific Optimizations

## AI Card Generation Pipeline
```python
class CardGenerationPipeline:
    def __init__(self):
        self.dalle = openai.Image()
        self.fallback_templates = load_fallback_templates()
    
    async def generate_personalized_card(self, user_data: dict, occasion: str):
        # Generate aura-based design prompt
        aura_prompt = await self.generate_aura_prompt(user_data)
        
        try:
            # Primary: DALL-E 3 generation
            image_response = await self.dalle.create(
                prompt=f"{aura_prompt} birthday card design, {occasion} theme",
                size="1024x1024",
                quality="hd",
                n=1
            )
            
            # Process and optimize image
            optimized_image = await self.optimize_image(image_response.data[0].url)
            
            return {
                "image_url": optimized_image,
                "generation_method": "ai",
                "aura_type": user_data.get("aura_type")
            }
            
        except Exception as e:
            logger.warning(f"DALL-E generation failed: {e}")
            # Fallback to template
            return self.get_fallback_template(user_data, occasion)
    
    async def generate_aura_prompt(self, user_data: dict) -> str:
        aura_type = user_data.get("aura_type", "balanced")
        
        aura_styles = {
            "creative": "vibrant colors, artistic elements, painterly style",
            "peaceful": "soft pastels, nature elements, minimalist design",
            "energetic": "bold colors, dynamic shapes, celebration motifs"
        }
        
        return aura_styles.get(aura_type, "colorful and joyful")
```

## Automation Engine
```python
class CelebrationAutomation:
    def __init__(self):
        self.email_service = ResendClient()
        self.sms_service = TwilioClient()
        self.scheduler = AsyncIOScheduler()
    
    async def schedule_celebration(self, contact: dict, celebration_plan: dict):
        """Schedule multi-tier celebrations"""
        
        for tier in celebration_plan["tiers"]:
            trigger_time = calculate_trigger_time(contact["birthday"], tier["timing"])
            
            if tier["type"] == "message":
                self.scheduler.add_job(
                    self.send_message,
                    trigger="date",
                    run_date=trigger_time,
                    args=[contact, tier["content"]]
                )
            elif tier["type"] == "card":
                self.scheduler.add_job(
                    self.send_digital_card,
                    trigger="date", 
                    run_date=trigger_time,
                    args=[contact, tier["card_id"]]
                )
            elif tier["type"] == "gift":
                self.scheduler.add_job(
                    self.process_gift_delivery,
                    trigger="date",
                    run_date=trigger_time,
                    args=[contact, tier["gift_selection"]]
                )
    
    async def send_message(self, contact: dict, content: dict):
        # Generate personalized message
        personalized_message = await self.personalize_message(contact, content)
        
        # Send via preferred channel
        if contact.get("prefer_sms"):
            await self.sms_service.send(contact["phone"], personalized_message)
        else:
            await self.email_service.send(contact["email"], personalized_message)
        
        # Log delivery
        await self.log_celebration_event(contact["id"], "message_sent", personalized_message)
```
```

### For EDM Shuffle (Digital Festival Platform)
```markdown
# EDM Shuffle Specific Optimizations

## Real-time Crowd Interaction System
```python
class CrowdInteractionEngine:
    def __init__(self):
        self.websocket_manager = WebSocketManager()
        self.effect_queue = asyncio.Queue()
        self.performance_monitor = PerformanceMonitor()
    
    async def trigger_crowd_effect(self, effect_type: str, intensity: float, user_id: str):
        """Handle real-time crowd effects with performance optimization"""
        
        # Validate effect parameters
        if not 0.0 <= intensity <= 1.0:
            raise ValueError("Intensity must be between 0 and 1")
        
        effect = {
            "type": effect_type,
            "intensity": intensity,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "id": str(uuid.uuid4())
        }
        
        # Performance throttling
        if await self.performance_monitor.should_throttle():
            effect["throttled"] = True
            intensity *= 0.5  # Reduce intensity under load
        
        # Queue for batch processing
        await self.effect_queue.put(effect)
        
        # Broadcast to all connected users
        await self.websocket_manager.broadcast({
            "event": "crowd_effect",
            "data": effect
        })
    
    async def process_effect_queue(self):
        """Batch process effects for performance"""
        effects_batch = []
        
        try:
            # Collect effects for batch processing
            for _ in range(10):  # Process up to 10 effects at once
                effect = await asyncio.wait_for(self.effect_queue.get(), timeout=0.1)
                effects_batch.append(effect)
        except asyncio.TimeoutError:
            pass
        
        if effects_batch:
            # Process batch of effects
            await self.render_effect_batch(effects_batch)
            
            # Update performance metrics
            await self.performance_monitor.record_batch(len(effects_batch))
```

## DJ Mix Station Integration
```python
class DJMixStation:
    def __init__(self):
        self.audio_processor = WebAudioProcessor()
        self.mix_storage = MixStorageService()
        self.real_time_analyzer = AudioAnalyzer()
    
    async def save_mix_session(self, mix_data: dict, user_id: str):
        """Save DJ mix with metadata and analysis"""
        
        # Analyze mix for metadata
        analysis = await self.real_time_analyzer.analyze_mix(mix_data["audio_data"])
        
        mix_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "duration": analysis["duration"],
            "bpm_range": analysis["bpm_range"],
            "key_signatures": analysis["keys"],
            "effects_used": mix_data.get("effects", []),
            "crowd_reaction_score": await self.calculate_crowd_score(mix_data),
            "audio_fingerprint": analysis["fingerprint"]
        }
        
        # Store mix and metadata
        storage_url = await self.mix_storage.store_mix(mix_data["audio_data"], mix_record["id"])
        mix_record["storage_url"] = storage_url
        
        # Save to database
        await self.save_mix_record(mix_record)
        
        return mix_record
    
    async def get_mix_recommendations(self, user_id: str, current_mix: dict):
        """AI-powered mix recommendations"""
        
        user_history = await self.get_user_mix_history(user_id)
        
        recommendation_prompt = f"""
        User Mix History: {user_history}
        Current Mix Style: {current_mix}
        
        Recommend 5 tracks that would create smooth transitions and maintain energy flow.
        Consider: BPM compatibility, key harmony, genre progression, crowd energy.
        
        Format: JSON array with track suggestions including transition tips.
        """
        
        recommendations = await self.ai_service.generate_recommendations(recommendation_prompt)
        return recommendations
```
```

---

## 8. IMPLEMENTATION INSTRUCTIONS

### Step-by-Step Setup Process

1. **Start with Foundation**:
```bash
# Initialize Claude Code properly
cd your-project
claude --init
```

2. **Create Core Files**:
```bash
# Copy the claude.md template above and customize for your project
# Create planning.md with your specific architecture
# Set up tasks.md with your current roadmap
```

3. **Install Hooks Gradually**:
```bash
# Start with basic hooks, add advanced ones as needed
# Test each hook individually before adding more
mkdir -p .claude/hooks
# Copy hook scripts from above
```

4. **Add Custom Commands**:
```bash
mkdir -p .claude/commands
# Add commands one at a time, test each one
# Start with /ultrathink-plan, then add others as needed
```

5. **Test and Iterate**:
```bash
# Try simple commands first
/ultrathink-plan
# Then move to more complex workflows
/multi-agent-research
/feature-factory
```

### Daily Workflow
```bash
# Start each session
claude
# Read context
cat claude.md planning.md tasks.md
# Update tasks as you work
# Use custom commands for complex operations
# End with session summary via hooks
```

This comprehensive system will transform your Claude Code usage into a highly efficient, automated development environment optimized for building innovative AI-powered applications.
```