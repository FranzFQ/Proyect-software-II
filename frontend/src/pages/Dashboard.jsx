// src/pages/Dashboard.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; // Usamos el contexto global
import Card from '../components/common/Card';
import Button from '../components/common/Button';

import { ArrowRightIcon, DocumentArrowDownIcon, DocumentTextIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  // Extraemos TODO del contexto
  const { ponderaciones, docentes, evaluacionesCompletadas } = useContext(AppContext);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // --- CÁLCULOS DINÁMICOS PARA LAS TARJETAS ---
  const totalDocentes = docentes.length;
  // Calculamos el promedio sumando las ponderaciones y dividiendo entre el total
  const sumaPonderaciones = docentes.reduce((acc, doc) => acc + doc.ponderacion, 0);
  const promedioGeneral = totalDocentes > 0 ? (sumaPonderaciones / totalDocentes).toFixed(1) : 0;
  // Buscamos los que están en Deficiente (Riesgo)
  const docentesRiesgo = docentes.filter(d => d.estado === 'Deficiente').length;

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

  const handleExport = (formato) => {
    setIsExportMenuOpen(false);
    alert(`Generando archivo ${formato}...`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Dashboard de Evaluación</h1>
          <p className="text-gray-500">Resumen del rendimiento docente del semestre actual</p>
        </div>
        
        <div className="relative">
          <Button variant="primary" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2">
            <DocumentArrowDownIcon className="w-5 h-5" />
            Exportar Reporte
          </Button>
          
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 z-10 overflow-hidden">
              <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <DocumentTextIcon className="w-5 h-5 text-red-500" /> Exportar como PDF
              </button>
              <button onClick={() => handleExport('Excel')} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                <TableCellsIcon className="w-5 h-5 text-green-600" /> Exportar como Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas DINÁMICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center border-l-4 border-l-url-blue">
          <p className="text-sm text-gray-500 font-semibold uppercase">Total Docentes</p>
          <p className="text-3xl font-bold text-url-blue">{totalDocentes}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-success">
          <p className="text-sm text-gray-500 font-semibold uppercase">Promedio General</p>
          <p className="text-3xl font-bold text-url-blue">{promedioGeneral}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-danger">
          <p className="text-sm text-gray-500 font-semibold uppercase">Bajo Rendimiento</p>
          <p className="text-3xl font-bold text-status-danger">{docentesRiesgo}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-url-yellow">
          <p className="text-sm text-gray-500 font-semibold uppercase">Eval. Completadas</p>
          <p className="text-3xl font-bold text-url-blue">{evaluacionesCompletadas}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rendimiento por Docente (Ahora lee de la lista real) */}
        <div className="lg:col-span-2">
          <Card title="Rendimiento por Docente">
            <div className="flex flex-col gap-4">
              {docentes.slice(0, 4).map((doc) => ( // Mostramos solo los 4 primeros para no saturar el dashboard
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${doc.estado === 'Excelente' ? 'bg-url-yellow' : 'bg-url-blue'}`}>
                      {doc.iniciales}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{doc.nombre}</h4>
                      <p className="text-sm text-gray-500">{doc.facultad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-url-blue">{doc.ponderacion}</p>
                    </div>
                    <div className="w-24 text-center">
                      {renderEstado(doc.estado)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/docentes')} className="w-full text-center mt-4 text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors">
              Ver todos los docentes &rarr;
            </button>
          </Card>
        </div>

        {/* % Ponderación */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-url-blue">% Ponderación</h3>
              <button onClick={() => navigate('/archivos')} className="text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors flex items-center gap-1 mt-1">
                Agregar archivos <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F7FE] border border-blue-100 rounded-md p-3 mb-6 text-center shadow-inner">
              <span className="font-bold text-url-blue">Primer Semestre 2026</span>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { label: 'Evaluación Estudiante', percent: ponderaciones.estudiantil },
                { label: 'Evaluación CEAT', percent: ponderaciones.ceat },
                { label: 'Autoevaluación', percent: ponderaciones.autoevaluacion },
                { label: 'Evaluación Coordinador', percent: ponderaciones.coordinador },
                { label: 'Visitas docentes', percent: ponderaciones.visitas },
                { label: 'Participación docente', percent: ponderaciones.apoyo }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="font-bold text-url-blue">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-url-blue h-2.5 rounded-full transition-all duration-500" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;