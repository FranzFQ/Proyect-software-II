import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../../services/global_URL';

// Mapeo de campos del backend a etiquetas legibles
const CRITERIOS = [
  { key: 'puntaje_evaluacion_estudiantes', label: 'Eval. Estudiantes' },
  { key: 'puntaje_autoevaluacion',         label: 'Autoevaluación'    },
  { key: 'puntaje_coordinador',            label: 'Coordinador'       },
  { key: 'puntaje_ceat',                   label: 'CEAT'              },
  { key: 'puntaje_apoyo_universitario',    label: 'Apoyo Univ.'       },
  { key: 'puntaje_checklist',              label: 'Checklist'         },
];

const DocenteComparacion = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [docente,     setDocente]     = useState(null);
  const [semestres,   setSemestres]   = useState([]);
  const [evalActual,  setEvalActual]  = useState(null);
  const [evalAnterior,setEvalAnterior]= useState(null);
  const [semActualId, setSemActualId] = useState('');
  const [semAnterId,  setSemAnterId]  = useState('');
  const [loading,     setLoading]     = useState(true);
  const [loadingComp, setLoadingComp] = useState(false);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    const fetchBase = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docenteRes, semRes] = await Promise.all([
          fetch(`${API_URL}usuarios/docentes/${id}/`),
          fetch(`${API_URL}academico/semestres/`),
        ]);
        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');
        if (!semRes.ok)     throw new Error('No se pudo cargar los semestres');

        const docenteData = await docenteRes.json();
        const semData     = await semRes.json();
        const listaSem    = Array.isArray(semData) ? semData : semData.results ?? [];

        setDocente(docenteData);
        setSemestres(listaSem);

        if (listaSem.length >= 1) setSemActualId(String(listaSem[0].id));
        if (listaSem.length >= 2) setSemAnterId(String(listaSem[1].id));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
  }, [id]);

  useEffect(() => {
    if (!semActualId || !semAnterId) return;
    const fetchEvals = async () => {
      setLoadingComp(true);
      try {
        const res = await fetch(`${API_URL}usuarios/docentes/${id}/comparacion/?semestre_a=${semActualId}&semestre_b=${semAnterId}`);
        if (!res.ok) throw new Error('Error al obtener la comparativa');
        
        const data = await res.json();
        setEvalActual(data.semestre_a);
        setEvalAnterior(data.semestre_b);
      } catch (e) {
        console.error(e);
        setEvalActual(null);
        setEvalAnterior(null);
      } finally {
        setLoadingComp(false);
      }
    };
    fetchEvals();
  }, [id, semActualId, semAnterId]);

  const getSemNombre = (semId) => {
    const s = semestres.find(s => String(s.id) === String(semId));
    return s ? `${s.anio} - Semestre ${s.ciclo}` : '—';
  };

  const punteoActual   = evalActual   ? parseFloat(evalActual.puntaje_final)   : null;
  const punteoAnterior = evalAnterior ? parseFloat(evalAnterior.puntaje_final) : null;

  const variacion = (punteoActual !== null && punteoAnterior !== null)
    ? (punteoActual - punteoAnterior).toFixed(1)
    : null;

  // Construir desglose por criterio a partir de los campos del backend
  const desgloseActual   = CRITERIOS.map(c => ({
    label: c.label,
    score: evalActual   ? parseFloat(evalActual[c.key]   ?? 0) : null,
  }));
  const desgloseAnterior = CRITERIOS.map(c => ({
    label: c.label,
    score: evalAnterior ? parseFloat(evalAnterior[c.key] ?? 0) : null,
  }));

  const nombreDocente = docente?.nombre_completo ?? '...';

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver al Perfil
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600">
          <p className="font-bold mb-1">Error al cargar la comparación</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const isPositive = variacion !== null && parseFloat(variacion) > 0;
  const isNegative = variacion !== null && parseFloat(variacion) < 0;
  let VariacionIcon = MinusIcon;
  let variacionColor = 'text-gray-400';
  if (isPositive) { VariacionIcon = ChevronUpIcon;   variacionColor = 'text-green-500'; }
  if (isNegative) { VariacionIcon = ChevronDownIcon; variacionColor = 'text-red-500'; }

  const hayCriterios = evalActual || evalAnterior;

  return (
    <div className="flex flex-col gap-6">

      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {nombreDocente}
        </button>
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-url-blue">Comparativa — {nombreDocente}</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 text-url-blue font-bold flex-wrap justify-center w-full md:w-auto">
          <span>Período de Comparación:</span>
          <select
            className="bg-[#8b9bb4] text-white font-semibold px-4 py-2 rounded-md outline-none border-none cursor-pointer"
            value={semAnterId}
            onChange={e => setSemAnterId(e.target.value)}
          >
            {semestres.map(s => (
              <option key={s.id} value={String(s.id)}>{s.anio} - Semestre {s.ciclo}</option>
            ))}
          </select>
          <span className="text-url-yellow">VS</span>
          <select
            className="bg-url-blue text-white font-semibold px-4 py-2 rounded-md outline-none border-none cursor-pointer"
            value={semActualId}
            onChange={e => setSemActualId(e.target.value)}
          >
            {semestres.map(s => (
              <option key={s.id} value={String(s.id)}>{s.anio} - Semestre {s.ciclo}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingComp ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Semestre anterior */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
              <span className="text-gray-500 font-bold uppercase mb-4 text-center tracking-widest text-sm">
                {getSemNombre(semAnterId).replace(' - ', '\n')}
              </span>
              {punteoAnterior !== null ? (
                <>
                  <span className="text-8xl font-bold text-[#8b9bb4] mb-2">{punteoAnterior.toFixed(1)}</span>
                  <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
                </>
              ) : (
                <span className="text-4xl text-gray-300 mb-6 font-semibold">Sin datos</span>
              )}
              <span className="bg-gray-100 text-gray-500 border border-gray-300 px-8 py-2 rounded-lg font-bold text-sm">Anterior</span>
            </div>

            {/* Gráfica comparativa por criterio */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h4 className="text-url-blue font-bold mb-6 text-lg">Comparativa por Criterio</h4>
              {hayCriterios ? (
                <>
                  <div className="flex flex-col gap-4">
                    {CRITERIOS.map((c, idx) => {
                      const scoreActual   = desgloseActual[idx].score   ?? 0;
                      const scoreAnterior = desgloseAnterior[idx].score ?? 0;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="w-28 text-xs text-gray-600 text-right shrink-0">{c.label}</span>
                          <div className="flex-1 flex flex-col gap-1">
                            {evalActual && (
                              <div
                                className="bg-url-blue h-5 flex items-center justify-end pr-2 rounded-r-md shadow-sm"
                                style={{ width: `${Math.min(scoreActual * 10, 100)}%` }}
                              >
                                <span className="text-xs text-white font-bold">{scoreActual.toFixed(1)}</span>
                              </div>
                            )}
                            {evalAnterior && (
                              <div
                                className="bg-[#cbd5e1] h-5 flex items-center justify-end pr-2 rounded-r-md shadow-sm"
                                style={{ width: `${Math.min(scoreAnterior * 10, 100)}%` }}
                              >
                                <span className="text-xs text-gray-700 font-bold">{scoreAnterior.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-center gap-6 text-xs font-semibold text-gray-500 flex-wrap">
                    {evalActual && (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-url-blue rounded-sm shadow-sm" />
                        Actual ({getSemNombre(semActualId)})
                      </span>
                    )}
                    {evalAnterior && (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#cbd5e1] rounded-sm shadow-sm" />
                        Anterior ({getSemNombre(semAnterId)})
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  {variacion !== null ? (
                    <>
                      <div className={`text-6xl font-bold flex items-center gap-2 ${variacionColor}`}>
                        <VariacionIcon className="w-12 h-12 stroke-[3]" />
                        {Math.abs(parseFloat(variacion)).toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        {getSemNombre(semActualId)} vs {getSemNombre(semAnterId)}
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400 text-lg text-center">No hay datos suficientes para comparar</span>
                  )}
                </div>
              )}
            </div>

            {/* Semestre actual */}
            <div className="bg-white border-2 border-url-blue rounded-xl p-8 shadow-sm flex flex-col items-center justify-center border-r-4">
              <span className="text-url-yellow font-bold uppercase mb-4 text-center tracking-widest text-sm">
                {getSemNombre(semActualId).replace(' - ', '\n')}
              </span>
              {punteoActual !== null ? (
                <>
                  <span className="text-8xl font-bold text-url-blue mb-2">{punteoActual.toFixed(1)}</span>
                  <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
                </>
              ) : (
                <span className="text-4xl text-gray-300 mb-6 font-semibold">Sin datos</span>
              )}
              <span className="bg-yellow-50 text-yellow-700 px-8 py-2 rounded-lg font-bold text-sm border border-yellow-200">
                Actual {variacion !== null ? `${parseFloat(variacion) >= 0 ? '▲' : '▼'} ${Math.abs(parseFloat(variacion)).toFixed(1)}` : ''}
              </span>
            </div>
          </div>

          {/* Panel de variación por criterio */}
          {hayCriterios && evalActual && evalAnterior && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
              <h4 className="text-url-blue font-bold mb-6 text-lg">Variación por Criterio:</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {CRITERIOS.map((c, idx) => {
                  const scoreActual   = desgloseActual[idx].score   ?? 0;
                  const scoreAnterior = desgloseAnterior[idx].score ?? 0;
                  const diff = parseFloat((scoreActual - scoreAnterior).toFixed(1));

                  let colorClass = 'text-gray-400';
                  let bgClass    = 'bg-gray-50 border-gray-200';
                  let Icon       = MinusIcon;

                  if (diff > 0) { colorClass = 'text-green-600'; bgClass = 'bg-green-50 border-green-200'; Icon = ChevronUpIcon; }
                  if (diff < 0) { colorClass = 'text-orange-500'; bgClass = 'bg-orange-50 border-orange-200'; Icon = ChevronDownIcon; }

                  return (
                    <div key={idx} className={`flex flex-col gap-1 rounded-xl border p-3 ${bgClass}`}>
                      <span className="text-xs font-semibold text-gray-500 leading-tight">{c.label}</span>
                      <span className={`text-3xl font-bold flex items-center gap-1 ${colorClass}`}>
                        <Icon className="w-6 h-6 stroke-[4]" />
                        {Math.abs(diff).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">{scoreAnterior.toFixed(1)} → {scoreActual.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(punteoActual === null && punteoAnterior === null) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-400">
              <p>No hay evaluaciones consolidadas para los semestres seleccionados.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default DocenteComparacion;