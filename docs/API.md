# API Documentation

Base URL: `http://localhost:3000/api`

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### `GET /api/auth/github`
Redirects the user to GitHub OAuth login page.

**Response:** `302 Redirect` to GitHub OAuth

---

### `GET /api/auth/callback?code=<github_code>`
GitHub OAuth callback. Exchanges code for access token, creates/updates user, returns JWT.

**Response:** `302 Redirect` to `FRONTEND_URL/auth/callback?token=<jwt>`

---

### `GET /api/auth/me`
Returns current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "username": "octocat",
  "email": "octocat@github.com",
  "avatarUrl": "https://avatars.githubusercontent.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Repositories

### `GET /api/repos/github`
List all GitHub repositories for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 12345,
    "name": "my-repo",
    "full_name": "octocat/my-repo",
    "description": "A cool project",
    "language": "TypeScript",
    "private": false,
    "default_branch": "main",
    "owner": { "login": "octocat" }
  }
]
```

---

### `POST /api/repos/import/:githubId`
Import a GitHub repository into the platform.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "id": 12345,
  "name": "my-repo",
  "full_name": "octocat/my-repo",
  "description": "A cool project",
  "language": "TypeScript",
  "private": false
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "githubId": "12345",
  "name": "my-repo",
  "fullName": "octocat/my-repo",
  "description": "A cool project",
  "language": "TypeScript",
  "private": false,
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api/repos`
List all imported repositories for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of imported repository objects (same shape as above).

---

## Analysis

### `POST /api/analysis/:repoId/analyze`
Trigger an AI-powered analysis of a repository. Runs asynchronously.

**Headers:** `Authorization: Bearer <token>`

**Response:** `202 Accepted`
```json
{
  "id": "uuid",
  "repositoryId": "repo-uuid",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api/analysis/:repoId`
Get the latest analysis result for a repository.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "repositoryId": "repo-uuid",
  "status": "completed",
  "summary": "A TypeScript project with 42 files...",
  "issues": [
    { "severity": "high", "description": "Missing input validation", "file": "src/api.ts" },
    { "severity": "medium", "description": "No error boundaries in React components" }
  ],
  "suggestions": [
    { "category": "Testing", "description": "Add unit tests for service layer" }
  ],
  "codeQualityScore": 78,
  "techDebt": 25,
  "securityRisks": [
    { "description": "Dependency X has known CVE", "severity": "high" }
  ],
  "testCoverage": 45,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:01:30.000Z"
}
```

**Status values:** `pending` | `running` | `completed` | `failed`

---

## CI/CD Pipelines

### `POST /api/cicd/:repoId/generate`
Generate an AI-powered CI/CD pipeline YAML for a repository.

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "repositoryId": "repo-uuid",
  "name": "CI/CD Pipeline for my-repo",
  "yamlContent": "name: CI/CD Pipeline...",
  "status": "draft",
  "prUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `POST /api/cicd/:repoId/:id/deploy`
Deploy a pipeline by creating a feature branch and opening a pull request.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "repositoryId": "repo-uuid",
  "name": "CI/CD Pipeline for my-repo",
  "yamlContent": "name: CI/CD Pipeline...",
  "status": "deployed",
  "prUrl": "https://github.com/octocat/my-repo/pull/1",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api/cicd/:repoId`
List all pipelines for a repository.

**Headers:** `Authorization: Bearer <token>`

**Response:** Array of pipeline objects.

---

## Health Check

### `GET /api/health`
Check if the API server is running.

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Error Responses

All error responses follow this format:
```json
{ "error": "Error message description" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — missing or invalid parameters |
| 401 | Unauthorized — missing or invalid JWT |
| 404 | Not Found — resource doesn't exist |
| 429 | Too Many Requests — rate limit exceeded (100 req/15min) |
| 500 | Internal Server Error |
