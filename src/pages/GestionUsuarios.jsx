import { useState } from "react";

const USUARIOS_MOCK = [
  { id: 1, iniciales: "AM", nombre: "Alejandro Martínez", email: "a.martinez@ufps.edu.co", rol: "docente", estado: "activo", foto: null },
  { id: 2, iniciales: "ER", nombre: "Elena Rodríguez", email: "elena.rod@ufps.edu.co", rol: "estudiante", estado: "activo", foto: "https://i.pravatar.cc/40?img=5" },
  { id: 3, iniciales: "RC", nombre: "Ricardo Castro", email: "r.castro@ufps.edu.co", rol: "admin", estado: "suspendido", foto: null },
  { id: 4, iniciales: "SV", nombre: "Sofía Valencia", email: "s.valencia@ufps.edu.co", rol: "docente", estado: "activo", foto: "https://i.pravatar.cc/40?img=9" },
];

const FILTROS = [
  { id: "todos", label: "Todos los Usuarios" },
  { id: "admin", label: "Administrador" },
  { id: "docente", label: "Docente" },
  { id: "estudiante", label: "Estudiante" },
];

const ROL_CONFIG = {
  docente:    { clases: "bg-[#EBF4FF] text-[#2563EB]", label: "Docente", icono: "🎓" },
  estudiante: { clases: "bg-[#F0FDF4] text-[#16A34A]", label: "Estudiante", icono: "👤" },
  admin:      { clases: "bg-[#FEF9E7] text-[#D97706]", label: "Administrador", icono: "⚙️" },
};

const ACCION_POR_ROL = {
  docente:    { label: "Asignar Admin" },
  estudiante: { label: "Hacer Docente" },
  admin:      { label: "Revocar Admin" },
};

export default function GestionUsuarios() {
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const usuariosFiltrados = USUARIOS_MOCK.filter((u) => {
    const coincideFiltro = filtroActivo === "todos" || u.rol === filtroActivo;
    const coincideBusqueda =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });

  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div className="max-w-[920px]">
      <div className="mb-8">
        <h1 className="text-[30px] font-bold text-[#111111] tracking-[-0.02em] mb-1.5">Gestión de Usuarios</h1>
        <p className="text-[#6B6B6B] text-sm max-w-[560px]">
          Controla el acceso institucional, gestiona roles académicos y supervisa el estado de las cuentas en la facultad de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] animate-fade-in">
        <div className="flex items-center justify-between gap-4 px-5 py-[18px] border-b border-[#F0F0F0] flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-[#6B6B6B] font-medium mr-1">Filtrar por Rol:</span>
            {FILTROS.map((f) => (
              <button
                key={f.id}
                className={`px-3.5 py-[7px] rounded-full border-[1.5px] font-sans text-[13px] font-medium cursor-pointer transition-all ${
                  filtroActivo === f.id
                    ? "bg-[#C0392B] text-white border-[#C0392B]"
                    : "border-[#E0E0E0] bg-white text-[#3D3D3D] hover:border-[#C0392B] hover:text-[#C0392B]"
                }`}
                onClick={() => setFiltroActivo(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-[9px] border-[1.5px] border-[#E0E0E0] rounded-lg bg-white min-w-[240px] transition-colors focus-within:border-[#C0392B]">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#BBBBBB] shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="border-none outline-none font-sans text-[13px] text-[#111111] bg-transparent w-full placeholder:text-[#BBBBBB]"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 px-[18px] py-[9px] rounded-lg font-sans text-[13px] font-semibold cursor-pointer bg-white text-[#111111] border border-[#E0E0E0] transition-all hover:bg-[#F2F2F2]">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Identidad del Usuario</th>
                <th className={thCls}>Rol Académico</th>
                <th className={thCls}>Estado de la Cuenta</th>
                <th className={thCls}>Acciones Administrativas</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const rolCfg = ROL_CONFIG[usuario.rol];
                const accionCfg = ACCION_POR_ROL[usuario.rol];
                return (
                  <tr key={usuario.id} className="hover:bg-[#F8F8F8]">
                    <td className={tdCls}>
                      <div className="flex items-center gap-3">
                        <AvatarUsuario usuario={usuario} />
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">{usuario.nombre}</p>
                          <p className="text-xs text-[#6B6B6B] mt-0.5">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={tdCls}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${rolCfg.clases}`}>
                        {rolCfg.label}
                      </span>
                    </td>
                    <td className={tdCls}>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:inline-block ${usuario.estado === "activo" ? "text-[#16A34A] before:bg-[#16A34A]" : "text-[#DC2626] before:bg-[#DC2626]"}`}>
                        {usuario.estado === "activo" ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        <button className="text-xs px-3.5 py-[7px] rounded-lg border-[1.5px] border-[#E0E0E0] bg-white text-[#3D3D3D] font-medium cursor-pointer hover:bg-[#F2F2F2] transition-all whitespace-nowrap font-sans">
                          {accionCfg.label}
                        </button>
                        <button className="w-8 h-8 rounded-md border border-[#FFD7D7] bg-[#FFF5F5] text-[#DC2626] cursor-pointer flex items-center justify-center transition-all hover:bg-[#FEE2E2] hover:border-[#DC2626]" title="Eliminar usuario">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0F0F0]">
          <p className="text-[13px] text-[#6B6B6B]">Mostrando 1 a {usuariosFiltrados.length} de 24 resultados</p>
          <div className="flex items-center gap-1">
            {['‹', '1', '2', '3', '›'].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-md border border-[#E0E0E0] bg-white font-sans text-[13px] cursor-pointer flex items-center justify-center text-[#3D3D3D] hover:bg-[#F2F2F2] transition-all ${p === '1' ? 'bg-[#C0392B] text-white border-[#C0392B] hover:bg-[#C0392B]' : ''}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarUsuario({ usuario }) {
  if (usuario.foto) {
    return <img src={usuario.foto} alt={usuario.nombre} className="w-[38px] h-[38px] rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="w-[38px] h-[38px] rounded-full bg-[#F2F2F2] text-[#3D3D3D] text-[13px] font-bold flex items-center justify-center shrink-0 tracking-[0.02em]">
      {usuario.iniciales}
    </div>
  );
}
