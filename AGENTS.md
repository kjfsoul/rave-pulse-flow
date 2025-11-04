# Agent Instructions

## Issue Tracking with Beads (bd)

Use the `bd` command-line tool for ALL task and issue management instead of markdown files.

### 🚨 MANDATORY: Session Startup Workflow

**At the start of EVERY session, you MUST:**

1. **Check available work**:

   ```bash
   bd ready --json
   ```

2. **Review project health**:

   ```bash
   bd stats
   ```

3. **Check blocked issues**:

   ```bash
   bd blocked --json
   ```

4. **Select work from ready issues** - Always start with unblocked work

### Core Workflow

#### 1. **Finding Work**

- `bd ready --json` - Get issues with no blockers (START HERE)
- `bd list --json` - See all issues
- `bd blocked --json` - Issues that need attention
- `bd stats` - Project overview

#### 2. **Creating Issues**

   ```bash
   bd create "Issue title" -d "Description" -p 1 -t bug --json
   ```

- Types: `bug`, `feature`, `task`, `epic`, `chore`
- Priority: `0` (highest) to `4` (lowest)
- **ALWAYS use `--json` flag** for programmatic access

#### 3. **Managing Dependencies**

   ```bash
   bd dep add <dependent-id> <blocker-id> --type blocks
   ```

- Types: `blocks`, `related`, `parent-child`, `discovered-from`
- Only `blocks` dependencies affect ready work detection

#### 4. **Updating Status**

   ```bash
   bd update <issue-id> --status in_progress --json
   ```

- Statuses: `open`, `in_progress`, `blocked`, `closed`
- **Always update status when starting work**

#### 5. **Completing Work**

   ```bash
   bd close <issue-id> --reason "Implemented feature X" --json
   ```

- Always provide a reason describing what was accomplished
- Verify dependencies are resolved before closing

#### 6. **Discovering New Work**

- Create issue: `bd create "New bug discovered" -t bug -p 0 --json`
- Link back: `bd dep add <new-id> <parent-id> --type discovered-from`
- **File issues automatically for problems noticed during work**

### During Development Workflow

**As you work, you MUST:**

1. **Update status when starting**: `bd update <id> --status in_progress --json`

2. **Create issues for discovered problems**:

   ```bash
   bd create "Bug found: <description>" -t bug -p 0 --json
   ```

3. **Link new issues to parent work**:

   ```bash
   bd dep add <new-id> <parent-id> --type discovered-from
   ```

4. **Add labels for organization**:

   ```bash
   bd label add <id> backend,urgent
   ```

5. **Query issue details when needed**:

   ```bash
   bd show <id> --json
   ```

### Completing Work Workflow

**To properly close out tasks:**

1. **Close with description**:

   ```bash
   bd close <id> --reason "Implemented feature X with tests" --json
   ```

2. **Verify dependencies are resolved** - Check if any blocked issues are now ready

3. **Update related issues** - If completing work unblocks other issues, note it

### Critical Guidelines for Agents

**Agents using Beads MUST:**

- ✅ **ALWAYS use `--json` flag** for programmatic access
- ✅ **File issues instead of storing plans in context** - solves amnesia problem
- ✅ **Use dependency tracking** for complex task chains
- ✅ **Keep descriptions clear and actionable**
- ✅ **Automatically file issues** for problems noticed during work
- ✅ **Query ready work at start of each session**
- ✅ **Link discovered work back to parent issues** for audit trail

### Dependency System

Beads provides four types of dependencies:

1. **`blocks`**: Hard blocker - issue cannot start until blocker is resolved

   ```bash
   bd dep add bd-2 bd-1 --type blocks
   ```

2. **`related`**: Soft relationship - issues are connected but not blocking

   ```bash
   bd dep add bd-3 bd-2 --type related
   ```

3. **`parent-child`**: Hierarchical relationship (child depends on parent)

   ```bash
   bd dep add bd-4 bd-3 --type parent-child
   ```

4. **`discovered-from`**: Issue discovered during work on another issue

   ```bash
   bd dep add bd-5 bd-4 --type discovered-from
   ```

**Note**: Only `blocks` dependencies affect ready work detection.

### Visualizing Dependencies

```bash
# Show full dependency tree
bd dep tree <id>

# Detect circular dependencies
bd dep cycles
```

### Labels and Filtering

```bash
# Add labels during creation
bd create "Fix auth bug" -t bug -p 1 -l auth,backend,urgent --json

# Add/remove labels
bd label add <id> security
bd label remove <id> urgent

# Filter by labels (AND - must have ALL)
bd list --label backend,auth --json

# Filter by labels (OR - must have AT LEAST ONE)
bd list --label-any frontend,ui --json

# List all labels with counts
bd label list-all
```

### Batch Operations

```bash
# Create multiple issues from markdown file
bd create -f feature-plan.md

# Close multiple issues at once
bd close bd-1 bd-2 bd-3 --force --json
```

### Memory Compaction

Beads uses AI to compress old closed issues:

```bash
# Preview what would be compacted
bd compact --dry-run --all

# Compact closed issues older than 90 days
bd compact --days 90
```

### Quick Reference

```bash
# Session Startup (MANDATORY)
bd ready --json          # Find work to do
bd stats                  # Project statistics
bd blocked --json         # Issues needing attention

# Issue Management
bd create "Title" --json  # Create new issue
bd show <id> --json       # Get issue details
bd update <id> --status in_progress --json  # Update status
bd close <id> --reason "Done" --json  # Close issue

# Dependencies
bd dep add <dep> <blocker> --type blocks  # Add dependency
bd dep tree <id>           # View dependencies
bd dep cycles              # Detect circular deps

# Lists and Filters
bd list --status open --json      # List open issues
bd list --label backend --json    # Filter by label
bd list --label-any frontend,ui --json  # OR filter
```

### Troubleshooting

**"bd: command not found"**

- Verify Go bin is in PATH: `echo $PATH`
- Check bd location: `which bd`
- Manually add to PATH: `export PATH="$PATH:/Users/kfitz/go/bin"`

**Permission Denied**

```bash
chmod +x /Users/kfitz/go/bin/bd
```

**Cursor Agent Not Using bd**

- Ensure AGENTS.md exists in project root ✅
- Verify AGENTS.md contains bd instructions ✅
- Restart Cursor IDE completely
- Explicitly tell agent: "Please use bd for all issue tracking"

### Why Beads Transforms Agent Workflows

Beads solves critical problems with AI coding agents:

- **Amnesia Problem**: Agents lose context across sessions. Beads provides persistent memory through its issue tracker.
- **Lost Work**: Problems agents notice but can't address immediately are often forgotten. With Beads, agents automatically file issues for discovered work.
- **Context Limits**: Complex plans consume valuable context space. Beads moves planning to a structured database, freeing up context for actual code.
- **Multi-Agent Coordination**: Multiple agents or machines share the same logical database through Git sync, enabling true distributed development.
- **Audit Trail**: Every change is logged, allowing reconstruction of complex operations spanning multiple sessions.

### Multi-Machine Setup

Because Beads syncs through Git:

- Install `bd` on each machine
- Clone the project repo
- The `.beads/issues.jsonl` file syncs automatically via git
- Each machine maintains its own local SQLite cache
- Changes sync bidirectionally through normal git operations

**Best Practices:**

- Always use `--json` flag when agents interact with bd programmatically
- Install git hooks when prompted during `bd init` - they handle auto-sync
- Let agents file issues automatically - this is the key to solving amnesia
- Use appropriate dependency types - `blocks` for hard dependencies, `discovered-from` for new work found during tasks
- Review `bd stats` regularly to understand project health
- Commit `.beads/issues.jsonl` but gitignore `.beads/*.db` files
- Use labels liberally for better organization and filtering
- Link discovered work back to parent issues for full audit trail
