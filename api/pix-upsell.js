const PIX_API_URL = 'https://apipix-delta.vercel.app/api/pix/generate'
const PIX_API_KEY = 'a66707fda2e24b9280e85d425cf2c8c1'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const upstream = await fetch(PIX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': PIX_API_KEY,
      },
      body: JSON.stringify(req.body),
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ error: 'upstream_error' })
  }
}
