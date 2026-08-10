let cachedTicket = null;
let ticketRequest = null;

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=UTF-8'
  }
});

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || data.errcode) {
    throw new Error(`WeChat API error: ${data.errcode ?? response.status} ${data.errmsg ?? ''}`);
  }

  return data;
};

const requestJsapiTicket = async (env) => {
  if (cachedTicket && cachedTicket.expiresAt > Date.now()) return cachedTicket.value;
  if (ticketRequest) return ticketRequest;

  ticketRequest = (async () => {
    const tokenData = await requestJson('https://api.weixin.qq.com/cgi-bin/stable_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: env.WECHAT_APP_ID,
        secret: env.WECHAT_APP_SECRET,
        force_refresh: false
      })
    });
    const ticketData = await requestJson(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${encodeURIComponent(tokenData.access_token)}&type=jsapi`
    );
    const expiresIn = Math.min(tokenData.expires_in ?? 7200, ticketData.expires_in ?? 7200);

    cachedTicket = {
      value: ticketData.ticket,
      expiresAt: Date.now() + Math.max(expiresIn - 300, 60) * 1000
    };

    return cachedTicket.value;
  })().finally(() => {
    ticketRequest = null;
  });

  return ticketRequest;
};

const createNonce = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const sha1 = async (value) => {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export async function onRequestGet({ request, env }) {
  if (!env.WECHAT_APP_ID || !env.WECHAT_APP_SECRET) {
    return jsonResponse({ message: 'WeChat environment variables are not configured' }, 503);
  }

  const requestUrl = new URL(request.url);
  const pageUrlValue = requestUrl.searchParams.get('url');
  if (!pageUrlValue) return jsonResponse({ message: 'Missing url parameter' }, 400);

  let pageUrl;
  try {
    pageUrl = new URL(pageUrlValue);
  } catch {
    return jsonResponse({ message: 'Invalid url parameter' }, 400);
  }

  let allowedOrigin;
  try {
    allowedOrigin = new URL(env.WECHAT_ALLOWED_ORIGIN || requestUrl.origin).origin;
  } catch {
    return jsonResponse({ message: 'Invalid WECHAT_ALLOWED_ORIGIN' }, 503);
  }
  if (pageUrl.origin !== allowedOrigin) {
    return jsonResponse({ message: 'URL origin is not allowed' }, 403);
  }
  pageUrl.hash = '';

  try {
    const ticket = await requestJsapiTicket(env);
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = createNonce();
    const signatureSource = [
      `jsapi_ticket=${ticket}`,
      `noncestr=${nonceStr}`,
      `timestamp=${timestamp}`,
      `url=${pageUrl.href}`
    ].join('&');

    return jsonResponse({
      appId: env.WECHAT_APP_ID,
      timestamp,
      nonceStr,
      signature: await sha1(signatureSource)
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ message: 'Unable to create WeChat signature' }, 502);
  }
}
