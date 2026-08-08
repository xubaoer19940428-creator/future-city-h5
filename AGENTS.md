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

## Motion direction

- The desired feel is a deliberate PPT/presentation sequence, not a fast app transition.
- Keep page entry around 1100ms. Current Home, Quiz, and Result GSAP presentation timelines intentionally use `timeScale(0.5)`; Timeline Swiper uses 1050ms.
- Keep buttons, selects, press states, and other direct interaction feedback fast and responsive.
- Do not slow the Timeline event-text reveal or long overflow-scroll duration just to make scene entrances slower.
- Timeline backgrounds begin below the 44px status-bar area. The planning artwork uses a bottom-positioned `.plan-card-stack` with a separate angled backing layer; do not revert it to top positioning or a single card.
- Prefer transform and opacity, scope GSAP selectors with `gsap.context`, clean up on unmount, and preserve `prefers-reduced-motion` behavior.

## Font and assets

- Global UI font: `public/fonts/ResourceHanRoundedCN-Bold.woff2` via `src/styles/main.css`.
- The WOFF2 is a subset of the characters currently used by the project (about 119 KB, reduced from the original 13 MB TTF). System Chinese fonts remain as missing-glyph fallbacks.
- When adding fixed copy with new Chinese characters, regenerate and validate the font subset. Future arbitrary CMS/user text may fall back glyph-by-glyph unless included.
- Keep raster assets compressed and remove assets only after verifying they are unreferenced.

## Tool-output constraint

- Avoid returning Base64 screenshots or multi-megabyte image tool outputs. Repeated 413 errors were caused by large image outputs retained in session history.
- Save screenshots locally, inspect small contact sheets when necessary, and keep tool output textual and targeted.

## Verification

- Run `pnpm build` after code, style, font, or asset changes.
- Preserve existing user changes in the working tree and avoid unrelated refactors.
