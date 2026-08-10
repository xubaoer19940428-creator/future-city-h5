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
const sharedResultSearch = new URLSearchParams(window.location.search);
const sharedResultLocation = sharedResultSearch.get('share') === 'result'
  ? {
      name: 'Result',
      query: {
        year: sharedResultSearch.get('shareYear') ?? undefined,
        identity: sharedResultSearch.get('shareIdentity') ?? undefined,
        trait: sharedResultSearch.get('shareTrait') ?? undefined,
        description: sharedResultSearch.get('shareDescription') ?? undefined
      }
    }
  : null;
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

router.afterEach((to) => {
  if (!useWeChatMemoryHistory) return;

  const shareUrl = new URL(window.location.href);
  const shareKeys = ['share', 'shareYear', 'shareIdentity', 'shareTrait', 'shareDescription'];
  shareKeys.forEach((key) => shareUrl.searchParams.delete(key));
  shareUrl.hash = '';

  if (to.name === 'Result') {
    shareUrl.searchParams.set('share', 'result');
    shareUrl.searchParams.set('shareYear', String(to.query.year ?? ''));
    shareUrl.searchParams.set('shareIdentity', String(to.query.identity ?? ''));
    shareUrl.searchParams.set('shareTrait', String(to.query.trait ?? ''));
    shareUrl.searchParams.set('shareDescription', String(to.query.description ?? ''));
  }

  window.history.replaceState(window.history.state, '', shareUrl);
});

export const prepareInitialRoute = () => {
  if (sharedResultLocation) return router.replace(sharedResultLocation);
  if (!useWeChatMemoryHistory) return Promise.resolve();

  return router.replace(initialWeChatLocation);
};

export default router;
