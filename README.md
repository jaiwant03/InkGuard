# INKGUARD — AI-Assisted Brand Governance Platform

> **Tagline:** *Create with confidence. Publish with consistency.*

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-blue.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248.svg)](https://www.mongodb.com)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

INKGUARD is an enterprise-grade brand governance platform designed to review digital content before publication. It verifies submitted text against approved brand guidelines, standardized terminology, validated factual claims, visual identity rules, and accessibility standards.

---

## Table of Contents
1. [Platform Overview & Key Features](#platform-overview--key-features)
2. [Visual Design & UX Architecture](#visual-design--ux-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Installation & Setup](#installation--setup)
7. [Environment Configuration](#environment-configuration)
8. [Database Seeding & Demo Accounts](#database-seeding--demo-accounts)
9. [Running the Application](#running-the-application)
10. [Brand Governance Engine & Scoring Rubric](#brand-governance-engine--scoring-rubric)
11. [AI Integration & Deterministic Fallback](#ai-integration--deterministic-fallback)
12. [API Documentation](#api-documentation)
13. [Security, Privacy & Confidentiality](#security-privacy--confidentiality)
14. [Testing & Verification Results](#testing--verification-results)
15. [Production Build & Deployment](#production-build--deployment)
16. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)

---

## 1. Platform Overview & Key Features

- **Branded Initial Experience:** Elegant 5-second animated splash screen featuring the brand-protection shield emblem and corporate tagline, gracefully transitioning to authenticated views with controlled timer cleanup.
- **Brand Compliance Engine:** Dual-engine architecture combining rigorous deterministic rule checks (prohibited phrases, inconsistent terminology, missing disclosures, expired facts, accessibility shouting, vague hyperlinks) with optional backend-only AI assistance.
- **Compliance Score Ring:** Real-time animated score ring (0–100%) with transparent mathematical rubric deductions (High = -15, Medium = -7, Low = -2) and grade ratings (*Excellent, Strong, Needs Revision, High Risk*).
- **1-Click Suggestion Application:** One-click automated replacement of flagged phrases, preserving previous revisions in historical version snapshots.
- **Interactive Review Studio:** Side-by-side view with live document preview and highlighted finding spans linked directly to database rules.
- **Human Approval & Review Queue:** Multi-stage workflow (*Draft &rarr; In Review &rarr; Changes Requested &rarr; Approved / Rejected*) with reviewer notes, change request comments, and audit logging.
- **Approved Facts & Evidence Repository:** Structured registry for corporate benchmarks, SLA specifications, and legal sources with expiration date monitoring.
- **Brand Identity & Specs:** Centralized repository for brand color palettes (with 1-click Hex copying), typography specs, approved messaging, and prohibited terminology.
- **Brand Asset Library:** Secure upload and categorized library for vector logos, banners, and marketing assets with file size and MIME-type validation.
- **Governance Insights & Analytics:** Analytical dashboard tracking top-triggered rules, recurring terminology pitfalls, review turnaround times, and ambiguous rule identification.
- **Multi-Tenant Workspace & Role Management:** Granular role-based access control (*Creator, Reviewer, Administrator*) with workspace isolation.

---

## 2. Visual Design & UX Architecture

The platform implements a bespoke design system built exclusively with **Vanilla CSS variables** (no Tailwind CSS):
- **Surfaces:** Clean white (`#FFFFFF`) and slate grey (`#F8FAFC`, `#F1F5F9`) backgrounds.
- **Color Palette:** Royal Blue (`#2563EB`) and Indigo (`#4F46E5`) accents with subtle linear gradients.
- **Cards & Shadows:** Large rounded dashboard cards (`border-radius: 18px / 14px`) with soft ambient shadows (`0 4px 20px rgba(15, 23, 42, 0.04)`).
- **Severity Badges:** High-risk (Red `#EF4444`), Medium (Amber `#F59E0B`), and Low (Blue `#3B82F6`).
- **Accessibility:** Visible focus indicators, semantic HTML, and `prefers-reduced-motion` compliance.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite 6
- **Styling:** Vanilla CSS design system (`index.css`) with CSS custom properties
- **Routing:** React Router v6
- **Icons:** Lucide React
- **API Client:** Native Fetch API wrapper with cookie-based credentials and workspace headers

### Backend
- **Runtime:** Node.js v22+
- **Server:** Express.js 4 (ES Modules)
- **Database:** MongoDB with Mongoose 8
- **Authentication:** bcryptjs password hashing and secure HTTP-only cookies
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, and Express Rate Limiting
- **File Handling:** Multer with storage validation
- **Automation:** Native Express orchestration (no external workflow engines)

---

## 4. Folder Structure

```
InkGuard/
├── package.json                   # Root package orchestration
├── .gitignore                     # Git ignore rules
├── backend/
│   ├── package.json               # Backend dependencies and scripts
│   ├── .env.example               # Environment variables template
│   ├── .env                       # Local environment configuration
│   ├── uploads/                   # Local asset storage directory
│   │   ├── sample_logo.svg
│   │   └── sample_banner.svg
│   └── src/
│       ├── app.js                 # Express application & middleware setup
│       ├── server.js              # Server entrypoint
│       ├── config/
│       │   ├── db.js              # MongoDB connection manager
│       │   └── env.js             # Environment variable loader
│       ├── models/                # Mongoose models
│       │   ├── User.js
│       │   ├── Workspace.js
│       │   ├── WorkspaceMember.js
│       │   ├── BrandProfile.js
│       │   ├── BrandRule.js
│       │   ├── ApprovedFact.js
│       │   ├── BrandAsset.js
│       │   ├── ContentDraft.js
│       │   ├── ContentVersion.js
│       │   ├── ReviewRun.js
│       │   ├── Finding.js
│       │   ├── Comment.js
│       │   └── AuditEvent.js
│       ├── middleware/
│       │   ├── auth.js            # JWT & HTTP-only cookie authentication
│       │   ├── workspace.js       # Workspace resolution & role authorization
│       │   ├── errorHandler.js    # Centralized error handler
│       │   └── rateLimiter.js     # Rate limiting protection
│       ├── services/
│       │   ├── deterministicEngine.js  # Rule-based compliance review engine
│       │   ├── aiEngine.js        # Optional AI provider backend adapter
│       │   ├── complianceScorer.js # Score calculation rubric
│       │   └── auditService.js    # Audit log recording service
│       ├── routes/                # REST API routes
│       │   ├── authRoutes.js
│       │   ├── workspaceRoutes.js
│       │   ├── brandProfileRoutes.js
│       │   ├── brandRuleRoutes.js
│       │   ├── approvedFactRoutes.js
│       │   ├── brandAssetRoutes.js
│       │   ├── draftRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── insightRoutes.js
│       │   └── auditRoutes.js
│       ├── validators/            # Zod validation schemas
│       │   └── index.js
│       ├── scripts/
│       │   └── seed.js            # Database seeding script
│       └── tests/
│           └── api.test.js        # Vitest backend integration tests
└── frontend/
    ├── package.json               # Frontend dependencies and scripts
    ├── vite.config.js             # Vite configuration with API proxy
    ├── index.html                 # HTML entry point with Inter font
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Router & protected route setup
        ├── index.css              # Design system & CSS tokens
        ├── context/
        │   ├── AuthContext.jsx    # Session & auth state provider
        │   └── ToastContext.jsx   # Toast notification provider
        ├── services/
        │   └── api.js             # Unified API client
        ├── layouts/
        │   └── AppLayout.jsx      # Persistent shell with sidebar & navbar
        ├── components/
        │   ├── SplashScreen.jsx   # 5-second branded splash screen
        │   ├── Sidebar.jsx        # Collapsible left navigation bar
        │   ├── Navbar.jsx         # Top navigation & user profile
        │   ├── ComplianceScoreRing.jsx # Interactive SVG score ring
        │   └── Badges.jsx         # Severity, claim, and workflow badges
        └── pages/
            ├── Login.jsx          # Login page with demo fast-fill
            ├── Register.jsx       # Registration with live strength meter
            ├── Dashboard.jsx      # Overview dashboard with metrics
            ├── BrandGuidelines.jsx# Rules library & brand profile editor
            ├── ApprovedFacts.jsx  # Approved facts & evidence repository
            ├── BrandAssets.jsx    # Visual asset library with upload
            ├── ContentReview.jsx  # Content review studio
            ├── ReviewResults.jsx  # Review results & 1-click suggestion app
            ├── ApprovalQueue.jsx  # Human reviewer approval queue
            ├── ReviewHistory.jsx  # Governance audit trail & version diff
            ├── GovernanceInsights.jsx # Insights & analytics dashboard
            └── WorkspaceSettings.jsx  # Team roles & workspace settings
```

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher (v22 LTS recommended)
- **npm:** v9.0.0 or higher
- **MongoDB:** v6.0 or higher running locally on port `27017` or accessible via connection URI

---

## 6. Installation & Setup

Clone the repository and install all dependencies:

```bash
# Clone repository
git clone <repository-url>
cd "InkGuard-AI Powered Brand Governance Platform"

# Install both backend and frontend dependencies
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 7. Environment Configuration

### Backend Configuration (`backend/.env`)

Create `backend/.env` (a template is provided in `backend/.env.example`):

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/inkguard
JWT_SECRET=inkguard_super_secure_jwt_secret_change_in_production_9876543210
COOKIE_SECRET=inkguard_cookie_secret_key_12345
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional AI Integration: Leave empty to run in 100% deterministic rule mode
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 8. Database Seeding & Demo Accounts

To populate the database with a complete enterprise brand workspace (**Apex Cloud Solutions**), realistic brand rules across all 9 categories, approved facts, assets, drafts, and historical review runs:

```bash
npm run seed
```

### Pre-Configured Demo Accounts:
| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@inkguard.demo` | `Password123!` | Full control: guidelines, members, roles, settings |
| **Reviewer** | `reviewer@inkguard.demo` | `Password123!` | Audit approval, request changes, rule management |
| **Creator** | `creator@inkguard.demo` | `Password123!` | Draft authoring, self-audit, submit for review |

> **Note:** The Login page includes fast 1-click demo role buttons for rapid evaluation.

---

## 9. Running the Application

### Start Backend Server:
```bash
npm run dev:backend
# Server runs on: http://localhost:5000
# Health check:  http://localhost:5000/api/health
```

### Start Frontend Server:
```bash
npm run dev:frontend
# Client runs on: http://localhost:5173
```

---

## 10. Brand Governance Engine & Scoring Rubric

### Deterministic Rule Engine
The deterministic engine runs directly on the Express backend and evaluates submitted content against active workspace database records:
1. **Prohibited Phrases:** Exact and boundary-aware regex matching for discouraged or banned phrasing.
2. **Product Naming Standards:** Detects unauthorized abbreviations (e.g. flagging `"ACE platform"` in favor of `"Apex Cloud Enterprise"`).
3. **Terminology Consistency:** Recommends preferred corporate terminology (e.g. `"Client Success Team"` instead of `"helpdesk"`).
4. **Required Phrases & Disclaimers:** Validates mandatory disclosures (e.g. registered trademark notices).
5. **Absolute Promotional Claims:** Flags legally risky absolutes such as `"100% guaranteed"`, `"fail-proof"`, or `"hack-proof"`.
6. **Outdated Approved Facts:** Scans for references to expired facts and prompts for verification.
7. **Accessibility Checks:** Detects non-descriptive anchor text (`"click here"`) and all-caps shouting.

### Scoring Rubric Formula
$$\text{Compliance Score} = \max\left(0, 100 - (15 \times H + 7 \times M + 2 \times L)\right)$$

Where:
- $H$ = Open High-Risk Findings (Legal liability, prohibited claims)
- $M$ = Open Medium-Risk Findings (Terminology deviations, expired facts)
- $L$ = Open Low-Risk Findings (Accessibility advice, formatting)

### Grade Scale
- **90% – 100%:** *Excellent* (Full brand alignment)
- **75% – 89%:** *Strong* (Minor terminology tweaks recommended)
- **55% – 74%:** *Needs Revision* (Significant issues must be addressed before sign-off)
- **0% – 54%:** *High Risk* (Severe brand risk; non-publishable)

---

## 11. AI Integration & Deterministic Fallback

- **Backend-Only Security:** External AI keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`) are stored exclusively in backend environment variables and are never transmitted to the browser.
- **Graceful Deterministic Fallback:** When no AI API key is configured, the platform operates in full deterministic rule-based mode. The UI transparently indicates: `"Deterministic Rule Engine Active"`.
- **Untrusted Output Sanitization:** When AI is configured, the model response is validated against strict schemas, character spans are matched against the original text, and all referenced rule IDs are verified against MongoDB before storing.

---

## 12. API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health and DB status | Public |
| `POST` | `/api/auth/register` | Register user and create default workspace | Public |
| `POST` | `/api/auth/login` | Sign in and set HTTP-only cookie | Public |
| `POST` | `/api/auth/logout` | Invalidate session and clear cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user session and role | Authenticated |
| `GET` | `/api/workspaces` | List member workspaces | Authenticated |
| `POST` | `/api/workspaces` | Create new workspace | Authenticated |
| `POST` | `/api/workspaces/switch/:id` | Switch active workspace | Authenticated |
| `GET` | `/api/brand-profile` | Get workspace brand guidelines profile | Authenticated |
| `PUT` | `/api/brand-profile` | Update brand tone, colors, and typography | Reviewer / Admin |
| `GET` | `/api/brand-rules` | List brand rules with filters | Authenticated |
| `POST` | `/api/brand-rules` | Create brand rule | Reviewer / Admin |
| `PUT` | `/api/brand-rules/:id` | Update brand rule | Reviewer / Admin |
| `DELETE`| `/api/brand-rules/:id` | Delete brand rule | Admin |
| `GET` | `/api/approved-facts` | List approved facts and sources | Authenticated |
| `POST` | `/api/approved-facts` | Create approved fact record | Reviewer / Admin |
| `GET` | `/api/brand-assets` | List approved brand assets | Authenticated |
| `POST` | `/api/brand-assets` | Upload visual asset (Multer) | Reviewer / Admin |
| `GET` | `/api/drafts` | List content drafts | Authenticated |
| `POST` | `/api/drafts` | Create new content draft (v1) | Authenticated |
| `POST` | `/api/drafts/:id/review` | Run Brand Governance Audit | Authenticated |
| `POST` | `/api/drafts/:id/apply-finding/:fId` | 1-Click apply suggested correction | Authenticated |
| `PATCH`| `/api/drafts/:id/findings/:fId/status` | Dismiss or resolve finding | Authenticated |
| `POST` | `/api/drafts/:id/submit` | Submit draft for approval | Creator |
| `POST` | `/api/drafts/:id/decision` | Approve, request changes, or reject | Reviewer / Admin |
| `GET` | `/api/drafts/:id/versions` | Retrieve version snapshots | Authenticated |
| `GET` | `/api/dashboard/metrics` | Real aggregated dashboard metrics | Authenticated |
| `GET` | `/api/insights` | Governance analytics and ambiguity metrics | Authenticated |
| `GET` | `/api/audit` | Immutable audit trail logs | Authenticated |

---

## 13. Security, Privacy & Confidentiality

- **Password Protection:** Passwords are salted and hashed using `bcryptjs` with 10 rounds. Plaintext passwords are never stored.
- **Session Security:** Sessions are maintained via secure, `httpOnly`, `SameSite: lax` cookies. Authentication tokens are never stored in browser `localStorage`.
- **Tenant Isolation:** Every request is authenticated and mapped to the active workspace with strict database filtering on `workspace: req.workspace._id`.
- **Role Enforcement:** Sensitive operations (rule creation, member role management, draft approval) enforce role restrictions (*Creator, Reviewer, Administrator*) at the backend middleware layer.
- **Confidentiality:** Content drafts are evaluated locally and are never shared with external third-party services unless an explicit AI provider key is authorized.
- **Audit Logging:** Every administrative and governance action (*user login, draft submission, review run, suggestion applied, approval decision*) is logged to an immutable `AuditEvent` collection.

---

## 14. Testing & Verification Results

### Automated Backend Tests
Run the Vitest integration suite:

```bash
npm run test
```

**Results:**
```
 ✓ src/tests/api.test.js (7 tests) 913ms
   ✓ GET /api/health should return 200 with system status and tagline
   ✓ POST /api/auth/login with valid credentials should sign in and return cookie
   ✓ POST /api/auth/login with invalid password should fail with 401
   ✓ GET /api/auth/me should verify active session with valid cookie
   ✓ GET /api/brand-rules should list active rules for the workspace
   ✓ POST /api/drafts should create a new content draft and run review
   ✓ GET /api/dashboard/metrics should return calculated persisted metrics

 Test Files  1 passed (1)
      Tests  7 passed (7)
```

### End-to-End Browser Subagent Verification
The application was verified live in Chromium:
1. **Splash Screen:** Displayed animated shield emblem, wordmark, tagline, and progress timer; smoothly transitioned to login.
2. **Authentication:** Fast-fill demo credentials logged in securely with cookie verification.
3. **Dashboard:** Compliance score ring, high-risk flags, recent drafts, and trend charts rendered from MongoDB.
4. **Content Review:** Loaded violation test copy, executed brand audit, and redirected to Review Results.
5. **Review Results:** Highlighted prohibited phrase `"ACE platform"`, displayed compliance score 58%, and applied 1-click suggested correction (`"Apex Cloud Enterprise"`), incrementing draft to `v2` and recalculating the score.
6. **Audit Trail:** Confirmed that the `FINDING_APPLIED` event was recorded in the immutable audit log with full actor attribution.

---

## 15. Production Build & Deployment

To generate an optimized production bundle:

```bash
npm run build:frontend
```

**Build Output:**
```
✓ 1602 modules transformed.
dist/index.html                   1.43 kB │ gzip:  0.76 kB
dist/assets/index-BQPq-9PL.css    8.73 kB │ gzip:  2.62 kB
dist/assets/index-BmZRMO4j.js   340.75 kB │ gzip: 88.12 kB
✓ built in 7.38s
```

In production, serve the static `frontend/dist` directory using Express or an Nginx reverse proxy pointing to the Node.js backend.

---

## 16. Known Limitations & Future Roadmap

- **Known Limitations:**
  - File upload currently defaults to local disk storage (`uploads/`). In cloud deployments, an S3/GCS bucket adapter is recommended.
  - Multi-page PDF parsing requires pre-extraction to plain text before submission.
- **Future Improvements:**
  - Browser extension (Chrome/Edge) to audit content directly inside Google Docs and CMS editors.
  - Granular Figma plugin integration to inspect typography and color tokens directly against Figma design systems.
  - Multi-language terminology dictionaries for global brand localization.

---

## 17. Production Deployment (Vercel + Render)

The project includes ready-to-deploy configurations for:
- **Frontend on Vercel**: Configured with Vite, SPA client-side route rewrites (`vercel.json`), persistent Bearer auth, and dynamic API URL resolution via `VITE_API_URL`.
- **Backend on Render**: Configured with reverse-proxy trust (`app.set('trust proxy', 1)`), flexible multi-origin CORS with Vercel preview support, Render Blueprint (`render.yaml`), and health check endpoint `/api/health`.

For full step-by-step instructions, see [DEPLOYMENT.md](file:///d:/Dev/Projects/InkGuard-AI%20Powered%20Brand%20Governance%20Platform/DEPLOYMENT.md).

