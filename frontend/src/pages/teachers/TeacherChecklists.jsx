import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

// ── Helpers ────────────────────────────────────────────────────────────────────
function colorPunteo(val) {
  if (val >= 9) return '#22c55e';
  if (val >= 7) return '#facc15';
  return '#ef4444';
}
function punteoPromedio(visitas) {
  if (!visitas?.length) return '—';
  return (visitas.reduce((a, v) => a + v.punteo, 0) / visitas.length).toFixed(1);
}
function scoreBadgeStyle(score) {
  if (score === null) return { background: '#f1f5f9', color: '#94a3b8' };
  if (score >= 9)     return { background: '#dcfce7', color: '#14532d' };
  if (score >= 7)     return { background: '#fde68a', color: '#713f12' };
  return               { background: '#fee2e2', color: '#991b1b' };
}
function calcPunteo(evaluaciones) {
  const completadas = (evaluaciones || []).filter((e) => e.completado && e.score !== null);
  if (!completadas.length) return null;
  return (completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1);
}

// ── Vista detalle de visita ────────────────────────────────────────────────────
function VisitaDetalleView({ docente, visita, onBack }) {
  const criterios     = visita.criteriosList         || [];
  const evaluaciones  = visita.evaluacionesGuardadas  || [];
  const observaciones = visita.observacionesGuardadas || '';
  const punteo        = calcPunteo(evaluaciones) ?? visita.punteo?.toFixed(1) ?? '—';
  const completados   = evaluaciones.filter((e) => e.completado).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button onClick={onBack} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
          &larr; Visitas / Visita {visita.numero} / Detalles de checklist
        </button>
      </div>

      <div className="bg-[#112240] rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {docente.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
            <p className="text-url-yellow font-semibold mb-4">Checklist · {visita.fecha}</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
              Total de criterios: {criterios.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{punteo}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
            <h3 className="font-bold text-xl text-[#112240]">Criterios de Evaluacion</h3>
            {completados > 0 && (
              <span className="bg-green-100 text-green-700 px-6 py-1.5 rounded-full font-bold text-sm border border-green-200">
                {completados} completados
              </span>
            )}
          </div>
          <div className="flex flex-col">
            {criterios.map((nombre, i) => {
              const ev = evaluaciones[i] ?? { completado: false, score: null };
              return (
                <div key={i} className={`flex items-center gap-4 px-8 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition ${!ev.completado ? 'opacity-55' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ev.completado ? 'bg-green-500' : 'border-2 border-gray-200'}`}>
                    {ev.completado && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 font-semibold text-[15px] ${ev.completado ? 'text-[#112240]' : 'text-gray-400'}`}>
                    {nombre}
                  </span>
                  <span className="px-5 py-1.5 rounded-md text-sm font-bold min-w-[72px] text-center" style={scoreBadgeStyle(ev.completado ? ev.score : null)}>
                    {ev.completado && ev.score !== null ? `${ev.score} / 10` : '— / 10'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm h-full">
            <p className="font-bold text-[#112240] mb-4">Observaciones generales:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[8rem]">
              {observaciones
                ? <p className="text-gray-600 text-sm">{observaciones}</p>
                : <p className="text-gray-400 text-sm">Sin observaciones.</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
const TeacherChecklists = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { docentes } = useContext(AppContext);

  const docente = docentes.find((d) => String(d.id) === String(id)) ?? docentes[0];
  const [selectedVisita, setSelectedVisita] = useState(null);

  if (!docente) return <div className="p-8 text-gray-400">Cargando...</div>;

  const visitas  = docente.visitas || [];
  const promedio = punteoPromedio(visitas);

  if (selectedVisita) {
    return <VisitaDetalleView docente={docente} visita={selectedVisita} onBack={() => setSelectedVisita(null)} />;
  }

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div>
        <button onClick={() => navigate(`/teachers/${id}`)} className="text-gray-500 hover:text-[#112240] font-semibold flex items-center gap-2 transition mb-4">
          &larr; Visitas / Resultados — {docente.nombre}
        </button>
      </div>

      <div className="bg-[#112240] rounded-xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-url-yellow text-url-blue rounded-xl flex items-center justify-center text-5xl font-serif font-bold shadow-lg shrink-0">
            {docente.iniciales}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{docente.nombre}</h1>
            <p className="text-url-yellow font-semibold mb-4">{docente.departamento || docente.facultad} · Checklists</p>
            <span className="bg-url-yellow text-url-blue px-6 py-2 rounded-md font-bold text-sm">
              Total de checklists: {visitas.length}
            </span>
          </div>
        </div>
        <div className="border-4 border-url-yellow rounded-2xl flex flex-col items-center justify-center w-32 h-32 bg-url-blue shadow-lg">
          <span className="text-5xl font-serif font-bold text-url-yellow mb-1">{promedio}</span>
          <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">Punteo final</span>
        </div>
      </div>

      {visitas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-200 shadow-sm">
          <p>Este docente no tiene visitas registradas aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {visitas.map((visita) => (
            <div key={visita.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col justify-between border border-gray-200" style={{ borderLeft: `12px solid ${visita.color || '#112240'}` }}>
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-xl text-[#112240] mb-1">Visita {visita.numero}</h4>
                    <p className="text-sm text-gray-500">{visita.nombre}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold leading-none" style={{ color: colorPunteo(visita.punteo) }}>
                      {visita.punteo.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400 font-semibold ml-1">/10</span>
                  </div>
                </div>
                <span className="bg-[#e2e8f0] text-[#475569] text-xs px-6 py-1.5 rounded-full font-bold inline-block mb-4 border border-gray-300">
                  {visita.fecha}
                </span>
                <p className="text-sm text-gray-500 mb-4">{visita.materia}</p>
              </div>
              <div className="p-6 pt-0">
                <button onClick={() => setSelectedVisita(visita)} className="bg-[#112240] text-white w-full py-3 font-bold hover:bg-blue-900 transition rounded-md text-sm">
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default TeacherChecklists;
