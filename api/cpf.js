const TOKEN = 'jp55cc85-6110-443a-99c5-8d778dff2b34'

export default async function handler(req, res) {
  const cpf = (req.query.cpf || '').replace(/\D/g, '')

  try {
    const upstream = await fetch(
      `https://api.amnesiatecnologia.lat/?token=${TOKEN}&cpf=${cpf}`
    )
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch {
    res.status(500).json({ error: 'upstream_error' })
  }
}
