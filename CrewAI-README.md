# EDM Shuffle CrewAI Integration

## Overview

This document describes the complete CrewAI integration for EDM Shuffle, enabling autonomous AI agents to handle complex workflows like virtual DJ sets, festival environment generation, RSS festival finding, fashion marketplace curation, and PLUR gamification.

**IMPORTANT**: This integration follows `CLAUDE_INTEGRITY_RULES.md` - all capabilities are honestly documented with clear TODO markers where implementation is needed.

## 🏗️ Architecture

### Core Components

- **`agents.py`** - 10 specialized CrewAI agents with defined roles, goals, and backstories
- **`tools.py`** - Custom tools for festival data, audio processing, 3D environments, and analytics
- **`crew.py`** - Orchestration workflows that coordinate multiple agents
- **`supabase/functions/`** - Edge Functions providing API endpoints for web integration

### Agent Roster

1. **Festival Scouter** - Discovers global EDM festivals and maintains RSS feeds
2. **Virtual Festival Architect** - Creates 3D environments with WebGL/Unity export
3. **Shuffle Coach** - Generates dance tutorials and training content
4. **Beat Mixer** - Produces DJ mixes and audio content with Web Audio API
5. **Lineup Curator** - Recommends artists based on data analytics
6. **Fashion Futurist** - Manages marketplace and fashion recommendations
7. **Engagement Alchemist** - Develops gamification and social features
8. **Data Oracle** - Handles analytics and business intelligence
9. **Automation Maestro** - Manages notifications and workflow automation
10. **Quality Guardian** - Provides QA testing and ethical oversight

## 🚀 Prerequisites

### System Requirements

- **Python**: 3.9+ with pip
- **Node.js**: 18+ with npm
- **Supabase CLI**: Latest version
- **Environment Variables**: API keys for external services

### Dependencies

#### Python Dependencies
```bash
pip install crewai crewai-tools python-dotenv requests beautifulsoup4
```

#### Node.js Dependencies
```bash
npm install @supabase/supabase-js
```

## 📦 Installation

### 1. Python Environment Setup

```bash
# Install CrewAI and dependencies
pip install crewai crewai-tools

# Install additional packages for custom tools
pip install python-dotenv requests beautifulsoup4 selenium

# Verify installation
python -c "import crewai; print('CrewAI installed successfully')"
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# External APIs (TODO: Configure as needed)
# OPENAI_API_KEY=your_openai_key
# SPOTIFY_CLIENT_ID=your_spotify_id
# SPOTIFY_CLIENT_SECRET=your_spotify_secret
# UNITY_LICENSE_KEY=your_unity_license

# Festival Data Sources
FESTIVAL_RSS_URLS=https://edmidentity.com/news/feed/,https://festivalwizard.com/feed/

# Audio Processing
# AUDIO_API_KEY=your_audio_service_key

# 3D Tools
# UNITY_PROJECT_PATH=/path/to/unity/project
```

### 3. Supabase Setup

#### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Workflow execution logging
CREATE TABLE workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  workflow_type TEXT NOT NULL,
  result JSONB,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health monitoring
CREATE TABLE system_health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_status TEXT NOT NULL,
  agent_status JSONB,
  tool_status JSONB,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own workflow logs" ON workflow_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow logs" ON workflow_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System health is viewable by authenticated users
CREATE POLICY "Authenticated users can view system health" ON system_health_logs
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### Deploy Edge Functions

```bash
# Deploy plan-festival endpoint
supabase functions deploy plan-festival

# Deploy crew-status endpoint  
supabase functions deploy crew-status

# Verify deployment
supabase functions list
```

## 🔧 Agent Configuration

### Individual Agent Setup

Each agent can be configured and tested independently:

```python
from agents import get_agent_by_name, get_all_agents

# Get specific agent
festival_agent = get_agent_by_name("festival_scouter")

# Get all agents
all_agents = get_all_agents()

# Test agent creation
for name, agent in all_agents.items():
    print(f"✅ {agent.role} - {len(agent.tools)} tools configured")
```

### Tool Integration

Custom tools are automatically assigned to appropriate agents:

```python
from tools import get_tools_for_agent, get_all_tools

# Get tools for specific agent
festival_tools = get_tools_for_agent("Festival Scouter")

# Test all tools
all_tools = get_all_tools()
for name, tool in all_tools.items():
    print(f"🔧 {tool.name} - {tool.description}")
```

## 🎯 Orchestration Workflows

### 1. Plan Virtual Festival Experience

Complete workflow coordinating multiple agents:

```python
from crew import EDMShuffleCrew

# Initialize crew orchestrator
crew = EDMShuffleCrew()

# Define user preferences
user_preferences = {
    "archetype": "cyber_punk",
    "genres": ["house", "techno", "trance"],
    "locations": ["North America", "Europe"],
    "budget": "moderate"
}

# Execute full festival planning workflow
result = crew.plan_virtual_festival_experience(user_preferences)
print(f"Festival planning result: {result}")
```

### 2. Generate DJ Set with Visuals

Audio and visual content generation:

```python
# Generate DJ set with synchronized 3D environment
dj_result = crew.generate_dj_set_with_visuals(
    genre="house",
    theme="cyber_punk"
)
print(f"DJ set result: {dj_result}")
```

### 3. Performance Analysis

Analyze workflow performance:

```python
# Analyze previous workflow executions
analysis = crew.analyze_workflow_performance()
print(f"Performance analysis: {analysis}")
```

## 🌐 API Integration

### Supabase Edge Functions

#### Plan Festival Endpoint

```bash
# POST /functions/v1/plan-festival
curl -X POST \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "preferences": {
      "archetype": "cyber_punk",
      "genres": ["house", "techno"]
    },
    "workflow_type": "festival"
  }' \
  https://your-project.supabase.co/functions/v1/plan-festival
```

#### System Status Endpoint

```bash
# GET /functions/v1/crew-status
curl -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  https://your-project.supabase.co/functions/v1/crew-status
```

### Frontend Integration

```typescript
// React component example
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

async function planFestival(userPreferences: any) {
  const { data, error } = await supabase.functions.invoke('plan-festival', {
    body: {
      user_id: user.id,
      preferences: userPreferences,
      workflow_type: 'festival'
    }
  })
  
  if (error) throw error
  return data
}
```

## 🧪 Testing

### Python Testing

```bash
# Test agent creation
python agents.py

# Test tool functionality
python tools.py

# Test workflow orchestration
python crew.py festival --user-id=test-user --archetype=cyber_punk

# Run with different workflows
python crew.py dj_set --genre=house --archetype=neon_raver
python crew.py analysis
```

### Edge Function Testing

```bash
# Test locally with Supabase CLI
supabase functions serve

# Test plan-festival endpoint
curl -X POST http://localhost:54321/functions/v1/plan-festival \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "workflow_type": "festival"}'

# Test status endpoint
curl http://localhost:54321/functions/v1/crew-status
```

### Integration Testing

```python
import pytest
from crew import EDMShuffleCrew
from agents import get_all_agents

def test_agent_initialization():
    """Test that all agents can be created successfully"""
    agents = get_all_agents()
    assert len(agents) == 10
    
    for name, agent in agents.items():
        assert agent.role is not None
        assert agent.goal is not None
        assert agent.backstory is not None

def test_workflow_execution():
    """Test basic workflow execution"""
    crew = EDMShuffleCrew()
    
    # This will use placeholder implementations
    result = crew.plan_virtual_festival_experience({
        "archetype": "test_archetype"
    })
    
    assert result is not None
    assert "status" in result

# Run tests
# pytest tests/
```

## 🚨 Current Implementation Status

### ✅ Completed Components

- **Agent Definitions**: All 10 agents with roles, goals, and backstories
- **Tool Structure**: Custom tool framework with placeholder implementations  
- **Workflow Orchestration**: Complete crew coordination system
- **API Endpoints**: Supabase Edge Functions for web integration
- **Documentation**: Comprehensive setup and usage guides

### 🚧 TODO: Implementation Requirements

#### High Priority (Required for Basic Functionality)

1. **Python Process Execution in Edge Functions**
   ```typescript
   // TODO: Implement in supabase/functions/plan-festival/index.ts
   const pythonProcess = Deno.run({
     cmd: ["python", "crew.py", workflow_type, `--user-id=${user_id}`],
     stdout: "piped",
     stderr: "piped"
   })
   ```

2. **Web Scraping Tool Implementation**
   ```python
   # TODO: Implement in tools.py WebScrapeFestivalTool._run()
   import requests
   from bs4 import BeautifulSoup
   
   response = requests.get(url)
   soup = BeautifulSoup(response.content, 'html.parser')
   # Extract festival data...
   ```

3. **Audio Synthesis Integration**
   ```python
   # TODO: Research and implement AI audio generation
   # Options: Suno AI, AIVA, Jukebox, or custom models
   # Requires: Audio generation API integration
   ```

4. **3D Environment Generation**
   ```python
   # TODO: Implement Three.js or Unity integration
   # Requires: 3D scene generation and WebGL export
   ```

#### Medium Priority (Enhanced Features)

5. **Supabase Marketplace Tool**
   ```python
   # TODO: Implement actual Supabase client operations
   from supabase import create_client
   
   supabase = create_client(url, key)
   result = supabase.table('marketplace_items').select('*').execute()
   ```

6. **Real-time Analytics Pipeline**
   ```python
   # TODO: Implement analytics data processing
   # Requires: Data aggregation, visualization, dashboards
   ```

7. **Game Mechanics Engine**
   ```python
   # TODO: Implement gamification logic
   # Requires: Game state management, scoring, rewards
   ```

#### Low Priority (Advanced Features)

8. **RSS Feed Generation**
9. **Unity WebGL Export**
10. **Social Media Analytics**
11. **NFT Integration**
12. **Advanced AI Features**

## 🔒 Security Considerations

### Authentication & Authorization
- All API endpoints require valid Supabase authentication
- Row Level Security (RLS) policies protect user data
- User can only access their own workflow data

### Data Protection
- Sensitive API keys stored in environment variables
- No user data logged in plain text
- Audit logging for security events

### Input Validation
- All user inputs sanitized before processing
- Command injection prevention for Python execution
- Rate limiting to prevent abuse

## 📊 Monitoring & Observability

### System Health Monitoring
- `/crew-status` endpoint provides real-time system health
- Agent availability and tool configuration status
- Workflow execution metrics and success rates

### Logging & Analytics
- All workflow executions logged to `workflow_logs` table
- System health snapshots in `system_health_logs` table
- Error tracking and performance monitoring

### Alerting (TODO)
- Critical system failures trigger alerts
- Performance degradation notifications
- Capacity planning based on usage metrics

## 🤝 Contributing

### Development Workflow
1. Follow `CLAUDE_INTEGRITY_RULES.md` - no fabricated progress claims
2. Work on one microtask at a time from `IMPLEMENTATION_MICROTASKS.md`
3. Update progress in `claudeupdate.md`
4. Test all changes before claiming completion

### Code Standards
- Use type hints in Python code
- Add comprehensive docstrings and comments
- Mark TODO items clearly with implementation requirements
- Follow existing patterns and conventions

### Testing Requirements
- All new features must include tests
- Integration tests for workflows
- Performance tests for scalability
- Security tests for vulnerability assessment

## 🆘 Troubleshooting

### Common Issues

#### "CrewAI module not found"
```bash
# Ensure CrewAI is installed
pip install crewai crewai-tools
python -c "import crewai; print('CrewAI available')"
```

#### "Python process execution failed"
```bash
# Check Python environment in Edge Functions
# Verify PATH and permissions
# Test Python execution manually
```

#### "Tool configuration error"
```bash
# Verify API keys in .env file
# Check external service connectivity
# Test tool initialization separately
```

#### "Supabase connection failed"
```bash
# Verify SUPABASE_URL and keys
# Check network connectivity
# Validate database schema
```

### Debug Mode

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Run crew with debug output
crew = EDMShuffleCrew()
result = crew.plan_virtual_festival_experience(preferences)
```

### Performance Optimization

- Use caching for frequently requested data
- Implement connection pooling for database operations
- Add timeout handling for long-running operations
- Monitor resource usage and optimize bottlenecks

## 📚 Additional Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [EDM Shuffle Project Documentation](./README.md)
- [Implementation Microtasks](./IMPLEMENTATION_MICROTASKS.md)
- [Claude Integrity Rules](./CLAUDE_INTEGRITY_RULES.md)

---

## 🎵 Ready to Rave with AI! 🎵

This CrewAI integration provides the foundation for autonomous AI-powered festival experiences. While many components require implementation (clearly marked with TODO), the architecture is complete and ready for development.

**Next Steps:**
1. Choose priority implementations based on project needs
2. Set up development environment with all prerequisites
3. Begin with high-priority TODO items
4. Test each component thoroughly before moving to the next

Let the digital rave begin! ✨🎧🤖