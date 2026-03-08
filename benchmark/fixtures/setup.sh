#!/bin/bash
# Setup script for benchmark eval projects.
# Usage: ./setup.sh <target-dir>
# Creates an isolated taskmd project with baseline fixture data.

set -e

TARGET_DIR="${1:?Usage: setup.sh <target-dir>}"
FIXTURES_DIR="$(cd "$(dirname "$0")/fixtures" && pwd)"

# Create and init
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"
taskmd init --yes 2>/dev/null || true

# Copy fixture tasks
cp -r "$FIXTURES_DIR/tasks/"*.md tasks/ 2>/dev/null || true

# Copy fixture source files
mkdir -p src
cp -r "$FIXTURES_DIR/src/"* src/ 2>/dev/null || true

echo "Project initialized at $TARGET_DIR with $(ls tasks/*.md 2>/dev/null | wc -l | tr -d ' ') tasks"
