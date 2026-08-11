const { createHash, randomBytes } = require('node:crypto');

let cachedTicket = null;
let ticketRequest = null;

const jsonResponse = (body, statusCode = 200) => ({
  isBase64Encoded: false,
  statusCode,
  headers: {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=UTF-8'
  },
  body: JSON.stringify(body)
});

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok || data.errcode) {
    throw new Error(`WeChat API error: ${data.errcode ?? response.status} ${data.errmsg ?? ''}`);
  }

  return data;
};

const requestJsapiTicket = async () => {
  if (cachedTicket && cachedTicket.expiresAt > Date.now()) return cachedTicket.value;
  if (ticketRequest) return ticketRequest;

  ticketRequest = (async () => {
    const tokenData = await requestJson('https://api.weixin.qq.com/cgi-bin/stable_token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: process.env.WECHAT_APP_ID,
        secret: process.env.WECHAT_APP_SECRET,
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

const getQuery = (event) => {
  const query = {
    ...(event.queryString || {}),
    ...(event.queryStringParameters || {})
  };

  if (event.rawQueryString) {
    for (const [key, value] of new URLSearchParams(event.rawQueryString)) {
      if (query[key] === undefined) query[key] = value;
    }
  }

  return query;
};

const getHeader = (event, name) => {
  const headers = {
    ...(event.headerParameters || {}),
    ...(event.headers || {})
  };
  const targetName = name.toLowerCase();
  const headerName = Object.keys(headers).find((key) => key.toLowerCase() === targetName);
  return headerName ? headers[headerName] : undefined;
};

const getMethod = (event) => (
  event.requestContext?.http?.method
  || event.requestContext?.httpMethod
  || event.httpMethod
  || 'GET'
).toUpperCase();

const getWeChatDebugDetails = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  const codeMatch = message.match(/WeChat API error:\s*(\d+)/i);
  const ipMatch = message.match(/invalid ip\s+([^\s,]+)/i);

  return {
    ...(codeMatch ? { wechatErrorCode: Number(codeMatch[1]) } : {}),
    ...(ipMatch ? { outboundIp: ipMatch[1] } : {})
  };
};

exports.main_handler = async (event) => {
  if (getMethod(event) !== 'GET') {
    return jsonResponse({ message: 'Method not allowed' }, 405);
  }

  if (!process.env.WECHAT_PROXY_TOKEN) {
    return jsonResponse({ message: 'WECHAT_PROXY_TOKEN is not configured' }, 503);
  }
  if (getHeader(event, 'x-wechat-proxy-token') !== process.env.WECHAT_PROXY_TOKEN) {
    return jsonResponse({ message: 'Unauthorized' }, 401);
  }
  if (!process.env.WECHAT_APP_ID || !process.env.WECHAT_APP_SECRET) {
    return jsonResponse({ message: 'WeChat environment variables are not configured' }, 503);
  }

  const query = getQuery(event);
  const pageUrlValue = query.url;
  if (!pageUrlValue) return jsonResponse({ message: 'Missing url parameter' }, 400);

  let pageUrl;
  try {
    pageUrl = new URL(pageUrlValue);
  } catch {
    return jsonResponse({ message: 'Invalid url parameter' }, 400);
  }

  let allowedOrigin;
  try {
    allowedOrigin = new URL(process.env.WECHAT_ALLOWED_ORIGIN).origin;
  } catch {
    return jsonResponse({ message: 'Invalid WECHAT_ALLOWED_ORIGIN' }, 503);
  }
  if (pageUrl.origin !== allowedOrigin) {
    return jsonResponse({ message: 'URL origin is not allowed' }, 403);
  }
  pageUrl.hash = '';

  try {
    const ticket = await requestJsapiTicket();
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = randomBytes(16).toString('hex');
    const signatureSource = [
      `jsapi_ticket=${ticket}`,
      `noncestr=${nonceStr}`,
      `timestamp=${timestamp}`,
      `url=${pageUrl.href}`
    ].join('&');
    const signature = createHash('sha1').update(signatureSource).digest('hex');

    return jsonResponse({
      appId: process.env.WECHAT_APP_ID,
      timestamp,
      nonceStr,
      signature
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      message: 'Unable to create WeChat signature',
      ...(query.debug === 'ip' ? getWeChatDebugDetails(error) : {})
    }, 502);
  }
};
