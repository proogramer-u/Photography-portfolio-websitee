# Working on Cokorda Photography

These instructions apply throughout this repository. Read them before working, then inspect the relevant current source and any more specific `AGENTS.md` in the directories being changed. Follow the owner's current request; do not treat old task notes as permission for new work.

## Scope and approach

- Keep Vite, React, JavaScript/JSX, Tailwind CSS, React Router, Supabase, and Framer Motion. Do not migrate to Next.js, rebuild the site, or replace libraries without explicit approval.
- Understand the existing behavior and data flow before editing. Reuse components, API helpers, validation, and image-processing utilities.
- Prefer small, targeted changes. Preserve working features, existing photographs, database records, and unrelated uncommitted work.
- Stay within the requested scope. Identify relevant issues without silently fixing unrelated audit findings.
- For ordinary reversible work, proceed after a concise plan. Ask before destructive, high-risk, or architecturally significant changes. If the request is analysis-only, do not change files except deliverables explicitly authorized by the owner.
- Explain meaningful architectural decisions and tradeoffs. Avoid unnecessary dependencies, abstractions, or broad stylistic refactors.
- Never commit, push, merge, deploy, promote a deployment, or change live permissions automatically. Obtain explicit authorization for the operation; approval for one commit/push is not blanket permission for future tasks.

## Architecture

This is a browser-rendered photography portfolio and admin interface in one application. There is no application SSR or separate local backend. Use current source as the authority; documentation and dependency versions can become stale.

Locked versions when this guide was created:

| Dependency | Version |
|---|---|
| Vite | 8.0.6 |
| React / React DOM | 19.2.4 |
| React Router / React Router DOM | 7.14.0 |
| Tailwind CSS / Tailwind Vite plugin | 4.2.2 |
| Supabase JS | 2.117.2 |
| Framer Motion | 12.38.0 |

Check `package.json` and `package-lock.json` before dependency-related work. Use Node.js 22.12 or newer to satisfy the current Vite and Supabase requirements. Do not upgrade packages just to synchronize this table.

### Routes and rendering

| Route | Responsibility |
|---|---|
| `/` | Homepage photograph and portfolio link |
| `/gallery` | Published gallery overview and cover cards |
| `/project/:slug` | Published gallery photographs in the horizontal layout |
| `/admin/login` | Username/password login |
| `/admin` | Session-gated administration |
| `/admin?gallery=<id>` | Selected gallery in the admin workspace |

`src/main.jsx` mounts React StrictMode and `BrowserRouter`. `src/App.jsx` owns routes, session restoration/listening, and page transitions. Legacy `/project-N` routes are generated from `src/data/portfolio.js`; its array is currently empty, as is the derived local fallback. Do not recreate old collections or routes without checking the requested scope.

Public reads explicitly filter published galleries. `galleryApi.js` maps database paths into public Storage URLs and sorts photographs by `sort_order`. List queries currently include nested photographs; Header also fetches navigation galleries. Do not describe these queries as already optimized or assume all requests are deduplicated.

### Important files

| File or directory | Use it for |
|---|---|
| `package.json`, `vite.config.js`, `eslint.config.js` | Commands, dependencies, build and lint configuration |
| `vercel.json` | Vercel SPA rewrite to `index.html`; preserve deep-link support |
| `src/pages/HeroPage.jsx` | Homepage using a local original photograph |
| `src/pages/GalleryPage.jsx`, `ProjectPage.jsx` | Public fetching, loading, errors, and missing-gallery handling |
| `src/components/Header.jsx`, `HorizontalGallery.jsx`, `PageTransition.jsx` | Public navigation, horizontal scrolling, and route animation |
| `src/components/GallerySkeleton.jsx`, `ProjectGallerySkeleton.jsx`, `ImageSkeleton.jsx`, `SkeletonImage.jsx`, `image-loading.css` | Metadata and individual-image loading states |
| `src/pages/AdminPage.jsx`, `AdminLoginPage.jsx` | Admin coordination, selection, actions, and login form |
| `src/components/AdminGalleryForm.jsx` | Creation, initial multi-photo uploads, captions, and pre-upload ordering |
| `src/components/admin/` | Workspace, sidebar, gallery/photo grids, reusable dialog, cover upload/editor, preview, icons, progress/spinner |
| `src/pages/admin.css`, `src/index.css` | Scoped admin styles, Tailwind import, shared typography and scrollbar styles |
| `src/lib/supabase.js`, `adminAuth.js` | Client/config validation and username-to-email login alias |
| `src/lib/galleryApi.js`, `adminGalleryApi.js` | Public/admin gallery reads, creation, rename/status/cover selection, gallery deletion |
| `src/lib/galleryCoverApi.js` | Dedicated cover upload and previous-path-checked replacement/removal |
| `src/lib/galleryPhotoApi.js`, `src/components/admin/AdminPhotoUpload.jsx` | Multi-photo append uploads, optional captions, new-batch cleanup, and uncertain-save feedback |
| `src/lib/imageProcessing.js`, `uploadValidation.js` | Image decoding, resize/WebP conversion, JPEG/PNG and size checks |
| `src/lib/galleryFallback.js`, `src/data/portfolio.js` | Legacy/local gallery mapping |
| `supabase/schema.sql` | Initial schema and policy reference; not proof of deployed state |
| `public/images/` | Existing original photographs; preserve until removal is explicitly approved |
| `tests/*.test.mjs` | Local Node regression tests, mostly using mocked requests |
| `docs/` | Detailed handoff, implementation notes, and audit when available |

### Implemented versus pending management

Creation accepts a name-only draft, a dedicated cover-only draft, or multiple initial photographs. Captions and ordering can be set before initial upload. Existing galleries support rename, publish/unpublish, gallery deletion, dedicated cover changes, and choosing an existing photo as cover. Publishing through the UI requires photographs and a cover.

Existing-gallery uploads accept multiple photos with optional captions and append them after the latest stored order without modifying gallery fields. Individual photo deletion, persisted reordering of existing photos, and separate photo title/description/alt editing are not connected. `AdminPhotoPreview` intentionally disables unfinished controls. The schema has `photos.caption`, not separate title/description/alt fields, and galleries have a title but no description field. Do not present disabled controls as working or invent fields; inspect live schema and propose approved additive changes when needed.

### Images and covers

- Reuse `validateUploadFile`, `processImage`, and `createCoverVariant`. Current input validation accepts non-empty JPEG/PNG files up to 20 MiB each.
- Photos become WebP at a maximum 2400px longest edge, quality 0.84; covers use 900px, quality 0.8. Preserve aspect ratio and avoid upscaling or excessive simultaneous decoding.
- Process initial and append uploads sequentially. Preserve progress feedback and immediate duplicate-submission guards; do not invent byte percentages when the API only reports stages.
- Save Storage paths to database fields, never temporary `blob:` or `data:` preview URLs. Revoke preview object URLs when replaced or unmounted.
- Preserve a manually chosen cover when appending photos. Changing a cover must not mutate/delete photo records or change gallery ordering/status/slug as a side effect.
- Dedicated existing-cover saves compare the previous `cover_path` to detect concurrent changes. Keep that protection when extending the workflow.
- Append uploads read the latest maximum photo order and insert the batch in one statement. Ordering allocation across simultaneous browser sessions is not transactionally serialized; a future backend operation is needed for that guarantee.
- Old covers and files after uncertain saves are deliberately retained. Gallery deletion currently removes database records, with photo cascade defined in SQL, but does not remove Storage files. Do not silently introduce automatic cleanup.

## Preserve the photography design

Do not change the public design unless specifically requested. Preserve Constantia/serif typography, the existing palette, spacing, layout, responsiveness, page transitions, horizontal scroll/snapping, photo proportions, skeletons, and admin sidebar/card/modal styling.

New UI should extend the current white-background, black-text editorial style. Use the existing Tailwind/scoped CSS approach; avoid generic SaaS styling, heavy shadows, excessive decorations, or a new design system.

Keep Framer Motion animations subtle and respect `prefers-reduced-motion` through existing hooks/CSS. Use stable keys and avoid replaying entrances after every refresh. Preserve reserved image frames where possible and reveal loaded images without artificial delays. Clear placeholders on failure and provide useful recovery feedback.

Make controls keyboard-accessible with labels, focus indicators, and suitable status/error announcements. Reuse `AdminDialog` for native modal focus containment, safe Escape handling, focus restoration, and disabled dismissal during saving. Check mobile scrolling/sidebar behavior; do not crop stored photographs to match thumbnail frames.

## Supabase security and data safety

- Never claim live tables, grants, RLS, Storage settings, accounts, or successful operations are verified unless actually inspected/tested. Label source findings separately from live verification.
- Current repository SQL enables RLS but grants broad writes to **all authenticated accounts**. `AdminPage` currently checks only session presence. The username alias is not backend authorization. Do not describe the system as owner-only until deployed policies prove it.
- For authorization changes, inspect actual grants/policies and enforce authorized-admin checks in the database and Storage. Frontend guards are supplementary. Never base trusted authorization on editable user metadata or allow users to grant themselves admin membership.
- Read the current schema before proposing migrations. Prefer reviewed additive migrations that preserve existing records, foreign keys, captions, paths, and unique slugs. `schema.sql` is initial setup; CREATE POLICY statements cannot be blindly rerun.
- Never drop/truncate tables, delete production users/records/objects, reset data, or apply destructive migrations without explicit approval. Do not run destructive production security probes.
- The declared `portfolio-images` bucket is public. Draft/unpublish filters website metadata; it does not make public image bytes private. Changing privacy or existing URL behavior needs an approved plan.
- Gallery-plus-photo creation currently uses separate writes and can partially commit. Consider transactional metadata and idempotent retries when changing that flow. A lost response does not prove a write failed.
- Validate names/slugs and uploads before expensive processing. Preserve database uniqueness and referential integrity. Handle concurrent changes, ambiguous responses, and safe retry behavior explicitly.
- Avoid orphan creation where possible, but never delete an object simply because a save returned an error. Cleanup must account for all gallery-cover and photo references, concurrent/in-flight uploads, and incomplete RLS visibility. Preserve shared objects; review cleanup candidates before deletion.
- Show concise, non-sensitive errors and report success only after backend confirmation. Do not forward raw SDK errors, response bodies, credentials, or request URLs into user-visible logs.

### Environment handling

The client uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_USERNAME`, and `VITE_ADMIN_EMAIL`. Use the Supabase base URL without `/rest/v1/`. The key variable supports a publishable or legacy anon key.

All `VITE_` values are browser-visible, including the login alias/email. Never put passwords, service-role/secret keys, or other private credentials in frontend variables/code. Do not print real environment values or secrets in tool output, screenshots, reports, or commits. Inspect names/redacted validity flags when diagnosing configuration.

Keep `.env.local` private and ignored. `.env.example` must contain placeholders only. Vercel needs the intended variables scoped to Preview/Production **before building**; environment changes require a new build. Preserve the SPA rewrite and distinguish a working Preview from an updated Production domain. Do not promote/redeploy without authorization.

## Returning to a task

When the owner resumes previous work or asks for status, give a brief recap: what was being changed and why, what is complete, what remains, and the next recommended action. Mention the actual branch/worktree/PR only when relevant; inspect Git rather than assuming an old branch is current.

Use self-contained plain language. Explain options and tradeoffs for major decisions and ask one necessary clarification question at a time. Do not repeat the whole project history in routine updates or ask for confirmation for ordinary choices already authorized.

## Development and verification workflow

1. Read this guide, current task requirements, Git status, and relevant source. Check existing functionality and dependencies before editing.
2. Identify expected behavior and side effects, including public/admin rendering and backend/storage implications. Give a concise plan proportional to the work.
3. For bugs, reproduce the failure and add a meaningful regression test where practical. Confirm it fails for the expected reason before applying the smallest fix.
4. For features, define the behavior and add appropriate tests where practical, then implement and verify. Prefer the existing Node test approach; do not install a new test framework, typechecker, browser test dependency, or significant test infrastructure without approval.
5. Preserve other work and implement only the required changes. For trivial documentation/configuration work, targeted inspection/manual verification can be enough; do not add tests that merely mirror implementation.
6. Run applicable checks, review the final diff, and exercise affected user flows when browser access is available. Treat implementation and final review as separate passes even with one agent.
7. Report changed files, behavior, checks actually run and their results, and remaining risks/manual steps. Distinguish mocked tests, local browser verification, and live Supabase operations. Disclose failed/unavailable checks; never equate a build with verified authorization or deployment.

From the repository root:

```bash
npm run lint
node --test tests/*.test.mjs
npm run build
```

Use `npm run dev` for local work and `npm run preview` to inspect a production build. There is no configured `npm test` or typecheck command. For application changes, run lint/build and relevant existing tests; broaden/repeat testing only for new failures or unresolved risks. For documentation-only tasks, verify paths, facts, formatting, and secret exclusion rather than claiming runtime checks.

The local `tests/` and several `docs/` files may be absent in a fresh checkout: the owner has explicitly excluded them from commits. If missing, disclose the gap and do not claim their tests passed. Keep tests/docs excluded from commits unless the owner explicitly changes that preference. Running local tests does not authorize committing them.

For image/gallery/admin changes, cover the affected cases: empty draft, cover-only draft, multiple photos, cover replacement/removal, invalid files, failed/uncertain writes, refresh persistence, keyboard/mobile interaction, reduced motion, and public gallery routes. Use a controlled environment for mutations; do not create/delete production test content by default.

## Git, worktrees, and review

- Inspect branch, status, staged diff, and relevant history before substantial work. Never overwrite unrelated changes or stage everything blindly.
- Use a feature branch when appropriate. Use isolated worktrees for explicitly requested parallel coding when supported/useful; do not require a worktree for every small task. Check existing worktrees first and do not copy secrets automatically.
- Additional agents/review tools are optional and may be used only when explicitly requested by the owner. No external review gate, service, subscription, or particular multi-agent infrastructure is required.
- For substantial work, finish an implementation pass, then reread the diff from a reviewer's perspective: requirements, regressions, authorization, persistence, concurrent/error paths, accessibility, and verification evidence. Do not merge unrelated review findings into scope without agreement.
- If work is handed off, describe intent, changed files, completed checks, unresolved issues, and next action. A reviewer should not need the entire transcript. Any delegated changes still need inspection before being accepted.
- Do not force-push, reset, discard changes, delete branches/worktrees, or clean up unrelated files without explicit permission. Leave user-owned work intact.
- Before an authorized commit, inspect the exact staged file list for secrets, private environment files, generated output, and excluded docs/tests. Before an authorized push, confirm the branch/remote and distinguish pushing a feature branch from merging into the production branch.

## Documentation upkeep

Update the affected section of this file when a task materially changes architecture, routes, data model, dependencies, or workflow. Do not rewrite the entire guide unnecessarily or add temporary session transcripts, current commit IDs, or a task diary.

Keep longer analysis in documentation when authorized. Useful optional local notes: `docs/CODEBASE_AUDIT.md`, `docs/GALLERY-COVERS-AND-INTERACTIONS.md`, `docs/PUBLIC-IMAGE-LOADING.md`, and `docs/ADMIN-DASHBOARD-REDESIGN.md`. Older handoffs are context, not source truth; for example, README hosting claims must be checked against the existing `vercel.json`.

The context-recap, worktree isolation, regression-first verification, and separate implementation/review principles were adapted from [agents-md-snippets](https://github.com/jasonku09/agents-md-snippets). They do not require always-on parallel agents, automatic commits, mandatory worktrees, or an external review gate.
