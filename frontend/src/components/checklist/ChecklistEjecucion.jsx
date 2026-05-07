import { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../services/global_URL';
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; // <-- Importamos el ícono estandarizado

// ─── Helpers de color ──────────────────────────────────────────────────────────
function getColorBarra(score) {
  if (score >= 9) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-500';
  return 'bg-red-500';
}
function getScoreColor(score) {
  if (score === null || score === undefined) return 'text-gray-400';
  if (score >= 9) return 'text-green-600';
  if (score >= 7) return 'text-yellow-600';
  return 'text-red-600';
}
function scoreBadgeClass(score) {
  if (score === null || score === undefined) return 'bg-gray-100 text-gray-400 border border-gray-200';
  if (score >= 9) return 'bg-green-50 text-green-700 border border-green-200';
  if (score >= 7) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
  return 'bg-red-50 text-red-700 border border-red-200';
}
function colorPuntaoBgHex(score) {
  if (score === null) return '#9ca3af';
  if (score >= 9) return '#22c55e';
  if (score >= 7) return '#eab308';
  return '#ef4444';
}

// ─── ScoreButton ──────────────────────────────────────────────────────────────
function ScoreButton({ value, score, onChange }) {
  const isSelected = score === value;
  const getColor = (v) => {
    if (v >= 9) return isSelected ? 'bg-green-100 border-green-500 text-green-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-green-300';
    if (v >= 7) return isSelected ? 'bg-yellow-100 border-yellow-400 text-yellow-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-yellow-300';
    return isSelected ? 'bg-red-100 border-red-400 text-red-700 font-bold' : 'border-gray-200 text-gray-400 hover:border-red-300';
  };
  return (
    <button onClick={() => onChange(value)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded border text-xs transition-all ${getColor(value)}`}>
      {value}
    </button>
  );
}

// ─── Modal agregar docente ────────────────────────────────────────────────────
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
      } finally { setLoading(false); }
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

  const sel = 'border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#112240] bg-white w-full transition-all';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-black text-[#112240]">Observar Docente</h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona el docente y su curso para registrar la observación.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Docente</label>
            <select className={sel} value={docenteId} onChange={e => setDocenteId(e.target.value)} disabled={loading}>
              <option value="">{loading ? 'Cargando...' : 'Seleccionar docente...'}</option>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Curso</label>
            <select className={sel} value={cursoDadoId} onChange={e => setCursoDadoId(e.target.value)} disabled={!docenteId}>
              <option value="">{docenteId ? 'Seleccionar curso...' : 'Primero selecciona docente'}</option>
              {cursosDados.map(c => <option key={c.id} value={c.id}>{c.CursosNombre}</option>)}
            </select>
          </div>
          {cursoDadoSeleccionado && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-600">
              Sección: <strong>{cursoDadoSeleccionado.seccion}</strong>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleAgregar}
            disabled={!docenteId || !cursoDadoId}
            className="px-5 py-2.5 rounded-md font-bold text-sm text-white bg-[#112240] hover:bg-[#1a365d] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Agregar Docente
          </button>
          <button
            onClick={onCerrar}
            className="px-5 py-2.5 rounded-md font-bold text-sm border-2 border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
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

  const [docentesObservados, setDocentesObservados] = useState(checklist.docentesObservados ?? []);
  const [showModalDocente,   setShowModalDocente]   = useState(false);
  const [paginaDocentes,     setPaginaDocentes]     = useState(1);
  const [docenteActivo,      setDocenteActivo]      = useState(null);
  const [docenteReejecutar,  setDocenteReejecutar]  = useState(null);
  const [punteosPorDocente,  setPunteosPorDocente]  = useState({});
  // Reducido a 3 por página para que observaciones sean más visibles
  const DOCENTES_POR_PAGINA = 3;

  const [editandoIdx,   setEditandoIdx]   = useState(null);
  const [editandoTexto, setEditandoTexto] = useState('');
  const [mostrarNuevo,  setMostrarNuevo]  = useState(false);
  const [nuevoCriterio, setNuevoCriterio] = useState('');

  const nuevoCriterioRef = useRef(null);
  const editInputRef     = useRef(null);

  useEffect(() => {
    if (!docentesObservados.length || !checklist.id) return;
    const token = sessionStorage.getItem('auth_token');
    const ids = [...new Set(docentesObservados.map(d => d.docenteId).filter(Boolean))];
    ids.forEach(async (docenteId) => {
      try {
        const res = await fetch(
          `${API_URL}evaluaciones/checklist-observaciones/?docente=${docenteId}&checklist=${checklist.id}&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results ?? []);
        if (list.length > 0) {
          const latest = list.reduce((prev, curr) => ((curr.id ?? 0) > (prev.id ?? 0) ? curr : prev));
          const punteo = parseFloat(latest.punteo ?? 0);
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
  const punteoActual = completados > 0
    ? (evaluaciones.filter(e => e.completado && e.score !== null).reduce((a, e) => a + e.score, 0) / evaluaciones.filter(e => e.completado && e.score !== null).length) || null
    : null;

  const toggle = (i) => {
    if (!docenteActivo) return;
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
    setEditandoIdx(null); setEditandoTexto('');
  };
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') confirmarEdicion();
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
    if (e.key === 'Enter') agregarCriterio();
    if (e.key === 'Escape') cancelarNuevo();
  };

  const handleAgregarDocente = (datos) => {
    setDocenteActivo(datos);
    setEvaluaciones(buildInitialEval());
    setObservaciones('');
    setShowModalDocente(false);
    setDocenteReejecutar(null);
  };

  const handleSeleccionarDocenteTabla = (docente) => {
    if (docenteActivo?.docenteId === docente.docenteId && !docenteReejecutar) {
      setDocenteActivo(null);
      setEvaluaciones(buildInitialEval());
      setObservaciones('');
      setDocenteReejecutar(null);
      return;
    }
    setDocenteReejecutar(docente);
    setDocenteActivo(docente);
    setEvaluaciones(buildInitialEval());
    setObservaciones('');
  };

  const handleGuardar = () => {
    const docentes = docenteActivo
      ? [docenteActivo, ...docentesObservados.filter(d => d.docenteId !== docenteActivo.docenteId)]
      : docentesObservados;
    onGuardar({ criteriosList: criterios, evaluaciones, observaciones, docentesObservados: docentes });
  };

  const checklistNombre = checklist.titulo || checklist.nombre || '';

  const totalPaginasDoc = Math.ceil(docentesObservados.length / DOCENTES_POR_PAGINA) || 1;
  const docsPagina = docentesObservados.slice(
    (paginaDocentes - 1) * DOCENTES_POR_PAGINA,
    paginaDocentes * DOCENTES_POR_PAGINA
  );

  const iniciales = docenteActivo?.docente
    ? docenteActivo.docente.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 min-h-[calc(100vh-4rem)] pb-10 px-2 sm:px-0">

      {/* ── Navegación ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCancelar}
          className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition text-sm sm:text-base"
        >
          ← Volver a Checklists
        </button>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#112240] -mt-2">
        {modoEdicion ? 'Editar Checklist' : 'Ejecutar Checklist'}
      </h1>

      {/* ── Header card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col shadow-sm relative overflow-visible">
        <div
          className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
          style={{ background: punteoActual !== null ? colorPuntaoBgHex(punteoActual) : '#112240' }}
        />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6 lg:gap-8">
          {/* Lado izquierdo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 w-full">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {iniciales ? (
                <span className="text-2xl sm:text-3xl font-black text-[#112240] font-serif">{iniciales}</span>
              ) : (
                <svg className="w-7 h-7 sm:w-9 sm:h-9 text-[#112240]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs mb-1 font-bold uppercase tracking-wider">
                {modoEdicion ? 'Modo Edición' : 'Ejecución de Checklist'}
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-[#112240] mb-1 truncate">{checklistNombre}</h2>

              {docenteActivo ? (
                <p className="text-gray-500 font-medium text-sm truncate">
                  {docenteActivo.docente}
                  {docenteActivo.nombreCurso && <> · <span className="text-gray-400">{docenteActivo.nombreCurso}{docenteActivo.seccion ? ` — Sec. ${docenteActivo.seccion}` : ''}</span></>}
                  {docenteReejecutar && <span className="ml-2 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Re-ejecutando</span>}
                </p>
              ) : (
                <p className="text-gray-400 text-sm">{modoEdicion ? 'Editando parámetros del checklist' : 'Selecciona un docente para comenzar'}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-blue-50 text-[#112240] border border-blue-100 px-3 py-1 rounded-md text-xs font-bold">
                  {total} criterios
                </span>
                {completados > 0 && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-bold">
                    {completados} completados
                  </span>
                )}
                {docentesObservados.length > 0 && (
                  <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-md text-xs font-bold">
                    {docentesObservados.length} docentes observados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado derecho: métricas + botones */}
          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0 w-full lg:w-auto">
            {/* Métricas */}
            <div className="flex items-stretch gap-3 w-full sm:w-auto">
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col items-center justify-center transition-all hover:shadow-md hover:scale-105 cursor-default flex-1 sm:flex-none">
                <span className="text-2xl sm:text-3xl font-black text-[#112240] leading-none">{completados}<span className="text-gray-300 font-bold text-lg sm:text-xl">/{total}</span></span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Criterios</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 py-3 rounded-xl border border-gray-100 shadow-sm flex-1 sm:flex-none">
                <span className={`text-3xl sm:text-4xl font-black leading-none ${punteoActual !== null ? (punteoActual >= 9 ? 'text-green-600' : punteoActual >= 7 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-300'}`}>
                  {punteoActual !== null ? punteoActual.toFixed(1) : '—'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Punteo</span>
              </div>
            </div>

            {/* Botones de acción — Guardar y Cancelar juntos */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
              {!modoEdicion && (
                <button
                  onClick={() => setShowModalDocente(true)}
                  className="px-4 py-2 rounded-md font-bold text-xs bg-[#112240] text-white hover:bg-[#1a365d] transition-colors shadow-sm flex-1 sm:flex-none"
                >
                  + Observar Docente
                </button>
              )}
              {modoEdicion && (
                <button
                  onClick={() => setMostrarNuevo(true)}
                  className="px-4 py-2 rounded-md font-bold text-xs border border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition-colors shadow-sm flex-1 sm:flex-none"
                >
                  + Agregar criterio
                </button>
              )}
              {/* Guardar y Cancelar juntos */}
              <button
                onClick={handleGuardar}
                disabled={!modoEdicion && !docenteActivo}
                className="px-4 py-2 rounded-md font-bold text-xs bg-[#112240] text-white hover:bg-[#1a365d] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                {modoEdicion ? 'Guardar cambios' : 'Guardar'}
              </button>
              <button
                onClick={onCancelar}
                className="px-4 py-2 rounded-md font-bold text-xs border-2 border-gray-300 text-gray-500 hover:border-[#112240] hover:text-[#112240] transition-colors flex-1 sm:flex-none"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido principal ── */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">

        {/* Criterios */}
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-base sm:text-lg text-[#112240] mb-3 sm:mb-4">
            Criterios de Evaluación
            <span className="text-gray-400 text-sm font-semibold ml-2">({total})</span>
          </h3>

          {criterios.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 font-bold">
              No hay criterios. {modoEdicion && 'Agrega uno con el botón de arriba.'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {criterios.map((criterio, i) => {
                const e = evaluaciones[i] ?? { completado: false, score: null };
                const estaEditando = modoEdicion && editandoIdx === i;

                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative pt-1 transition-shadow hover:shadow-md"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${e.completado ? (e.score !== null ? getColorBarra(e.score) : 'bg-green-400') : 'bg-gray-200'}`} />

                    <div className="p-3 sm:p-4 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        {!modoEdicion && (
                          <button
                            onClick={() => toggle(i)}
                            disabled={!docenteActivo}
                            title={!docenteActivo ? 'Selecciona un docente primero' : ''}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              !docenteActivo ? 'border-gray-200 opacity-30 cursor-not-allowed' :
                              e.completado ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {e.completado && (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        )}

                        {estaEditando ? (
                          <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                            <input
                              ref={editInputRef}
                              value={editandoTexto}
                              onChange={e => setEditandoTexto(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              className="border-2 border-[#112240] rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1 w-full sm:w-auto"
                            />
                            <div className="flex gap-1">
                              <button onClick={confirmarEdicion} className="bg-[#112240] text-white px-2.5 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition">✓</button>
                              <button onClick={cancelarEdicion} className="text-gray-400 hover:text-gray-600 px-1.5 py-1.5 text-base leading-none transition">×</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between flex-1 gap-2">
                            <span className={`text-sm font-semibold leading-snug ${e.completado ? 'text-[#112240]' : modoEdicion ? 'text-[#112240]' : 'text-gray-400'}`}>
                              {criterio}
                            </span>
                            {modoEdicion && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => iniciarEdicion(i)} className="p-1.5 rounded-md text-gray-400 hover:text-[#112240] hover:bg-gray-100 transition" title="Editar">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button onClick={() => eliminarCriterio(i)} className="p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition" title="Eliminar">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {!modoEdicion && e.completado && (
                        <div className={`flex items-center gap-2 mt-1 flex-wrap ${!docenteActivo ? 'opacity-25 pointer-events-none' : ''}`}>
                          <div className="flex gap-1 flex-wrap">
                            {[1,2,3,4,5,6,7,8,9,10].map(v => (
                              <ScoreButton key={v} value={v} score={e.score} onChange={val => setScore(i, val)} />
                            ))}
                          </div>
                          <span className={`text-sm font-bold px-3 py-1 rounded-md border min-w-[60px] text-center ${scoreBadgeClass(e.score)}`}>
                            {e.score !== null ? `${e.score}/10` : '—/10'}
                          </span>
                        </div>
                      )}
                      {!modoEdicion && !e.completado && (
                        <div className="flex justify-end">
                          <span className="text-xs text-gray-300 font-semibold">— / 10</span>
                        </div>
                      )}

                      {!modoEdicion && e.completado && e.score !== null && (
                        <div className="w-full bg-gray-100 rounded-full h-1">
                          <div className={`h-1 rounded-full ${getColorBarra(e.score)}`} style={{ width: `${e.score * 10}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {modoEdicion && mostrarNuevo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      ref={nuevoCriterioRef}
                      value={nuevoCriterio}
                      onChange={e => setNuevoCriterio(e.target.value)}
                      onKeyDown={handleNuevoKeyDown}
                      placeholder="Nombre del nuevo criterio..."
                      className="border-2 border-[#112240] rounded-md px-3 py-1.5 text-sm focus:outline-none flex-1 w-full sm:w-auto"
                    />
                    <div className="flex gap-1">
                      <button onClick={agregarCriterio} className="bg-[#112240] text-white px-3 py-1.5 rounded-md text-sm font-bold hover:opacity-90 transition">✓ Agregar</button>
                      <button onClick={cancelarNuevo} className="text-gray-400 hover:text-gray-600 px-2 py-1.5 text-base leading-none transition font-bold">×</button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Presiona Enter para agregar · Esc para cancelar</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-4 sm:gap-5">

          {/* ── Tabla docentes observados (arriba, compacta) ── */}
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#112240] mb-3">
              Docentes Observados
              {docentesObservados.length > 0 && (
                <span className="text-gray-400 text-sm font-semibold ml-2">({docentesObservados.length})</span>
              )}
            </h3>

            {docentesObservados.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 font-bold text-sm">
                Ningún docente observado aún.
              </div>
            ) : (
              <>
                {/* Tabla compacta */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-3 py-2 font-bold text-gray-500 uppercase tracking-wider">Docente</th>
                        <th className="text-left px-2 py-2 font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Curso</th>
                        <th className="text-center px-2 py-2 font-bold text-gray-500 uppercase tracking-wider w-12">Ptje</th>
                        {!modoEdicion && <th className="w-8 px-1 py-2"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {docsPagina.map((d, i) => {
                        const p = punteosPorDocente[d.docenteId] ?? null;
                        const isActivo = docenteActivo?.docenteId === d.docenteId;
                        return (
                          <tr
                            key={i}
                            onClick={() => !modoEdicion && handleSeleccionarDocenteTabla(d)}
                            className={`transition-colors ${
                              modoEdicion ? 'cursor-default' : 'cursor-pointer hover:bg-blue-50/50'
                            } ${isActivo ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${isActivo ? 'bg-[#112240] text-white' : 'bg-gray-100 text-[#112240]'}`}>
                                  {d.docente.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()}
                                </div>
                                <span className={`font-semibold truncate max-w-[80px] sm:max-w-[120px] ${isActivo ? 'text-[#112240]' : 'text-gray-700'}`}>
                                  {d.docente.split(' ')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-2 hidden sm:table-cell">
                              <span className="text-gray-400 truncate max-w-[100px] block">{d.nombreCurso || '—'}</span>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <span className={`font-black text-sm ${p !== null ? (p >= 9 ? 'text-green-600' : p >= 7 ? 'text-yellow-600' : 'text-red-600') : 'text-gray-300'}`}>
                                {p !== null ? p.toFixed(1) : '—'}
                              </span>
                            </td>
                            {!modoEdicion && (
                              <td className="px-1 py-2 text-center">
                                <svg className={`w-3.5 h-3.5 mx-auto transition-colors ${isActivo ? 'text-[#112240]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPaginasDoc > 1 && (
                  <div className="flex justify-between items-center mt-2 text-xs text-[#112240] font-bold">
                    <button
                      onClick={() => setPaginaDocentes(p => Math.max(1, p - 1))}
                      disabled={paginaDocentes === 1}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      ← Ant.
                    </button>
                    <span className="text-gray-500">{paginaDocentes}/{totalPaginasDoc}</span>
                    <button
                      onClick={() => setPaginaDocentes(p => Math.min(totalPaginasDoc, p + 1))}
                      disabled={paginaDocentes === totalPaginasDoc}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition"
                    >
                      Sig. →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Observaciones (abajo de la tabla) ── */}
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#112240] mb-3">Observaciones generales</h3>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#112240] focus:border-transparent transition-all bg-gray-50"
                rows={4}
                placeholder="Observaciones sobre la visita..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
              />
            </div>
          </div>

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