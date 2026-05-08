import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getCursoDadoById, getEvaluacionesCurso, getAnalisisTexto, getEvaluaciones } from '../services/evaluaciones_service';
import Button from '../components/common/Button';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id, cursoId } = useParams(); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [evaluaciones, setEvaluaciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Obtener detalles del curso dado (asignación) directamente por su ID
        const cursoDado = await getCursoDadoById(cursoId);
        
        if (!cursoDado) {
          throw new Error("No se encontró la información de este curso para el docente.");
        }

        // 2. Obtener evaluaciones (punteos)
        const evalsData = await getEvaluacionesCurso({ curso_dado: cursoDado.id });
        setEvaluaciones(evalsData);

        let evaluacion = await getEvaluaciones({ docente: cursoDado.docente });
        evaluacion = evaluacion[0]
        console.log("Evaluación general del docente:", evaluacion);

        // Calculamos el promedio de los criterios para el punteo final
        const punteoFinal = evalsData.length > 0 
          ? (evalsData.reduce((acc, curr) => acc + curr.puntaje_curso, 0) / evalsData.length).toFixed(1)
          : "N/A";

        const analisis = await getAnalisisTexto({ curso_dado: cursoDado.id, tipo__nombre: 'COMENTARIOS' });
        const comentarios = analisis.flatMap(a => a.contenido);

        setData({
          nombreDocente: cursoDado.DocenteNombre,
          iniciales: (cursoDado.DocenteNombre || "").split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          facultad: cursoDado.FacultadNombre || "Facultad de Ingeniería",
          jornada: cursoDado.jornada || "N/A",
          nombreCurso: cursoDado.CursosNombre,
          codigoCurso: cursoDado.curso, 
          creditos: cursoDado.CreditosCurso || 0,
          punteoFinal: punteoFinal,
          comentarios: comentarios.length > 0 ? comentarios : ["No hay comentarios registrados para este curso aún."],
          sugerencia: evaluacion.resumen_ia || "El sistema aún no ha generado una sugerencia automatizada para este docente en este curso."
        });

      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, cursoId]);

  const mapping = {
    'Evaluaciones Estudiantes': 'Estudiantil',
    'Capacitaciones CEAT':       'CEAT',
    'Autoevaluaciones':          'Autoevaluación',
    'Control Docente':           'Coordinador',
    'Criterios de Coordinador':  'Coordinador',
    'Checklist':                 'visitas',
    'Apoyo y Colaboración':      'Apoyo'
  };

  if (loading) return <div className="p-12 animate-pulse text-[#112240] font-bold text-center">Cargando detalles del curso...</div>;
  if (error) return <div className="p-12 text-red-500 font-bold text-center">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-10">
      
      {/* Botón Volver */}
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          <ArrowLeftIcon className="w-4 h-4"/> Volver
        </button>
      </div>

      {/* Encabezado Blanco Estandarizado */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 truncate">
          <div className="w-24 h-24 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-4xl font-serif font-black text-url-blue shadow-sm shrink-0">
            {data.iniciales}
          </div>
          <div className="flex-1 truncate">
            <p className="text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">
              {data.facultad}
            </p>
            <h1 className="text-3xl font-black text-[#112240] mb-1 truncate">{data.nombreDocente}</h1>
            <p className="text-gray-500 font-medium text-sm">
              Curso: {data.nombreCurso}
            </p>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-blue-50 text-url-blue border border-blue-100 px-4 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
                Créditos: {data.creditos}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:items-end w-full lg:w-auto gap-5 shrink-0">
          <div className="flex flex-col lg:items-end bg-gray-50 px-6 py-4 rounded-xl border border-gray-100 relative pt-1 overflow-hidden">
            <span className="text-5xl font-black text-url-blue leading-none">
              {data.punteoFinal}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Punteo Final</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE DESGLOSE DE PUNTEOS */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h3 className="text-xl font-bold text-[#112240] mb-6 flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-6 h-6 text-url-blue" /> Desglose de Punteos del Curso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluaciones.length > 0 ? (
            evaluaciones.map((evaluacion) => (
              <div key={evaluacion.id} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:bg-white hover:border-url-blue transition-all">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {mapping[evaluacion.CriterioNombre] || evaluacion.CriterioNombre || 'Evaluación'}
                </span>
                <span className="text-3xl font-serif font-bold text-url-blue">{evaluacion.puntaje_curso}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-400 italic">
              No hay evaluaciones detalladas para este curso.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 flex-1">
        
        {/* Sugerencias IA */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-[#112240] mb-4 flex items-center gap-2">
             <SparklesIcon className="w-6 h-6 text-url-yellow" /> Sugerencias del Sistema
          </h3>
          <div className="flex-1 bg-[#FFFAF0] border border-yellow-200 p-6 rounded-xl text-gray-700 italic shadow-inner text-base leading-relaxed flex items-center">
            "{data.sugerencia}"
          </div>
        </div>

        {/* Comentarios */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
           <h3 className="text-lg font-bold text-[#112240] mb-4 flex items-center gap-2 shrink-0">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-url-blue" /> Comentarios Relevantes
           </h3>
           <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
             {data.comentarios.map((comentario, index) => (
               <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-sm font-medium leading-relaxed">
                 "{comentario}"
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;
