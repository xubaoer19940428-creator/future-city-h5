# Routes

- `/` -> `src/views/HomeView.vue`
- `/quiz` -> lazy-loaded `src/views/QuizPlaceholderView.vue`
- `/timeline` -> lazy-loaded `src/views/TimelineView.vue`
- `/result` -> lazy-loaded `src/views/ResultView.vue`
- all unmatched routes -> `src/views/HomeView.vue`

Routing uses Vue Router hash history. Route metadata controls `document.title`.
