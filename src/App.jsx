import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const LOGO    = 'https://simuleoseucredito.com/emp/images/credpix-logo.png'
const HERO_IMG = 'https://simuleoseucredito.com/emp/images/lp-a-hero.webp'
const MIN = 6500
const MAX = 32000

const EASE = [0.22, 1, 0.36, 1]
const VP   = { once: true, amount: 0.2 }

function fmt(v) {
  return 'R$ ' + new Intl.NumberFormat('pt-BR').format(v)
}

// Shared variants
const fadeUp = (delay = 0) => ({
  hidden: { y: 36, opacity: 0 },
  show:   { y: 0,  opacity: 1, transition: { duration: 0.65, delay, ease: EASE } },
})

const staggerList = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
}

const staggerItem = {
  hidden: { y: 34, opacity: 0 },
  show:   { y: 0,  opacity: 1, transition: { duration: 0.55, ease: EASE } },
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IcoArrowUp  = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
)
const IcoShield = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IcoDollar = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const IcoClock = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IcoTarget = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)
const IcoArrows = ({ s = 22 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
)
const IcoBank = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
)
const IcoLock = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

// ── Navbar ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Simular',    href: '#simular'    },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Condições',  href: '#condicoes'  },
  { label: 'Sobre',      href: '#sobre'      },
]

function Navbar() {
  const { scrollY } = useScroll()
  const shadow = useTransform(scrollY, [0, 40], ['0 0 0 0 transparent', '0 2px 16px 0 rgba(0,0,0,.07)'])
  const [open, setOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ boxShadow: shadow }}
      className="bg-white border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + desktop links */}
        <div className="flex items-center gap-10">
          <motion.img
            src={LOGO}
            alt="CredPix"
            className="h-8 object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }, i) => (
              <motion.a
                key={label}
                href={href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07, duration: 0.4 }}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                {label}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Desktop: Suporte button | Mobile: hamburger */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(o => !o)}
          className="md:hidden p-2 text-gray-700"
          aria-label="Menu"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="hidden md:block border border-gray-800 text-gray-800 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Suporte
        </motion.button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-4">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3.5 text-gray-700 font-medium border-b border-gray-50 last:border-0 text-base"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </motion.nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const [amount, setAmount] = useState(MIN)
  const progress  = ((amount - MIN) / (MAX - MIN)) * 100
  const navigate  = useNavigate()
  const goFunnel  = () => navigate('/emprestimo/simulacao' + window.location.search)

  return (
    <section id="simular" className="bg-[#EEF2FF]">
      <div
        className="max-w-7xl mx-auto px-6 py-10 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        style={{ minHeight: 'calc(100vh - 65px)' }}
      >
        {/* ── Left copy ── */}
        <div className="lg:py-16">
          <motion.p
            className="text-[#2563EB] font-semibold text-sm mb-4"
            variants={fadeUp(0.2)} initial="hidden" animate="show"
          >
            CredPix · Empréstimos
          </motion.p>

          <motion.h1
            className="text-[2.4rem] md:text-[3.25rem] leading-tight font-extrabold text-[#1E293B]"
            variants={fadeUp(0.32)} initial="hidden" animate="show"
          >
            Empréstimo Pessoal
          </motion.h1>

          <motion.h1
            className="text-[2.4rem] md:text-[3.25rem] leading-tight font-extrabold text-[#2563EB] mb-5"
            variants={fadeUp(0.42)} initial="hidden" animate="show"
          >
            Rápido e Seguro
          </motion.h1>

          <motion.p
            className="text-gray-500 text-base md:text-lg leading-relaxed mb-7 max-w-md"
            variants={fadeUp(0.52)} initial="hidden" animate="show"
          >
            Simule seu empréstimo agora e saia do sufoco! Taxas competitivas e aprovação em minutos.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8"
            variants={fadeUp(0.62)} initial="hidden" animate="show"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(30,58,95,.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={goFunnel}
              className="w-full sm:w-auto bg-[#2563EB] text-white px-8 py-4 rounded-full font-bold text-base transition-colors hover:bg-blue-700"
            >
              Simular agora →
            </motion.button>
            <motion.a
              href="#simulador"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-bold text-base hover:border-gray-400 hover:bg-white transition-colors text-center"
            >
              Ver condições
            </motion.a>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-5"
            variants={fadeUp(0.72)} initial="hidden" animate="show"
          >
            {['Aprovação Rápida', '100% Seguro', 'Taxas Justas'].map(b => (
              <span key={b} className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right card ── */}
        <div id="simulador" className="flex items-center justify-center py-10 lg:py-0">
          {/* Entrance wrapper */}
          <motion.div
            className="w-full max-w-md"
            initial={{ x: 70, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.45, ease: EASE }}
          >
            {/* Floating wrapper */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/60">

                {/* Hero photo */}
                <motion.div
                  className="h-72 w-full overflow-hidden"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: EASE }}
                >
                  <img
                    src={HERO_IMG}
                    alt="Empréstimo pessoal"
                    className="w-full h-full object-cover object-top"
                  />
                </motion.div>

                {/* Simulator */}
                <div className="p-7">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-[#1E293B] font-bold text-xl leading-snug">Simule seu empréstimo.</p>
                      <p className="text-gray-400 text-sm mt-0.5">Quanto você precisa?</p>
                    </div>
                    <motion.span
                      key={amount}
                      initial={{ scale: 1.2, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#2563EB] font-extrabold text-2xl whitespace-nowrap ml-3"
                    >
                      {fmt(amount)}
                    </motion.span>
                  </div>

                  {/* Slider */}
                  <div className="mt-5 mb-1">
                    <input
                      type="range"
                      min={MIN}
                      max={MAX}
                      step={500}
                      value={amount}
                      onChange={e => setAmount(Number(e.target.value))}
                      className="loan-slider"
                      style={{ '--progress': `${progress}%` }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>{fmt(MIN)}</span>
                      <span>{fmt(MAX)}</span>
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="grid grid-cols-3 gap-2.5 my-5">
                    {[
                      { Icon: IcoArrowUp, label: 'TAXA',  value: 'a partir de 1,49% ao mês' },
                      { Icon: IcoTarget,  label: 'CET',   value: '21,3% a.a.'               },
                      { Icon: IcoClock,   label: 'PRAZO', value: '6 a 48 meses'             },
                    ].map(({ Icon, label, value }) => (
                      <motion.div
                        key={label}
                        whileHover={{ scale: 1.04 }}
                        className="bg-[#EEF2FF] rounded-2xl p-3"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0">
                            <Icon s={11} />
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold tracking-widest">{label}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#1E293B] leading-snug">{value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(37,99,235,.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goFunnel}
                    className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-4 rounded-full font-bold text-lg transition-colors mb-3"
                  >
                    Continuar simulação →
                  </motion.button>

                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                    <IcoLock /> Simulação gratuita · Sem compromisso · 100% seguro
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Benefits ──────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: <IcoArrows s={22} />,
    title: 'Aprovação Rápida',
    desc:  'Receba uma resposta em poucos minutos após a simulação.',
    dark:  false,
  },
  {
    icon: <IcoShield s={22} />,
    title: '100% Seguro',
    desc:  'Seus dados protegidos com a mais alta tecnologia de segurança.',
    dark:  true,
  },
  {
    icon: <IcoDollar s={22} />,
    title: 'Taxas Justas',
    desc:  'As melhores condições de juros do mercado para você.',
    dark:  false,
  },
]

function Benefits() {
  return (
    <section id="beneficios" className="bg-[#EEF2FF] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          className="text-[#2563EB] font-semibold text-xs uppercase tracking-widest mb-3"
          variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={VP}
        >
          Por que CredPix
        </motion.p>
        <motion.h2
          className="text-4xl font-extrabold text-[#1E293B] mb-14 max-w-xl leading-tight"
          variants={fadeUp(0.1)} initial="hidden" whileInView="show" viewport={VP}
        >
          Empréstimo do começo ao fim, sem ruído.
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerList} initial="hidden" whileInView="show" viewport={VP}
        >
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className={`rounded-3xl p-8 cursor-default ${b.dark ? 'bg-[#0F172A]' : 'bg-white'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${b.dark ? 'bg-[#1E293B] text-[#3B82F6]' : 'bg-[#EEF2FF] text-[#2563EB]'}`}>
                {b.icon}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${b.dark ? 'text-white' : 'text-[#1E293B]'}`}>{b.title}</h3>
              <p className={`leading-relaxed ${b.dark ? 'text-gray-400' : 'text-gray-500'}`}>{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Conditions ────────────────────────────────────────────────────────────────

const COND_CARDS = [
  { label: 'PRAZO DE PAGAMENTO', value: '6 a 48 meses',              sub: null                  },
  { label: 'TAXA DE JUROS',      value: 'a partir de 1,49% ao mês',  sub: '(APR: 19,4% ao ano)' },
  { label: 'CARÊNCIA',           value: 'Até 90 dias',               sub: null                  },
]

function Conditions() {
  return (
    <section id="condicoes" className="bg-[#EEF2FF] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.p
          className="text-[#2563EB] font-semibold text-xs uppercase tracking-widest mb-3"
          variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={VP}
        >
          Transparência
        </motion.p>
        <motion.h2
          className="text-4xl font-extrabold text-[#1E293B] mb-12 max-w-xl leading-tight"
          variants={fadeUp(0.1)} initial="hidden" whileInView="show" viewport={VP}
        >
          Condições do empréstimo, sem letra miúda.
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
          variants={staggerList} initial="hidden" whileInView="show" viewport={VP}
        >
          {COND_CARDS.map(card => (
            <motion.div
              key={card.label}
              variants={staggerItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 border border-gray-100"
            >
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-2">{card.label}</p>
              <p className="text-xl font-bold text-[#1E293B]">{card.value}</p>
              {card.sub && <p className="text-sm text-gray-400 mt-1">{card.sub}</p>}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={VP}
          className="bg-white rounded-2xl p-6 border border-gray-100 mb-4"
        >
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-2">Exemplo Representativo</p>
          <p className="text-gray-600 leading-relaxed">
            Empréstimo de R$ 2.000,00, parcelado em 24x de R$ 99,50. Valor total: R$ 2.388,00. CET: 21,3% a.a. Sujeito à análise de crédito.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp(0.1)} initial="hidden" whileInView="show" viewport={VP}
          className="bg-blue-50 rounded-2xl p-5 flex items-start gap-3"
        >
          <div className="text-[#2563EB] mt-0.5 flex-shrink-0"><IcoBank /></div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Facilitamos sua busca por crédito. A análise e concessão são realizadas diretamente pelas instituições financeiras.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="sobre" className="bg-[#EEF2FF] py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.p
          className="text-[#2563EB] font-semibold text-xs uppercase tracking-widest mb-4"
          variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={VP}
        >
          Sobre Nós
        </motion.p>
        <motion.h2
          className="text-4xl font-extrabold text-[#1E293B] mb-6 leading-tight"
          variants={fadeUp(0.1)} initial="hidden" whileInView="show" viewport={VP}
        >
          Conectamos você ao melhor crédito do mercado.
        </motion.h2>
        <motion.p
          className="text-gray-500 text-lg leading-relaxed"
          variants={fadeUp(0.2)} initial="hidden" whileInView="show" viewport={VP}
        >
          Somos uma plataforma que facilita o acesso ao crédito, conectando você às melhores
          instituições financeiras do mercado. Nossa missão é tornar o processo de empréstimo
          simples, transparente e acessível para todos os brasileiros.
        </motion.p>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="bg-[#EEF2FF] pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          viewport={VP}
          className="relative bg-[#2563EB] rounded-3xl px-8 py-16 text-center overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -left-8  top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -right-8  top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-extrabold text-white mb-3"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: EASE }}
              viewport={VP}
            >
              Suporte ao Cliente
            </motion.h2>
            <motion.p
              className="text-blue-200 text-lg mb-9"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.55, ease: EASE }}
              viewport={VP}
            >
              Precisa de ajuda? Nossa equipe está pronta para atender você.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.55, ease: EASE }}
              viewport={VP}
            >
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="bg-white text-[#1E293B] px-9 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors"
              >
                Fale Conosco
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="border-2 border-white/60 text-white px-9 py-4 rounded-full font-bold hover:bg-white/10 transition-colors"
              >
                Ver Condições
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }} viewport={VP}
      className="bg-white pt-16 pb-10"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src={LOGO} alt="CredPix" className="h-8 object-contain mb-5" />
            <address className="not-italic text-gray-500 text-sm leading-7">
              <p>Rua 26 Carmelo Cali, 89 - Vila Santa Lucia</p>
              <p>São Paulo/SP • CEP 04940-070</p>
              <p className="mt-2">(41) 99880-0068</p>
              <p>contato@credpix.com.br</p>
            </address>
          </div>

          <div>
            <h4 className="font-bold text-[#1E293B] mb-5 text-base">Empréstimos</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {['Empréstimo Pessoal', 'Empréstimo Consignado', 'Empréstimo com Garantia', 'Cartão de Crédito'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-gray-800 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1E293B] mb-5 text-base">Políticas</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {[
                { label: 'Política de Privacidade', bold: false },
                { label: 'Termos de Uso',           bold: true  },
                { label: 'Código de Conduta',       bold: false },
                { label: 'Compliance',              bold: false },
              ].map(({ label, bold }) => (
                <li key={label}>
                  <a href="#" className={`hover:text-gray-800 transition-colors ${bold ? 'font-bold text-[#1E293B]' : ''}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 leading-relaxed mb-5">
            Os empréstimos pessoais oferecidos possuem prazo mínimo de 6 meses e prazo máximo de 48 meses,
            com carência de até 90 dias para o início do pagamento, conforme análise do perfil. Taxa de juros
            a partir de 1,49% ao mês (APR: 19,4% ao ano), variando conforme análise de crédito. Exemplo:
            Empréstimo de R$ 2.000,00, parcelado em 24x de R$ 99,50. Valor total: R$ 2.388,00. CET: 21,3%
            a.a. Simulação sujeita à aprovação. Facilitamos sua busca por crédito. A análise e concessão são
            realizadas diretamente pelas instituições financeiras.
          </p>
          <p className="text-xs text-gray-500 font-semibold">
            © 2026 CredPix. C E A AUGUSTO DESENVOLVIMENTO DE SISTEMAS LTDA · CNPJ: 48.280.494/0001-31.
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Benefits />
      <Conditions />
      <About />
      <CTABanner />
      <Footer />
    </>
  )
}
