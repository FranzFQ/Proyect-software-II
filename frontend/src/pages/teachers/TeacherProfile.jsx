import { useNavigate, useParams } from 'react-router-dom';
import { listaDocentesGlobal } from '../../utils/mockData';
import { detalleDocenteMarta } from '../../utils/mockData';

const DocentePerfil = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const docentes = listaDocentesGlobal;
  const docente = docentes.find((d) => String(d.id) === String(id)) ?? docentes[0];
  //const docente = detalleDocenteMarta;

  // Lógica de colores según lo solicitado
  const getColorEstado = (estado) => {
    if (estado === 'Excelente') return 'bg-green-500';
    if (estado === 'Buena') return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    // Agregamos min-h-[calc(100vh-2rem)] para que el contenedor ocupe la pantalla
    // (restando un poco de margen)
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div>
        <button onClick={() => navigate('/teachers')} className="text-gray-500 hover:text-url-blue font-semibold flex items-center gap-2 transition">
          &larr; Volver a Docentes
        </button>
      </div>

      {/* CABECERA PRINCIPAL (El Hub) */}
      <div className="bg-url-blue rounded-xl text-white relative flex flex-col pt-8 shadow-md shrink-0">
        <div className="px-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-4xl font-serif font-bold shadow-lg shrink-0">
              {docente.iniciales}
            </div>
            <div>
              <p className="text-url-yellow text-sm mb-1 font-semibold">Semestre I - año 2025</p>
              <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
              <p className="text-gray-300 text-sm">{docente.codigo} · {docente.facultad}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-url-yellow text-url-blue px-4 py-1.5 rounded-md text-sm font-bold">Créditos totales: {docente.creditosTotales}</span>
                <span className="border border-white/30 text-white px-4 py-1.5 rounded-md text-sm font-semibold">{docente.totalCursos} cursos activos</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-end w-full lg:w-auto">
            {docente.ponderacionesActuales.map((item, idx) => (
              <div key={idx} className="border-2 border-url-yellow rounded-xl flex flex-col items-center justify-center w-[5.5rem] h-24 bg-blue-900/20">
                <span className="text-2xl font-bold text-url-yellow">{item.score}</span>
                <span className="text-[9px] text-gray-300 text-center leading-tight px-1 mt-1 font-semibold uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PESTAÑAS (Se eliminó "Cursos Actuales") */}
        <div className="flex flex-wrap gap-2 px-8 mt-8 border-t border-white/10 pt-4 pb-4">
          <button onClick={() => navigate(`/teachers/${id}/checklists`)} className="px-6 py-2 rounded-md font-bold text-sm transition-colors text-gray-300 hover:text-white hover:bg-white/10">Checklists</button>
          <button onClick={() => navigate(`/teachers/${id}/history`)} className="px-6 py-2 rounded-md font-bold text-sm transition-colors text-gray-300 hover:text-white hover:bg-white/10">Histórico</button>
          <button onClick={() => navigate(`/teachers/${id}/comparison`)} className="px-6 py-2 rounded-md font-bold text-sm transition-colors text-gray-300 hover:text-white hover:bg-white/10">Comparación</button>
        </div>
      </div>

      {/* CURSOS ACTUALES */}
      <div className="mt-4 flex flex-col gap-6 flex-1">
        <h3 className="font-bold text-lg text-[#112240]">Cursos impartidos durante el semestre</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docente.cursosActuales.map(curso => (
            <div key={curso.id} className="bg-[#112240] rounded-xl overflow-hidden shadow-md flex flex-col h-48">
              <div className={`h-3 w-full ${getColorEstado(curso.estado)}`}></div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xl leading-tight line-clamp-2 mb-2">{curso.nombre}</h4>
                  <p className="text-gray-400 text-xs mb-1">{curso.estado}</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="text-url-yellow text-4xl font-serif font-bold leading-none">{curso.score}</span>
                  <button onClick={() => navigate(`/teachers/${id}/course/${curso.id}`)} className="text-url-yellow text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                    Ver Detalles &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación empujada al fondo con mt-auto */}
        <div className="mt-auto flex justify-end items-center pt-8 text-sm text-gray-500 font-semibold gap-2">
           <span className="text-[#112240] font-bold text-lg">1</span>
           <button className="hover:text-url-blue transition-colors">2</button>
           <button className="hover:text-url-blue transition-colors">3</button>
           <span>.......</span>
           <button className="hover:text-url-blue transition-colors">20</button>
           <button className="hover:text-url-blue ml-2 transition-colors">Siguiente -&gt;</button>
        </div>
      </div>

    </div>
  );
};

export default DocentePerfil;