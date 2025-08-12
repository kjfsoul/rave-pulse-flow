/Users/kfitz/EDM Shuffle/rave-pulse-flow/.github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '20.x'
  PYTHON_VERSION: '3.11'

jobs:
  # Quality gates - run in parallel
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
        continue-on-error: false

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript type checking
        run: npx tsc --noEmit
        continue-on-error: false

  # Security scanning
  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level moderate
        continue-on-error: false
      
      - name: Run security audit with npm-audit-resolver
        run: npx npm-audit-resolver
        continue-on-error: false

  # Testing jobs - run in parallel after quality gates pass
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: [lint, typecheck, audit]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        if: github.event_name != 'pull_request'
        run: npx playwright install --with-deps
      
      - name: Run unit tests
        run: npm test:unit
        continue-on-error: false
      
      - name: Upload coverage reports
        if: github.event_name != 'pull_request'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: unit-tests-coverage

  e2e-tests:
    name: E2E Tests Playwright
    runs-on: ubuntu-latest
    needs: [lint, typecheck, audit]
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        continue-on-error: false
        env:
          PLAYWRIGHT_JUNIT_REPORT_NAME: e2e-tests
          PLAYWRIGHT_JUNIT_OUTPUT_DIR: test-results/e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: true
        with:
          name: e2e-test-results-${{ matrix.browser }}
          path: test-results/

  # Build and deployment
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

  # Database migration validation
  validate-db:
    name: Validate Database Schema
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements-minimal.txt
      
      - name: Validate database schema
        run: |
          if [ -f "crew_deployment.sql" ]; then
            echo "Validating database schema..."
            # Basic SQL syntax validation
            if grep -q "CREATE TABLE" crew_deployment.sql; then
              echo "✅ Database schema contains valid SQL"
            else
              echo "❌ Database schema validation failed"
              exit 1
            fi
          else
            echo "⚠️  Database schema file not found, skipping validation"
          fi
      
      - name: Validate Supabase functions
        run: |
          if [ -d "supabase/functions" ]; then
            echo "Validating Supabase Edge Functions..."
            function_count=0
            for func_dir in supabase/functions/*; do
              if [ -d "$func_dir" ] && [ -f "$func_dir/index.ts" ]; then
                function_count=$((function_count + 1))
                echo "✅ Found Edge Function: $(basename "$func_dir")"
              fi
            done
            if [ $function_count -gt 0 ]; then
              echo "✅ Found $function_count Edge Functions"
            else
              echo "⚠️  No Edge Functions found"
            fi
          else
            echo "⚠️  Edge Functions directory not found"
          fi

  # Deployment (only on main branch)
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, validate-db]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/
      
      - name: Deploy to Supabase
        run: |
          echo "🚀 Starting deployment to Supabase..."
          
          # Check if Supabase CLI is installed
          if ! command -v supabase &> /dev/null; then
            echo "❌ Supabase CLI not found. Please install it first."
            exit 1
          fi
          
          # Deploy database schema
          if [ -f "crew_deployment.sql" ]; then
            echo "📊 Deploying database schema..."
            supabase db push
          fi
          
          # Deploy Edge Functions
          if [ -d "supabase/functions" ]; then
            echo "🔧 Deploying Edge Functions..."
            for func_dir in supabase/functions/*; do
              if [ -d "$func_dir" ] && [ -f "$func_dir/index.ts" ]; then
                func_name=$(basename "$func_dir")
                echo "📦 Deploying function: $func_name"
                supabase functions deploy $func_name
              fi
            done
          fi
          
          echo "✅ Deployment completed successfully!"

  # Performance monitoring
  performance:
    name: Performance Check
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Lighthouse CI
        run: npm install -g @lhci/cli@0.12.x
      
      - name: Run Lighthouse CI
        run: lhci autorun
        continue-on-error: true


/Users/kfitz/EDM Shuffle/rave-pulse-flow/agents/config.yaml

# EDM Shuffle Agentic Tooling Configuration
# Non-secret configuration for agent execution and tool integration

version: "1.0.0"
last_updated: "2025-08-09"

# Global Configuration
global:
  max_concurrent_agents: 3
  default_timeout_seconds: 1800
  retry_attempts: 3
  retry_delay_seconds: 30
  enable_logging: true
  log_level: "INFO"
  enable_monitoring: true
  
# Agent Configuration
agents:
  claude_code_implementer:
    enabled: true
    model: "claude-3-5-sonnet-20241022"
    max_tokens: 4000
    temperature: 0.1
    timeout_seconds: 3600
    constraints:
      max_file_changes: 10
      max_lines_per_file: 100
      require_test_coverage: true
      require_validation: true
    tools:
      - "code_search"
      - "test_generator"
      - "security_auditor"
    safety_features:
      - "no_secrets"
      - "rollback_generation"
      - "quality_gates"
    
  manus_ai_orchestrator:
    enabled: true
    api_endpoint: "https://api.manus.ai/v1"
    timeout_seconds: 300
    max_concurrent_work_orders: 5
    constraints:
      require_human_approval: true
      enforce_ci_gates: true
      max_work_order_size: "small"
    notification_settings:
      slack_webhook: "https://hooks.slack.com/services/placeholder"
      email_notifications: false
      escalation_threshold: "high"
    
  code_search_tool:
    enabled: true
    tools:
      ripgrep:
        enabled: true
        additional_args: ["--type", "typescript", "--type", "javascript", "--type", "tsx", "--type", "jsx"]
      ctags:
        enabled: true
        exclude_patterns: ["node_modules", ".git", "dist", "build"]
      comby:
        enabled: true
        rules_file: "comby_rules.json"
    performance:
      max_search_results: 100
      cache_results: true
      cache_ttl_seconds: 3600
      
  test_generator:
    enabled: true
    frameworks:
      vitest:
        enabled: true
        config_file: "vitest.config.ts"
        coverage_threshold: 80
      playwright:
        enabled: true
        browsers: ["chromium", "firefox", "webkit"]
        headless: true
      testing_library:
        enabled: true
        additional_matchers: ["@testing-library/jest-dom"]
    output:
      test_directory: "src/__tests__"
      coverage_directory: "coverage"
      report_formats: ["json", "html", "lcov"]
      
  security_auditor:
    enabled: true
    tools:
      npm_audit:
        enabled: true
        audit_level: "moderate"
        ignore_patterns: []
      lockfile_lint:
        enabled: true
        rules: ["package-lock.json", "yarn.lock"]
      eslint:
        enabled: true
        config_file: ".eslintrc.js"
        additional_plugins: ["security"]
    severity_levels:
      critical: "fail"
      high: "fail"
      moderate: "warn"
      low: "info"

# Tool Configuration
tools:
  code_search:
    enabled: true
    index_directory: "src"
    exclude_patterns:
      - "node_modules/**"
      - ".git/**"
      - "dist/**"
      - "build/**"
      - "**/*.test.{ts,js,tsx,jsx}"
    file_types:
      - "*.ts"
      - "*.tsx"
      - "*.js"
      - "*.jsx"
      - "*.json"
      - "*.md"
      
  test_runner:
    enabled: true
    parallel: true
    max_workers: 4
    watch_mode: false
    coverage: true
    coverage_threshold: 80
    
  linter:
    enabled: true
    tools:
      eslint:
        enabled: true
        extensions: [".ts", ".tsx", ".js", ".jsx"]
        ignore_patterns: ["node_modules", "dist", "build"]
      prettier:
        enabled: true
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".md"]
        
  bundler:
    enabled: true
    tool: "vite"
    mode: "development"
    sourcemap: true
    optimize_deps: true
    
# Workflow Configuration
workflows:
  standard_implementation:
    enabled: true
    steps:
      - name: "validation"
        agent: "claude_code_implementer"
        required: true
      - name: "analysis"
        agent: "code_search_tool"
        required: true
      - name: "implementation"
        agent: "claude_code_implementer"
        required: true
      - name: "testing"
        agent: "test_generator"
        required: true
      - name: "security"
        agent: "security_auditor"
        required: true
      - name: "orchestration"
        agent: "manus_ai_orchestrator"
        required: true
    timeout_seconds: 7200
    rollback_on_failure: true
    
  quick_fix:
    enabled: true
    steps:
      - name: "implementation"
        agent: "claude_code_implementer"
        required: true
      - name: "basic_testing"
        agent: "test_generator"
        required: false
    timeout_seconds: 1800
    rollback_on_failure: true
    
  feature_development:
    enabled: true
    steps:
      - name: "requirements_analysis"
        agent: "claude_code_implementer"
        required: true
      - name: "architecture_design"
        agent: "claude_code_implementer"
        required: true
      - name: "implementation"
        agent: "claude_code_implementer"
        required: true
      - name: "comprehensive_testing"
        agent: "test_generator"
        required: true
      - name: "documentation"
        agent: "claude_code_implementer"
        required: true
      - name: "security_review"
        agent: "security_auditor"
        required: true
      - name: "performance_optimization"
        agent: "claude_code_implementer"
        required: false
    timeout_seconds: 86400
    rollback_on_failure: true

# Integration Configuration
integrations:
  github:
    enabled: true
    repository: "edm-shuffle/rave-pulse-flow"
    token: "${GITHUB_TOKEN}"  # Environment variable reference
    events:
      - "issues"
      - "pull_request"
      - "push"
    branch_protection:
      enabled: true
      require_pull_request_reviews: true
      required_status_checks: ["ci/ci"]
      
  supabase:
    enabled: true
    url: "${SUPABASE_URL}"  # Environment variable reference
    key: "${SUPABASE_SERVICE_ROLE_KEY}"  # Environment variable reference
    schemas:
      - "public"
      - "auth"
      
  ci_cd:
    enabled: true
    provider: "github_actions"
    workflow_file: ".github/workflows/ci.yml"
    required_checks:
      - "lint"
      - "test"
      - "security"
      - "build"
      
# Monitoring and Observability
monitoring:
  enabled: true
  metrics:
    - "agent_execution_time"
    - "work_order_success_rate"
    - "code_quality_score"
    - "test_coverage"
    - "security_vulnerabilities"
  alerts:
    enabled: true
    thresholds:
      execution_time_warning: 1800
      execution_time_critical: 3600
      success_rate_warning: 0.8
      success_rate_critical: 0.6
      test_coverage_warning: 0.7
      test_coverage_critical: 0.5
  logging:
    enabled: true
    level: "INFO"
    format: "json"
    retention_days: 30
    
# Environment Configuration
environments:
  development:
    enabled: true
    features:
      - "debug_mode"
      - "verbose_logging"
      - "experimental_tools"
    constraints:
      allow_unsafe_operations: true
      
  staging:
    enabled: true
    features:
      - "full_testing"
      - "security_scanning"
      - "performance_monitoring"
    constraints:
      allow_unsafe_operations: false
      
  production:
    enabled: true
    features:
      - "minimal_logging"
      - "strict_validation"
      - "rollback_capable"
    constraints:
      allow_unsafe_operations: false
      require_manual_approval: true

# Safety and Security
safety:
  secrets:
    detection: true
    prevention: true
    allowed_patterns: []
    blocked_patterns:
      - "api_key"
      - "secret"
      - "password"
      - "token"
      - "private_key"
      
  validation:
    enabled: true
    checks:
      - "schema_validation"
      - "type_safety"
      - "linting"
      - "test_coverage"
      - "security_scan"
      
  rollback:
    enabled: true
    strategy: "git_revert"
    auto_rollback: true
    rollback_threshold: "high"
    
# Performance Configuration
performance:
  caching:
    enabled: true
    ttl_seconds: 3600
    max_size_mb: 1000
    
  optimization:
    enabled: true
    parallel_processing: true
    resource_limits:
      max_memory_mb: 2048
      max_cpu_percent: 80
      
  profiling:
    enabled: false
    sample_rate: 0.1
    output_directory: "profiling"



/Users/kfitz/EDM Shuffle/rave-pulse-flow/agents/registry.json
{
  "version": "1.0.0",
  "last_updated": "2025-08-09",
  "agents": {
    "claude_code_implementer": {
      "name": "Claude Code Implementer",
      "type": "ai_agent",
      "role": "Implementation Executor",
      "capabilities": [
        "code_generation",
        "file_modification",
        "test_creation",
        "documentation_generation",
        "code_analysis"
      ],
      "input_formats": [
        "work_order_yaml"
      ],
      "output_formats": [
        "unified_diff",
        "test_files",
        "changelog_entries",
        "validation_reports"
      ],
      "constraints": {
        "max_file_size": "10MB",
        "max_diff_size": "500 lines",
        "required_test_coverage": "80%",
        "requires_ci_approval": true
      },
      "safety_features": [
        "no_secrets_allowed",
        "rollback_generation",
        "validation_checks",
        "quality_gates"
      ]
    },
    "manus_ai_orchestrator": {
      "name": "Manus.ai Orchestrator",
      "type": "workflow_orchestrator",
      "role": "Workflow Manager",
      "capabilities": [
        "ticket_monitoring",
        "work_order_generation",
        "agent_assignment",
        "progress_tracking",
        "pr_management",
        "quality_assurance"
      ],
      "input_formats": [
        "github_issues",
        "work_orders",
        "status_reports"
      ],
      "output_formats": [
        "pull_requests",
        "status_updates",
        "workflow_logs",
        "quality_reports"
      ],
      "constraints": {
        "max_concurrent_work_orders": 5,
        "max_retry_attempts": 3,
        "requires_human_oversight": true,
        "enforces_ci_gates": true
      },
      "safety_features": [
        "branch_protection",
        "change_review",
        "automated_testing",
        "performance_monitoring"
      ]
    },
    "code_search_tool": {
      "name": "Code Search Index",
      "type": "utility_tool",
      "role": "Code Discovery and Analysis",
      "capabilities": [
        "ripgrep_search",
        "ctags_navigation",
        "comby_structural_search",
        "dependency_analysis"
      ],
      "input_formats": [
        "search_queries",
        "file_patterns",
        "code_patterns"
      ],
      "output_formats": [
        "search_results",
        "code_locations",
        "dependency_maps",
        "analysis_reports"
      ],
      "constraints": {
        "max_search_results": 100,
        "max_file_depth": 10,
        "timeout_seconds": 30
      },
      "safety_features": [
        "read_only_access",
        "no_file_modification",
        "index_validation"
      ]
    },
    "test_generator": {
      "name": "Test Generator Suite",
      "type": "development_tool",
      "role": "Automated Test Creation",
      "capabilities": [
        "vitest_unit_tests",
        "playwright_e2e_tests",
        "testing_library_component_tests",
        "coverage_analysis"
      ],
      "input_formats": [
        "code_analysis",
        "test_requirements",
        "acceptance_criteria"
      ],
      "output_formats": [
        "test_files",
        "coverage_reports",
        "test_executions",
        "quality_metrics"
      ],
      "constraints": {
        "min_coverage_threshold": 80,
        "max_test_execution_time": 300,
        "requires_validation": true
      },
      "safety_features": [
        "test_isolation",
        "no_production_impact",
        "rollback_capable"
      ]
    },
    "security_auditor": {
      "name": "Security Audit Tool",
      "type": "security_tool",
      "role": "Vulnerability Detection and Prevention",
      "capabilities": [
        "npm_audit_scanning",
        "lockfile_linting",
        "eslint_security_rules",
        "secret_detection"
      ],
      "input_formats": [
        "dependency_lists",
        "code_files",
        "lockfiles"
      ],
      "output_formats": [
        "security_reports",
        "vulnerability_lists",
        "remediation_suggestions",
        "compliance_status"
      ],
      "constraints": {
        "max_vulnerability_severity": "moderate",
        "auto_remediate_low_severity": true,
        "requires_manual_review_high_severity": true
      },
      "safety_features": [
        "no_auto_remediate_critical",
        "human_approval_required",
        "audit_logging"
      ]
    }
  },
  "workflows": {
    "standard_implementation": {
      "name": "Standard Implementation Workflow",
      "description": "Complete work order implementation from ticket to deployment",
      "steps": [
        "ticket_monitoring",
        "work_order_generation",
        "code_analysis",
        "implementation",
        "test_generation",
        "security_audit",
        "quality_validation",
        "pr_creation",
        "ci_execution",
        "review_and_approval",
        "deployment"
      ],
      "required_agents": [
        "manus_ai_orchestrator",
        "claude_code_implementer",
        "test_generator",
        "security_auditor"
      ],
      "estimated_duration": "2-4 hours"
    },
    "quick_fix": {
      "name": "Quick Fix Workflow",
      "description": "Small, targeted fixes with minimal testing requirements",
      "steps": [
        "work_order_validation",
        "implementation",
        "basic_testing",
        "pr_creation",
        "review_and_merge"
      ],
      "required_agents": [
        "claude_code_implementer"
      ],
      "estimated_duration": "30-60 minutes"
    },
    "feature_development": {
      "name": "Feature Development Workflow",
      "description": "Complex feature development with comprehensive testing",
      "steps": [
        "requirements_analysis",
        "architecture_design",
        "implementation",
        "comprehensive_testing",
        "documentation",
        "performance_optimization",
        "security_review",
        "deployment_preparation"
      ],
      "required_agents": [
        "manus_ai_orchestrator",
        "claude_code_implementer",
        "code_search_tool",
        "test_generator",
        "security_auditor"
      ],
      "estimated_duration": "1-3 days"
    }
  },
  "tool_versions": {
    "ripgrep": "13.0.0",
    "ctags": "5.9.20210430",
    "comby": "0.32.0",
    "vitest": "0.34.0",
    "playwright": "1.37.0",
    "npm": "8.19.0",
    "node": "18.17.0"
  },
  "integration_points": {
    "github": {
      "enabled": true,
      "capabilities": [
        "issue_monitoring",
        "pull_request_management",
        "status_check_integration",
        "comment_handling"
      ]
    },
    "supabase": {
      "enabled": true,
      "capabilities": [
        "data_storage",
        "user_management",
        "realtime_updates",
        "analytics_tracking"
      ]
    },
    "ci_cd": {
      "enabled": true,
      "capabilities": [
        "automated_testing",
        "security_scanning",
        "performance_benchmarks",
        "deployment_automation"
      ]
    }
  }
}


/Users/kfitz/EDM Shuffle/rave-pulse-flow/docs/AGENTS_INTEGRATION.md
# EDM Shuffle - Agentic AI Integration

## Overview

This document outlines the agentic AI integration architecture for the EDM Shuffle platform, focusing on Claude Code as the Implementer and Manus.ai as the Orchestrator, with optional MCP and local tools for enhanced capabilities.

## Architecture Overview

### Core Components

1. **Claude Code (Implementer)**
   - **Input**: Work Order YAML files
   - **Output**: Unified diffs + tests + CHANGELOG
   - **Role**: Executes implementation tasks with code generation and modification

2. **Manus.ai (Orchestrator)**
   - **Input**: GitHub tickets and work orders
   - **Output**: PR creation, CI gate enforcement
   - **Role**: Watches tickets, calls Implementer, manages workflow

3. **MCP/Local Tools**
   - Code search/index tools
   - Test generators
   - Security/audit tools
   - Performance analyzers

## Integration Workflow

### 1. Work Order Creation

```yaml
# Example Work Order Structure
id: "audio-latency-fix-001"
branch: "feature/audio-latency-fix"
target_files: 
  - "src/components/audio-ui/"
  - "src/hooks/"
objective: "Fix mobile audio latency issues"
acceptance_criteria:
  - "Latency reduced to <100ms on mobile devices"
  - "Cross-browser compatibility maintained"
  - "No regression in desktop performance"
```

### 2. Manus.ai Orchestration

1. **Ticket Monitoring**: Watches GitHub issues for tagged work items
2. **Work Order Generation**: Converts tickets to YAML work orders
3. **Implementer Assignment**: Routes work orders to Claude Code
4. **Progress Tracking**: Monitors implementation progress
5. **PR Management**: Creates pull requests with proper CI gates
6. **Quality Assurance**: Enforces testing and review requirements

### 3. Claude Code Implementation

1. **Work Order Parsing**: Reads and validates YAML work orders
2. **Code Analysis**: Examines existing codebase structure
3. **Implementation**: Generates unified diffs for changes
4. **Test Generation**: Creates comprehensive test suites
5. **Documentation**: Updates CHANGELOG and relevant docs
6. **Validation**: Ensures all acceptance criteria are met

## Safety Rails

### 1. Security Constraints
- **No Secrets**: All configurations must be non-secret placeholders
- **Small Diffs**: Changes limited to focused, manageable sizes
- **CI Required**: All changes must pass automated checks
- **Code Review**: Mandatory human review for all AI-generated code

### 2. Quality Gates
- **Test Coverage**: Minimum 80% test coverage required
- **Linting**: All linting rules must pass
- **Type Safety**: TypeScript compilation required
- **Performance**: No performance regression allowed

### 3. Operational Constraints
- **Branch Strategy**: Feature branches only, no direct main branch changes
- **Change Size**: Maximum 500 lines per work order
- **Rollback Plan**: Each work order must include rollback instructions
- **Monitoring**: All changes must include monitoring hooks

## Tool Integration

### Code Search/Index Tools
- **Ripgrep**: Fast code search across the codebase
- **Ctags**: Code navigation and symbol indexing
- **Comby**: Structural code search and replacement

### Test Generation Tools
- **Vitest**: Unit test generation for TypeScript/React
- **Playwright**: E2E test generation for user flows
- **Testing Library**: Component testing utilities

### Security/Audit Tools
- **npm audit**: Dependency vulnerability scanning
- **Lockfile-lint**: Lockfile validation and security
- **ESLint**: Code quality and security rule checking

### Performance Tools
- **Vite Plugin Analysis**: Bundle optimization insights
- **Lighthouse**: Performance and accessibility scoring
- **Web Vitals**: Core web metrics monitoring

## Configuration Files

### agents/registry.json
- Lists available agents and their capabilities
- Non-secret configuration for agent discovery
- Maps agent names to implementation roles

### agents/config.yaml
- Runtime configuration for agent execution
- Tool selection and parameter settings
- Safety and constraint definitions

### docs/WORK_ORDER.schema.yaml
- Schema definition for work order YAML files
- Validation rules and required fields
- Example work orders for reference

## Implementation Process

### Step 1: Work Order Definition
1. Create YAML work order based on schema
2. Define acceptance criteria and constraints
3. Specify target files and objectives
4. Include test plan and rollback strategy

### Step 2: Agent Assignment
1. Manus.ai reviews work order
2. Assigns to appropriate Claude Code instance
3. Sets up monitoring and tracking
4. Validates work order completeness

### Step 3: Implementation Execution
1. Claude Code parses work order
2. Analyzes existing codebase
3. Generates implementation diffs
4. Creates tests and documentation
5. Validates against acceptance criteria

### Step 4: Quality Assurance
1. Automated test execution
2. Security scanning
3. Performance validation
4. Code review preparation

### Step 5: Deployment Preparation
1. Pull request creation
2. CI pipeline execution
3. Review and approval
4. Merge and deployment

## Monitoring and Observability

### Success Metrics
- **Implementation Success Rate**: Percentage of work orders completed successfully
- **Code Quality Score**: Based on test coverage and linting results
- **Performance Impact**: Change in application performance metrics
- **Bug Introduction Rate**: Number of regressions per implementation

### Alerting
- **Implementation Failures**: Notifications for failed work orders
- **Quality Gate Violations**: Alerts for test coverage or linting issues
- **Performance Regressions**: Warnings for performance degradation
- **Security Issues**: Immediate alerts for vulnerability findings

## Troubleshooting

### Common Issues
1. **Work Order Validation Failures**
   - Check YAML syntax and schema compliance
   - Verify required fields are present
   - Ensure acceptance criteria are specific

2. **Implementation Timeouts**
   - Break large work orders into smaller pieces
   - Increase timeout limits for complex changes
   - Optimize tool performance

3. **Test Failures**
   - Review test generation quality
   - Ensure tests cover acceptance criteria
   - Validate test environment setup

### Recovery Procedures
1. **Rollback Implementation**: Use predefined rollback strategies
2. **Work Order Retry**: Retry failed implementations with adjusted parameters
3. **Manual Intervention**: Escalate to human developers for complex issues

## Future Enhancements

### Planned Integrations
- **Advanced AI Models**: Integration with newer AI capabilities
- **Enhanced Testing**: AI-powered test optimization
- **Performance Optimization**: Automated performance tuning
- **Security Enhancement**: Advanced vulnerability detection

### Scaling Considerations
- **Parallel Processing**: Multiple concurrent work order executions
- **Distributed Agents**: Agent distribution across resources
- **Caching**: Implementation result caching for common patterns
- **Load Balancing**: Intelligent work order distribution

---

*Last Updated: 2025-08-09*
*Version: 1.0.0*

/Users/kfitz/EDM Shuffle/rave-pulse-flow/docs/WORK_ORDER.schema.yaml
# EDM Shuffle - Work Order Schema Definition
# Schema for YAML work orders used by agentic tooling

$schema: "http://json-schema.org/draft-07/schema#"
title: "EDM Shuffle Work Order"
description: "Schema for defining work orders for agentic implementation"
type: "object"
required:
  - "id"
  - "branch"
  - "target_files"
  - "objective"
  - "acceptance_criteria"
  - "constraints"

properties:
  # Core Identification
  id:
    type: "string"
    pattern: "^[a-z0-9]+-[a-z0-9]+-[0-9]{3}$"
    description: "Unique work order identifier (format: type-name-001)"
    example: "audio-latency-fix-001"
    
  title:
    type: "string"
    minLength: 10
    maxLength: 100
    description: "Human-readable title for the work order"
    example: "Fix Mobile Audio Latency Issues"
    
  description:
    type: "string"
    minLength: 50
    maxLength: 500
    description: "Detailed description of the work to be performed"
    example: "Address mobile audio latency issues in the Web Audio Engine to ensure smooth playback on iOS and Android devices."
    
  # Branch and File Management
  branch:
    type: "string"
    pattern: "^(feature|bugfix|hotfix)\/[a-z0-9-]+$"
    description: "Git branch name for implementation"
    example: "feature/audio-latency-fix"
    
  target_files:
    type: "array"
    items:
      type: "string"
      pattern: "^(src|public|supabase)\/.*$"
    minItems: 1
    maxItems: 10
    description: "List of files or directories to be modified"
    examples:
      - "src/components/audio-ui/"
      - "src/hooks/useAudioEngine.ts"
      - "src/lib/audioEngine.ts"
      
  excluded_files:
    type: "array"
    items:
      type: "string"
    minItems: 0
    maxItems: 20
    description: "Files that should not be modified during implementation"
    example: ["src/components/ui/", "node_modules/"]
    
  # Work Definition
  objective:
    type: "string"
    minLength: 20
    maxLength: 200
    description: "Primary objective of the work order"
    example: "Reduce mobile audio latency to under 100ms while maintaining cross-browser compatibility"
    
  acceptance_criteria:
    type: "array"
    items:
      type: "object"
      properties:
        criterion:
          type: "string"
          minLength: 10
          maxLength: 150
          description: "Specific acceptance criterion"
          example: "Mobile audio latency must be under 100ms"
        measurable:
          type: "boolean"
          description: "Whether this criterion can be measured objectively"
          default: true
        priority:
          type: "string"
          enum: ["low", "medium", "high", "critical"]
          default: "medium"
        testable:
          type: "boolean"
          description: "Whether this criterion can be tested automatically"
          default: true
      required: ["criterion"]
    minItems: 3
    maxItems: 10
    description: "List of acceptance criteria that must be met"
    
  constraints:
    type: "object"
    properties:
      max_file_changes:
        type: "integer"
        minimum: 1
        maximum: 20
        default: 5
        description: "Maximum number of files that can be modified"
        
      max_lines_per_file:
        type: "integer"
        minimum: 10
        maximum: 500
        default: 100
        description: "Maximum number of lines that can be changed per file"
        
      max_execution_time:
        type: "integer"
        minimum: 300
        maximum: 7200
        default: 1800
        description: "Maximum execution time in seconds"
        
      require_test_coverage:
        type: "boolean"
        default: true
        description: "Whether test coverage is required"
        
      test_coverage_threshold:
        type: "number"
        minimum: 50
        maximum: 100
        default: 80
        description: "Minimum test coverage percentage required"
        
      require_performance_validation:
        type: "boolean"
        default: true
        description: "Whether performance validation is required"
        
      require_security_scan:
        type: "boolean"
        default: true
        description: "Whether security scanning is required"
        
      allow_breaking_changes:
        type: "boolean"
        default: false
        description: "Whether breaking changes are allowed"
        
      require_manual_review:
        type: "boolean"
        default: true
        description: "Whether manual code review is required"
    additionalProperties: false
    
  # Implementation Details
  implementation_type:
    type: "string"
    enum: ["bugfix", "feature", "optimization", "refactoring", "documentation"]
    default: "feature"
    description: "Type of implementation work"
    
  complexity:
    type: "string"
    enum: ["low", "medium", "high", "critical"]
    default: "medium"
    description: "Complexity level of the work"
    
  estimated_effort:
    type: "string"
    pattern: "^[0-9]+[mdw]?$"
    description: "Estimated effort (m=minutes, d=days, w=weeks)"
    examples:
      - "4h"
      - "2d"
      - "1w"
    
  dependencies:
    type: "array"
    items:
      type: "string"
      pattern: "^[a-z0-9]+-[a-z0-9]+-[0-9]{3}$"
    minItems: 0
    maxItems: 5
    description: "List of dependent work order IDs"
    example: ["audio-engine-001", "ui-components-002"]
    
  # Testing Requirements
  test_plan:
    type: "object"
    properties:
      unit_tests:
        type: "boolean"
        default: true
        description: "Whether unit tests are required"
        
      integration_tests:
        type: "boolean"
        default: true
        description: "Whether integration tests are required"
        
      e2e_tests:
        type: "boolean"
        default: false
        description: "Whether end-to-end tests are required"
        
      performance_tests:
        type: "boolean"
        default: false
        description: "Whether performance tests are required"
        
      security_tests:
        type: "boolean"
        default: false
        description: "Whether security tests are required"
        
      test_scenarios:
        type: "array"
        items:
          type: "string"
        minItems: 1
        maxItems: 10
        description: "Specific test scenarios to cover"
        example: ["Mobile Safari audio playback", "Chrome crossfading", "iOS touch controls"]
        
      mock_data:
        type: "boolean"
        default: true
        description: "Whether mock data should be used for testing"
    additionalProperties: false
    
  # Execution Commands
  run_commands:
    type: "array"
    items:
      type: "object"
      properties:
        command:
          type: "string"
          minLength: 5
          maxLength: 100
          description: "Command to run"
          example: "npm test"
        description:
          type: "string"
          minLength: 10
          maxLength: 100
          description: "Description of what the command does"
          example: "Run unit tests"
        required_field:
          type: "boolean"
          default: true
          description: "Whether this command must succeed"
        timeout:
          type: "integer"
          minimum: 30
          maximum: 3600
          default: 300
          description: "Command timeout in seconds"
      required: ["command", "description"]
    minItems: 1
    maxItems: 10
    description: "Commands to run during implementation"
    
  # Deliverables
  deliverables:
    type: "array"
    items:
      type: "object"
      properties:
        name:
          type: "string"
          minLength: 5
          maxLength: 50
          description: "Name of the deliverable"
          example: "Audio Engine Optimization"
        type:
          type: "string"
          enum: ["code", "tests", "documentation", "config", "assets"]
          description: "Type of deliverable"
        description:
          type: "string"
          minLength: 10
          maxLength: 100
          description: "Description of the deliverable"
        required_field:
          type: "boolean"
          default: true
          description: "Whether this deliverable is required"
      required: ["name", "type", "description"]
    minItems: 1
    maxItems: 10
    description: "List of deliverables expected from the implementation"
    
  # Rollback Strategy
  rollback_strategy:
    type: "object"
    properties:
      enabled:
        type: "boolean"
        default: true
        description: "Whether rollback strategy is enabled"
      
      method:
        type: "string"
        enum: ["git_revert", "backup_restore", "feature_flag"]
        default: "git_revert"
        description: "Rollback method to use"
        
      triggers:
        type: "array"
        items:
          type: "string"
          enum: ["test_failure", "performance_regression", "security_issue", "manual"]
        minItems: 1
        maxItems: 5
        description: "Conditions that trigger rollback"
        
      auto_rollback:
        type: "boolean"
        default: false
        description: "Whether to automatically rollback on triggers"
        
      manual_steps:
        type: "array"
        items:
          type: "string"
        minItems: 1
        maxItems: 10
        description: "Manual steps for rollback if needed"
    additionalProperties: false
    
  # Monitoring and Telemetry
  telemetry_to_return:
    type: "array"
    items:
      type: "object"
      properties:
        metric:
          type: "string"
          minLength: 5
          maxLength: 50
          description: "Metric name"
          example: "audio_latency_ms"
        type:
          type: "string"
          enum: ["numeric", "boolean", "string", "object"]
          description: "Metric data type"
        unit:
          type: "string"
          maxLength: 20
          description: "Unit of measurement (if applicable)"
          example: "ms"
        description:
          type: "string"
          minLength: 10
          maxLength: 100
          description: "Description of the metric"
      required: ["metric", "type", "description"]
    minItems: 0
    maxItems: 10
    description: "Metrics and telemetry data to collect during implementation"
    
  # Metadata
  priority:
    type: "string"
    enum: ["low", "medium", "high", "critical"]
    default: "medium"
    description: "Priority level of the work order"
    
  tags:
    type: "array"
    items:
      type: "string"
      pattern: "^[a-z0-9-]+$"
    minItems: 0
    maxItems: 10
    description: "Tags for categorization and filtering"
    example: ["audio", "mobile", "performance", "web-audio-api"]
    
  assignee:
    type: "string"
    pattern: "^[a-z0-9-]+$"
    description: "Assignee for the work order (optional)"
    example: "audio-team"
    
  due_date:
    type: "string"
    format: "date-time"
    description: "Due date for completion (optional)"
    example: "2025-08-16T17:00:00Z"
    
  created_by:
    type: "string"
    pattern: "^[a-z0-9-]+$"
    description: "Creator of the work order"
    example: "product-manager"
    
  created_at:
    type: "string"
    format: "date-time"
    description: "Creation timestamp"
    example: "2025-08-09T10:00:00Z"
    
  updated_at:
    type: "string"
    format: "date-time"
    description: "Last update timestamp"
    example: "2025-08-09T10:00:00Z"

# Additional validation rules
additionalProperties: false
required_fields:
  - "id"
  - "branch"
  - "target_files"
  - "objective"
  - "acceptance_criteria"
  - "constraints"
  - 
/Users/kfitz/EDM Shuffle/rave-pulse-flow/examples/WO-audio-latency.yaml
# Work Order: Audio Engine Mobile Latency Fix
# ID: audio-latency-fix-001
# Priority: High
# Type: Bugfix

id: "audio-latency-fix-001"
title: "Fix Mobile Audio Latency Issues"
description: "Address mobile audio latency issues in the Web Audio Engine to ensure smooth playback on iOS and Android devices. Current implementation has unacceptable delays on mobile platforms affecting user experience."

branch: "feature/audio-latency-fix"
target_files:
  - "src/components/audio-ui/"
  - "src/hooks/useAudioEngine.ts"
  - "src/lib/audioEngine.ts"
  - "src/utils/audioUtils.ts"

excluded_files:
  - "src/components/ui/"
  - "node_modules/"
  - "dist/"

objective: "Reduce mobile audio latency to under 100ms while maintaining cross-browser compatibility and existing functionality"

acceptance_criteria:
  - criterion: "Mobile audio latency must be under 100ms on iOS Safari"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "Mobile audio latency must be under 100ms on Chrome Android"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "Cross-browser compatibility must be maintained"
    measurable: true
    priority: "medium"
    testable: true
  - criterion: "No regression in desktop audio performance"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "Audio quality must not be degraded"
    measurable: true
    priority: "medium"
    testable: true

constraints:
  max_file_changes: 5
  max_lines_per_file: 150
  max_execution_time: 3600
  require_test_coverage: true
  test_coverage_threshold: 80
  require_performance_validation: true
  require_security_scan: true
  allow_breaking_changes: false
  require_manual_review: true

implementation_type: "bugfix"
complexity: "medium"
estimated_effort: "4h"
dependencies: []

test_plan:
  unit_tests: true
  integration_tests: true
  e2e_tests: false
  performance_tests: true
  security_tests: false
  test_scenarios:
    - "Mobile Safari audio playback"
    - "Chrome Android audio playback"
    - "Crossfading on mobile devices"
    - "Touch controls responsiveness"
  mock_data: true

run_commands:
  - command: "npm test"
    description: "Run unit tests"
    required: true
    timeout: 300
  - command: "npm run test:integration"
    description: "Run integration tests"
    required: true
    timeout: 600
  - command: "npm run test:performance"
    description: "Run performance tests"
    required: true
    timeout: 900
  - command: "npm run build"
    description: "Build the application"
    required: true
    timeout: 300

deliverables:
  - name: "Mobile Audio Optimization"
    type: "code"
    description: "Optimized audio engine for mobile platforms"
    required: true
  - name: "Performance Tests"
    type: "tests"
    description: "Mobile audio performance test suite"
    required: true
  - name: "Documentation"
    type: "documentation"
    description: "Updated audio engine documentation"
    required: true

rollback_strategy:
  enabled: true
  method: "git_revert"
  triggers:
    - "test_failure"
    - "performance_regression"
    - "manual"
  auto_rollback: false
  manual_steps:
    - "Revert to the previous stable version"
    - "Run full test suite to verify stability"
    - "Document the rollback for future reference"

telemetry_to_return:
  - metric: "mobile_audio_latency_ms"
    type: "numeric"
    unit: "ms"
    description: "Mobile audio latency measurement"
  - metric: "desktop_audio_latency_ms"
    type: "numeric"
    unit: "ms"
    description: "Desktop audio latency measurement"
  - metric: "audio_quality_score"
    type: "numeric"
    unit: "score"
    description: "Audio quality assessment score"
  - metric: "crossfading_smoothness"
    type: "numeric"
    unit: "rating"
    description: "Crossfading smoothness rating"

priority: "high"
tags: ["audio", "mobile", "performance", "web-audio-api", "latency"]
assignee: "audio-team"
created_by: "qa-engineer"
created_at: "2025-08-09T10:00:00Z"
updated_at: "2025-08-09T10:00:00Z"


/Users/kfitz/EDM Shuffle/rave-pulse-flow/examples/WO-voting-integrity.yaml
# Work Order: Festival Voting Integrity + Rate-limit
# ID: voting-integrity-001
# Priority: High
# Type: Feature

id: "voting-integrity-001"
title: "Implement Festival Voting Integrity and Rate-limiting System"
description: "Enhance the festival voting system with integrity checks, rate-limiting, and anti-abuse measures to ensure fair voting and prevent manipulation. Current system lacks proper validation and is vulnerable to voting fraud."

branch: "feature/voting-integrity"
target_files:
  - "src/components/festival-voting/"
  - "src/hooks/useVoting.ts"
  - "src/lib/votingEngine.ts"
  - "src/utils/rateLimitUtils.ts"
  - "src/middleware/rateLimit.ts"
  - "supabase/functions/voting-integrity/"

excluded_files:
  - "src/components/ui/"
  - "node_modules/"
  - "dist/"

objective: "Implement comprehensive voting integrity system with rate-limiting, user validation, and anti-fraud measures to ensure fair festival voting"

acceptance_criteria:
  - criterion: "Rate-limiting must prevent more than 10 votes per minute per user"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "Duplicate voting must be prevented across all festival events"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "Bot detection must identify and block automated voting attempts"
    measurable: true
    priority: "high"
    testable: true
  - criterion: "User validation must verify voter authenticity"
    measurable: true
    priority: "medium"
    testable: true
  - criterion: "Voting transparency must be maintained with audit logs"
    measurable: true
    priority: "medium"
    testable: true
  - criterion: "System performance must not be degraded by integrity checks"
    measurable: true
    priority: "medium"
    testable: true

constraints:
  max_file_changes: 8
  max_lines_per_file: 200
  max_execution_time: 5400
  require_test_coverage: true
  test_coverage_threshold: 85
  require_performance_validation: true
  require_security_scan: true
  allow_breaking_changes: false
  require_manual_review: true

implementation_type: "feature"
complexity: "high"
estimated_effort: "8h"
dependencies: ["auth-system-001"]

test_plan:
  unit_tests: true
  integration_tests: true
  e2e_tests: true
  performance_tests: true
  security_tests: true
  test_scenarios:
    - "Rate-limiting enforcement under high load"
    - "Duplicate voting prevention across multiple events"
    - "Bot detection and blocking"
    - "User authentication validation"
    - "Voting audit log integrity"
    - "Performance impact assessment"
    - "Security vulnerability scanning"
  mock_data: true

run_commands:
  - command: "npm test"
    description: "Run unit tests"
    required: true
    timeout: 300
  - command: "npm run test:integration"
    description: "Run integration tests"
    required: true
    timeout: 600
  - command: "npm run test:e2e"
    description: "Run end-to-end tests"
    required: true
    timeout: 900
  - command: "npm run test:performance"
    description: "Run performance tests"
    required: true
    timeout: 600
  - command: "npm run test:security"
    description: "Run security tests"
    required: true
    timeout: 600
  - command: "npm run build"
    description: "Build the application"
    required: true
    timeout: 300

deliverables:
  - name: "Voting Integrity System"
    type: "code"
    description: "Comprehensive voting integrity and rate-limiting system"
    required: true
  - name: "Bot Detection Engine"
    type: "code"
    description: "Automated bot detection and prevention system"
    required: true
  - name: "Voting Audit Logs"
    type: "code"
    description: "Secure voting audit logging system"
    required: true
  - name: "Test Suite"
    type: "tests"
    description: "Comprehensive test suite for voting integrity"
    required: true
  - name: "Documentation"
    type: "documentation"
    description: "Updated voting system documentation"
    required: true

rollback_strategy:
  enabled: true
  method: "git_revert"
  triggers:
    - "test_failure"
    - "performance_regression"
    - "security_issue"
    - "manual"
  auto_rollback: false
  manual_steps:
    - "Revert to the previous stable voting system"
    - "Run full test suite to verify stability"
    - "Monitor voting system for 24 hours"
    - "Document the rollback for future reference"

telemetry_to_return:
  - metric: "votes_per_minute"
    type: "numeric"
    unit: "votes"
    description: "Votes processed per minute"
  - metric: "blocked_votes_count"
    type: "numeric"
    unit: "votes"
    description: "Number of blocked votes due to rate-limiting"
  - metric: "duplicate_votes_detected"
    type: "numeric"
    unit: "votes"
    description: "Number of duplicate votes detected"
  - metric: "bot_attempts_blocked"
    type: "numeric"
    unit: "attempts"
    description: "Number of bot voting attempts blocked"
  - metric: "system_response_time_ms"
    type: "numeric"
    unit: "ms"
    description: "System response time for voting operations"
  - metric: "voting_integrity_score"
    type: "numeric"
    unit: "score"
    description: "Overall voting integrity score"

priority: "high"
tags: ["voting", "festival", "integrity", "security", "rate-limiting", "anti-fraud"]
assignee: "backend-team"
created_by: "product-manager"
created_at: "2025-08-09T10:00:00Z"
updated_at: "2025-08-09T10:00:00Z"


/Users/kfitz/EDM Shuffle/rave-pulse-flow/scripts/dev-preflight.sh
#!/bin/bash
# EDM Shuffle Development Preflight Script
# Validates development environment before starting the application

set -e  # Exit on any error

echo "🎵 EDM Shuffle Development Preflight Check 🎵"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check command availability
check_command() {
    local cmd="$1"
    local version_cmd="$2"
    local min_version="$3"
    
    if ! command -v "$cmd" &> /dev/null; then
        print_error "$cmd is not installed"
        return 1
    fi
    
    if [ -n "$version_cmd" ] && [ -n "$min_version" ]; then
        local installed_version=$($version_cmd 2>&1 | head -n 1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -n 1)
        if [ -n "$installed_version" ]; then
            if [ "$(printf '%s\n' "$min_version" "$installed_version" | sort -V | head -n1)" != "$min_version" ]; then
                print_warning "$cmd version $installed_version is below minimum required $min_version"
                return 1
            fi
        fi
    fi
    
    print_success "$cmd is available"
    return 0
}

# Function to check environment file
check_env_file() {
    local env_file="$1"
    
    if [ ! -f "$env_file" ]; then
        print_warning "$env_file not found"
        return 1
    fi
    
    # Check for required environment variables
    local required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_warning "Missing required variables in $env_file: ${missing_vars[*]}"
        return 1
    fi
    
    print_success "$env_file contains required variables"
    return 0
}

# Function to check Node.js project setup
check_node_setup() {
    print_status "Checking Node.js project setup..."
    
    # Check package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        return 1
    fi
    
    # Check node_modules
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        npm install
    fi
    
    # Check for required scripts
    if ! grep -q '"lint"' package.json || ! grep -q '"build"' package.json; then
        print_warning "Required scripts not found in package.json"
        return 1
    fi
    
    print_success "Node.js project setup is valid"
    return 0
}

# Function to check TypeScript configuration
check_typescript() {
    print_status "Checking TypeScript configuration..."
    
    if [ ! -f "tsconfig.json" ]; then
        print_error "tsconfig.json not found"
        return 1
    fi
    
    # Check for TypeScript files
    local ts_count=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
    if [ "$ts_count" -eq 0 ]; then
        print_warning "No TypeScript files found in src/"
        return 1
    fi
    
    print_success "TypeScript configuration is valid"
    return 0
}

# Function to check Supabase CLI
check_supabase() {
    print_status "Checking Supabase CLI..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed"
        print_error "Please install it from: https://supabase.com/docs/guides/cli/getting-started"
        return 1
    fi
    
    # Check Supabase version
    local supabase_version=$(supabase --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
    if [ -n "$supabase_version" ]; then
        print_success "Supabase CLI version $supabase_version is installed"
    fi
    
    # Check if local Supabase is initialized
    if [ ! -f "supabase/config.toml" ]; then
        print_warning "Supabase local project not initialized"
        print_status "Run 'supabase init' to initialize local Supabase project"
        return 1
    fi
    
    print_success "Supabase CLI is properly configured"
    return 0
}

# Function to check Playwright setup
check_playwright() {
    print_status "Checking Playwright setup..."
    
    if [ ! -d "node_modules" ] || [ ! -d "node_modules/playwright" ]; then
        print_warning "Playwright not installed, installing..."
        npx playwright install
    fi
    
    # Check for Playwright config
    if [ ! -f "playwright.config.ts" ] && [ ! -f "playwright.config.js" ]; then
        print_warning "Playwright configuration file not found"
        return 1
    fi
    
    # Install Playwright browsers
    print_status "Installing Playwright browsers..."
    npx playwright install --with-deps
    
    print_success "Playwright setup is complete"
    return 0
}

# Function to check audio testing environment
check_audio_environment() {
    print_status "Checking audio testing environment..."
    
    # Check for audio files directory
    if [ ! -d "public/audio" ]; then
        print_warning "Audio directory not found"
        return 1
    fi
    
    # Check for audio sandbox flags (mobile testing)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS specific audio sandbox checks
        if ! sysctl kern.features.user64 | grep -q "1"; then
            print_warning "Audio sandbox may not be properly configured for mobile testing"
        fi
    fi
    
    print_success "Audio testing environment is configured"
    return 0
}

# Function to check security compliance
check_security() {
    print_status "Checking security compliance..."
    
    # Check for hardcoded secrets in code
    if grep -r -i "api[_-]key\|secret\|password" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "example"; then
        print_warning "Potential hardcoded secrets found in source code"
        return 1
    fi
    
    # Check for environment files with sensitive data
    local env_files=(".env" ".env.local" ".env.development" ".env.production")
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            # Check if file is tracked in git
            if git ls-files --error-unmatch "$env_file" >/dev/null 2>&1; then
                print_error "Environment file $env_file is tracked in git - this is a security risk"
                return 1
            fi
        fi
    done
    
    print_success "Security compliance checks passed"
    return 0
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check for outdated dependencies
    if command -v npm &> /dev/null; then
        local outdated_count=$(npm outdated --depth=0 2>/dev/null | wc -l || echo "0")
        if [ "$outdated_count" -gt 0 ]; then
            print_warning "$outdated_count dependencies are outdated"
            print_status "Run 'npm update' to update dependencies"
        fi
    fi
    
    # Check for unused dependencies
    if command -v npx &> /dev/null && [ -f "package.json" ]; then
        if npx depcheck --skip-missing --ignores="*"; then
            print_success "No unused dependencies found"
        else
            print_warning "Some dependencies may be unused"
        fi
    fi
    
    print_success "Dependency check completed"
    return 0
}

# Function to check database schema
check_database_schema() {
    print_status "Checking database schema..."
    
    if [ ! -f "supabase/migrations" ]; then
        print_warning "Supabase migrations directory not found"
        return 1
    fi
    
    # Check for migration files
    local migration_count=$(find supabase/migrations -name "*.sql" | wc -l)
    if [ "$migration_count" -eq 0 ]; then
        print_warning "No migration files found"
        return 1
    fi
    
    print_success "Database schema is valid"
    return 0
}

# Function to check Edge Functions
check_edge_functions() {
    print_status "Checking Edge Functions..."
    
    if [ ! -d "supabase/functions" ]; then
        print_warning "Edge Functions directory not found"
        return 1
    fi
    
    local function_count=0
    for func_dir in supabase/functions/*; do
        if [ -d "$func_dir" ] && [ -f "$func_dir/index.ts" ]; then
            function_count=$((function_count + 1))
            print_success "Found Edge Function: $(basename "$func_dir")"
        fi
    done
    
    if [ $function_count -eq 0 ]; then
        print_warning "No valid Edge Functions found"
        return 1
    fi
    
    print_success "Found $function_count Edge Functions"
    return 0
}

# Main preflight check
main() {
    local failed_checks=0
    local total_checks=0
    
    # Define all checks
    declare -a checks=(
        "check_command Node.js 'node --version' '18.0'"
        "check_command npm 'npm --version' '8.0'"
        "check_command Python3 'python3 --version' '3.8'"
        "check_env_file .env.example"
        "check_node_setup"
        "check_typescript"
        "check_supabase"
        "check_playwright"
        "check_audio_environment"
        "check_security"
        "check_dependencies"
        "check_database_schema"
        "check_edge_functions"
    )
    
    # Run all checks
    for check in "${checks[@]}"; do
        total_checks=$((total_checks + 1))
        if eval "$check"; then
            echo
        else
            failed_checks=$((failed_checks + 1))
            echo
        fi
    done
    
    # Summary
    echo "=============================================="
    echo "🎯 Preflight Check Summary"
    echo "=============================================="
    echo "Total checks: $total_checks"
    echo "Passed: $((total_checks - failed_checks))"
    echo "Failed: $failed_checks"
    echo "=============================================="
    
    if [ $failed_checks -eq 0 ]; then
        print_success "🎉 All preflight checks passed! You're ready to develop."
        echo
        print_status "Next steps:"
        echo "  1. Start development server: npm run dev"
        echo "  2. Run tests: npm test"
        echo "  3. Build for production: npm run build"
        echo
        exit 0
    else
        print_error "❌ $failed_checks preflight checks failed"
        echo
        print_status "Fix the issues above and run this script again."
        exit 1
    fi
}

# Run main function
main "$@"




/Users/kfitz/EDM Shuffle/rave-pulse-flow/GAP_MAP.md
# GAP_MAP.md

## Project Overview
**Project**: EDM Shuffle - Digital Rave Experience Platform  
**Current Status**: Phase 1 Complete (Authentication & Persistence), Phase 2 In Progress  
**Last Updated**: 2025-08-09  
**Target State**: Full MVP with Real-Time Features, Marketplace, and Community Platform

---

## Gap Analysis Matrix

| Area | Current State | Target | Gap | Risk | ETA | Impact | Priority |
|------|---------------|--------|-----|------|-----|--------|----------|
| **Audio Engine** | Basic UI components exist (FLX10Deck, LiveEqualizer, SoundPackLoader) but no real Web Audio API integration. Audio engine is simulated/non-functional. | Real-time dual-deck DJ mixing with Web Audio API, crossfading, pitch control, echo effects, live waveform visualization, and mobile-optimized performance. | Complete Web Audio API implementation missing. Audio context, nodes, and real-time processing not connected to UI components. | CRITICAL - Core user experience cannot function without proper audio engine. All DJ features are non-functional. | L | H | P1 |
| **Auth & Profiles** | ✅ Complete Supabase authentication system with user profiles, archetype selection, PLUR points, level, and streak tracking. Protected routes implemented. | Supabase auth with protected routes, user data flow, profile management, and social features. Integration with all other systems. | None - Authentication system is fully functional and complete. | None | S | L | P3 |
| **Challenges/Quests & PLUR streaks** | Database schema exists for challenges and PLURcrew. Basic challenge state management implemented with persistence. | Daily challenge cadence with user submissions, streak tracking, cheat-prevention, PLUR points system, and social sharing features. | Challenge submission UI and file upload missing. Real-time challenge updates and social features not implemented. | HIGH - User engagement and content creation blocked without proper challenge system. | M | H | P2 |
| **Festival Voting & Scheduling** | Basic voting framework exists with database tracking. Anti-spam protection and archetype bonuses implemented. | Real-time voting system with UX flow, anti-abuse measures, tally integrity, live leaderboards, and scheduling features. | Real-time vote updates missing. Live leaderboard and scheduling UI not implemented. Vote visualization needs enhancement. | HIGH - Primary engagement feature is non-functional without real-time updates. | M | H | P2 |
| **Marketplace** | Database schema exists for purchases. Basic product structure and archetype bonuses implemented. | Complete soundpacks marketplace with purchase flow, Stripe integration, digital downloads, inventory management, and secure checkout. | Stripe payment integration missing. Product listings and e-commerce UI not implemented. Digital download system incomplete. | MEDIUM - Monetization blocked without payment processing. | M | M | P2 |
| **Accessibility & Mobile UX** | Basic responsive design exists. Some mobile considerations in components. | Full mobile optimization with touch controls, accessibility compliance (WCAG 2.1 AA), low-end device support, and responsive design. | Touch controls for mobile missing. Accessibility features not implemented. Performance optimization for low-end devices needed. | MEDIUM - Excludes mobile users and doesn't meet accessibility standards. | M | M | P2 |
| **CI/CD** | Basic linting and TypeScript validation exists. Manual deployment process documented. | Automated CI/CD pipeline with lint, typecheck, unit tests, e2e tests, security audits, and automated deployments. | No automated testing pipeline. No continuous deployment. Security scanning not automated. Performance monitoring missing. | HIGH - Quality assurance and deployment efficiency at risk. | L | H | P1 |
| **Testing Coverage** | Manual testing documented. No automated testing framework implemented. | Comprehensive unit tests for hooks/components, e2e tests for user flows, integration tests, and test coverage reporting. | No testing framework implemented. No unit tests, e2e tests, or coverage reporting. Manual testing only. | HIGH - Code quality and reliability not ensured. No regression testing. | M | H | P1 |
| **Observability** | Basic debug HUD exists for development. No production monitoring implemented. | Basic metrics collection, error reporting, performance monitoring, and user analytics with real-time dashboards. | No production monitoring. No error tracking. No user analytics. No performance metrics collection. | MEDIUM - Unable to monitor system health or user behavior. | M | M | P2 |
| **Content/Assets pipeline** | Soundpack structure exists with manifest.json. Three basic soundpacks available. | Versioned soundpacks/challenges with asset management, content delivery, version control, and automated content pipeline. | Content versioning system missing. Automated asset pipeline not implemented. Content delivery optimization needed. | MEDIUM - Content management and delivery not scalable. | M | M | P2 |
| **Agentic tooling** | CrewAI agents deployed but not integrated. Claude Code and Gemini CLI used manually. | Claude Code implementer, Manus.ai orchestrator, and automated AI tooling integration for development and content generation. | No integration between deployed agents and application. No automated AI workflows. Manual AI tooling only. | LOW - AI capabilities not leveraged for automation. | S | L | P3 |
| **Supabase functions + migrations** | Database schema created. Edge functions for CrewAI deployed. | Supabase functions with proper API endpoints, migration management, local environment parity, and production deployment. | API endpoints not implemented. Migration management incomplete. Local/parity environment issues. | HIGH - Backend functionality incomplete. Deployment consistency issues. | M | H | P2 |
| **Security/Secrets** | Environment variables documented. Basic security practices in place. | Secure environment handling, secret management, security audits, and compliance with best practices. | Secret rotation missing. Security monitoring not implemented. Compliance automation incomplete. | HIGH - Security vulnerabilities possible without proper secret management. | M | H | P1 |

---

## Current State Analysis

### ✅ COMPLETED FEATURES (Phase 1)
- **User Authentication System**: Complete Supabase-backed login, registration, and session management
- **Database Schema**: Comprehensive schema with RLS policies and type definitions
- **Core Feature Persistence**: Archetype quiz, festival voting, shuffle feed, marketplace, DJ settings
- **Profile Management**: User profiles with archetype selection and PLUR tracking
- **Basic UI Components**: FLX10Deck, LiveEqualizer, SoundPackLoader interfaces

### 🔄 CURRENTLY IN PROGRESS (Phase 2)
- **Audio Engine Implementation**: Web Audio API integration (structure exists, no real functionality)
- **Real-time Features**: Framework exists, not fully implemented
- **CrewAI Integration**: Agents deployed, not connected to application

### ❌ CRITICAL GAPS (High Priority)

#### 1. Audio Engine & DJ Mix Station
**Current State**: UI components exist but no real audio functionality
**Required Features**:
- True Web Audio API engine (no placeholders)
- Deck A/B real playback with crossfading
- Pitch control and echo effects
- Real-time waveform + BPM visualization
- Cross-browser compatibility (Chrome, Edge, Safari, Firefox)

**Gap Impact**: Core user experience cannot function without proper audio engine
**Priority**: CRITICAL (Blocks MVP)

#### 2. Festival Voting System
**Current State**: Database framework exists, no real-time updates
**Required Features**:
- Real-time vote count updates
- Live leaderboard with animations
- Enhanced voting UX flow
- Scheduling features for events

**Gap Impact**: Primary engagement feature is non-functional
**Priority**: HIGH

---

## Future State Vision

### 🎯 MVP TARGET (Phase 2-3)
1. **Fully Functional Audio Engine**: Real DJ mixing with visual feedback
2. **Live Voting System**: Real-time festival competitions and leaderboards
3. **Challenge Platform**: User-generated content with PLUR gamification
4. **Basic Community Features**: Chat, commenting, crew management
5. **Marketplace Foundation**: Product listings and payment processing

### 🚀 FULL FEATURE SET (Phase 4-8)
1. **Advanced Audio Features**: Professional mixing tools, effects, mastering
2. **Festival Integration**: External API connections, event management
3. **AI-Powered Features**: Content curation, personalization, moderation
4. **Marketing Framework**: Campaign management, automation, analytics
5. **Mobile Optimization**: Responsive design, native app preparation

---

## Technical Constraints & Considerations

### Current Technical Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Audio**: Web Audio API (planned), Howler.js (fallback)
- **Real-time**: Supabase Realtime (planned), WebSockets
- **Payments**: Stripe (planned)
- **Deployment**: Netlify, Supabase Hosting
- **AI Tooling**: Claude Code, Gemini CLI, CrewAI (partially deployed)

### Known Limitations
1. **Audio API**: Cross-browser compatibility issues
2. **File Upload**: Size limits and validation requirements
3. **Real-time**: Connection stability and offline handling
4. **Payments**: PCI compliance and security requirements
5. **Performance**: Scalability for concurrent users
6. **Mobile**: Touch controls and responsive design challenges

### Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Audio API failures | Medium | High | Fallback simulation mode |
| Payment processing issues | Low | Critical | Thorough testing, monitoring |
| Real-time connection loss | High | Medium | Graceful degradation, retry logic |
| File upload failures | Medium | Medium | Client-side validation, progress tracking |
| Database performance | Low | High | Indexing, query optimization |
| Security vulnerabilities | Medium | Critical | Regular audits, secret rotation |

---

## Success Metrics & Validation

### MVP Success Criteria
1. **Audio Engine**: Real-time mixing with visual feedback (audible + visible)
2. **Voting System**: 1000+ test votes with real-time updates
3. **Challenge Platform**: 100+ user submissions with proper validation
4. **Community**: 50+ active users in chat/crew features
5. **Marketplace**: 10+ successful test transactions

### Quality Gates
- **Code Quality**: 90%+ test coverage, no linting errors
- **Performance**: 95%+ Lighthouse score, <2s load time
- **Security**: No vulnerabilities in security scans
- **Accessibility**: WCAG 2.1 AA compliance
- **Documentation**: All features documented in FRS/PRD

---

## Action Plan

### Immediate Actions (This Week)
1. **Prioritize Audio Engine**: Begin Web Audio API implementation
2. **Set Up Testing Framework**: Jest, Playwright, Cypress
3. **Create Validation Scripts**: Automated feature verification
4. **Update Documentation**: Reflect current state and gaps

### Short-term Goals (Next 2 Weeks)
1. **Complete Audio Engine**: Basic mixing functionality
2. **Implement Voting System**: Core voting logic with real-time updates
3. **Build Challenge UI**: Basic submission interface
4. **Add Real-time Features**: Live updates and notifications

### Medium-term Goals (Next Month)
1. **Integrate Payments**: Stripe checkout flow
2. **Enhance Community**: Chat and crew features
3. **Admin Dashboard**: Basic management tools
4. **Performance Optimization**: Load times and scalability

---

## Dependencies & Prerequisites

### External Dependencies
- **Supabase**: Database, auth, storage, real-time (partially implemented)
- **Stripe**: Payment processing (test keys first)
- **File Upload**: Client-side validation, progress tracking
- **CDN**: Asset delivery and optimization

### Internal Dependencies
- **Authentication System**: Required for all user features ✅
- **Database Schema**: Foundation for all data storage ✅
- **Type Definitions**: TypeScript safety and developer experience ✅
- **Component Library**: Consistent UI/UX across features ✅

---

## Monitoring & Maintenance

### Performance Monitoring
- **Real-time Metrics**: User activity, feature usage
- **Error Tracking**: Exception handling and alerts
- **Load Testing**: Concurrent user simulation
- **Database Monitoring**: Query performance and optimization

### Maintenance Schedule
- **Daily**: System health checks, error logs
- **Weekly**: Performance review, feature updates
- **Monthly**: Security patches, dependency updates
- **Quarterly**: Architecture review, scaling assessment

---

## Conclusion

The EDM Shuffle project has a solid foundation with completed authentication and database systems, but significant gaps remain in core functionality. The audio engine and voting system are critical for MVP and must be prioritized immediately. The project has clear technical direction and comprehensive documentation, but requires focused implementation to deliver on the promised user experience.

**Next Steps**: Begin Phase 2 implementation with audio engine and voting system, while establishing robust testing and validation processes to ensure feature integrity.

---

*This document will be updated weekly to reflect progress, new gaps, and changing priorities. Last reviewed: 2025-08-09*


/Users/kfitz/EDM Shuffle/rave-pulse-flow/OSS_CANDIDATES.md
# EDM Shuffle - OSS Tool Candidates

## Overview

This document outlines free and open-source software (OSS) candidates for the EDM Shuffle agentic tooling ecosystem. Each tool includes installation instructions, usage steps, and risk assessments to help with tool selection and integration.

## Tool Categories

### 1. Code Search and Analysis

#### Ripgrep (ripgrep)
**Description**: Fast, line-oriented search tool that respects gitignore files
**License**: MIT
**Website**: https://github.com/BurntSushi/ripgrep

**Installation**:
```bash
# macOS (using Homebrew)
brew install ripgrep

# Ubuntu/Debian
sudo apt update && sudo apt install ripgrep

# Windows (using Scoop)
scoop install ripgrep

# Using npm (package)
npm install -g ripgrep
```

**Usage Steps**:
```bash
# Basic search in current directory
rg "audio" --type ts

# Search with context lines
rg "audio" --type ts -A 3 -B 3

# Search in specific directories
rg "audio" src/ --type ts

# Case-insensitive search
rg "Audio" --type ts -i

# Search with file exclusion
rg "audio" --type ts -- "!node_modules"
```

**Risk Assessment**:
- **Security Risk**: LOW - No network access, local file only
- **Performance Impact**: LOW - Very fast, minimal resource usage
- **Reliability**: HIGH - Well-maintained, widely used
- **Maintenance**: LOW - Minimal configuration needed
- **Integration Risk**: LOW - Simple CLI interface, easy to automate

---

#### Ctags (Universal Ctags)
**Description**: Source code index generator for code navigation
**License**: MIT
**Website**: https://github.com/universal-ctags/ctags

**Installation**:
```bash
# macOS (using Homebrew)
brew install universal-ctags

# Ubuntu/Debian
sudo apt update && sudo apt install universal-ctags

# Windows (using Scoop)
scoop install universal-ctags
```

**Usage Steps**:
```bash
# Generate tags for project
ctags -R .

# Generate tags with specific file types
ctags -R --languages=TypeScript,JavaScript

# Update existing tags
ctags -R -a

# Search for symbol definitions
ctags -n "AudioEngine"

# Generate tags for specific directories
ctags -R src/ supabase/
```

**Risk Assessment**:
- **Security Risk**: LOW - Local file processing only
- **Performance Impact**: MEDIUM - Can be resource intensive on large codebases
- **Reliability**: HIGH - Mature technology, well-established
- **Maintenance**: MEDIUM - Requires regular updates for language support
- **Integration Risk**: MEDIUM - More complex configuration than ripgrep

---

#### Comby
**Description**: Structural code search and refactoring tool
**License**: BSD-2-Clause
**Website**: https://comby.dev

**Installation**:
```bash
# macOS (using Homebrew)
brew install comby

# Linux (binary download)
curl -L https://github.com/comby-tools/comby/releases/latest/download/comby-linux-x64 -o comby
chmod +x comby
sudo mv comby /usr/local/bin/

# Using npm (package)
npm install -g comby
```

**Usage Steps**:
```bash
# Basic structural search
comby "function [f]([x])" "function [f]([y])" --language typescript

# Search with file patterns
comby "console.log([s])" "logger.info([s])" --directory src/

# Search and replace with dry-run
comby "oldFunction" "newFunction" --dry-run

# Search with specific file types
comby "import [m] from '[p]'" "import [m] from './[p]'" --language typescript

# Generate rules file
comby --rules > comby_rules.json
```

**Risk Assessment**:
- **Security Risk**: LOW - Local file processing only
- **Performance Impact**: MEDIUM - Can be slow on large codebases
- **Reliability**: MEDIUM - Newer tool, evolving rapidly
- **Maintenance**: MEDIUM - Requires rule maintenance and updates
- **Integration Risk**: HIGH - Complex syntax, requires learning curve

### 2. Testing Frameworks

#### Vitest
**Description**: Fast unit testing framework with Vite-powered instant feedback
**License**: MIT
**Website**: https://vitest.dev

**Installation**:
```bash
# Install as dev dependency
npm install -D vitest

# Install with TypeScript support
npm install -D vitest @vitest/ui vitest-tsconfig-paths

# Install with coverage support
npm install -D vitest @vitest/ui vitest-tsconfig-paths c8
```

**Usage Steps**:
```bash
# Add to package.json scripts
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests with watch mode
npm test -- --watch

# Run tests with specific file
npm test -- src/components/audio-ui.test.ts
```

**Configuration** (vitest.config.ts):
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vitest-tsconfig-paths'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  plugins: [tsconfigPaths()],
})
```

**Risk Assessment**:
- **Security Risk**: LOW - Local test execution only
- **Performance Impact**: LOW - Very fast test execution
- **Reliability**: HIGH - Actively maintained, growing community
- **Maintenance**: LOW - Minimal configuration, auto-detection
- **Integration Risk**: LOW - Drop-in replacement for Jest

---

#### Playwright
**Description**: Modern E2E testing framework for web applications
**License**: Apache 2.0
**Website**: https://playwright.dev

**Installation**:
```bash
# Install as dev dependency
npm install -D @playwright/test

# Install browsers
npx playwright install

# Install browsers with specific versions
npx playwright install --with-deps
```

**Usage Steps**:
```bash
# Add to package.json scripts
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed"

# Run E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# Run tests with specific file
npm run test:e2e -- src/tests/audio-player.spec.ts

# Run tests with specific browser
npm run test:e2e -- --browser=chromium
```

**Configuration** (playwright.config.ts):
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

**Risk Assessment**:
- **Security Risk**: LOW - Local test execution only
- **Performance Impact**: MEDIUM - Browser automation can be resource intensive
- **Reliability**: HIGH - Excellent browser compatibility
- **Maintenance**: MEDIUM - Requires browser updates and maintenance
- **Integration Risk**: LOW - Well-documented, good TypeScript support

---

#### Testing Library
**Description**: Simple and complete testing utilities that encourage good practices
**License**: MIT
**Website**: https://testing-library.com

**Installation**:
```bash
# Install React Testing Library
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Install for other frameworks
npm install -D @testing-library/vue @testing-library/svelte
```

**Usage Steps**:
```typescript
// Basic component test
import { render, screen } from '@testing-library/react'
import { AudioPlayer } from './AudioPlayer'

test('renders audio player', () => {
  render(<AudioPlayer />)
  expect(screen.getByRole('audio')).toBeInTheDocument()
})

// User interaction test
import userEvent from '@testing-library/user-event'
test('handles play button click', async () => {
  const user = userEvent.setup()
  render(<AudioPlayer />)
  const playButton = screen.getByRole('button', { name: /play/i })
  await user.click(playButton)
  expect(mockPlay).toHaveBeenCalled()
})
```

**Risk Assessment**:
- **Security Risk**: LOW - Local test execution only
- **Performance Impact**: LOW - Minimal overhead
- **Reliability**: HIGH - Well-established, widely adopted
- **Maintenance**: LOW - Stable API, minimal changes
- **Integration Risk**: LOW - Easy to integrate with existing test setups

### 3. Security Tools

#### npm Audit
**Description**: Security vulnerability scanner for Node.js dependencies
**License**: Custom (Open Source)
**Website**: https://docs.npmjs.com/cli/audit

**Installation**:
```bash
# Already included with npm
npm install -g npm
```

**Usage Steps**:
```bash
# Run audit check
npm audit

# Run audit with fix
npm audit fix

# Run audit with fix for breaking changes
npm audit fix --force

# Run audit and output to file
npm audit --json > audit-report.json

# Run audit in CI environment
npm audit --audit-level moderate
```

**Risk Assessment**:
- **Security Risk**: LOW - Local scanning only
- **Performance Impact**: LOW - Fast execution
- **Reliability**: HIGH - Official npm tool
- **Maintenance**: LOW - Automatically updated with npm
- **Integration Risk**: LOW - Built-in npm functionality

---

#### Lockfile Lint
**Description**: Validate and lint lockfiles for security and consistency
**License**: MIT
**Website**: https://github.com/mysticateule/lockfile-lint

**Installation**:
```bash
# Install as dev dependency
npm install -D lockfile-lint

# Install globally
npm install -g lockfile-lint
```

**Usage Steps**:
```bash
# Basic lockfile validation
lockfile-lint --path package-lock.json

# Validate with specific rules
lockfile-lint --path package-lock.json --validate-https

# Validate with custom rules
lockfile-lint --path package-lock.json --allowed-hosts npm

# Generate configuration file
lockfile-lint --init

# Run with configuration file
lockfile-lint --config .lockfile-lint.json
```

**Configuration** (.lockfile-lint.json):
```json
{
  "extends": ["npm"],
  "rules": {
    "package-manager": "npm",
    "allowed-hosts": ["npm"],
    "validate-https": true,
    "validate-integrity": true
  }
}
```

**Risk Assessment**:
- **Security Risk**: LOW - Local file validation only
- **Performance Impact**: LOW - Fast execution
- **Reliability**: HIGH - Well-maintained, focused tool
- **Maintenance**: MEDIUM - Requires rule updates for new npm features
- **Integration Risk**: LOW - Simple configuration, easy to automate

---

#### ESLint Security Plugin
**Description**: ESLint plugin with security rules
**License**: MIT
**Website**: https://github.com/nodesecurity/eslint-plugin-security

**Installation**:
```bash
# Install as dev dependency
npm install -D eslint eslint-plugin-security
```

**Usage Steps**:
```javascript
// Configuration (.eslintrc.js)
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'error'
  }
}
```

**Risk Assessment**:
- **Security Risk**: LOW - Static analysis only
- **Performance Impact**: LOW - Minimal overhead
- **Reliability**: HIGH - Well-established security rules
- **Maintenance**: MEDIUM - Requires updates for new security patterns
- **Integration Risk**: LOW - Easy integration with existing ESLint setup

### 4. Performance Tools

#### Vite Plugin Analysis
**Description**: Vite plugin for bundle analysis and optimization
**License**: MIT
**Website**: https://github.com/antfu/vite-plugin-analysis

**Installation**:
```bash
# Install as dev dependency
npm install -D vite-plugin-analysis
```

**Usage Steps**:
```javascript
// Configuration (vite.config.ts)
import { defineConfig } from 'vite'
import analysis from 'vite-plugin-analysis'

export default defineConfig({
  plugins: [
    analysis({
      // Output directory for reports
      outputDir: 'analysis',
      // Report format
      reportFormats: ['json', 'html'],
      // Bundle size threshold
      maxSize: '100kb'
    })
  ]
})
```

**Risk Assessment**:
- **Security Risk**: LOW - Local analysis only
- **Performance Impact**: LOW - Minimal overhead during build
- **Reliability**: HIGH - Well-maintained, actively developed
- **Maintenance**: LOW - Minimal configuration needed
- **Integration Risk**: LOW - Simple Vite plugin integration

---

#### Lighthouse
**Description**: Automated tool for improving the quality of web pages
**License**: Apache 2.0
**Website**: https://developers.google.com/web/tools/lighthouse

**Installation**:
```bash
# Install globally
npm install -g lighthouse

# Install as dev dependency
npm install -D lighthouse
```

**Usage Steps**:
```bash
# Run Lighthouse from command line
lighthouse http://localhost:3000 --output-path=./lighthouse-report.html

# Run with specific categories
lighthouse http://localhost:3000 --categories=performance,accessibility --output-path=./report.html

# Run with Chrome debugging port
lighthouse http://localhost:3000 --port=9222 --output-path=./report.html

# Run programmatically
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
```

**Risk Assessment**:
- **Security Risk**: LOW - Local analysis only
- **Performance Impact**: MEDIUM - Can be resource intensive
- **Reliability**: HIGH - Google maintained, comprehensive
- **Maintenance**: MEDIUM - Regular updates needed
- **Integration Risk**: MEDIUM - More complex setup, requires web server

## Tool Selection Matrix

| Tool | Category | Security Risk | Performance | Reliability | Maintenance | Integration Risk | Overall Score |
|------|----------|---------------|-------------|-------------|-------------|------------------|---------------|
| Ripgrep | Code Search | LOW | HIGH | HIGH | LOW | LOW | 9/10 |
| Ctags | Code Search | LOW | MEDIUM | HIGH | MEDIUM | MEDIUM | 7/10 |
| Comby | Code Search | LOW | MEDIUM | MEDIUM | MEDIUM | HIGH | 5/10 |
| Vitest | Testing | LOW | HIGH | HIGH | LOW | LOW | 9/10 |
| Playwright | Testing | LOW | MEDIUM | HIGH | MEDIUM | LOW | 8/10 |
| Testing Library | Testing | LOW | HIGH | HIGH | LOW | LOW | 9/10 |
| npm Audit | Security | LOW | HIGH | HIGH | LOW | LOW | 9/10 |
| Lockfile Lint | Security | LOW | HIGH | HIGH | MEDIUM | LOW | 8/10 |
| ESLint Security | Security | LOW | HIGH | HIGH | MEDIUM | LOW | 8/10 |
| Vite Analysis | Performance | LOW | HIGH | HIGH | LOW | LOW | 9/10 |
| Lighthouse | Performance | LOW | MEDIUM | HIGH | MEDIUM | MEDIUM | 7/10 |

## Recommended Tool Stack

### Core Tools (High Priority)
1. **Ripgrep** - Fast code search and analysis
2. **Vitest** - Unit testing with excellent performance
3. **Testing Library** - Component testing utilities
4. **npm Audit** - Security vulnerability scanning
5. **ESLint Security Plugin** - Static security analysis
6. **Vite Plugin Analysis** - Bundle optimization

### Optional Tools (Medium Priority)
1. **Ctags** - Advanced code navigation
2. **Lockfile Lint** - Lockfile validation
3. **Playwright** - E2E testing (if needed)
4. **Lighthouse** - Performance optimization

### Tools to Avoid
1. **Comby** - High complexity and integration risk

## Implementation Strategy

### Phase 1: Core Tooling (Week 1-2)
1. Install and configure Ripgrep
2. Set up Vitest with TypeScript support
3. Implement Testing Library integration
4. Configure npm audit in CI pipeline
5. Set up ESLint Security Plugin

### Phase 2: Enhanced Tooling (Week 3-4)
1. Install Ctags for advanced navigation
2. Configure Lockfile Lint
3. Set up Vite Plugin Analysis
4. Implement Playwright for E2E testing (if needed)
5. Configure Lighthouse for performance monitoring

### Phase 3: Optimization (Week 5-6)
1. Fine-tune all tool configurations
2. Optimize CI/CD pipeline integration
3. Implement custom rules and plugins
4. Create comprehensive documentation
5. Establish monitoring and alerting

## Risk Mitigation

### Security Considerations
- All tools are local-only with no network access
- Regular updates to address security vulnerabilities
- Audit tool configurations for potential security issues
- Monitor tool dependencies for security updates

### Performance Considerations
- Schedule resource-intensive tasks during off-peak hours
- Implement caching where possible
- Monitor tool performance and optimize configurations
- Set up resource limits for CI/CD pipelines

### Reliability Considerations
- Regular tool updates and maintenance
- Comprehensive testing of tool integrations
- Fallback mechanisms for critical tools
- Monitoring and alerting for tool failures

## Monitoring and Maintenance

### Update Schedule
- **Weekly**: Check for security updates
- **Monthly**: Review tool performance and configuration
- **Quarterly**: Evaluate new tools and technologies
- **Annually**: Major tool version upgrades

### Performance Monitoring
- Track tool execution times
- Monitor resource usage
- Analyze false positives/negatives
- Optimize configurations based on usage patterns

### Security Monitoring
- Regular security audits of tool configurations
- Monitor for new security vulnerabilities
- Review tool permissions and access
- Implement security best practices

---

*Last Updated: 2025-08-09*
*Version: 1.0.0*


/Users/kfitz/EDM Shuffle/rave-pulse-flow/PRIORITIZED_ROADMAP.md

# EDM Shuffle - Prioritized Implementation Roadmap

## Overview
This roadmap prioritizes implementation based on impact vs effort, focusing on critical path items that block shipping/performance (P1), followed by feature uplift (P2), and finally nice-to-haves (P3). Priorities are based on the gap analysis and strategic objectives outlined in the project documentation.

---

## P1 (NOW) - Critical Path: Shipping & Performance

### 1.1 Web Audio Engine Implementation
**Problem**: Core user experience cannot function without proper audio engine. Current UI components (FLX10Deck, LiveEqualizer, SoundPackLoader) exist but have no real Web Audio API integration - audio is simulated/non-functional.

**Proposed Fix**: Implement complete Web Audio API engine with dual-deck mixing, crossfading, pitch control, echo effects, real-time waveform visualization, and mobile-optimized performance. Connect audio context, nodes, and real-time processing to existing UI components.

**Acceptance Criteria**:
- Real audio playback on both decks A/B with independent controls
- Functional crossfader with smooth audio transitions
- Pitch control and echo effects that actually modify audio
- Real-time waveform visualization linked to live frequency data
- Cross-browser compatibility (Chrome, Edge, Safari, Firefox)
- Mobile touch controls and responsive design
- Simulation mode with clear UI indicators when audio fails

**Tests to Add**:
- Unit tests for audio engine core functionality
- E2E tests for deck controls and mixing workflow
- Cross-browser compatibility tests
- Mobile touch interaction tests
- Audio context lifecycle tests

**Rollback Plan**:
- Revert to simulation mode with visual-only feedback
- Maintain existing UI components without audio functionality
- Preserve user preferences and settings
- Graceful degradation to placeholder audio system

**Est. Effort**: 3-4 weeks (High complexity, critical path)

### 1.2 Automated Testing Framework
**Problem**: No automated testing framework implemented. Code quality and reliability not ensured. No regression testing capability. Manual testing only creates quality assurance risks.

**Proposed Fix**: Implement comprehensive testing framework with Jest for unit tests, Playwright for E2E tests, integration tests, and test coverage reporting. Set up automated CI/CD pipeline with lint, typecheck, and test execution.

**Acceptance Criteria**:
- 90%+ test coverage for core functionality
- Unit tests for all hooks and components
- E2E tests for critical user flows
- Automated CI/CD pipeline integration
- Test coverage reporting and metrics
- No linting or TypeScript errors in tests

**Tests to Add**:
- Unit tests for authentication system
- Unit tests for audio engine components
- E2E tests for user registration/login flow
- E2E tests for audio mixing workflow
- Integration tests for database operations

**Rollback Plan**:
- Disable automated tests while maintaining test code
- Revert to manual testing process
- Preserve test infrastructure for future reactivation
- Maintain test coverage reports for historical reference

**Est. Effort**: 2-3 weeks (High impact, medium complexity)

### 1.3 Security & Secrets Management
**Problem**: Secret rotation missing. Security monitoring not implemented. Compliance automation incomplete. Security vulnerabilities possible without proper secret management.

**Proposed Fix**: Implement secure environment handling, secret rotation, security monitoring, and compliance automation. Set up automated security scanning and secret detection.

**Acceptance Criteria**:
- Automated secret detection and rotation
- Security scanning in CI/CD pipeline
- Environment variable validation
- Security audit logging
- Compliance with security best practices
- No hardcoded secrets in codebase

**Tests to Add**:
- Security vulnerability scanning tests
- Secret detection tests
- Environment validation tests
- Security audit trail tests

**Rollback Plan**:
- Revert to manual secret management
- Disable automated security scanning
- Maintain existing security practices
- Preserve security audit logs

**Est. Effort**: 1-2 weeks (High impact, medium complexity)

---

## P2 (NEXT) - Feature Uplift: Creator Tools & Marketplace

### 2.1 Real-time Festival Voting System
**Problem**: Primary engagement feature is non-functional without real-time updates. Database framework exists but no real-time vote count updates, live leaderboard, or enhanced voting UX flow.

**Proposed Fix**: Implement real-time voting system with Supabase Realtime, live vote count updates, animated leaderboards, enhanced voting UX flow, and scheduling features for events.

**Acceptance Criteria**:
- Real-time vote count updates across all clients
- Live leaderboard with animations and rankings
- Enhanced voting UX with visual feedback
- Festival scheduling and event management
- Anti-abuse measures and vote integrity
- Mobile-optimized voting interface

**Tests to Add**:
- Unit tests for voting logic
- E2E tests for voting workflow
- Real-time connection tests
- Vote integrity and anti-spam tests
- Mobile voting interface tests

**Rollback Plan**:
- Revert to static voting system
- Disable real-time updates
- Maintain vote data integrity
- Preserve user voting history

**Est. Effort**: 2-3 weeks (High impact, medium complexity)

### 2.2 Challenge Platform & PLUR Streaks
**Problem**: User engagement and content creation blocked without proper challenge system. Challenge submission UI and file upload missing. Real-time challenge updates and social features not implemented.

**Proposed Fix**: Build complete challenge platform with submission UI, file upload, real-time updates, PLUR points system, streak tracking, and social sharing features.

**Acceptance Criteria**:
- Challenge submission interface with file upload
- Real-time challenge updates and notifications
- PLUR points system and streak tracking
- Social sharing features
- Cheat-prevention measures
- Mobile-optimized challenge interface

**Tests to Add**:
- Unit tests for challenge logic
- E2E tests for submission workflow
- File upload validation tests
- Real-time challenge update tests
- PLUR points calculation tests

**Rollback Plan**:
- Revert to basic challenge framework
- Disable advanced features
- Maintain challenge data integrity
- Preserve user progress and streaks

**Est. Effort**: 2-3 weeks (High impact, medium complexity)

### 2.3 Marketplace Foundation & Stripe Integration
**Problem**: Monetization blocked without payment processing. Stripe payment integration missing. Product listings and e-commerce UI not implemented. Digital download system incomplete.

**Proposed Fix**: Implement complete soundpacks marketplace with Stripe integration, product listings, e-commerce UI, digital downloads, inventory management, and secure checkout flow.

**Acceptance Criteria**:
- Stripe payment processing integration
- Product listings and catalog management
- Secure checkout flow
- Digital download system
- Inventory management
- Mobile-optimized marketplace interface

**Tests to Add**:
- Unit tests for marketplace logic
- E2E tests for purchase workflow
- Stripe integration tests
- Digital download tests
- Payment security tests

**Rollback Plan**:
- Revert to basic marketplace framework
- Disable payment processing
- Maintain product data integrity
- Preserve purchase history

**Est. Effort**: 2-3 weeks (Medium impact, medium complexity)

### 2.4 Mobile Optimization & Accessibility
**Problem**: Excludes mobile users and doesn't meet accessibility standards. Touch controls for mobile missing. Accessibility features not implemented. Performance optimization for low-end devices needed.

**Proposed Fix**: Implement full mobile optimization with touch controls, accessibility compliance (WCAG 2.1 AA), low-end device support, and responsive design improvements.

**Acceptance Criteria**:
- Touch controls for mobile devices
- WCAG 2.1 AA compliance
- Responsive design for all screen sizes
- Performance optimization for low-end devices
- Accessibility features (screen readers, keyboard navigation)
- Mobile-first user experience

**Tests to Add**:
- Mobile responsiveness tests
- Accessibility compliance tests
- Touch interaction tests
- Performance tests on low-end devices
- Cross-device compatibility tests

**Rollback Plan**:
- Revert to desktop-only interface
- Disable mobile-specific features
- Maintain core functionality
- Preserve accessibility improvements

**Est. Effort**: 2-3 weeks (Medium impact, medium complexity)

### 2.5 Supabase Functions & API Endpoints
**Problem**: Backend functionality incomplete. API endpoints not implemented. Migration management incomplete. Local/parity environment issues.

**Proposed Fix**: Implement complete Supabase functions with proper API endpoints, migration management, local environment parity, and production deployment.

**Acceptance Criteria**:
- Complete API endpoints for all features
- Migration management system
- Local/production environment parity
- Proper error handling and validation
- API documentation
- Performance optimization

**Tests to Add**:
- Unit tests for API functions
- Integration tests for database operations
- API endpoint tests
- Migration validation tests
- Performance tests for API endpoints

**Rollback Plan**:
- Revert to basic API framework
- Disable advanced endpoints
- Maintain data integrity
- Preserve existing migrations

**Est. Effort**: 1-2 weeks (Medium impact, medium complexity)

---

## P3 (LATER) - Nice-to-Haves: Advanced Features

### 3.1 Advanced Visual FX & Animations
**Problem**: Basic visual effects exist but advanced features like professional lighting, particle systems, and dynamic backgrounds not implemented. Long-tail analytics missing for user engagement.

**Proposed Fix**: Implement advanced visual effects including professional lighting systems, particle effects, dynamic backgrounds, and comprehensive analytics for user engagement tracking.

**Acceptance Criteria**:
- Professional lighting and visual effects
- Advanced particle systems
- Dynamic background animations
- User engagement analytics
- Performance optimization for visual effects
- Customizable visual themes

**Tests to Add**:
- Performance tests for visual effects
- Compatibility tests across devices
- Animation quality tests
- Analytics tracking tests

**Rollback Plan**:
- Revert to basic visual effects
- Disable advanced animations
- Maintain core visual functionality
- Preserve basic analytics

**Est. Effort**: 2-3 weeks (Low impact, high complexity)

### 3.2 Agentic Tooling Integration
**Problem**: AI capabilities not leveraged for automation. No integration between deployed agents and application. No automated AI workflows. Manual AI tooling only.

**Proposed Fix**: Integrate Claude Code implementer, Manus.ai orchestrator, and automated AI tooling for development and content generation workflows.

**Acceptance Criteria**:
- Automated AI development workflows
- Content generation integration
- Agent deployment automation
- AI-powered feature suggestions
- Development efficiency improvements
- Quality enhancement through AI

**Tests to Add**:
- AI workflow integration tests
- Content generation quality tests
- Agent performance tests
- Development efficiency metrics

**Rollback Plan**:
- Revert to manual AI tooling
- Disable automated workflows
- Maintain existing AI agents
- Preserve development tools

**Est. Effort**: 2-3 weeks (Low impact, high complexity)

### 3.3 Long-tail Analytics & Observability
**Problem**: Unable to monitor system health or user behavior comprehensively. No production monitoring. No error tracking. No user analytics. No performance metrics collection.

**Proposed Fix**: Implement comprehensive monitoring with basic metrics collection, error reporting, performance monitoring, and user analytics with real-time dashboards.

**Acceptance Criteria**:
- Real-time system monitoring
- Error tracking and reporting
- User behavior analytics
- Performance metrics collection
- Real-time dashboards
- Alert system for critical issues

**Tests to Add**:
- Monitoring system tests
- Error tracking tests
- Analytics accuracy tests
- Performance monitoring tests

**Rollback Plan**:
- Revert to basic monitoring
- Disable advanced analytics
- Maintain essential metrics
- Preserve error logs

**Est. Effort**: 1-2 weeks (Low impact, medium complexity)

---

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-4)
- Complete Web Audio Engine implementation
- Set up automated testing framework
- Implement security & secrets management

### Phase 2: Core Features (Weeks 5-8)
- Real-time festival voting system
- Challenge platform & PLUR streaks
- Marketplace foundation & Stripe integration

### Phase 3: Polish & Optimization (Weeks 9-12)
- Mobile optimization & accessibility
- Supabase functions & API endpoints
- Advanced visual FX & animations

### Phase 4: Advanced Features (Weeks 13-16)
- Agentic tooling integration
- Long-tail analytics & observability

## Success Metrics

### Quality Gates
- **Code Quality**: 90%+ test coverage, no linting errors
- **Performance**: 95%+ Lighthouse score, <2s load time
- **Security**: No vulnerabilities in security scans
- **Accessibility**: WCAG 2.1 AA compliance
- **Documentation**: All features documented in FRS/PRD

### MVP Success Criteria
- **Audio Engine**: Real-time mixing with visual feedback (audible + visible)
- **Voting System**: 1000+ test votes with real-time updates
- **Challenge Platform**: 100+ user submissions with proper validation
- **Marketplace**: 10+ successful test transactions
- **Mobile**: Full functionality on mobile devices

---

*This roadmap will be updated weekly to reflect progress, new requirements, and changing priorities. Last reviewed: 2025-08-09*

/Users/kfitz/EDM Shuffle/rave-pulse-flow/REPO_TREE.md
.
├── A-mem
│   ├── agentic_memory
│   │   ├── __init__.py
│   │   ├── llm_controller.py
│   │   ├── memory_system.py
│   │   └── retrievers.py
│   ├── agentic_memory.egg-info
│   │   ├── dependency_links.txt
│   │   ├── PKG-INFO
│   │   ├── requires.txt
│   │   ├── SOURCES.txt
│   │   └── top_level.txt
│   ├── Figure
│   │   ├── framework.jpg
│   │   ├── intro-a.jpg
│   │   └── intro-b.jpg
│   ├── LICENSE
│   ├── pyproject.toml
│   ├── README.md
│   ├── requirements.txt
│   └── tests
│       ├── __init__.py
│       ├── test_memory_system.py
│       └── test_utils.py
├── agent
│   ├── config.ts
│   ├── deploy.ts
│   ├── main.ts
│   ├── types.ts
│   └── validation.ts
├── agents_fixed.py
├── agents.py
├── AUDIO_UI_COMPONENTS.md
├── audit-ci.json
├── audit-js.json
├── audit-sec.json
├── audit-secrets.json
├── bun.lockb
├── check_a_mem.py
├── CLAUDE_INTEGRITY_RULES.md
├── CLAUDE.md
├── claudeupdate.md
├── components.json
├── crew_deployment.sql
├── crew.py
├── CrewAI-README.md
├── deploy.sh
├── deployment_summary.md
├── edm-shuffle-output-docs
│   ├── ChatGPT_EDM Shuffle - EDM Shuffle CodeMax Strategy..._2025-07-29_12-25-41.md
│   ├── Download EDMShuffle_Jules_AuditPrompt.md
│   ├── Download Ultra-Minified Version
│   ├── EDM Shuffle_ Professional Development Manual.docx
│   ├── EDM Shuffle_ Professional Development Manual.md
│   ├── EDM_Shuffle_Manual_MINIFIED.md
│   ├── edm-shuffle-output-docs
│   │   ├── 1-executive-summary-vision.md
│   │   ├── 1-executive-summary.md
│   │   ├── 2-authoritative-project-roadmap-development-phases-milestones.md
│   │   ├── 2-documentation-index.md
│   │   ├── 3-document-index-root-directory.md
│   │   ├── 3-prd-product-requirements-document.md
│   │   ├── 4-frs-functional-requirements-specification.md
│   │   ├── 4-prompt-catalog.md
│   │   ├── 5-feature-gap-analysis.md
│   │   ├── 5-implementation-roadmap.md
│   │   ├── 6-phase-by-phase-features-prompts-tasks.md
│   │   ├── 7-admin-docs.md
│   │   ├── 7-feature-matrix-gap-analysis.md
│   │   ├── 8-built-in-marketing-framework.md
│   │   ├── 8-change-log-claudeupdate-md.md
│   │   ├── agent-hand-off-notes.md
│   │   ├── changelog-recent-history.md
│   │   ├── claude_integrity_rules.md
│   │   ├── claude.md
│   │   ├── current-overall-status.md
│   │   ├── documentation_index.md
│   │   ├── edm-shuffle-development-manual-master-blueprint.md
│   │   ├── edm-shuffle-professional-development-manual.md
│   │   ├── how-to-use-this-file.md
│   │   ├── memory-context-note-for-next-llm.md
│   │   ├── phase-1-core-infrastructure-theming-initial-scaffolding-user-authentication.md
│   │   ├── phase-1-user-authentication-account-system-full-user-journey.md
│   │   ├── phase-1-user-authentication-account-system.md
│   │   ├── phase-2-audio-engine-mix-station.md
│   │   ├── phase-3-voting-festival-scheduling.md
│   │   ├── phase-4-challenges-social.md
│   │   ├── phase-5-marketplace.md
│   │   ├── phase-6-community-crews.md
│   │   ├── phase-7-admin-docs.md
│   │   ├── phase-8-built-in-marketing-framework.md
│   │   └── reality-audit-placeholder-disclosure.md
│   └── edmshuffle_features.docx
├── edmshufflelogoprompts.docx
├── eslint.config.js
├── FLX10_VALIDATION_LOG.md
├── FRS.md
├── gemini.md
├── IMPLEMENTATION_MICROTASKS.md
├── index.html
├── MASTERPLAN.md
├── memlog_session.md
├── package-lock.json
├── package.json
├── postcss.config.js
├── PRD.md
├── production_checklist.md
├── project_overview.md
├── public
│   ├── audio
│   │   └── README.md
│   ├── challenges
│   │   └── daily-quests.json
│   ├── favicon.svg
│   ├── placeholder.svg
│   ├── robots.txt
│   └── soundpacks
│       ├── bass-drops
│       ├── edm-essentials
│       ├── house-vibes
│       ├── manifest.json
│       └── README.md
├── rave-pulse-flow.git
│   ├── config
│   ├── description
│   ├── HEAD
│   ├── hooks
│   │   ├── applypatch-msg.sample
│   │   ├── commit-msg.sample
│   │   ├── fsmonitor-watchman.sample
│   │   ├── post-update.sample
│   │   ├── pre-applypatch.sample
│   │   ├── pre-commit.sample
│   │   ├── pre-merge-commit.sample
│   │   ├── pre-push.sample
│   │   ├── pre-rebase.sample
│   │   ├── pre-receive.sample
│   │   ├── prepare-commit-msg.sample
│   │   ├── push-to-checkout.sample
│   │   ├── sendemail-validate.sample
│   │   └── update.sample
│   ├── info
│   │   ├── exclude
│   │   └── refs
│   ├── objects
│   │   ├── info
│   │   │   ├── commit-graph
│   │   │   └── packs
│   │   └── pack
│   │       ├── pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.bitmap
│   │       ├── pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.idx
│   │       ├── pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.pack
│   │       └── pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.rev
│   ├── packed-refs
│   └── refs
│       ├── heads
│       │   └── jules
│       └── tags
├── README.md
├── REPO_TREE.md
├── requirements-minimal.txt
├── requirements.txt
├── scripts
│   ├── memlog.py
│   └── query_memory.py
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── components
│   │   ├── ArchetypeAuraMeter.tsx
│   │   ├── ArchetypeRevealCeremony.tsx
│   │   ├── ArtistSpotlightCarousel.tsx
│   │   ├── audio-ui
│   │   │   ├── BpmAura.tsx
│   │   │   ├── ConfettiBurst.tsx
│   │   │   ├── Crossfader.tsx
│   │   │   ├── CrowdFXLayer.tsx
│   │   │   ├── DebugHUD.tsx
│   │   │   ├── DJDeck.tsx
│   │   │   ├── EnhancedDebugHUD.tsx
│   │   │   ├── EnhancedDJDeck.tsx
│   │   │   ├── EnhancedWaveformVisualizer.tsx
│   │   │   ├── MiniPlayer.tsx
│   │   │   ├── SubscribeBanner.tsx
│   │   │   ├── SubscribeModal.tsx
│   │   │   ├── TrackSelectModal.tsx
│   │   │   ├── VoiceControlPanel.tsx
│   │   │   └── WaveformVisualizer.tsx
│   │   ├── AudioEqualizerDemo.tsx
│   │   ├── auth
│   │   │   ├── AuthForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── AvatarSummonModal.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── DJExpertAgent.tsx
│   │   ├── EqualizerBars.tsx
│   │   ├── EqualizerLive.tsx
│   │   ├── FloatingSneakers.tsx
│   │   ├── FLX10Deck.tsx
│   │   ├── FLX10DeckPro.tsx
│   │   ├── LaserRaveBackground.tsx
│   │   ├── LiveEqualizer.tsx
│   │   ├── NeonButton.tsx
│   │   ├── ParticleBurstAnimation.tsx
│   │   ├── PLURcrewSidebar.tsx
│   │   ├── PLUROrbsAnimation.tsx
│   │   ├── PLURstreakMeter.tsx
│   │   ├── ProfessionalDJStation.tsx
│   │   ├── QuizBackgroundAnimation.tsx
│   │   ├── RSSFeedStreamer.tsx
│   │   ├── ScrollHintArrow.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── ShuffleChallenge.tsx
│   │   ├── ShuffleDancers.tsx
│   │   ├── SimpleDJStation.tsx
│   │   ├── SoundPackLoader.tsx
│   │   ├── ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── use-toast.ts
│   │   ├── VibePreview.tsx
│   │   └── VisualFX
│   │       ├── ArchetypeAuraSprite.tsx
│   │       ├── DroneFormations.tsx
│   │       ├── FestivalEnvironment.tsx
│   │       ├── FestivalStageBackground.tsx
│   │       ├── LightSyncPulse.tsx
│   │       └── ShuffleDancers.tsx
│   ├── contexts
│   │   ├── AudioContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAudioEngine.ts
│   │   ├── useAudioPlayer.ts
│   │   ├── useRealAudioEngine.ts
│   │   ├── useTTS.ts
│   │   └── useVoiceCommands.ts
│   ├── index.css
│   ├── lib
│   │   ├── challengeSystem.ts
│   │   ├── database.ts
│   │   ├── existsIntegration.ts
│   │   ├── professionalAudioEngine.ts
│   │   ├── stripe.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── main.tsx
│   ├── pages
│   │   ├── ArchetypeQuiz.tsx
│   │   ├── DJMixStation.tsx
│   │   ├── FestivalVotingStage.tsx
│   │   ├── Index.tsx
│   │   ├── MarketplaceGrid.tsx
│   │   ├── NotFound.tsx
│   │   ├── ProfessionalDJStationPage.tsx
│   │   ├── Profile.tsx
│   │   ├── ShuffleChallengePage.tsx
│   │   └── ShuffleFeed.tsx
│   ├── utils
│   │   └── audioGenerator.ts
│   └── vite-env.d.ts
├── supabase
│   ├── config.toml
│   ├── functions
│   │   ├── crew-status
│   │   │   └── index.ts
│   │   └── plan-festival
│   │       └── index.ts
│   └── migrations
│       └── 20250126_shuffle_challenges.sql
├── supabase-schema.sql
├── tailwind.config.ts
├── technical_architecture.md
├── tools.py
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── UI_UX_STRUCTURE.md
├── utils
│   └── a_mem_logger.py
├── venv_crewai
│   ├── bin
│   │   ├── activate
│   │   ├── activate.csh
│   │   ├── activate.fish
│   │   ├── Activate.ps1
│   │   ├── black
│   │   ├── blackd
│   │   ├── chroma
│   │   ├── coloredlogs
│   │   ├── crewai
│   │   ├── distro
│   │   ├── dotenv
│   │   ├── dumppdf.py
│   │   ├── f2py
│   │   ├── flake8
│   │   ├── hf
│   │   ├── httpx
│   │   ├── huggingface-cli
│   │   ├── humanfriendly
│   │   ├── instructor
│   │   ├── ipython
│   │   ├── ipython3
│   │   ├── isympy
│   │   ├── jsonschema
│   │   ├── litellm
│   │   ├── litellm-proxy
│   │   ├── markdown-it
│   │   ├── normalizer
│   │   ├── numpy-config
│   │   ├── onnxruntime_test
│   │   ├── openai
│   │   ├── pdf2txt.py
│   │   ├── pdfplumber
│   │   ├── pip
│   │   ├── pip3
│   │   ├── pip3.13
│   │   ├── py.test
│   │   ├── pybase64
│   │   ├── pycodestyle
│   │   ├── pyflakes
│   │   ├── pygmentize
│   │   ├── pyjson5
│   │   ├── pypdfium2
│   │   ├── pyproject-build
│   │   ├── pyrsa-decrypt
│   │   ├── pyrsa-encrypt
│   │   ├── pyrsa-keygen
│   │   ├── pyrsa-priv2pub
│   │   ├── pyrsa-sign
│   │   ├── pyrsa-verify
│   │   ├── pytest
│   │   ├── python -> python3.13
│   │   ├── python3 -> python3.13
│   │   ├── python3.13 -> /opt/homebrew/opt/python@3.13/bin/python3.13
│   │   ├── tests
│   │   ├── tiny-agents
│   │   ├── tqdm
│   │   ├── typer
│   │   ├── uv
│   │   ├── uvicorn
│   │   ├── uvx
│   │   ├── watchfiles
│   │   ├── websockets
│   │   └── wsdump
│   ├── include
│   │   └── python3.13
│   ├── lib
│   │   └── python3.13
│   │       └── site-packages
│   │           ├── _black_version.py
│   │           ├── _cffi_backend.cpython-313-darwin.so
│   │           ├── _pytest
│   │           ├── _yaml
│   │           ├── 30fcd23745efe32ce681__mypyc.cpython-313-darwin.so
│   │           ├── aiohappyeyeballs
│   │           ├── aiohappyeyeballs-2.6.1.dist-info
│   │           ├── aiohttp
│   │           ├── aiohttp-3.12.14.dist-info
│   │           ├── aiosignal
│   │           ├── aiosignal-1.4.0.dist-info
│   │           ├── annotated_types
│   │           ├── annotated_types-0.7.0.dist-info
│   │           ├── anyio
│   │           ├── anyio-4.9.0.dist-info
│   │           ├── appdirs-1.4.4.dist-info
│   │           ├── appdirs.py
│   │           ├── asttokens
│   │           ├── asttokens-3.0.0.dist-info
│   │           ├── attr
│   │           ├── attrs
│   │           ├── attrs-25.3.0.dist-info
│   │           ├── backoff
│   │           ├── backoff-2.2.1.dist-info
│   │           ├── bcrypt
│   │           ├── bcrypt-4.3.0.dist-info
│   │           ├── beautifulsoup4-4.13.4.dist-info
│   │           ├── black
│   │           ├── black-25.1.0.dist-info
│   │           ├── blackd
│   │           ├── blib2to3
│   │           ├── blinker
│   │           ├── blinker-1.9.0.dist-info
│   │           ├── bs4
│   │           ├── build-1.2.2.post1.dist-info
│   │           ├── cachetools
│   │           ├── cachetools-5.5.2.dist-info
│   │           ├── certifi
│   │           ├── certifi-2025.7.14.dist-info
│   │           ├── cffi
│   │           ├── cffi-1.17.1.dist-info
│   │           ├── charset_normalizer
│   │           ├── charset_normalizer-3.4.2.dist-info
│   │           ├── chromadb
│   │           ├── chromadb_rust_bindings
│   │           ├── chromadb-1.0.15.dist-info
│   │           ├── click
│   │           ├── click-8.2.1.dist-info
│   │           ├── coloredlogs
│   │           ├── coloredlogs-15.0.1.dist-info
│   │           ├── coloredlogs.pth
│   │           ├── crewai
│   │           ├── crewai_tools
│   │           ├── crewai_tools-0.0.1.dist-info
│   │           ├── crewai-0.150.0.dist-info
│   │           ├── cryptography
│   │           ├── cryptography-45.0.5.dist-info
│   │           ├── dateutil
│   │           ├── ddc459050edb75a05942__mypyc.cpython-313-darwin.so
│   │           ├── decorator-5.2.1.dist-info
│   │           ├── decorator.py
│   │           ├── deprecation-2.1.0.dist-info
│   │           ├── deprecation.py
│   │           ├── diskcache
│   │           ├── diskcache-5.6.3.dist-info
│   │           ├── distro
│   │           ├── distro-1.9.0.dist-info
│   │           ├── docstring_parser
│   │           ├── docstring_parser-0.17.0.dist-info
│   │           ├── dotenv
│   │           ├── durationpy
│   │           ├── durationpy-0.10.dist-info
│   │           ├── et_xmlfile
│   │           ├── et_xmlfile-2.0.0.dist-info
│   │           ├── executing
│   │           ├── executing-2.2.0.dist-info
│   │           ├── filelock
│   │           ├── filelock-3.18.0.dist-info
│   │           ├── flake8
│   │           ├── flake8-7.3.0.dist-info
│   │           ├── flatbuffers
│   │           ├── flatbuffers-25.2.10.dist-info
│   │           ├── frozenlist
│   │           ├── frozenlist-1.7.0.dist-info
│   │           ├── fsspec
│   │           ├── fsspec-2025.7.0.dist-info
│   │           ├── google
│   │           ├── google_auth-2.40.3.dist-info
│   │           ├── googleapis_common_protos-1.70.0.dist-info
│   │           ├── gotrue
│   │           ├── gotrue-2.12.3.dist-info
│   │           ├── grpc
│   │           ├── grpcio-1.74.0.dist-info
│   │           ├── h11
│   │           ├── h11-0.16.0.dist-info
│   │           ├── h2
│   │           ├── h2-4.2.0.dist-info
│   │           ├── hf_xet
│   │           ├── hf_xet-1.1.5.dist-info
│   │           ├── hpack
│   │           ├── hpack-4.1.0.dist-info
│   │           ├── httpcore
│   │           ├── httpcore-1.0.9.dist-info
│   │           ├── httptools
│   │           ├── httptools-0.6.4.dist-info
│   │           ├── httpx
│   │           ├── httpx-0.28.1.dist-info
│   │           ├── huggingface_hub
│   │           ├── huggingface_hub-0.34.1.dist-info
│   │           ├── humanfriendly
│   │           ├── humanfriendly-10.0.dist-info
│   │           ├── hyperframe
│   │           ├── hyperframe-6.1.0.dist-info
│   │           ├── idna
│   │           ├── idna-3.10.dist-info
│   │           ├── importlib_metadata
│   │           ├── importlib_metadata-8.7.0.dist-info
│   │           ├── importlib_resources
│   │           ├── importlib_resources-6.5.2.dist-info
│   │           ├── iniconfig
│   │           ├── iniconfig-2.1.0.dist-info
│   │           ├── instructor
│   │           ├── instructor-1.10.0.dist-info
│   │           ├── IPython
│   │           ├── ipython_pygments_lexers-1.1.1.dist-info
│   │           ├── ipython_pygments_lexers.py
│   │           ├── ipython-9.4.0.dist-info
│   │           ├── isympy.py
│   │           ├── jedi
│   │           ├── jedi-0.19.2.dist-info
│   │           ├── jinja2
│   │           ├── jinja2-3.1.6.dist-info
│   │           ├── jiter
│   │           ├── jiter-0.10.0.dist-info
│   │           ├── json_repair
│   │           ├── json_repair-0.25.2.dist-info
│   │           ├── json5
│   │           ├── json5-0.12.0.dist-info
│   │           ├── jsonpickle
│   │           ├── jsonpickle-4.1.1.dist-info
│   │           ├── jsonref-1.1.0.dist-info
│   │           ├── jsonref.py
│   │           ├── jsonschema
│   │           ├── jsonschema_specifications
│   │           ├── jsonschema_specifications-2025.4.1.dist-info
│   │           ├── jsonschema-4.25.0.dist-info
│   │           ├── jwt
│   │           ├── kubernetes
│   │           ├── kubernetes-33.1.0.dist-info
│   │           ├── litellm
│   │           ├── litellm-1.74.3.dist-info
│   │           ├── markdown_it
│   │           ├── markdown_it_py-3.0.0.dist-info
│   │           ├── markupsafe
│   │           ├── MarkupSafe-3.0.2.dist-info
│   │           ├── matplotlib_inline
│   │           ├── matplotlib_inline-0.1.7.dist-info
│   │           ├── mccabe-0.7.0.dist-info
│   │           ├── mccabe.py
│   │           ├── mdurl
│   │           ├── mdurl-0.1.2.dist-info
│   │           ├── mmh3
│   │           ├── mmh3-5.1.0.dist-info
│   │           ├── mmh3.cpython-313-darwin.so
│   │           ├── mpmath
│   │           ├── mpmath-1.3.0.dist-info
│   │           ├── multidict
│   │           ├── multidict-6.6.3.dist-info
│   │           ├── mypy_extensions-1.1.0.dist-info
│   │           ├── mypy_extensions.py
│   │           ├── networkx
│   │           ├── networkx-3.5.dist-info
│   │           ├── numpy
│   │           ├── numpy-2.3.2.dist-info
│   │           ├── oauthlib
│   │           ├── oauthlib-3.3.1.dist-info
│   │           ├── onnxruntime
│   │           ├── onnxruntime-1.22.0.dist-info
│   │           ├── openai
│   │           ├── openai-1.97.1.dist-info
│   │           ├── openpyxl
│   │           ├── openpyxl-3.1.5.dist-info
│   │           ├── opentelemetry
│   │           ├── opentelemetry_api-1.35.0.dist-info
│   │           ├── opentelemetry_exporter_otlp_proto_common-1.35.0.dist-info
│   │           ├── opentelemetry_exporter_otlp_proto_grpc-1.35.0.dist-info
│   │           ├── opentelemetry_exporter_otlp_proto_http-1.35.0.dist-info
│   │           ├── opentelemetry_proto-1.35.0.dist-info
│   │           ├── opentelemetry_sdk-1.35.0.dist-info
│   │           ├── opentelemetry_semantic_conventions-0.56b0.dist-info
│   │           ├── orjson
│   │           ├── orjson-3.11.1.dist-info
│   │           ├── overrides
│   │           ├── overrides-7.7.0.dist-info
│   │           ├── packaging
│   │           ├── packaging-25.0.dist-info
│   │           ├── pandas
│   │           ├── pandas-2.3.1.dist-info
│   │           ├── parso
│   │           ├── parso-0.8.4.dist-info
│   │           ├── pathspec
│   │           ├── pathspec-0.12.1.dist-info
│   │           ├── pdfminer
│   │           ├── pdfminer_six-20250506.dist-info
│   │           ├── pdfplumber
│   │           ├── pdfplumber-0.11.7.dist-info
│   │           ├── pexpect
│   │           ├── pexpect-4.9.0.dist-info
│   │           ├── PIL
│   │           ├── pillow-11.3.0.dist-info
│   │           ├── pip
│   │           ├── pip-25.1.1.dist-info
│   │           ├── platformdirs
│   │           ├── platformdirs-4.3.8.dist-info
│   │           ├── pluggy
│   │           ├── pluggy-1.6.0.dist-info
│   │           ├── portalocker
│   │           ├── portalocker-2.7.0.dist-info
│   │           ├── postgrest
│   │           ├── postgrest-1.1.1.dist-info
│   │           ├── posthog
│   │           ├── posthog-5.4.0.dist-info
│   │           ├── prompt_toolkit
│   │           ├── prompt_toolkit-3.0.51.dist-info
│   │           ├── propcache
│   │           ├── propcache-0.3.2.dist-info
│   │           ├── protobuf-6.31.1.dist-info
│   │           ├── proxytypes.py
│   │           ├── ptyprocess
│   │           ├── ptyprocess-0.7.0.dist-info
│   │           ├── pure_eval
│   │           ├── pure_eval-0.2.3.dist-info
│   │           ├── py.py
│   │           ├── pyasn1
│   │           ├── pyasn1_modules
│   │           ├── pyasn1_modules-0.4.2.dist-info
│   │           ├── pyasn1-0.6.1.dist-info
│   │           ├── pybase64
│   │           ├── pybase64-1.4.1.dist-info
│   │           ├── pycodestyle-2.14.0.dist-info
│   │           ├── pycodestyle.py
│   │           ├── pycparser
│   │           ├── pycparser-2.22.dist-info
│   │           ├── pydantic
│   │           ├── pydantic_core
│   │           ├── pydantic_core-2.33.2.dist-info
│   │           ├── pydantic-2.11.7.dist-info
│   │           ├── pyflakes
│   │           ├── pyflakes-3.4.0.dist-info
│   │           ├── pygments
│   │           ├── pygments-2.19.2.dist-info
│   │           ├── PyJWT-2.10.1.dist-info
│   │           ├── pypdfium2
│   │           ├── pypdfium2_raw
│   │           ├── pypdfium2-4.30.0.dist-info
│   │           ├── pypika
│   │           ├── pypika-0.48.9.dist-info
│   │           ├── pyproject_hooks
│   │           ├── pyproject_hooks-1.2.0.dist-info
│   │           ├── pytest
│   │           ├── pytest-8.4.1.dist-info
│   │           ├── python_dateutil-2.9.0.post0.dist-info
│   │           ├── python_dotenv-1.1.1.dist-info
│   │           ├── pytz
│   │           ├── pytz-2025.2.dist-info
│   │           ├── pyvis
│   │           ├── pyvis-0.3.2.dist-info
│   │           ├── PyYAML-6.0.2.dist-info
│   │           ├── realtime
│   │           ├── realtime-2.6.0.dist-info
│   │           ├── referencing
│   │           ├── referencing-0.36.2.dist-info
│   │           ├── regex
│   │           ├── regex-2024.11.6.dist-info
│   │           ├── requests
│   │           ├── requests_oauthlib
│   │           ├── requests_oauthlib-2.0.0.dist-info
│   │           ├── requests-2.32.4.dist-info
│   │           ├── rich
│   │           ├── rich-14.1.0.dist-info
│   │           ├── rpds
│   │           ├── rpds_py-0.26.0.dist-info
│   │           ├── rsa
│   │           ├── rsa-4.9.1.dist-info
│   │           ├── schemas
│   │           ├── shellingham
│   │           ├── shellingham-1.5.4.dist-info
│   │           ├── six-1.17.0.dist-info
│   │           ├── six.py
│   │           ├── sniffio
│   │           ├── sniffio-1.3.1.dist-info
│   │           ├── soupsieve
│   │           ├── soupsieve-2.7.dist-info
│   │           ├── stack_data
│   │           ├── stack_data-0.6.3.dist-info
│   │           ├── storage3
│   │           ├── storage3-0.12.0.dist-info
│   │           ├── strenum
│   │           ├── StrEnum-0.4.15.dist-info
│   │           ├── supabase
│   │           ├── supabase-2.17.0.dist-info
│   │           ├── supafunc
│   │           ├── supafunc-0.10.1.dist-info
│   │           ├── sympy
│   │           ├── sympy-1.14.0.dist-info
│   │           ├── tenacity
│   │           ├── tenacity-9.1.2.dist-info
│   │           ├── tiktoken
│   │           ├── tiktoken_ext
│   │           ├── tiktoken-0.9.0.dist-info
│   │           ├── tokenizers
│   │           ├── tokenizers-0.21.2.dist-info
│   │           ├── tomli
│   │           ├── tomli_w
│   │           ├── tomli_w-1.2.0.dist-info
│   │           ├── tomli-2.2.1.dist-info
│   │           ├── tqdm
│   │           ├── tqdm-4.67.1.dist-info
│   │           ├── traitlets
│   │           ├── traitlets-5.14.3.dist-info
│   │           ├── typer
│   │           ├── typer-0.16.0.dist-info
│   │           ├── typing_extensions-4.14.1.dist-info
│   │           ├── typing_extensions.py
│   │           ├── typing_inspection
│   │           ├── typing_inspection-0.4.1.dist-info
│   │           ├── tzdata
│   │           ├── tzdata-2025.2.dist-info
│   │           ├── urllib3
│   │           ├── urllib3-2.5.0.dist-info
│   │           ├── uv
│   │           ├── uv-0.8.3.dist-info
│   │           ├── uvicorn
│   │           ├── uvicorn-0.35.0.dist-info
│   │           ├── uvloop
│   │           ├── uvloop-0.21.0.dist-info
│   │           ├── watchfiles
│   │           ├── watchfiles-1.1.0.dist-info
│   │           ├── wcwidth
│   │           ├── wcwidth-0.2.13.dist-info
│   │           ├── websocket
│   │           ├── websocket_client-1.8.0.dist-info
│   │           ├── websockets
│   │           ├── websockets-15.0.1.dist-info
│   │           ├── yaml
│   │           ├── yarl
│   │           ├── yarl-1.20.1.dist-info
│   │           ├── zipp
│   │           └── zipp-3.23.0.dist-info
│   ├── pyvenv.cfg
│   └── share
│       └── man
│           └── man1
│               ├── ipython.1
│               └── isympy.1
└── vite.config.ts

384 directories, 372 files

