const PIX_STATUS_URL = 'https://apipix-delta.vercel.app/api/transactions/'
const PIX_API_KEY    = 'a66707fda2e24b9280e85d425cf2c8c1'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'missing_id' })
  }

  try {
    const upstream = await fetch(PIX_STATUS_URL + id, {
      headers: { 'api-key': PIX_API_KEY },
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ error: 'upstream_error' })
  }
}
