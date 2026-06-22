import { useState, useEffect } from 'react'

// ── Company data ───────────────────────────────────────────────────────────────
const CO = {
  razao:      'DEPOSITO DO CREUSAO LTDA',
  fantasia:   'Deposito do Creusão',
  initials:   'DC',
  cnpj:       '49.763.819/0001-64',
  abertura:   '2021',
  logradouro: 'Rua Adão Candido Barbosa, 140',
  bairro:     'Centro',
  cidade:     'Ouro Verde de Minas',
  estado:     'MG',
  cep:        '39855-000',
  email:      'contabilminas@bol.com.br',
  telefone:   '(33) 98806-6020',
  atividade1: 'Comércio varejista de mercadorias',
  atividade2: 'Armazenagem e depósito de produtos',
  natureza:   '206-2 - Sociedade Empresária Limitada',
  situacao:   'ATIVA',
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IcoArrows = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
)
const IcoBox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IcoTruck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IcoMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const IcoPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16z"/>
  </svg>
)
const IcoPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcoMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IcoX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Navbar ─────────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Serviços',         href: '#servicos'  },
    { label: 'Dados cadastrais', href: '#dados'     },
    { label: 'Contato',          href: '#contato'   },
  ]

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-sm" style={{ background: 'linear-gradient(135deg, #0B4F6C, #1B8A87)' }}>
            {CO.initials}
          </div>
          <span className="font-bold text-[#0B2240] text-lg leading-tight">
            {CO.fantasia}
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-gray-600 hover:text-[#0B4F6C] text-sm font-medium transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-600" onClick={() => setOpen(o => !o)}>
          {open ? <IcoX /> : <IcoMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 pb-4">
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block py-3 text-gray-700 font-medium border-b border-gray-50 last:border-0">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="flex flex-col justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #071829 0%, #0B3D5C 45%, #1B7A78 100%)' }}
    >
      {/* subtle dot pattern */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-7xl mx-auto px-5 py-8 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
        {/* Left copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs md:text-sm font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-8">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Estabelecimento com CNPJ ativo
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3 md:mb-6">
            Soluções em depósito<br />
            com <span style={{ color: '#5EC8C4' }}>atendimento direto</span><br />
            e transparente.
          </h1>

          <p className="hidden md:block text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
            O Deposito do Creusão atua no comércio e armazenagem de mercadorias em Ouro Verde de Minas,
            com presença local clara, confiável e fácil de validar.
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 mt-5 md:mt-0">
            <a
              href={`https://wa.me/55${CO.telefone.replace(/\D/g, '')}`}
              target="_blank" rel="noreferrer"
              className="inline-block font-bold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-full transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#C9932A', color: '#fff' }}
            >
              Falar com atendimento
            </a>
            <a
              href="#dados"
              className="inline-block border-2 border-white/40 text-white font-bold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-full hover:bg-white/10 transition-all"
            >
              Conferir dados
            </a>
          </div>
        </div>

        {/* Right card — Resumo institucional */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-4 md:p-6">
          <p className="text-white font-bold text-sm md:text-lg mb-3 md:mb-5">Resumo institucional</p>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {[
              { label: 'NOME FANTASIA', value: CO.fantasia           },
              { label: 'ABERTURA',      value: CO.abertura           },
              { label: 'LOCALIDADE',    value: `${CO.cidade} / ${CO.estado}` },
              { label: 'ATIVIDADE',     value: 'Depósito de mercadorias' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 border border-white/10 rounded-xl p-3 md:p-4">
                <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">{item.label}</p>
                <p className="text-white font-bold text-xs md:text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
            <p className="text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1">CNPJ</p>
            <p className="text-white font-bold text-sm md:text-base">{CO.cnpj}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Services ───────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: <IcoArrows />,
    title: 'Comércio de mercadorias',
    desc:  'Atividade principal cadastrada como comércio varejista de mercadorias em geral.',
  },
  {
    icon: <IcoBox />,
    title: 'Depósito e armazenagem',
    desc:  'Estrutura para depósito e armazenagem de produtos para atendimento local e regional.',
  },
  {
    icon: <IcoCheck />,
    title: 'Transparência cadastral',
    desc:  'CNPJ, endereço, contato e situação cadastral apresentados de forma objetiva.',
  },
]

function Services() {
  return (
    <section id="servicos" className="bg-[#F5F7FA] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-[#1B7A78] font-bold text-xs uppercase tracking-widest mb-3">Atuação</p>
        <h2 className="text-4xl font-extrabold text-[#0B2240] mb-4 max-w-2xl leading-tight">
          Estrutura local para depósito e comércio de mercadorias
        </h2>
        <p className="text-gray-500 mb-14 max-w-2xl">
          Uma apresentação objetiva para comunicar confiança, dados conferíveis e canais oficiais de contato.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-[#1B7A78]"
                style={{ background: '#E0F4F4' }}>
                {s.icon}
              </div>
              <h3 className="font-bold text-[#0B2240] text-lg mb-3">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Dados cadastrais ───────────────────────────────────────────────────────────

const ROWS = [
  { label: 'Razão social',         value: CO.razao                                            },
  { label: 'Nome fantasia',        value: CO.fantasia                                         },
  { label: 'CNPJ',                 value: CO.cnpj                                             },
  { label: 'Data de abertura',     value: CO.abertura                                         },
  { label: 'Atividade principal',  value: CO.atividade1                                       },
  { label: 'Atividade secundária', value: CO.atividade2                                       },
  { label: 'Natureza jurídica',    value: CO.natureza                                         },
  { label: 'Endereço',             value: `${CO.logradouro}, ${CO.bairro}, ${CO.cidade} - ${CO.estado}, CEP ${CO.cep}` },
  { label: 'Situação cadastral',   value: `${CO.situacao}`                                    },
]

function DadosCadastrais() {
  return (
    <section id="dados" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="bg-[#F5F7FA] rounded-2xl p-8 self-start">
            <h2 className="text-3xl font-extrabold text-[#0B2240] mb-3">Dados cadastrais</h2>
            <p className="text-gray-500 leading-relaxed">
              Informações extraídas do cartão CNPJ do estabelecimento, apresentadas para consulta pública.
            </p>
          </div>

          {/* Right — table */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-gray-100">
              {ROWS.map(r => (
                <div key={r.label} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4">
                  <span className="sm:w-52 text-sm font-semibold text-gray-500 flex-shrink-0">{r.label}</span>
                  <span className={`font-bold text-[#0B2240] ${r.label === 'Situação cadastral' ? 'text-green-600' : ''}`}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Contact ────────────────────────────────────────────────────────────────────

function Contact() {
  return (
    <section id="contato" className="py-24"
      style={{ background: 'linear-gradient(135deg, #071829 0%, #0B3D5C 50%, #1B7A78 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Entre em contato</h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Use os canais oficiais informados no cadastro para falar com o Deposito do Creusão.
            </p>
          </div>

          {/* Right card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-7 space-y-6">
            <div>
              <p className="text-[#5EC8C4] text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <IcoMail /> E-mail
              </p>
              <p className="text-white font-bold text-lg uppercase">{CO.email}</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-[#5EC8C4] text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <IcoPhone /> Telefone
              </p>
              <p className="text-white font-bold text-lg">{CO.telefone}</p>
            </div>
            <div className="border-t border-white/10 pt-6">
              <p className="text-[#5EC8C4] text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <IcoPin /> Endereço
              </p>
              <p className="text-white/80">
                {CO.logradouro}, {CO.bairro} — {CO.cidade} / {CO.estado}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#06111C] py-8 text-center">
      <p className="text-gray-400 text-sm">
        <span className="font-bold text-white">{CO.razao}</span>
        {' '}— CNPJ {CO.cnpj}
      </p>
      <p className="text-gray-600 text-sm mt-1">
        {CO.cidade} / {CO.estado} • Pagina institucional
      </p>
    </footer>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="font-[Inter,sans-serif]">
      {/* Top info bar */}
      <div className="bg-[#06111C] text-gray-400 text-xs py-2 px-6 hidden md:flex items-center justify-between">
        <span>CNPJ {CO.cnpj} • Situação cadastral ativa</span>
        <span>{CO.logradouro}, {CO.cidade} / {CO.estado}</span>
      </div>

      <Navbar />
      <Hero />
      <Services />
      <DadosCadastrais />
      <Contact />
      <Footer />
    </div>
  )
}
