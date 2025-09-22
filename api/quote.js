// File: /api/quote.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const symbols = String(req.query.symbols || '').toUpperCase().replace(/\s+/g, '');
    if (!symbols) return res.status(400).json({ error: 'Missing symbols param' });

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const r = await fetch(url, { cache: 'no-store', headers: { 'user-agent': 'nosson-hq/1.0' } });
    if (!r.ok) throw new Error(`Yahoo status ${r.status}`);

    const j = await r.json();
    const list = (j && j.quoteResponse && j.quoteResponse.result) ? j.quoteResponse.result : [];

    const out = list.map(q => ({
      symbol: q.symbol,
      marketState: q.marketState,
      regularMarketPrice: q.regularMarketPrice,
      preMarketPrice: q.preMarketPrice,
      postMarketPrice: q.postMarketPrice,
      bid: q.bid,
      ask: q.ask,
      previousClose: q.previousClose
    }));

    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: 'Upstream failure', detail: String(e) });
  }
}
