import { useState, useRef, useEffect } from 'react';

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [titulo,        setTitulo]        = useState(checklist?.titulo || '');
  const [criterios,     setCriterios]     = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState('');
  const [mostrarInput,  setMostrarInput]  = useState(false);
  const [color,         setColor]         = useState(checklist?.color || '#1a2744');
  const [editandoIdx,   setEditandoIdx]   = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');

  const inputRef   = useRef(null);
  const editRef    = useRef(null);

  useEffect(() => { if (mostrarInput) inputRef.current?.focus(); }, [mostrarInput]);
  useEffect(() => { if (editandoIdx !== null) editRef.current?.focus(); }, [editandoIdx]);

  const agregarCriterio = () => {
    if (!nuevoCriterio.trim()) return;
    setCriterios(prev => [...prev, nuevoCriterio.trim()]);
    setNuevoCriterio('');
    inputRef.current?.focus();
  };

  const cancelarInput = () => { setNuevoCriterio(''); setMostrarInput(false); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') agregarCriterio();
    if (e.key === 'Escape') cancelarInput();
  };

  const eliminarCriterio = (idx) => {
    setCriterios(prev => prev.filter((_, i) => i !== idx));
    if (editandoIdx === idx) { setEditandoIdx(null); setEditandoTexto(''); }
  };

  const iniciarEdicion = (idx) => {
    setEditandoIdx(idx);
    setEditandoTexto(criterios[idx]);
    setMostrarInput(false);
  };

  const confirmarEdicion = () => {
    if (!editandoTexto.trim()) return;
    setCriterios(prev => prev.map((c, i) => i === editandoIdx ? editandoTexto.trim() : c));
    setEditandoIdx(null);
    setEditandoTexto('');
  };

  const cancelarEdicion = () => { setEditandoIdx(null); setEditandoTexto(''); };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') confirmarEdicion();
    if (e.key === 'Escape') cancelarEdicion();
  };

  const handleGuardar = () => {
    if (!titulo.trim()) return;
    onGuardar({ titulo, criteriosList: criterios, color });
  };

  const COLORES = [
    '#1a2744', '#2563eb', '#7c3aed', '#db2777',
    '#ea580c', '#16a34a', '#0891b2', '#854d0e',
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="border-b border-gray-200 px-6 py-5 shrink-0">
          <h2 className="text-xl font-bold text-[#112240]">
            {checklist ? 'Editar Checklist' : 'Crear Nueva Checklist'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define el título y los criterios de evaluación.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Título de la Checklist
            </label>
            <input
              placeholder="Ej. Observación Metodológica"
              className="px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#112240] focus:border-transparent transition-all"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Color identificador
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORES.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Criterios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Criterios de Evaluación
                <span className="ml-2 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold text-[11px]">{criterios.length}</span>
              </label>
            </div>

            {/* Lista de criterios editables */}
            {criterios.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                {criterios.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${editandoIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    {/* Número */}
                    <span className="w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm"
                      style={{ background: color }}>
                      {i + 1}
                    </span>

                    {editandoIdx === i ? (
                      <>
                        <input
                          ref={editRef}
                          value={editandoTexto}
                          onChange={e => setEditandoTexto(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="flex-1 border-2 border-[#112240] rounded-md px-3 py-1.5 text-sm focus:outline-none"
                        />
                        <button
                          onClick={confirmarEdicion}
                          className="px-3 py-1.5 rounded-md text-sm font-bold text-white transition"
                          style={{ background: color }}
                          title="Confirmar"
                        >✓</button>
                        <button
                          onClick={cancelarEdicion}
                          className="px-2 py-1.5 rounded-md text-sm text-gray-400 hover:text-gray-600 font-bold transition"
                          title="Cancelar"
                        >×</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-semibold text-[#112240]">{c}</span>
                        <button
                          onClick={() => iniciarEdicion(i)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#112240] hover:bg-gray-100 transition"
                          title="Editar criterio"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => eliminarCriterio(i)}
                          className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                          title="Eliminar criterio"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input nuevo criterio */}
            {mostrarInput ? (
              <div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="w-6 h-6 rounded-full text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: color }}>
                    {criterios.length + 1}
                  </span>
                  <input
                    ref={inputRef}
                    value={nuevoCriterio}
                    onChange={e => setNuevoCriterio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nombre del criterio..."
                    className="flex-1 border-2 border-[#112240] rounded-md px-3 py-1.5 text-sm focus:outline-none"
                  />
                  <button
                    onClick={agregarCriterio}
                    className="px-3 py-1.5 rounded-md text-sm font-bold text-white transition"
                    style={{ background: color }}
                  >✓ Agregar</button>
                  <button onClick={cancelarInput} className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-base leading-none transition font-bold">×</button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">Presiona Enter para agregar · Esc para cancelar</p>
              </div>
            ) : (
              <button
                onClick={() => { setMostrarInput(true); setEditandoIdx(null); }}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 text-gray-500 px-4 py-2.5 rounded-xl text-sm font-bold hover:border-[#112240] hover:text-[#112240] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Agregar criterio
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 shrink-0">
          <button
            onClick={handleGuardar}
            disabled={!titulo.trim()}
            className="px-6 py-2.5 rounded-md font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: color }}
          >
            {checklist ? 'Guardar cambios' : 'Crear Checklist'}
          </button>
          <button
            onClick={onCancelar}
            className="px-6 py-2.5 rounded-md font-bold text-sm border-2 border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}