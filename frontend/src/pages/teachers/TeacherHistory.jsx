import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../services/global_URL';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const TeacherHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [docente,          setDocente]          = useState(null);
  const [semestresHistoricos, setSemestresHistoricos] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [filtroTexto,      setFiltroTexto]      = useState('');
  const [filtroEstado,     setFiltroEstado]     = useState('');
  const [currentPage,      setCurrentPage]      = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docenteRes, evaluacionesRes] = await Promise.all([
          fetch(`${API_URL}usuarios/docentes/${id}/`),
          fetch(`${API_URL}evaluaciones/evaluaciones/?docente=${id}`),
        ]);

        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');
        if (!evaluacionesRes.ok) throw new Error('No se pudo cargar el historial');

        const docenteData    = await docenteRes.json();
        const evaluaciones   = await evaluacionesRes.json();

        setDocente(docenteData);

        const items = (Array.isArray(evaluaciones) ? evaluaciones : evaluaciones.results ?? [])
          .map(ev => ({
            id:       ev.id,
            semestreId: ev.semestre,
            nombre:   ev.SemestreStr,
            score:    parseFloat(ev.puntaje_final ?? 0).toFixed(1),
            estado:   clasificarEstado(parseFloat(ev.puntaje_final ?? 0)),
          }));
        
        setSemestresHistoricos(items);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const clasificarEstado = (score) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Buena';
    return 'Deficiente';
  };

  const getColorEstado = (estado) => {
    if (estado === 'Excelente') return 'bg-green-500';
    if (estado === 'Buena')     return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColorEstado = (estado) => {
    if (estado === 'Excelente') return 'text-green-400';
    if (estado === 'Buena')     return 'text-orange-400';
    return 'text-red-400';
  };

  const handleSearch = (e) => { setFiltroTexto(e.target.value); setCurrentPage(1); };
  const handleFilter = (estado) => { setFiltroEstado(filtroEstado === estado ? '' : estado); setCurrentPage(1); };

  const filtrados = semestresHistoricos.filter(sem => {
    const matchTexto  = sem.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchEstado = filtroEstado === '' || sem.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  const totalPages      = Math.ceil(filtrados.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems    = filtrados.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  // --- LÓGICA DE DATOS Y ESCALA DE LA GRÁFICA ---
  const chartData = useMemo(() => {
    return semestresHistoricos.map(sem => ({
      name: sem.nombre,
      Punteo: Number(sem.score)
    })).reverse(); 
  }, [semestresHistoricos]);

  // Cálculo de Ticks de 20 en 20 y dominio dinámico
  const yAxisConfig = useMemo(() => {
    if (chartData.length === 0) return { ticks: [0, 20, 40, 60, 80, 100], max: 100 };
    
    const maxScore = Math.max(...chartData.map(d => d.Punteo));
    // Calculamos el techo: si es 87, va a 100. Si es 109, va a 120.
    const maxTick = Math.max(100, Math.ceil((maxScore + 1) / 20) * 20);
    
    const ticks = [];
    for (let i = 0; i <= maxTick; i += 20) {
      ticks.push(i);
    }
    return { ticks, max: maxTick };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#112240] text-white p-3 rounded-lg shadow-lg border border-blue-800">
          <p className="text-xs text-gray-300 font-bold mb-1">{label}</p>
          <p className="text-xl font-black text-url-yellow">
            {payload[0].value} <span className="text-sm font-normal text-gray-300">pts</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-12 animate-pulse text-url-blue font-bold text-center">Cargando historial...</div>;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-12">

      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {docente?.nombre_completo}
        </button>
        <h1 className="text-3xl font-bold text-url-blue mb-1 font-serif">Histórico de Semestres</h1>
        <p className="text-gray-500 font-medium">{docente?.nombre_completo}</p>
      </div>

      {/* 1. GRÁFICA CON ESCALA PROFESIONAL (Ticks de 20 en 20) */}
      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-[#112240] mb-6">Tendencia de Rendimiento Anual</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} 
                  padding={{ left: 40, right: 40 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  ticks={yAxisConfig.ticks}
                  domain={[0, yAxisConfig.max]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="Punteo" 
                  stroke="#112240" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#112240', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#112240', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. FILTROS Y BUSCADOR */}
      <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
        <div className="flex w-full md:w-1/2 shadow-sm rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Búsqueda por año o semestre..."
            className="w-full px-4 py-2.5 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-url-blue"
            value={filtroTexto}
            onChange={handleSearch}
          />
          <button className="bg-[#112240] text-white font-bold px-6 py-2 hover:bg-blue-900 transition-colors">
            Buscar
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['Deficiente', 'Buena', 'Excelente'].map(estado => {
            const colors = {
              Deficiente: { active: 'bg-red-600 text-white shadow-md',    idle: 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100' },
              Buena:      { active: 'bg-orange-500 text-white shadow-md', idle: 'bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100' },
              Excelente:  { active: 'bg-green-600 text-white shadow-md',  idle: 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100' },
            };
            return (
              <button
                key={estado}
                onClick={() => handleFilter(estado)}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border ${filtroEstado === estado ? colors[estado].active : colors[estado].idle}`}
              >
                {estado}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GRID DE TARJETAS */}
      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex flex-col items-center justify-center">
          <p className="font-bold text-lg">Sin resultados</p>
          <p className="text-sm">No hay datos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {currentItems.map(sem => (
            <div key={sem.id} className="bg-[#112240] rounded-xl overflow-hidden shadow-md flex flex-col h-48 hover:shadow-xl transition-all border border-blue-900/50">
              <div className={`h-2 w-full ${getColorEstado(sem.estado)}`} />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xl mb-1">{sem.nombre}</h4>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${getTextColorEstado(sem.estado)}`}>
                    Estado: {sem.estado}
                  </p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-url-yellow text-5xl font-black leading-none">{sem.score}</span>
                  <button
                    onClick={() => navigate(`/teachers/${id}/semester/${sem.semestreId}`)}
                    className="text-url-yellow text-sm font-bold hover:text-white transition-colors flex items-center gap-1 border-b border-transparent hover:border-white"
                  >
                    Detalles &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-url-blue font-bold gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 hover:bg-gray-200 transition-colors">&larr; Anterior</button>
          <span>Página {safeCurrentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 hover:bg-gray-200 transition-colors">Siguiente &rarr;</button>
        </div>
      )}

    </div>
  );
};

export default TeacherHistory;