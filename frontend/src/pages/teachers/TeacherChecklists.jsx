import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GLOBAL_API_URL from '../../services/global_URL';

function colorPunteo(val) {
  if (val >= 9) return '#22c55e';
  if (val >= 7) return '#facc15';
  return '#ef4444';
}

function punteoPromedio(checklists) {
  if (!checklists?.length) return '—';
  const scores = checklists
    .map(c => parseFloat(c.datos?.punteo_final ?? 0))
    .filter(s => s > 0);
  if (!scores.length) return '—';
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

function scoreBadgeStyle(score) {
  if (score === null) return { background: '#f1f5f9', color: '#94a3b8' };
  if (score >= 9)     return { background: '#dcfce7', color: '#14532d' };
  if (score >= 7)     return { background: '#fde68a', color: '#713f12' };
  return               { background: '#fee2e2', color: '#991b1b' };
}

function VisitaDetalleView({ docente, checklist, onBack }) {
  const datos       = checklist.datos ?? {};
  const criterios   = datos.criteriosList ?? [];
  const evaluaciones= datos.evaluaciones  ?? [];
  const observaciones = datos.observaciones ?? '';
  const punteo      = datos.punteo_final != null
    ? parseFloat(datos.punteo_final).toFixed(1)
    : '—';
  const completados = evaluaciones.filter(e => e.completado).length;

  const iniciales = docente?.nombre_completo
    ?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  const fecha = checklist.fecha_observacion
    ? new Date(checklist.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <button onClick={onBack} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Visitas / {checklist.titulo} / Detalles de checklist
        </button>
      </div>

      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-bold shadow-lg shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{docente?.nombre_completo ?? '—'}</h1>
            <p className="text-url-yellow font-semibold mb-4">Checklist · {fecha}</p>
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

      <div className="flex flex-col lg:flex-row gap-6 mt-4 flex-1">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
            <h3 className="font-bold text-xl text-url-blue">Criterios de Evaluacion</h3>
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
                <div key={i} className={`flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition ${!ev.completado ? 'opacity-55' : ''}`}>
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
    </div>
  );
}

const TeacherChecklists = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [docente,        setDocente]        = useState(null);
  const [checklists,     setChecklists]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docenteRes, cursosRes] = await Promise.all([
          fetch(`${GLOBAL_API_URL}usuarios/docentes/${id}/`),
          fetch(`${GLOBAL_API_URL}evaluaciones/cursos-dados/?docente=${id}`),
        ]);
        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');

        const docenteData = await docenteRes.json();
        setDocente(docenteData);

        if (cursosRes.ok) {
          const cursosData = await cursosRes.json();
          const cursosList = Array.isArray(cursosData) ? cursosData : cursosData.results ?? [];

          const checklistsResults = await Promise.all(
            cursosList.map(c =>
              fetch(`${GLOBAL_API_URL}evaluaciones/checklists/?curso_dado=${c.id}`)
                .then(r => r.ok ? r.json() : [])
                .then(d => Array.isArray(d) ? d : d.results ?? [])
            )
          );
          const all = checklistsResults.flat().sort((a, b) =>
            new Date(b.fecha_observacion) - new Date(a.fecha_observacion)
          );
          setChecklists(all);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const promedio    = punteoPromedio(checklists);
  const totalPages  = Math.ceil(checklists.length / itemsPerPage) || 1;
  const safePage    = Math.min(currentPage, totalPages);
  const currentItems= checklists.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const iniciales = docente?.nombre_completo
    ?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  if (selectedChecklist) {
    return <VisitaDetalleView docente={docente} checklist={selectedChecklist} onBack={() => setSelectedChecklist(null)} />;
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
              Total de checklists: {checklists.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-bold text-url-yellow mb-1">{promedio}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      {checklists.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex items-center justify-center">
          <p>Este docente no tiene checklists registrados aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 flex-1 content-start">
          {currentItems.map((checklist, idx) => {
            const datos  = checklist.datos ?? {};
            const punteo = datos.punteo_final != null ? parseFloat(datos.punteo_final) : 0;
            const color  = datos.color ?? '#1a2744';
            const fecha  = checklist.fecha_observacion
              ? new Date(checklist.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';

            return (
              <div
                key={checklist.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200 min-h-[220px]"
                style={{ borderLeft: `12px solid ${color}` }}
              >
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-xl text-url-blue mb-1">{checklist.titulo}</h4>
                      <p className="text-sm text-gray-500">{checklist.CursoDadoStr}</p>
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
                    {(datos.criteriosList?.length ?? 0)} criterios evaluados
                  </p>
                </div>
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => setSelectedChecklist(checklist)}
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