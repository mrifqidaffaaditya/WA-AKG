# Contributing to WA-AKG

Thanks for your interest in contributing! 🎉

## Development Setup

```bash
git clone https://github.com/mrifqidaffaaditya/WA-AKG.git
cd WA-AKG
npm install
cp .env.example .env
# Edit .env to match your environment
npm run dev
```

Requirements: **Node.js 22+**, **npm 10+**, **MySQL 8.0**

Using Docker:
```bash
docker compose up -d
```

## Branch & Commit Convention

| Branch Prefix | Purpose                   |
|---------------|---------------------------|
| `feat/`       | New feature               |
| `fix/`        | Bug fix                   |
| `chore/`      | Maintenance / dependency  |
| `docs/`       | Documentation             |

**Commit messages** use this format:
```
type: short description

feat: add AI auto-reply
fix: patch QR code pairing
chore: update baileys to 7.0.0
```

## Pull Request Process

1. Fork the repo & create a branch from `dev`
2. Implement changes + test
3. Ensure `npm run build` and `npm test` succeed
4. Open a PR to the `dev` branch
5. Fill out the PR template completely
6. Reviewed by a maintainer

## Code Style

- TypeScript strict mode
- ESLint default config
- TailwindCSS utility-first — avoid custom CSS unless necessary
- camelCase for variables and functions
- PascalCase for React components

## Need Help?

- Issues labeled `good first issue` are great for beginners
- Join Telegram: https://t.me/aikeigroup
