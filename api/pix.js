const SUPABASE_URL = 'https://nmxfzofqvozkooqabrno.supabase.co/functions/v1/pix-payment-bynet'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const upstream = await fetch(SUPABASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ error: 'upstream_error' })
  }
}
