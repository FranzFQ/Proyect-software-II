import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../services/global_URL';

function colorPunteo(val) {
  if (val >= 9) return '#22c55e';
  if (val >= 7) return '#facc15';
  return '#ef4444';
}

function scoreBadgeStyle(score) {
  if (score === null || score === undefined) return { background: '#f1f5f9', color: '#94a3b8' };
  if (score >= 9)  return { background: '#dcfce7', color: '#14532d' };
  if (score >= 7)  return { background: '#fde68a', color: '#713f12' };
  return                  { background: '#fee2e2', color: '#991b1b' };
}

// Título de la observación: usa ChecklistTitulo del backend, si no el id
function getTitulo(obs) {
  return obs?.ChecklistTitulo || `Checklist #${obs?.checklist ?? obs?.id}`;
}

// ──────────────────────────────────────────────
// Gráfica de puntos (SVG, scroll horizontal, tooltip hover)
// ──────────────────────────────────────────────
function ChecklistChart({ observations }) {
  if (!observations || observations.length === 0) return null;
  const data = observations.slice(0, 5);

  const [hovered, setHovered] = React.useState(null); // índice del punto hovereado

  // Ancho dinámico: mínimo 140px por punto para que los títulos no se pisen
  const PER_POINT = 210;
  const PAD_L = 44, PAD_R = 36, PAD_T = 24, PAD_B = 80;
  const W = PAD_L + PAD_R + PER_POINT * (data.length - 1 || 1);
  const H = 300;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const yMin = 0, yMax = 10;
  const yScale = (v) => PAD_T + chartH - ((v - yMin) / (yMax - yMin)) * chartH;
  const xScale = (i) => PAD_L + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const gridLines = [2, 4, 6, 8, 10];
  const points = data.map((obs, i) => `${xScale(i)},${yScale(obs.punteo)}`).join(' ');

  // Parte el título en dos líneas de máx 14 chars
  function splitLabel(obs) {
    const label = getTitulo(obs);
    if (label.length <= 14) return [label, null];
    const mid = Math.floor(label.length / 2);
    const spaceAfter  = label.indexOf(' ', mid);
    const spaceBefore = label.lastIndexOf(' ', mid);
    const cut = spaceAfter !== -1 && (spaceAfter - mid) <= (mid - spaceBefore)
      ? spaceAfter : spaceBefore !== -1 ? spaceBefore : 14;
    return [label.slice(0, cut).trim().slice(0, 15), label.slice(cut).trim().slice(0, 15) || null];
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
        Evolución (últimas {data.length} checklists)
      </p>
      {/* Scroll horizontal en móvil, ancho completo en desktop */}
      <div className="overflow-x-auto w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={Math.max(W, 300)}
          height={H}
          style={{ minWidth: `${W}px`, display: 'block' }}
        >
          {/* Cuadrícula */}
          {gridLines.map(v => (
            <g key={v}>
              <line x1={PAD_L} y1={yScale(v)} x2={W - PAD_R} y2={yScale(v)} stroke="#e5e7eb" strokeWidth="1" />
              <text x={PAD_L - 6} y={yScale(v)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#9ca3af">{v}</text>
            </g>
          ))}

          {/* Línea */}
          {data.length > 1 && (
            <polyline points={points} fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
          )}

          {/* Puntos + tooltip + etiquetas */}
          {data.map((obs, i) => {
            const cx = xScale(i);
            const cy = yScale(obs.punteo);
            const col = colorPunteo(obs.punteo);
            const [line1, line2] = splitLabel(obs);
            const isHovered = hovered === i;

            // Tooltip: aparece arriba del punto, centrado
            const tipW = 52, tipH = 24;
            const tipX = cx - tipW / 2;
            const tipY = cy - tipH - 10;

            return (
              <g
                key={obs.id ?? i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Área de hover más grande (invisible) */}
                <circle cx={cx} cy={cy} r="18" fill="transparent" />

                {/* Punto */}
                <circle
                  cx={cx} cy={cy}
                  r={isHovered ? 8 : 6}
                  fill={col}
                  stroke="white"
                  strokeWidth="2"
                  style={{ transition: 'r 0.15s' }}
                />

                {/* Tooltip al hover */}
                {isHovered && (
                  <g>
                    <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6" fill="#1a2744" />
                    <text x={cx} y={tipY + 15} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">
                      {obs.punteo > 0 ? obs.punteo.toFixed(1) : '—'} /10
                    </text>
                  </g>
                )}

                {/* Título bajo el punto — siempre visible */}
                <text x={cx} y={H - PAD_B + 16} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="500">{line1}</text>
                {line2 && <text x={cx} y={H - PAD_B + 28} textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="500">{line2}</text>}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Vista de detalle de una observación
// ──────────────────────────────────────────────
function VisitaDetalleView({ docente, obs, onBack }) {
  // Los datos vienen del campo `datos` de la ChecklistObservation
  const datos        = obs.datos ?? {};
  const criterios    = datos.criteriosList ?? [];
  const evaluaciones = datos.evaluaciones  ?? [];
  const observaciones = datos.observaciones ?? '';
  const punteo       = obs.punteo > 0
    ? parseFloat(obs.punteo).toFixed(1)
    : (datos.punteo_final != null ? parseFloat(datos.punteo_final).toFixed(1) : '—');
  const completados  = evaluaciones.filter(e => e.completado).length;
  const titulo       = getTitulo(obs);

  const iniciales = docente?.nombre_completo
    ?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  const fecha = obs.fecha_observacion
    ? new Date(obs.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <button onClick={onBack} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Visitas / {titulo} / Detalles
        </button>
      </div>

      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-bold shadow-lg shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{docente?.nombre_completo ?? '—'}</h1>
            <p className="text-url-yellow font-semibold mb-4">{titulo} · {fecha}</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
              Total de criterios: {criterios.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-bold text-url-yellow mb-1">{punteo}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      {criterios.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm">
          <p>Esta observación no tiene criterios registrados.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-4 flex-1">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
              <h3 className="font-bold text-xl text-url-blue">Criterios de Evaluación</h3>
              {completados > 0 && (
                <span className="bg-green-100 text-green-700 px-6 py-1.5 rounded-full font-bold text-sm border border-green-200">
                  {completados} completados
                </span>
              )}
            </div>
            <div className="flex flex-col">
              {criterios.map((nombre, i) => {
                const ev = evaluaciones[i] ?? { completado: false, score: null };
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition ${!ev.completado ? 'opacity-55' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ev.completado ? 'bg-green-500' : 'border-2 border-gray-200'}`}>
                      {ev.completado && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`flex-1 font-semibold text-[15px] ${ev.completado ? 'text-url-blue' : 'text-gray-400'}`}>
                      {nombre}
                    </span>
                    <span className="px-5 py-1.5 rounded-md text-sm font-bold min-w-[72px] text-center" style={scoreBadgeStyle(ev.completado ? ev.score : null)}>
                      {ev.completado && ev.score !== null ? `${ev.score} / 10` : '— / 10'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full">
              <p className="font-bold text-url-blue mb-4">Observaciones generales:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[8rem]">
                {observaciones
                  ? <p className="text-gray-600 text-sm">{observaciones}</p>
                  : <p className="text-gray-400 text-sm">Sin observaciones.</p>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
const TeacherChecklists = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [docente,      setDocente]      = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [selectedObs,  setSelectedObs]  = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [chartOpen,    setChartOpen]    = useState(false);
  const itemsPerPage = 4;

  const authHeaders = () => ({
    Authorization: `Bearer ${sessionStorage.getItem('auth_token')}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docenteRes, obsRes] = await Promise.all([
          fetch(`${API_URL}usuarios/docentes/${id}/`, { headers: authHeaders() }),
          // Llamada correcta: checklist-observaciones filtradas por docente
          fetch(`${API_URL}evaluaciones/checklist-observaciones/?docente=${id}&limit=100`, { headers: authHeaders() }),
        ]);

        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');
        setDocente(await docenteRes.json());

        if (obsRes.ok) {
          const data = await obsRes.json();
          const list = Array.isArray(data) ? data : (data.results ?? []);
          setObservations(list);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const promedio = (() => {
    const scores = observations.map(o => parseFloat(o.punteo ?? 0)).filter(s => s > 0);
    if (!scores.length) return '—';
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  })();

  const totalPages  = Math.ceil(observations.length / itemsPerPage) || 1;
  const safePage    = Math.min(currentPage, totalPages);
  const currentItems = observations.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const iniciales = docente?.nombre_completo
    ?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  // ── Vista de detalle ──
  if (selectedObs) {
    return <VisitaDetalleView docente={docente} obs={selectedObs} onBack={() => setSelectedObs(null)} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600">
          <p className="font-bold mb-1">Error al cargar los checklists</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver
        </button>
      </div>

      {/* Header */}
      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-bold shadow-lg shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{docente?.nombre_completo ?? '—'}</h1>
            <p className="text-url-yellow font-semibold mb-4">
              {docente?.FacultadNombre ?? docente?.tipo_plan ?? ''} · Checklists
            </p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
              Total de checklists: {observations.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-bold text-url-yellow mb-1">{promedio}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo prom.</span>
        </div>
      </div>

      {/* Cards de observaciones */}
      {observations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex items-center justify-center">
          <p>Este docente no tiene checklists registrados aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 flex-1 content-start">
          {currentItems.map((obs) => {
            const punteo = parseFloat(obs.punteo ?? 0);
            const color  = punteo > 0 ? colorPunteo(punteo) : '#1a2744';
            const fecha  = obs.fecha_observacion
              ? new Date(obs.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';
            const criterios = (obs.datos?.criteriosList ?? []).length;

            return (
              <div
                key={obs.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200 min-h-[220px]"
                style={{ borderLeft: `12px solid ${color}` }}
              >
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-xl text-url-blue mb-1">{getTitulo(obs)}</h4>
                      <p className="text-sm text-gray-500">{obs.NombreCurso ?? obs.CursoDadoStr ?? '—'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold leading-none" style={{ color: colorPunteo(punteo) }}>
                        {punteo > 0 ? punteo.toFixed(1) : '—'}
                      </span>
                      {punteo > 0 && <span className="text-sm text-gray-400 font-semibold ml-1">/10</span>}
                    </div>
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-xs px-6 py-1.5 rounded-full font-bold inline-block mb-4 border border-gray-300">
                    {fecha}
                  </span>
                  <p className="text-sm text-gray-500 mb-4">
                    {criterios} criterios evaluados
                  </p>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => setSelectedObs(obs)}
                    className="bg-url-blue text-white w-full py-3 font-bold hover:bg-blue-900 transition rounded-md text-sm"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gráfica desplegable */}
      {observations.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setChartOpen(o => !o)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-url-blue font-bold text-sm hover:bg-gray-50 transition-all w-full md:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Gráfica de evolución
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-300 ml-auto"
              style={{ transform: chartOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: chartOpen ? '400px' : '0px', opacity: chartOpen ? 1 : 0 }}
          >
            <div className="mt-3">
              <ChecklistChart observations={[...observations].reverse().slice(0, 5)} />
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-url-blue font-bold gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            &larr; Anterior
          </button>
          <span>Página {safePage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherChecklists;