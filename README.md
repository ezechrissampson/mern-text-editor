# Enterprise Rich Text Editor Module (MERN)

A reusable, production-grade content authoring module for MERN applications —
drafts, revisions, autosave, publishing workflow, metadata, embeds, tables,
syntax-highlighted code, and enterprise-grade HTML sanitization — built to
drop into an application that **already has** authentication, authorization,
and a media/file manager.

This module does **not** implement auth or file uploads. Images are inserted
by URL only, sourced from your existing Media Library.

> **Status note:** This repository was generated as a from-scratch clean-architecture
> implementation (Phase 1 of a phased build — see Roadmap). `npm install` has not
> been run in this environment (no package registry access here), so dependency
> resolution and a full build/test pass should be your first step before deploying.
> All source files have been syntax-checked (`node --check`), but you should run
> the manual verification checklist in `backend/tests/sanitize.service.test.md`
> and add automated tests (Jest/Vitest) before production use.

---

## Features

- **Rich text editing** — TipTap/ProseMirror based: headings, marks (bold, italic,
  underline, strike, sub/superscript, color, highlight), alignment, lists
  (bulleted, numbered, nested, task), tables (resizable), blockquotes, HR,
  code blocks with syntax highlighting, links, images-by-URL, embeds,
  slash commands, keyboard shortcuts, undo/redo, paste cleanup.
- **Images by URL only** — paste a URL or select from your existing Media
  Library via an injected `onRequestMedia` callback. No upload logic here.
- **Secure embeds** — YouTube, Vimeo, Twitter/X, GitHub Gist, CodePen, Spotify,
  Google Maps, plus a configurable custom iframe host whitelist, enforced
  both client-side (UX) and server-side (authoritative).
- **Autosave** — configurable interval, Redis-backed with automatic MongoDB
  fallback, conflict detection, recovery after refresh/crash.
- **Drafts & publishing workflow** — draft → review → approved → scheduled →
  published → archived / rejected, with server-enforced valid transitions.
- **Version history** — immutable revision snapshots, word-level diff/compare,
  one-click restore.
- **Metadata** — title, slug, excerpt, SEO title/description, canonical URL,
  featured image URL, tags, categories, language, word/character count,
  reading time.
- **Markdown & HTML interop** — Markdown → sanitized HTML, HTML → Markdown,
  paste cleanup, HTML minification.
- **Security-first** — sanitize-html + DOMPurify double-pass pipeline, safe
  URL validation, iframe whitelist, Mongo-injection protection, HPP
  protection, rate limiting, centralized error handling, permission checks
  on every write route. See [Security Features](#security-features).
- **Dashboard** — draft/published/scheduled/archived counts, recently edited,
  word count & reading time, recent activity feed.
- **Bootstrap 5 UI** — responsive, accessible, dark-mode-ready via CSS
  variables, skeleton loaders, toasts, confirm dialogs.

---

## Installation

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI at minimum
npm install
npm run dev             # standalone dev server on :5001

# Frontend
cd frontend
npm install
npm run dev              # Vite dev server on :5173
```

The backend can run standalone (`npm run dev`, uses `createApp()` in
`src/app.js`) for local development, but in production it's meant to be
**mounted inside your existing Express app** — see Integration Guide below.

---

## Integration Guide

This module intentionally has **no knowledge of your User model, your auth
strategy, or your file storage**. It expects:

1. Your existing auth middleware to run first and populate `req.user` with
   at minimum `{ id }`, and either `req.user.permissions: string[]` or a
   `req.user.hasPermission(name)` function.
2. Your existing media manager to expose a way to pick a URL (a modal, a
   route, whatever you already have).

### Backend

```js
// host app's main Express app
const { editorRouter } = require('enterprise-editor-module/backend/src/app');
const hostAuthMiddleware = require('./middleware/auth');
const hostRbacMiddleware = require('./middleware/rbac');

app.use(
  '/api/v1/editor',
  hostAuthMiddleware,     // sets req.user
  hostRbacMiddleware,     // ensures req.user.permissions / hasPermission()
  editorRouter
);
```

Required permission strings the module checks for (see `src/constants/roles.js`,
map these into your own RBAC):

| Permission            | Used for                                  |
|------------------------|--------------------------------------------|
| `content:create`       | Creating/duplicating documents             |
| `content:edit:own`     | Editing/listing your own documents         |
| `content:edit:any`     | Editing any document (editor/admin role)   |
| `content:delete`       | Soft-deleting documents                    |
| `content:publish`      | (reserved for future publish-only role)    |
| `content:review`       | (reserved for approval workflow)           |
| `content:archive`      | Archiving documents                        |

### Frontend

```jsx
import { EditorModuleRoutes } from 'enterprise-editor-module/frontend/src';

<Route
  path="/content/*"
  element={
    <EditorModuleRoutes
      onRequestMedia={() => hostApp.openMediaLibraryModal()} // returns a Promise<url>
    />
  }
/>
```

Add a sidebar entry pointing at `/content` (Dashboard), `/content/drafts`,
`/content/published`, etc.

### Environment

Configure `backend/.env` (see `.env.example`) — at minimum `MONGO_URI`.
Redis is **optional**; when `REDIS_ENABLED=false` (default), autosave
transparently falls back to a MongoDB TTL collection, so the module works
fully without Redis provisioned.

### Migrations / seed

No destructive migrations are required — Mongoose creates collections and
indexes on first write. Run `node backend/src/config/ensureIndexes.js` (add
this script if you want indexes built eagerly at deploy time rather than
lazily) or simply let Mongoose build them on demand.

---

## Folder Structure

```
backend/
  src/
    config/        env validation, MongoDB connection, Redis client (optional)
    constants/      workflow status machine, embed provider whitelist, permission names
    models/         Document, Revision, Category, Tag, EditorSettings, Autosave, EditorActivity, AuditLog
    repositories/   ONLY layer that talks to Mongoose models directly
    services/       business logic: sanitize, document, revision, autosave, slug, stats, markdown, embed, taxonomy
    validators/     express-validator rule sets
    middlewares/    error handler, rate limiter, RBAC adapter, bundled security (helmet/cors/hpp/mongo-sanitize)
    controllers/    thin HTTP layer, no business logic
    routes/v1/      REST route definitions
    utils/          AppError, asyncHandler, apiResponse envelope, text stats
    app.js          mountable Express router/app
    server.js       standalone bootstrap (dev/testing only)

frontend/
  src/
    api/            Axios client + typed API modules per resource
    hooks/          useAutosave, useDocument, useDebounce
    components/
      editor/       RichTextEditor, Toolbar, extensions (embed node, slash commands), modals
      dashboard/     StatCard
      common/        StatusBadge, Toast, ConfirmDialog, SkeletonRow
    pages/          Dashboard, Editor, DocumentList (drafts/published/scheduled/archived), 404/403/Offline/Maintenance/Loading
    routes/         EditorModuleRoutes (mountable route tree)
    styles/         theme.css (CSS variable color palette)
    index.js        public package entry point
```

---

## Editor Architecture

The editor is built on **TipTap** (ProseMirror under the hood). Key design
choices:

- **Controlled component** (`RichTextEditor`) — the host page owns the HTML
  value; the component calls `onChange(html, json, stats)` on every edit.
  This keeps persistence, autosave, and validation entirely in the host's
  hands, not hidden inside the editor.
- **Extension registry** (`components/editor/extensions/index.js`) — a single
  `buildExtensions()` function assembles the full extension list. Add/remove
  formatting capability by editing this one file.
- **Custom `EmbedNode`** — a TipTap atom node rendering a sandboxed `<iframe>`
  for whitelisted providers only.
- **Toolbar** is fully context-aware (`editor.isActive(...)`) and stateless
  otherwise — it holds no editor state of its own.

## Extension System

To add a new mark/node:

1. Install the TipTap extension package.
2. Add it to `buildExtensions()` in `extensions/index.js`.
3. Add a toolbar button in `toolbar/Toolbar.jsx` if it needs a UI trigger.
4. If it introduces new HTML tags/attributes, **update the server-side
   allowlist** in `backend/src/services/sanitize.service.js`
   (`ALLOWED_TAGS` / `ALLOWED_ATTRIBUTES`) — content that isn't allowed
   there will be stripped on save regardless of what the client renders.

## Autosave Workflow

1. `useAutosave` runs a `setInterval` at `AUTOSAVE_INTERVAL_MS` (configurable,
   default 15s) calling `PUT /api/v1/autosave/:documentId`.
2. The backend `autosave.service.js` tries Redis first (`SET ... EX <ttl>`);
   if Redis is disabled/unreachable, it upserts into the `EditorAutosave`
   Mongo collection (TTL-indexed).
3. **Conflict detection**: the client sends `clientVersion` (the document's
   `currentRevision` it was based on). If the server's current revision has
   moved on, the request is rejected with `409 Conflict` and details — the
   UI surfaces this via `SAVE_STATUS.CONFLICT`.
4. On page reload, `GET /api/v1/autosave/:documentId` recovers the last
   autosaved snapshot for draft recovery.
5. Autosave writes do **not** create revision snapshots — only explicit
   Save/Publish actions do (see Revision System).

## Revision System

- Every `createDocument` and every `updateDocument` call creates an immutable
  `EditorRevision` snapshot (title, HTML, JSON, stats, status, optional note,
  editor id, timestamp).
- `GET /api/v1/documents/:id/revisions` — paginated list.
- `GET /api/v1/documents/:id/revisions/compare?from=N&to=M` — word-level diff.
- `POST /api/v1/documents/:id/revisions/:n/restore` — restores a prior
  revision as a new current version (itself snapshotted, so restores are
  never destructive).

## HTML Sanitization Strategy

All user-authored HTML passes through `sanitize.service.js` before it is
persisted or ever echoed back:

1. **Iframe pre-check** — any `<iframe src="...">` is checked against the
   configurable host whitelist (`ALLOWED_IFRAME_HOSTS` env var); non-whitelisted
   embeds are rejected with a clear `400` rather than silently dropped.
2. **`sanitize-html` pass** — explicit tag/attribute allowlists, scheme
   restrictions (`http`, `https`, `mailto` only — no `javascript:`/`data:`),
   forces `rel="noopener noreferrer nofollow"` on links, `loading="lazy"` on
   images, and a restrictive `sandbox` attribute + `referrerpolicy="no-referrer"`
   on iframes.
3. **DOMPurify second pass** — redundant defense against event-handler
   attributes, `<script>`, `<style>`, `<object>`, `<form>`, and other
   dangerous constructs that could survive a single-library gap.
4. **Plain-text fields** (title, excerpt, SEO fields) go through a
   zero-tag `sanitizeHtml` strip, never through the rich HTML pipeline.
5. **Media/embed URLs** are validated for scheme and (for iframes) host
   before insertion is accepted.

This is defense in depth: even if the client-side editor were compromised
or bypassed entirely (e.g. a direct API call), the server-side sanitizer is
the actual security boundary.

## Markdown Support

`services/markdown.service.js`:
- `markdownToHtml()` — `markdown-it` render → sanitized through the same
  pipeline as editor content.
- `htmlToMarkdown()` — sanitizes first, then converts via `turndown`, so
  exported Markdown can't carry XSS if re-imported elsewhere.
- `cleanImportedHtml()` — paste-cleanup / HTML import entry point.
- `minifyHtml()` — sanitize → `html-minifier-terser`.

---

## API Documentation

Base path: `/api/v1` (mounted under whatever prefix the host app chooses).
All responses use a consistent envelope:

```json
{ "success": true, "message": "OK", "data": { ... }, "meta": { "total": 42 } }
```

### Documents

| Method | Path                              | Description                          |
|--------|------------------------------------|---------------------------------------|
| GET    | `/documents`                       | List (filter/sort/paginate)          |
| GET    | `/documents/search?q=`             | Full-text search                     |
| GET    | `/documents/dashboard`             | Status counts for dashboard cards    |
| GET    | `/documents/:id`                   | Get one                              |
| POST   | `/documents`                       | Create                               |
| PATCH  | `/documents/:id`                   | Update (owner or `content:edit:any`) |
| DELETE | `/documents/:id`                   | Soft delete                          |
| POST   | `/documents/:id/duplicate`         | Duplicate as new draft               |
| POST   | `/documents/:id/archive`           | Archive                              |
| POST   | `/documents/:id/restore`           | Restore to draft                     |

### Revisions

| Method | Path                                                    | Description        |
|--------|-----------------------------------------------------------|---------------------|
| GET    | `/documents/:documentId/revisions`                        | List                |
| GET    | `/documents/:documentId/revisions/compare?from=&to=`       | Diff two revisions |
| POST   | `/documents/:documentId/revisions/:revisionNumber/restore` | Restore             |

### Autosave

| Method | Path                     | Description         |
|--------|---------------------------|----------------------|
| PUT    | `/autosave/:documentId`   | Save snapshot        |
| GET    | `/autosave/:documentId`   | Recover snapshot     |
| DELETE | `/autosave/:documentId`   | Clear snapshot        |

### Taxonomy

| Method | Path                        | Description       |
|--------|------------------------------|--------------------|
| GET/POST | `/taxonomy/categories`     | List / create      |
| PATCH/DELETE | `/taxonomy/categories/:id` | Update / delete |
| GET/POST | `/taxonomy/tags`           | List / create      |
| PATCH/DELETE | `/taxonomy/tags/:id`       | Update / delete |

Filtering/pagination query params on list endpoints: `page`, `limit`,
`status`, `sortBy`, `sortDir`, `mine=true` (scope to `req.user.id`).

---

## Environment Variables

See `backend/.env.example` for the full list with defaults:
`NODE_ENV`, `PORT`, `API_PREFIX`, `MONGO_URI`, `REDIS_ENABLED`, `REDIS_URL`,
`CLIENT_ORIGIN`, `AUTOSAVE_INTERVAL_MS`, `AUTOSAVE_TTL_SECONDS`,
`ALLOWED_IFRAME_HOSTS`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.

`src/config/env.js` fails fast at boot if `MONGO_URI` is missing.

---

## Security Features

- **XSS / HTML injection** — double-pass sanitization (`sanitize-html` +
  DOMPurify), see [HTML Sanitization Strategy](#html-sanitization-strategy).
- **Safe URL validation** — no `javascript:`/`data:`/`vbscript:` schemes
  accepted anywhere (links, images, iframes).
- **Iframe/embed whitelist** — configurable host allowlist, enforced
  server-side as the source of truth.
- **NoSQL injection protection** — `express-mongo-sanitize` strips `$`/`.`
  operators from `req.body`/`query`/`params`.
- **HTTP Parameter Pollution** — `hpp` middleware.
- **Rate limiting** — global API limiter + a tighter autosave-specific
  limiter (30 req/min) to bound high-frequency autosave traffic.
- **Mass assignment protection** — controllers only pass whitelisted fields
  through `sanitizePayload()`; Mongoose schemas don't blindly accept
  arbitrary keys.
- **Centralized error handling** — no stack traces or internals leak in
  production responses.
- **Permission checks on every mutating route** — via the `permit()` /
  `permitOwnerOr()` adapter over the host app's RBAC.
- **CSP-compatible** — `helmet` is configured with `contentSecurityPolicy:
  false` so it doesn't fight the host app's own CSP; the host should set
  its CSP to allow the embed hosts it whitelists.
- **Soft delete + audit log** — destructive actions are reversible and
  logged (`EditorAuditLog` model is provided; wire up `AppError`-adjacent
  audit writes in controllers as your compliance needs dictate).

---

## Deployment Guide

1. Set `NODE_ENV=production`.
2. Provide a production `MONGO_URI` (Atlas or self-hosted, with auth).
3. Decide on Redis: set `REDIS_ENABLED=true` + `REDIS_URL` for a shared
   autosave cache across horizontally-scaled instances (recommended at
   scale — the Mongo fallback is per-instance-safe but Redis is faster and
   TTL-native).
4. Set `CLIENT_ORIGIN` to your deployed frontend origin(s).
5. Put the API behind your existing reverse proxy / load balancer; this
   module doesn't open its own TLS listener in `server.js` (that's for
   local dev only) — in production it's mounted into your existing app.
6. Build the frontend (`npm run build` in `frontend/`) and serve the static
   bundle from your existing static hosting/CDN, or embed the components
   into your host app's own Vite/webpack build instead of running this
   frontend standalone.
7. Ensure MongoDB indexes exist (Mongoose creates them automatically, but
   for large existing collections, build them during a maintenance window).

## Production Checklist

- [ ] `npm install` + `npm audit` clean on both backend and frontend
- [ ] Automated tests added (Jest/Vitest) — starting point in
      `backend/tests/sanitize.service.test.md`
- [ ] Load-test the autosave endpoint at expected concurrent-editor volume
- [ ] Confirm host app's CSP allows the iframe hosts you whitelist
- [ ] Confirm host app's RBAC maps to the permission strings in
      `constants/roles.js`
- [ ] Redis provisioned (recommended) or explicitly accepted Mongo-fallback
      autosave at your expected scale
- [ ] Backups configured for the Mongo collections this module owns
- [ ] Rate limit thresholds tuned to real traffic patterns
- [ ] Error monitoring (Sentry/etc.) wired into `errorHandler.js`'s
      non-operational-error branch

## Extension Guide

- **New block type**: TipTap extension → `extensions/index.js` → toolbar
  button → server allowlist update (sanitize.service.js).
- **New workflow status/step**: add to `constants/status.js`
  `DOCUMENT_STATUS` + `STATUS_TRANSITIONS`.
- **New embed provider**: add host patterns to `constants/embeds.js`
  (backend) and `constants/embedProviders.js` (frontend), plus add the host
  to `ALLOWED_IFRAME_HOSTS`.
- **Multi-tenant settings**: `EditorSettings` model already has a `scopeKey`
  field for this — wire tenant resolution into a settings-lookup middleware.

## Future Roadmap

- Real-time collaborative editing (Yjs + TipTap collaboration extension;
  the Redis layer here is already collaboration-adjacent for presence/awareness).
- Multi-step approval workflow UI (the status machine already supports it —
  `review`/`approved` states are wired, just needs an approvals UI).
- Footnotes extension, emoji picker, special-character picker (currently
  achievable via TipTap community extensions, not yet wired in).
- Full-text search upgrade to a dedicated search engine (Atlas Search/Elastic)
  for relevance ranking beyond Mongo's `$text` index.
- Automated Jest/Vitest + Playwright test suites.
- CI pipeline (lint + test + build) via GitHub Actions.

---

## License

Choose a license appropriate for your organization (MIT suggested for an
internal reusable module) and add a `LICENSE` file at the repo root.
