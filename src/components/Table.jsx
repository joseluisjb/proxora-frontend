export default function Table({ headers, rows }) {
  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead className="tabla__header">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="tabla__row">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="tabla__cell">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
