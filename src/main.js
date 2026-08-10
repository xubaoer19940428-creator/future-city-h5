import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { installWeChatToolbarGuard } from './utils/wechat';
import './styles/main.css';

const DESIGN_WIDTH = 390;
const DESIGN_ROOT_FONT_SIZE = 16;
let remResizeFrame;

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

const app = createApp(App);
app.use(router);
app.mount('#app');
