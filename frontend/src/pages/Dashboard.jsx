import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; 
import Card from '../components/common/Card';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { ponderaciones, docentes, evaluacionesCompletadas, semestreActivo = "Semestre I — 2025" } = useContext(AppContext);

  // --- PREPARACIÓN DE DATOS (Sin Autoevaluación ni Apoyo) ---
  const dataPromedios = [
    { name: 'Estudiantil', valor: 8.5 }, 
    { name: 'CEAT', valor: 9.2 },
    { name: 'Coord.', valor: 8.9 },
    { name: 'Checklists', valor: 9.5 },
  ];

  const distributionData = useMemo(() => {
    return [
      { name: 'Excelente', value: docentes.filter(d => d.estado === 'Excelente').length, color: '#10B981' }, 
      { name: 'Buena', value: docentes.filter(d => d.estado === 'Buena').length, color: '#F59E0B' },      
      { name: 'Deficiente', value: docentes.filter(d => d.estado === 'Deficiente').length, color: '#EF4444' } 
    ];
  }, [docentes]);

  const topDocentes = useMemo(() => {
    return [...docentes]
      .sort((a, b) => b.ponderacion - a.ponderacion)
      .slice(0, 4)
      .map(doc => {
        const normalizedScore = doc.ponderacion <= 10 ? doc.ponderacion * 10 : doc.ponderacion;
        return {
          ...doc,
          scoreVisual: normalizedScore,
          color: doc.estado === 'Excelente' ? '#10B981' : doc.estado === 'Buena' ? '#F59E0B' : '#EF4444',
          bgBadge: doc.estado === 'Excelente' ? 'bg-green-100 text-green-700 border-green-200' : 
                   doc.estado === 'Buena' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                   'bg-red-100 text-red-700 border-red-200'
        };
      });
  }, [docentes]);

  const dataPonderaciones = [
    { name: 'Estudiantil', value: ponderaciones?.estudiantil || 0 },
    { name: 'CEAT', value: ponderaciones?.ceat || 0 },
    { name: 'Coordinador', value: ponderaciones?.coordinador || 0 },
    { name: 'Checklists', value: ponderaciones?.visitas || 0 },
  ];

  const COLORS_PALETTE = ['#112240', '#1a365d', '#3182ce', '#63b3ed'];

  const totalDocentes = docentes.length;
  const sumaPonderaciones = docentes.reduce((acc, doc) => acc + (doc.ponderacion || 0), 0);
  const promedioGeneral = totalDocentes > 0 ? (sumaPonderaciones / totalDocentes).toFixed(1) : 0;
  const docentesRiesgo = docentes.filter(d => d.estado === 'Deficiente').length;

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Dashboard</h1>
          <p className="text-gray-500 font-medium">Visualización de métricas para: {semestreActivo}</p>
        </div>
      </div>

      {/* 1. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center border-l-4 border-l-url-blue shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Docentes</p>
          <p className="text-4xl font-black text-url-blue">{totalDocentes}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-green-500 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Promedio General</p>
          <p className="text-4xl font-black text-url-blue">{promedioGeneral}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-red-500 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Docentes en Riesgo</p>
          <p className="text-4xl font-black text-red-600">{docentesRiesgo}</p>
        </Card>
        <Card className="text-center border-l-4 border-l-url-yellow shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Progreso Semestre</p>
          <p className="text-4xl font-black text-url-blue">{evaluacionesCompletadas}</p>
        </Card>
      </div>

      {/* 2. GRÁFICAS DE ANÁLISIS CENTRAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Puntuación Promedio por Evaluación">
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPromedios} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="valor" fill="#112240" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Distribución de Rendimiento">
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%" cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Rendimiento de Docentes (Top 4)">
            <div className="flex flex-col gap-6 mt-6">
              {topDocentes.map((doc) => (
                <div key={doc.id} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-url-blue border border-slate-200">
                        {doc.iniciales}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 leading-none">{doc.nombre}</h4>
                        <span className="text-[11px] text-gray-400 font-semibold uppercase">{doc.facultad}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${doc.bgBadge}`}>
                        {doc.estado}
                      </span>
                      <div>
                        <span className="text-lg font-black text-url-blue">{doc.scoreVisual}</span>
                        <span className="text-xs text-gray-400 ml-1">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${doc.scoreVisual}%`, backgroundColor: doc.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/teachers')} className="w-full text-center mt-8 py-2 border-t border-gray-50 text-sm font-bold text-url-blue hover:text-url-yellow transition-colors">
              Ver listado completo de docentes &rarr;
            </button>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-url-blue">% Ponderación</h3>
              <button onClick={() => navigate('/files')} className="p-1.5 text-url-blue hover:bg-blue-50 rounded-full transition-colors">
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPonderaciones}
                    cx="50%" cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {dataPonderaciones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PALETTE[index % COLORS_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-4">
              {dataPonderaciones.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_PALETTE[index % COLORS_PALETTE.length] }}></div>
                    <span className="text-xs font-semibold text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-url-blue">{item.value}%</span>
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