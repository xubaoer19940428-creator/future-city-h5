# Project instructions and memory

<!-- CODEGRAPH_START -->
## CodeGraph

When a `.codegraph/` directory exists at the repository root, use CodeGraph before grep/find or broad file reads when locating or understanding code. Prefer `codegraph explore "<question or symbols>"`. If `.codegraph/` does not exist, do not initialize it automatically.
<!-- CODEGRAPH_END -->

## Project context

- This is a Vue 3 + Vite mobile H5 for the Future Science City MBTI experience.
- Main flow: Home (`/`) -> Quiz/Profile (`/quiz`) -> Year timeline (`/timeline`) -> Result (`/result`).
- The Figma reference canvas is 390 × 844, but the implementation must fill the actual phone width. Do not restore a 390px `max-width`.
- CSS pixel values are converted with `postcss-pxtorem` using a 16px root value. `src/main.js` recalculates the root font size as `viewportWidth / 390 * 16` on resize/orientation changes, while `html { font-size: 4.102564vw; }` remains the no-JS fallback; keep new layout dimensions compatible with this 390px design baseline.
- Validate responsive layout at 360px, 390px, and 430px widths.
- Keep the Quiz profile slide flow-based: `.form-content` owns the vertical Flex layout, explanatory copy wraps naturally, and `.profile-form` uses `margin-top: auto` to stay toward the bottom. The journey button and selects must remain visible without overlapping copy on short phones; do not restore independent absolute coordinates for these content blocks.
- The `/quiz` layout uses a full-viewport `.quiz-track` (`position: absolute; inset: 0; width: 200%; height: 100%`) so the background image covers the entire screen, with a floating 52px `.top-nav` (`position: absolute; top: 0; z-index: 20`). The navigation uses a three-column Grid, so `.top-nav__title` is centered without extra positioning. `.intro-content` and `.form-content` apply 52px top padding so content begins after navigation without overlapping. Do not reintroduce absolute positioning to individual text, form, or button content blocks inside the slides.
- Result content is sourced strictly from `未来城.docx`, starting at “第一项：基于年份输出身份词”. Use the five canonical identities in `src/data/resultProfiles.js`; each result combines the fixed year profile, one random identity trait, the fixed identity/year-band tag, and one random identity description. Persist random indices in the result URL so refresh and sharing do not reroll them.
- Result character artwork is selected by year in `src/data/resultProfiles.js`. Every year from 2009 through 2026 uses its matching compressed 2× `/assets/timeline-<year>-people.webp`, rendered at the 196 × 320px design size. Keep image selection isolated in the data module so the result template stays independent of asset naming.

## Thread handoff and resume protocol

- Long chat threads have already triggered the Codex warning that repeated compaction can reduce accuracy. When that warning appears, start a fresh thread in this repository and tell the new agent to read this `AGENTS.md` before doing anything else.
- Treat this file as the project memory and the source of truth for intent. Then inspect the current source and `git diff` before editing, because the working tree contains intentional uncommitted user changes and code always wins if a checkpoint detail has since changed.
- Resume by checking, in order: `git status --short`, the relevant view/component, `src/data/resultProfiles.js` for result copy, `src/router/index.js` plus `src/utils/wechat.js` for WeChat behavior, and `functions/api/wechat-signature.js` for JSSDK signing. Do not attempt to reconstruct the project from old chat context.
- Inspect obvious layout problems in Vue/CSS first. Do not generate broad screenshot suites as a substitute for reading the code. If visual QA is genuinely necessary, capture only a small local screenshot and do not return image Base64 in tool output.
- After every code/style/asset change, run `pnpm build`. Preserve unrelated dirty-worktree changes and do not delete assets unless runtime references have been checked first.

## Home CTA

- The Home CTA uses two elements by design. `.start-button-frame` owns sizing, centering, breathing motion, the 1px padding, and the vertical border gradient from opaque white to transparent. The inner `.start-button` fills the frame and owns the `#279bff -> #40b6ff` background plus the `0 0 6px #bce1ff inset` shadow. Keep the gradient border implemented with this padded outer wrapper; do not replace it with `border-image`, because the rounded border renders inconsistently there.
- GSAP reveals `.start-button-frame`, not only the inner link, so the border and button enter together. Direct press feedback remains on the inner link.

## Motion direction

- The desired feel is a deliberate PPT/presentation sequence, not a fast app transition.
- Keep page entry around 1100ms. Current Home, Quiz, and Result GSAP presentation timelines intentionally use `timeScale(0.5)`; Timeline Swiper uses 1050ms.
- Keep buttons, selects, press states, and other direct interaction feedback fast and responsive.
- Timeline event text deliberately reveals at `0.8s` with a `0.45s` stagger. Overflow scrolling starts only after the reveal plus a `0.6s` pause and moves at about `14px/s`; keep this track motion slow unless the user asks otherwise.
- Timeline backgrounds begin below the 44px status-bar area. Planning artwork is supplied as baked composite images `/assets/09.webp` through `/assets/26.webp`; 2011 and 2016 intentionally render no `.plan-card-stack`. The element is a single bottom-positioned image with no generated card frame, pseudo-element, or extra rotation layer.
- Prefer transform and opacity, scope GSAP selectors with `gsap.context`, clean up on unmount, and preserve `prefers-reduced-motion` behavior.

## Font and assets

- Global UI font: `public/fonts/ResourceHanRoundedCN-Bold.woff2` via `src/styles/main.css`.
- The WOFF2 is a subset of the characters currently used by the project (about 119 KB, reduced from the original 13 MB TTF). System Chinese fonts remain as missing-glyph fallbacks.
- When adding fixed copy with new Chinese characters, regenerate and validate the font subset. Future arbitrary CMS/user text may fall back glyph-by-glyph unless included.
- Keep raster assets compressed and remove assets only after verifying they are unreferenced.
- Runtime bitmap references currently use compressed WebP except the deliberately generated social thumbnail `public/share.jpg` (500 × 500, about 21 KB). Old PNG/JPG source duplicates and obsolete planning images were removed only after runtime-reference validation and a temporary backup.

## WeChat browser behavior

- `index.html` loads `https://res.wx.qq.com/open/js/jweixin-1.6.0.js` before the Vite entry module.
- Modern WeChat does not reliably honor the legacy `WeixinJSBridge.call('hideToolbar')`. `src/utils/wechat.js` still retries that call as a fallback, but the primary prevention for native forward/back controls is routing: `src/router/index.js` uses `createMemoryHistory()` only inside MicroMessenger and retains `createWebHashHistory()` elsewhere.
- All in-app flow navigation uses `router.replace`. In WeChat, route changes must remain in memory and must not create Hash/history entries. Do not switch WeChat back to Hash history merely to expose the current route.
- Shareable Result state is mirrored into the browser query string with `history.replaceState`, never `pushState`. The public keys are `share=result`, `shareYear`, `shareIdentity`, `shareTrait`, and `shareDescription`. A shared URL restores the exact Result route and the persisted random indices on initial load, including outside WeChat.

## Result poster and sharing

- `html2canvas` is installed and intentionally lazy-loaded with the Result route chunk. After the slow Result GSAP entrance timeline completes, `ResultView.vue` captures only `.result-card` at 2× scale and overlays it with a real PNG `<img>`. Navigation, mascots outside the card, share controls, and “再测一次” are not part of the poster.
- The real image overlay is necessary for WeChat long-press saving; a Canvas alone does not consistently expose the native save-image menu. Keep `-webkit-touch-callout: default` and the real `<img>` element. If automatic capture fails, the poster button remains a retry path. Wait for local fonts and card images before capture so Chinese text and year artwork are not missing.
- In WeChat, the visible share buttons always show the custom right-top sharing guide because JavaScript cannot programmatically open WeChat's native share sheet. Outside WeChat, the existing Web Share API/clipboard fallback remains.
- When JSSDK configuration succeeds, sharing to a friend and Timeline uses the dynamic Result title and description, the exact persisted Result link, and the absolute `https://17mbti.wlkxcgroup.com/share.jpg` thumbnail. Static Open Graph metadata in `index.html` is only a fallback.

## Route and state contract

- `/quiz` accepts `step=profile` to open the identity/year form directly. It also restores a valid `identity` and a `year` in the inclusive 2009–2026 range when those query values are present.
- The canonical identity values are exactly: `政府机构人员`, `集团干部员工`, `入驻企业员工`, `区域居民`, and `关心关注者`. Keep the compatibility aliases in `src/data/resultProfiles.js`, but do not display the longer legacy labels as the select options.
- Submitting Quiz uses `router.replace()` and opens `/timeline?year=<2009-2026>&identity=<canonical identity>`. Timeline back navigation returns to `/quiz?step=profile` while retaining the active year and identity.
- The Timeline 2026 next-button label is `查看我的基因图谱`. It opens Result with `year`, `identity`, `trait`, and `description`; the last two are persisted random indices from 0 through 2.
- `/result` normalizes invalid input, generates missing trait/description indices once, and immediately replaces the URL with a stable query. Refreshing, going back to Timeline, and sharing must preserve the same result rather than rerolling it. `再测一次` returns to `/quiz?step=profile`.

## Detailed page implementation

- `src/views/HomeView.vue`: the existing illustrated home remains intact. Its CTA is a `.start-button-frame` wrapper around the `RouterLink`; GSAP reveals the wrapper so border and fill enter together. The inner link still calls the existing background-audio start handler and navigates with `replace`.
- `src/views/QuizPlaceholderView.vue`: the view contains two horizontal slides inside `.quiz-track`. Step 0 is the historical introduction; step 1 is the identity/year form. Swipe distance must exceed 48px and horizontal movement must dominate vertical movement. Left swipe advances, right swipe returns. The back button returns from form to intro first, then replaces to Home.
- Quiz uses a floating 52px top navigation over a full-viewport (`100% width / 100% height`) slide area, allowing the slide background image to extend under the top navigation seamlessly. Content containers (`.intro-content` and `.form-content`) use `padding-top: 52px` to clear the top navigation. Intro content is a vertical Flex layout; the swipe hint uses `margin-top: auto`. Form content is scrollable and the `.profile-form` owns bottom placement through Flex flow.
- Quiz animation is scoped with `gsap.context`, rebuilt when the active step changes, and slowed with `timeScale(0.5)`. It clears inline transforms/opacity before replay, observes `prefers-reduced-motion`, and removes its media listener and timeline on unmount.
- `src/components/QuizSelect.vue` is the custom accessible selector used for both identity and year. The year selector opens upward. Do not replace it with an uncontrolled native select without preserving its keyboard, focus, scrolling, and selected-value behavior.
- `src/views/TimelineView.vue`: Swiper owns all years from 2009 through 2026, starts from the validated `year` query, uses a 1050ms slide speed, and replays the active year's GSAP sequence after every slide change. The current event panel is 260px high with a 20px gap below the year heading.
- Timeline event parts reveal for 0.8s each with a 0.45s stagger. If content exceeds the panel, automatic movement starts after the full reveal plus 0.6s and travels at about 14px/s. The panel itself remains vertically touch-scrollable. Years 2009, 2010, 2016, 2021, 2022, 2024, and 2025 apply the dedicated 34px `.event-copy` height rule.
- Timeline planning art is a single `<img class="plan-card-stack">` selected from `/assets/09.webp` through `/assets/26.webp`; 2011 and 2016 intentionally have no planning image. Do not rebuild the old `:before` card, nested `.plan-card`, calculated rotated bounding box, or multi-element mockup. Keep the direct image bottom-positioned and retain the current visual rotation unless the user explicitly asks to change it.
- `src/views/ResultView.vue`: result copy and year art come entirely from `getResultProfile()`. The stage, card, controls, and mascots retain their current responsive small-height handling; controls must stay reachable on short phones and must not be moved into the captured poster.
- Result runs a slow scoped GSAP presentation with `timeScale(0.5)`. On completion—or immediately when reduced motion is requested—it calls `generatePoster()`. Poster generation waits for `document.fonts.ready` and all card images, captures only `[data-poster-card]` with `html2canvas` at 2× and a transparent background, then overlays the card with a real PNG `<img>`.
- The generated Result `<img>` uses `-webkit-touch-callout: default`, enabling WeChat long-press saving. The light action button shows rendering, generated, and retry states. If capture fails, it reports failure through the screen-reader status and lets the user retry. Do not convert the poster image back to a canvas-only presentation.
- Result share behavior is intentionally split: inside WeChat, both share buttons open the custom upper-right `···` guide because browser JavaScript cannot open WeChat's native share sheet; outside WeChat, use `navigator.share`, with clipboard copying as fallback.

## Current file-by-file checkpoint (2026-08-10)

- `AGENTS.md`: project memory, responsive/layout constraints, implementation checkpoint, deployment requirements, and resume protocol.
- `src/main.js`: dynamically sets root rem to `viewportWidth / 390 * 16`, updates through `requestAnimationFrame` on window resize, orientation change, and `visualViewport` resize, installs the WeChat toolbar guard, restores the initial memory-history route, then mounts Vue.
- `postcss.config.js`: includes Tailwind, `postcss-pxtorem` with `rootValue: 16`, `propList: ['*']`, `minPixelValue: 2`, and Autoprefixer. New CSS dimensions of 2px or more are converted at build time; do not add a second rem conversion system.
- `src/styles/main.css`: declares the compressed rounded WOFF2 globally, uses `html { font-size: 4.102564vw; }` as the no-JS fallback, and keeps the app viewport fixed at full width/height.
- `src/views/HomeView.vue`: updated CTA gradient-border wrapper and synchronized reveal animation.
- `src/views/QuizPlaceholderView.vue`: refactored navigation, intro, backgrounds, form layers, heading decoration, and button halo into normal Flex/Grid flow with no absolute positioning.
- `src/views/TimelineView.vue`: slow Swiper/event choreography, automatic overflow track motion, 2026 Result navigation, single-image year planning art, hidden 2011/2016 art, and the current 260px/20px event-panel layout.
- `src/data/resultProfiles.js`: canonical five identities, 2009–2026 year titles/leads, identity traits, five year-band cross tags, identity descriptions, legacy identity aliases, safe normalization, cryptographic random-index selection when available, and 2009–2026 people-art mapping.
- `src/views/ResultView.vue`: stable result query, exact profile rendering, automatic 2× poster snapshot, long-press save image, WeChat share guide, Web Share/clipboard fallback, and dynamic JSSDK setup.
- `src/router/index.js`: WeChat-only memory history, non-WeChat hash history, result share-query restore, and `replaceState` mirroring for a shareable WeChat Result URL.
- `src/utils/wechat.js`: MicroMessenger detection, legacy toolbar-hide retries, router/page lifecycle guard, signature fetch, `wx.config`, friend sharing, and Timeline sharing.
- `index.html`: loads WeChat JSSDK 1.6.0 before the Vite entry and includes description/Open Graph fallbacks pointing at the production share thumbnail.
- `package.json`: includes `html2canvas@^1.4.1` in addition to Vue, Vue Router, GSAP, and Swiper.
- `functions/api/wechat-signature.js`: EdgeOne Pages Function for allowlisted URL validation, stable-token/ticket retrieval, warm-isolate ticket caching, concurrency coalescing, nonce creation, and SHA-1 JSSDK signatures.
- `.env.example`: documents only placeholders for the three server-side WeChat variables. Never put a real AppSecret in this repository.
- `public/share.jpg`: 500×500 production share thumbnail. `public/fonts/ResourceHanRoundedCN-Bold.woff2` is the compressed/subset global font. Timeline planning images are `09.webp`–`26.webp` excluding 11/16; people artwork is `timeline-2009-people.webp`–`timeline-2026-people.webp`.

## Local completion versus external deployment

- Locally implemented: responsive rem pipeline, global subset font, compressed runtime images, Home CTA styling, flow-based Quiz, Timeline content/art/animation behavior, data-driven Result, poster generation, long-press save image, WeChat routing guard, dynamic share configuration, EdgeOne signing function, metadata, and share thumbnail.
- Still requires deployment-side configuration: set a real `wx...` AppID, store the AppSecret only in EdgeOne, set the allowed origin, deploy the repository including `/functions`, and add `17mbti.wlkxcgroup.com` to the official account's JS interface security domains.
- Real JSSDK friend/Timeline sharing cannot be end-to-end verified locally without those official-account settings. `gh_2697fb4ad22a` remains unusable as an AppID. EdgeOne error `40164` remains an infrastructure/IP-whitelist issue requiring fixed Tencent Cloud egress.

## EdgeOne WeChat signing backend

- This project is deployed on Tencent EdgeOne Pages. The minimal backend is an EdgeOne Pages Function at `functions/api/wechat-signature.js`, exposed as `/api/wechat-signature`. Official Pages Functions routing is based on the repository-root `/functions` tree; source-repository deployment must include that directory rather than uploading only the generated `dist` directory.
- The function accepts only `GET /api/wechat-signature?url=<current URL>`, rejects URLs outside the configured origin, strips fragments, obtains a stable official-account access token and JSAPI ticket, and returns `appId`, `timestamp`, `nonceStr`, and a SHA-1 `signature`. It caches the ticket in the warm function isolate until five minutes before expiry and coalesces concurrent refresh requests.
- Required EdgeOne project environment variables are documented in `.env.example`:
  - `WECHAT_APP_ID`: the real developer AppID beginning with `wx`.
  - `WECHAT_APP_SECRET`: the official-account AppSecret, stored only as an EdgeOne secret/environment variable.
  - `WECHAT_ALLOWED_ORIGIN`: `https://17mbti.wlkxcgroup.com`.
- `gh_2697fb4ad22a` is the public account's original ID, not a usable JSSDK AppID. Never substitute it for `WECHAT_APP_ID`. Never commit or expose AppSecret in Vite variables, browser code, API responses, screenshots, logs, or project memory.
- The public-account console must list `17mbti.wlkxcgroup.com` as a JS interface security domain. The signing function uses `https://api.weixin.qq.com/cgi-bin/stable_token` and the JSAPI ticket endpoint. If production returns WeChat error `40164`, EdgeOne's variable outbound IP is being rejected by the official-account IP whitelist; move the same signing logic to Tencent Cloud SCF/CloudBase with a fixed NAT egress IP rather than weakening secret handling.
- Frontend configuration lives in `configureWeChatShare()` in `src/utils/wechat.js`. It signs `window.location.href` without the fragment and then calls both `updateAppMessageShareData` and `updateTimelineShareData`. The visible share guide remains the graceful fallback if the signature service or JSSDK setup fails.

## Tool-output constraint

- Avoid returning Base64 screenshots or multi-megabyte image tool outputs. Repeated 413 errors were caused by large image outputs retained in session history.
- Save screenshots locally, inspect small contact sheets when necessary, and keep tool output textual and targeted.
- For straightforward layout-structure issues, inspect and fix the Flex/Grid/CSS source first. Do not run broad multi-size screenshot suites unless the user asks for visual testing or code inspection cannot establish the result.

## Verification

- Run `pnpm build` after code, style, font, or asset changes.
- For the EdgeOne signing function, also run `node --check functions/api/wechat-signature.js` and a mocked handler call that verifies a 200 response and a 40-character hexadecimal SHA-1 signature. The real WeChat token flow can only be verified after EdgeOne secrets and the JS security domain are configured.
- Preserve existing user changes in the working tree and avoid unrelated refactors.
