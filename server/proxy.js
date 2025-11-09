// server/proxy.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 4000;
const USER_AGENT = 'URWEBS-RSS-Fetcher/1.0 (+https://urwebs.com)';

app.get('/proxy', async (req, res) => {
  const url = req.query.url;

  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url');
    return;
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!upstream.ok) {
      console.error('[proxy] upstream fail', upstream.status, upstream.statusText, url);
      res.status(upstream.status).send(`Upstream error: ${upstream.statusText}`);
      return;
    }

    const xml = await upstream.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'max-age=60');
    res.send(xml);
  } catch (error) {
    console.error('[proxy] exception', error?.message, url);
    res.status(500).send(`Proxy failed: ${error?.message || error}`);
  }
});

app.listen(PORT, () => {
  console.log(`RSS proxy server running on http://localhost:${PORT}`);
});