import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { detalleCoordinador } from '../utils/mockData';
import { SparklesIcon } from '@heroicons/react/24/outline';

const CoordinadorPerfil = () => {
  const navigate = useNavigate();
  const coord = detalleCoordinador;
  const [activeTab, setActiveTab] = useState('docentes');

  const renderEstado = (estado) => {
    const colores = {
      'Excelente': 'bg-green-100 text-green-700 border-green-200',
      'Buena': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Deficiente': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${colores[estado] || 'bg-gray-100'}`}>
        {estado}
      </span>
    );
  };

  const renderDocentesACargo = () => (
    <div className="mt-8">
      <h3 className="font-bold text-lg text-url-blue mb-4">Docentes Evaluados por Coordinador</h3>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#112240] text-white">
            <tr>
              <th className="py-4 px-6 font-semibold text-sm">Docente</th>
              <th className="py-4 px-6 font-semibold text-sm text-center">Cursos Evaluados</th>
              <th className="py-4 px-6 font-semibold text-sm text-center">Promedio General</th>
              <th className="py-4 px-6 font-semibold text-sm text-center">Estado de Evaluación</th>
            </tr>
          </thead>
          <tbody>
            {coord.docentes.map((docente, index) => (
              <tr key={docente.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="py-4 px-6">
                  <div>
                    <h4 className="font-bold text-url-blue">{docente.nombre}</h4>
                    <p className="text-xs text-gray-400">{docente.codigo}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-center text-url-blue font-semibold">{docente.cursos}</td>
                <td className="py-4 px-6 text-center text-gray-600 font-bold text-lg">{docente.score}</td>
                <td className="py-4 px-6 text-center">{renderEstado(docente.estado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-0">
      
      <div className="mb-4">
        <button onClick={() => navigate('/coordinadores')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver a Coordinadores
        </button>
      </div>

      <div className="bg-url-blue rounded-t-xl p-8 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-bold shadow-lg">
            {coord.iniciales}
          </div>
          <div>
            <p className="text-url-yellow text-sm mb-1 font-semibold">Semestre I - año 2025</p>
            <h1 className="text-3xl font-serif font-bold mb-2">{coord.nombre}</h1>
            <p className="text-gray-300 text-sm">{coord.codigo} · {coord.facultad}</p>
            <div className="flex gap-4 mt-4">
              <span className="bg-url-yellow text-url-blue px-4 py-1.5 rounded-md text-sm font-bold">
                {coord.docentesACargo} Docentes a cargo
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 md:mt-0 justify-end">
          {coord.metricas.map((item, idx) => (
            <div key={idx} className="border-2 border-white/20 rounded-xl flex flex-col items-center justify-center w-24 h-24">
              <span className="text-2xl font-bold text-white">{item.score}</span>
              <span className="text-[10px] text-gray-300 text-center leading-tight px-1 mt-1">{item.icon} {item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white px-8 py-3 rounded-b-xl shadow-sm flex flex-wrap justify-end gap-2 border-b border-x border-gray-200">
        <button onClick={() => setActiveTab('docentes')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'docentes' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Docentes a Cargo</button>
        <button onClick={() => setActiveTab('historico')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'historico' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Histórico</button>
        <button onClick={() => setActiveTab('comparacion')} className={`px-6 py-2 rounded-md font-bold text-sm transition ${activeTab === 'comparacion' ? 'bg-url-yellow text-url-blue shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>Comparación</button>
      </div>

      {activeTab === 'docentes' && renderDocentesACargo()}
      {activeTab === 'historico' && (
         <div className="mt-8 text-center text-gray-400">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold">Histórico del Coordinador</h3>
          <p>Esta vista mostrará el registro del coordinador en semestres anteriores.</p>
        </div>
      )}
      {activeTab === 'comparacion' && (
         <div className="mt-8 text-center text-gray-400">
          <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold">Módulo de Comparación</h3>
          <p>Esta vista comparará al coordinador actual contra otros o contra sus gestiones pasadas.</p>
        </div>
      )}

    </div>
  );
};

export default CoordinadorPerfil;