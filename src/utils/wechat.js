export const isWeChatBrowser = () => /MicroMessenger/i.test(window.navigator.userAgent);
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

export const configureWeChatShare = async ({ title, description, link, imageUrl }) => {
  if (!isWeChatBrowser() || !window.wx) return false;

  const signedUrl = window.location.href.split('#')[0];
  const response = await fetch(`/api/wechat-signature?url=${encodeURIComponent(signedUrl)}`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Unable to load WeChat signature');

  const config = await response.json();

  await new Promise((resolve, reject) => {
    window.wx.config({
      debug: false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
    });
    window.wx.ready(resolve);
    window.wx.error(reject);
  });

  window.wx.updateAppMessageShareData({
    title,
    desc: description,
    link,
    imgUrl: imageUrl
  });
  window.wx.updateTimelineShareData({
    title,
    link,
    imgUrl: imageUrl
  });

  return true;
};
