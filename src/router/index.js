import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: '未来科学城 MBTI - 首页' }
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/QuizPlaceholderView.vue'),
    meta: { title: '未来科学城 MBTI - 测试中' }
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('../views/TimelineView.vue'),
    meta: { title: '未来科学城 MBTI - 时光之旅' }
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    meta: { title: '未来科学城 MBTI - 奠基者' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    component: HomeView
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
