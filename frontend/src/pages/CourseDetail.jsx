import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const CourseDetail = () => {
  const navigate = useNavigate();
  // El id del docente o el cursoId, el backend lo proveerá luego.
  const { id } = useParams(); 
  
  const curso = {
    nombreDocente: "Marta Alvarado Fuentes",
    iniciales: "MA",
    facultad: "Ingeniería de Sistemas",
    jornada: "Tiempo Completo",
    nombreCurso: "Estructuras de Datos",
    codigoCurso: "CS301",
    creditos: 3,
    punteoFinal: 9.3,
    comentarios: [
      "Excelente docente, explica con mucha claridad y está disponible para dudas.",
      "Buen manejo del tiempo, clase organizada con ejemplos prácticos.",
      "Las evaluaciones son justas respecto a lo que se enseña."
    ],
    sugerencia: "El docente cuenta con la experiencia y los conocimientos necesarios para impartir el curso. Mantiene una retroalimentación positiva por parte del alumnado."
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div>
        {/* Usamos navigate(-1) para retroceder en el historial (ideal para volver al semestre exacto) */}
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver
        </button>
      </div>

      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {curso.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{curso.nombreDocente}</h1>
            <p className="text-url-yellow font-semibold mb-4">{curso.facultad} · {curso.nombreCurso} ({curso.codigoCurso})</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold">
              Créditos de curso: {curso.creditos}
            </span>
          </div>
        </div>
        
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{curso.punteoFinal}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 flex-1">
        
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-[#112240] mb-6 flex items-center gap-2">
             <SparklesIcon className="w-6 h-6 text-url-yellow" /> Sugerencias del Sistema
          </h3>
          <div className="flex-1 border-2 border-url-yellow bg-[#FFFAF0] p-8 rounded-xl text-gray-700 italic shadow-sm text-lg leading-relaxed flex items-center">
            "{curso.sugerencia}"
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col">
           <h3 className="text-xl font-bold text-[#112240] mb-6 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-url-blue" /> Comentarios Relevantes
           </h3>
           <div className="flex flex-col gap-4 flex-1">
             {curso.comentarios.map((comentario, index) => (
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