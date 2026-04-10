import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const CursoDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID del docente para regresar
  
  // Datos simulados (En backend esto se pediría con el useParams() )
  const curso = {
    nombreDocente: "Marta Alvarado Fuentes",
    iniciales: "MA",
    facultad: "Ingeniería de Sistemas",
    jornada: "Tiempo Completo",
    nombreCurso: "Estructuras de Datos",
    codigoCurso: "CS301",
    creditos: 3,
    punteoFinal: 9.3,
    desglose: [
      { label: 'Eval. Estudiantes', score: 9.6 },
      { label: 'Autoevaluación', score: 9.8 },
      { label: 'Coordinador', score: 9.0 },
      { label: 'Checklist', score: 8.8 }
    ],
    comentarios: [
      "Excelente docente, explica con mucha claridad y está disponible para dudas.",
      "Buen manejo del tiempo, clase organizada con ejemplos prácticos.",
      "Podría mejorar el material, pero su explicación oral es muy efectiva."
    ],
    sugerencia: "El docente cuenta con la experiencia y los conocimientos necesarios para impartir el curso."
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Navegación Superior */}
      <div>
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver al Perfil de Marta Alvarado
        </button>
      </div>

      {/* HEADER AZUL (Idéntico al Mockup) */}
      <div className="bg-url-blue rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {curso.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{curso.nombreDocente}</h1>
            <p className="text-url-yellow font-semibold mb-4">{curso.facultad} · {curso.jornada}</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold">
              Créditos: {curso.creditos}
            </span>
          </div>
        </div>
        
        {/* Recuadro Amarillo de Puntuación Final */}
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{curso.punteoFinal}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      {/* CONTENIDO INFERIOR: 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        {/* Columna Izquierda: Gráficas y Sugerencias */}
        <div className="flex flex-col gap-6">
          
          {/* Tarjeta de Barras */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#112240] mb-6 flex items-center gap-2">
              📊 Ponderaciones {curso.nombreCurso}
            </h3>
            <div className="flex flex-col gap-5">
              {curso.desglose.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-gray-500 font-semibold text-right">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-r-md h-5 relative flex items-center">
                    <div 
                      // Alternamos colores para que se vea como el mockup (Amarillo y Azul Oscuro)
                      className={`h-5 rounded-r-md ${idx % 2 === 0 ? 'bg-url-yellow' : 'bg-[#112240]'}`} 
                      style={{ width: `${item.score * 10}%` }}
                    ></div>
                  </div>
                  <span className="w-8 font-bold text-[#112240]">{item.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta de Sugerencias */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#112240] mb-4 flex items-center gap-2">
               <SparklesIcon className="w-5 h-5 text-gray-400" /> Sugerencias
            </h3>
            <div className="border border-url-yellow bg-[#FFFAF0] p-6 rounded-lg text-gray-700 italic shadow-sm">
              "{curso.sugerencia}"
            </div>
          </div>
        </div>

        {/* Columna Derecha: Comentarios */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm h-full">
           <h3 className="text-lg font-bold text-[#112240] mb-6 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400" /> comentarios
           </h3>
           <div className="flex flex-col gap-4">
             {curso.comentarios.map((comentario, index) => (
               <div 
                  key={index} 
                  // Alternar bordes/colores según el mockup
                  className={`p-6 rounded-lg text-gray-600 text-sm leading-relaxed ${index === 0 ? 'border border-url-yellow bg-white' : 'bg-gray-100 border border-gray-200'}`}
               >
                 "{comentario}"
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default CursoDetalle;