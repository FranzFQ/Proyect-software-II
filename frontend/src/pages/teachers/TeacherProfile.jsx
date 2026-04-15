import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listaDocentesGlobal } from '../../utils/mockData';
import { detalleDocenteMarta } from '../../utils/mockData';
import Button from '../../components/common/Button';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { id = 1, semesterId } = useParams(); 
  const docente = detalleDocenteMarta;

  const isHistorical = !!semesterId;
  const currentData = isHistorical 
    ? docente.semestresHistoricos.find(s => s.id === semesterId) || docente.semestreActual
    : docente.semestreActual;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(currentData.cursos.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentCourses = currentData.cursos.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  // Reseteamos la paginación si cambia el semestre que estamos viendo
const [prevSemesterId, setPrevSemesterId] = useState(semesterId);
  if (semesterId !== prevSemesterId) {
    setCurrentPage(1);
    setPrevSemesterId(semesterId);
  }
  const getColorEstado = (estado) => {
    if (estado === 'Excelente') return 'bg-green-500';
    if (estado === 'Buena') return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(isHistorical ? `/teachers/${id}/history` : '/teachers')} 
          className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition"
        >
          &larr; Volver a {isHistorical ? 'Histórico de Semestres' : 'Docentes'}
        </button>

        {/* BOTÓN PARA VOLVER AL SEMESTRE ACTUAL (Solo visible en Histórico) */}
        {isHistorical && (
           <Button 
             variant="primary" 
             onClick={() => navigate(`/teachers/${id}`)} 
             className="px-6 py-3 text-lg font-bold flex items-center gap-2 shadow-md"
           >
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
            <div className={`w-24 h-24 text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-bold shadow-lg shrink-0 ${isHistorical ? 'bg-gray-300' : 'bg-url-yellow'}`}>
              {docente.iniciales}
            </div>
            <div>
              <p className={`${isHistorical ? 'text-gray-300' : 'text-url-yellow'} text-sm mb-1 font-semibold`}>
                {currentData.nombre || currentData.label}
              </p>
              <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
              <p className="text-gray-300 text-sm">{docente.codigo} · {docente.departamento || docente.facultad}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className={`${isHistorical ? 'bg-gray-600 text-white' : 'bg-url-yellow text-url-blue'} px-4 py-1.5 rounded-md text-sm font-bold`}>Créditos totales: {currentData.creditosTotales || 0}</span>
                <span className="border border-white/30 text-white px-4 py-1.5 rounded-md text-sm font-semibold">{currentData.cursos.length} cursos impartidos</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end w-full lg:w-auto">
            {currentData.ponderacionesActuales?.map((item, idx) => (
              <div key={idx} className={`border-2 rounded-xl flex flex-col items-center justify-center w-[5.5rem] h-24 ${isHistorical ? 'border-gray-400 bg-gray-800/50 text-gray-300' : 'border-url-yellow bg-blue-900/20 text-url-yellow'}`}>
                <span className="text-2xl font-bold">{item.score || item.valor}</span>
                <span className="text-[9px] text-center leading-tight px-1 mt-1 font-semibold uppercase">{item.label || item.nombre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONERA DE PESTAÑAS */}
        <div className="flex flex-wrap justify-end gap-4 px-8 mt-6 pb-6">
          {/* El botón de Checklists SIEMPRE se muestra (incluso en histórico) */}
          <button 
            onClick={() => navigate(`/teachers/${id}/checklists`)} 
            className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-[#112240] hover:bg-yellow-500 transition-colors shadow-sm"
          >
            Checklists
          </button>
          
          {/* Histórico y Comparación solo se muestran en el semestre actual */}
          {!isHistorical && (
            <>
              <button 
                onClick={() => navigate(`/teachers/${id}/history`)} 
                className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-[#112240] hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Histórico
              </button>
              <button 
                onClick={() => navigate(`/teachers/${id}/comparison`)} 
                className="px-8 py-2.5 rounded-md font-bold text-sm bg-url-yellow text-[#112240] hover:bg-yellow-500 transition-colors shadow-sm"
              >
                Comparación
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6 flex-1">
        <h3 className="font-bold text-lg text-[#112240]">Cursos impartidos ({currentData.nombre || currentData.label})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCourses.map(curso => (
            <div key={curso.id || curso.codigo} className="bg-[#112240] rounded-xl overflow-hidden shadow-md flex flex-col h-48">
              <div className={`h-3 w-full ${getColorEstado(curso.estado || 'Buena')}`}></div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xl leading-tight line-clamp-2 mb-2">{curso.nombre}</h4>
                  <p className="text-gray-400 text-xs mb-1">{curso.estado || 'Finalizado'}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-url-yellow text-4xl font-serif font-bold leading-none">{curso.score || curso.punteoFinal}</span>
                  <button onClick={() => navigate(`/teachers/${id}/course/${curso.id || curso.codigo}`)} className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                    Ver Detalles &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-[#112240] font-bold gap-4">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={safeCurrentPage === 1}
               className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
             >
               &larr; Anterior
             </button>
             <span>Página {safeCurrentPage} de {totalPages}</span>
             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={safeCurrentPage === totalPages}
               className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
             >
               Siguiente &rarr;
             </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherProfile;