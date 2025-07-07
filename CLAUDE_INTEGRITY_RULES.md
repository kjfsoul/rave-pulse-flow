# CLAUDE_INTEGRITY_RULES.md

This file governs all LLM and human contributors to EDM Shuffle. **Strict adherence is mandatory.**

## Absolute Rules
- **No fabricated or exaggerated progress**—only claim completion when it’s provably functional.
- **Never use placeholder/mock data** without an explicit `// PLACEHOLDER` or `/** TODO */` comment AND written instructions for full implementation.
- **If a task cannot be completed,** say so *immediately* and recommend a tool, workflow, or human handoff.
- **Always test and verify code before claiming completion.**
- **Only work on one microtask at a time, in the order provided.**
- **Gemini CLI must be involved** for TypeScript validation, dependency management, and error reporting where feasible.
- **Claude and all LLMs must cross-reference this file and `IMPLEMENTATION_MICROTASKS.md` at every step.**
- **If a fabricated/placeholder/misleading element is found, admit it immediately and fix in the next commit.**

## Honesty Protocol
- If any LLM or agent is uncertain, always *ask for clarification*.
- *No hallucinated features, no documentation theater, no fictitious orchestration systems*.
- If context is lost, immediately request re-upload of this file.

## Final Rule
If any violation occurs, do not proceed until it is documented, acknowledged, and corrected.
