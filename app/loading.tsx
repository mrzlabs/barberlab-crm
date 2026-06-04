export default function Loading() {
  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.35),transparent_18rem),radial-gradient(circle_at_82%_72%,rgba(168,85,247,.34),transparent_21rem),linear-gradient(135deg,#06141f,#120820_48%,#04151b)]" />
      <div className="wait-grid absolute inset-0 opacity-70" />
      <div className="wait-orbit absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10" />
      {/* wrapper — card z-10 + Maylo z-0 asomándose */}
      <div className="relative m-auto">
        <section className="relative z-10 w-[min(92vw,480px)] rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-2xl shadow-violet-950/30 backdrop-blur-2xl">
          <div className="mac-dots" />
          <div className="mt-8 text-center">
            <p className="text-base font-black tracking-wide text-white">Maylo</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Asistente Operativo · Operux CRM</p>
          </div>
          <p className="mt-5 text-center text-sm font-semibold leading-relaxed text-white/60">Estamos cargando la mejor experiencia.</p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="wait-bar h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-300">
            <span className="rounded-xl bg-white/8 p-3">Agenda</span>
            <span className="rounded-xl bg-white/8 p-3">Caja</span>
            <span className="rounded-xl bg-white/8 p-3">Stock</span>
          </div>
        </section>

        {/* Maylo asomándose desde el lado derecho del card */}
        <div
          className="pointer-events-none absolute bottom-0 z-0 opacity-90"
          style={{ right: "-80px", animation: "mayloFloat 2.4s ease-in-out infinite" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 64 80" fill="none" width="140" height="175">
            <line x1="35" y1="3" x2="32" y2="10" stroke="#3d2f7a" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="36.5" cy="2" r="3.5" fill="#4fc3f7" stroke="#2a1f5e" strokeWidth="1"/>
            <rect x="14" y="9" width="36" height="26" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
            <circle cx="26" cy="22" r="6" fill="#f5c518"/><circle cx="42" cy="22" r="6" fill="#f5c518"/>
            <circle cx="26" cy="22" r="3.2" fill="#1a1230"/><circle cx="42" cy="22" r="3.2" fill="#1a1230"/>
            <circle cx="27.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/><circle cx="43.4" cy="20.5" r="1.3" fill="white" opacity="0.9"/>
            <rect x="26" y="35" width="12" height="6" rx="3" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
            <rect x="10" y="41" width="44" height="28" rx="7" fill="#4c3a91" stroke="#2a1f5e" strokeWidth="1.5"/>
            <rect x="19" y="49" width="24" height="14" rx="3.5" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1"/>
            <circle cx="26" cy="56" r="2.8" fill="#4fc3f7" opacity="0.9"/>
            <circle cx="32" cy="56" r="2" fill="#f5c518" opacity="0.75"/>
            <rect x="15" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
            <rect x="36" y="69" width="13" height="9" rx="4" fill="#3d2f7a" stroke="#2a1f5e" strokeWidth="1.2"/>
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden border-t border-violet-400/10 bg-slate-950/80">
        <div className="relative flex h-full items-center justify-center px-5">
          <span className="text-[9px] font-black tracking-[0.18em] text-violet-300/40 uppercase">MRZLABS</span>
        </div>
      </div>
    </main>
  );
}
