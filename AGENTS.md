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
- The 2026-08-11 WeChat/SCF checkpoint and global sharing changes were deployed and the worktree was clean when this memory was last updated. Recheck `git status --short` because subsequent responsive-adaptation work may add intentional uncommitted changes.
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

- Global UI font: `public/fonts/ResourceHanRoundedCN-Bold.woff2` via `src/styles/main.css`; the page and Result poster fetch use the same `v=20260811-3` cachebuster so WeChat/CDN clients do not retain a former subset.
- The WOFF2 was regenerated on 2026-08-11 from Resource Han Rounded CN Bold 0.990 and now has an 803-character cmap (about 140 KB, reduced from the original 13 MB TTF). It covers every non-whitespace character in the current runtime Vue/JS/CSS/HTML sources, and its embedded SIL Open Font License 1.1 metadata is preserved. System Chinese fonts remain fallbacks for future arbitrary text that is not part of the current source corpus.
- When adding fixed copy with new Chinese characters, regenerate and validate the font subset. Future arbitrary CMS/user text may fall back glyph-by-glyph unless included.
- Timeline's `谱`, the Result trait characters `韧`, `押`, `弹`, `幕`, `监`, and `更`, and the current fixed-copy characters `您` and `挥` are confirmed present in the regenerated cmap. Poster generation waits for all dynamic Result strings before capture, so live text and the embedded poster font use the same glyphs.
- The original full ResourceHanRoundedCN Bold TTF is still not committed. The verified source file is version 0.990 with SHA-256 `f713907a21a10701cd68a7ce3e345ccdce46c789e1809d65ace54e095d7107c3`; obtain that source again before regenerating a future subset, include all runtime source strings, preserve all name records/OFL metadata, and validate the resulting cmap before replacing the WOFF2.
- Keep raster assets compressed and remove assets only after verifying they are unreferenced.
- Runtime bitmap references currently use compressed WebP except the deliberately generated social thumbnail `public/share.jpg` (500 × 500, currently about 233 KB in production). Old PNG/JPG source duplicates and obsolete planning images were removed only after runtime-reference validation and a temporary backup.

## WeChat browser behavior

- `index.html` includes `https://res.wx.qq.com/open/js/jweixin-1.6.0.js` before the source Vite entry. Despite this source order, iOS testing showed that the runtime global can still become available later; keep the readiness wait in `src/utils/wechat.js`.
- Modern WeChat does not reliably honor the legacy `WeixinJSBridge.call('hideToolbar')`. `src/utils/wechat.js` still retries that call as a fallback, but the primary prevention for native forward/back controls is routing: `src/router/index.js` uses `createMemoryHistory()` only inside MicroMessenger and retains `createWebHashHistory()` elsewhere.
- All in-app flow navigation uses `router.replace`. In WeChat, route changes must remain in memory and must not create Hash/history entries. Do not switch WeChat back to Hash history merely to expose the current route.
- Shareable Result state is mirrored into the browser query string with `history.replaceState`, never `pushState`. The public keys are `share=result`, `shareYear`, `shareIdentity`, `shareTrait`, and `shareDescription`. A shared URL restores the exact Result route and the persisted random indices on initial load, including outside WeChat.

## Result poster and sharing

- Result poster generation uses `domToPng` from `modern-screenshot`, imported in the Result route chunk. After the slow Result GSAP entrance timeline completes, `ResultView.vue` captures the full visible `[data-poster-page]` Result viewport at 2× using the root's current `offsetWidth/offsetHeight`; the background, navigation, card, mascots, controls, and retry action are all represented in the saved image. `html2canvas` is not the active renderer.
- The real full-page `.result-page-snapshot` overlay is necessary for WeChat long-press saving; a Canvas alone does not consistently expose the native save-image menu. It spans the Result content at the actual viewport size, while the live navigation and action controls remain above it and interactive. Keep `-webkit-touch-callout: default`. If automatic capture fails, the poster button remains a retry path. Wait for local fonts and every page image before capture so Chinese text and artwork are not missing.
- `ResultView.vue` fetches the local subset WOFF2, converts it to a data URL, and passes explicit font CSS to `modern-screenshot`; the poster also contains the current QR and Future Science City brand assets. Preserve this explicit font embedding when changing poster layout.
- Full-page capture must use `resultRoot.offsetWidth/offsetHeight`, not `getBoundingClientRect()`, so it records the actual Result viewport without transformed-card geometry leaking into the output. The live card still uses the 370 × 553px stage coordinate system with `margin-left: 10px`; keep `.result-character` at `right: -20px` and 196 × 320px.
- In WeChat, the visible share buttons always show the custom right-top sharing guide because JavaScript cannot programmatically open WeChat's native share sheet. Outside WeChat, the existing Web Share API/clipboard fallback remains.
- When JSSDK configuration succeeds, sharing to a friend and Timeline uses the dynamic Result title and description, the exact persisted Result link, and the absolute `https://17mbti.wlkxcgroup.com/share.jpg` thumbnail. Static Open Graph metadata in `index.html` is only a fallback. Home, Quiz, and Timeline use a shared default project card installed by `installWeChatShareGuard()`.

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
- `src/components/QuizSelect.vue` is the custom accessible selector used for both identity and year. Both identity and year selectors use `placement="top"` in `QuizPlaceholderView.vue` so their option panels open upward and remain visible above the bottom form controls. Do not replace them with uncontrolled native selects without preserving keyboard, focus, scrolling, selected-value behavior, and the upward placement.
- `src/views/TimelineView.vue`: Swiper owns all years from 2009 through 2026, starts from the validated `year` query, uses a 1050ms slide speed, and replays the active year's GSAP sequence after every slide change. The current event panel is 260px high with a 20px gap below the year heading.
- Timeline event parts reveal for 0.8s each with a 0.45s stagger. If content exceeds the panel, automatic movement starts after the full reveal plus 0.6s and travels at about 14px/s. The panel itself remains vertically touch-scrollable. Years 2009, 2010, 2016, 2021, 2022, 2024, and 2025 apply the dedicated 34px `.event-copy` height rule.
- Timeline planning art is a single `<img class="plan-card-stack">` selected from `/assets/09.webp` through `/assets/26.webp`; 2011 and 2016 intentionally have no planning image. Do not rebuild the old `:before` card, nested `.plan-card`, calculated rotated bounding box, or multi-element mockup. Keep the direct image bottom-positioned and retain the current visual rotation unless the user explicitly asks to change it.
- `src/views/ResultView.vue`: result copy and year art come entirely from `getResultProfile()`. The stage, card, controls, and mascots retain their responsive small-height handling; controls must stay reachable and remain interactive above the generated full-page image.
- Result runs a slow scoped GSAP presentation with `timeScale(0.5)`. On completion—or immediately when reduced motion is requested—it calls `generatePoster()`. Poster generation waits for `document.fonts.ready` and all page images, captures `[data-poster-page]` with `modern-screenshot`'s `domToPng` at 2×, then overlays the Result viewport with a real PNG `<img>`.
- The generated Result `<img>` uses `-webkit-touch-callout: default`, enabling WeChat long-press saving. The light action button shows rendering, generated, and retry states. If capture fails, it reports failure through the screen-reader status and lets the user retry. Do not convert the poster image back to a canvas-only presentation.
- Result share behavior is intentionally split: inside WeChat, both share buttons open the custom upper-right `···` guide because browser JavaScript cannot open WeChat's native share sheet; outside WeChat, use `navigator.share`, with clipboard copying as fallback.

## Responsive and Result-poster checkpoint (2026-08-11)

- This checkpoint contains intentional uncommitted work in `src/styles/main.css`, `src/views/HomeView.vue`, `src/views/QuizPlaceholderView.vue`, and `src/views/ResultView.vue`, plus the untracked user asset `public/assets/result-qr.png`. `AGENTS.md` and `package.json` also contain intentional changes. Preserve all of them when resuming.
- Responsive behavior is continuous across phone widths. The 360px, 390px, and 430px widths are regression checkpoints only, not separate breakpoint-specific target layouts. Keep the 390px design/rem baseline and do not add a 390px `max-width`.
- `src/styles/main.css` explicitly sets both `-webkit-text-size-adjust: none` and `text-size-adjust: none` on `html` to prevent system/browser text scaling from changing layout geometry. WeChat additionally resets `setFontSizeCallback` and listens for `menu:setfont`; the Result card and the `domToPng` clone repeat the CSS lock for poster parity.
- Home's main question uses `left: 1%`, `width: 98%`, and a 23px baseline font (20–23px clamp on short-height media rules), preventing the heading from clipping at narrow widths and under approximately 120% font-width stress.
- Quiz's intro heading is two Flex spans (`科创新都` / `未来之城`) with a 14px gap and 34px type instead of preserved HTML spaces. Intro copy is `min(330px, 100%)` with balanced wrapping. Keep the existing flow-based vertical form layout; do not return these blocks to absolute positioning.
- Both Quiz form selectors now pass `placement="top"`; the first identity selector previously used the default bottom placement and its options could be cut off by the lower form/scroll boundary. This is a call-site setting only—the shared `QuizSelect.vue` interaction and accessibility logic remains unchanged.
- Result's left text column was narrowed to avoid colliding with the 196 × 320px year character: title width 136px at 44px/1 line-height, lead and trait width 132px, and the tag 14px with a 132px maximum. All 810 year/identity/trait/description combinations were checked against this text geometry during the responsive pass.
- Result uses `public/assets/result-qr.png`; this is an intentional untracked user-provided asset and must not be replaced with the former `result-qr.webp` reference or deleted.
- Full-page capture uses the Result root's actual viewport dimensions. The 370px card canvas is now layout-only; do not switch capture back to that wrapper or add a card-shaped border radius to the page snapshot.
- `pnpm build`, `git diff --check`, and the full runtime-source font cmap validation passed after switching Result to full-page capture and regenerating the font subset. The only build output was the existing VConsole dependency warning about `eval`.
- Real browser screenshot tooling was unavailable for the final device comparison. In the next thread, first hard-refresh the affected iOS/Android device, wait for automatic poster generation (or tap retry), and compare the entire Result viewport with the generated image before changing card typography or character position.

## Current file-by-file checkpoint (2026-08-11)

- `AGENTS.md`: project memory, responsive/layout constraints, implementation checkpoint, deployment requirements, and resume protocol.
- `src/main.js`: dynamically sets root rem to `viewportWidth / 390 * 16`, updates through `requestAnimationFrame` on window resize, orientation change, and `visualViewport` resize, installs the WeChat toolbar and default-share guards, conditionally loads vConsole only when `debug=1`, restores the initial memory-history route, then mounts Vue.
- `postcss.config.js`: includes Tailwind, `postcss-pxtorem` with `rootValue: 16`, `propList: ['*']`, `minPixelValue: 2`, and Autoprefixer. New CSS dimensions of 2px or more are converted at build time; do not add a second rem conversion system.
- `src/styles/main.css`: declares the compressed rounded WOFF2 globally, uses `html { font-size: 4.102564vw; }` as the no-JS fallback, disables platform text-size adjustment, and keeps the app viewport fixed at full width/height.
- `src/views/HomeView.vue`: updated CTA gradient-border wrapper and synchronized reveal animation; the main question now uses the wider 98% responsive text box and smaller 23px baseline type.
- `src/views/QuizPlaceholderView.vue`: refactored navigation, intro, backgrounds, form layers, heading decoration, and button halo into normal Flex/Grid flow with no absolute positioning; the intro heading now uses two Flex spans, the intro copy has the wider balanced-wrap layout, and both identity/year `QuizSelect` call sites explicitly open upward.
- `src/views/TimelineView.vue`: slow Swiper/event choreography, automatic overflow track motion, 2026 Result navigation, single-image year planning art, hidden 2011/2016 art, and the current 260px/20px event-panel layout.
- `src/data/resultProfiles.js`: canonical five identities, 2009–2026 year titles/leads, identity traits, five year-band cross tags, identity descriptions, legacy identity aliases, safe normalization, cryptographic random-index selection when available, and 2009–2026 people-art mapping.
- `src/views/ResultView.vue`: stable result query, exact profile rendering, full-visible-page 2× capture using the Result root dimensions, real long-press PNG overlay with live controls above it, preserved `right: -20px` character overflow, PNG QR/brand assets, WeChat share guide, Web Share/clipboard fallback, and dynamic JSSDK setup.
- `src/router/index.js`: WeChat-only memory history, non-WeChat hash history, result share-query restore, and `replaceState` mirroring for a shareable WeChat Result URL.
- `src/utils/wechat.js`: MicroMessenger detection, delayed-JSSDK readiness wait, legacy toolbar-hide retries, router/page lifecycle guards, signature fetch, `wx.config`, modern/legacy share API registration, and default sharing for every non-Result route.
- `index.html`: includes WeChat JSSDK 1.6.0 and description/Open Graph fallbacks pointing at the production share thumbnail. Do not assume script-tag order alone guarantees immediate `window.wx` readiness.
- `package.json`: includes `modern-screenshot`, `html-to-image`, and opt-in `vconsole` in addition to Vue, Vue Router, GSAP, and Swiper. `modern-screenshot` is the active Result poster renderer; `html2canvas` has been removed.
- `functions/api/wechat-signature.js`: same-origin EdgeOne Pages proxy that validates the page URL and forwards signing requests to SCF with a server-side proxy token; it no longer stores or uses the official-account AppSecret.
- `scf/wechat-signature/index.js`: dependency-free Tencent Cloud SCF Event Function handler for stable-token/ticket retrieval, warm-instance ticket caching, concurrency coalescing, and SHA-1 JSSDK signatures.
- `scf/wechat-signature-scf.zip`: current console-upload artifact containing the SCF handler and its CommonJS package marker. Regenerate this ZIP from `scf/wechat-signature/` after changing SCF source; do not assume an old ZIP includes later code edits.
- `.env.example`: documents separate EdgeOne proxy and SCF signing variables. Never put a real AppSecret or proxy token in this repository.
- `public/share.jpg`: 500×500 production share thumbnail. `public/fonts/ResourceHanRoundedCN-Bold.woff2` is the compressed/subset global font. Timeline planning images are `09.webp`–`26.webp` excluding 11/16; people artwork is `timeline-2009-people.webp`–`timeline-2026-people.webp`.

## Local completion versus external deployment

- Locally implemented and deployed: responsive rem pipeline, global subset font, compressed runtime images, Home CTA styling, current Quiz, Timeline content/art/animation behavior, data-driven Result, `modern-screenshot` poster generation, long-press save image, WeChat memory-history routing, delayed JSSDK readiness, global/default and dynamic Result sharing, SCF signer, EdgeOne signing proxy, metadata, and share thumbnail.
- Deployment configuration completed on 2026-08-11: Beijing SCF Event Function, fixed public egress, public Function URL, SCF/EdgeOne environment variables, EdgeOne source deployment including `/functions`, JS interface security domain, and official-account API IP allowlist.
- Production verification completed: `GET https://17mbti.wlkxcgroup.com/api/wechat-signature?...` returned HTTP 200 with the expected AppID and a 40-character SHA-1 signature after allowlisting. The former `40164` error correctly reported `81.70.239.69` before the IP was added.
- The remaining share-card limitation is an entry-channel issue controlled by WeChat, not a signing failure: opening the site from a chat message/file-transfer link and sharing again still produced a plain URL even though all JSSDK calls returned `:ok`. See the dedicated caveat below.

## SCF and EdgeOne WeChat signing backend

- Browser requests remain same-origin at `GET /api/wechat-signature?url=<current URL>`. `functions/api/wechat-signature.js` validates the URL and proxies to the SCF Function URL, so no frontend or CORS change is required.
- `scf/wechat-signature/index.js` is deployed to the Beijing `wechat-signature` Event Function with handler `index.main_handler`, Node.js 20, 128MB memory, a 10-second timeout, public access, and fixed public egress IP `81.70.239.69`. It obtains and caches the official-account access token and JSAPI ticket, then returns `appId`, `timestamp`, `nonceStr`, and a 40-character SHA-1 `signature`.
- The deployed Function URL is `https://1257328745-53z1sph6ba.ap-beijing.tencentscf.com`. It uses public access, open/no-IAM authorization, CORS disabled, and parameter compatibility enabled. Application-level access is protected by `WECHAT_PROXY_TOKEN`; an unauthenticated probe correctly returned HTTP 401.
- Required EdgeOne variables are `WECHAT_SCF_URL`, `WECHAT_PROXY_TOKEN`, and `WECHAT_ALLOWED_ORIGIN=https://17mbti.wlkxcgroup.com`. Required SCF variables are `WECHAT_APP_ID`, `WECHAT_APP_SECRET`, `WECHAT_ALLOWED_ORIGIN`, and the same `WECHAT_PROXY_TOKEN` value. The SCF Function URL uses no Tencent IAM authentication because the server-to-server proxy token performs application-level authentication.
- Old `WECHAT_APP_ID` and `WECHAT_APP_SECRET` variables may still remain in EdgeOne. The deployed proxy no longer reads them, so keeping them does not affect behavior; removing them later is recommended only to reduce secret duplication. The real AppSecret must never be copied into frontend/Vite code or committed.
- `gh_2697fb4ad22a` is the public account's original ID, not a usable JSSDK AppID. Never substitute it for `WECHAT_APP_ID`. Never commit or expose AppSecret in Vite variables, browser code, API responses, screenshots, logs, or project memory.
- The public-account console must list `17mbti.wlkxcgroup.com` as a JS interface security domain and `81.70.239.69` in its API IP allowlist. The SCF signer uses `https://api.weixin.qq.com/cgi-bin/stable_token` and the JSAPI ticket endpoint; a `40164` after migration means the SCF IP has not yet been allowlisted or the network configuration changed.
- Frontend configuration lives in `configureWeChatShare()` in `src/utils/wechat.js`. It waits up to eight seconds for a delayed `window.wx`/`window.jWeixin`, signs `window.location.href` without the fragment, and registers both modern and legacy friend/Timeline share APIs. `installWeChatShareGuard()` configures the default project card on Home, Quiz, and Timeline; ResultView separately overrides it with the dynamic result card. The visible share guide remains the graceful fallback if the signature service or JSSDK setup fails.

## WeChat share-card rendering caveat

- On iOS testing, `window.wx` was initially `undefined` and became an object later. The eight-second readiness wait is required; do not restore the old early return when `window.wx` is initially missing.
- With `debug=1`, verified debug callbacks were `config:ok`, `noPermissionJsApi: []`, `updateAppMessageShareData:ok`, and `updateTimelineShareData:ok`. The accompanying iOS debug field `retCode: -1` is not a failure when `errMsg` ends in `:ok`. vConsole and `wx.config.debug` are opt-in through the `debug=1` query only.
- Production HTML and `share.jpg` both return HTTP 200 to a MicroMessenger user agent; OG title, description, and image metadata are present. Signing, JSSDK permission, image reachability, and API calls have therefore been ruled out as causes of the remaining plain-link result.
- WeChat can downgrade secondary sharing to a plain URL based on how the page was entered. Testing by opening the URL from chat/File Transfer Assistant produced a plain URL after sending despite all JSSDK APIs succeeding. This behavior cannot be overridden by browser JavaScript.
- Before changing more code, validate from an allowed WeChat entry: add the page to Favorites and reopen it from `我 -> 收藏`, or preferably have the administrator publish the URL in the same official account's custom menu/article and enter from that official-account context. The final production solution is to add the site to the official account entry; adding only the JS interface security domain is insufficient to guarantee a card for chat-link secondary sharing.
- Do not use the pre-send confirmation panel alone to judge success; inspect the message after it is actually sent. Do not keep changing API names when all callbacks are already `:ok`.

## Tool-output constraint

- Avoid returning Base64 screenshots or multi-megabyte image tool outputs. Repeated 413 errors were caused by large image outputs retained in session history.
- Save screenshots locally, inspect small contact sheets when necessary, and keep tool output textual and targeted.
- For straightforward layout-structure issues, inspect and fix the Flex/Grid/CSS source first. Do not run broad multi-size screenshot suites unless the user asks for visual testing or code inspection cannot establish the result.

## Verification

- Run `pnpm build` after code, style, font, or asset changes.
- For the signing backend, also run `node --check functions/api/wechat-signature.js`, `node --check scf/wechat-signature/index.js`, a mocked SCF handler call that verifies a 200 response with a 40-character hexadecimal SHA-1 signature, and a mocked EdgeOne proxy call. The real production token/signature flow was verified on 2026-08-11; repeat a production endpoint check after changing SCF, EdgeOne proxy code, environment variables, Function URL, or the IP allowlist.
- Preserve existing user changes in the working tree and avoid unrelated refactors.
