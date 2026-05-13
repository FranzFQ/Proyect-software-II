import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../../services/global_URL';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const itemsPerPage = 3; // Modificado a 3 para cuadrar con el grid

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [docenteRes, historialRes] = await Promise.all([
          fetch(`${API_URL}usuarios/docentes/${id}/`),
          fetch(`${API_URL}usuarios/docentes/${id}/historial/`),
        ]);

        if (!docenteRes.ok) throw new Error('No se pudo cargar el docente');
        if (!historialRes.ok) throw new Error('No se pudo cargar el historial');

        const docenteData    = await docenteRes.json();
        const historial      = await historialRes.json();

        setDocente(docenteData);

        const items = historial.map(ev => ({
          id:       ev.id,
          semestreId: ev.semestre_id,
          nombre:   ev.SemestreStr,
          score:    parseFloat(ev.puntaje_final ?? 0),
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
    const umbralExcelente = score > 10 ? 80 : 8;
    const umbralBueno = score > 10 ? 60 : 6;
    if (score >= umbralExcelente) return 'Excelente';
    if (score >= umbralBueno) return 'Buena';
    return 'Deficiente';
  };

  const getColorBarra = (estado) => {
    if (estado === 'Excelente') return 'bg-green-500';
    if (estado === 'Buena')     return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (estado) => {
    if (estado === 'Excelente') return 'text-green-600';
    if (estado === 'Buena')     return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressWidth = (score) => {
    if (score === null) return 0;
    return score > 10 ? Math.min(score, 100) : Math.min(score * 10, 100);
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

  const chartData = useMemo(() => {
    // Los datos vienen ordenados descendente por fecha desde el backend, 
    // los invertimos para que la gráfica de línea crezca hacia la derecha (cronológico)
    return [...semestresHistoricos].map(sem => ({
      name: sem.nombre,
      Punteo: Number(sem.score)
    })).reverse(); 
  }, [semestresHistoricos]);

  const yAxisConfig = useMemo(() => {
    if (chartData.length === 0) return { ticks: [0, 20, 40, 60, 80, 100], max: 100 };
    const maxScore = Math.max(...chartData.map(d => d.Punteo));
    const isBase100 = maxScore > 10;
    const interval = isBase100 ? 20 : 2;
    const maxTick = Math.max(isBase100 ? 100 : 10, Math.ceil((maxScore + 1) / interval) * interval);
    
    const ticks = [];
    for (let i = 0; i <= maxTick; i += interval) ticks.push(i);
    return { ticks, max: maxTick };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#112240] text-white p-3 rounded-lg shadow-lg border border-blue-800">
          <p className="text-xs text-gray-300 font-bold mb-1">{label}</p>
          <p className="text-xl font-black text-url-yellow">
            {payload[0].value.toFixed(1)} <span className="text-sm font-normal text-gray-300">pts</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-12 animate-pulse text-[#112240] font-bold text-center">Cargando historial...</div>;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)] pb-12">

      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {docente?.nombre_completo}
        </button>
        <h1 className="text-3xl font-black text-[#112240] mb-1">Histórico de Semestres</h1>
        <p className="text-gray-500 font-medium">{docente?.nombre_completo}</p>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-[#112240] mb-6">Tendencia de Rendimiento Anual</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} padding={{ left: 40, right: 40 }} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} ticks={yAxisConfig.ticks} domain={[0, yAxisConfig.max]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Punteo" stroke="#112240" strokeWidth={4} dot={{ r: 6, fill: '#112240', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, fill: '#112240', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
        <div className="flex w-full md:w-1/2 shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <input
            type="text"
            placeholder="Búsqueda por año o semestre..."
            className="w-full px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
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
              Buena:      { active: 'bg-yellow-500 text-white shadow-md', idle: 'bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100' },
              Excelente:  { active: 'bg-green-600 text-white shadow-md',  idle: 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100' },
            };
            return (
              <button key={estado} onClick={() => handleFilter(estado)} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border ${filtroEstado === estado ? colors[estado].active : colors[estado].idle}`}>
                {estado}
              </button>
            );
          })}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex flex-col items-center justify-center">
          <p className="font-bold text-lg">Sin resultados</p>
          <p className="text-sm">No hay datos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        // Modificado a grid-cols-3 y alineados al inicio para que no se estiren
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2 items-start content-start">
          {currentItems.map(sem => (
            <div key={sem.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative pt-1 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${getColorBarra(sem.estado)}`} />
              <div className="p-5 flex flex-col h-full gap-3">
                
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Registro Semestral</p>
                  <h4 className="text-[#112240] font-black text-xl leading-tight line-clamp-1 mb-8">
                    {sem.nombre}
                  </h4>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                    <span>Estado: {sem.estado}</span>
                    <span className={`text-xl font-black leading-none ml-1 ${getScoreColor(sem.estado)}`}>{sem.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
                    <div className={`h-1.5 rounded-full ${getColorBarra(sem.estado)}`} style={{ width: `${getProgressWidth(sem.score)}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/teachers/${id}/semester/${sem.semestreId}`)}
                      className="border border-[#112240] text-[#112240] text-sm w-full font-bold px-5 py-2 rounded-md hover:bg-[#112240] hover:text-white transition-colors"
                    >
                      Ver Semestre
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-[#112240] font-bold gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">&larr; Anterior</button>
          <span className="text-gray-500">Página {safeCurrentPage} de {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors">Siguiente &rarr;</button>
        </div>
      )}

    </div>
  );
};

export default TeacherHistory;