import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LOGO = 'https://simuleoseucredito.com/emp/images/credpix-logo.png'

const RATES = {
  12: { monthly: 0.54, total: 3.21  },
  24: { monthly: 0.65, total: 6.24  },
  36: { monthly: 0.75, total: 9.32  },
  48: { monthly: 0.84, total: 12.46 },
  60: { monthly: 0.92, total: 15.66 },
  72: { monthly: 0.99, total: 18.92 },
}

const LOAN_MIN = 1000
const LOAN_MAX = 20000
const EASE = [0.22, 1, 0.36, 1]

// ── Utils ──────────────────────────────────────────────────────────────────────

function fmtBRL(v, dec = 2) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function fmtBRLInt(v) {
  return 'R$ ' + new Intl.NumberFormat('pt-BR').format(v)
}

function fmtCPF(raw) {
  return raw
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function fmtPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (!d.length) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function calcLoan(principal, n) {
  const { monthly, total } = RATES[n]
  const totalAmount    = principal * (1 + total / 100)
  const monthlyPayment = totalAmount / n
  const cet            = (Math.pow(1 + monthly / 100, 12) - 1) * 100
  return { totalAmount, monthlyPayment, monthlyRate: monthly, cet }
}

function firstPaymentDate() {
  const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const d = new Date()
  d.setDate(d.getDate() + 180)
  return `${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

async function cpfLookup(cpf) {
  const clean = cpf.replace(/\D/g, '')
  const res   = await fetch(`/api/cpf?cpf=${clean}`)
  if (!res.ok) throw new Error('network')
  const json = await res.json()
  if (!json?.DADOS) throw new Error('not_found')
  return json.DADOS
}

// ── Shared layout pieces ───────────────────────────────────────────────────────

function FunnelHeader() {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <img src={LOGO} alt="CredPix" className="h-7 object-contain" />
      <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        Regulado · Lei 10.820/2023
      </div>
    </header>
  )
}

function ProgressBar({ label, pct }) {
  return (
    <div className="mb-7">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-[#2563EB]">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#2563EB] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.75, ease: EASE }}
        />
      </div>
    </div>
  )
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
    >
      ← Voltar
    </button>
  )
}

function Page({ children }) {
  return (
    <motion.div
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0,  opacity: 1 }}
      exit={{    x: -48, opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="max-w-xl mx-auto px-5 py-8"
    >
      {children}
    </motion.div>
  )
}

function OptionCard({ iconBg, icon, title, sub, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-[#1E3A5F] text-[15px]">{title}</p>
          <p className="text-gray-400 text-sm">{sub}</p>
        </div>
      </div>
      <span className="text-gray-400 text-xl ml-3">→</span>
    </motion.button>
  )
}

function StepItem({ label, sub, status, isLast, strike = false }) {
  const done    = status === 'done'
  const loading = status === 'loading'
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-400 ${
          done    ? 'bg-[#2E7D32] border-[#2E7D32]' :
          loading ? 'bg-white border-[#2563EB]' :
                    'bg-gray-100 border-gray-200'
        }`}>
          {done && (
            <motion.svg
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          )}
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 rounded-full border-2 border-[#2563EB] border-t-transparent"
            />
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 ${done || loading ? 'bg-[#2563EB]/40' : 'bg-gray-200'}`} />
        )}
      </div>
      <div className="pb-5 pt-1.5 min-h-[44px]">
        <p className={`font-semibold text-[15px] ${strike && done ? 'line-through text-gray-400' : 'text-[#1E293B]'}`}>
          {label}
        </p>
        <p className={`text-sm ${strike && done ? 'line-through text-gray-300' : 'text-gray-400'}`}>{sub}</p>
      </div>
    </div>
  )
}

function DataRow({ icon, label, value, isLast }) {
  return (
    <div className={`flex items-center gap-4 py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-bold text-[#1E3A5F] text-[15px]">{value}</p>
      </div>
    </div>
  )
}

// ── SVG mini icons ─────────────────────────────────────────────────────────────

const IcoWarn = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const IcoPerson = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IcoBriefcase = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)
const IcoDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const IcoUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IcoUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IcoCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IcoShieldBlue = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
)
const IcoLockSm = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IcoCalSm = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IcoMoney = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)
const IcoTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
)
const IcoPix = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M12 2L15 5.5L12 9L9 5.5L12 2Z"/>
    <path d="M2 12L5.5 9L9 12L5.5 15L2 12Z"/>
    <path d="M12 22L15 18.5L12 15L9 18.5L12 22Z"/>
    <path d="M22 12L18.5 9L15 12L18.5 15L22 12Z"/>
  </svg>
)
const IcoBank = ({ color = 'currentColor', size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
)
const IcoIdCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="9" cy="12" r="2"/>
    <path d="M13 12h4"/><path d="M13 16h4"/><path d="M5 16h4"/>
  </svg>
)
const IcoMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IcoPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.6 16z"/>
  </svg>
)
const IcoKey = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
)

// ── Screen 1: Credit type selection ───────────────────────────────────────────

function TypeSelectScreen({ onSelect }) {
  return (
    <Page>
      <div className="text-center mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-[#2563EB] font-semibold text-xs tracking-widest uppercase mb-3"
        >
          Crédito Consignado · 100% Online
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="text-3xl font-extrabold text-[#1E3A5F] mb-2 leading-tight"
        >
          Crédito pré-aprovado em até 5 minutos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-gray-500"
        >
          Primeira parcela só após 180 dias.
        </motion.p>
      </div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4"
      >
        Qual sua situação atual?
      </motion.p>

      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        className="flex flex-col gap-3"
      >
        {[
          { iconBg: 'bg-amber-50',  icon: <IcoWarn />,      title: 'Crédito para Negativados',    sub: 'Primeira parcela após 180 dias', type: 'negativado' },
          { iconBg: 'bg-blue-50',   icon: <IcoPerson />,    title: 'Crédito para Pessoa Física',  sub: 'Primeira parcela após 180 dias', type: 'fisica'     },
          { iconBg: 'bg-green-50',  icon: <IcoBriefcase />, title: 'Crédito para Pessoa Jurídica',sub: 'Primeira parcela após 220 dias', type: 'juridica'   },
        ].map(opt => (
          <motion.div
            key={opt.type}
            variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } } }}
          >
            <OptionCard {...opt} onClick={() => onSelect(opt.type)} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="mt-5 bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-gray-500"
      >
        <IcoLockSm /> Seus dados são protegidos pela LGPD e criptografados de ponta a ponta.
      </motion.div>
    </Page>
  )
}

// ── Screen 2: CPF input ────────────────────────────────────────────────────────

function CPFScreen({ onSubmit, onBack }) {
  const [cpf, setCpf] = useState('')
  const clean = cpf.replace(/\D/g, '')
  const valid = clean.length === 11

  return (
    <Page>
      <ProgressBar label="Etapa 1 de 8" pct={13} />
      <BackBtn onClick={onBack} />

      <motion.h2
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-extrabold text-[#1E3A5F] mb-2"
      >
        Vamos começar com seu CPF
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="text-gray-500 mb-7"
      >
        Usamos para validar sua identidade e calcular seu limite disponível.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label className="block text-sm font-semibold text-gray-600 mb-2">CPF</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={e => setCpf(fmtCPF(e.target.value))}
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-xl text-[#1E293B] placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
          <IcoLockSm /> Seus dados são protegidos pela LGPD.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-7">
        <motion.button
          whileHover={valid ? { scale: 1.02 } : {}}
          whileTap={valid ? { scale: 0.98 } : {}}
          disabled={!valid}
          onClick={() => valid && onSubmit(cpf)}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
            valid
              ? 'bg-[#1E3A5F] text-white hover:bg-[#172e4d] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </motion.button>
      </motion.div>
    </Page>
  )
}

// ── Screen 3: CPF verification loading ────────────────────────────────────────

const CPF_STEPS = [
  { label: 'Documento',  sub: 'Validando CPF na Receita'   },
  { label: 'Identidade', sub: 'Confirmando seus dados'      },
  { label: 'Filiação',   sub: 'Verificando registros'       },
  { label: 'Nascimento', sub: 'Validando informações'       },
]

function CPFLoadingScreen({ cpf, onComplete, onError }) {
  const [done, setDone] = useState(0)

  useEffect(() => {
    const timers = [1350, 2700, 4050, 5400].map((t, i) =>
      setTimeout(() => setDone(i + 1), t)
    )

    const minWait = new Promise(r => setTimeout(r, 6000))
    const apiCall = cpfLookup(cpf)

    Promise.all([minWait, apiCall])
      .then(([, data]) => onComplete(data))
      .catch(() => onError())

    return () => timers.forEach(clearTimeout)
  }, [])

  const pct = Math.round((done / CPF_STEPS.length) * 100)

  return (
    <Page>
      <ProgressBar label="Verificando seus dados" pct={pct} />
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-2"
        >
          Verificando seus dados
        </motion.h2>
        <p className="text-gray-500">Isso leva alguns segundos. Não feche a tela.</p>
        <p className="text-sm text-gray-400 mt-1">
          CPF: <span className="font-bold text-gray-600">{cpf}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {CPF_STEPS.map((s, i) => {
          const status = done > i ? 'done' : done === i ? 'loading' : 'pending'
          return (
            <StepItem key={s.label} {...s} status={status} isLast={i === CPF_STEPS.length - 1} />
          )
        })}
        <AnimatePresence>
          {done < CPF_STEPS.length && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-2 text-sm text-gray-400"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#2563EB] flex-shrink-0"
              />
              <IcoLockSm /> Processando dados com segurança...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  )
}

// ── Screen 4: Data confirmation ────────────────────────────────────────────────

function DataConfirmScreen({ userData, onConfirm, onBack }) {
  const rows = [
    { icon: <IcoDoc />,      label: 'Documento',  value: userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') },
    { icon: <IcoUser />,     label: 'Nome',       value: userData?.nome              },
    { icon: <IcoUsers />,    label: 'Filiação',   value: userData?.nome_mae          },
    { icon: <IcoCalendar />, label: 'Nascimento', value: userData?.data_nascimento   },
  ]

  return (
    <Page>
      <ProgressBar label="Etapa 2 de 8" pct={25} />

      <div className="text-center mb-7">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-1">Encontramos você!</h2>
        <p className="text-gray-500">Confirme se os dados estão corretos para continuar.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 px-5 mb-4"
      >
        {rows.map((r, i) => <DataRow key={r.label} {...r} isLast={i === rows.length - 1} />)}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 px-4 py-2.5 rounded-xl mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Dados confirmados na Receita Federal
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
        >
          Estão corretos, continuar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={onBack}
          className="w-full border-2 border-gray-200 text-gray-500 py-4 rounded-full font-semibold hover:border-gray-300 transition-colors"
        >
          Não sou eu
        </motion.button>
      </div>
    </Page>
  )
}

// ── Screen 5: Credit analysis loading ─────────────────────────────────────────

const CREDIT_STEPS = [
  { label: 'Antecedentes criminais',          sub: 'Concluído'   },
  { label: 'Órgãos de proteção ao crédito',   sub: 'Concluído'   },
  { label: 'Validando comprovantes de renda',  sub: 'Concluído'   },
  { label: 'Consulta à Receita Federal',       sub: 'Concluído'   },
  { label: 'Histórico de solicitações',        sub: 'Concluído'   },
  { label: 'Processo final de aprovação',      sub: 'Em análise · 100%' },
]

function CreditLoadingScreen({ onComplete }) {
  const [done, setDone] = useState(0)

  useEffect(() => {
    const timers = [900, 1800, 2700, 3600, 4500, 5400].map((t, i) =>
      setTimeout(() => setDone(i + 1), t)
    )
    const final = setTimeout(onComplete, 6600)
    return () => [...timers, final].forEach(clearTimeout)
  }, [])

  const pct = Math.round((done / CREDIT_STEPS.length) * 100)

  return (
    <Page>
      <ProgressBar label="Análise de crédito" pct={pct} />
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-[#1E3A5F] mb-2">Analisando sua aprovação</h2>
        <p className="text-gray-500">Isso pode levar até 30 segundos.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {CREDIT_STEPS.map((s, i) => {
          const status = done > i ? 'done' : done === i ? 'loading' : 'pending'
          return <StepItem key={s.label} {...s} status={status} isLast={i === CREDIT_STEPS.length - 1} />
        })}
      </div>
    </Page>
  )
}

// ── Screen 6: Loan amount + installments ──────────────────────────────────────

function LoanSelectScreen({ amount, installments, onAmountChange, onInstallmentsChange, onConfirm }) {
  const loan     = calcLoan(amount, installments)
  const progress = ((amount - LOAN_MIN) / (LOAN_MAX - LOAN_MIN)) * 100

  return (
    <Page>
      <ProgressBar label="Etapa 3 de 8" pct={38} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 px-4 py-2 rounded-full w-fit mx-auto mb-5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        Você foi aprovado!
      </motion.div>

      <h2 className="text-2xl font-extrabold text-[#1E3A5F] text-center mb-6">
        Escolha o valor que deseja receber
      </h2>

      <div className="text-center mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Valor do Empréstimo</p>
        <motion.div key={amount} initial={{ scale: 1.08, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15 }}>
          <span className="text-gray-400 text-2xl font-light">R$</span>
          <span className="text-4xl font-extrabold text-[#1E3A5F] ml-1">
            {new Intl.NumberFormat('pt-BR').format(amount)}
          </span>
        </motion.div>
      </div>

      <div className="mb-7">
        <input
          type="range"
          min={LOAN_MIN} max={LOAN_MAX} step={500}
          value={amount}
          onChange={e => onAmountChange(Number(e.target.value))}
          className="loan-slider"
          style={{ '--progress': `${progress}%` }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>{fmtBRLInt(LOAN_MIN)}</span><span>{fmtBRLInt(LOAN_MAX)}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Em quantas parcelas?</p>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[12, 24, 36, 48, 60, 72].map(n => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => onInstallmentsChange(n)}
            className={`py-3.5 rounded-full font-semibold text-sm transition-all ${
              installments === n
                ? 'bg-[#1E3A5F] text-white'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-[#2563EB]'
            }`}
          >
            {n}x
          </motion.button>
        ))}
      </div>

      <motion.div
        key={`${amount}-${installments}`}
        initial={{ opacity: 0.7, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-100 rounded-2xl overflow-hidden mb-2"
      >
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-blue-100">
          <span className="text-gray-600 font-medium">{installments}x de</span>
          <span className="font-extrabold text-[#1E3A5F] text-lg">{fmtBRL(loan.monthlyPayment)}</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3.5">
          <span className="text-gray-600 font-medium">Total a pagar</span>
          <span className="font-extrabold text-[#1E3A5F] text-lg">{fmtBRL(loan.totalAmount)}</span>
        </div>
      </motion.div>
      <p className="text-center text-xs text-gray-400 mb-6">
        Taxa de {loan.monthlyRate.toFixed(2).replace('.', ',')}% ao mês · CET {loan.cet.toFixed(2).replace('.', ',')}% a.a.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
      >
        Confirmar valor
      </motion.button>
    </Page>
  )
}

// ── Screen 7: Income range ─────────────────────────────────────────────────────

const INCOME_RANGES = [
  'R$ 1.500 a R$ 2.000',
  'R$ 2.500 a R$ 3.000',
  'R$ 3.500 a R$ 7.000',
  'Acima de R$ 10.000',
]

function IncomeRangeScreen({ onSelect }) {
  return (
    <Page>
      <ProgressBar label="Etapa 4 de 8" pct={50} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Qual sua renda mensal?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        Vamos personalizar suas parcelas para caber no seu orçamento.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="flex flex-col gap-3"
      >
        {INCOME_RANGES.map(r => (
          <motion.button
            key={r}
            variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
            whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(r)}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
          >
            <span className="font-semibold text-[#1E3A5F] text-[15px]">{r}</span>
            <span className="text-gray-400">→</span>
          </motion.button>
        ))}
      </motion.div>
    </Page>
  )
}

// ── Screen 8: Income type ──────────────────────────────────────────────────────

const INCOME_TYPES = [
  { title: 'Renda FIXA',     sub: 'Assalariado, aposentado ou pensionista', val: 'fixa'     },
  { title: 'Renda VARIÁVEL', sub: 'Autônomo, MEI ou empresário',            val: 'variavel' },
  { title: 'DESEMPREGADO',   sub: 'Sem renda formal no momento',            val: 'desempregado' },
]

function IncomeTypeScreen({ onSelect }) {
  return (
    <Page>
      <ProgressBar label="Etapa 4 de 8" pct={50} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Como você recebe?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="text-gray-500 mb-7">
        Selecione o tipo que melhor descreve sua situação.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        className="flex flex-col gap-3"
      >
        {INCOME_TYPES.map(t => (
          <motion.button
            key={t.val}
            variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
            whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(t.val)}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
          >
            <div>
              <p className="font-semibold text-[#1E3A5F] text-[15px]">{t.title}</p>
              <p className="text-gray-400 text-sm">{t.sub}</p>
            </div>
            <span className="text-gray-400 ml-3">→</span>
          </motion.button>
        ))}
      </motion.div>
    </Page>
  )
}

// ── Screen 9: Profile analysis loading ────────────────────────────────────────

const PROFILE_STEPS = [
  'Validando suas informações...',
  'Cruzando com seu limite pré-aprovado...',
  'Confirmando capacidade de pagamento...',
]

function ProfileLoadingScreen({ onComplete }) {
  const [done, setDone] = useState(0)

  useEffect(() => {
    const timers = [1050, 2100, 3150].map((t, i) => setTimeout(() => setDone(i + 1), t))
    const final  = setTimeout(onComplete, 4200)
    return () => [...timers, final].forEach(clearTimeout)
  }, [])

  const barPct    = Math.round((done / PROFILE_STEPS.length) * 100)
  const topBarPct = Math.round(63 * (done / PROFILE_STEPS.length))

  return (
    <Page>
      <ProgressBar label="Etapa 5 de 8" pct={topBarPct} />
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center mx-auto mb-5"
        >
          <IcoShieldBlue />
        </motion.div>
        <h2 className="text-xl font-extrabold text-[#1E3A5F] mb-1">Analisando suas informações</h2>
        <p className="text-gray-500 text-sm mb-5">Confirmando se o limite escolhido cabe no seu perfil.</p>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-[#2563EB] rounded-full"
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>

        <div className="text-left flex flex-col gap-3">
          {PROFILE_STEPS.map((s, i) => {
            const isDone = done > i
            return (
              <div key={s} className="flex items-center gap-3">
                {isDone ? (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                )}
                <span className={`text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-600'}`}>{s}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Page>
  )
}

// ── Screen 10: Approved ────────────────────────────────────────────────────────

function ApprovedScreen({ amount, installments, onContinue }) {
  const loan    = calcLoan(amount, installments)
  const payDate = firstPaymentDate()

  return (
    <Page>
      <ProgressBar label="Etapa 5 de 8" pct={63} />

      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="bg-white rounded-2xl border-t-4 border-t-green-500 border border-gray-100 p-7 text-center mb-4"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-1.5 text-green-600 font-semibold text-sm bg-green-50 px-3 py-1.5 rounded-full w-fit mx-auto mb-4"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Empréstimo aprovado!
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-1 leading-snug"
        >
          Seu valor de{' '}
          <span className="text-[#2563EB]">{fmtBRL(amount, 2)}</span>
          {' '}está liberado
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="text-gray-500"
        >
          Em {installments}x de {fmtBRL(loan.monthlyPayment)}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-start gap-3 mb-6"
      >
        <div className="text-amber-600 mt-0.5 flex-shrink-0"><IcoCalSm /></div>
        <div>
          <p className="text-sm text-amber-800">
            Sua primeira parcela vence em{' '}
            <span className="font-bold text-amber-700">{payDate}</span>
          </p>
          <p className="text-sm text-amber-700 mt-0.5">
            Você tem mais de 180 dias para começar a pagar. Condição válida apenas para hoje.
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
      >
        Continuar para o saque →
      </motion.button>
    </Page>
  )
}

// ── Screen 11: Payment day ─────────────────────────────────────────────────────

function PaymentDayScreen({ onSelect }) {
  const payDate = firstPaymentDate()

  return (
    <Page>
      <ProgressBar label="Etapa 5 de 8" pct={63} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Em qual dia do mês prefere pagar?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        A primeira parcela só vence em <strong>{payDate}</strong>.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 gap-3"
      >
        {[5, 10, 15, 25].map(day => (
          <motion.button
            key={day}
            variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.35, ease: EASE } } }}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(37,99,235,.12)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(day)}
            className="bg-white rounded-2xl px-5 py-7 flex flex-col items-center border border-gray-100 hover:border-[#2563EB] transition-colors"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">DIA</p>
            <p className="text-4xl font-extrabold text-[#1E3A5F]">{String(day).padStart(2, '0')}</p>
          </motion.button>
        ))}
      </motion.div>
    </Page>
  )
}

// ── Screen 12: Loan confirmation ───────────────────────────────────────────────

function LoanConfirmScreen({ amount, installments, paymentDay, onContinue }) {
  const loan    = calcLoan(amount, installments)
  const payDate = firstPaymentDate()

  const rows = [
    { icon: <IcoMoney />,    iconBg: 'bg-blue-50',  textColor: 'text-[#2563EB]', label: 'VALOR',            value: fmtBRLInt(amount) },
    { icon: <IcoCalendar />, iconBg: 'bg-blue-50',  textColor: 'text-[#1E3A5F]', label: 'PARCELAS',         value: `${installments}x de ${fmtBRL(loan.monthlyPayment)}` },
    { icon: <IcoCalendar />, iconBg: 'bg-blue-50',  textColor: 'text-[#1E3A5F]', label: 'VENCIMENTO',       value: `Todo dia ${paymentDay}` },
    { icon: <IcoTrend />,    iconBg: 'bg-amber-50', textColor: 'text-[#1E3A5F]', label: 'PRIMEIRA PARCELA', value: payDate },
  ]

  return (
    <Page>
      <ProgressBar label="Etapa 6 de 8" pct={75} />

      <div className="text-center mb-7">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-1">
          Tudo certo!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-gray-500">
          Confira os detalhes do seu empréstimo.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="bg-white rounded-2xl border border-gray-100 px-5 mb-6"
      >
        {rows.map((r, i) => (
          <div key={r.label} className={`flex items-center gap-4 py-4 ${i < rows.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className={`w-10 h-10 rounded-full ${r.iconBg} flex items-center justify-center flex-shrink-0 ${r.textColor}`}>
              {r.icon}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{r.label}</p>
              <p className={`font-bold text-[15px] ${r.textColor}`}>{r.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
      >
        Continuar
      </motion.button>
    </Page>
  )
}

// ── Screen 13: Receive method ──────────────────────────────────────────────────

function ReceiveMethodScreen({ onSelect }) {
  return (
    <Page>
      <ProgressBar label="Etapa 7 de 8" pct={88} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Como deseja receber seu dinheiro?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        Escolha a forma de recebimento mais conveniente.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        className="flex flex-col gap-3"
      >
        {[
          { val: 'pix', iconBg: 'bg-[#1E3A5F]', icon: <IcoPix />, title: 'PIX', sub: 'Recebimento instantâneo · 24h' },
          { val: 'ted', iconBg: 'bg-gray-100',   icon: <IcoBank color="#1E3A5F" />, title: 'Transferência (TED)', sub: 'Em até 1 dia útil' },
        ].map(opt => (
          <motion.button
            key={opt.val}
            variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
            whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(opt.val)}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                {opt.icon}
              </div>
              <div>
                <p className="font-semibold text-[#1E3A5F] text-[15px]">{opt.title}</p>
                <p className="text-gray-400 text-sm">{opt.sub}</p>
              </div>
            </div>
            <span className="text-gray-400 text-xl ml-3">→</span>
          </motion.button>
        ))}
      </motion.div>
    </Page>
  )
}

// ── Screen 14: PIX key type ────────────────────────────────────────────────────

const PIX_KEY_TYPES_LIST = [
  { val: 'cpf',       icon: <IcoIdCard />, title: 'CPF',             sub: '000.000.000-00'          },
  { val: 'email',     icon: <IcoMail />,   title: 'E-mail',          sub: 'exemplo@email.com'       },
  { val: 'telefone',  icon: <IcoPhone />,  title: 'Telefone',        sub: '(00) 00000-0000'         },
  { val: 'aleatoria', icon: <IcoKey />,    title: 'Chave aleatória', sub: 'Código de 32 caracteres' },
]

function PixKeyTypeScreen({ onSelect }) {
  return (
    <Page>
      <ProgressBar label="Etapa 7 de 8" pct={88} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Qual o tipo da sua chave PIX?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        Selecione o tipo de chave que você cadastrou no seu banco.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="flex flex-col gap-3"
      >
        {PIX_KEY_TYPES_LIST.map(t => (
          <motion.button
            key={t.val}
            variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
            whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(t.val)}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
                {t.icon}
              </div>
              <div>
                <p className="font-semibold text-[#1E3A5F] text-[15px]">{t.title}</p>
                <p className="text-gray-400 text-sm">{t.sub}</p>
              </div>
            </div>
            <span className="text-gray-400 text-xl ml-3">→</span>
          </motion.button>
        ))}
      </motion.div>
    </Page>
  )
}

// ── Screen 15: PIX key input ───────────────────────────────────────────────────

const PIX_KEY_CONFIG = {
  cpf:       { label: 'CPF',            placeholder: '000.000.000-00',       inputMode: 'numeric', fmt: fmtCPF,            isValid: v => v.replace(/\D/g,'').length === 11 },
  email:     { label: 'E-MAIL',         placeholder: 'exemplo@email.com',    inputMode: 'email',   fmt: v => v,            isValid: isValidEmail },
  telefone:  { label: 'TELEFONE',       placeholder: '(00) 00000-0000',      inputMode: 'tel',     fmt: fmtPhone,          isValid: v => v.replace(/\D/g,'').length === 11 },
  aleatoria: { label: 'CHAVE ALEATÓRIA', placeholder: 'Cole sua chave aqui', inputMode: 'text',    fmt: v => v.slice(0,36), isValid: v => v.trim().length >= 10 },
}

const PIX_KEY_SUB = {
  cpf:       'Use seu CPF como chave.',
  email:     'Use seu e-mail cadastrado.',
  telefone:  'Use sua chave telefone.',
  aleatoria: 'Use sua chave aleatória de 32 caracteres.',
}

const PIX_KEY_LABEL = {
  cpf:       'CHAVE CPF',
  email:     'CHAVE E-MAIL',
  telefone:  'CHAVE TELEFONE',
  aleatoria: 'CHAVE ALEATÓRIA',
}

function PixKeyInputScreen({ pixKeyType, pixKey, onKeyChange, onSubmit, onBack }) {
  const cfg   = PIX_KEY_CONFIG[pixKeyType]
  const valid = cfg.isValid(pixKey)

  return (
    <Page>
      <ProgressBar label="Etapa 7 de 8" pct={88} />
      <BackBtn onClick={onBack} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Digite sua chave PIX
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        {PIX_KEY_SUB[pixKeyType]}
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{cfg.label}</label>
        <input
          type={pixKeyType === 'email' ? 'email' : 'text'}
          inputMode={cfg.inputMode}
          placeholder={cfg.placeholder}
          value={pixKey}
          onChange={e => onKeyChange(cfg.fmt(e.target.value))}
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-xl text-[#1E293B] placeholder-gray-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          A chave deve estar registrada em seu banco em seu nome.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-7">
        <motion.button
          whileHover={valid ? { scale: 1.02 } : {}}
          whileTap={valid ? { scale: 0.98 } : {}}
          disabled={!valid}
          onClick={() => valid && onSubmit()}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
            valid
              ? 'bg-[#1E3A5F] text-white hover:bg-[#172e4d] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </motion.button>
      </motion.div>
    </Page>
  )
}

// ── Screen 16: PIX key confirm ─────────────────────────────────────────────────

function PixKeyConfirmScreen({ pixKeyType, pixKey, onConfirm, onBack }) {
  return (
    <Page>
      <ProgressBar label="Etapa 7 de 8" pct={88} />

      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5 flex gap-3 items-start mb-7"
      >
        <div className="text-amber-500 flex-shrink-0 mt-0.5"><IcoWarn /></div>
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">ATENÇÃO</p>
          <p className="text-sm text-amber-800">
            Confira sua chave PIX com cuidado. <strong>Não conseguimos reverter</strong> o pagamento depois de enviado.
          </p>
        </div>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-5">
        Sua chave PIX está correta?
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="border-2 border-dashed border-[#2563EB] rounded-2xl px-5 py-5 text-center mb-7"
      >
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{PIX_KEY_LABEL[pixKeyType]}</p>
        <p className="text-xl font-bold text-[#1E3A5F] break-all">{pixKey}</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
        >
          Sim, está correta
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={onBack}
          className="w-full border-2 border-gray-200 text-gray-500 py-4 rounded-full font-semibold hover:border-gray-300 transition-colors"
        >
          Corrigir
        </motion.button>
      </div>
    </Page>
  )
}

// ── Screen 17: Withdrawal warning ─────────────────────────────────────────────

function WithdrawalWarningScreen({ onContinue }) {
  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />

      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-amber-400 flex items-center justify-center mx-auto mb-6"
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-3">
          Atenção
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="text-gray-500 mb-4">
          Ao continuar, você inicia o saque do seu empréstimo.
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-gray-500 mb-9">
          Se não concluir a próxima etapa, o valor será <strong className="text-gray-700">cancelado</strong> e liberado para outro cliente.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
        >
          Efetuar saque agora
        </motion.button>
      </div>
    </Page>
  )
}

// ── Screen 18: Request summary ─────────────────────────────────────────────────

function RequestSummaryScreen({ userData, loanAmount, onContinue }) {
  const formattedCpf = userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Resumo da sua solicitação
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        Confira os dados antes de finalizar.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-gray-100 px-5 mb-5"
      >
        {[
          { icon: <IcoUser />,   iconBg: 'bg-blue-50',  textColor: 'text-[#1E3A5F]', label: 'NOME',           value: userData?.nome },
          { icon: <IcoIdCard />, iconBg: 'bg-blue-50',  textColor: 'text-[#1E3A5F]', label: 'CPF',            value: formattedCpf },
          { icon: <IcoMoney />,  iconBg: 'bg-green-50', textColor: 'text-[#16A34A]', label: 'VALOR APROVADO', value: fmtBRLInt(loanAmount) },
        ].map((r, i, arr) => (
          <div key={r.label} className={`flex items-center gap-4 py-4 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className={`w-10 h-10 rounded-full ${r.iconBg} flex items-center justify-center flex-shrink-0 ${r.textColor}`}>
              {r.icon}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{r.label}</p>
              <p className={`font-bold text-[15px] ${r.textColor}`}>{r.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-blue-50 rounded-2xl px-5 py-4 flex items-start gap-4 mb-6"
      >
        <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
          <IcoShieldBlue />
        </div>
        <div>
          <p className="font-bold text-[#1E3A5F] mb-1">É necessário contratar o Seguro Prestamista</p>
          <p className="text-sm text-gray-600">
            O seguro protege seu empréstimo em caso de imprevistos. <strong>O valor é devolvido a você</strong> automaticamente após a quitação do empréstimo.
          </p>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors"
      >
        Continuar
      </motion.button>
    </Page>
  )
}

// ── Screen 19: Insurance choice ────────────────────────────────────────────────

function InsuranceChoiceScreen({ onSelect }) {
  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold text-[#1E3A5F] mb-2">
        Como deseja prosseguir?
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-500 mb-7">
        Escolha a opção mais adequada para liberar seu empréstimo.
      </motion.p>
      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="flex flex-col gap-3"
      >
        {/* Recommended — Insurance */}
        <motion.div
          variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
          className="relative pt-3"
        >
          <div className="absolute top-0 left-4 z-10">
            <span className="bg-[#1E3A5F] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Recomendado
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: '0 4px 24px rgba(37,99,235,.12)' }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect('seguradora')}
            className="w-full bg-white rounded-2xl px-5 py-5 border-2 border-[#2563EB] text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
                <IcoShieldBlue />
              </div>
              <div>
                <p className="font-bold text-[#1E3A5F] text-[16px] mb-0.5">Prefiro a Seguradora</p>
                <p className="text-gray-400 text-sm mb-2">
                  Liberação <strong className="text-gray-600">hoje mesmo</strong> · valor devolvido após a quitação.
                </p>
                <span className="inline-block bg-blue-50 text-[#2563EB] text-xs font-bold px-3 py-1 rounded-lg">
                  R$ 24,90 seguro único
                </span>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Guarantee */}
        <motion.button
          variants={{ hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.38, ease: EASE } } }}
          whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect('garantia')}
          className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-100 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <IcoBank color="#1E3A5F" />
            </div>
            <div>
              <p className="font-semibold text-[#1E3A5F] text-[15px]">Oferecer garantia</p>
              <p className="text-gray-400 text-sm">Veículo ou imóvel · Avaliação em até 30 dias úteis</p>
            </div>
          </div>
          <span className="text-gray-400 text-xl ml-3">→</span>
        </motion.button>
      </motion.div>
    </Page>
  )
}

// ── Screen 20: Insurance loading ──────────────────────────────────────────────

const INSURANCE_STEPS = [
  'Calculando tarifa de seguro...',
  'Validando apólice digital com a Allianz...',
  'Confirmando declaração de seguro...',
  'Gerando guia de pagamento...',
]

function InsuranceLoadingScreen({ onComplete }) {
  const [done, setDone] = useState(0)
  useEffect(() => {
    const timers = [1000, 2000, 3000, 4000].map((t, i) => setTimeout(() => setDone(i + 1), t))
    const final  = setTimeout(onComplete, 4500)
    return () => [...timers, final].forEach(clearTimeout)
  }, [])
  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />
      <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center mx-auto mb-5"
        >
          <IcoShieldBlue />
        </motion.div>
        <h2 className="text-xl font-extrabold text-[#1E3A5F] mb-1">Calculando seu seguro</h2>
        <p className="text-gray-500 text-sm mb-6">Isso leva apenas alguns segundos.</p>
        <div className="text-left">
          {INSURANCE_STEPS.map((s, i) => {
            const status = done > i ? 'done' : done === i ? 'loading' : 'pending'
            return <StepItem key={s} label={s} sub="" status={status} isLast={i === INSURANCE_STEPS.length - 1} />
          })}
        </div>
      </div>
    </Page>
  )
}

// ── Screen 21: Insurance detail ────────────────────────────────────────────────

function InsuranceDetailScreen({ userData, loanAmount, onConfirm, onBack }) {
  const formattedCpf = userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  const firstName    = userData?.nome?.split(' ').slice(0, 3).join(' ')
  const coverages    = [
    'Quitação do empréstimo em caso de morte ou invalidez',
    `Auxílio funeral até ${fmtBRLInt(loanAmount)}`,
    'Apólice digital válida em todo o Brasil',
  ]
  const tariff = [
    { label: 'Declaração de Seguro', value: 'R$ 8,46'  },
    { label: 'Proteção Seguradora',  value: 'R$ 24,90' },
    { label: 'Apólice Virtual',      value: 'R$ 6,50'  },
  ]
  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />
      <BackBtn onClick={onBack} />
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, delay: 0.05 }}
          className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
          </svg>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-1">
          Garanta seu empréstimo
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-gray-500 text-sm">
          Tarifa única calculada sobre o valor disponível ({fmtBRLInt(loanAmount)}).
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden border border-gray-200 mb-4"
      >
        <div className="bg-[#1E3A5F] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            ALLIANZ
          </div>
          <span className="text-blue-300 text-xs font-semibold">SUSEP 0918</span>
        </div>
        <div className="bg-white px-5 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">SEGURADO</p>
            <p className="font-bold text-[#1E3A5F] text-sm">{firstName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CPF</p>
            <p className="font-bold text-[#1E3A5F] text-sm">{formattedCpf}</p>
          </div>
        </div>
        <div className="bg-white px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">COBERTURA INCLUSA</p>
          <div className="flex flex-col gap-2">
            {coverages.map(c => (
              <div key={c} className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-sm text-gray-600">{c}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white px-5 py-4 border-b border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">COMPOSIÇÃO DA TARIFA</p>
          <div className="flex flex-col gap-2">
            {tariff.map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-[#2563EB]">{t.label}</span>
                <span className="text-sm font-bold text-[#1E3A5F]">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#1E3A5F] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">VALOR ÚNICO</p>
            <p className="text-xs text-blue-200">Pagamento à vista</p>
          </div>
          <span className="text-2xl font-extrabold text-white">R$ 39,86</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-blue-50 rounded-xl px-4 py-3 flex items-start gap-2.5 mb-6 text-sm text-gray-600"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>O valor do seguro é <strong>devolvido integralmente</strong> após a quitação do empréstimo (Lei nº 10.820/2023).</span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="w-full bg-[#1E3A5F] text-white py-4 rounded-full font-bold text-base hover:bg-[#172e4d] transition-colors mb-4"
      >
        Garantir meu empréstimo →
      </motion.button>
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <IcoLockSm /> Pagamento processado com segurança
      </p>
    </Page>
  )
}

// ── Screen 22: Checkout summary ────────────────────────────────────────────────

function CheckoutSummaryScreen({ userData, loanAmount, installments, paymentDay, receiveMethod, pixKeyType, pixKey, onConfirm }) {
  const loan         = calcLoan(loanAmount, installments)
  const formattedCpf = userData?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  const recStr       = receiveMethod === 'pix' ? `PIX · ${pixKey}` : 'Transferência (TED)'

  return (
    <Page>
      <ProgressBar label="Etapa 8 de 8" pct={100} />
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3"
        >
          Último Passo
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-2xl font-extrabold text-[#1E3A5F] mb-2 leading-snug"
        >
          Você está a 1 minuto de receber{' '}
          <span className="text-[#2563EB]">{fmtBRLInt(loanAmount)}</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-gray-500 text-sm">
          Após a confirmação do pagamento, o valor cai em até 5 minutos.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 px-5 mb-4"
      >
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
            <IcoUser />
          </div>
          <div>
            <p className="font-bold text-[#1E3A5F] text-[15px]">{userData?.nome}</p>
            <p className="text-gray-400 text-sm">{formattedCpf}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
            <IcoMoney />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">VALOR</p>
            <p className="font-bold text-[#1E3A5F] text-[15px]">
              {fmtBRLInt(loanAmount)} · {installments}x de {fmtBRL(loan.monthlyPayment)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
            <IcoCalendar />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">VENCIMENTO MENSAL</p>
            <p className="font-bold text-[#1E3A5F] text-[15px]">Dia {paymentDay}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center flex-shrink-0">
            {receiveMethod === 'pix' ? <IcoPix /> : <IcoBank color="white" size={16} />}
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">RECEBIMENTO</p>
            <p className="font-bold text-[#1E3A5F] text-[15px]">{recStr}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-5 py-4 flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">PAGAMENTO AGORA</p>
          <p className="text-sm text-amber-800 font-medium">Seguro Prestamista</p>
        </div>
        <span className="text-lg font-extrabold text-amber-700">R$ 39,86</span>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onConfirm}
        className="w-full bg-[#2563EB] text-white py-4 rounded-full font-bold text-base hover:bg-blue-700 transition-colors mb-3"
      >
        Confirmar e pagar taxa
      </motion.button>
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <IcoLockSm /> Conexão segura · Allianz Seguros
      </p>
    </Page>
  )
}

// ── Screen: CPF Error ──────────────────────────────────────────────────────────

function CPFErrorScreen({ onBack }) {
  return (
    <Page>
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[#1E3A5F] mb-2">CPF não encontrado</h2>
        <p className="text-gray-500 mb-7">Não foi possível localizar dados para este CPF. Verifique e tente novamente.</p>
        <button
          onClick={onBack}
          className="bg-[#1E3A5F] text-white px-8 py-3.5 rounded-full font-semibold"
        >
          Tentar novamente
        </button>
      </div>
    </Page>
  )
}

// ── Main Funnel component ──────────────────────────────────────────────────────

export default function Funnel() {
  const [screen,       setScreen]       = useState('type-select')
  const [creditType,   setCreditType]   = useState(null)
  const [cpf,          setCpf]          = useState('')
  const [userData,     setUserData]     = useState(null)
  const [loanAmount,   setLoanAmount]   = useState(5000)
  const [installments, setInstallments] = useState(12)
  const [paymentDay,   setPaymentDay]   = useState(null)
  const [receiveMethod, setReceiveMethod] = useState(null)
  const [pixKeyType,   setPixKeyType]   = useState(null)
  const [pixKey,       setPixKey]       = useState('')

  const navigate = useNavigate()

  function go(s) { setScreen(s) }

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <FunnelHeader />
      <AnimatePresence mode="wait">
        {screen === 'type-select' && (
          <TypeSelectScreen key="type-select"
            onSelect={t => { setCreditType(t); go('cpf') }}
          />
        )}
        {screen === 'cpf' && (
          <CPFScreen key="cpf"
            onSubmit={v => { setCpf(v); go('cpf-loading') }}
            onBack={() => go('type-select')}
          />
        )}
        {screen === 'cpf-loading' && (
          <CPFLoadingScreen key="cpf-loading"
            cpf={cpf}
            onComplete={data => { setUserData(data); go('data-confirm') }}
            onError={() => go('cpf-error')}
          />
        )}
        {screen === 'cpf-error' && (
          <CPFErrorScreen key="cpf-error"
            onBack={() => go('cpf')}
          />
        )}
        {screen === 'data-confirm' && (
          <DataConfirmScreen key="data-confirm"
            userData={userData}
            onConfirm={() => go('credit-loading')}
            onBack={() => go('cpf')}
          />
        )}
        {screen === 'credit-loading' && (
          <CreditLoadingScreen key="credit-loading"
            onComplete={() => go('loan-select')}
          />
        )}
        {screen === 'loan-select' && (
          <LoanSelectScreen key="loan-select"
            amount={loanAmount}
            installments={installments}
            onAmountChange={setLoanAmount}
            onInstallmentsChange={setInstallments}
            onConfirm={() => go('income-range')}
          />
        )}
        {screen === 'income-range' && (
          <IncomeRangeScreen key="income-range"
            onSelect={() => go('income-type')}
          />
        )}
        {screen === 'income-type' && (
          <IncomeTypeScreen key="income-type"
            onSelect={() => go('profile-loading')}
          />
        )}
        {screen === 'profile-loading' && (
          <ProfileLoadingScreen key="profile-loading"
            onComplete={() => go('approved')}
          />
        )}
        {screen === 'approved' && (
          <ApprovedScreen key="approved"
            amount={loanAmount}
            installments={installments}
            onContinue={() => go('payment-day')}
          />
        )}
        {screen === 'payment-day' && (
          <PaymentDayScreen key="payment-day"
            onSelect={d => { setPaymentDay(d); go('loan-confirm') }}
          />
        )}
        {screen === 'loan-confirm' && (
          <LoanConfirmScreen key="loan-confirm"
            amount={loanAmount}
            installments={installments}
            paymentDay={paymentDay}
            onContinue={() => go('receive-method')}
          />
        )}
        {screen === 'receive-method' && (
          <ReceiveMethodScreen key="receive-method"
            onSelect={m => {
              setReceiveMethod(m)
              if (m === 'pix') go('pix-key-type')
              else go('withdrawal-warning')
            }}
          />
        )}
        {screen === 'pix-key-type' && (
          <PixKeyTypeScreen key="pix-key-type"
            onSelect={t => { setPixKeyType(t); setPixKey(''); go('pix-key-input') }}
          />
        )}
        {screen === 'pix-key-input' && (
          <PixKeyInputScreen key="pix-key-input"
            pixKeyType={pixKeyType}
            pixKey={pixKey}
            onKeyChange={setPixKey}
            onSubmit={() => go('pix-key-confirm')}
            onBack={() => go('pix-key-type')}
          />
        )}
        {screen === 'pix-key-confirm' && (
          <PixKeyConfirmScreen key="pix-key-confirm"
            pixKeyType={pixKeyType}
            pixKey={pixKey}
            onConfirm={() => go('withdrawal-warning')}
            onBack={() => go('pix-key-input')}
          />
        )}
        {screen === 'withdrawal-warning' && (
          <WithdrawalWarningScreen key="withdrawal-warning"
            onContinue={() => go('request-summary')}
          />
        )}
        {screen === 'request-summary' && (
          <RequestSummaryScreen key="request-summary"
            userData={userData}
            loanAmount={loanAmount}
            onContinue={() => go('insurance-choice')}
          />
        )}
        {screen === 'insurance-choice' && (
          <InsuranceChoiceScreen key="insurance-choice"
            onSelect={() => go('insurance-loading')}
          />
        )}
        {screen === 'insurance-loading' && (
          <InsuranceLoadingScreen key="insurance-loading"
            onComplete={() => go('insurance-detail')}
          />
        )}
        {screen === 'insurance-detail' && (
          <InsuranceDetailScreen key="insurance-detail"
            userData={userData}
            loanAmount={loanAmount}
            onConfirm={() => go('checkout-summary')}
            onBack={() => go('insurance-choice')}
          />
        )}
        {screen === 'checkout-summary' && (
          <CheckoutSummaryScreen key="checkout-summary"
            userData={userData}
            loanAmount={loanAmount}
            installments={installments}
            paymentDay={paymentDay}
            receiveMethod={receiveMethod}
            pixKeyType={pixKeyType}
            pixKey={pixKey}
            onConfirm={() => navigate('/pagamento' + window.location.search, {
              state: { userData, loanAmount, installments, paymentDay, receiveMethod, pixKeyType, pixKey }
            })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
