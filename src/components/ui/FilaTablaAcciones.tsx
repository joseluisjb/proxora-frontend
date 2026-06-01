interface FilaTablaAccionesProps {
  onEditar?: () => void;
  onEliminar?: () => void;
  mostrarEditar?: boolean;
  mostrarEliminar?: boolean;
}

export default function FilaTablaAcciones({
  onEditar,
  onEliminar,
  mostrarEditar = true,
  mostrarEliminar = true,
}: FilaTablaAccionesProps) {
  return (
    <div className="flex items-center gap-1.5">
      {mostrarEditar && (
        <button
          className="w-[30px] h-[30px] border-none bg-transparent rounded-md flex items-center justify-center cursor-pointer text-[#6B6B6B] transition-all hover:bg-[#F2F2F2] hover:text-[#111111] hover:scale-110"
          title="Editar"
          onClick={onEditar}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
      {mostrarEliminar && (
        <button
          className="w-[30px] h-[30px] border-none bg-transparent rounded-md flex items-center justify-center cursor-pointer text-[#6B6B6B] transition-all hover:bg-[#F2F2F2] hover:text-[#C0392B] hover:scale-110"
          title="Eliminar"
          onClick={onEliminar}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
