#!/bin/bash
# Setup symlinks from .codex/skills to .agents/skills
# This script creates symbolic links on Unix-like systems.

TARGET_DIR=".agents/skills"
LINK_DIR=".claude/skills"

# Check if .agents/skills exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Target directory $TARGET_DIR does not exist."
    exit 1
fi

# Create .claude directory if it doesn't exist
if [ ! -d ".claude" ]; then
    mkdir -p ".claude"
fi

# Check if link already exists
if [ -e "$LINK_DIR" ]; then
    echo "Link directory $LINK_DIR already exists."
    echo "If you want to recreate it, delete it first and run this script again."
    exit 0
fi

# Create symbolic link
echo "Creating symbolic link from $LINK_DIR to $TARGET_DIR"
ln -s "../$TARGET_DIR" "$LINK_DIR"

if [ $? -ne 0 ]; then
    echo "Failed to create symbolic link. Check permissions."
    exit 1
fi

echo "Symbolic link created successfully."
echo "You can now access skills via both .agents/skills and .claude/skills"
