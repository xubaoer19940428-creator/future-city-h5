const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=UTF-8'
  }
});

export async function onRequestGet({ request, env }) {
  if (!env.WECHAT_SCF_URL || !env.WECHAT_PROXY_TOKEN) {
    return jsonResponse({ message: 'WeChat SCF proxy variables are not configured' }, 503);
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

  let scfUrl;
  try {
    scfUrl = new URL(env.WECHAT_SCF_URL);
  } catch {
    return jsonResponse({ message: 'Invalid WECHAT_SCF_URL' }, 503);
  }
  scfUrl.searchParams.set('url', pageUrl.href);
  if (requestUrl.searchParams.get('debug') === 'ip') {
    scfUrl.searchParams.set('debug', 'ip');
  }

  try {
    const response = await fetch(scfUrl, {
      headers: {
        accept: 'application/json',
        'x-wechat-proxy-token': env.WECHAT_PROXY_TOKEN
      }
    });
    const responseBody = await response.text();

    try {
      return jsonResponse(JSON.parse(responseBody), response.status);
    } catch {
      console.error('SCF returned a non-JSON response', response.status);
      return jsonResponse({ message: 'Invalid response from WeChat signature service' }, 502);
    }
  } catch (error) {
    console.error('Unable to reach WeChat signature service', error);
    return jsonResponse({ message: 'Unable to reach WeChat signature service' }, 502);
  }
}
