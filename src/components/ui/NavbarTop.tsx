import './NavbarTop.css';

interface NavbarTopProps {
  onClickPerfil?: () => void;
}

export default function NavbarTop({ onClickPerfil }: NavbarTopProps) {
  return (
    <header className="navbar-top">
      <span className="navbar-top__logo">Proxora</span>
      <button
        className="navbar-top__avatar"
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
