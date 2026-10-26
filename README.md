<div align="center">

# AuthFlow

### Authentication engineered beyond the happy path.

**A full-stack authentication application built with Next.js, TypeScript, MongoDB, JWT, and Upstash Redis — with secure session handling, email workflows, API rate limiting, and measured performance improvements.**

[**Live Application**](https://authflow-navy.vercel.app/) · [**Try Login**](https://authflow-navy.vercel.app/login) · [**Technical Highlights**](#engineering-highlights) · [**Run Locally**](#getting-started)

</div>

---

## Why AuthFlow?

Authentication is more than a login form. A production-facing system must handle invalid credentials, expired sessions, account verification, password recovery, abuse prevention, and database efficiency — without making the experience confusing for legitimate users.

I built **AuthFlow** to explore those engineering challenges end to end: from API design and data modeling to session invalidation, Redis-backed request limits, performance benchmarking, and deployment.

> **The goal:** build an authentication system that is understandable to users, maintainable for developers, and resilient to common failure cases.

## At a glance

| Area | Implementation |
| --- | --- |
| Framework | Next.js App Router, React, TypeScript |
| Data layer | MongoDB Atlas, Mongoose |
| Authentication | JWT in HTTP-only cookies, bcryptjs password hashing |
| Session management | Token-version checks for session invalidation |
| Abuse prevention | Upstash Redis sliding-window login rate limiting |
| Email | Nodemailer-based verification and password recovery flows |
| UI | Tailwind CSS, Axios, React Hot Toast |
| Deployment | Vercel |
| Performance testing | k6 against a locally running production build |

## Features

- **Account creation and sign-in** — registration, credential validation, and helpful error states.
- **Password protection** — passwords are hashed using `bcryptjs` rather than stored as plaintext.
- **JWT-based sessions** — signed tokens are delivered through HTTP-only cookies.
- **Protected routes** — authenticated-only profile access and redirects for signed-in/signed-out users.
- **Session invalidation** — token-version validation allows previously issued sessions to be rejected.
- **Email verification** — token-based verification workflow with an expiration period.
- **Password recovery** — email-based reset workflow.
- **Login rate limiting** — a Redis-backed sliding window allows **5 login requests per 60 seconds per identifier**, returning HTTP `429` when exceeded.
- **User-friendly cooldown** — the login form reads the `Retry-After` header and displays a live countdown before re-enabling submission.
- **Failure-aware UI** — distinct feedback for invalid credentials, rate limits, temporary service unavailability, and network errors.

## Engineering highlights

### 1. Redis-backed login protection

The login endpoint applies an Upstash Redis sliding-window limiter **before** processing credentials.

```text
POST /api/users/login
        |
        v
Identify client (trusted deployment proxy)
        |
        v
Redis sliding-window check (5 requests / 60 seconds)
        |
        +---- Limit exceeded ---> HTTP 429 + Retry-After
        |
        +---- Redis unavailable -> HTTP 503
        |
        v
Validate request and credentials
        |
        +---- Invalid ----------> HTTP 400 / 401
        |
        v
Issue JWT in HTTP-only cookie
        |
        v
HTTP 200
```

**Design choices:**

- The server enforces limits; the countdown is only a user-experience enhancement.
- The login limiter uses a shared Redis store rather than process-local memory, so counters can persist across serverless instances.
- A Redis failure causes the login endpoint to return `503` rather than silently bypassing the limit (**fail-closed** behavior).
- In the Vercel deployment, the client identifier is derived from the platform's forwarded IP information. Deploying behind a different proxy requires reviewing the trust boundary.

**Verified locally and in production:** invalid credentials return `401`, the sixth rapid attempt returns `429`, the `Retry-After` header is populated, and login succeeds after the cooldown.

### 2. Revocable JWT sessions

A signed JWT is not automatically revocable before expiry. AuthFlow includes a **token version** in its session validation strategy: the token's version is checked against the user's current version in MongoDB. When those versions differ, the session is rejected.

This provides a straightforward way to invalidate previously issued sessions without maintaining a separate database record for every token.

### 3. A faster authenticated profile API

The original profile flow performed **two sequential MongoDB queries**: one during token-version validation and another to fetch profile data.

I refactored this into a shared authentication helper that verifies the JWT and retrieves the required profile fields in **one database query**.

#### Benchmark results

A locally running production build was tested with **k6, 5 virtual users, 30-second runs**. The values below are means across three runs for each version.

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Mean response time | 66.69 ms | 45.83 ms | **31.3% lower** |
| P50 latency | 64.20 ms | 39.82 ms | **38.0% lower** |
| P95 latency | 85.88 ms | 63.26 ms | **26.3% lower** |
| P99 latency | 92.93 ms | 190.01 ms | Higher / more variable |

**Interpretation:** average and P95 latency improved under this specific local workload. P99 did not improve, so the results should **not** be interpreted as a universal latency improvement or production performance guarantee. These tests were conducted locally, not as load tests against the live deployment.

## Architecture

```text
Browser (Next.js / React UI)
    |
    | Axios requests + HTTP-only session cookie
    v
Next.js App Router
    |
    +-- Authentication API routes
    |      |
    |      +-- Login -> Upstash Redis rate limit
    |      |
    |      +-- Signup / Email verification / Password recovery
    |      |
    |      +-- JWT issuance and validation
    |
    +-- Protected profile API
           |
           +-- Verify JWT + token version
           |
           v
      MongoDB Atlas (Mongoose)

Email workflows -> Nodemailer -> Configured SMTP provider
```

## API overview

| Route | Purpose |
| --- | --- |
| `POST /api/users/signup` | Register an account |
| `POST /api/users/login` | Authenticate and establish a session |
| `GET /api/users/logout` | End a session |
| `POST /api/users/verifytoken` | Verify an email token |

The project also includes protected profile and password-recovery functionality. Refer to the source routes for their exact endpoint paths and request contracts.

### Login response behavior

| Status | Meaning |
| --- | --- |
| `200` | Successful login |
| `400` | Invalid or missing request data |
| `401` | Invalid credentials |
| `429` | Too many login requests; includes `Retry-After` |
| `503` | Login temporarily unavailable because rate-limit infrastructure could not be reached |
| `500` | Unexpected server error |

## Getting started

### Prerequisites

- Node.js and npm (use a version compatible with the project's Next.js release)
- MongoDB connection string
- Upstash Redis database with REST credentials
- SMTP credentials for email workflows

### 1. Clone and install

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd authflow
npm install
```

Replace the repository URL with your actual GitHub repository link.

### 2. Configure environment variables

Create `.env.local` in the project root. The application uses the following core variables:

```dotenv
MONGO_URL=your_mongodb_connection_string
TOKEN_SECRET=your_long_random_jwt_secret
DOMAIN=http://localhost:3000

UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Add the SMTP variables required by src/helpers/mailer.ts.
# Use that file as the source of truth for their exact names.
```

**Security:** Never commit `.env.local`, access tokens, SMTP credentials, or database connection strings. Configure secrets through your hosting provider's environment-variable settings for deployment.

### 3. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Validate a production build

```bash
npx tsc --noEmit
npm run build
npm run start
```

Use the production build when benchmarking: development mode adds instrumentation and overhead that can distort measurements.

## Testing and verification

The project has been manually verified for:

- Registration and login flows
- Incorrect-credential feedback
- Protected profile access and session rejection
- Login recovery after rate-limit cooldown
- `429` responses and `Retry-After` headers
- Live frontend countdown and disabled submit state
- Successful production build and deployment

**Performance work:** the authenticated profile API was benchmarked with k6 using a dedicated test account and database. Production was **not** load-tested.

> Automated test-suite coverage is not claimed here; the checks above describe the manual and benchmarking work performed.

## Deployment notes

AuthFlow is deployed on **Vercel**. Set the application environment variables in Vercel before deploying, including:

- MongoDB and JWT configuration
- SMTP configuration
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

The rate limiter uses a trusted proxy's client-IP forwarding behavior on Vercel. If the app is moved to a different host, review the client identification strategy rather than trusting arbitrary request headers.

**Live demo:** https://authflow-navy.vercel.app/

## What I learned

Building AuthFlow strengthened my understanding of:

1. **Authentication security:** password hashing, cookie-based sessions, token expiry, and session invalidation.
2. **Distributed state:** why serverless rate limiting benefits from a shared store such as Redis.
3. **Performance engineering:** identifying redundant database work, measuring changes, and reporting tail-latency trade-offs honestly.
4. **Production debugging:** diagnosing environment differences between local Windows builds and Linux-based deployments.
5. **Full-stack UX:** translating backend failures into clear, actionable messages for users.

## Future improvements

Possible next steps include automated integration tests, additional account-recovery protections, accessibility audits, and deeper tail-latency investigation. These are **future ideas**, not features claimed as already implemented.

---

<div align="center">

**Built to learn how authentication systems behave in the real world — not just when everything goes right.**

[Explore the live application](https://authflow-navy.vercel.app/)

</div>
