# SaaS Platform

[![CI](https://github.com/mruhegwu/SaaS/actions/workflows/ci.yml/badge.svg)](https://github.com/mruhegwu/SaaS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready, full-stack SaaS application scaffold built with TypeScript, React, and Node.js.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with refresh tokens
- 🗄️ **Database** - PostgreSQL with TypeORM migrations
- 🚀 **API** - RESTful API with OpenAPI/Swagger documentation
- ⚛️ **Frontend** - React with TypeScript and Vite
- 🐳 **Docker** - Containerized development and production environments
- 🔄 **CI/CD** - GitHub Actions pipelines for testing, building, and deployment
- 🛡️ **Security** - Input validation, rate limiting, CORS, and security headers
- 📊 **Logging** - Structured logging with Winston
- 🧪 **Testing** - Jest for unit/integration tests
- 📦 **Monorepo** - Organized workspace with shared packages

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SaaS Platform                        │
├─────────────────┬───────────────────┬───────────────────────┤
│    Frontend     │      Backend      │     Infrastructure    │
│  (React/Vite)  │  (Express/Node)   │    (PostgreSQL/Redis) │
│   Port: 5173   │    Port: 3000     │                       │
├─────────────────┴───────────────────┴───────────────────────┤
│                    Shared Packages                           │
│              (Types, Utilities, Validation)                  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Zustand, React Router |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL, TypeORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Testing | Jest, React Testing Library |
| DevOps | Docker, GitHub Actions |
| IaC | Terraform (AWS) |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/mruhegwu/SaaS.git
cd SaaS

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
createdb saas_db

# Start development servers
npm run dev
```

## Development

### Project Structure

```
saas/
├── apps/
│   ├── backend/          # Express.js API server
│   └── frontend/         # React application
├── packages/
│   └── shared/           # Shared types, utilities
├── infrastructure/
│   └── terraform/        # AWS infrastructure
├── docs/
│   └── api/              # OpenAPI specification
└── .github/
    └── workflows/        # CI/CD pipelines
```

### Available Scripts

```bash
# Development
npm run dev              # Start all apps in dev mode
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build            # Build all apps
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Testing
npm run test             # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Lint all files
npm run lint:fix         # Auto-fix lint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI Spec**: http://localhost:3000/api/docs.json

See [docs/api/openapi.yaml](docs/api/openapi.yaml) for the full API specification.

## Environment Variables

See [.env.example](.env.example) for all available environment variables.

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing |

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific workspace
npm run test:backend
npm run test:frontend
```

## Deployment

### Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### AWS (Terraform)

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="production.tfvars"

# Apply
terraform apply -var-file="production.tfvars"
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.