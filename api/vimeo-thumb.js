export default async function handler(req, res) {
  const { id, h } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const videoUrl = 'https://vimeo.com/' + id + (h ? '?h=' + h : '');
  const oembedUrl = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(videoUrl);

  try {
    const upstream = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Vercel)' }
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: 'Vimeo error' });
    const data = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.json({ thumbnail_url: data.thumbnail_url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
