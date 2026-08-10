import { createMemoryHistory, createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { isWeChatBrowser } from '../utils/wechat';

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
    meta: { title: '未来科学城 MBTI - 基因图谱' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    component: HomeView
  }
];

const useWeChatMemoryHistory = isWeChatBrowser();
const initialWeChatLocation = useWeChatMemoryHistory
  ? window.location.hash.slice(1) || '/'
  : '';

const router = createRouter({
  history: useWeChatMemoryHistory ? createMemoryHistory() : createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

export const prepareInitialRoute = () => {
  if (!useWeChatMemoryHistory) return Promise.resolve();

  return router.replace(initialWeChatLocation);
};

export default router;
