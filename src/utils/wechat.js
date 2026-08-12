export const isWeChatBrowser = () => /MicroMessenger/i.test(window.navigator.userAgent);
const TOOLBAR_HIDE_RETRY_DELAYS = [80, 300, 800, 1500];
const WECHAT_ENTRY_URL = window.location.href.split('#')[0];
const isIOS = /iP(?:hone|ad|od)/i.test(window.navigator.userAgent);

const waitForWeChatSdk = async () => {
  for (let elapsed = 0; elapsed < 8000; elapsed += 100) {
    const sdk = window.wx || window.jWeixin;
    if (sdk) {
      window.wx = sdk;
      return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }

  throw new Error('WeChat JSSDK is unavailable');
};

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

const registerLegacyWeChatShareData = (method, data) => {
  const shareApi = window.wx?.[method];
  if (typeof shareApi === 'function') shareApi(data);
};

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

const lockWeChatFontSize = () => {
  const bridge = window.WeixinJSBridge;
  if (!bridge || typeof bridge.invoke !== 'function') return;

  bridge.invoke('setFontSizeCallback', { fontSize: 0 });
};

const installWeChatFontSizeListener = () => {
  const bridge = window.WeixinJSBridge;
  if (!bridge || typeof bridge.on !== 'function') return;

  lockWeChatFontSize();
  bridge.on('menu:setfont', lockWeChatFontSize);
};

export const installWeChatFontSizeGuard = () => {
  if (!isWeChatBrowser()) return;

  if (window.WeixinJSBridge) {
    installWeChatFontSizeListener();
  } else {
    document.addEventListener('WeixinJSBridgeReady', installWeChatFontSizeListener, { once: true });
  }

  window.addEventListener('pageshow', lockWeChatFontSize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lockWeChatFontSize();
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
  if (!isWeChatBrowser()) return false;
  await waitForWeChatSdk();

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
      debug: debugEnabled,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareAppMessage',
        'onMenuShareTimeline'
      ]
    });
    window.wx.ready(resolve);
    window.wx.error(reject);
  });
  console.info('[WeChat JSSDK] config ready');

  const appMessageData = {
    title,
    desc: description,
    link,
    imgUrl: imageUrl
  };
  const timelineData = {
    title,
    link,
    imgUrl: imageUrl
  };

  registerLegacyWeChatShareData('onMenuShareAppMessage', appMessageData);
  registerLegacyWeChatShareData('onMenuShareTimeline', timelineData);

  await Promise.all([
    updateWeChatShareData('updateAppMessageShareData', appMessageData),
    updateWeChatShareData('updateTimelineShareData', timelineData)
  ]);
  console.info('[WeChat JSSDK] share data ready');

  return true;
};

export const installWeChatShareGuard = (router) => {
  if (!isWeChatBrowser()) return;

  router.afterEach((to) => {
    if (to.name === 'Result') return;

    void configureWeChatShare({
      title: '未来科学城 MBTI',
      description: '穿越时光之旅，看看你的未来科学城基因。',
      link: new URL('/', window.location.origin).href,
      imageUrl: new URL('/share.jpg', window.location.origin).href
    }).catch((error) => {
      console.error('Unable to configure default WeChat share', error);
    });
  });
};
