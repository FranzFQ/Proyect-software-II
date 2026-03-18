import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { dashboardMetrics, docentesData } from '../utils/mockData';

// Página principal del dashboard con métricas clave y listado de docentes evaluados
const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics] = useState(dashboardMetrics);
  const [docentes] = useState(docentesData);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false); // Estado para el menú exportar

  const getEstadoInfo = (puntaje) => {
    if (puntaje >= 90) return { texto: 'Excelente', color: 'bg-status-success text-white' };
    if (puntaje >= 70) return { texto: 'Bueno', color: 'bg-[#FBBF24] text-gray-900' };
    return { texto: 'Revisar', color: 'bg-status-danger text-white' };
  };

  // Función para obtener las iniciales del docente, ignorando títulos como Ing., Lic., etc.
  const getIniciales = (nombre) => {
    const partes = nombre.replace(/(Ing\.|Licda\.|Lic\.|Dr\.)\s+/g, '').split(' ');
    return (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
  };

  // Función para manejar la exportación del reporte (simulada)
  const handleExport = (formato) => {
    console.log(`Exportando reporte en formato: ${formato}`);
    setIsExportMenuOpen(false); // Cerramos el menú al elegir
    alert(`Generando archivo ${formato}...`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Encabezado del Dashboard */}
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Dashboard de Evaluación</h1>
          <p className="text-gray-500">Resumen del rendimiento docente del semestre actual</p>
        </div>
        
        {/* Contenedor relativo para el botón desplegable */}
        <div className="relative">
          <Button variant="primary" onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}>
            Exportar Reporte ▼
          </Button>
          
          {/* Menú desplegable */}
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-100 z-10 overflow-hidden">
              <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-url-blue transition-colors">
                📄 Exportar como PDF
              </button>
              <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-url-blue transition-colors border-t border-gray-50">
                📊 Exportar como Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center border-l-4 border-l-url-blue">
          <p className="text-sm text-gray-500 font-semibold uppercase">Total Docentes</p>
          <p className="text-3xl font-bold text-url-blue">{metrics.totalDocentes}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-success">
          <p className="text-sm text-gray-500 font-semibold uppercase">Promedio General</p>
          <p className="text-3xl font-bold text-url-blue">{metrics.promedioGeneral}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-danger">
          <p className="text-sm text-gray-500 font-semibold uppercase">En Riesgo</p>
          <p className="text-3xl font-bold text-status-danger">{metrics.docentesRiesgo}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-url-yellow">
          <p className="text-sm text-gray-500 font-semibold uppercase">Eval. Completadas</p>
          <p className="text-3xl font-bold text-url-blue">{metrics.evaluacionesCompletadas}</p>
        </Card>
      </div>

      {/* SECCIÓN INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <Card title="Rendimiento por Docente">
            <div className="flex flex-col gap-4">
              {docentes.map((docente) => {
                const estado = getEstadoInfo(docente.puntajeTotal);
                return (
                  <div key={docente.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-url-blue text-url-yellow flex items-center justify-center font-bold text-lg">
                        {getIniciales(docente.nombre)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{docente.nombre}</h4>
                        <p className="text-sm text-gray-500">{docente.curso}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-url-blue">{docente.puntajeTotal}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-md text-sm font-bold w-24 text-center shadow-sm ${estado.color}`}>
                        {estado.texto}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-url-blue">% Ponderación</h3>
              {/* <-- Enlace funcional para ir a Archivos --> */}
              <button onClick={() => navigate('/archivos')} className="text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors flex items-center gap-1 mt-1">
                Agregar archivos <span>&rarr;</span>
              </button>
            </div>

            <div className="bg-[#F4F7FE] border border-blue-100 rounded-md p-3 mb-6 text-center shadow-inner">
              <span className="font-bold text-url-blue">Primer Semestre 2026</span>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { label: 'Evaluación Estudiante', percent: 30 },
                { label: 'Evaluación CEAT', percent: 20 },
                { label: 'Autoevaluación', percent: 10 },
                { label: 'Evaluación Coordinador', percent: 20 },
                { label: 'Visitas docentes', percent: 10 },
                { label: 'Participación docente', percent: 10 }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="font-bold text-url-blue">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-url-blue h-2.5 rounded-full" style={{ width: `${item.percent}%` }}></div>
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