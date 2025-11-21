# Supabase Redirect URLs Configuration Guide

## ⚠️ CRITICAL: Site URL vs Redirect URLs

**DO NOT change the Site URL to localhost!**

- **Site URL**: Should remain your **production URL** (e.g., `https://edmshuffle.com`)
- **Redirect URLs**: Add localhost entries here for **development only**

## Configuration Strategy

### Site URL (Authentication > URL Configuration)
```
https://edmshuffle.com
```
**Keep this as production!** Changing it to localhost will break production signups.

### Redirect URLs (Authentication > URL Configuration)

Add these URLs to the **Redirect URLs** list (NOT Site URL):

**Only these two development ports are supported:** 8081 and 8084

#### Port 8081:
```
http://localhost:8081
http://localhost:8081/
http://localhost:8081/#
http://localhost:8081/#/**
http://127.0.0.1:8081
http://127.0.0.1:8081/
http://127.0.0.1:8081/#
http://127.0.0.1:8081/#/**
```

#### Port 8084:
```
http://localhost:8084
http://localhost:8084/
http://localhost:8084/#
http://localhost:8084/#/**
http://127.0.0.1:8084
http://127.0.0.1:8084/
http://127.0.0.1:8084/#
http://127.0.0.1:8084/#/**
```

**Note:** Only ports 8081 and 8084 are allowed for development signups. Other ports will use the production Site URL.

## How It Works

1. **Production Signups**:
   - Site URL (`https://edmshuffle.com`) is used automatically
   - No code changes needed

2. **Development Signups**:
   - Code detects dev environment and localhost origin
   - Only allows ports 8081 and 8084
   - Overrides `emailRedirectTo` to use localhost for allowed ports only
   - Localhost URLs must be in Redirect URLs list
   - Other ports will fall back to production Site URL

## Current Code Behavior

The signup function now:
- ✅ Detects if running in dev mode (`import.meta.env.DEV`)
- ✅ Detects if origin is localhost/127.0.0.1
- ✅ Only sets `emailRedirectTo` in development
- ✅ Production uses Site URL automatically (no override)

## Fixing the 504 Timeout

The 504 timeout was likely because:
1. Localhost URLs weren't in Redirect URLs list
2. Supabase tried to validate a redirect URL that wasn't allowed
3. This caused the request to hang and timeout

**Solution**: Add all the localhost variants to Redirect URLs (keep Site URL as production!)

## Testing

### Development:
1. Sign up at `http://localhost:8084`
2. Check email confirmation link - should redirect to `http://localhost:8084/#`
3. Should work without timeout

### Production:
1. Sign up at `https://edmshuffle.com`
2. Check email confirmation link - should redirect to `https://edmshuffle.com/#`
3. Uses Site URL automatically (no code override)
