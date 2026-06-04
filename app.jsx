/* global React, ReactDOM, maylo */
const { useState, useEffect, useRef } = React;
const COP = n => '$' + n.toLocaleString('es-CO');

/* ---------------- icons ---------------- */
function Icon({ name, s = 20 }) {
  const p = {
    agenda: 'M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
    clientes: 'M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19c0-1.6-1-3-2.5-3.5M18 11a2.5 2.5 0 0 0 0-5',
    caja: 'M3 7h18v12H3zM3 11h18M7 15h3',
    reportes: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
    bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    plus: 'M12 5v14M5 12h14',
    close: 'M6 6l12 12M18 6L6 18',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2',
  }[name];
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={p} />
    </svg>
  );
}
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* ---------------- data ---------------- */
const BARBERS = [
  { id: 'an', name: 'Andrés', color: '#7F77DD' },
  { id: 'ca', name: 'Camilo', color: '#27C3D8' },
  { id: 'jh', name: 'Jhon', color: '#F5C400' },
];
const AGENDA = {
  an: [
    { t: '9:00', c: 'Mateo Rincón', s: 'Corte + barba', st: 'done' },
    { t: '10:30', c: 'Sebastián Páez', s: 'Corte clásico', st: 'now' },
    { t: '12:00', c: 'Libre', s: '', st: 'free' },
    { t: '1:30', c: 'Julián Ortiz', s: 'Corte + barba', st: 'next' },
  ],
  ca: [
    { t: '9:00', c: 'Diego Salas', s: 'Barba', st: 'done' },
    { t: '10:00', c: 'Andrés Mejía', s: 'Corte clásico', st: 'done' },
    { t: '11:30', c: 'Libre', s: '', st: 'free' },
    { t: '1:00', c: 'Camilo Ruiz', s: 'Tinte', st: 'next' },
  ],
  jh: [
    { t: '9:30', c: 'Tomás Vega', s: 'Corte clásico', st: 'done' },
    { t: '11:00', c: 'Nicolás Lara', s: 'Corte + barba', st: 'now' },
    { t: '12:30', c: 'Esteban Gil', s: 'Cejas', st: 'next' },
    { t: '2:00', c: 'Libre', s: '', st: 'free' },
  ],
};
const CLIENTS = [
  { n: 'Mateo Rincón', last: 'Hace 2 sem', v: 14, tag: 'VIP', tel: '300 214 5588' },
  { n: 'Sebastián Páez', last: 'Hace 5 días', v: 6, tag: 'Frecuente', tel: '311 902 1144' },
  { n: 'Nicolás Lara', last: 'Hace 3 meses', v: 9, tag: 'En riesgo', tel: '320 778 4410' },
  { n: 'Julián Ortiz', last: 'Hoy', v: 1, tag: 'Nuevo', tel: '301 556 9082' },
  { n: 'Diego Salas', last: 'Hace 1 mes', v: 4, tag: 'Frecuente', tel: '315 330 7765' },
  { n: 'Tomás Vega', last: 'Hace 4 meses', v: 11, tag: 'En riesgo', tel: '318 441 2290' },
];
const TAGc = { VIP: ['#F5C400', '#3a2f00'], Frecuente: ['#7F77DD', '#241f47'], 'En riesgo': ['#E0708A', '#3a1922'], Nuevo: ['#27C3D8', '#06303a'] };
const SALES = [
  { t: '9:18', c: 'Mateo Rincón', items: 'Corte + barba', m: 'Nequi', v: 35000 },
  { t: '10:05', c: 'Andrés Mejía', items: 'Corte clásico', m: 'Efectivo', v: 25000 },
  { t: '10:47', c: 'Diego Salas', items: 'Barba', m: 'Datáfono', v: 18000 },
  { t: '11:40', c: 'Tomás Vega', items: 'Corte + cejas', m: 'Nequi', v: 33000 },
];
const WEEK = [
  { d: 'Lun', v: 28 }, { d: 'Mar', v: 34 }, { d: 'Mié', v: 31 },
  { d: 'Jue', v: 42 }, { d: 'Vie', v: 51 }, { d: 'Sáb', v: 63 }, { d: 'Dom', v: 19 },
];

/* ---------------- view config + Maylo help ---------------- */
const VIEWS = {
  agenda: {
    label: 'Agenda', icon: 'agenda', title: 'Agenda de hoy', sub: 'Miércoles, 4 de junio',
    peek: 'Hoy hay 11 citas. Camilo tiene un hueco a las 11:30 👀',
    help: {
      intro: 'Esta es la agenda del día por barbero. Arrastra una cita para reprogramar, o toca un hueco libre para agendar a alguien.',
      tips: [
        'Las tarjetas en cian son la cita en curso ahora mismo.',
        'Los huecos “Libre” se pueden llenar con un toque.',
        'Mándale recordatorio a los de la tarde para bajar inasistencias.',
      ],
      actions: [['plus', 'Nueva cita'], ['bell', 'Recordar a todos']],
    },
  },
  clientes: {
    label: 'Clientes', icon: 'clientes', title: 'Clientes', sub: '248 registrados',
    peek: 'Tienes 2 clientes “en riesgo” que no vuelven hace rato 🔔',
    help: {
      intro: 'Aquí vive tu base de clientes. Te marqué en rojo los que no vuelven hace rato — un mensaje a tiempo los trae de vuelta.',
      tips: [
        'Filtra por “En riesgo” y lánzales una promo por WhatsApp.',
        'Los VIP son tu 20% que deja el 80% — cuídalos.',
        'Toca un cliente para ver su historial y notas.',
      ],
      actions: [['plus', 'Nuevo cliente'], ['spark', 'Campaña WhatsApp']],
    },
  },
  caja: {
    label: 'Caja', icon: 'caja', title: 'Caja del día', sub: 'Turno abierto · 9:00 a. m.',
    peek: 'Vas en 4 ventas y $111.000. ¿Cierro la caja al final del turno? 💵',
    help: {
      intro: 'Cuadra la plata del día. Registra cada venta y, al terminar el turno, cierra la caja para que te quede el reporte listo.',
      tips: [
        'Separa por método: Nequi, efectivo y datáfono.',
        'El ticket promedio de hoy va en $27.750.',
        'Al cerrar, te genero el resumen para enviar al dueño.',
      ],
      actions: [['plus', 'Nueva venta'], ['caja', 'Cerrar caja']],
    },
  },
  reportes: {
    label: 'Reportes', icon: 'reportes', title: 'Reportes', sub: 'Esta semana',
    peek: 'El sábado fue tu mejor día: 63 cortes 📈 ¿Lo celebramos?',
    help: {
      intro: 'Tus números de la semana de un vistazo. Tu mejor barbero es Andrés con 38 cortes; el sábado fue el día pico.',
      tips: [
        'La ocupación va en 78% — hay espacio para vender más.',
        'Compara contra el mes pasado para ver tendencia.',
        'Descarga el PDF y compártelo con el equipo.',
      ],
      actions: [['reportes', 'Comparar mes'], ['spark', 'Descargar PDF']],
    },
  },
};
const ORDER = ['agenda', 'clientes', 'caja', 'reportes'];

/* ---------------- small UI ---------------- */
function Avatar({ name, color }) {
  return <span className="avatar" style={{ background: (color || '#7F77DD') + '22', color: color || '#cfcaf2' }}>{initials(name)}</span>;
}

/* ---------------- views ---------------- */
function AgendaView() {
  const stLabel = { done: 'Atendido', now: 'En curso', next: 'Próxima', free: 'Libre' };
  return (
    <div className="board">
      {BARBERS.map(b => (
        <div className="col" key={b.id}>
          <div className="col-head"><span className="bdot" style={{ background: b.color }} /> {b.name}</div>
          {AGENDA[b.id].map((a, i) => (
            <div className={'appt ' + a.st} key={i}>
              <div className="appt-t">{a.t}</div>
              {a.st === 'free'
                ? <div className="appt-free"><Icon name="plus" s={16} /> Agendar</div>
                : <div className="appt-body"><div className="appt-c">{a.c}</div><div className="appt-s">{a.s}</div></div>}
              {a.st !== 'free' && <span className={'pill ' + a.st}>{stLabel[a.st]}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function ClientesView() {
  return (
    <div className="panelcard">
      <div className="tbl-head"><span>Cliente</span><span>Última visita</span><span>Visitas</span><span>Estado</span><span>Teléfono</span></div>
      {CLIENTS.map((c, i) => (
        <div className="tbl-row" key={i}>
          <span className="cell-name"><Avatar name={c.n} /> {c.n}</span>
          <span className="muted">{c.last}</span>
          <span>{c.v}</span>
          <span><em className="tag" style={{ color: TAGc[c.tag][0], background: TAGc[c.tag][1] }}>{c.tag}</em></span>
          <span className="muted">{c.tel}</span>
        </div>
      ))}
    </div>
  );
}
function CajaView() {
  const total = SALES.reduce((s, x) => s + x.v, 0);
  return (
    <div className="caja-wrap">
      <div className="stat-row">
        <div className="stat"><div className="stat-k">Total del día</div><div className="stat-v">{COP(total)}</div></div>
        <div className="stat"><div className="stat-k">Ventas</div><div className="stat-v">{SALES.length}</div></div>
        <div className="stat"><div className="stat-k">Ticket promedio</div><div className="stat-v">{COP(Math.round(total / SALES.length))}</div></div>
      </div>
      <div className="panelcard">
        <div className="tbl-head caja"><span>Hora</span><span>Cliente</span><span>Servicio</span><span>Método</span><span className="r">Valor</span></div>
        {SALES.map((s, i) => (
          <div className="tbl-row caja" key={i}>
            <span className="muted">{s.t}</span><span className="cell-name">{s.c}</span>
            <span className="muted">{s.items}</span><span><em className="method">{s.m}</em></span>
            <span className="r strong">{COP(s.v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function ReportesView() {
  const max = Math.max(...WEEK.map(w => w.v));
  return (
    <div className="caja-wrap">
      <div className="stat-row four">
        <div className="stat"><div className="stat-k">Cortes (sem)</div><div className="stat-v">268</div></div>
        <div className="stat"><div className="stat-k">Ingresos</div><div className="stat-v">$7.4M</div></div>
        <div className="stat"><div className="stat-k">Ocupación</div><div className="stat-v">78%</div></div>
        <div className="stat"><div className="stat-k">Top barbero</div><div className="stat-v sm">Andrés · 38</div></div>
      </div>
      <div className="panelcard chart">
        <div className="chart-head">Cortes por día</div>
        <div className="bars">
          {WEEK.map((w, i) => (
            <div className="bar-col" key={i}>
              <div className="bar" style={{ height: (w.v / max * 160) + 'px' }}><span>{w.v}</span></div>
              <div className="bar-d">{w.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const VIEW_C = { agenda: AgendaView, clientes: ClientesView, caja: CajaView, reportes: ReportesView };

/* ---------------- Maylo help drawer ---------------- */
function HelpDrawer({ view, open, onClose, onCelebrate, onAction, dancing }) {
  const cfg = VIEWS[view];
  return (
    <div className={'drawer' + (open ? ' open' : '')}>
      <div className="drawer-top">
        <div className="dr-maylo-wrap">
          <div className={'dr-maylo' + (dancing ? ' dancing' : '')}
            dangerouslySetInnerHTML={{ __html: maylo({ eyes: dancing ? 'happy' : 'open', mouth: dancing ? 'grin' : 'talk', arms: 'wave', panel: true }) }} />
        </div>
        <div className="dr-id">
          <b>Maylo</b>
          <span>Asistente · {cfg.label}</span>
        </div>
        <button className="dr-x" onClick={onClose}><Icon name="close" s={18} /></button>
      </div>

      <div className="bubble">{cfg.help.intro}</div>

      <div className="dr-sec">Te puedo ayudar con</div>
      <ul className="tips">
        {cfg.help.tips.map((t, i) => <li key={i}><span className="tk" /> {t}</li>)}
      </ul>

      <div className="dr-sec">Acciones rápidas</div>
      <div className="qa">
        {cfg.help.actions.map(([ic, lb], i) => (
          <button className="qa-btn" key={i} onClick={() => onAction(lb)}>
            <Icon name={ic} s={17} /> {lb}
          </button>
        ))}
      </div>

      <button className="celebrate" onClick={onCelebrate}>🎉 ¡Que Maylo baile ska!</button>
    </div>
  );
}

/* ---------------- App ---------------- */
function App() {
  const [view, setView] = useState('agenda');
  const [help, setHelp] = useState(false);
  const [peek, setPeek] = useState(true);
  const [toast, setToast] = useState(null);
  const [dancing, setDancing] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const peekTimer = useRef();

  const showPeek = () => {
    setPeek(true);
    clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeek(false), 5200);
  };
  useEffect(() => { showPeek(); }, [view]);

  const go = v => { setView(v); setHelp(false); };
  const fireToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const celebrate = () => {
    setDancing(true); setConfetti(true); fireToast('¡Eso! 🎺 Maylo está skankin’');
    setTimeout(() => setConfetti(false), 2600);
    setTimeout(() => setDancing(false), 5200);
  };

  const Body = VIEW_C[view];
  const cfg = VIEWS[view];

  return (
    <div className="app">
      {/* sidebar */}
      <aside className="side">
        <div className="logo">
          <span className="logo-mark" dangerouslySetInnerHTML={{ __html: maylo({ arms: 'wave', glow: false, panel: false }) }} />
          <span className="logo-tx">Operux<i>.</i></span>
        </div>
        <nav className="nav">
          {ORDER.map(k => (
            <button key={k} className={'nav-i' + (view === k ? ' on' : '')} onClick={() => go(k)}>
              <Icon name={VIEWS[k].icon} /> <span>{VIEWS[k].label}</span>
            </button>
          ))}
        </nav>
        <div className="shop">
          <Avatar name="Barbería Norte" color="#27C3D8" />
          <div><b>Barbería El Norte</b><span>Bogotá · Plan Pro</span></div>
        </div>
      </aside>

      {/* main */}
      <main className="main">
        <header className="topbar">
          <div>
            <h1>{cfg.title}</h1>
            <p>{cfg.sub}</p>
          </div>
          <div className="top-actions">
            <div className="searchbox"><Icon name="search" s={18} /><input placeholder="Buscar cliente, cita…" /></div>
            <button className="icon-btn"><Icon name="bell" /></button>
          </div>
        </header>
        <div className="content">
          <Body />
        </div>
      </main>

      {/* Maylo FAB + peek */}
      <div className="maylo-dock">
        {peek && !help && (
          <div className="peek" onClick={() => { setHelp(true); setPeek(false); }}>
            <p>{cfg.peek}</p>
            <span className="peek-cta">Abrir ayuda →</span>
            <button className="peek-x" onClick={e => { e.stopPropagation(); setPeek(false); }}>×</button>
          </div>
        )}
        <button className={'fab' + (help ? ' active' : '') + (dancing ? ' dancing' : '')}
          onClick={() => setHelp(h => !h)} aria-label="Abrir Maylo">
          <span className="fab-ring" />
          <span className="fab-maylo" dangerouslySetInnerHTML={{ __html: maylo({ arms: 'wave', glow: false, panel: false, eyes: dancing ? 'happy' : 'open', mouth: dancing ? 'grin' : 'smile' }) }} />
        </button>
      </div>

      <HelpDrawer view={view} open={help} onClose={() => setHelp(false)}
        onCelebrate={celebrate} onAction={lb => fireToast('“' + lb + '” — listo ✦')} dancing={dancing} />

      {help && <div className="scrim" onClick={() => setHelp(false)} />}
      {toast && <div className="toast">{toast}</div>}
      {confetti && (
        <div className="confetti">
          {Array.from({ length: 40 }).map((_, i) => (
            <i key={i} style={{
              left: Math.random() * 100 + '%',
              background: ['#7F77DD', '#F5C400', '#27C3D8', '#B57BE0'][i % 4],
              animationDelay: (Math.random() * .6) + 's',
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
