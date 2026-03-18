# Contributing to SaaS Platform

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this standard.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/SaaS.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Development Setup

See [README.md](README.md) for development setup instructions.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes
- `perf:` - Performance improvements

### Examples

```
feat: add user authentication with JWT
fix: resolve database connection timeout
docs: update API documentation
test: add unit tests for auth service
```

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Update documentation if needed
3. Add tests for new functionality
4. Keep changes focused and atomic
5. Request review from maintainers

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules (run `npm run lint`)
- Format with Prettier (run `npm run format`)
- Write meaningful variable and function names
- Add JSDoc comments for public APIs

## Testing Guidelines

- Write unit tests for business logic
- Write integration tests for API endpoints
- Maintain >80% code coverage
- Test edge cases and error conditions

## Reporting Issues

Use the GitHub issue tracker with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)

## Questions?

Open a GitHub Discussion or reach out to the maintainers.
