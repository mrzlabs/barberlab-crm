export default function Loading() {
  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.35),transparent_18rem),radial-gradient(circle_at_82%_72%,rgba(168,85,247,.34),transparent_21rem),linear-gradient(135deg,#06141f,#120820_48%,#04151b)]" />
      <div className="wait-grid absolute inset-0 opacity-70" />
      <div className="wait-orbit absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10" />
      <section className="relative z-10 m-auto w-[min(92vw,480px)] rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-2xl shadow-violet-950/30 backdrop-blur-2xl">
        <div className="mac-dots" />
        <div className="mt-8 flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-white text-lg font-black text-slate-950">BL</div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">BarberLab CRM</p>
            <h1 className="mt-1 text-2xl font-black">Preparando modulo</h1>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="wait-bar h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-300">
          <span className="rounded-xl bg-white/8 p-3">Agenda</span>
          <span className="rounded-xl bg-white/8 p-3">Caja</span>
          <span className="rounded-xl bg-white/8 p-3">Stock</span>
        </div>
      </section>
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden border-t border-violet-400/10 bg-slate-950/80">
        <div className="relative flex h-full items-center justify-center px-5">
          <span className="text-[9px] font-black tracking-[0.18em] text-violet-300/40 uppercase">MRZLABS</span>
        </div>
      </div>
    </main>
  );
}
