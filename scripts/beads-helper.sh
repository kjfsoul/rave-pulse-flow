#!/bin/bash
# Beads Helper Functions
# Utility functions for working with Beads in agent workflows

set -euo pipefail

# Check if bd is available
check_bd() {
    if ! command -v bd &> /dev/null; then
        if [[ ":$PATH:" != *":$HOME/go/bin:"* ]]; then
            export PATH="$PATH:$HOME/go/bin"
        fi
        if ! command -v bd &> /dev/null; then
            echo "ERROR: bd command not found" >&2
            return 1
        fi
    fi
    return 0
}

# Get ready work (returns JSON)
get_ready_work() {
    check_bd || return 1
    bd ready --json 2>/dev/null
}

# Get issue details (returns JSON)
get_issue() {
    local issue_id=$1
    check_bd || return 1
    bd show "$issue_id" --json 2>/dev/null
}

# Create issue (returns JSON with issue ID)
create_issue() {
    local title=$1
    local description=${2:-""}
    local priority=${3:-2}
    local type=${4:-task}
    local labels=${5:-""}

    check_bd || return 1

    local cmd="bd create \"$title\""
    [ -n "$description" ] && cmd="$cmd -d \"$description\""
    cmd="$cmd -p $priority -t $type"
    [ -n "$labels" ] && cmd="$cmd -l $labels"
    cmd="$cmd --json"

    eval "$cmd" 2>/dev/null
}

# Update issue status
update_status() {
    local issue_id=$1
    local status=$2

    check_bd || return 1
    bd update "$issue_id" --status "$status" --json 2>/dev/null
}

# Close issue with reason
close_issue() {
    local issue_id=$1
    local reason=$2

    check_bd || return 1
    bd close "$issue_id" --reason "$reason" --json 2>/dev/null
}

# Add dependency
add_dependency() {
    local dependent_id=$1
    local blocker_id=$2
    local dep_type=${3:-blocks}

    check_bd || return 1
    bd dep add "$dependent_id" "$blocker_id" --type "$dep_type" 2>/dev/null
}

# Add labels
add_labels() {
    local issue_id=$1
    local labels=$2

    check_bd || return 1
    bd label add "$issue_id" "$labels" 2>/dev/null
}

# Get project stats
get_stats() {
    check_bd || return 1
    bd stats 2>/dev/null
}

# Main function for CLI usage
main() {
    case "${1:-}" in
        ready)
            get_ready_work
            ;;
        show)
            [ -z "${2:-}" ] && { echo "Usage: $0 show <issue-id>" >&2; exit 1; }
            get_issue "$2"
            ;;
        create)
            [ -z "${2:-}" ] && { echo "Usage: $0 create <title> [description] [priority] [type] [labels]" >&2; exit 1; }
            create_issue "${2:-}" "${3:-}" "${4:-2}" "${5:-task}" "${6:-}"
            ;;
        update)
            [ -z "${3:-}" ] && { echo "Usage: $0 update <issue-id> <status>" >&2; exit 1; }
            update_status "$2" "$3"
            ;;
        close)
            [ -z "${3:-}" ] && { echo "Usage: $0 close <issue-id> <reason>" >&2; exit 1; }
            close_issue "$2" "$3"
            ;;
        dep)
            [ -z "${4:-}" ] && { echo "Usage: $0 dep <dependent-id> <blocker-id> <type>" >&2; exit 1; }
            add_dependency "$2" "$3" "${4:-blocks}"
            ;;
        label)
            [ -z "${3:-}" ] && { echo "Usage: $0 label <issue-id> <labels>" >&2; exit 1; }
            add_labels "$2" "$3"
            ;;
        stats)
            get_stats
            ;;
        *)
            echo "Beads Helper Functions"
            echo ""
            echo "Usage:"
            echo "  $0 ready                                    - Get ready work"
            echo "  $0 show <issue-id>                          - Get issue details"
            echo "  $0 create <title> [desc] [pri] [type] [labels] - Create issue"
            echo "  $0 update <issue-id> <status>               - Update status"
            echo "  $0 close <issue-id> <reason>                - Close issue"
            echo "  $0 dep <dep-id> <blocker-id> <type>        - Add dependency"
            echo "  $0 label <issue-id> <labels>                - Add labels"
            echo "  $0 stats                                    - Get stats"
            exit 1
            ;;
    esac
}

# If script is executed directly, run main
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
