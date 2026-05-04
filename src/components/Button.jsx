export default function Button({ children, variant = 'primario', fullWidth = false, ...props }) {
  const classNames = `btn btn-${variant} ${fullWidth ? 'btn-fullwidth' : ''}`
  return <button className={classNames} {...props}>{children}</button>
}

