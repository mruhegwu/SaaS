# Architecture Overview

## System Architecture

The SaaS Platform follows a modular monorepo architecture with clear separation between frontend, backend, and shared packages.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Layer                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           React Frontend (Vite + TypeScript)             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │   │
│  │  │   Pages     │  │  Components │  │  Zustand Store  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Express.js API (TypeScript)                    │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐ │   │
│  │  │   Routes   │  │ Controllers │  │    Services      │ │   │
│  │  └────────────┘  └─────────────┘  └──────────────────┘ │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐ │   │
│  │  │ Middleware │  │   Models    │  │  Auth (JWT)      │ │   │
│  │  └────────────┘  └─────────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                  Data Layer                                       │
│  ┌───────────────────────┐  ┌──────────────────────────────┐   │
│  │  PostgreSQL Database   │  │         Redis Cache          │   │
│  │  (TypeORM)             │  │   (Sessions, Rate Limiting)  │   │
│  └───────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
saas/
├── apps/
│   ├── backend/          # Express.js API
│   │   └── src/
│   │       ├── config/   # App configuration
│   │       ├── controllers/  # Request handlers
│   │       ├── middleware/   # Auth, error handling, logging
│   │       ├── models/   # TypeORM entities
│   │       ├── routes/   # API route definitions
│   │       ├── services/ # Business logic
│   │       └── types/    # TypeScript types
│   └── frontend/         # React application
│       └── src/
│           ├── api/      # API client
│           ├── components/  # React components
│           ├── pages/    # Page components
│           ├── store/    # Zustand state
│           └── types/    # TypeScript types
├── packages/
│   └── shared/           # Shared types & utilities
│       └── src/
│           ├── types/    # Shared TypeScript types
│           └── utils/    # Shared utility functions
├── infrastructure/
│   └── terraform/        # IaC for AWS deployment
└── docs/
    └── api/              # OpenAPI specification
```

## Technology Decisions

### Backend
- **Express.js**: Lightweight, flexible HTTP framework
- **TypeScript**: Type safety and better developer experience
- **TypeORM**: Type-safe database ORM with migration support
- **JWT**: Stateless authentication with refresh token rotation
- **Winston**: Structured logging

### Frontend
- **React 18**: Latest features including concurrent mode
- **Vite**: Fast build tool and dev server
- **Zustand**: Lightweight state management
- **React Router v6**: Declarative routing
- **Axios**: HTTP client with interceptors

### Infrastructure
- **Docker**: Containerization for consistent environments
- **PostgreSQL**: ACID-compliant relational database
- **Redis**: Caching and session storage
- **Terraform**: Infrastructure as Code for AWS
- **GitHub Actions**: CI/CD pipelines
