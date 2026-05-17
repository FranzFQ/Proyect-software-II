import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocenteById } from '../../services/docente_service';
import { getChecklistsObservationByDocente } from '../../services/checklist_service';
import { API_URL } from '../../services/global_URL';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function colorPunteoHex(val) {
  if (val >= 9) return '#22c55e';
  if (val >= 7) return '#eab308';
  return '#ef4444';
}
function colorPunteoText(val) {
  if (val >= 9) return 'text-green-600';
  if (val >= 7) return 'text-yellow-500';
  return 'text-red-600';
}
function colorPuntaoBg(val) {
  if (val >= 9) return 'bg-green-500';
  if (val >= 7) return 'bg-yellow-400';
  return 'bg-red-500';
}
function scoreBadgeClass(score) {
  if (score === null || score === undefined)
    return 'bg-gray-100 text-gray-400 border border-gray-200';
  if (score >= 9) return 'bg-green-50 text-green-700 border border-green-200';
  if (score >= 7) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
  return 'bg-red-50 text-red-700 border border-red-200';
}
function getTitulo(obs) {
  return obs?.ChecklistTitulo || `Checklist #${obs?.checklist ?? obs?.id}`;
}

// Solo la observacion mas reciente por checklist (mayor id = mas reciente)
function deduplicarPorChecklist(observations) {
  const map = new Map();
  for (const obs of observations) {
    const key = obs.checklist ?? obs.id;
    if (!map.has(key) || (obs.id ?? 0) > (map.get(key).id ?? 0)) {
      map.set(key, obs);
    }
  }
  return Array.from(map.values());
}

function ChecklistChart({ observations }) {
  if (!observations || observations.length === 0) return null;
  const data = observations.slice(0, 5);
  const [hovered, setHovered] = React.useState(null);
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
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Evolución (últimas {data.length} checklists)</p>
      <div className="overflow-x-auto w-full">
        <svg viewBox={`0 0 ${W} ${H}`} width={Math.max(W, 300)} height={H} style={{ minWidth: `${W}px`, display: 'block' }}>
          {gridLines.map(v => (
            <g key={v}>
              <line x1={PAD_L} y1={yScale(v)} x2={W - PAD_R} y2={yScale(v)} stroke="#e5e7eb" strokeWidth="1" />
              <text x={PAD_L - 6} y={yScale(v)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#9ca3af">{v}</text>
            </g>
          ))}
          {data.length > 1 && <polyline points={points} fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />}
          {data.map((obs, i) => {
            const cx = xScale(i); const cy = yScale(obs.punteo);
            const col = colorPunteoHex(obs.punteo);
            const [line1, line2] = splitLabel(obs);
            const isHovered = hovered === i;
            const tipW = 52, tipH = 24, tipX = cx - tipW / 2, tipY = cy - tipH - 10;
            return (
              <g key={obs.id ?? i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                <circle cx={cx} cy={cy} r="18" fill="transparent" />
                <circle cx={cx} cy={cy} r={isHovered ? 8 : 6} fill={col} stroke="white" strokeWidth="2" style={{ transition: 'r 0.15s' }} />
                {isHovered && (
                  <g>
                    <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="6" fill="#112240" />
                    <text x={cx} y={tipY + 15} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">{obs.punteo > 0 ? obs.punteo.toFixed(1) : '—'} /10</text>
                  </g>
                )}
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

function VisitaDetalleView({ docente, obs, onBack }) {
  const datos = obs.datos ?? {};
  const criterios = datos.criteriosList ?? [];
  const evaluaciones = datos.evaluaciones ?? [];
  const observaciones = datos.observaciones ?? '';
  const punteo = obs.punteo > 0
    ? parseFloat(obs.punteo).toFixed(1)
    : (datos.punteo_final != null ? parseFloat(datos.punteo_final).toFixed(1) : '—');
  const completados = evaluaciones.filter(e => e.completado).length;
  const titulo = getTitulo(obs);
  const punteoNum = parseFloat(punteo);
  const iniciales = docente?.nombre_completo?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';
  const fecha = obs.fecha_observacion
    ? new Date(obs.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-10">
      <div>
        <button onClick={onBack} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a Listado de Checklists
        </button>
        <h1 className="text-3xl font-black text-[#112240] mb-1">Detalle de Checklist</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm relative overflow-hidden">
        {!isNaN(punteoNum) && <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorPuntaoBg(punteoNum)}`} />}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-50 border border-blue-100 text-url-blue rounded-xl flex items-center justify-center text-4xl font-black font-serif shadow-sm shrink-0">{iniciales}</div>
          <div>
            <h2 className="text-3xl font-black text-[#112240] mb-1">{docente?.nombre_completo ?? '—'}</h2>
            <p className="text-gray-500 font-bold mb-3">{titulo} · <span className="text-gray-400 font-medium">{fecha}</span></p>
            <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1 rounded-md text-xs font-bold">Total de criterios: {criterios.length}</span>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="flex flex-col items-center bg-gray-50 px-8 py-4 rounded-xl border border-gray-100 shadow-sm">
            <span className={`text-5xl font-black leading-none ${!isNaN(punteoNum) ? colorPunteoText(punteoNum) : 'text-gray-400'}`}>{punteo}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Punteo final</span>
          </div>
        </div>
      </div>
      {criterios.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm"><p>Esta observación no tiene criterios registrados.</p></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-[#112240]">Criterios de Evaluación</h3>
              {completados > 0 && (
                <span className="bg-green-50 text-green-700 px-4 py-1 rounded-md font-bold text-xs border border-green-200 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" /> {completados} completados
                </span>
              )}
            </div>
            <div className="flex flex-col p-2">
              {criterios.map((nombre, i) => {
                const ev = evaluaciones[i] ?? { completado: false, score: null };
                return (
                  <div key={i} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0 transition hover:bg-gray-50 rounded-lg ${!ev.completado ? 'opacity-55 grayscale' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ev.completado ? 'bg-green-500' : 'border-2 border-gray-200 bg-gray-100'}`}>
                      {ev.completado && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`flex-1 font-semibold text-sm ${ev.completado ? 'text-[#112240]' : 'text-gray-400'}`}>{nombre}</span>
                    <span className={`px-4 py-1.5 rounded-md text-xs font-bold min-w-[72px] text-center ${scoreBadgeClass(ev.completado ? ev.score : null)}`}>
                      {ev.completado && ev.score !== null ? `${ev.score} / 10` : '— / 10'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm h-full">
              <h3 className="font-bold text-lg text-[#112240] mb-4">Observaciones generales</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 min-h-[10rem]">
                {observaciones ? <p className="text-gray-600 text-sm leading-relaxed">{observaciones}</p> : <p className="text-gray-400 text-sm italic">Sin observaciones registradas.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const authHeaders = () => ({ Authorization: `Bearer ${sessionStorage.getItem('auth_token')}` });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
          setDocente(await getDocenteById(id));
          const data = await getChecklistsObservationByDocente(id);
          const list = Array.isArray(data) ? data : (data.results ?? []);
          const sorted = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
          setObservations(deduplicarPorChecklist(sorted));
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const promedio = useMemo(() => {
    const scores = observations.map(o => parseFloat(o.punteo ?? 0)).filter(s => s > 0);
    if (!scores.length) return '—';
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  }, [observations]);

  const promedioNum = parseFloat(promedio);
  const totalPages   = Math.ceil(observations.length / itemsPerPage) || 1;
  const safePage     = Math.min(currentPage, totalPages);
  const currentItems = observations.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const iniciales    = docente?.nombre_completo?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  if (selectedObs) return <VisitaDetalleView docente={docente} obs={selectedObs} onBack={() => setSelectedObs(null)} />;

  if (loading) return (
    <div className="flex flex-col gap-6">
      <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />)}</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition"><ArrowLeftIcon className="w-4 h-4" /> Volver</button>
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600"><p className="font-bold mb-1">Error al cargar los checklists</p><p className="text-sm">{error}</p></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-12">
      <div>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4"><ArrowLeftIcon className="w-4 h-4" /> Volver</button>
        <h1 className="text-3xl font-black text-[#112240] mb-1">Checklists Realizadas</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-50 border border-blue-100 text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-black shadow-sm shrink-0">{iniciales}</div>
          <div>
            <h2 className="text-3xl font-black text-[#112240] mb-1">{docente?.nombre_completo ?? '—'}</h2>
            <p className="text-gray-500 font-bold mb-3">{docente?.FacultadNombre ?? docente?.tipo_plan ?? ''} · Checklists</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1.5 rounded-md font-bold text-xs">Total: {observations.length} checklists</span>
              <span className="bg-gray-50 text-gray-400 border border-gray-200 px-4 py-1.5 rounded-md font-bold text-xs">última observación por checklist</span>
            </div>
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <div className="flex flex-col items-center bg-gray-50 px-8 py-4 rounded-xl border border-gray-100 shadow-sm">
            <span className={`text-5xl font-black leading-none ${!isNaN(promedioNum) ? colorPunteoText(promedioNum) : 'text-[#112240]'}`}>{promedio}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Punteo prom.</span>
          </div>
        </div>
      </div>

      {observations.length > 0 && (
        <div>
          <button onClick={() => setChartOpen(o => !o)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-[#112240] font-bold text-sm hover:bg-gray-50 transition-all w-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Gráfica de evolución
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 ml-auto" style={{ transform: chartOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          <div className="overflow-hidden transition-all duration-500" style={{ maxHeight: chartOpen ? '500px' : '0px', opacity: chartOpen ? 1 : 0 }}>
            <div className="mt-3"><ChecklistChart observations={[...observations].reverse().slice(0, 5)} /></div>
          </div>
        </div>
      )}

      {observations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex items-center justify-center"><p>Este docente no tiene checklists registradas aún.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 content-start">
          {currentItems.map((obs) => {
            const punteo = parseFloat(obs.punteo ?? 0);
            const fecha  = obs.fecha_observacion ? new Date(obs.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
            const criterios = (obs.datos?.criteriosList ?? []).length;
            return (
              <div key={obs.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200 min-h-[220px] relative hover:shadow-md transition-shadow">
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${punteo > 0 ? colorPuntaoBg(punteo) : 'bg-gray-300'}`} />
                <div className="p-6 pb-2 pt-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-xl text-[#112240] mb-1 line-clamp-1">{getTitulo(obs)}</h4>
                      <p className="text-sm text-gray-500">{obs.NombreCurso ?? obs.CursoDadoStr ?? '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-4xl font-black leading-none ${punteo > 0 ? colorPunteoText(punteo) : 'text-gray-400'}`}>{punteo > 0 ? punteo.toFixed(1) : '—'}</span>
                      {punteo > 0 && <span className="text-sm text-gray-400 font-semibold ml-1">/10</span>}
                    </div>
                  </div>
                  <span className="bg-gray-50 text-gray-500 text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-wider inline-block mb-4 border border-gray-200">{fecha}</span>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className={`h-1.5 rounded-full ${punteo > 0 ? colorPuntaoBg(punteo) : 'bg-transparent'}`} style={{ width: `${punteo > 0 ? Math.min(punteo * 10, 100) : 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">{criterios} criterios evaluados</p>
                </div>
                <div className="p-6 pt-0 mt-auto flex justify-between items-center">
                  <span className="bg-[#112240] text-white text-[10px] font-bold px-3 py-1 rounded-md">ID: {obs.id}</span>
                  <button onClick={() => setSelectedObs(obs)} className="border border-[#112240] text-[#112240] text-sm font-bold px-6 py-1.5 rounded-md hover:bg-[#112240] hover:text-white transition-colors">Ver detalle</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-[#112240] font-bold gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">&larr; Anterior</button>
          <span className="text-gray-500">Página {safePage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">Siguiente &rarr;</button>
        </div>
      )}
    </div>
  );
};

export default TeacherChecklists;