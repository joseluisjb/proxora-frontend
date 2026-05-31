const NAV_ITEMS = [
  {
    id: "gestion-usuarios",
    label: "Gestión de Usuarios",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    id: "config-academica",
    label: "Configuración Académica",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
      </svg>
    ),
  },
  {
    id: "supervision-proyectos",
    label: "Supervisión de Proyectos",
    icon: (
      <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
];

export default function Sidebar({ paginaActual, onNavegar }) {
  return (
    <aside className="fixed top-0 left-0 w-[220px] h-screen bg-white border-r border-[#EBEBEB] flex flex-col pb-4 z-[100] animate-slide-right">
      <div className="px-5 pt-[22px] pb-[18px] border-b border-[#F0F0F0]">
        <span className="text-xl font-bold text-[#C0392B] tracking-[-0.03em]">Proxora</span>
      </div>

      <div className="flex items-center gap-2.5 mx-3 my-2 px-5 py-4 rounded-lg bg-[#F8F8F8]">
        <div className="w-9 h-9 bg-[#C0392B] rounded-[10px] flex items-center justify-center shrink-0">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#111111]">Administrador</p>
          <p className="text-[11px] text-[#6B6B6B] uppercase tracking-[0.06em] mt-0.5">Control del Sistema</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-none font-sans text-[13px] font-medium cursor-pointer text-left transition-all duration-150 w-full hover:translate-x-0.5 ${
              paginaActual === item.id
                ? 'bg-[#FDECEA] text-[#C0392B] font-semibold'
                : 'text-[#6B6B6B] bg-transparent hover:bg-[#F8F8F8] hover:text-[#111111]'
            }`}
            onClick={() => onNavegar(item.id)}
          >
            <span className="flex items-center shrink-0">{item.icon}</span>
            <span className="flex-1 leading-tight">{item.label}</span>
            {paginaActual === item.id && (
              <span className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C0392B] rounded-[3px_0_0_3px]" />
            )}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 px-3 pt-2 border-t border-[#F0F0F0] mt-2">
        <button className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg border-none bg-transparent font-sans text-[13px] text-[#6B6B6B] cursor-pointer text-left w-full transition-all duration-150 hover:bg-[#F8F8F8] hover:text-[#111111]">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Configuración
        </button>
        <button className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg border-none bg-transparent font-sans text-[13px] text-[#6B6B6B] cursor-pointer text-left w-full transition-all duration-150 hover:bg-[#F8F8F8] hover:text-[#111111]">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Soporte
        </button>
      </div>
    </aside>
  );
}
