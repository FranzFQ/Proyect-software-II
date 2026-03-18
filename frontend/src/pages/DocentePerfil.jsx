import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import { detalleDocente } from '../utils/mockData';

const DocentePerfil = () => {
  const navigate = useNavigate();
  // Extraemos el ID de la URL por si luego queremos cargar datos del backend según el id
  const { id } = useParams(); 
  const docente = detalleDocente;

  return (
    <div className="flex flex-col gap-0">
      
      {/* Botón Volver */}
      <div className="mb-4">
        <button 
          onClick={() => navigate('/docentes')}
          className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2"
        >
          &larr; Docentes / {docente.nombre}
        </button>
      </div>

      {/* Header del Perfil (Caja Azul Oscura) */}
      <div className="bg-url-blue rounded-t-xl p-8 text-white relative flex flex-col md:flex-row justify-between items-start md:items-center">
        
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-bold shadow-lg">
            {docente.iniciales}
          </div>
          <div>
            <p className="text-url-yellow text-sm mb-1 font-semibold">Semestre I - año 2025</p>
            <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
            <p className="text-gray-300 text-sm">
              {docente.facultad} · <span className="text-url-yellow">{docente.jornada}</span>
            </p>
            <div className="flex gap-4 mt-4">
              <span className="bg-url-yellow text-url-blue px-4 py-1.5 rounded-md text-sm font-bold">
                Créditos totales: {docente.creditosTotales}
              </span>
              <span className="border border-white/30 text-white px-4 py-1.5 rounded-md text-sm">
                {docente.totalCursos} cursos
              </span>
            </div>
          </div>
        </div>

        {/* Cajas de Ponderación Superiores */}
        <div className="flex flex-wrap gap-3 mt-6 md:mt-0 justify-end">
          {docente.desglose.map((item, idx) => (
            <div key={idx} className={`border-2 rounded-xl flex flex-col items-center justify-center w-24 h-24 ${idx === 5 ? 'border-url-yellow' : 'border-white/20'}`}>
              <span className={`text-2xl font-bold ${idx === 5 ? 'text-url-yellow' : 'text-url-yellow'}`}>{item.score}</span>
              <span className="text-[10px] text-gray-300 text-center leading-tight px-1 mt-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botones inferiores del Header */}
      <div className="bg-white px-8 py-3 rounded-b-xl shadow-sm flex justify-end gap-2">
        <button className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm hover:bg-yellow-500 transition">Checklists</button>
        <button className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm hover:bg-yellow-500 transition">Historico</button>
        <button className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm hover:bg-yellow-500 transition">Comparación</button>
      </div>

      {/* Sección Cursos Impartidos */}
      <div className="mt-8">
        <h3 className="font-bold text-lg text-url-blue mb-4">Cursos impartidos durante el semestre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docente.cursosImpartidos.map(curso => (
            <div key={curso.id} className="bg-url-blue rounded-xl overflow-hidden shadow-md">
              <div className="h-3 bg-url-yellow w-full"></div>
              <div className="p-6">
                <h4 className="text-white font-bold text-xl mb-1">{curso.nombre}</h4>
                <p className="text-gray-400 text-sm mb-6">{curso.estado}</p>
                <div className="flex justify-between items-end">
                  <span className="text-url-yellow text-4xl font-serif font-bold">{curso.score}</span>
                  <button className="text-url-yellow text-sm font-semibold hover:text-white transition-colors">
                    Ver Detalles &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DocentePerfil;