# Secret Detection System

## Natural Language Commands

**Tell Cursor:**
- `"Check for secrets"` or `"Scan for secrets"`
- `"Run secret detection"`
- `"Check security"` or `"Security scan"`

**What happens:**
- Runs `./scripts/check-secrets.sh`
- Scans codebase for hardcoded API keys, tokens, passwords
- Reports findings
- Blocks commits if secrets found (in quality gates)

## Usage

```bash
# Check for secrets
./scripts/check-secrets.sh

# Attempt automatic fixes
./scripts/check-secrets.sh --fix
```

## Integration

**Automatically checked:**
- In `check-code-quality.sh` (before task completion)
- In git pre-commit hooks (if configured)
- Part of project setup verification

**Prevents:**
- Committing hardcoded secrets
- Pushing secrets to GitHub
- Marking tasks complete with secrets present

## What It Detects

- API keys (`api_key`, `apikey`)
- Secret keys (`secret_key`, `secret-key`)
- Access tokens (`access_token`, `access-token`)
- Auth tokens (`auth_token`, `auth-token`)
- Passwords
- Common token formats (GitHub, Stripe, etc.)

## Fixing Secrets

**Automatic:**
```bash
./scripts/check-secrets.sh --fix
```

**Manual:**
1. Replace hardcoded values with `${ENV_VAR}`
2. Set environment variables
3. Use `.env` files (gitignored)

## Removing from History

**If secrets are in git history:**
```bash
./scripts/remove-secrets-from-history.sh
```

⚠️ **Warning:** This rewrites history. Use only if necessary.

