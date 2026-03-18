// src/pages/Docentes.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { listaDocentes } from '../utils/mockData';

const Docentes = () => {
  const navigate = useNavigate();
  const [docentes] = useState(listaDocentes);
  const [filtro, setFiltro] = useState(''); // Para buscar por texto

  // Función para pintar el estado del color correcto
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

  return (
    <div className="flex flex-col gap-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-url-blue mb-2 font-serif">Lista de Docentes</h1>
        <p className="text-gray-500">6 docentes ingresados · Semestre I - 2025</p>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input 
          type="text" 
          placeholder="Búsqueda por nombre, código y puntuación" 
          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-url-blue"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button className="px-8 py-2 border-2 border-url-blue text-url-blue rounded-lg font-bold hover:bg-url-blue hover:text-white transition-colors">
          Buscar
        </button>
        <button className="px-6 py-2 bg-red-100 text-red-800 border border-red-200 rounded-lg font-bold">Deficiente</button>
        <button className="px-6 py-2 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-lg font-bold">Buena</button>
        <button className="px-6 py-2 bg-green-100 text-green-800 border border-green-200 rounded-lg font-bold">Excelente</button>
      </div>

      {/* Tabla de Docentes */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-url-blue text-white text-sm">
                <th className="py-4 px-6 font-semibold">Nombre / Codigo</th>
                <th className="py-4 px-6 font-semibold text-center">Cursos</th>
                <th className="py-4 px-6 font-semibold text-center">Facultad</th>
                <th className="py-4 px-6 font-semibold text-center">Ponderación</th>
                <th className="py-4 px-6 font-semibold text-center">Estado</th>
                <th className="py-4 px-6 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((doc, index) => (
                <tr key={doc.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${doc.estado === 'Excelente' ? 'bg-url-yellow' : 'bg-url-blue'}`}>
                        {doc.iniciales}
                      </div>
                      <div>
                        <h4 className="font-bold text-url-blue">{doc.nombre}</h4>
                        <p className="text-xs text-gray-400">{doc.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-url-blue">{doc.cursos}</td>
                  <td className="py-4 px-6 text-center text-url-blue font-semibold">{doc.facultad}</td>
                  <td className="py-4 px-6 text-center text-gray-600">{doc.ponderacion}</td>
                  <td className="py-4 px-6 text-center">
                    {renderEstado(doc.estado)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {/* Botón de Acciones (Ojito) que navega al perfil detallado */}
                    <button 
                      onClick={() => navigate(`/docentes/${doc.id}`)}
                      className="w-10 h-10 border-2 border-url-yellow text-url-yellow rounded-md flex items-center justify-center hover:bg-url-yellow hover:text-white transition-colors mx-auto"
                      title="Ver perfil"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default Docentes;