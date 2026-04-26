import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { API_URL } from '../../services/global_URL';

const TeacherProfile = () => {
  const navigate    = useNavigate();
  const { id, semesterId } = useParams();
  const isHistorical = !!semesterId;

  const [docente,      setDocente]      = useState(null);
  const [semestre,     setSemestre]     = useState(null);
  const [cursos,       setCursos]       = useState([]);
  const [evaluacion,   setEvaluacion]   = useState(null);
  const [puntajesCurso,setPuntajesCurso]= useState({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 6;

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
        setPuntajesCurso(data.puntajes_map);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, semesterId]);

  const getColorBarra = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-orange-400';
    return 'text-red-400';
  };

  const semNombre = semestre ? `${semestre.anio} - Semestre ${semestre.ciclo}` : '—';

  // Promedio general = promedio de todos los puntajes de cursos con evaluacion
  const promedioGeneral = (() => {
    const valores = Object.values(puntajesCurso);
    if (valores.length === 0) return null;
    return valores.reduce((a, b) => a + (parseFloat(b) || 0), 0) / valores.length;
  })();

  const getEstadoLabel = (score) => {
    if (score === null) return null;
    if (score >= 8) return { label: 'Excelente', color: 'text-green-400' };
    if (score >= 6) return { label: 'Buena',     color: 'text-orange-400' };
    return              { label: 'Deficiente',   color: 'text-red-400' };
  };

  const totalPages      = Math.ceil(cursos.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentCourses  = cursos.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const iniciales = docente
    ? docente.nombre_completo.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?';

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate('/teachers')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver a Docentes
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600">
          <p className="font-bold mb-1">Error al cargar el perfil</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">

      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(isHistorical ? `/teachers/${id}/history` : '/teachers')}
          className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition"
        >
          &larr; Volver a {isHistorical ? 'Histórico de Semestres' : 'Docentes'}
        </button>
        {isHistorical && (
          <Button variant="primary" onClick={() => navigate(`/teachers/${id}`)}>
            Volver al semestre actual
          </Button>
        )}
      </div>

      <div className={`rounded-xl text-white relative flex flex-col pt-8 shadow-md shrink-0 transition-colors ${isHistorical ? 'bg-[#2d3748]' : 'bg-url-blue'}`}>
        {isHistorical && (
          <div className="absolute top-0 right-8 bg-orange-500 text-white px-4 py-1 rounded-b-md text-xs font-bold tracking-widest uppercase shadow-md">
            Viendo Registro Histórico
          </div>
        )}

        <div className="px-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className={`w-24 h-24 text-url-blue rounded-xl flex items-center justify-center text-4xl font-bold shadow-lg shrink-0 ${isHistorical ? 'bg-gray-300' : 'bg-url-yellow'}`}>
              {iniciales}
            </div>
            <div>
              <p className={`${isHistorical ? 'text-gray-300' : 'text-url-yellow'} text-sm mb-1 font-semibold`}>
                {semNombre}
              </p>
              <h1 className="text-3xl font-bold mb-2">{docente?.nombre_completo ?? '—'}</h1>
              <p className="text-gray-300 text-sm">
                {docente?.codigo_docente} · {docente?.FacultadNombre ?? docente?.tipo_plan ?? ''}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                {evaluacion && (
                  <span className={`${isHistorical ? 'bg-gray-600 text-white' : 'bg-url-yellow text-url-blue'} px-4 py-1.5 rounded-md text-sm font-bold`}>
                    Punteo final: {parseFloat(evaluacion.puntaje_final).toFixed(1)}
                  </span>
                )}
                <span className="border border-white/30 text-white px-4 py-1.5 rounded-md text-sm font-semibold">
                  {cursos.length} cursos impartidos
                </span>
              </div>
            </div>
          </div>

          {/* Score promedio general — esquina superior derecha del header */}
          {promedioGeneral !== null && (() => {
            const estado = getEstadoLabel(promedioGeneral);
            return (
              <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1"></span>
                <span className={`text-5xl font-bold leading-none text-url-yellow`}>
                  {promedioGeneral.toFixed(1)}
                </span>
                <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-md text-url-yellow`}>
                  Punteo Final
                </span>
              </div>
            );
          })()}
        </div>

        <div className="flex flex-wrap justify-end gap-4 px-8 mt-6 pb-6">
          <button
            onClick={() => navigate(`/teachers/${id}/checklists`)}
            className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-url-blue hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Checklists
          </button>
          {!isHistorical && (
            <>
              <button
                onClick={() => navigate(`/teachers/${id}/history`)}
                className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-url-blue hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Histórico
              </button>
              <button
                onClick={() => navigate(`/teachers/${id}/comparison`)}
                className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-url-blue hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Comparación
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6 flex-1">
        <h3 className="font-bold text-lg text-url-blue">Cursos impartidos ({semNombre})</h3>

        {cursos.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm">
            <p>No hay cursos registrados para este semestre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map(curso => {
              const score = puntajesCurso[curso.id] ?? null;
              return (
                <div key={curso.id} className="bg-url-blue rounded-xl overflow-hidden shadow-md flex flex-col h-48">
                  <div className={`h-3 w-full ${score !== null ? getColorBarra(score) : 'bg-gray-500'}`} />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-xl leading-tight line-clamp-2 mb-1">
                        {curso.CursosNombre}
                      </h4>
                      <p className="text-gray-400 text-xs">Sección {curso.seccion}</p>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      {score !== null ? (
                        <span className={`text-4xl font-bold leading-none ${getScoreColor(score)}`}>
                          {score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin punteo</span>
                      )}
                      <button
                        onClick={() => navigate(`/teachers/${id}/course/${curso.id}`)}
                        className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
                      >
                        Ver Detalles &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-url-blue font-bold gap-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">&larr; Anterior</button>
            <span>Página {safeCurrentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">Siguiente &rarr;</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherProfile;