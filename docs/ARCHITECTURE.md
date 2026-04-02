# Architecture Documentation

## System Overview

GitHub AI DevOps Platform is a full-stack SaaS application that integrates GitHub OAuth, AI-powered code analysis (via OpenAI GPT-4o-mini), and automated CI/CD pipeline generation.

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                       │
│                  React + TypeScript SPA                 │
│              (Vite, Tailwind CSS, React Router)         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS / REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend API Server                    │
│               Express + TypeScript (Node.js)            │
├──────────────────┬──────────────────┬───────────────────┤
│   Auth Routes    │   Repo Routes    │  Analysis Routes  │
│  /api/auth/*     │  /api/repos/*    │  /api/analysis/*  │
├──────────────────┴──────────────────┴───────────────────┤
│                    CI/CD Routes                         │
│                   /api/cicd/*                           │
├─────────────────────────────────────────────────────────┤
│              Middleware Layer                           │
│  JWT Auth │ Rate Limiting │ CORS │ Error Handler        │
├─────────────────────────────────────────────────────────┤
│              Service Layer                              │
│  GitHub Service │ AI Service │ Analysis │ CI/CD         │
└────────┬──────────────┬────────────────────────────────┘
         │              │
         ▼              ▼
┌──────────────┐  ┌─────────────────────────────────────┐
│  PostgreSQL  │  │         External APIs               │
│   (TypeORM)  │  │  GitHub REST API │ OpenAI API       │
└──────────────┘  └─────────────────────────────────────┘
```

---

## Component Architecture

### Backend

#### Entry Point (`src/index.ts`)
Bootstraps Express app, connects TypeORM to PostgreSQL, mounts routes with middleware.

#### Models (TypeORM Entities)

| Model | Purpose |
|-------|---------|
| `User` | Stores GitHub user profile and encrypted access token |
| `Repository` | Tracks imported GitHub repositories per user |
| `Analysis` | Stores async AI analysis results per repository |
| `Pipeline` | Stores generated CI/CD YAML and deployment PR URLs |

#### Middleware

| Middleware | Purpose |
|-----------|---------|
| `auth.middleware.ts` | Verifies JWT Bearer token, injects `userId` into request |
| `rateLimit.middleware.ts` | 100 requests per 15-minute window per IP |
| `errorHandler.middleware.ts` | Centralizes error responses, logs stack traces |

#### Services

| Service | Responsibility |
|---------|---------------|
| `github.service.ts` | GitHub REST API: OAuth, repos, files, branches, PRs |
| `ai.service.ts` | OpenAI GPT-4o-mini: code analysis + YAML generation with fallback |
| `analysis.service.ts` | Async analysis orchestration: triggers background job, writes DB |
| `cicd.service.ts` | Tech stack detection, pipeline generation, branch + PR creation |
| `encryption.service.ts` | AES-256-CBC encryption/decryption for GitHub access tokens |

### Frontend

#### State Management
- **React Context** (`AuthContext.tsx`) manages authentication state globally
- Local component state for UI interactions
- No external state management library required

#### Routing (React Router v6)
```
/login              → LoginPage (public)
/auth/callback      → AuthCallback (extracts JWT from URL)
/                   → DashboardPage (protected)
/repos/:repoId      → RepositoryPage (protected, tabs: Analysis / Pipeline)
/repos/:repoId/analysis → AnalysisPage (protected, detailed view)
```

#### Service Layer (`src/services/`)
All services use a shared axios instance (`api.ts`) with:
- Automatic JWT injection via request interceptor
- Automatic 401 → redirect to `/login` via response interceptor

---

## Data Flow

### Authentication Flow
```
1. User clicks "Sign in with GitHub"
2. Frontend → GET /api/auth/github → Redirect to GitHub OAuth
3. GitHub → GET /api/auth/callback?code=XXX
4. Backend exchanges code → GitHub access token
5. Backend fetches GitHub user profile
6. Backend upserts User in PostgreSQL (encrypted token stored)
7. Backend signs JWT (7-day expiry) → Redirect to frontend with token
8. Frontend stores JWT in localStorage, fetches /api/auth/me
```

### Code Analysis Flow
```
1. User clicks "Run Analysis" on a repo
2. Frontend → POST /api/analysis/:repoId/analyze
3. Backend creates Analysis record (status: pending)
4. Background job starts (non-blocking):
   a. Decrypts user's GitHub token
   b. Fetches repo file tree via GitHub API
   c. Reads sample code files (up to 3)
   d. Calls OpenAI GPT-4o-mini for structured analysis
   e. Updates Analysis record (status: completed)
5. Frontend polls GET /api/analysis/:repoId every 3s
6. Displays results when status === 'completed'
```

### Pipeline Generation & Deployment Flow
```
1. User clicks "Generate Pipeline"
2. Frontend → POST /api/cicd/:repoId/generate
3. Backend:
   a. Detects tech stack from repo file names
   b. Calls OpenAI for GitHub Actions YAML (or uses template fallback)
   c. Saves Pipeline record (status: draft)
4. User reviews YAML, clicks "Deploy (Open PR)"
5. Frontend → POST /api/cicd/:repoId/:id/deploy
6. Backend:
   a. Gets default branch SHA
   b. Creates feature branch: feature/add-cicd-pipeline-{timestamp}
   c. Commits .github/workflows/ci-cd.yml to branch
   d. Opens Pull Request on GitHub
   e. Updates Pipeline record (status: deployed, prUrl: ...)
7. User clicks "View PR" to review on GitHub
```

---

## Security Design

### Token Storage
GitHub OAuth access tokens are **never stored in plaintext**. They are encrypted with AES-256-CBC using a server-side `ENCRYPTION_KEY` before persistence in PostgreSQL.

### JWT
- Signed with `JWT_SECRET` (HS256)
- 7-day expiry
- Contains `userId` and short-lived GitHub token for request context

### Rate Limiting
All API routes are protected with a 100 requests/15-minute rate limit per IP, enforced by `express-rate-limit`.

### CORS
Configured to allow requests only from the configured `FRONTEND_URL`.

### Environment Variables
All secrets (`JWT_SECRET`, `GITHUB_CLIENT_SECRET`, `OPENAI_API_KEY`, `ENCRYPTION_KEY`, `DATABASE_URL`) are loaded from environment variables via `dotenv`. Never committed to source control.

---

## Database Schema

```
users
  id (uuid, PK)
  githubId (varchar, unique)
  username (varchar)
  email (varchar)
  accessToken (varchar, encrypted)
  avatarUrl (varchar)
  createdAt (timestamp)

repositories
  id (uuid, PK)
  githubId (varchar)
  name (varchar)
  fullName (varchar)
  description (varchar)
  language (varchar)
  private (boolean)
  userId (uuid, FK → users.id)
  createdAt (timestamp)

analyses
  id (uuid, PK)
  repositoryId (uuid, FK → repositories.id)
  status (varchar: pending|running|completed|failed)
  summary (text)
  issues (jsonb)
  suggestions (jsonb)
  codeQualityScore (float)
  techDebt (float)
  securityRisks (jsonb)
  testCoverage (float)
  createdAt (timestamp)
  updatedAt (timestamp)

pipelines
  id (uuid, PK)
  repositoryId (uuid, FK → repositories.id)
  name (varchar)
  yamlContent (text)
  status (varchar: draft|deployed|failed)
  prUrl (varchar)
  createdAt (timestamp)
```

---

## Infrastructure (Docker)

- **postgres** — PostgreSQL 15 with health check
- **backend** — Node.js 18 (multi-stage build: tsc compile → lean runtime)
- **frontend** — Nginx alpine serving pre-built React SPA, proxying `/api/` to backend

All services communicate over the default Docker bridge network. Only required ports are exposed to the host.
