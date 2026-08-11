import { createApp } from 'vue';
import App from './App.vue';
import router, { prepareInitialRoute } from './router';
import { installWeChatToolbarGuard } from './utils/wechat';
import './styles/main.css';

const DESIGN_WIDTH = 390;
const DESIGN_ROOT_FONT_SIZE = 16;
const debugConsoleEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
let remResizeFrame;

const installDebugConsole = async () => {
  if (!debugConsoleEnabled) return;

  const { default: VConsole } = await import('vconsole');
  new VConsole();
  console.info('[vConsole] enabled');
};

const updateRootRem = () => {
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const rootFontSize = (viewportWidth / DESIGN_WIDTH) * DESIGN_ROOT_FONT_SIZE;
  document.documentElement.style.fontSize = `${rootFontSize}px`;
};

const scheduleRootRemUpdate = () => {
  window.cancelAnimationFrame(remResizeFrame);
  remResizeFrame = window.requestAnimationFrame(updateRootRem);
};

updateRootRem();
window.addEventListener('resize', scheduleRootRemUpdate, { passive: true });
window.addEventListener('orientationchange', scheduleRootRemUpdate, { passive: true });
window.visualViewport?.addEventListener('resize', scheduleRootRemUpdate, { passive: true });

installWeChatToolbarGuard(router);

const mountApp = async () => {
  await installDebugConsole();
  await prepareInitialRoute();

  const app = createApp(App);
  app.use(router);
  app.mount('#app');
};

void mountApp();
