import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Config ─────────────────────────────────────────────────────────────────────
const AMOUNT_CENTS      = 3986
const INSURANCE_DISPLAY = 'R$ 39,86'
const COUNTDOWN_SECONDS = 300

// Stable apólice number per page load
const APOLICE = '#ALZ-' + (1000 + Math.floor(Math.random() * 9000))

// ── Helpers ────────────────────────────────────────────────────────────────────

function generateEmail(nome) {
  const parts = (nome || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(' ')
    .filter(w => w.length > 2)
  return (parts.slice(0, 2).join('') || 'usuario') + '2025@gmail.com'
}

function maskCpf(cpf) {
  const c = (cpf || '').replace(/\D/g, '')
  if (c.length < 11) return cpf
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**`
}

function shortName(nome) {
  const parts = (nome || '').split(' ').filter(Boolean)
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1]}`
  return nome
}

function fmtTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function getUtmParams() {
  const p = new URLSearchParams(window.location.search)
  function get(key) {
    return p.get(key) || sessionStorage.getItem('_utm_' + key) || null
  }
  return {
    utm_source:   get('utm_source'),
    utm_campaign: get('utm_campaign'),
    utm_medium:   get('utm_medium'),
    utm_content:  get('utm_content'),
    utm_term:     get('utm_term'),
    src:          get('src'),
    sck:          get('sck'),
    clickid:      get('clickid'),
  }
}

async function createPixPayment(userData, pixKeyType, pixKey) {
  const email = generateEmail(userData.nome)
  const phone = pixKeyType === 'telefone'
    ? pixKey.replace(/\D/g, '')
    : '00000000000'

  const res = await fetch('/api/pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name:         userData.nome,
      cpf:          userData.cpf,
      email,
      phone,
      amount_cents: AMOUNT_CENTS,
      description:  'Ebook Financeiro',
      product_id:   'ebook-financeiro',
      product_name: 'Ebook Financeiro',
      ...getUtmParams(),
    }),
  })

  if (!res.ok) throw new Error('http_error')
  const json = await res.json()
  if (!json.success) throw new Error('api_error')
  return {
    pixCode:  json.pix_code,
    qrBase64: json.qr_code_base64,
  }
}

// ── Coberturas ──────────────────────────────────────────────────────────────────

const IcoShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IcoPhone24 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16z"/>
  </svg>
)
const IcoCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)
const IcoCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

const COBERTURAS = [
  { label: 'Garantia em caso de invalidez ou morte', icon: <IcoShield /> },
  { label: 'Assistência 24 Horas',                   icon: <IcoPhone24 /> },
  { label: 'Proteção de score no Serasa/SPC',        icon: <IcoCheckCircle /> },
  { label: 'Assistência funeral familiar',            icon: <IcoCard /> },
]

function CoberturaItem({ label, icon }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const { userData, pixKeyType, pixKey } = state

  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [pixCode,  setPixCode]  = useState('')
  const [qrBase64, setQrBase64] = useState('')
  const [copied,   setCopied]   = useState(false)
  const [seconds,  setSeconds]  = useState(COUNTDOWN_SECONDS)

  // Redirect if accessed without state
  useEffect(() => {
    if (!userData) navigate('/emprestimo/simulacao', { replace: true })
  }, [])

  // Call payment API on mount
  useEffect(() => {
    if (!userData) return
    createPixPayment(userData, pixKeyType, pixKey)
      .then(({ pixCode: code, qrBase64: img }) => {
        setPixCode(code)
        setQrBase64(img)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // Countdown timer — starts after QR code loads
  useEffect(() => {
    if (loading || error) return
    const id = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [loading, error])

  function copyCode() {
    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (!userData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Allianz header ───────────────────────────────────────────────── */}
      <div className="bg-[#1E3A5F]">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-bold text-white text-lg tracking-wide">Allianz Seguros</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">APÓLICE</p>
            <p className="text-blue-200 text-sm font-semibold">{APOLICE}</p>
          </div>
        </div>
        {/* Sub-header with segurado info */}
        <div className="max-w-xl mx-auto px-5 pb-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-3">
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-0.5">SEGURADO</p>
            <p className="text-white font-bold text-sm">{shortName(userData.nome)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-0.5">CPF</p>
            <p className="text-white font-bold text-sm">{maskCpf(userData.cpf)}</p>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-5 py-6">

        {/* Total */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-green-500">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-lg font-extrabold text-gray-800">{INSURANCE_DISPLAY}</span>
        </div>

        {/* PIX section header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[#2563EB] font-semibold text-sm">Pagamento via PIX</span>
          <span className="bg-[#1E3A5F] text-white text-xs font-bold px-3 py-1 rounded-full">PIX</span>
        </div>

        {/* States: loading / error / QR code */}
        {loading ? (
          <div className="flex flex-col items-center py-14 gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-gray-200 border-t-[#2563EB] animate-spin" />
            <p className="text-gray-500 text-sm">Gerando QR Code de pagamento...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 mb-5">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-semibold text-gray-800 mb-1">Erro ao gerar pagamento</p>
            <p className="text-gray-500 text-sm mb-5">Não foi possível criar a cobrança. Tente novamente.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1E3A5F] text-white px-8 py-3 rounded-full font-semibold text-sm"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {/* QR Code */}
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <img src={qrBase64} alt="QR Code PIX" width={200} height={200} />
              </div>
            </div>

            {/* Truncated PIX code */}
            <div className="border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-400 font-mono truncate mb-3 bg-white">
              {pixCode}
            </div>

            {/* Copy button */}
            <button
              onClick={copyCode}
              className={`w-full py-4 rounded-full font-bold text-base mb-4 transition-all duration-200 ${copied
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1E3A5F] text-white hover:bg-[#172e4d]'
                }`}
            >
              {copied ? (
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Código copiado!
                </span>
              ) : 'Copiar código PIX'}
            </button>

            {/* Awaiting payment */}
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-3 mb-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-[#2563EB] animate-spin flex-shrink-0" />
              <span className="text-gray-500 text-sm">Aguardando pagamento...</span>
            </div>

            {/* Countdown */}
            <p className={`text-center font-bold text-sm mb-6 ${seconds > 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {seconds > 0 ? `Expira em ${fmtTime(seconds)}` : 'QR Code expirado'}
            </p>
          </>
        )}

        {/* Coberturas */}
        <div className="mt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">COBERTURAS INCLUÍDAS</p>
          <div className="flex flex-col gap-2">
            {COBERTURAS.map(c => <CoberturaItem key={c.label} label={c.label} icon={c.icon} />)}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-1">
          <p className="text-xs text-gray-400">Protegido por Allianz Seguros S.A.</p>
          <p className="text-xs text-gray-400">SUSEP 05.001.234/0001-56 | CNPJ 61.573.796/0001-66</p>
        </div>
      </div>
    </div>
  )
}
