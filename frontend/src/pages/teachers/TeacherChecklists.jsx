import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../services/global_URL';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function colorPunteo(val) {
  if (val >= 9) return 'bg-green-500 text-green-600';
  if (val >= 7) return 'bg-yellow-500 text-yellow-600';
  return 'bg-red-500 text-red-600';
}

function colorTextoPunteo(val) {
  if (val >= 9) return 'text-green-600';
  if (val >= 7) return 'text-yellow-600';
  return 'text-red-600';
}

function colorBgBarra(val) {
  if (val >= 9) return 'bg-green-500';
  if (val >= 7) return 'bg-yellow-500';
  return 'bg-red-500';
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
  if (score === null) return 'bg-gray-100 text-gray-400 border border-gray-200';
  if (score >= 9)     return 'bg-green-50 text-green-700 border border-green-200';
  if (score >= 7)     return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
  return              'bg-red-50 text-red-700 border border-red-200';
}

// Vista de Detalles individual
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
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-10">
      
      <div className="mb-2">
        <button onClick={onBack} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          <ArrowLeftIcon className="w-4 h-4"/> Volver a Listado de Checklists
        </button>
        <h1 className="text-3xl font-black text-[#112240] mb-1 font-serif">Detalle de Checklist</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-url-yellow" />
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-50 border border-blue-100 text-url-blue rounded-xl flex items-center justify-center text-4xl font-black font-serif shadow-sm shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#112240] mb-1">{docente?.nombre_completo ?? '—'}</h1>
            <p className="text-gray-500 font-bold mb-3">{checklist.titulo} · <span className="text-gray-400 font-medium">{fecha}</span></p>
            <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1 rounded-md text-xs font-bold">
              Total de criterios evaluados: {criterios.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:items-end mt-6 md:mt-0">
          <div className="flex flex-col lg:items-end bg-gray-50 px-8 py-4 rounded-xl border border-gray-100 shadow-sm">
            <span className={`text-5xl font-black leading-none ${punteo !== '—' ? colorTextoPunteo(parseFloat(punteo)) : 'text-gray-400'}`}>
              {punteo}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Punteo final</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1">
        
        {/* Criterios evaluados */}
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
                <div key={i} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-b-0 transition hover:bg-gray-50 rounded-lg ${!ev.completado ? 'opacity-60 grayscale' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${ev.completado ? 'bg-green-500' : 'border-2 border-gray-300 bg-gray-100'}`}>
                    {ev.completado && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 font-semibold text-sm ${ev.completado ? 'text-[#112240]' : 'text-gray-400'}`}>
                    {nombre}
                  </span>
                  <span className={`px-4 py-1.5 rounded-md text-xs font-bold min-w-[72px] text-center ${scoreBadgeStyle(ev.completado ? ev.score : null)}`}>
                    {ev.completado && ev.score !== null ? `${ev.score} / 10` : '— / 10'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observaciones */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm h-full">
            <h3 className="font-bold text-lg text-[#112240] mb-4">Observaciones generales</h3>
            <div className="bg-[#FFFAF0] border border-yellow-200 rounded-xl p-6 min-h-[12rem] shadow-inner text-gray-700">
              {observaciones
                ? <p className="italic leading-relaxed">{observaciones}</p>
                : <p className="text-gray-400 italic">Sin observaciones registradas para este checklist.</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vista Principal
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
          fetch(`${API_URL}usuarios/docentes/${id}/`),
          fetch(`${API_URL}evaluaciones/cursos-dados/?docente=${id}`),
        ]);
        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');

        const docenteData = await docenteRes.json();
        setDocente(docenteData);

        if (cursosRes.ok) {
          const cursosData = await cursosRes.json();
          const cursosList = Array.isArray(cursosData) ? cursosData : cursosData.results ?? [];

          const checklistsResults = await Promise.all(
            cursosList.map(c =>
              fetch(`${API_URL}evaluaciones/checklists/?curso_dado=${c.id}`)
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

  if (loading) return <div className="p-12 animate-pulse text-[#112240] font-bold text-center">Cargando checklists...</div>;

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          <ArrowLeftIcon className="w-4 h-4"/> Volver
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600">
          <p className="font-bold mb-1">Error al cargar los checklists</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-12">
      <div className="mb-2">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          <ArrowLeftIcon className="w-4 h-4"/> Volver
        </button>
        <h1 className="text-3xl font-black text-[#112240] mb-1">Checklists Realizadas</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm relative overflow-hidden">
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-50 border border-blue-100 text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-black shadow-sm shrink-0">
            {iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#112240] mb-1">{docente?.nombre_completo ?? '—'}</h1>
            <p className="text-gray-500 font-bold mb-3">
              {docente?.FacultadNombre ?? docente?.tipo_plan ?? ''}
            </p>
            <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1.5 rounded-md font-bold text-xs">
              Total registrados: {checklists.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:items-end mt-6 md:mt-0">
          <div className="flex flex-col lg:items-end bg-gray-50 px-8 py-4 rounded-xl border border-gray-100 shadow-sm relative pt-1 overflow-hidden">
             <span className="text-5xl font-black text-[#112240] leading-none">{promedio}</span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Punteo Promedio</span>
          </div>
        </div>
      </div>

      {checklists.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex flex-col items-center justify-center mt-4">
          <p className="font-bold text-lg">Sin resultados</p>
          <p className="text-sm">Este docente no tiene checklists registrados aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 flex-1 content-start">
          {currentItems.map((checklist) => {
            const datos  = checklist.datos ?? {};
            const punteo = datos.punteo_final != null ? parseFloat(datos.punteo_final) : 0;
            const fecha  = checklist.fecha_observacion
              ? new Date(checklist.fecha_observacion).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';

            return (
              <div
                key={checklist.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200 min-h-[220px] relative hover:shadow-md transition-shadow"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${punteo > 0 ? colorBgBarra(punteo) : 'bg-gray-300'}`} />
                
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-xl text-[#112240] mb-1 line-clamp-1">{checklist.titulo}</h4>
                      <p className="text-sm text-gray-500 font-semibold">{checklist.CursoDadoStr}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-4xl font-black leading-none ${punteo > 0 ? colorTextoPunteo(punteo) : 'text-gray-400'}`}>
                        {punteo > 0 ? punteo.toFixed(1) : '—'}
                      </span>
                    </div>
                  </div>
                  
                  <span className="bg-gray-50 text-gray-500 text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-wider inline-block mb-4 border border-gray-200">
                    {fecha}
                  </span>
                  
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className={`h-1.5 rounded-full ${punteo > 0 ? colorBgBarra(punteo) : 'bg-transparent'}`} style={{ width: `${Math.min(punteo > 10 ? punteo : punteo * 10, 100)}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-400 font-semibold mb-4 uppercase tracking-widest">
                    {(datos.criteriosList?.length ?? 0)} criterios evaluados
                  </p>
                </div>

                <div className="p-6 pt-0 mt-auto flex justify-between items-center">
                  <span className="bg-[#112240] text-white text-[10px] font-bold px-3 py-1 rounded-md">
                    ID CL: {checklist.id}
                  </span>
                  <button
                    onClick={() => setSelectedChecklist(checklist)}
                    className="border border-[#112240] text-[#112240] text-sm font-bold px-6 py-1.5 rounded-md hover:bg-[#112240] hover:text-white transition-colors"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-[#112240] font-bold gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            &larr; Anterior
          </button>
          <span className="text-gray-500">Página {safePage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Siguiente &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherChecklists;