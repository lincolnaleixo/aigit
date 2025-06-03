# AIGit

🤖 Automate your git workflow with AI-generated commit messages

AIGit streamlines your development workflow by automatically generating meaningful, conventional commit messages using AI and handling the complete git add/commit/push flow in a single command.

## Features

- **AI-Powered Commit Messages**: Uses Groq's fast LLM inference to analyze your changes and generate meaningful conventional commit messages
- **Complete Git Workflow**: Handles `git add .`, `git commit`, and `git push` automatically
- **Secure API Key Management**: Stores your Groq API key securely in your shell profile
- **Conventional Commits**: Follows the [Conventional Commits](https://www.conventionalcommits.org/) specification
- **Smart Context Analysis**: Analyzes git status, diffs, and recent commits to generate relevant messages
- **Fallback Input**: If AI fails, prompts for manual commit message input

## Installation

### Via Homebrew (Recommended)

```bash
# Add the tap
brew tap lincolnaleixo/aigit

# Install aigit
brew install aigit
```

## Prerequisites

- Git repository
- [Groq API key](https://console.groq.com/keys) (free tier available)

## Usage

1. **First Run**: The tool will prompt for your Groq API key and save it to your shell profile:

```bash
aigit
# Enter your Groq API key (it will be saved to your shell profile):
# > gsk_...your_key_here
```

2. **Subsequent Runs**: Just run the command in any git repository:

```bash
aigit
```

The tool will:
- Check for unstaged/staged changes
- Analyze your git status and recent commits
- Generate an AI-powered conventional commit message
- Show you the proposed message
- Commit and push your changes

## Example Output

```bash
$ aigit
Starting git operations...
AI commit message:
feat: add user authentication system

Implement JWT-based authentication with login/logout endpoints,
password hashing, and session management for secure user access.

Done.
```

## Configuration

### API Key Management

Your Groq API key is automatically saved to:
- `~/.zshrc` (if using zsh)
- `~/.bashrc` (if using bash)

To use a different key, either:
- Update the `GROQ_API_KEY` in your shell profile
- Unset the environment variable to be prompted again

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report issues](https://github.com/lincolnaleixo/aigit/issues)
- 💡 [Request features](https://github.com/lincolnaleixo/aigit/issues)
- 📖 [Documentation](https://github.com/lincolnaleixo/aigit#readme)