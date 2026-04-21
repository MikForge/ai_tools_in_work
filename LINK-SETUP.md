# Skill Directory Link Setup

This project stores Claude Code skills in `.agents/skills`, but Claude Code expects them in `.codex/skills`. To make the skills available in both locations, we use symbolic links (junctions on Windows).

## Quick Setup

Run the appropriate script for your operating system:

### Windows
```cmd
setup-skills-links.bat
```

### Linux/macOS (Unix-like)
```bash
chmod +x setup-skills-links.sh
./setup-skills-links.sh
```

## What the scripts do

1. Check that `.agents/skills` exists
2. Create `.codex` directory if it doesn't exist
3. Create a symbolic link (junction on Windows) from `.codex/skills` to `.agents/skills`
4. If the link already exists, the script exits without changes

After running the script, you can access skills via both paths:
- `.agents/skills/*` (original location)
- `.codex/skills/*` (linked location)

## Git Integration

The setup scripts are tracked in git. After cloning the repository, run the appropriate script once to create the links.

**Important**: The `.gitignore` file is configured to ignore `.codex/skills` (the link itself). This ensures that only the actual skill files in `.agents/skills` are tracked, not the symbolic links/junctions.

## Manual Setup (if scripts don't work)

### Windows (Command Prompt as administrator)
```cmd
mklink /J ".codex\skills" ".agents\skills"
```

### Linux/macOS
```bash
mkdir -p .codex
ln -s ../.agents/skills .codex/skills
```

## Notes

- The link is a directory junction (Windows) or symbolic link (Unix). Git does not track these links; only the scripts and original files are tracked.
- If you move the repository, the links should continue to work because they use relative paths.
- To remove the link, simply delete the `.codex/skills` directory (the link itself, not the target).
