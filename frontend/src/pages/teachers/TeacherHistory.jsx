import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GLOBAL_API_URL from '../../services/global_URL';

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
          fetch(`${GLOBAL_API_URL}usuarios/docentes/${id}/`),
          fetch(`${GLOBAL_API_URL}evaluaciones/evaluaciones/?docente=${id}`),
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
            estado:   clasificarEstado(ev.puntaje_final),
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

  const nombreDocente = docente?.nombre_completo ?? '...';

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver al Perfil
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-600">
          <p className="font-bold mb-1">Error al cargar el historial</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">

      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {nombreDocente}
        </button>
        <h1 className="text-3xl font-bold text-url-blue mb-1">Histórico de Semestres</h1>
        <p className="text-gray-500">{nombreDocente}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Búsqueda por año o semestre..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-url-blue"
            value={filtroTexto}
            onChange={handleSearch}
          />
          <button className="bg-gray-200 text-url-blue font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300">
            Buscar
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['Deficiente', 'Buena', 'Excelente'].map(estado => {
            const colors = {
              Deficiente: { active: 'bg-red-200 text-red-900 border-red-300 border shadow-inner',    idle: 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' },
              Buena:      { active: 'bg-yellow-200 text-yellow-900 border-yellow-300 border shadow-inner', idle: 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200' },
              Excelente:  { active: 'bg-green-200 text-green-900 border-green-300 border shadow-inner', idle: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' },
            };
            return (
              <button
                key={estado}
                onClick={() => handleFilter(estado)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === estado ? colors[estado].active : colors[estado].idle}`}
              >
                {estado}
              </button>
            );
          })}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm flex-1 flex items-center justify-center">
          <p>No se encontraron semestres con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {currentItems.map(sem => (
            <div key={sem.id} className="bg-url-blue rounded-xl overflow-hidden shadow-md flex flex-col h-48">
              <div className={`h-3 w-full ${getColorEstado(sem.estado)}`} />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">{sem.nombre}</h4>
                  <p className={`text-xs font-bold uppercase ${getTextColorEstado(sem.estado)}`}>
                    Estado General: {sem.estado}
                  </p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-url-yellow text-5xl font-bold leading-none">{sem.score}</span>
                  <button
                    onClick={() => navigate(`/teachers/${id}/semester/${sem.semestreId}`)}
                    className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
                  >
                    Ver Detalles &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-url-blue font-bold gap-4">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={safeCurrentPage === 1}
          className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          &larr; Anterior
        </button>
        <span>Página {safeCurrentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={safeCurrentPage === totalPages}
          className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          Siguiente &rarr;
        </button>
      </div>

    </div>
  );
};

export default TeacherHistory;