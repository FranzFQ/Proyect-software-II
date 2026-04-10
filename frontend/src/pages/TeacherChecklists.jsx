import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { detalleDocenteMarta } from '../utils/mockData';
import { CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';

const DocenteChecklists = () => {
  const navigate = useNavigate();
  const { id = 1 } = useParams();
  const docente = detalleDocenteMarta;

  const [selectedVisita, setSelectedVisita] = useState(null);

  // VISTA 1: Lista de Visitas
  if (!selectedVisita) {
    return (
      // Agregamos min-h para empujar la paginación
      <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
        <div>
          <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
            &larr; Visitas / Resultados — {docente.nombre}
          </button>
        </div>

        <div className="bg-[#112240] rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
              {docente.iniciales}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
              <p className="text-url-yellow font-semibold mb-4">{docente.facultad} · Checklists</p>
              <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
                Total de checklists: {docente.visitas.length}
              </span>
            </div>
          </div>
          <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
            <span className="text-5xl font-serif font-bold text-url-yellow mb-1">8.8</span>
            <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {docente.visitas.map(visita => (
             <div key={visita.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200 border-l-[12px] border-l-url-yellow">
                <div className="p-6 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl text-[#112240] mb-2">{visita.titulo}</h4>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-url-yellow leading-none">{visita.score}</span>
                      <span className="text-sm text-gray-400 font-semibold ml-1">/10</span>
                    </div>
                  </div>
                  <span className="bg-[#e2e8f0] text-[#475569] text-xs px-6 py-1.5 rounded-full font-bold inline-block mb-4 border border-gray-300">{visita.fecha}</span>
                  <p className="text-sm text-gray-500 mb-4">{visita.curso}</p>
                </div>
                <div className="p-6 pt-0">
                  <button onClick={() => setSelectedVisita(visita)} className="bg-[#112240] text-white w-full py-3 font-bold hover:bg-blue-900 transition rounded-md text-sm">
                    Ver detalle
                  </button>
                </div>
             </div>
          ))}
        </div>

        {/* PAGINACIÓN AL FONDO */}
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-gray-500 font-semibold gap-2">
           <span className="text-[#112240] font-bold text-lg">1</span>
           <button className="hover:text-url-blue transition-colors">2</button>
           <button className="hover:text-url-blue transition-colors">3</button>
           <span>.......</span>
           <button className="hover:text-url-blue transition-colors">20</button>
           <button className="hover:text-url-blue ml-2 transition-colors">Siguiente -&gt;</button>
        </div>

      </div>
    );
  }

  // VISTA 2: Detalle de una Visita específica (Sin cambios)
  return (
    <div className="flex flex-col gap-6">
      <div>
        <button onClick={() => setSelectedVisita(null)} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
          &larr; Visitas / {selectedVisita.titulo} / Detalles de checklist
        </button>
      </div>

      <div className="bg-[#112240] rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {docente.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
            <p className="text-url-yellow font-semibold mb-4">Checklist · {selectedVisita.fecha}</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
              Total de criterios: {docente.checklistData.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{selectedVisita.score}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        
        {/* Tabla de Criterios (Columna Izquierda) */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-xl text-[#112240]">Criterios de Evaluacion</h3>
            <span className="bg-green-100 text-green-700 px-6 py-1.5 rounded-full font-bold text-sm border border-green-200">5 completados</span>
          </div>
          
          <div className="flex flex-col gap-6">
            {docente.checklistData.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  {item.estado === 'cumple' && <CheckCircleIcon className="w-8 h-8 text-green-500" />}
                  {item.estado === 'regular' && <CheckCircleIcon className="w-8 h-8 text-url-yellow" />}
                  {item.estado === 'n/a' && <MinusCircleIcon className="w-8 h-8 text-gray-300" />}
                  <span className="font-bold text-[#112240] text-[15px]">{item.descripcion}</span>
                </div>
                <span className={`px-6 py-1.5 rounded-md text-sm font-bold border 
                  ${item.estado === 'cumple' ? 'bg-green-50 text-green-600 border-green-200' : 
                    item.estado === 'regular' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 
                    'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {item.nota}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones (Columna Derecha) */}
        <div className="w-full lg:w-1/3">
           <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full">
              <p className="font-bold text-[#112240] mb-4">Observaciones generales:</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-32">
                <p className="text-gray-400 text-sm">Docente muy bien preparada...</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteChecklists;