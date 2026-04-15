import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const TeacherHistory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { docentes } = useContext(AppContext);

  const docente = docentes.find((d) => String(d.id) === String(id)) ?? docentes[0];

  const [filtroTexto,  setFiltroTexto]  = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  if (!docente) return <div className="p-8 text-gray-400">Cargando...</div>;

  const getColorEstado = (nivel) => {
    if (nivel === 'Excelente') return 'bg-green-500';
    if (nivel === 'Buena' || nivel === 'Bueno') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const semestresFiltrados = (docente.semestres || []).filter((sem) => {
    const matchTexto =
      filtroTexto === '' ||
      sem.label.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      sem.calificacion.toString().includes(filtroTexto);
    const matchEstado = filtroEstado === '' || sem.nivel === filtroEstado;
    return matchTexto && matchEstado;
  });

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">

      <div className="mb-2">
        <button
          onClick={() => navigate(`/teachers/${id}`)}
          className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4"
        >
          &larr; Volver al Perfil de {docente.nombre}
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#112240] font-serif mb-1">Histórico</h1>
            <p className="text-gray-500">{docente.nombre}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Búsqueda por año, semestre y nombre de curso"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#112240]"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <button className="bg-[#e2e8f0] text-[#112240] font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300">
            Buscar
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[
            { label: 'Deficiente', base: 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200',         active: 'bg-red-200 text-red-900 border-red-300 border shadow-inner' },
            { label: 'Buena',      base: 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200', active: 'bg-yellow-200 text-yellow-900 border-yellow-300 border shadow-inner' },
            { label: 'Excelente',  base: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200',    active: 'bg-green-200 text-green-900 border-green-300 border shadow-inner' },
          ].map(({ label, base, active }) => (
            <button
              key={label}
              onClick={() => setFiltroEstado(filtroEstado === label ? '' : label)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === label ? active : base}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de semestres */}
      {semestresFiltrados.length === 0 ? (
        <p className="text-gray-400 text-sm">No se encontraron semestres con los filtros aplicados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {semestresFiltrados.map((sem) => (
            <div key={sem.id} className="bg-[#112240] rounded-xl overflow-hidden shadow-md flex flex-col h-48">
              <div className={`h-3 w-full ${getColorEstado(sem.nivel)}`} />
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">{sem.label}</h4>
                  {sem.cursos?.[0] && (
                    <h5 className="text-gray-300 font-semibold text-sm mb-1">{sem.cursos[0].nombre}</h5>
                  )}
                  <p className={`text-xs font-bold uppercase ${
                    sem.nivel === 'Excelente' ? 'text-green-400' :
                    (sem.nivel === 'Buena' || sem.nivel === 'Bueno') ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {sem.nivel}
                  </p>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-url-yellow text-5xl font-serif font-bold leading-none">
                    {sem.calificacion.toFixed(1)}
                  </span>
                  {sem.cursos?.[0] && (
                    <button
                      onClick={() => navigate(`/teachers/${id}/semester`)}
                      className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
                    >
                      Ver Detalles &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      <div className="mt-auto flex justify-end items-center pt-8 pb-2 text-sm text-gray-500 font-semibold gap-2">
        <span className="text-[#112240] font-bold text-lg">1</span>
        <button className="hover:text-url-blue transition-colors">2</button>
        <button className="hover:text-url-blue transition-colors">3</button>
        <span>.......</span>
        <button className="hover:text-url-blue transition-colors">20</button>
        <button className="hover:text-url-blue ml-2 transition-colors">Siguiente &rarr;</button>
      </div>
    </div>
  );
};

export default TeacherHistory;
