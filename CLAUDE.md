# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building
- `npm run build` - Compiles TypeScript to executable binary using Bun
- `./scripts/build.sh` - Alternative build script with detailed output
- `npm run clean` - Removes dist/ directory

### Testing
- `./scripts/test.sh` - Tests the built binary
- `npm run dev` - Runs the source TypeScript directly with Bun

### Release Process
- `./scripts/release.sh <version>` - Creates git tag and GitHub release
- `./scripts/update-formula.sh <version> <username>` - Updates Homebrew formula
- `./scripts/setup.sh` - Initial project setup and validation

## Architecture

### Core Components
- `bin/git-groq.ts` - Main CLI application with git automation and Groq API integration
- `Formula/git-groq.rb` - Homebrew formula for distribution
- `scripts/` - Build and release automation scripts

### Key Functions
- `loadGroqKey()` - Manages API key persistence in shell profiles
- `aiCommit()` - Handles Groq API calls for commit message generation
- `runGit()` - Orchestrates git add/commit/push workflow
- `execAsync()` - Wraps child_process.exec in Promise interface

### Build System
Uses Bun's `--compile` flag to create standalone binary from TypeScript source. The binary includes all dependencies and Node.js runtime.

### API Integration
Integrates with Groq's chat completions API using the `deepseek-r1-distill-llama-70b` model for generating conventional commit messages.

### Security
API keys are stored in user shell profiles (~/.zshrc or ~/.bashrc) and never committed to the repository.