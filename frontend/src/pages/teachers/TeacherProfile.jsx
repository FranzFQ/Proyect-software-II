import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { API_URL } from '../../services/global_URL';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPieIcon, CheckCircleIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline'; 

const TeacherProfile = () => {
  const navigate    = useNavigate();
  const { id, semesterId } = useParams();
  const isHistorical = !!semesterId;

  const [docente,      setDocente]      = useState(null);
  const [semestre,     setSemestre]     = useState(null);
  const [cursos,       setCursos]       = useState([]);
  const [evaluacion,   setEvaluacion]   = useState(null);
  const [evaluacionesDesglose, setEvaluacionesDesglose] = useState([]);
  const [puntajesCurso,setPuntajesCurso]= useState({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 3; 

  const COLORS_PALETTE = ['#112240', '#1a365d', '#3182ce', '#63b3ed'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      try {
        let url = `${API_URL}usuarios/docentes/${id}/perfil/`;
        if (isHistorical && semesterId) {
          url += `?semestre=${semesterId}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudo cargar la información del perfil');
        
        const data = await res.json();
        
        setDocente(data.docente);
        setSemestre(data.semestre);
        setCursos(data.cursos);
        setEvaluacion(data.evaluacion);
        setEvaluacionesDesglose(data.evaluaciones_desglose || []);
        setPuntajesCurso(data.puntajes_map);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, semesterId]);

  const chartData = useMemo(() => {
    if (!evaluacionesDesglose || evaluacionesDesglose.length === 0) return [];
    
    return evaluacionesDesglose.map(ev => ({
        name: ev.CriterioNombre,
        value: Number(ev.puntaje_final || 0)
    })).filter(item => item.value > 0);
  }, [evaluacionesDesglose]);

  const getColorBarra = (score) => {
    const umbralExcelente = score > 10 ? 80 : 8;
    const umbralBueno = score > 10 ? 60 : 6;
    if (score >= umbralExcelente) return 'bg-green-500';
    if (score >= umbralBueno) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score) => {
    const umbralExcelente = score > 10 ? 80 : 8;
    const umbralBueno = score > 10 ? 60 : 6;
    if (score >= umbralExcelente) return 'text-green-600';
    if (score >= umbralBueno) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressWidth = (score) => {
    if (score === null) return 0;
    return score > 10 ? Math.min(score, 100) : Math.min(score * 10, 100);
  };

  const semNombre = semestre ? `${semestre.anio} - Semestre ${semestre.ciclo || 'I'}` : '—';

  const promedioGeneral = (() => {
    const valores = Object.values(puntajesCurso);
    if (valores.length === 0) return null;
    return valores.reduce((a, b) => a + (parseFloat(b) || 0), 0) / valores.length;
  })();

  const totalPages      = Math.ceil(cursos.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentCourses  = cursos.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const iniciales = docente
    ? docente.nombre_completo.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?';

  // Componente de Métrica con efecto Hover Magnético
  const MetricBox = ({ label, value }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 flex flex-col items-center justify-center flex-1 min-w-[70px] sm:min-w-[80px] transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:z-10 hover:bg-white cursor-default group">
      <span className="text-2xl xl:text-3xl font-black text-[#112240] leading-none mb-1 group-hover:text-url-blue transition-colors">
        {value ? parseFloat(value).toFixed(1) : '0.0'}
      </span>
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center line-clamp-1">
        {label}
      </span>
    </div>
  );

  if (loading) return <div className="p-12 animate-pulse text-[#112240] font-bold text-center">Cargando perfil...</div>;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-10">
      
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => navigate(isHistorical ? `/teachers/${id}/history` : '/teachers')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver a {isHistorical ? 'Histórico de Semestres' : 'Docentes'}
        </button>
        {isHistorical && (
          <Button variant="primary" onClick={() => navigate(`/teachers/${id}`)} className="bg-[#112240] text-white shadow-sm border-none flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4"/> Volver al semestre actual
          </Button>
        )}
      </div>

      {/* ENCABEZADO REESTRUCTURADO */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col shadow-sm relative overflow-visible">
        {isHistorical && <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500" />}

        {/* Fila Única: Info Docente (Izquierda) | Métricas y Botones (Derecha) */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          
          {/* Lado Izquierdo: Información del Docente */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 w-full lg:w-auto">
            <div className="w-24 h-24 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-4xl font-serif font-black text-[#112240] shadow-sm shrink-0">
              {iniciales}
            </div>
            <div className="flex-1 truncate">
              <p className="text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">
                {semNombre} {isHistorical && <span className="text-orange-500 ml-1">(Histórico)</span>}
              </p>
              <h1 className="text-3xl font-black text-[#112240] mb-1 truncate">{docente?.nombre_completo ?? '—'}</h1>
              <p className="text-gray-500 font-medium text-sm">
                {docente?.codigo_docente} · {docente?.FacultadNombre ?? docente?.tipo_plan ?? ''}
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4"/> {cursos.length} cursos impartidos
                </span>
                {evaluacion && (
                  <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4"/> Punteo final: {parseFloat(evaluacion.puntaje_final || 0).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado Derecho: Puntuaciones Alineadas y Botones */}
          <div className="flex flex-col items-end gap-4 shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
            
            {/* Fila de Métricas (Las 4 + El Promedio General) */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch justify-end gap-3 w-full">
              <MetricBox label="Eval."  value={evaluacion?.puntaje_estudiantil || evaluacion?.estudiantil || evaluacion?.evaluacion_docente} />
              <MetricBox label="Check." value={evaluacion?.puntaje_visitas || evaluacion?.visitas} />
              <MetricBox label="Coord." value={evaluacion?.puntaje_coordinador || evaluacion?.coordinador || evaluacion?.control_docente} />
              <MetricBox label="CEAT"   value={evaluacion?.puntaje_ceat || evaluacion?.ceat} />
              
              {/* Promedio General (A la par de los otros cuadros) */}
              {promedioGeneral !== null && (
                <div className="flex flex-col items-center justify-center bg-gray-50 px-6 py-2 rounded-xl border border-gray-200 relative overflow-hidden shadow-sm shrink-0 sm:ml-2">
                  <span className="text-4xl xl:text-5xl font-black text-[#112240] leading-none">
                    {promedioGeneral.toFixed(1)}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Promedio Cursos</span>
                </div>
              )}
            </div>
            
            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-3 w-full justify-end mt-1">
              <button onClick={() => navigate(`/teachers/${id}/checklists`)} className="px-5 py-2 rounded-md font-bold text-xs border border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition-colors shadow-sm">
                Checklists
              </button>
              {!isHistorical && (
                <>
                  <button onClick={() => navigate(`/teachers/${id}/history`)} className="px-5 py-2 rounded-md font-bold text-xs border border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition-colors shadow-sm">
                    Histórico
                  </button>
                  <button onClick={() => navigate(`/teachers/${id}/comparison`)} className="px-5 py-2 rounded-md font-bold text-xs border border-[#112240] text-[#112240] hover:bg-[#112240] hover:text-white transition-colors shadow-sm">
                    Comparación
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        
        {/* Cursos */}
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-lg text-[#112240] mb-4">Cursos impartidos <span className="text-gray-400 text-sm font-semibold">({cursos.length})</span></h3>

          {cursos.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 font-bold">
              No hay cursos registrados.
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {currentCourses.map(curso => {
                const score = puntajesCurso[curso.id] ?? null;
                return (
                  <div key={curso.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative pt-1 overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${score !== null ? getColorBarra(score) : 'bg-gray-300'}`} />
                    <div className="p-4 flex flex-col h-full gap-3"> 
                      <h4 className="text-[#112240] font-bold text-lg leading-tight line-clamp-1">{curso.CursosNombre}</h4>
                      <p className="text-gray-500 text-sm -mt-2 mb-1">Sección: {curso.seccion || 'A'} · <span className="text-xs text-gray-400 font-medium">({curso.SemestreStr || semNombre})</span></p> 
                      
                      <div className="flex justify-between items-end gap-3 mt-auto">
                        <div className="flex-1 flex flex-col gap-1.5"> 
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Progreso</span>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${score !== null ? getColorBarra(score) : 'bg-transparent'}`} style={{ width: `${getProgressWidth(score)}%` }}></div>
                          </div>
                          <span className="bg-[#112240] text-white text-[10px] font-bold px-2 py-0.5 rounded-md inline-block w-fit mt-1">ID: {curso.id}</span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1.5 shrink-0"> 
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Punteo <span className={`text-base ml-1 ${score !== null ? getScoreColor(score) : ''}`}>{score !== null ? score.toFixed(1) : '—'}</span></span>
                          <button onClick={() => navigate(`/teachers/${id}/course/${curso.id}`)} className="border border-[#112240] text-[#112240] text-sm font-bold px-4 py-1 rounded-md hover:bg-[#112240] hover:text-white transition-colors">
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center pt-2 text-sm text-[#112240] font-bold">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">&larr; Anterior</button>
              <span className="text-gray-500">Página {safeCurrentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">Siguiente &rarr;</button>
            </div>
          )}
        </div>

        {/* Gráfica */}
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-lg text-[#112240] mb-4">Rendimiento por Categoría</h3>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={70} 
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} /> 
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center flex flex-col items-center gap-3 text-gray-400">
                <ChartPieIcon className="w-14 h-14 opacity-30" />
                <p className="font-bold text-sm">No hay datos de evaluación<br/>disponibles para graficar.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherProfile;