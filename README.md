# ⚡ GitHub AI DevOps Platform

An AI-powered SaaS platform that analyzes your GitHub repositories for code quality, security risks, and tech debt — and auto-generates CI/CD pipelines with one click.

---

## Features

- 🔐 **GitHub OAuth** — Secure sign-in with GitHub
- 🔍 **AI Code Analysis** — GPT-4o-mini analyzes your codebase for issues, security risks, tech debt, and test coverage
- 🚀 **CI/CD Pipeline Generator** — Detects your tech stack and generates tailored GitHub Actions workflows
- 📊 **Health Scores** — At-a-glance code quality metrics per repository
- 🔒 **Secure Token Storage** — GitHub tokens encrypted at rest with AES-256-CBC
- ⚡ **Async Analysis** — Background processing with real-time polling
- 🐳 **Docker Ready** — Full Docker Compose setup for one-command deployment

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Node.js 18, Express, TypeScript, TypeORM |
| **Database** | PostgreSQL 15 |
| **AI** | OpenAI GPT-4o-mini (graceful fallback if key absent) |
| **Auth** | GitHub OAuth 2.0, JWT (jsonwebtoken) |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## Project Structure

```
/
├── backend/                 # Express + TypeScript API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # TypeORM DataSource config
│   │   ├── middleware/       # Auth, rate limit, error handler
│   │   ├── models/          # TypeORM entities
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic & external APIs
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React + TypeScript SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (auth state)
│   │   ├── pages/           # Page components
│   │   └── services/        # API service layer
│   ├── package.json
│   └── vite.config.ts
├── docker/                  # Docker infrastructure
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .env.example
└── docs/                    # Documentation
    ├── API.md
    └── ARCHITECTURE.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- GitHub OAuth App ([create one here](https://github.com/settings/developers))
- OpenAI API key (optional — fallback mode works without it)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd SaaS

# Copy and configure environment variables
cp docker/.env.example docker/.env
# Edit docker/.env with your values
```

**Required environment variables:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/saas_db
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-32-char-encryption-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OPENAI_API_KEY=your-openai-api-key   # optional
```

**GitHub OAuth App setup:**
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:3000/api/auth/callback`

### 2. Run with Docker Compose (Recommended)

```bash
cd docker
cp .env.example .env
# Edit .env with your credentials
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/health

### 3. Run Locally (Development)

**Backend:**
```bash
cd backend
npm install
# Create a .env file in backend/ with the variables above
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| GET | `/api/auth/callback` | OAuth callback, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/repos/github` | List GitHub repos |
| POST | `/api/repos/import/:githubId` | Import a repo |
| GET | `/api/repos` | List imported repos |
| POST | `/api/analysis/:repoId/analyze` | Trigger AI analysis |
| GET | `/api/analysis/:repoId` | Get analysis results |
| POST | `/api/cicd/:repoId/generate` | Generate CI/CD YAML |
| POST | `/api/cicd/:repoId/:id/deploy` | Deploy pipeline (open PR) |
| GET | `/api/cicd/:repoId` | List pipelines |

See [docs/API.md](docs/API.md) for full documentation.

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design, data flow diagrams, and security details.

---

## Security Notes

- GitHub access tokens are encrypted at rest (AES-256-CBC)
- All API routes have rate limiting (100 req/15min)
- JWT authentication required for all resource endpoints
- CORS restricted to configured frontend origin
- No secrets committed to source control