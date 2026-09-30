# Ripple – Trust layer for fragmented knowledge

Find the documents. Know which one to believe.

**Solo build for SD Worx, Tectonic Hackathon 2026** (55 min).

## What it does

Consultant picks sources → Ripple scores each one (recency, authority, conflicts) → if top score < 80, **Ask expert** →
expert verifies one fact → all scores recalculate. Verified answers stay on top (green); conflicting ones cap at 40 (red).

## Run

```bash
npm install
npm run dev
# http://localhost:3000/login
```

Demo users: `lotte@ripple.demo`, `karim@ripple.demo`, `pieter@ripple.demo`, `sergio@ripple.demo` · password `<name>123`.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind** (no shadcn)
- **jose** (session JWT)
- **Zod** (validation)
- **In-memory store** (no DB)
- **SD Worx branding**: navy `#1d2830`, red `#f1002f`, yellow `#ffbe00`, blue `#006dd8`

## Architecture

### Scoring (lib/scoring.ts)

Pure function: authority (30/25/15/5/0) + recency (25/15/5) + owner (15/0) + scope (15/0) + consistency (15/7/0).
Conflict cap: 40. Demo scores: d-05 **82** → **90** after verify; d-01/m-01/k-01/d-02 **40** after verify.

### Security

- Session: jose HS256 JWT, httpOnly cookie, SameSite=Lax
- Passwords: scrypt salt:hash hex, no bcrypt
- Access: every API route checks `canAccessProject()`, 404 for non-members (never 403)
- Rate limit: 20 analyse calls / 10 min
- No credentials in code; secrets in `.env.local` (gitignored)

### Demo flow

1. Lotte creates project "Brasserie Noord – January 2027 indexation"
2. Selects sources → scores appear
3. d-05 (legal memo) on top at 82; conflicts visible
4. Asks Pieter (expert) to verify
5. Pieter verifies: "Centenindex applies"
6. d-05 jumps to 90; conflicting sources → 40
7. Sergio (not a member) tries `/api/projects/<id>` → **404**

## Not built (out of scope per plan)

- Live Gemini (cached claims only for now)
- Notes / blast radius
- Real Teams/Mail deep links (UI ready)
- DB / real persistence (resets on restart)
- SD Worx branding (logo, full theming — demo palette applied)

## Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run start          # Start prod
npm run lint           # Lint
npm test               # Tests (Vitest, skip on Windows # paths)
node scripts/hash-pw.mjs <password>  # Generate password hash
```

---

**USP:** Their assistant finds the documents. Ripple tells you which one to believe, and makes sure nobody has to ask twice.
