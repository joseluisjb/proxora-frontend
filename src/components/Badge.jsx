export default function Badge({ children, status = 'completado' }) {
  const className = `badge badge--${status}`
  return <span className={className}>{children}</span>
}
