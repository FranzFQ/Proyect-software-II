import { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { API_URL } from '../../services/global_URL';

export default function ChecklistForm({ checklist, onGuardar, onCancelar }) {
  const [docentes,      setDocentes]      = useState([]);
  const [cursosDados,   setCursosDados]   = useState([]);
  const [loadingDocs,   setLoadingDocs]   = useState(true);

  const [nombre,        setNombre]        = useState(checklist?.nombre        || '');
  const [docenteId,     setDocenteId]     = useState(checklist?.docenteId     || '');
  const [cursoDadoId,   setCursoDadoId]   = useState(checklist?.cursoDadoId   || '');
  const [criterios,     setCriterios]     = useState(checklist?.criteriosList || []);
  const [nuevoCriterio, setNuevoCriterio] = useState('');
  const [mostrarInput,  setMostrarInput]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchDocentes = async () => {
      setLoadingDocs(true);
      try {
        const res = await fetch(`${API_URL}usuarios/docentes/`);
        if (res.ok) {
          const data = await res.json();
          setDocentes(Array.isArray(data) ? data : data.results ?? []);
        }
      } finally {
        setLoadingDocs(false);
      }
    };
    fetchDocentes();
  }, []);

  useEffect(() => {
    if (!docenteId) { setCursosDados([]); setCursoDadoId(''); return; }
    const fetchCursos = async () => {
      try {
        const res = await fetch(`${API_URL}evaluaciones/cursos-dados/?docente=${docenteId}`);
        if (res.ok) {
          const data = await res.json();
          setCursosDados(Array.isArray(data) ? data : data.results ?? []);
        }
      } catch {
        setCursosDados([]);
      }
    };
    fetchCursos();
  }, [docenteId]);

  useEffect(() => {
    if (mostrarInput) inputRef.current?.focus();
  }, [mostrarInput]);

  const docenteSeleccionado = docentes.find(d => String(d.id) === String(docenteId));
  const cursoDadoSeleccionado = cursosDados.find(c => String(c.id) === String(cursoDadoId));

  const handleDocenteChange = (e) => {
    setDocenteId(e.target.value);
    setCursoDadoId('');
  };

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
    if (!nombre.trim() || !docenteId || !cursoDadoId) return;
    onGuardar({
      cursoDadoId:   parseInt(cursoDadoId),
      nombre,
      docenteId:     parseInt(docenteId),
      codigoDocente: docenteSeleccionado?.codigo_docente ?? '',
      docente:       docenteSeleccionado?.nombre_completo ?? '',
      nombreCurso:   cursoDadoSeleccionado?.CursosNombre ?? '',
      seccion:       cursoDadoSeleccionado?.seccion ?? '',
      criteriosList: criterios,
      criterios:     criterios.length,
    });
  };

  const selectClass = 'border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent bg-white w-full transition-all';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">

        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-bold text-url-blue">
            {checklist ? 'Editar Checklist' : 'Crear Nueva Checklist'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define el nombre y agrega los criterios de evaluacion que se usaran durante la visita de clase
          </p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nombre de la Checklist
              </label>
              <input
                placeholder="Ej. Observacion Metodologica"
                className="px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Docente
              </label>
              <select className={selectClass} value={docenteId} onChange={handleDocenteChange} disabled={loadingDocs}>
                <option value="">{loadingDocs ? 'Cargando...' : 'Seleccionar docente...'}</option>
                {docentes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Curso
              </label>
              <select
                className={selectClass}
                value={cursoDadoId}
                onChange={e => setCursoDadoId(e.target.value)}
                disabled={!docenteId}
              >
                <option value="">
                  {docenteId ? 'Seleccionar curso...' : 'Primero selecciona docente'}
                </option>
                {cursosDados.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.CursosNombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sección
              </label>
              <input
                className="px-4 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-500"
                value={cursoDadoSeleccionado?.seccion ? `Sección ${cursoDadoSeleccionado.seccion}` : '—'}
                disabled
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Criterios de Evaluacion:
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
              {criterios.map((c, i) => (
                <span key={i} className="bg-url-blue text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                  {c}
                  <button onClick={() => eliminarCriterio(i)} className="hover:text-url-yellow transition text-base leading-none">
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
            className={!nombre.trim() || !docenteId || !cursoDadoId ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
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