# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Read These First

1. **ALWAYS** read `CLAUDE_INTEGRITY_RULES.md` before any work
2. **ALWAYS** check current task in `IMPLEMENTATION_MICROTASKS.md`
3. **NEVER** fabricate features, data, or progress
4. **ASK** for clarification if context is missing

## 🎉 **CURRENT PROJECT STATUS: MVP COMPLETE**

**All 10 core authentication and persistence tasks completed (Jan 10, 2025)**

- Full Supabase integration with user authentication
- Complete database schema with all core features
- All major routes protected and integrated with user data
- Ready for beta testing and production deployment

## 🧪 **TESTING FRAMEWORK STATUS: CONFIGURED (Aug 12, 2025)**

**Testing Infrastructure Completed:**
- ✅ Vitest configured for React component testing
- ✅ Playwright configured for end-to-end testing
- ✅ Test environment setup with spiritual technology mocks
- ✅ Initial test files created and validated
- ⚠️ TypeScript compilation errors being addressed

**Testing Commands:**
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run e2e tests in UI mode
npm run test:e2e:ui
```

## Essential Development Commands

**Primary Development:**

```bash
# Start development server (runs on port 8080 with IPv6 binding)
npm run dev

# Build for production
npm run build

# Build in development mode  
npm run build:dev

# Run linting (ESLint)
npm run lint

# Preview production build
npm run preview
```

**Alternative with Bun:**

```bash
# Uses bun.lockb for faster performance
bun run dev
bun run build
```

## Environment Setup

1. **Node.js**: Use latest LTS
2. **Package Manager**: npm or bun (both lockfiles present)
3. **Environment Variables**: Stored in `.env` (Supabase, Stripe, OpenAI keys)
   - **CRITICAL**: Never commit `.env` - contains sensitive API keys
   - Variables documented in individual service files (`src/lib/`)
4. **Port**: Development server runs on port 8080 (vite.config.ts)
5. **Host**: Uses IPv6 `::` binding for network accessibility

## Critical Development Rules

**MANDATORY INTEGRITY RULES** (from `CLAUDE_INTEGRITY_RULES.md`):

- NO fabricated or exaggerated progress claims
- NO placeholder/mock data without explicit `// PLACEHOLDER` or `/** TODO */` comments
- Test and verify ALL code before claiming completion
- Work on ONE microtask at a time, in order

## Recent Updates (Aug 12, 2025)

- **Testing Framework**: Installed and configured Vitest + Playwright
- **TypeScript**: Updated configuration to include test directories
- **Mocks**: Created comprehensive mocking system for spiritual technology dependencies
- **Documentation**: Added testing patterns and spiritual data sensitivity guidelines
