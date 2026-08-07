# Routes

- `/` -> `src/views/HomeView.vue`
- `/quiz` -> lazy-loaded `src/views/QuizPlaceholderView.vue`
- all unmatched routes -> `src/views/HomeView.vue`

Routing uses Vue Router hash history. Route metadata controls `document.title`.

