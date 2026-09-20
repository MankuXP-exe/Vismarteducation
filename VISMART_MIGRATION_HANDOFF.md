# Vi Smart Learning Education - AI Handoff Document

This document is for another AI agent that will continue development after the current AI session/usage limit ends.

**IMPORTANT:** The next AI must be able to read this ONE file and understand the complete Vi Smart Learning Education migration, current architecture, completed work, important decisions, current production state, known issues, remaining tasks, commands, domains, database architecture, and exact Git commits.

---

## PROJECT

**Project:** Vi Smart Learning Education
**Repository:** MankuXP-exe/Vismarteducation
**Frontend:** Next.js / React
**Frontend hosting:** Vercel
**Backend:** Fastify on VPS
**Database:** PostgreSQL on VPS
**Streaming:** MediaMTX on VPS
**Storage:** VPS local storage

**Final architecture goal:**
```text
Vercel Next.js
        ↓
Fastify VPS API
        ↓
PostgreSQL VPS
        ↓
VPS storage / MediaMTX
```
**ZERO SUPABASE RUNTIME DEPENDENCY.**

---

## VPS

Current VPS specifications and installed infrastructure:

**OS:** Ubuntu 22.04.5 LTS x86_64
**CPU:** AMD EPYC 7F72 (8 vCPU)
**RAM:** ~16 GB
**Disk:** ~492 GB
**Public IP:** 103.212.136.205

**Backend:**
Fastify - `127.0.0.1:4000`

**PostgreSQL:**
`127.0.0.1:5432`
Database: `vismart_db`

**MediaMTX:**
- WebRTC: 8889
- HLS: 8888
- RTSP: 8554
- Admin API: 9997 (localhost-only)

**WebRTC ICE:**
- UDP 8189
- TCP 8189

**aaPanel:**
Port 13541

---

## DOMAINS

- `vismartlearningeducation.com`: Main application frontend.
- `www.vismartlearningeducation.com`: Main application frontend.
- `api.vismartlearningeducation.com`: Proxies requests to the Fastify backend on the VPS.
- `stream.vismartlearningeducation.com`: MediaMTX stream playback and recordings via Nginx.
- `live.vismartlearningeducation.com`: MediaMTX WebRTC and live features.

---

## GITHUB

**Repository:** MankuXP-exe/Vismarteducation
**Branch:** main

**Important Migration Commits:**

- **Feature 1:** `3aea552` - VPS API client, batches/catalog migration, Supabase fallback.
- **Feature 2:** `b5c6f5f` - Batch detail, subjects, chapters, protected media.
- **Feature 3:** `7ecf664` - VPS authentication, roles, login, register, logout, Argon2id.
- **Feature 3 hardening + Feature 4:** `d128f43` - Enrollment, access, progress tracking, bookmarks.
- **Feature 7:** `8241a4e` - Production live classes.
- **Feature 7 WebRTC bug fix:** `62eb65e` - Fixes for WebRTC connections.
- **Feature 7 recording pipeline:** `998695a` - Working recording architecture with MediaMTX and Fastify.
- **Feature 8 Supabase elimination:** `1d14c73` - Complete removal of Supabase runtime dependencies.
- **Feature 7 Security Hardening:** `6c530dc` - Recording access protection and accurate attendance tracking.

*(Note: Ensure you run `git log` to see if there are more recent commits to note.)*

---

## MIGRATION STATUS

| Feature | Status |
|---|---|
| Feature 1 — Batches & Catalog | COMPLETE |
| Feature 2 — Catalog Detail | COMPLETE |
| Feature 3 — Authentication | COMPLETE |
| Feature 4 — Enrollment / Access / Progress | COMPLETE |
| Feature 5 — Tests & Assessments | COMPLETE |
| Feature 6 — Payments / Orders / Enrollment Automation | COMPLETE |
| Feature 7 — Production Live Classes | IMPLEMENTED + REAL BROWSER VALIDATED |
| Feature 7 bug fixes | COMPLETE |
| Feature 7 recording | COMPLETE / VERIFIED |
| Feature 8 — Supabase Elimination | VALIDATED, DEAD CODE CLEANED, AUTH BUG FIXED |

---

## COMPLETED FEATURES DETAILS

### FEATURE 1
- VPS API client implemented.
- Feature flag used.
- Batches/catalog migration from Supabase.
- Supabase fallback initially implemented.
- Tested and verified successfully.

### FEATURE 2
- Batch detail, subjects, chapters, lectures, materials.
- Protected media with signed playback/download.
- Dual mode with fallback implemented and verified.

### FEATURE 3
- VPS authentication with `vi_session` cookie (HttpOnly, Secure, SameSite=Lax/Strict).
- Cross-domain handling.
- Roles support, login, registration, logout, `/auth/me`.
- Forgot/reset password.
- Argon2id for password hashing.
- Migrated-user password mechanism.
- LocalStorage token storage removed.
- Session revocation and CORS configured.

### FEATURE 4
- Enrollment, batch access, student/teacher authorization.
- Progress, bookmarks, watch history, completion tracking.
- Playback authorization and 15-second progress pings.
- Real student verification.

### FEATURE 5
- Tests, assessments, attempts, questions, server-side grading.
- Leaderboard, Next.js API proxies, VPS authentication.

### FEATURE 6
- Payment architecture: `/payments/order`, `/payments/verify`, `/payments/webhook`, `/payments/history`.
- Server determines actual price, validates discounts and concessions.
- Razorpay signature and webhook verification (idempotency, duplicate enrollment prevention).
- Transactional enrollment, amount/user ID tampering protection.
- Commit: `43f1f3d` (No production payment was performed).

### FEATURE 7 — LIVE CLASSES
- **Workflow:** Teacher -> Select Batch -> Subject -> Class -> Start Live -> Camera + Mic + Screen Share.
- Camera (bottom-right PiP) + screen share works simultaneously on a 1280x720 browser canvas compositor.
- Persistent video track prevents codec resets/renegotiation.
- WebRTC/WHIP -> MediaMTX -> Student WHEP/WebRTC -> HLS fallback.
- Permission handling for denied/cancelled access.

### MEDIA TRANSPORT
- MediaMTX: WebRTC (8889), HLS (8888), RTSP (8554), Admin API (9997, localhost-only).
- ICE: UDP 8189, TCP 8189.
- Nginx proxies `live` and `stream` subdomains. WHIP/WHEP architecture is fully proxied.

### LIVE CLASS AUTHORIZATION
- Teacher/student identity comes from `vi_session`.
- Server validates teacher (authorized batch/subject) and student (active enrollment/batch).
- Unauthorized requests return 401 or 403. No trust in browser-supplied IDs.

### LIVE CLASS BUG FIXES
- **Student WebRTC bugs fixed:** `pc.ontrack` assigned early, SDP omitting `a=msid` handled, autoplay policy spinner resolved.
- **WebRTC networking bugs fixed:** WHIP 201 handled, UDP ICE traffic unblocked (UDP/TCP 8189 configured in UFW).

### RECORDING SYSTEM
- **Architecture:** Teacher stream -> MediaMTX -> MP4 recording -> stream-ended hook -> Fastify (`/api/v1/live/webhook/stream-ended`) -> recording finalization -> PostgreSQL -> protected student playback.
- **Storage Path:** `/opt/vi-smart/recordings/`
- Records 2 tracks (H264 + Opus). Example size ~5MB for 2 mins.
- `findAndFinalizeRecording()` polls directory, extracts duration with ffprobe, persists metadata.
- HTTP 206 range support and Nginx recording paths for protected access via `X-Accel-Redirect`.

### RECORDING ROOT CAUSES DISCOVERED
- Issues fixed: Supabase Cloud vs PostgreSQL disconnect, hook pointed to wrong port, Nginx missing locations, recordPath extension issue, finalization race condition, student ontrack race, autoplay loading issue, WebRTC UDP ICE blocking.

### FEATURE 8 — SUPABASE ELIMINATION
- **Goal:** ZERO Supabase runtime dependency.
- **Changes:** Supabase fallback, dual writes, auth, DB access, and storage removed. Frontend Supabase calls and packages removed where no longer needed.
- VPS API, PostgreSQL, VPS auth, and VPS storage are now fully authoritative.
- **Important:** Old Supabase project is NOT deleted yet. Kept for disaster-recovery/backup until VPS-only production is fully validated.

### FEATURE 8 CURRENT STATUS
- Commit `1d14c73` (supabase elimination) + `cde61e4` (validation cleanup) + `7268053` (proxy.ts removal)
- **Status:** VALIDATED. Zero Supabase runtime dependency confirmed. Dead Supabase code cleaned. Auth bug fixed.
- **Database:** 9 users total. 3 legacy (May 2026) with corrupted hashes. 6 VPS-era (Sep 2026) with valid Argon2id.
- **Bug fixed:** `password_reset_tokens.expires_at` Prisma `$executeRaw` Date serialization — fixed with ISO string.
- **Permissions fixed:** `password_reset_tokens` and `live_class_attendance` granted to `vismart` DB user.
- **Dead code removed:** `middleware.ts`, `database.types.ts`, `callback/route.ts`, `proxy.ts`, Supabase fallbacks from auth routes.
- **Legacy account remediation:** Password-reset flow works for legacy accounts. Users can self-serve via forgot-password.
- **Backend git:** Source version-controlled at `/opt/vi-smart-api` (commit `e3cea61` + `1a257a0`).

---

## NEXT REQUIRED VALIDATION

1. ~~Verify test users' individual passwords work.~~ DONE.
2. ~~Verify Argon2id migration.~~ DONE.
3. ~~Verify no shared/default password.~~ DONE.
4. ~~Verify User A cannot log in as User B.~~ DONE.
5. ~~Verify logout/session revocation.~~ DONE.
6. ~~Verify password reset.~~ DONE (full flow including legacy accounts).
7. ~~Verify zero active Supabase runtime calls.~~ DONE.
8. ~~Verify no remaining `@/lib/supabase` callers making Supabase requests.~~ DONE (stubs are null Proxies).
9. ~~Verify API client has no Supabase fallback.~~ DONE.
10. ~~Verify PostgreSQL data completeness.~~ DONE (30 tables).
11. Live class regression: CODE REVIEWED — authorization, status transitions, recording pipeline all verified.
12. Recording regression: SECURITY VERIFIED — Nginx blocks direct access, API requires auth, HTTP 206 supported.
13. ~~Verify direct recording URL cannot bypass authorization.~~ DONE.
14. ~~Verify attendance doesn't overcount.~~ DONE.
15. ~~Build frontend.~~ DONE.
16. ~~Typecheck frontend.~~ DONE.
17. ~~Build Fastify backend.~~ DONE.
18. ~~Run regression tests.~~ DONE.

**DO NOT deploy Vercel yet.**
**DO NOT enable production VPS flag globally unless explicitly instructed.**
**DO NOT delete Supabase.**
**DO NOT change DNS.**
**DO NOT change Razorpay production configuration.**

---

## CURRENT SECURITY REQUIREMENTS

Never expose:
- database passwords
- Supabase keys
- Razorpay secrets
- MediaMTX admin credentials
- session secrets
- private keys
- SMTP credentials

Never commit:
- `.env`
- `.env.local`
- production secrets

Recording directories must not be publicly accessible without authorization.
MediaMTX admin API `9997` must remain localhost-only.

---

## CURRENT PRODUCTION/CUTOVER STATUS

**Document clearly:**
Frontend production deployment has NOT been switched to the final VPS-only architecture yet.
Vercel production should remain untouched until final validation.
Supabase project should remain available as temporary backup.
Final cutover should happen only after all VPS-only tests pass.

---

## KNOWN FILES / LOCATIONS

- **Frontend:** `/root/Vismarteducation`
- **Backend:** `/opt/vi-smart-api`
- **Recordings:** `/opt/vi-smart/recordings`
- **Hooks:** `/opt/vi-smart/hooks`
- **MediaMTX config:** `/etc/mediamtx/mediamtx.yml`
- **Nginx:** `/etc/nginx/sites-available/`

---

## IMPORTANT COMMANDS

- `git status`
- `git log --oneline`
- `git remote -v`
- `npm run build`
- `npx tsc --noEmit`
- `systemctl status mediamtx`
- `journalctl -u mediamtx`
- `systemctl status nginx`
- `nginx -t`
- `systemctl status vismart-api` (or similar backend service)
- `psql -U postgres -d vismart_db`

---

## AI HANDOFF RULES

The next AI must:
1. Read this file FIRST.
2. Inspect git status before changing anything.
3. Never assume a feature is incomplete if marked verified here.
4. Never rewrite working live streaming code unnecessarily.
5. Never reintroduce Supabase.
6. Never deploy without explicit instruction.
7. Never delete Supabase before final approval.
8. Preserve existing commits.
9. Create incremental commits.
10. Test before committing.
11. Never expose secrets in output.
12. Ask only when genuinely necessary.
13. Prefer inspecting the existing implementation before rewriting it.

---

## CURRENT ARCHITECTURE

Vercel Next.js Frontend -> Nginx Proxy -> Fastify VPS API -> PostgreSQL VPS & MediaMTX & VPS Storage.

## IMPORTANT COMMITS

### Frontend (GitHub: MankuXP-exe/Vismarteducation)
See the GITHUB section above (`3aea552`, `b5c6f5f`, `7ecf664`, `d128f43`, `8241a4e`, `62eb65e`, `998695a`, `1d14c73`, `6c530dc`).
Plus: `cde61e4` (Feature 8 validation cleanup), `7268053` (dead proxy.ts removal).

### Backend (VPS only: /opt/vi-smart-api)
`e3cea61` (initial backend source), `1a257a0` (remove .env/dist from tracking).

## KNOWN ISSUES

- **3 legacy users (May 2026) have corrupted Argon2id password hashes** from Supabase migration. They cannot log in with their original passwords. Remediation: the forgot-password flow works for these accounts — users can self-serve a password reset. No passwords were changed, no accounts deleted.
- **Dead Supabase stub files remain** (`lib/supabase/client.ts`, `server.ts`, `admin.ts`, `queries.ts`, `teacher-content.ts`, `batches-data.ts`). These are imported by ~100 files but are null Proxies / VPS-only wrappers with zero Supabase network calls. Removing them requires a large refactor touching 100+ import sites. Safe to defer post-cutover.
- **Backend is a separate git repo** at `/opt/vi-smart-api` (not pushed to remote). Frontend git is at `/root/Vismarteducation` (pushed to GitHub).

## NEXT STEPS

- Push backend repo to remote for backup/disaster recovery.
- Resolve 3 corrupted legacy account hashes when account owners initiate password reset.
- Remove remaining dead Supabase stub files (larger refactor, safe to do post-cutover).
- Final production cutover: deploy Vercel, switch DNS, verify production.

## DO NOT DO

- Do not expose any secrets.
- Do not deploy to Vercel.
- Do not delete Supabase yet.
- Do not change DNS.

---

# CURRENT NEXT ACTION

Feature 8 is validated. All critical systems pass. Ready for production cutover decision.

Remaining before cutover:
- Push backend repo to remote
- Resolve 3 legacy account hashes (via forgot-password self-service)
- Final production deployment and DNS switch (when explicitly instructed)
