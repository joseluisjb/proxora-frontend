import { useState } from "react";

const MATERIAS_MOCK = [
  { id: 1, nombre: "Análisis de Sistemas I", semestre: 5, codigo: "SYS-101" },
  { id: 2, nombre: "Ingeniería de Bases de Datos", semestre: 6, codigo: "DBE-204" },
  { id: 3, nombre: "Gestión de Proyectos", semestre: 9, codigo: "MGMT-500" },
  { id: 4, nombre: "Arquitectura de Software", semestre: 7, codigo: "ARC-302" },
];

const LINEAS_ACTIVAS = [
  { id: 1, nombre: "Seguridad Informática", descripcion: "Métodos criptográficos, evaluación de vulnerabilidades de red y marcos de gestión de riesgos para datos empresariales." },
  { id: 2, nombre: "Inteligencia Artificial", descripcion: "Algoritmos de aprendizaje automático, optimización de redes neuronales y aplicación de PLN en entornos de investigación académica." },
  { id: 3, nombre: "Internet de las Cosas (IoT)", descripcion: "Integración de sensores inteligentes, protocolos de computación en el borde y analítica de datos en tiempo real para infraestructura urbana." },
];

const STATS = [
  { label: "Total de Materias", valor: 48 },
  { label: "Líneas de Investigación", valor: 12 },
  { label: "Personal Docente", valor: 34 },
];

export default function ConfigAcademica() {
  const [formLinea, setFormLinea] = useState({ nombre: "", descripcion: "", activa: false });
  const handleFormChange = (campo, valor) => setFormLinea((prev) => ({ ...prev, [campo]: valor }));

  const inputCls = "w-full px-3.5 py-2.5 border-[1.5px] border-[#E0E0E0] rounded-lg font-sans text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#C0392B] transition-colors placeholder:text-[#BBBBBB]";
  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div className="max-w-[1100px]">
      <div className="mb-8">
        <h1 className="text-[30px] font-bold text-[#111111] tracking-[-0.02em] mb-1.5">Marco Institucional</h1>
        <p className="text-[#6B6B6B] text-sm max-w-[560px]">
          Define y gestiona las materias curriculares y las líneas de investigación estratégicas que sustentan el departamento de Ingeniería de Sistemas.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start animate-fade-in">
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2.5">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#C0392B" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                <h2 className="text-base font-bold text-[#111111]">Repositorio de Materias</h2>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-sans text-xs font-semibold cursor-pointer bg-[#C0392B] text-white border-none hover:bg-[#96281B] transition-colors">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar Materia
              </button>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>Nombre</th>
                  <th className={thCls}>Semestre</th>
                  <th className={thCls}>Código</th>
                  <th className={thCls}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {MATERIAS_MOCK.map((materia) => (
                  <tr key={materia.id} className="hover:bg-[#F8F8F8]">
                    <td className={`${tdCls} font-semibold text-[#111111] text-[13px]`}>{materia.nombre}</td>
                    <td className={tdCls}>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2F2F2] text-[#3D3D3D]">
                        Semestre {materia.semestre}
                      </span>
                    </td>
                    <td className={`${tdCls} font-mono text-xs text-[#6B6B6B]`}>{materia.codigo}</td>
                    <td className={tdCls}>
                      <div className="flex gap-1.5">
                        <button className="w-[30px] h-[30px] rounded-md border border-[#E8E8E8] bg-white text-[#6B6B6B] cursor-pointer flex items-center justify-center hover:bg-[#F8F8F8] hover:text-[#111111] hover:border-[#BBBBBB] transition-all" title="Editar">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                          </svg>
                        </button>
                        <button className="w-[30px] h-[30px] rounded-md border border-[#E8E8E8] bg-white text-[#6B6B6B] cursor-pointer flex items-center justify-center hover:bg-[#FFF5F5] hover:text-[#DC2626] hover:border-[#FFD7D7] transition-all" title="Eliminar">
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F0F0] text-xs text-[#6B6B6B]">
              <span>Mostrando 4 de 48 materias</span>
              <div className="flex gap-1">
                {['‹', '›'].map((btn, i) => (
                  <button key={i} className="w-8 h-8 rounded-md border border-[#E0E0E0] bg-white font-sans text-[13px] cursor-pointer flex items-center justify-center text-[#3D3D3D] hover:bg-[#F2F2F2]">{btn}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] px-4 py-[18px]">
                <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#6B6B6B] mb-2">{s.label}</p>
                <p className="text-[32px] font-bold text-[#111111] tracking-[-0.02em]">{s.valor}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-[#F0F0F0]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
              </svg>
              <h2 className="text-base font-bold text-[#111111]">Nueva Línea de Investigación</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#111111]">Nombre de la Línea</label>
                <input type="text" className={inputCls} placeholder="ej. Computación Distribuida" value={formLinea.nombre} onChange={(e) => handleFormChange("nombre", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-[#111111]">Descripción</label>
                <textarea className={`${inputCls} resize-y min-h-[80px]`} placeholder="Define el alcance y los objetivos..." value={formLinea.descripcion} onChange={(e) => handleFormChange("descripcion", e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activa" className="w-4 h-4 cursor-pointer accent-[#C0392B]" checked={formLinea.activa} onChange={(e) => handleFormChange("activa", e.target.checked)} />
                <label htmlFor="activa" className="text-[13px] text-[#3D3D3D] cursor-pointer">Activa para el período académico actual</label>
              </div>
              <button className="w-full justify-center inline-flex items-center gap-1.5 px-[18px] py-3 rounded-lg font-sans text-xs font-semibold tracking-[0.07em] cursor-pointer bg-[#C0392B] text-white border-none hover:bg-[#96281B] transition-colors">
                CREAR LÍNEA DE INVESTIGACIÓN
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-[#F0F0F0]">
              <h2 className="text-base font-bold text-[#111111]">Líneas Activas</h2>
              <span className="text-[10px] font-bold tracking-[0.1em] text-[#6B6B6B] bg-[#F2F2F2] px-2 py-[3px] rounded">GESTIÓN</span>
            </div>
            <div className="py-1">
              {LINEAS_ACTIVAS.map((linea) => (
                <div key={linea.id} className="px-5 py-3.5 border-b border-[#F5F5F5] last:border-b-0">
                  <p className="text-sm font-bold text-[#111111] mb-1">{linea.nombre}</p>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{linea.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
