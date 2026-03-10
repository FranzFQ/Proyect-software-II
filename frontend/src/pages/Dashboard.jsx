// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { dashboardMetrics, docentesData } from '../utils/mockData';

const Dashboard = () => {
  const [metrics] = useState(dashboardMetrics);
  const [docentes] = useState(docentesData);

  // Función para convertir el puntaje en el texto y color del mockup
  const getEstadoInfo = (puntaje) => {
    if (puntaje >= 90) return { texto: 'Excelente', color: 'bg-status-success text-white' };
    if (puntaje >= 70) return { texto: 'Bueno', color: 'bg-[#FBBF24] text-gray-900' };
    return { texto: 'Revisar', color: 'bg-status-danger text-white' };
  };

  // Función para generar las iniciales del perfil (Ej: "Carlos Mendoza" -> "CM")
  const getIniciales = (nombre) => {
    const partes = nombre.replace(/(Ing\.|Licda\.|Lic\.|Dr\.)\s+/g, '').split(' ');
    return (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Encabezado del Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Dashboard de Evaluación</h1>
          <p className="text-gray-500">Resumen del rendimiento docente del semestre actual</p>
        </div>
        <Button variant="primary">Exportar Reporte</Button>
      </div>

      {/* Tarjetas de Métricas (KPIs) - Estas se mantienen igual porque están correctas */}
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

      {/* SECCIÓN INFERIOR: Dividida en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Rendimiento por Docente (Ocupa 2/3) */}
        <div className="lg:col-span-2">
          <Card title="Rendimiento por Docente">
            <div className="flex flex-col gap-4">
              {docentes.map((docente) => {
                const estado = getEstadoInfo(docente.puntajeTotal);
                return (
                  <div key={docente.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    
                    {/* Perfil: Iniciales, Nombre y Curso */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-url-blue text-url-yellow flex items-center justify-center font-bold text-lg">
                        {getIniciales(docente.nombre)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{docente.nombre}</h4>
                        <p className="text-sm text-gray-500">{docente.curso}</p>
                      </div>
                    </div>

                    {/* Puntaje y Estado (Excelente, Bueno, Revisar) */}
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

        {/* COLUMNA DERECHA: % Ponderación (Ocupa 1/3) */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            
            {/* Título y botón de Agregar archivos */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-url-blue">% Ponderación</h3>
              <button className="text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors flex items-center gap-1 mt-1">
                Agregar archivos <span>&rarr;</span>
              </button>
            </div>

            {/* Recuadro resaltado: Semestre y Año */}
            <div className="bg-[#F4F7FE] border border-blue-100 rounded-md p-3 mb-6 text-center shadow-inner">
              <span className="font-bold text-url-blue">Primer Semestre 2026</span>
            </div>

            {/* Gráficas de los apartados importantes */}
            <div className="flex flex-col gap-5">
              
              {/* Apartado 1 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Evaluación Estudiante</span>
                  <span className="font-bold text-url-blue">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Apartado 2 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Evaluación CEAT</span>
                  <span className="font-bold text-url-blue">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>

              {/* Apartado 3 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Autoevaluación</span>
                  <span className="font-bold text-url-blue">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>

              {/* Apartado 4 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Evaluación Coordinador</span>
                  <span className="font-bold text-url-blue">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>

              {/* Apartado 5 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Visitas docentes</span>
                  <span className="font-bold text-url-blue">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>

              {/* Apartado 6 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">Participación docente</span>
                  <span className="font-bold text-url-blue">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-url-blue h-2.5 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;