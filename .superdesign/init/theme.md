# Theme

The project uses Vue 3, Tailwind CSS 3, and page-scoped CSS.

- Primary sky blue: `#4cb5f7`
- Deep teal copy: `#00435a`
- CTA gradient: `#279bff` to `#40b6ff`
- CTA inset highlight: `#bce1ff`
- Body font: Resource Han Rounded CN with Noto Sans SC / PingFang fallbacks
- Display font in the Figma source: PangMenZhengDao-Cu; current web fallback: Ma Shan Zheng
- Mobile reference canvas: 390 x 844
- Responsive scale: PostCSS px-to-rem with a 16px root value; runtime root rem is recalculated as `viewportWidth / 390 * 16`, with `html { font-size: 4.102564vw; }` as fallback

Global styles live in `src/styles/main.css`; Tailwind tokens live in `tailwind.config.js`.
