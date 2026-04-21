@echo off
REM Setup symlinks from .codex/skills to .agents/skills
REM This script creates directory junctions on Windows.

set "TARGET_DIR=.agents\skills"
set "LINK_DIR=.codex\skills"

REM Check if .agents/skills exists
if not exist "%TARGET_DIR%" (
    echo Error: Target directory %TARGET_DIR% does not exist.
    exit /b 1
)

REM Create .codex directory if it doesn't exist
if not exist ".codex" mkdir ".codex"

REM Check if link already exists
if exist "%LINK_DIR%" (
    echo Link directory %LINK_DIR% already exists.
    echo If you want to recreate it, delete it first and run this script again.
    exit /b 0
)

REM Create junction
echo Creating junction from %LINK_DIR% to %TARGET_DIR%
mklink /J "%LINK_DIR%" "%TARGET_DIR%"

if errorlevel 1 (
    echo Failed to create junction. Make sure you have sufficient permissions.
    exit /b 1
)

echo Junction created successfully.
echo You can now access skills via both .agents\skills and .codex\skills
