import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Card from '../components/common/Card';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { getDocentes } from '../services/docente_service';

const Dashboard = () => {
  const navigate = useNavigate();
  const { ponderaciones, semestreActivo } = useContext(AppContext);

  const [docentes,       setDocentes]       = useState([]);
  const [totalDocentes,  setTotalDocentes]  = useState(0);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    // Cargar docentes del backend con anotaciones de promedio
    getDocentes({ limit: 4 })
      .then(data => {
        const lista = Array.isArray(data) ? data : data.results ?? [];
        const total = data.count ?? lista.length;
        setDocentes(lista);
        setTotalDocentes(total);
      })
      .catch(e => console.error('Error cargando docentes para dashboard:', e))
      .finally(() => setLoading(false));
  }, []);

  // Métricas calculadas desde los datos del backend
  const promedioGeneral = (() => {
    const scores = docentes
      .map(d => d.promedio_punteo)
      .filter(v => v != null)
      .map(Number);
    if (!scores.length) return '—';
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  })();

  const clasificarEstado = (promedio) => {
    if (promedio == null) return 'Sin datos';
    const p = parseFloat(promedio);
    if (p >= 8) return 'Excelente';
    if (p >= 6) return 'Buena';
    return 'Deficiente';
  };

  const docentesRiesgo = docentes.filter(d => clasificarEstado(d.promedio_punteo) === 'Deficiente').length;

  const getIniciales = (nombre) =>
    (nombre ?? '').split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();

  const renderEstado = (estado) => {
    const colores = {
      'Excelente':  'bg-green-100 text-green-700 border-green-200',
      'Buena':      'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Deficiente': 'bg-red-100 text-red-700 border-red-200',
      'Sin datos':  'bg-gray-100 text-gray-500 border-gray-200',
    };
    return (
      <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${colores[estado] || 'bg-gray-100'}`}>
        {estado}
      </span>
    );
  };

  const PONDERACION_LABELS = [
    { label: 'Evaluación Estudiantil', key: 'estudiantil' },
    { label: 'Evaluación CEAT',        key: 'ceat' },
    { label: 'Autoevaluación',         key: 'autoevaluacion' },
    { label: 'Evaluación Coordinador', key: 'coordinador' },
    { label: 'Visitas docentes',       key: 'visitas' },
    { label: 'Participación docente',  key: 'apoyo' },
  ];

  return (
    <div className="flex flex-col gap-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Dashboard</h1>
          <p className="text-gray-500 font-semibold mt-1">Semestre actual: {semestreActivo}</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center border-l-4 border-l-url-blue">
          <p className="text-sm text-gray-500 font-semibold uppercase">Total Docentes</p>
          <p className="text-3xl font-bold text-url-blue">
            {loading ? <span className="animate-pulse">—</span> : totalDocentes}
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-success">
          <p className="text-sm text-gray-500 font-semibold uppercase">Promedio General</p>
          <p className="text-3xl font-bold text-url-blue">
            {loading ? <span className="animate-pulse">—</span> : promedioGeneral}
          </p>
        </Card>
        <Card className="text-center border-l-4 border-l-status-danger">
          <p className="text-sm text-gray-500 font-semibold uppercase">En Riesgo</p>
          <p className="text-3xl font-bold text-status-danger">
            {loading ? <span className="animate-pulse">—</span> : docentesRiesgo}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rendimiento por Docente */}
        <div className="lg:col-span-2">
          <Card title="Rendimiento por Docente">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex flex-col gap-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-36" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                ))}
              </div>
            ) : docentes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No hay docentes registrados en el semestre activo.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {docentes.map((doc) => {
                  const estado    = clasificarEstado(doc.promedio_punteo);
                  const iniciales = getIniciales(doc.nombre_completo);
                  const punteo    = doc.promedio_punteo != null ? parseFloat(doc.promedio_punteo).toFixed(1) : null;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/teachers/${doc.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${estado === 'Excelente' ? 'bg-url-yellow' : 'bg-url-blue'}`}>
                          {iniciales}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{doc.nombre_completo}</h4>
                          <p className="text-sm text-gray-500">{doc.FacultadNombre ?? '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-url-blue">{punteo ?? '—'}</p>
                        </div>
                        <div className="w-24 text-center">
                          {renderEstado(estado)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => navigate('/teachers')}
              className="w-full text-center mt-4 text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors"
            >
              Ver todos los docentes &rarr;
            </button>
          </Card>
        </div>

        {/* % Ponderación */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-url-blue">% Ponderación</h3>
              <button
                onClick={() => navigate('/files')}
                className="text-sm font-semibold text-url-blue hover:text-url-yellow transition-colors flex items-center gap-1 mt-1"
              >
                Agregar archivos <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F7FE] border border-blue-100 rounded-md p-3 mb-6 text-center shadow-inner">
              <span className="font-bold text-url-blue">{semestreActivo}</span>
            </div>

            <div className="flex flex-col gap-5">
              {PONDERACION_LABELS.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{item.label}</span>
                    <span className="font-bold text-url-blue">{ponderaciones[item.key] ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-url-blue h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${ponderaciones[item.key] ?? 0}%` }}
                    />
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