# Future City H5 design system

## Product and flow

Mobile-first campaign H5 for the Future Science City MBTI experience. The primary flow is Home (`/`) -> Story/Profile (`/quiz`) -> Year timeline (`/timeline`) -> Result (`/result`). The reference stage is 390 x 844, but every page must fill the actual phone width without a 390px maximum.

## Visual language

- Atmosphere: optimistic civic futurism, editorial presentation slides, layered city imagery.
- Primary sky: `#4cb5f7`; supporting sky: `#40acf5` / `#42aff6`.
- Deep teal copy: `#00435a`; electric accent: `#0ca1ff`; timeline date accent: `#fff500`.
- Primary CTA gradient: `#279bff` to `#40b6ff`; inset highlight: `#bce1ff`.
- Body: Resource Han Rounded CN with Noto Sans SC / PingFang SC fallbacks.
- Display: PangMenZhengDao-Cu / Resource Han Rounded CN with existing project fallbacks.
- Reuse the existing Figma-derived images, masks, icons, cards, and responsive positions. Do not introduce new colors, fonts, component shapes, or raster assets.

## Layout

- Full-viewport, overflow-hidden mobile scenes.
- Convert authored pixel dimensions through a 16px px-to-rem root; runtime code recalculates root rem as `viewportWidth / 390 * 16` on viewport changes, with `4.102564vw` as the CSS fallback, so the 390px reference scales proportionally across phones.
- Timeline scene imagery starts below the 44px status-bar area. Its planning artwork is a bottom-anchored two-layer angled card stack.
- Top navigation is 52px high and remains visually quiet above the presentation content.
- Primary controls have 50px height, pill radii, and at least 35px horizontal page margin where applicable.
- Content may use intentional overlap and off-canvas entrances, but final positions must remain identical to the existing Figma implementation.

## Motion language

- Treat each route as a presentation slide: outgoing scene recedes left and softens; incoming scene advances from the right with a short masked reveal.
- Build rare page entrances as 3-act timelines: atmosphere -> headline/content -> action.
- Use 30-90ms stagger for related content and overlap timeline beats rather than waiting for every tween to finish.
- Use strong ease-out (`power3.out` / `cubic-bezier(0.22, 1, 0.36, 1)`) for entrances and ease-in-out for ambient on-screen movement.
- Prefer transform and opacity. Clip-path is reserved for one page-level reveal; avoid animating layout dimensions.
- Buttons use immediate `scale(0.97-0.98)` press feedback.
- Ambient loops must be sparse, small-amplitude, and paused by route unmount.
- Honor `prefers-reduced-motion`: preserve short fades only and remove translation, scaling, blur, parallax, and automatic scrolling.

## Page choreography

- Home: background depth settles first, then logo/title, star accents, tagline, and CTA.
- Quiz: title establishes the scene, body copy reveals in rhythm, then swipe/form controls arrive as a group.
- Timeline: each year gets a background push, year headline wipe, event cadence, and planning-card swing-in.
- Result: atmosphere opens, card lands, title/character/traits/quote reveal in readable order, then actions and mascots arrive.

## Accessibility and performance

- Motion never blocks input after the element is visibly available.
- Focus rings and keyboard behavior remain intact.
- Scope GSAP selectors to the Vue page root and revert every context on unmount.
- Avoid continuous animation of large full-screen images; entrance-only transforms are preferred.
