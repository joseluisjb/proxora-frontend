interface NavbarTopProps {
  onClickPerfil?: () => void;
}

export default function NavbarTop({ onClickPerfil }: NavbarTopProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#EBEBEB] flex items-center justify-between px-6 z-[200] animate-fade-in">
      <span className="text-lg font-bold text-[#C0392B] tracking-[-0.03em]">Proxora</span>
      <button
        className="w-9 h-9 rounded-full bg-[#F2F2F2] border-none flex items-center justify-center cursor-pointer text-[#3D3D3D] hover:text-[#111111] transition-colors"
        onClick={onClickPerfil}
        aria-label="Ver perfil"
        title="Ver perfil"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </header>
  );
}
