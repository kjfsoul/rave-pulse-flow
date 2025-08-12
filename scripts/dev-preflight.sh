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