import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { detalleDocenteMarta } from '../../utils/mockData';

const TeacherHistory = () => {
  const navigate = useNavigate();
  const { id = 1 } = useParams();
  const docente = detalleDocenteMarta;

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const handleSearch = (e) => {
    setFiltroTexto(e.target.value);
    setCurrentPage(1);
  };

  const handleFilter = (estado) => {
    setFiltroEstado(filtroEstado === estado ? '' : estado);
    setCurrentPage(1);
  };

  const getColorEstado = (estado) => {
    if (estado === 'Excelente') return 'bg-green-500';
    if (estado === 'Buena') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const semestresFiltrados = docente.semestresHistoricos.filter(sem => {
    const matchTexto = sem.nombre.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchEstado = filtroEstado === '' || sem.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  const totalPages = Math.ceil(semestresFiltrados.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems = semestresFiltrados.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div className="mb-2">
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
          &larr; Volver al Perfil de {docente.nombre}
        </button>
        <h1 className="text-4xl font-bold text-[#112240] font-serif mb-1">Histórico de Semestres</h1>
        <p className="text-gray-500">{docente.nombre}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input type="text" placeholder="Búsqueda por año o semestre..." className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#112240]" value={filtroTexto} onChange={handleSearch} />
          <button className="bg-[#e2e8f0] text-[#112240] font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300">Buscar</button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={() => handleFilter('Deficiente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Deficiente' ? 'bg-red-200 text-red-900 border-red-300 border shadow-inner' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'}`}>Deficiente</button>
          <button onClick={() => handleFilter('Buena')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Buena' ? 'bg-yellow-200 text-yellow-900 border-yellow-300 border shadow-inner' : 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200'}`}>Buena</button>
          <button onClick={() => handleFilter('Excelente')} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === 'Excelente' ? 'bg-green-200 text-green-900 border-green-300 border shadow-inner' : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'}`}>Excelente</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {currentItems.map(sem => (
          <div key={sem.id} className="bg-[#112240] rounded-xl overflow-hidden shadow-md flex flex-col h-48">
            <div className={`h-3 w-full ${getColorEstado(sem.estado)}`}></div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-white font-bold text-lg mb-1">{sem.nombre}</h4>
                <p className={`text-xs font-bold uppercase ${sem.estado === 'Excelente' ? 'text-green-400' : sem.estado === 'Buena' ? 'text-orange-400' : 'text-red-400'}`}>Estado General: {sem.estado}</p>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-url-yellow text-5xl font-serif font-bold leading-none">{sem.score}</span>
                <button onClick={() => navigate(`/teachers/${id}/semester/${sem.id}`)} className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">Ver Detalles &rarr;</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-[#112240] font-bold gap-4">
         <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">&larr; Anterior</button>
         <span>Página {safeCurrentPage} de {totalPages}</span>
         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">Siguiente &rarr;</button>
      </div>

    </div>
  );
};

export default TeacherHistory;