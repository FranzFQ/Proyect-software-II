function colorPunteo(val) {
  if (val >= 9) return "#22c55e";
  if (val >= 7) return "#facc15";
  return "#ef4444";
}

function punteoPromedio(visitas) {
  if (!visitas.length) return "—";
  return (visitas.reduce((a, v) => a + v.punteo, 0) / visitas.length).toFixed(1);
}

export default function ChecklistResultados({ docente, visitas, onBack, onVerDetalle }) {
  const promedio = punteoPromedio(visitas);

  return (
    <div className="cr-container">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <div className="cr-breadcrumb">
        <button onClick={onBack} className="cr-back-link">← Visitas</button>
        <span className="cr-sep">/</span>
        <span className="cr-crumb">
          Resultados — {docente.nombre.split(" ")[0]} {docente.nombre.split(" ")[1]}
        </span>
      </div>

      {/* Header docente */}
      <div className="cr-header-card">
        <div className="cr-avatar">{docente.iniciales}</div>
        <div className="cr-info">
          <h1 className="cr-nombre">{docente.nombre}</h1>
          <p className="cr-dept">
            {docente.departamento} · <strong>Checklists</strong>
          </p>
          <span className="cr-total-badge">Total de checklists: {visitas.length}</span>
        </div>
        <div className="cr-score-box">
          <span className="cr-score-num">{promedio}</span>
          <span className="cr-score-label">Punteo final</span>
        </div>
      </div>

      {/* Grid de visitas */}
      {visitas.length === 0 ? (
        <div className="cr-empty">
          <p>Este docente no tiene visitas registradas aún.</p>
        </div>
      ) : (
        <div className="cr-visitas-grid">
          {visitas.map((v) => (
            <div key={v.id} className="cr-visita-card" style={{ borderLeftColor: v.color || "#0f1f3d" }}>
              <div className="cr-visita-header">
                <div>
                  <span className="cr-visita-titulo">Visita {v.numero}</span>
                  <span className="cr-visita-checklist-nombre">{v.nombre}</span>
                </div>
                <span className="cr-visita-punteo" style={{ color: colorPunteo(v.punteo) }}>
                  {v.punteo.toFixed(1)}
                  <span className="cr-visita-max">/10</span>
                </span>
              </div>
              <span className="cr-visita-fecha">{v.fecha}</span>
              <span className="cr-visita-materia">{v.materia}</span>
              <button className="cr-ver-btn" onClick={() => onVerDetalle(v)}>
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = `
  .cr-container { padding: 1.5rem 2rem; background: #f1f5f9; min-height: 100%; }
  .cr-breadcrumb {
    display: flex; align-items: center; gap: .5rem;
    margin-bottom: 1.25rem; font-size: .85rem;
  }
  .cr-back-link {
    background: none; border: none; color: #3b82f6;
    cursor: pointer; font-size: .85rem; padding: 0;
  }
  .cr-back-link:hover { text-decoration: underline; }
  .cr-sep { color: #94a3b8; }
  .cr-crumb { color: #64748b; }

  .cr-header-card {
    background: #0f1f3d; border-radius: 14px;
    padding: 1.5rem 2rem;
    display: flex; align-items: center; gap: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 14px rgba(0,0,0,.18);
  }
  .cr-avatar {
    width: 64px; height: 64px; background: #FFD700; color: #0f1f3d;
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.3rem; flex-shrink: 0;
  }
  .cr-info { flex: 1; }
  .cr-nombre { font-size: 1.4rem; font-weight: 800; color: #fff; margin: 0 0 .25rem; }
  .cr-dept   { color: #FFD700; font-size: .9rem; margin: 0 0 .5rem; }
  .cr-total-badge {
    display: inline-block; background: #FFD700; color: #0f1f3d;
    padding: .2rem .75rem; border-radius: 20px; font-size: .8rem; font-weight: 700;
  }
  .cr-score-box {
    border: 3px solid #FFD700; border-radius: 12px;
    padding: .75rem 1.25rem;
    display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
  }
  .cr-score-num  { font-size: 2.2rem; font-weight: 900; color: #FFD700; line-height: 1; }
  .cr-score-label { color: #94a3b8; font-size: .75rem; margin-top: 2px; }

  .cr-visitas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.1rem;
  }
  .cr-visita-card {
    background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.07);
    border-left: 4px solid #0f1f3d;
    display: flex; flex-direction: column; gap: .3rem;
  }
  .cr-visita-header {
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .cr-visita-titulo {
    font-weight: 700; font-size: 1rem; color: #0f1f3d; display: block;
  }
  .cr-visita-checklist-nombre {
    font-size: .78rem; color: #64748b; display: block; margin-top: 1px;
  }
  .cr-visita-punteo { font-size: 1.6rem; font-weight: 900; line-height: 1; }
  .cr-visita-max    { font-size: .9rem; font-weight: 400; color: #94a3b8; }
  .cr-visita-fecha {
    display: inline-block; background: #e2e8f0; color: #475569;
    border-radius: 6px; padding: .15rem .6rem;
    font-size: .78rem; font-weight: 500; align-self: flex-start; margin-top: .2rem;
  }
  .cr-visita-materia { font-size: .85rem; color: #64748b; margin-top: .1rem; }
  .cr-ver-btn {
    margin-top: .75rem; background: #0f1f3d; color: #fff;
    border: none; border-radius: 8px; padding: .55rem;
    font-size: .85rem; font-weight: 600; cursor: pointer; transition: opacity .15s;
  }
  .cr-ver-btn:hover { opacity: .85; }
  .cr-empty {
    background: #fff; border-radius: 12px; padding: 2rem;
    text-align: center; color: #94a3b8;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }
`;