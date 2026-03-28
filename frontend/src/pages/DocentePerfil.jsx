// src/pages/DocentePerfil.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detalleDocenteMarta } from '../utils/mockData';
import { CheckCircleIcon, MinusCircleIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

const DocentePerfil = () => {
  const navigate = useNavigate();
  const docente = detalleDocenteMarta;

  const [activeTab, setActiveTab] = useState('actuales');
  const [expandedCourse, setExpandedCourse] = useState(null); // Histórico
  const [expandedActualCourse, setExpandedActualCourse] = useState(null); // Cursos Actuales
  const [selectedVisita, setSelectedVisita] = useState(null); // Checklist/Visitas

  // Componente reutilizable para mostrar detalles (IA y Desglose) de un curso expandido
  const CourseDetails = ({ curso }) => (
    <div className="border-t border-gray-100 bg-gray-50 p-6 flex flex-col gap-6 w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h5 className="font-bold text-url-blue mb-4">Desglose de Ponderación del Curso</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded text-center border border-gray-100">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Estudiante</span>
            <span className="text-lg font-bold text-url-blue">{curso.desglose.estudiante}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center border border-gray-100">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">CEAT</span>
            <span className="text-lg font-bold text-url-blue">{curso.desglose.ceat}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center border border-gray-100">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Autoeval.</span>
            <span className="text-lg font-bold text-url-blue">{curso.desglose.auto}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded text-center border border-gray-100">
            <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Coordinador</span>
            <span className="text-lg font-bold text-url-blue">{curso.desglose.coord}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 text-url-blue"><SparklesIcon className="w-16 h-16"/></div>
          <h5 className="font-bold text-url-blue mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-url-yellow" /> Sugerencias de Mejora (IA)
          </h5>
          <p className="text-sm text-gray-600 leading-relaxed relative z-10 italic">
            "El área de oportunidad detectada por el modelo predictivo se concentra en la actualización de material didáctico. Se sugiere integrar herramientas interactivas."
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h5 className="font-bold text-url-blue mb-3 flex items-center gap-2">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400" /> Comentarios Relevantes
          </h5>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
            <li>"Excelente dominio del tema, pero las tareas son muy largas."</li>
            <li>"Falta retroalimentación rápida en los exámenes."</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderCursosActuales = () => (
    <div className="mt-8 flex flex-col gap-6">
      <h3 className="font-bold text-lg text-url-blue">Cursos impartidos durante el semestre actual</h3>
      {docente.cursosActuales.map(curso => {
        const isExpanded = expandedActualCourse === curso.id;
        return (
          <div key={curso.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all">
            <div className="h-2 bg-url-yellow w-full"></div>
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-url-blue text-white">
              <div className="flex-1 w-full">
                <h4 className="text-2xl font-bold text-white mb-1">{curso.nombre}</h4>
                <p className="text-gray-300 text-sm">Estado: {curso.estado}</p>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <span className="block text-sm text-gray-300 font-semibold mb-1">Puntuación</span>
                  <span className="text-4xl font-serif font-bold text-url-yellow">{curso.score}</span>
                </div>
                <button 
                  onClick={() => setExpandedActualCourse(isExpanded ? null : curso.id)}
                  className="text-url-yellow hover:text-white px-4 py-2 font-semibold text-sm transition flex items-center gap-2"
                >
                  {isExpanded ? 'Ocultar Detalles' : 'Ver más Detalles'}
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isExpanded && <CourseDetails curso={curso} />}
          </div>
        );
      })}
    </div>
  );

  const renderHistorico = () => (
    <div className="mt-8 flex flex-col gap-6">
      <h3 className="font-bold text-lg text-url-blue">Histórico de Cursos Impartidos</h3>
      {docente.historicoCursos.map((curso) => {
        const isExpanded = expandedCourse === curso.id;
        return (
          <div key={curso.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all">
            <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <p className="text-url-yellow font-bold text-sm mb-1">{curso.semestre}</p>
                <h4 className="text-xl font-bold text-url-blue">{curso.nombreCurso}</h4>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Puntuación</span>
                  <span className="text-2xl font-bold text-url-blue">{curso.score}</span>
                </div>
                <button 
                  onClick={() => setExpandedCourse(isExpanded ? null : curso.id)}
                  className="bg-url-blue text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-800 transition flex items-center gap-2"
                >
                  {isExpanded ? 'Ocultar Detalles' : 'Ver más Detalles'}
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {isExpanded && <CourseDetails curso={curso} />}
          </div>
        );
      })}
    </div>
  );

  const renderChecklist = () => {
    if (selectedVisita) {
      return (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
             <div>
               <button onClick={() => setSelectedVisita(null)} className="text-gray-500 hover:text-url-blue text-sm font-semibold flex items-center gap-1 mb-4 transition">&larr; Volver a Visitas</button>
               <h3 className="font-bold text-xl text-url-blue">Criterios de Evaluacion</h3>
             </div>
             <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-md font-bold text-sm">5 completados</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              {docente.checklistData.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    {item.estado === 'cumple' && <CheckCircleIcon className="w-6 h-6 text-status-success" />}
                    {item.estado === 'regular' && <CheckCircleIcon className="w-6 h-6 text-url-yellow" />}
                    {item.estado === 'n/a' && <MinusCircleIcon className="w-6 h-6 text-gray-300" />}
                    <span className="font-semibold text-url-blue">{item.descripcion}</span>
                  </div>
                  <span className={`px-4 py-1 rounded-md text-sm font-bold border 
                    ${item.estado === 'cumple' ? 'bg-green-50 text-green-600 border-green-200' : 
                      item.estado === 'regular' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                      'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {item.nota}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full md:w-1/3">
               <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg h-full">
                  <p className="font-bold text-url-blue mb-2">Observaciones generales:</p>
                  <p className="text-gray-500 text-sm italic">"Docente muy bien preparada. Mantiene la atención de los estudiantes."</p>
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {docente.visitas.map(visita => (
           <div key={visita.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-xl text-url-blue mb-2">{visita.titulo}</h4>
                    <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-md font-bold">{visita.fecha}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-url-yellow leading-none">{visita.score}</span>
                    <span className="block text-sm text-gray-400 font-semibold mt-1">/10</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{visita.curso}</p>
              </div>
              <button onClick={() => setSelectedVisita(visita)} className="bg-url-blue text-white w-full py-3 font-bold hover:bg-blue-900 transition flex justify-center items-center gap-2">
                Ver detalle
              </button>
           </div>
        ))}
      </div>
    );
  };

  const renderComparacion = () => (
    <div className="mt-8 flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 text-url-blue font-bold flex-wrap justify-center">
           <span>Período de Comparación:</span>
           <select className="bg-gray-400 text-white px-4 py-2 rounded-md outline-none"><option>Sem. I 2025</option></select>
           <span className="text-url-yellow">VS</span>
           <select className="bg-url-blue text-white px-4 py-2 rounded-md outline-none"><option>Sem. II 2024</option></select>
        </div>
        <button className="bg-url-yellow text-url-blue px-8 py-2 rounded-md font-bold hover:bg-yellow-500 w-full md:w-auto">Actualizar</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
            <span className="text-gray-500 font-bold uppercase mb-4 text-center tracking-widest">SEM. II<br/>2024</span>
            <span className="text-7xl font-serif text-gray-400 mb-2">{docente.comparacion.anterior.punteo.toFixed(1)}</span>
            <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
            <span className="bg-gray-200 text-gray-600 border border-gray-300 px-8 py-1.5 rounded-md font-bold text-sm">Anterior</span>
         </div>

         <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h4 className="text-url-blue font-bold mb-6 text-lg">Comparativa por Criterio</h4>
            <div className="flex flex-col gap-4">
               {docente.comparacion.actual.desglose.map((item, idx) => {
                  const anterior = docente.comparacion.anterior.desglose[idx].score;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-32 text-xs text-gray-600 text-right">{item.label}</span>
                      <div className="flex-1 flex flex-col gap-1 relative">
                         <div className="bg-url-blue h-4 flex items-center justify-end pr-2 rounded-r-md" style={{width: `${item.score*10}%`}}>
                           <span className="text-[10px] text-white font-bold">{item.score}</span>
                         </div>
                         <div className="bg-gray-200 h-4 flex items-center justify-end pr-2 rounded-r-md" style={{width: `${anterior*10}%`}}>
                           <span className="text-[10px] text-gray-500 font-bold">{anterior}</span>
                         </div>
                      </div>
                    </div>
                  )
               })}
            </div>
            <div className="mt-8 flex justify-center gap-6 text-xs font-semibold text-gray-500">
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-url-blue rounded-sm"></div> Actual (Sem. I 2025)</span>
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded-sm"></div> Anterior (Sem. II 2024)</span>
            </div>
         </div>

         <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center border-x-4 border-x-url-blue">
            <span className="text-url-yellow font-bold uppercase mb-4 text-center tracking-widest">SEM. I<br/>2025</span>
            <span className="text-8xl font-serif text-url-blue mb-2">{docente.comparacion.actual.punteo.toFixed(1)}</span>
            <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
            <span className="bg-[#FFF4cc] text-[#B8860B] px-6 py-1.5 rounded-md font-bold text-sm border border-[#FDE68A]">Actual ▲ {docente.comparacion.actual.variacionTotal}</span>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
         <h4 className="text-url-blue font-bold mb-6 text-lg">Variación por Criterio:</h4>
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {docente.comparacion.actual.desglose.map((item, idx) => (
               <div key={idx} className="flex flex-col gap-1">
                 <span className="text-xs font-semibold text-gray-500 leading-tight">{item.label}</span>
                 <span className="text-3xl font-bold text-status-success flex items-center gap-1">
                   <ChevronUpIcon className="w-6 h-6 stroke-[3]" /> {item.variacion}
                 </span>
               </div>
            ))}
         </div>
      </div>

    </div>
  );

  return (
    <div className="flex flex-col gap-0">
      
      <div className="mb-4">
        <button onClick={() => navigate('/docentes')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver a Docentes
        </button>
      </div>

      <div className="bg-url-blue rounded-t-xl p-8 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-bold shadow-lg">
            {docente.iniciales}
          </div>
          <div>
            <p className="text-url-yellow text-sm mb-1 font-semibold">Semestre I - año 2025</p>
            <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
            <p className="text-gray-300 text-sm">{docente.codigo} · {docente.facultad}</p>
            <div className="flex gap-4 mt-4">
              <span className="bg-url-yellow text-url-blue px-4 py-1.5 rounded-md text-sm font-bold">
                Créditos totales: {docente.creditosTotales}
              </span>
              <span className="border border-white/30 text-white px-4 py-1.5 rounded-md text-sm">
                {docente.totalCursos} cursos activos
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 md:mt-0 justify-end">
          {docente.ponderacionesActuales.map((item, idx) => (
            <div key={idx} className={`border-2 rounded-xl flex flex-col items-center justify-center w-24 h-24 ${idx === 5 ? 'border-url-yellow' : 'border-white/20'}`}>
              <span className={`text-2xl font-bold ${idx === 5 ? 'text-url-yellow' : 'text-white'}`}>{item.score}</span>
              <span className="text-[10px] text-gray-300 text-center leading-tight px-1 mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white px-8 py-3 rounded-b-xl shadow-sm flex flex-wrap justify-end gap-2 border-b border-x border-gray-200">
        <button onClick={() => setActiveTab('actuales')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'actuales' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Cursos Actuales</button>
        <button onClick={() => setActiveTab('checklist')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'checklist' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Checklists</button>
        <button onClick={() => setActiveTab('historico')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'historico' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Histórico</button>
        <button onClick={() => setActiveTab('comparacion')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'comparacion' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Comparación</button>
      </div>

      {activeTab === 'actuales' && renderCursosActuales()}
      {activeTab === 'historico' && renderHistorico()}
      {activeTab === 'checklist' && renderChecklist()}
      {activeTab === 'comparacion' && renderComparacion()}

    </div>
  );
};

export default DocentePerfil;