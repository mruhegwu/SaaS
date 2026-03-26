# SaaS Monorepo

A full-stack SaaS application built with TypeScript, React, and Express in a Lerna monorepo.

## Project Structure

```
SaaS/
├── frontend/
│   └── app/               # React frontend application
│       └── src/
│           ├── components/ # Reusable UI components
│           ├── pages/      # Page-level components
│           ├── services/   # API service layer
│           └── hooks/      # Custom React hooks
├── backend/
│   └── api/               # Express REST API
│       └── src/
│           ├── controllers/ # Route handler logic
│           ├── middleware/  # Express middleware (auth, etc.)
│           ├── models/      # Mongoose data models
│           └── routes/      # API route definitions
├── shared/
│   └── types/             # Shared TypeScript types
│       └── src/
│           └── index.ts    # Exported type definitions
├── .env.example           # Environment variable template
├── .gitignore
├── package.json           # Root workspace configuration
├── tsconfig.json          # Base TypeScript configuration
└── README.md
```

## Packages

| Package | Description |
|---|---|
| `@saas/app` | React frontend (`frontend/app`) |
| `@saas/api` | Express backend API (`backend/api`) |
| `@saas/types` | Shared TypeScript types (`shared/types`) |

## Getting Started

### Prerequisites
- Node.js >= 14
- npm >= 7

### Installation

```bash
npm install
```

### Development

```bash
# Start all packages
npm run start

# Build all packages
npm run build

# Run all tests
npm run test
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend API base URL |
| `DATABASE_URL` | MongoDB connection string |
| `FRONTEND_URL` | Frontend application URL |
