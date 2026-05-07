import { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { API_URL } from '../../services/global_URL';

function ScoreButton({ value, score, onChange }) {
  const isSelected = score === value;
  const getColor = (v) => {
    if (v >= 9) return isSelected ? 'bg-green-100 border-green-500 text-green-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-green-300';
    if (v >= 7) return isSelected ? 'bg-yellow-100 border-yellow-400 text-yellow-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-yellow-300';
    return isSelected ? 'bg-red-100 border-red-400 text-red-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-red-300';
  };
  return (
    <button onClick={() => onChange(value)} className={`w-8 h-8 rounded border text-xs transition-all ${getColor(value)}`}>
      {value}
    </button>
  );
}

function getScoreBadgeStyle(score) {
  if (score === null) return 'bg-gray-100 text-gray-400';
  if (score >= 9)     return 'bg-green-100 text-green-700';
  if (score >= 7)     return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
}

// Modal para agregar docente a la ejecución
function ModalAgregarDocente({ checklistId, onAgregar, onCerrar }) {
  const [docentes,    setDocentes]    = useState([]);
  const [cursosDados, setCursosDados] = useState([]);
  const [docenteId,   setDocenteId]   = useState('');
  const [cursoDadoId, setCursoDadoId] = useState('');
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchDocentes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}usuarios/docentes/`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('auth_token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDocentes(Array.isArray(data) ? data : data.results ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDocentes();
  }, []);

  useEffect(() => {
    if (!docenteId) { setCursosDados([]); setCursoDadoId(''); return; }
    const fetchCursos = async () => {
      try {
        const res = await fetch(`${API_URL}evaluaciones/cursos-dados/?docente=${docenteId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('auth_token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCursosDados(Array.isArray(data) ? data : data.results ?? []);
        }
      } catch { setCursosDados([]); }
    };
    fetchCursos();
  }, [docenteId]);

  const cursoDadoSeleccionado = cursosDados.find(c => String(c.id) === String(cursoDadoId));
  const docenteSeleccionado   = docentes.find(d => String(d.id) === String(docenteId));

  const handleAgregar = () => {
    if (!docenteId || !cursoDadoId) return;
    onAgregar({
      docenteId:     parseInt(docenteId),
      cursoDadoId:   parseInt(cursoDadoId),
      docente:       docenteSeleccionado?.nombre_completo ?? '',
      codigoDocente: docenteSeleccionado?.codigo_docente ?? '',
      nombreCurso:   cursoDadoSeleccionado?.CursosNombre ?? '',
      seccion:       cursoDadoSeleccionado?.seccion ?? '',
    });
  };

  const sel = 'border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-url-blue bg-white w-full transition-all';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-bold text-url-blue">Observar Docente</h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona el docente y su curso para registrar la observación.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Docente</label>
            <select className={sel} value={docenteId} onChange={e => setDocenteId(e.target.value)} disabled={loading}>
              <option value="">{loading ? 'Cargando...' : 'Seleccionar docente...'}</option>
              {docentes.map(d => (
                <option key={d.id} value={d.id}>{d.nombre_completo}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Curso</label>
            <select className={sel} value={cursoDadoId} onChange={e => setCursoDadoId(e.target.value)} disabled={!docenteId}>
              <option value="">{docenteId ? 'Seleccionar curso...' : 'Primero selecciona docente'}</option>
              {cursosDados.map(c => (
                <option key={c.id} value={c.id}>{c.CursosNombre}</option>
              ))}
            </select>
          </div>

          {cursoDadoSeleccionado && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-600">
              Sección: <strong>{cursoDadoSeleccionado.seccion}</strong>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <Button
            variant="primary"
            onClick={handleAgregar}
            className={(!docenteId || !cursoDadoId) ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
          >
            Agregar Docente
          </Button>
          <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistEjecucion({ checklist, modoEdicion, onGuardar, onCancelar }) {
  const [criterios, setCriterios] = useState(checklist.criteriosList ?? []);

  const buildInitialEval = () => {
    const guardadas = checklist.datos?.evaluaciones ?? [];
    return (checklist.criteriosList ?? []).map((_, i) =>
      guardadas[i] ?? { completado: false, score: null }
    );
  };

  const [evaluaciones,  setEvaluaciones]  = useState(buildInitialEval);
  const [observaciones, setObservaciones] = useState(checklist.datos?.observaciones ?? '');

  // Docentes observados en esta ejecución
  const [docentesObservados, setDocentesObservados] = useState(
    checklist.docentesObservados ?? []
  );
  const [showModalDocente,  setShowModalDocente]  = useState(false);
  const [paginaDocentes,    setPaginaDocentes]    = useState(1);
  const [docenteActivo,     setDocenteActivo]     = useState(null); // docente que se está calificando ahora
  const [punteosPorDocente, setPunteosPorDocente] = useState({});   // { docenteId: punteo }
  const DOCENTES_POR_PAGINA = 4;

  const [editandoIdx,   setEditandoIdx]   = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [mostrarNuevo,  setMostrarNuevo]  = useState(false);
  const [nuevoCriterio, setNuevoCriterio] = useState('');

  const nuevoCriterioRef = useRef(null);
  const editInputRef     = useRef(null);

  // Carga el punteo de cada docente desde checklist-observaciones
  useEffect(() => {
    if (!docentesObservados.length || !checklist.id) return;
    const token = sessionStorage.getItem('auth_token');
    const ids = [...new Set(docentesObservados.map(d => d.docenteId).filter(Boolean))];
    ids.forEach(async (docenteId) => {
      try {
        const res = await fetch(
          `${API_URL}evaluaciones/checklist-observaciones/?docente=${docenteId}&checklist=${checklist.id}&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (list.length > 0) {
          const punteo = parseFloat(list[0].punteo ?? 0);
          if (punteo > 0) {
            setPunteosPorDocente(prev => ({ ...prev, [docenteId]: punteo }));
          }
        }
      } catch { /* silencioso */ }
    });
  }, [docentesObservados, checklist.id]);

  useEffect(() => { if (mostrarNuevo) nuevoCriterioRef.current?.focus(); }, [mostrarNuevo]);
  useEffect(() => { if (editandoIdx !== null) editInputRef.current?.focus(); }, [editandoIdx]);

  const completados = evaluaciones.filter(e => e.completado).length;
  const total       = criterios.length;

  const toggle = (i) => {
    setEvaluaciones(prev =>
      prev.map((e, idx) =>
        idx === i ? { completado: !e.completado, score: !e.completado ? 5 : null } : e
      )
    );
  };

  const setScore = (i, val) => {
    setEvaluaciones(prev => prev.map((e, idx) => idx === i ? { ...e, score: val } : e));
  };

  const iniciarEdicion   = (i) => { setEditandoIdx(i); setEditandoTexto(criterios[i]); };
  const cancelarEdicion  = ()  => { setEditandoIdx(null); setEditandoTexto(''); };
  const confirmarEdicion = ()  => {
    if (!editandoTexto.trim()) return;
    setCriterios(prev => prev.map((c, i) => i === editandoIdx ? editandoTexto.trim() : c));
    setEditandoIdx(null);
    setEditandoTexto('');
  };
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter')  confirmarEdicion();
    if (e.key === 'Escape') cancelarEdicion();
  };

  const eliminarCriterio = (i) => {
    setCriterios(prev    => prev.filter((_, idx) => idx !== i));
    setEvaluaciones(prev => prev.filter((_, idx) => idx !== i));
  };

  const agregarCriterio = () => {
    if (!nuevoCriterio.trim()) return;
    setCriterios(prev    => [...prev, nuevoCriterio.trim()]);
    setEvaluaciones(prev => [...prev, { completado: false, score: null }]);
    setNuevoCriterio('');
    nuevoCriterioRef.current?.focus();
  };

  const cancelarNuevo      = () => { setNuevoCriterio(''); setMostrarNuevo(false); };
  const handleNuevoKeyDown = (e) => {
    if (e.key === 'Enter')  agregarCriterio();
    if (e.key === 'Escape') cancelarNuevo();
  };

  const handleAgregarDocente = (datos) => {
    setDocenteActivo(datos);
    setEvaluaciones(buildInitialEval()); // reset calificaciones para el nuevo docente
    setObservaciones('');
    setShowModalDocente(false);
  };

  const handleGuardar = () => {
    const docentes = docenteActivo
      ? [docenteActivo, ...docentesObservados]
      : docentesObservados;
    onGuardar({ criteriosList: criterios, evaluaciones, observaciones, docentesObservados: docentes });
  };

  const breadcrumb = modoEdicion ? 'Editar Checklist' : 'Ejecutar Checklist';
  const checklistNombre = checklist.titulo || checklist.nombre || '';

  // Paginación de docentes observados
  const totalPaginasDoc = Math.ceil(docentesObservados.length / DOCENTES_POR_PAGINA) || 1;
  const docsPagina = docentesObservados.slice(
    (paginaDocentes - 1) * DOCENTES_POR_PAGINA,
    paginaDocentes * DOCENTES_POR_PAGINA
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-sm text-gray-500">
        <span className="text-url-blue font-semibold cursor-pointer hover:underline" onClick={onCancelar}>
          Checklists
        </span>{' '}
        /{' '}
        <span className="text-url-blue font-semibold cursor-pointer hover:underline" onClick={onCancelar}>
          {checklistNombre}
        </span>{' '}
        / <span>{breadcrumb}</span>
      </div>

      <div className="bg-url-blue rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-xl md:text-2xl tracking-wide">
            {checklistNombre}
          </h2>
          {docenteActivo && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-url-yellow" />
              <span className="text-url-yellow font-semibold text-sm">
                {docenteActivo.docente}
              </span>
              <span className="text-white/60 text-xs">·</span>
              <span className="text-white/70 text-xs">{docenteActivo.nombreCurso} — Sec. {docenteActivo.seccion}</span>
            </div>
          )}
          {!docenteActivo && !modoEdicion && (
            <p className="text-white/60 text-xs mt-2">Selecciona un docente para comenzar a calificar</p>
          )}
          {modoEdicion && (
            <button
              onClick={() => setMostrarNuevo(true)}
              className="mt-3 bg-url-yellow text-url-blue text-xs font-bold px-4 py-1.5 rounded hover:opacity-90 transition"
            >
              + Agregar más parámetros
            </button>
          )}
        </div>
        <div className="text-right">
          <div className="text-url-yellow font-bold text-4xl leading-none">{completados}/{total}</div>
          <div className="text-white text-xs mt-1">Criterios</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Criterios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-url-blue">Criterios de Evaluación</h3>
            {completados > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                {completados} completados
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {criterios.map((criterio, i) => {
              const e          = evaluaciones[i] ?? { completado: false, score: null };
              const estaEditando = modoEdicion && editandoIdx === i;

              return (
                <div
                  key={i}
                  className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-4 gap-3 transition-colors ${e.completado ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!modoEdicion && (
                      <button
                        onClick={() => { if (docenteActivo) toggle(i); }}
                        disabled={!docenteActivo}
                        title={!docenteActivo ? 'Selecciona un docente primero' : ''}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          !docenteActivo ? 'border-gray-200 opacity-30 cursor-not-allowed' :
                          e.completado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {e.completado && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    {estaEditando ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          ref={editInputRef}
                          value={editandoTexto}
                          onChange={e => setEditandoTexto(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1"
                        />
                        <button onClick={confirmarEdicion} className="bg-url-yellow text-url-blue px-2.5 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition">✓</button>
                        <button onClick={cancelarEdicion}  className="text-gray-400 hover:text-gray-600 px-1.5 py-1.5 text-base leading-none transition">×</button>
                      </div>
                    ) : (
                      <span className={`text-sm truncate ${e.completado ? 'text-gray-800 font-medium' : 'text-gray-400'} ${modoEdicion ? 'text-gray-700' : ''}`}>
                        {criterio}
                      </span>
                    )}
                  </div>

                  {modoEdicion && !estaEditando && (
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Button variant="secondary" onClick={() => iniciarEdicion(i)}>Editar</Button>
                      <Button variant="danger"    onClick={() => eliminarCriterio(i)}>Eliminar</Button>
                    </div>
                  )}

                  {!modoEdicion && (
                    <div className={`flex items-center gap-2 ml-10 md:ml-0 ${!docenteActivo ? 'opacity-25 pointer-events-none' : ''}`}>
                      {e.completado ? (
                        <>
                          <div className="flex gap-1">
                            {[1,2,3,4,5,6,7,8,9,10].map(v => (
                              <ScoreButton key={v} value={v} score={e.score} onChange={val => setScore(i, val)} />
                            ))}
                          </div>
                          <div className={`min-w-[60px] text-center text-sm font-bold px-3 py-1 rounded ${getScoreBadgeStyle(e.score)}`}>
                            {e.score !== null ? `${e.score} / 10` : '— / 10'}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-300 ml-auto">— / 10</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {modoEdicion && mostrarNuevo && (
              <>
                <div className="flex items-center gap-2 px-6 py-4 bg-yellow-50">
                  <input
                    ref={nuevoCriterioRef}
                    value={nuevoCriterio}
                    onChange={e => setNuevoCriterio(e.target.value)}
                    onKeyDown={handleNuevoKeyDown}
                    placeholder="Nombre del nuevo criterio..."
                    className="border-2 border-url-blue rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1"
                  />
                  <button onClick={agregarCriterio} className="bg-url-yellow text-url-blue px-3 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition">✓ Agregar</button>
                  <button onClick={cancelarNuevo}   className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-base leading-none transition">×</button>
                </div>
                <p className="px-6 pb-3 text-xs text-gray-400">Presiona Enter para agregar · Esc para cancelar</p>
              </>
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4">
          {/* Tabla de docentes observados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Docentes Observados
              </p>
              <button
                onClick={() => setShowModalDocente(true)}
                className="bg-url-blue text-white text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90 transition"
              >
                + Observar Docente
              </button>
            </div>

            {docentesObservados.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Ningún docente observado aún.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border border-gray-200">
                  <table className="text-xs" style={{minWidth: '380px', width: '100%'}}>
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">Docente</th>
                        <th className="text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">Curso</th>
                        <th className="text-center px-3 py-2 text-gray-500 font-semibold whitespace-nowrap">Punteo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {docsPagina.map((d, i) => {
                        const p = punteosPorDocente[d.docenteId] ?? null;
                        const badge = p === null
                          ? 'bg-gray-100 text-gray-400'
                          : p >= 9 ? 'bg-green-100 text-green-700'
                          : p >= 7 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600';
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 font-semibold text-url-blue whitespace-nowrap">
                              {d.docente}
                            </td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                              {d.nombreCurso}
                            </td>
                            <td className="px-3 py-2 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded font-bold`}>
                                {p !== null ? `${p}` : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPaginasDoc > 1 && (
                  <div className="flex justify-between items-center mt-2 text-xs text-url-blue font-bold">
                    <button
                      onClick={() => setPaginaDocentes(p => Math.max(1, p - 1))}
                      disabled={paginaDocentes === 1}
                      className="px-2 py-1 bg-gray-100 rounded disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span>{paginaDocentes}/{totalPaginasDoc}</span>
                    <button
                      onClick={() => setPaginaDocentes(p => Math.min(totalPaginasDoc, p + 1))}
                      disabled={paginaDocentes === totalPaginasDoc}
                      className="px-2 py-1 bg-gray-100 rounded disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Observaciones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
              Observaciones generales:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-url-blue focus:border-transparent transition-all"
              rows={4}
              placeholder="Observaciones sobre la visita..."
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleGuardar}
            className={`w-full justify-center py-3 ${!modoEdicion && !docenteActivo ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
          >
            {modoEdicion ? 'Guardar cambios' : 'Guardar'}
          </Button>

          <Button variant="secondary" onClick={onCancelar} className="w-full justify-center py-3">
            Cancelar
          </Button>
        </div>
      </div>

      {showModalDocente && (
        <ModalAgregarDocente
          checklistId={checklist.id}
          onAgregar={handleAgregarDocente}
          onCerrar={() => setShowModalDocente(false)}
        />
      )}
    </div>
  );
}