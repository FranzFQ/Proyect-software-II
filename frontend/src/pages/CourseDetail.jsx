import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { getCursoDadoById, getEvaluacionesCurso, getAnalisisTexto } from '../services/evaluaciones_service';

const CourseDetail = () => {
  const navigate          = useNavigate();
  const { id, cursoId }  = useParams();

  const [cursoDado,    setCursoDado]    = useState(null);
  const [evaluacion,   setEvaluacion]   = useState(null);
  const [comentarios,  setComentarios]  = useState([]);
  const [sugerencias,  setSugerencias]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${sessionStorage.getItem('auth_token')}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cursoDadoData, evalData, analisisData] = await Promise.all([
          getCursoDadoById(cursoId),
          getEvaluacionesCurso({ curso_dado: cursoId }),
          getAnalisisTexto({ curso_dado: cursoId }),
        ]);

        setCursoDado(cursoDadoData);

        const evalLista = Array.isArray(evalData) ? evalData : evalData.results ?? [];
        setEvaluacion(evalLista[0] ?? null);

        const analisisLista = Array.isArray(analisisData) ? analisisData : analisisData.results ?? [];
        const coms = [];
        const sugs = [];
        analisisLista.forEach(item => {
          const tipo    = (item.TipoNombre ?? '').toLowerCase();
          const textos  = extraerTextos(item.contenido);
          if (tipo.includes('suger') || tipo.includes('ia') || tipo.includes('resumen')) {
            sugs.push(...textos);
          } else {
            coms.push(...textos);
          }
        });
        setComentarios(coms);
        setSugerencias(sugs);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cursoId]);

  // Extrae textos legibles de cualquier estructura de contenido
  function extraerTextos(contenido) {
    if (!contenido) return [];
    if (typeof contenido === 'string') return [contenido];
    if (Array.isArray(contenido)) {
      return contenido.flatMap(item => {
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') return Object.values(item).filter(v => typeof v === 'string');
        return [];
      });
    }
    if (typeof contenido === 'object') {
      return Object.values(contenido).filter(v => typeof v === 'string');
    }
    return [];
  }

  const punteoFinal = evaluacion?.puntaje_curso ?? null;

  const getScoreColor = (score) => {
    if (score === null) return 'text-yellow-400';
    if (score >= 8) return 'text-yellow-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-yellow-400';
  };

  const iniciales = cursoDado?.DocenteNombre
    ?.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() ?? '?';

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse" />
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse" />
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
          <p className="font-bold mb-1">Error al cargar el curso</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">

      <div>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
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
            <h1 className="text-3xl font-bold mb-2">{cursoDado?.DocenteNombre ?? '—'}</h1>
            <p className="text-url-yellow font-semibold mb-4">
              {cursoDado?.CursosNombre ?? '—'} · Sección {cursoDado?.seccion ?? '—'}
            </p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold">
              {cursoDado?.SemestreStr ?? '—'}
            </span>
          </div>
        </div>

        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className={`text-5xl font-bold mb-1 ${getScoreColor(punteoFinal)}`}>
            {punteoFinal != null ? parseFloat(punteoFinal).toFixed(1) : '—'}
          </span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 flex-1">

        {/* Sugerencias */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-url-blue mb-6 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-url-yellow" /> Sugerencias del Sistema
          </h3>
          {sugerencias.length === 0 ? (
            <div className="flex-1 border-2 border-gray-200 bg-gray-50 p-8 rounded-xl text-gray-400 italic text-center flex items-center justify-center">
              Sin sugerencias registradas para este curso.
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {sugerencias.map((sug, i) => (
                <div key={i} className="flex-1 border-2 border-url-yellow bg-[#FFFAF0] p-6 rounded-xl text-gray-700 italic shadow-sm text-base leading-relaxed">
                  "{sug}"
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comentarios */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-url-blue mb-6 flex items-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-url-blue" /> Comentarios Relevantes
          </h3>
          {comentarios.length === 0 ? (
            <div className="flex-1 bg-gray-50 border border-gray-200 p-8 rounded-xl text-gray-400 italic text-center flex items-center justify-center">
              Sin comentarios registrados para este curso.
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1">
              {comentarios.map((comentario, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-xl text-gray-700 font-medium leading-relaxed ${
                    i === 0 ? 'border-2 border-url-blue bg-blue-50/50' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  "{comentario}"
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;