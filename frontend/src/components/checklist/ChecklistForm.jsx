import { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [titulo,        setTitulo]        = useState(checklist?.titulo || '');
  const [criterios,     setCriterios]     = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState('');
  const [mostrarInput,  setMostrarInput]  = useState(false);
  const [color,         setColor]         = useState(checklist?.color || '#1a2744');
  const inputRef = useRef(null);

  useEffect(() => {
    if (mostrarInput) inputRef.current?.focus();
  }, [mostrarInput]);

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

  const eliminarCriterio = (idx) => setCriterios(prev => prev.filter((_, i) => i !== idx));

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
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">

        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-url-blue">
            {checklist ? 'Editar Checklist' : 'Crear Nueva Checklist'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define el título y los criterios de evaluación. Podrás asignar docentes al ejecutar la checklist.
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Título de la Checklist
            </label>
            <input
              placeholder="Ej. Observación Metodológica"
              className="px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
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
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Criterios de Evaluación:
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {criterios.map((c, i) => (
                <span
                  key={i}
                  className="text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                  style={{ background: color }}
                >
                  {c}
                  <button onClick={() => eliminarCriterio(i)} className="hover:opacity-70 transition text-base leading-none">
                    ×
                  </button>
                </span>
              ))}

              {mostrarInput ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    value={nuevoCriterio}
                    onChange={e => setNuevoCriterio(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nombre del criterio..."
                    className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none w-48"
                  />
                  <button onClick={agregarCriterio} className="bg-url-yellow text-url-blue px-2.5 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition">
                    ✓
                  </button>
                  <button onClick={cancelarInput} className="text-gray-400 hover:text-gray-600 px-1.5 py-1.5 text-base leading-none transition">
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMostrarInput(true)}
                  className="border-2 border-url-blue text-url-blue px-3 py-1.5 rounded-md text-sm font-bold hover:bg-url-blue hover:text-white transition"
                >
                  + Agregar criterio
                </button>
              )}
            </div>
            {mostrarInput && (
              <p className="text-xs text-gray-400 mt-1.5">Presiona Enter para agregar · Esc para cancelar</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <Button
            variant="primary"
            onClick={handleGuardar}
            className={!titulo.trim() ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
          >
            Guardar Checklist
          </Button>
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}