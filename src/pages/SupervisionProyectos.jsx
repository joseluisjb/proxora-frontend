import { useState } from "react";

const PROYECTOS_MOCK = [
  { id: "PRJ-2024-001", titulo: "Búsqueda de Arquitecturas Neuronales para IoT", autor: "Alejandro Ramírez", director: "Dra. Martha Elena V.", materia: "IA & Sistemas", visibilidad: "Público" },
  { id: "PRJ-2024-042", titulo: "Ledger Distribuido para Cadena de Suministro", autor: "Juliana Ortiz", director: "Ing. Ricardo Méndez", materia: "Blockchain", visibilidad: "Privado" },
  { id: "PRJ-2023-118", titulo: "Patrones de Seguridad en Microservicios", autor: "Cristian Morales", director: "Dra. Martha Elena V.", materia: "Ing. Software", visibilidad: "Público" },
  { id: "PRJ-2023-094", titulo: "Visualización de Datos para Tráfico Urbano", autor: "Sofía Herrera", director: "Ing. Camilo Soto", materia: "Ciencia de Datos", visibilidad: "Público" },
  { id: "PRJ-2024-015", titulo: "Prototipos de Criptografía Cuántica", autor: "David Jiménez", director: "Dra. Martha Elena V.", materia: "Ciberseguridad", visibilidad: "Privado" },
];

const SEMESTRES = ["Todos los Semestres", "2024-I", "2024-II", "2023-I", "2023-II"];
const MATERIAS = ["Todas las Materias", "IA & Sistemas", "Blockchain", "Ing. Software", "Ciencia de Datos", "Ciberseguridad"];
const VISIBILIDADES = ["Toda Visibilidad", "Público", "Privado"];

export default function SupervisionProyectos() {
  const [semestre, setSemestre] = useState("Todos los Semestres");
  const [materia, setMateria] = useState("Todas las Materias");
  const [visibilidad, setVisibilidad] = useState("Toda Visibilidad");

  const proyectosFiltrados = PROYECTOS_MOCK.filter((p) => {
    const okMateria = materia === "Todas las Materias" || p.materia === materia;
    const okVis = visibilidad === "Toda Visibilidad" || p.visibilidad === visibilidad;
    return okMateria && okVis;
  });

  const selectCls = "appearance-none px-3.5 py-2.5 pr-9 border-[1.5px] border-[#E0E0E0] rounded-lg font-sans text-[13px] text-[#111111] bg-white cursor-pointer focus:outline-none focus:border-[#C0392B] transition-colors";
  const labelCls = "text-[11px] font-semibold tracking-[0.06em] uppercase text-[#6B6B6B]";
  const thCls = "text-left text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6B6B6B] px-4 py-3 border-b border-[#EBEBEB]";
  const tdCls = "px-4 py-3.5 border-b border-[#F0F0F0] align-middle";

  return (
    <div className="max-w-[960px] flex flex-col gap-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#C0392B] mb-1.5">Administración del Sistema</p>
          <h1 className="text-[30px] font-bold text-[#111111] tracking-[-0.02em] mb-1.5">Supervisión de Proyectos</h1>
          <p className="text-[#6B6B6B] text-sm">
            Gestiona y monitorea todos los proyectos de investigación en ingeniería de sistemas de la institución.
          </p>
        </div>
        <button className="mt-2 inline-flex items-center gap-1.5 px-5 py-[11px] rounded-lg font-sans text-[13px] font-semibold cursor-pointer bg-[#C0392B] text-white border-none hover:bg-[#96281B] transition-colors shrink-0">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] p-5 animate-fade-in">
        <div className="flex items-end gap-4 flex-wrap">
          {[
            { label: "Semestre", value: semestre, options: SEMESTRES, onChange: setSemestre },
            { label: "Materia / Área", value: materia, options: MATERIAS, onChange: setMateria },
            { label: "Visibilidad", value: visibilidad, options: VISIBILIDADES, onChange: setVisibilidad },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
              <label className={labelCls}>{s.label}</label>
              <select className={selectCls} value={s.value} onChange={(e) => s.onChange(e.target.value)}>
                {s.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button className="h-[42px] px-[18px] inline-flex items-center gap-1.5 rounded-lg font-sans text-[13px] font-semibold cursor-pointer bg-[#111111] text-white border-none hover:bg-[#1A1A1A] transition-colors shrink-0">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[#EBEBEB] overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Título del Proyecto</th>
                <th className={thCls}>Autor Principal</th>
                <th className={thCls}>Director</th>
                <th className={thCls}>Materia</th>
                <th className={thCls}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id} className="hover:bg-[#F8F8F8]">
                  <td className={tdCls}>
                    <p className="text-[13px] font-semibold text-[#111111] mb-0.5">{proyecto.titulo}</p>
                    <p className="text-[11.5px] text-[#6B6B6B]">
                      ID: {proyecto.id} • <span className={`font-medium ${proyecto.visibilidad === "Público" ? "text-[#16A34A]" : "text-[#6B6B6B]"}`}>{proyecto.visibilidad}</span>
                    </p>
                  </td>
                  <td className={`${tdCls} text-[13px] text-[#3D3D3D]`}>{proyecto.autor}</td>
                  <td className={`${tdCls} text-[13px] text-[#3D3D3D]`}>{proyecto.director}</td>
                  <td className={tdCls}>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2F2F2] text-[#3D3D3D]">{proyecto.materia}</span>
                  </td>
                  <td className={tdCls}>
                    <div className="flex gap-1.5">
                      {[
                        { title: "Ver proyecto", path: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
                        { title: "Editar", path: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
                      ].map((btn) => (
                        <button key={btn.title} className="w-[30px] h-[30px] rounded-md border border-[#E8E8E8] bg-white text-[#6B6B6B] cursor-pointer flex items-center justify-center hover:bg-[#F8F8F8] hover:text-[#111111] hover:border-[#BBBBBB] transition-all" title={btn.title}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={btn.path}/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0F0F0]">
          <p className="text-[13px] text-[#6B6B6B]">Mostrando 1 a 5 de 124 proyectos</p>
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
