export const isWeChatBrowser = () => /MicroMessenger/i.test(window.navigator.userAgent);
const TOOLBAR_HIDE_RETRY_DELAYS = [80, 300, 800, 1500];
const WECHAT_ENTRY_URL = window.location.href.split('#')[0];
const isIOS = /iP(?:hone|ad|od)/i.test(window.navigator.userAgent);

const updateWeChatShareData = (method, data) => new Promise((resolve, reject) => {
  const shareApi = window.wx?.[method];
  if (typeof shareApi !== 'function') {
    reject(new Error(`WeChat API ${method} is unavailable`));
    return;
  }

  shareApi({
    ...data,
    success: resolve,
    fail: reject
  });
});

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

  const signedUrl = isIOS ? WECHAT_ENTRY_URL : window.location.href.split('#')[0];
  const debugEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
  const signatureEndpoint = new URL('/api/wechat-signature', window.location.origin);
  signatureEndpoint.searchParams.set('url', signedUrl);
  if (debugEnabled) signatureEndpoint.searchParams.set('debug', 'ip');

  console.info('[WeChat JSSDK] requesting signature', { signedUrl, link, imageUrl });
  const response = await fetch(signatureEndpoint, {
    cache: 'no-store'
  });
  const config = await response.json();
  if (!response.ok) {
    const details = [
      `HTTP ${response.status}`,
      config.wechatErrorCode ? `WeChat ${config.wechatErrorCode}` : '',
      config.outboundIp ? `outbound IP ${config.outboundIp}` : ''
    ].filter(Boolean).join(', ');
    throw new Error(`Unable to load WeChat signature: ${details}`);
  }

  await new Promise((resolve, reject) => {
    window.wx.config({
      debug: true,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
    });
    window.wx.ready(resolve);
    window.wx.error(reject);
  });
  console.info('[WeChat JSSDK] config ready');

  await Promise.all([
    updateWeChatShareData('updateAppMessageShareData', {
      title,
      desc: description,
      link,
      imgUrl: imageUrl
    }),
    updateWeChatShareData('updateTimelineShareData', {
      title,
      link,
      imgUrl: imageUrl
    })
  ]);
  console.info('[WeChat JSSDK] share data ready');

  return true;
};
