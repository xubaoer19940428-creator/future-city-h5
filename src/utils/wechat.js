const isWeChatBrowser = () => /MicroMessenger/i.test(window.navigator.userAgent);
const TOOLBAR_HIDE_RETRY_DELAYS = [80, 300, 800, 1500];

const hideWeChatToolbar = () => {
  const bridge = window.WeixinJSBridge;
  if (!bridge || typeof bridge.call !== 'function') return;

  bridge.call('hideToolbar');
};

const requestToolbarHide = () => {
  hideWeChatToolbar();
  window.requestAnimationFrame(hideWeChatToolbar);
  TOOLBAR_HIDE_RETRY_DELAYS.forEach((delay) => {
    window.setTimeout(hideWeChatToolbar, delay);
  });
};

export const installWeChatToolbarGuard = (router) => {
  if (!isWeChatBrowser()) return;

  if (window.WeixinJSBridge) {
    requestToolbarHide();
  } else {
    document.addEventListener('WeixinJSBridgeReady', requestToolbarHide, { once: true });
  }

  router.afterEach(requestToolbarHide);
  window.addEventListener('hashchange', requestToolbarHide, { passive: true });
  window.addEventListener('pageshow', requestToolbarHide, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestToolbarHide();
  });
};
