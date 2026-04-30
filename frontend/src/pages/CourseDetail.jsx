import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { getCursosDados, getEvaluacionesCurso, getAnalisisTexto } from '../services/evaluaciones_service';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { id, cursoId } = useParams(); // id is docente_id, cursoId is curso_id
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Obtener detalles del curso dado (asignación)
        // Buscamos el CursoDado específico para este docente y curso
        const cursosDados = await getCursosDados({ docente: id, curso: cursoId });
        
        if (cursosDados.length === 0) {
          throw new Error("No se encontró la información de este curso para el docente.");
        }

        const cursoDado = cursosDados[0]; // Tomamos el primero/más reciente

        // 2. Obtener evaluaciones (punteos)
        const evaluaciones = await getEvaluacionesCurso({ curso_dado: cursoDado.id });
        // Calculamos el promedio de los criterios para el punteo final
        const punteoFinal = evaluaciones.length > 0 
          ? (evaluaciones.reduce((acc, curr) => acc + curr.puntaje_curso, 0) / evaluaciones.length).toFixed(1)
          : "N/A";

        // 3. Obtener comentarios (Análisis de Texto)
        const analisis = await getAnalisisTexto({ curso_dado: cursoDado.id, tipo__nombre: 'COMENTARIOS' });
        // Unimos todos los contenidos si hay múltiples entradas
        const comentarios = analisis.flatMap(a => a.contenido);

        setData({
          nombreDocente: cursoDado.docente_nombre || cursoDado.docente.nombre_completo,
          iniciales: (cursoDado.docente_nombre || cursoDado.docente.nombre_completo).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
          facultad: cursoDado.docente.facultad_nombre || "Facultad de Ingeniería",
          jornada: cursoDado.jornada || "N/A",
          nombreCurso: cursoDado.curso_nombre || cursoDado.curso.nombre_curso,
          codigoCurso: cursoDado.curso.id, // O código si existe en el modelo
          creditos: cursoDado.curso.creditos || 0,
          punteoFinal: punteoFinal,
          comentarios: comentarios.length > 0 ? comentarios : ["No hay comentarios registrados para este curso aún."],
          sugerencia: cursoDado.resumen_ia || "El sistema aún no ha generado una sugerencia automatizada para este docente en este curso."
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

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles del curso...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver
        </button>
      </div>

      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {data.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{data.nombreDocente}</h1>
            <p className="text-url-yellow font-semibold mb-4">{data.facultad} · {data.nombreCurso}</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold">
              Créditos de curso: {data.creditos}
            </span>
          </div>
        </div>
        
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{data.punteoFinal}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 flex-1">
        
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-[#112240] mb-6 flex items-center gap-2">
             <SparklesIcon className="w-6 h-6 text-url-yellow" /> Sugerencias del Sistema
          </h3>
          <div className="flex-1 border-2 border-url-yellow bg-[#FFFAF0] p-8 rounded-xl text-gray-700 italic shadow-sm text-lg leading-relaxed flex items-center">
            "{data.sugerencia}"
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
           <h3 className="text-xl font-bold text-[#112240] mb-6 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-url-blue" /> Comentarios Relevantes
           </h3>
           <div className="flex flex-col gap-4 flex-1 max-h-[500px] overflow-y-auto pr-2">
             {data.comentarios.map((comentario, index) => (
               <div key={index} className={`p-6 rounded-xl text-gray-700 font-medium leading-relaxed ${index === 0 ? 'border-2 border-url-blue bg-blue-50/50' : 'bg-gray-50 border border-gray-200'}`}>
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