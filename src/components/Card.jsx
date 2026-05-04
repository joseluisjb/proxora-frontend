export default function Card({ title, children }) {
  return (
    <div className="card">
      {title && <h3 className="card__title">{title}</h3>}
      <div className="card__content">{children}</div>
    </div>
  )
}
