# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- Fixed Web CI workflow failure by removing package-lock.json cache dependency
- Changed from `npm ci` to `npm install` in CI workflow since package-lock.json is not committed

### Security
- **CRITICAL**: Updated Next.js from 14.1.0 to 15.2.8 to address multiple security vulnerabilities:
  - CVE: HTTP request deserialization DoS with insecure React Server Components
  - CVE: Denial of Service with Server Components (multiple incomplete fix follow-ups)
  - CVE: Authorization bypass vulnerability
  - CVE: Cache poisoning vulnerability
  - CVE: Server-Side Request Forgery in Server Actions
  - CVE: Authorization Bypass in Next.js Middleware
  
  All users are strongly recommended to update to this version immediately.

### Changed
- Updated `eslint-config-next` to 15.2.8 to match Next.js version

## [1.0.0] - 2026-02-17

### Added
- Initial implementation of LLM Benchmarking Agent
- FastAPI backend with CRUD operations for automations, scenarios, and runs
- Next.js frontend with dashboard, runs list, and detail pages
- PostgreSQL database with Alembic migrations
- Docker Compose for local development
- Render deployment configuration
- GitHub Actions CI/CD pipelines
- TinyFish integration with mock mode
- Comprehensive documentation (README, QUICKSTART, ARCHITECTURE)
- Sample data seeding script
- Automated setup script

### Features
- Non-streaming benchmarking via TinyFish automation runs
- Total Time to Generation metrics
- Streaming-ready architecture (TTFT/Inter-token fields)
- Custom web dashboard with KPIs (p50/p95/p99, success rate)
- Runs management with filtering
- Scenarios and Automations CRUD operations
- Background task execution
- Health checks and monitoring

[Unreleased]: https://github.com/Pritiks23/LLM-Inference-/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Pritiks23/LLM-Inference-/releases/tag/v1.0.0
