export default function Input({ placeholder = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="input"
      {...props}
    />
  )
}
