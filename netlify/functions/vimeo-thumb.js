exports.handler = async (event) => {
  const id = event.queryStringParameters && event.queryStringParameters.id;
  const hash = event.queryStringParameters && event.queryStringParameters.h;
  if (!id) return { statusCode: 400, body: 'Missing id' };

  const videoUrl = 'https://vimeo.com/' + id + (hash ? '?h=' + hash : '');
  const oembedUrl = 'https://vimeo.com/api/oembed.json?url=' + encodeURIComponent(videoUrl);

  try {
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Netlify)' }
    });
    if (!res.ok) return { statusCode: res.status, body: 'Vimeo error: ' + res.status };
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ thumbnail_url: data.thumbnail_url })
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};
