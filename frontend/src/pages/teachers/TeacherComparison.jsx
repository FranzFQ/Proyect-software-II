import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { detalleDocenteMarta } from '../../utils/mockData';
// Importamos los iconos de flechas
import { ChevronUpIcon, ChevronDownIcon, MinusIcon } from '@heroicons/react/24/outline';

const DocenteComparacion = () => {
  const navigate = useNavigate();
  const { id = 1 } = useParams();
  const docente = detalleDocenteMarta;

  return (
    <div className="flex flex-col gap-6">
      
      {/* BOTÓN VOLVER INTEGRADO */}
      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {docente.nombre}
        </button>
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-[#112240] font-serif">Comparativa — {docente.nombre}</h1>
        </div>
      </div>

      {/* DROPDOWNS ARREGLADOS (Visibles) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 text-[#112240] font-bold flex-wrap justify-center w-full md:w-auto">
           <span>Período de Comparación:</span>
           <select className="bg-[#8b9bb4] text-white font-semibold px-4 py-2 rounded-md outline-none border-none cursor-pointer">
             <option>Sem. I 2025</option>
           </select>
           <span className="text-url-yellow">VS</span>
           <select className="bg-[#112240] text-white font-semibold px-4 py-2 rounded-md outline-none border-none cursor-pointer">
             <option>Sem. II 2024</option>
           </select>
        </div>
        <button className="bg-url-yellow text-[#112240] px-8 py-2 rounded-md font-bold hover:bg-yellow-500 w-full md:w-auto transition-colors">
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
            <span className="text-gray-500 font-bold uppercase mb-4 text-center tracking-widest text-sm">SEM. II<br/>2024</span>
            <span className="text-8xl font-serif text-[#8b9bb4] mb-2">{docente.comparacion.anterior.punteo.toFixed(1)}</span>
            <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
            <span className="bg-[#e2e8f0] text-[#475569] border border-gray-300 px-8 py-2 rounded-lg font-bold text-sm">Anterior</span>
         </div>

         {/* GRÁFICAS DE BARRAS ARREGLADAS (Barra gris oscuro para contraste) */}
         <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <h4 className="text-[#112240] font-bold mb-6 text-lg">Comparativa por Criterio</h4>
            <div className="flex flex-col gap-4">
               {docente.comparacion.actual.desglose.map((item, idx) => {
                  const anterior = docente.comparacion.anterior.desglose[idx].score;
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-32 text-xs text-gray-600 text-right">{item.label}</span>
                      <div className="flex-1 flex flex-col gap-1 relative">
                         <div className="bg-[#112240] h-5 flex items-center justify-end pr-2 rounded-r-md shadow-sm" style={{width: `${item.score*10}%`}}>
                           <span className="text-xs text-white font-bold">{item.score}</span>
                         </div>
                         <div className="bg-[#cbd5e1] h-5 flex items-center justify-end pr-2 rounded-r-md shadow-sm" style={{width: `${anterior*10}%`}}>
                           <span className="text-xs text-gray-700 font-bold">{anterior}</span>
                         </div>
                      </div>
                    </div>
                  )
               })}
            </div>
            <div className="mt-8 flex justify-center gap-6 text-xs font-semibold text-gray-500">
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-[#112240] rounded-sm shadow-sm"></div> Actual (Sem. I 2025)</span>
               <span className="flex items-center gap-2"><div className="w-4 h-4 bg-[#cbd5e1] rounded-sm shadow-sm"></div> Anterior (Sem. II 2024)</span>
            </div>
         </div>

         <div className="bg-white border border-[#112240] rounded-xl p-8 shadow-sm flex flex-col items-center justify-center border-2 border-r-4 border-r-[#112240]">
            <span className="text-url-yellow font-bold uppercase mb-4 text-center tracking-widest text-sm">SEM. I<br/>2025</span>
            <span className="text-8xl font-serif text-[#112240] mb-2">{docente.comparacion.actual.punteo.toFixed(1)}</span>
            <span className="text-gray-400 mb-6 font-semibold">/ 10.0</span>
            <span className="bg-[#FFF4cc] text-[#B8860B] px-8 py-2 rounded-lg font-bold text-sm border border-[#FDE68A]">Actual ▲ {docente.comparacion.actual.variacionTotal}</span>
         </div>
      </div>

      {/* LÓGICA DE VARIACIONES EN TIEMPO REAL */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
         <h4 className="text-[#112240] font-bold mb-6 text-lg">Variación por Criterio:</h4>
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {docente.comparacion.actual.desglose.map((item, idx) => {
               // Parseamos la variación para saber si subió (+), bajó (-) o es igual
               const isPositive = item.variacion.includes('+');
               const isNegative = item.variacion.includes('-');
               
               let ColorClass = 'text-gray-400';
               let Icon = MinusIcon; // Línea recta si no hay variación
               
               if (isPositive) { ColorClass = 'text-green-500'; Icon = ChevronUpIcon; }
               if (isNegative) { ColorClass = 'text-red-500'; Icon = ChevronDownIcon; }

               return (
                 <div key={idx} className="flex flex-col gap-1">
                   <span className="text-xs font-semibold text-gray-500 leading-tight">{item.label}</span>
                   <span className={`text-3xl font-bold flex items-center gap-1 ${ColorClass}`}>
                     <Icon className="w-6 h-6 stroke-[4]" /> 
                     {/* Removemos el símbolo + o - del string ya que el ícono lo representa */}
                     {item.variacion.replace('+', '').replace('-', '')}
                   </span>
                 </div>
               )
            })}
         </div>
      </div>

    </div>
  );
};

export default DocenteComparacion;