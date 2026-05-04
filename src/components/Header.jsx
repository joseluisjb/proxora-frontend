export default function Header({ usuarioNombre = "Dr. Sterling" }) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__logo">Proxora</div>
      </div>
      <div className="header__user">
        <img
          src={`https://i.pravatar.cc/150?u=${usuarioNombre}`}
          alt={usuarioNombre}
          className="header__avatar"
        />
      </div>
    </header>
  )
}
