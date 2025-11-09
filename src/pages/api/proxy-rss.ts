import type { NextApiRequest, NextApiResponse } from 'next';

const USER_AGENT = 'URWEBS-RSS-Fetcher/1.0 (+https://urwebs.com)';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url =
    typeof req.query.url === 'string'
      ? req.query.url
      : Array.isArray(req.query.url)
      ? req.query.url[0]
      : '';

  if (!url) {
    res.status(400).send('Missing url');
    return;
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9,*/*;q=0.8'
      },
      // @ts-ignore -- node-fetch compatible option (Next.js edge/runtime handles)
      cache: 'no-store'
    });

    if (!upstream.ok) {
      console.error('[proxy-rss] upstream fail', upstream.status, upstream.statusText, url);
      res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
      return;
    }

    const xml = await upstream.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'max-age=60, s-maxage=120');
    res.status(200).send(xml);
  } catch (error: any) {
    console.error('[proxy-rss] exception', error?.message, url);
    res.status(500).send(`Proxy failed: ${error?.message || error}`);
  }
}
