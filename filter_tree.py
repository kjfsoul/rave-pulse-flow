import os

# List of files and directories from the list_files tool
files_and_dirs = [
    ".gitignore",
    "AGENT_WORK_QUEUE.md",
    "agents_fixed.py",
    "AUDIO_UI_COMPONENTS.md",
    "audit-ci.json",
    "audit-js.json",
    "audit-secrets.json",
    "bun.lockb",
    "check_a_mem.py",
    "claude_code_instructions.md",
    "CLAUDE_INTEGRITY_RULES.md",
    "CLAUDE.md",
    "claudeupdate.md",
    "components.json",
    "crew_deployment.sql",
    "crew.py",
    "CrewAI-README.md",
    "deploy.sh",
    "edmshufflelogoprompts.docx",
    "eslint.config.js",
    "FLX10_VALIDATION_LOG.md",
    "FRS.md",
    "GAP_MAP.md",
    "IMPLEMENTATION_MICROTASKS.md",
    "index.html",
    "MASTERPLAN.md",
    "memlog_session.md",
    "OSS_CANDIDATES.md",
    "package-lock.json",
    "package.json",
    "playwright.config.ts",
    "postcss.config.js",
    "PRD.md",
    "PRIORITIZED_ROADMAP.md",
    "project_overview.md",
    "README.md",
    "REPO_TREE.md",
    "repoanalysis.txt",
    "requirements-minimal.txt",
    "requirements.txt",
    "schema-documentation.html",
    ".claude/",
    ".github/",
    ".vscode/",
    "A-mem/",
    "A-mem/agentic_memory/",
    "A-mem/agentic_memory.egg-info/",
    "A-mem/Figure/",
    "A-mem/tests/",
    "agent/",
    "agents/",
    "agents/config.yaml",
    "agents/registry.json",
    "docs/",
    "e2e/",
    "edm-shuffle-output-docs/",
    "edm-shuffle-output-docs/ChatGPT_EDM Shuffle - EDM Shuffle CodeMax Strategy..._2025-07-29_12-25-41.md",
    "edm-shuffle-output-docs/Download EDMShuffle_Jules_AuditPrompt.md",
    "edm-shuffle-output-docs/Download Ultra-Minified Version",
    "edm-shuffle-output-docs/EDM Shuffle_ Professional Development Manual.docx",
    "edm-shuffle-output-docs/EDM Shuffle_ Professional Development Manual.md",
    "edm-shuffle-output-docs/EDM_Shuffle_Manual_MINIFIED.md",
    "edm-shuffle-output-docs/edmshuffle_features.docx",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/1-executive-summary-vision.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/1-executive-summary.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/2-authoritative-project-roadmap-development-phases-milestones.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/2-documentation-index.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/3-document-index-root-directory.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/3-prd-product-requirements-document.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/4-frs-functional-requirements-specification.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/4-prompt-catalog.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/5-feature-gap-analysis.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/5-implementation-roadmap.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/6-phase-by-phase-features-prompts-tasks.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/7-admin-docs.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/7-feature-matrix-gap-analysis.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/8-built-in-marketing-framework.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/8-change-log-claudeupdate-md.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/agent-hand-off-notes.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/changelog-recent-history.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/claude_integrity_rules.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/claude.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/current-overall-status.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/documentation_index.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/edm-shuffle-development-manual-master-blueprint.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/edm-shuffle-professional-development-manual.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/how-to-use-this-file.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/memory-context-note-for-next-llm.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-1-core-infrastructure-theming-initial-scaffolding-user-authentication.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-1-user-authentication-account-system-full-user-journey.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-1-user-authentication-account-system.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-2-audio-engine-mix-station.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-3-voting-festival-scheduling.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-4-challenges-social.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-5-marketplace.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-6-community-crews.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-7-admin-docs.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/phase-8-built-in-marketing-framework.md",
    "edm-shuffle-output-docs/edm-shuffle-output-docs/reality-audit-placeholder-disclosure.md",
    "examples/",
    "examples/WO-audio-latency.yaml",
    "examples/WO-voting-integrity.yaml",
    "public/",
    "public/favicon.svg",
    "public/placeholder.svg",
    "public/robots.txt",
    "public/audio/",
    "public/audio/README.md",
    "public/challenges/",
    "public/challenges/daily-quests.json",
    "public/soundpacks/",
    "public/soundpacks/manifest.json",
    "public/soundpacks/README.md",
    "public/soundpacks/bass-drops/",
    "public/soundpacks/edm-essentials/",
    "public/soundpacks/house-vibes/",
    "rave-pulse-flow.git/",
    "rave-pulse-flow.git/config",
    "rave-pulse-flow.git/description",
    "rave-pulse-flow.git/HEAD",
    "rave-pulse-flow.git/packed-refs",
    "rave-pulse-flow.git/hooks/",
    "rave-pulse-flow.git/hooks/applypatch-msg.sample",
    "rave-pulse-flow.git/hooks/commit-msg.sample",
    "rave-pulse-flow.git/hooks/fsmonitor-watchman.sample",
    "rave-pulse-flow.git/hooks/post-update.sample",
    "rave-pulse-flow.git/hooks/pre-applypatch.sample",
    "rave-pulse-flow.git/hooks/pre-commit.sample",
    "rave-pulse-flow.git/hooks/pre-merge-commit.sample",
    "rave-pulse-flow.git/hooks/pre-push.sample",
    "rave-pulse-flow.git/hooks/pre-rebase.sample",
    "rave-pulse-flow.git/hooks/pre-receive.sample",
    "rave-pulse-flow.git/hooks/prepare-commit-msg.sample",
    "rave-pulse-flow.git/hooks/push-to-checkout.sample",
    "rave-pulse-flow.git/hooks/sendemail-validate.sample",
    "rave-pulse-flow.git/hooks/update.sample",
    "rave-pulse-flow.git/info/",
    "rave-pulse-flow.git/info/exclude",
    "rave-pulse-flow.git/info/refs",
    "rave-pulse-flow.git/objects/",
    "rave-pulse-flow.git/objects/info/",
    "rave-pulse-flow.git/objects/info/commit-graph",
    "rave-pulse-flow.git/objects/info/packs",
    "rave-pulse-flow.git/objects/pack/",
    "rave-pulse-flow.git/objects/pack/pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.bitmap",
    "rave-pulse-flow.git/objects/pack/pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.idx",
    "rave-pulse-flow.git/objects/pack/pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.pack",
    "rave-pulse-flow.git/objects/pack/pack-877b91dddb55cd97d76896d5cc13d6a919b69b3c.rev",
    "rave-pulse-flow.git/refs/",
    "rave-pulse-flow.git/refs/heads/",
    "rave-pulse-flow.git/refs/heads/jules/",
    "rave-pulse-flow.git/refs/tags/",
    "scripts/",
    "src/",
    "src/App.css",
    "src/App.tsx",
    "src/__tests__/",
    "src/__tests__/App.test.tsx",
    "src/__tests__/setup.ts",
    "src/components/",
    "src/components/ArchetypeAuraMeter.tsx",
    "src/components/ArchetypeRevealCeremony.tsx",
    "src/components/AudioEqualizerDemo.tsx",
    "src/components/AvatarSummonModal.tsx",
    "src/components/BottomNavigation.tsx",
    "src/components/DJExpertAgent.tsx",
    "src/components/EqualizerBars.tsx",
    "src/components/FLX10DeckPro.tsx",
    "src/components/HeadlinerAnnouncement.tsx",
    "src/components/LiveEqualizer.tsx",
    "src/components/LiveLeaderboard.tsx",
    "src/components/PLURcrewSidebar.tsx",
    "src/components/PLUROrbsAnimation.tsx",
    "src/components/PLURstreakMeter.tsx",
    "src/components/QuizBackgroundAnimation.tsx",
    "src/components/RSSFeedStreamer.tsx",
    "src/components/ScrollHintArrow.tsx",
    "src/components/audio-ui/",
    "src/components/auth/",
    "src/components/ui/",
    "src/components/VisualFX/",
    "src/contexts/",
    "src/hooks/",
    "src/hooks/__tests__/",
    "src/lib/",
    "src/pages/",
    "src/test/",
    "src/utils/",
    "supabase/",
    "supabase/.temp/",
    "supabase/functions/",
    "supabase/functions/crew-status/",
    "supabase/functions/plan-festival/",
    "supabase/functions/submit-vote/",
    "supabase/migrations/",
    "tests/",
    "utils/",
    "venv_crewai/"
]

# Directories to exclude
exclude_dirs = {
    "node_modules",
    ".venv",
    ".git",
    "__pycache__",
    "venv_crewai",
    "dist",
    "edm-shuffle-output-docs",
    ".vercel",
    ".vscode",
    "supabase/.temp"
}

def should_exclude(path):
    """Check if a path should be excluded."""
    # Check if the path itself is in the exclude list
    if path.rstrip('/') in exclude_dirs:
        return True

    # Check if any parent directory is in the exclude list
    path_parts = path.split(os.sep)
    for i in range(len(path_parts)):
        # Join parts up to the current index to form a potential parent path
        parent_path = os.path.join(*path_parts[:i+1]) if i > 0 else path_parts[0]
        if parent_path in exclude_dirs:
            return True

    return False

def build_tree(paths):
    """Build a tree structure from a list of paths."""
    tree = {}
    for path in paths:
        if should_exclude(path):
            continue
        parts = path.split('/')
        current_level = tree
        for part in parts:
            if part:  # Skip empty parts
                if part not in current_level:
                    current_level[part] = {}
                current_level = current_level[part]
    return tree

def print_tree(tree, prefix=""):
    """Print the tree structure."""
    items = list(tree.items())
    for i, (name, subtree) in enumerate(items):
        is_last = i == len(items) - 1
        marker = "└── " if is_last else "├── "
        print(prefix + marker + name)
        if subtree:  # If it's a directory
            extension = "    " if is_last else "│   "
            print_tree(subtree, prefix + extension)

# Build and print the tree
tree = build_tree(files_and_dirs)
print_tree(tree)
