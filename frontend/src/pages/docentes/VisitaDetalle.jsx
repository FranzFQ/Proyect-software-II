function scoreBadgeStyle(score) {
  if (score === null) return { background: "#f1f5f9", color: "#94a3b8" };
  if (score >= 9)     return { background: "#dcfce7", color: "#14532d" };
  if (score >= 7)     return { background: "#fde68a", color: "#713f12" };
  return               { background: "#fee2e2", color: "#991b1b" };
}

function calcPunteo(evaluaciones) {
  const completadas = (evaluaciones || []).filter((e) => e.completado && e.score !== null);
  if (!completadas.length) return null;
  return (completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1);
}

export default function VisitaDetalle({ docente, visita, onBack }) {
  const criterios    = visita.criteriosList      || [];
  const evaluaciones = visita.evaluacionesGuardadas || [];
  const observaciones = visita.observacionesGuardadas || "";
  const punteo       = calcPunteo(evaluaciones) ?? visita.punteo?.toFixed(1) ?? "—";
  const completados  = evaluaciones.filter((e) => e.completado).length;

  return (
    <div className="vd-container">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <div className="vd-breadcrumb">
        <button onClick={onBack} className="vd-back-link">← Visitas</button>
        <span className="vd-sep">/</span>
        <span className="vd-crumb">Visita {visita.numero}</span>
        <span className="vd-sep">/</span>
        <span className="vd-crumb">Detalles de checklist</span>
      </div>

      {/* Header docente — igual al diseño */}
      <div className="vd-header-card">
        <div className="vd-avatar">{docente.iniciales}</div>
        <div className="vd-info">
          <h1 className="vd-nombre">{docente.nombre}</h1>
          <p className="vd-sub">Checklist · {visita.fecha}</p>
          <span className="vd-badge">Total de criterios: {criterios.length}</span>
        </div>
        <div className="vd-score-box">
          <span className="vd-score-num">{punteo}</span>
          <span className="vd-score-label">Punteo final</span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="vd-body">

        {/* Criterios */}
        <div className="vd-criterios-card">
          <div className="vd-criterios-header">
            <span className="vd-section-title">Criterios de Evaluacion</span>
            {completados > 0 && (
              <span className="vd-completados-badge">{completados} completados</span>
            )}
          </div>

          <div className="vd-criterios-list">
            {criterios.map((nombre, i) => {
              const ev = evaluaciones[i] ?? { completado: false, score: null };
              return (
                <div
                  key={i}
                  className={`vd-criterio-row ${!ev.completado ? "vd-criterio--pending" : ""}`}
                >
                  {/* Círculo check */}
                  <div className={`vd-check ${ev.completado ? "vd-check--done" : ""}`}>
                    {ev.completado && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Nombre */}
                  <span className={`vd-criterio-nombre ${!ev.completado ? "vd-criterio-nombre--pending" : ""}`}>
                    {nombre}
                  </span>

                  {/* Badge score */}
                  <span
                    className="vd-score-badge"
                    style={scoreBadgeStyle(ev.completado ? ev.score : null)}
                  >
                    {ev.completado && ev.score !== null ? `${ev.score} / 10` : "— / 10"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observaciones */}
        <div className="vd-obs-card">
          <p className="vd-obs-title">Observaciones generales:</p>
          <div className="vd-obs-box">
            {observaciones || <span style={{ color: "#94a3b8" }}>Sin observaciones.</span>}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = `
  .vd-container { padding: 1.5rem 2rem; background: #f1f5f9; min-height: 100%; }

  /* Breadcrumb */
  .vd-breadcrumb {
    display: flex; align-items: center; gap: .5rem;
    margin-bottom: 1.25rem; font-size: .85rem;
  }
  .vd-back-link {
    background: none; border: none; color: #3b82f6;
    cursor: pointer; font-size: .85rem; padding: 0;
  }
  .vd-back-link:hover { text-decoration: underline; }
  .vd-sep   { color: #94a3b8; }
  .vd-crumb { color: #64748b; }

  /* Header */
  .vd-header-card {
    background: #0f1f3d; border-radius: 14px;
    padding: 1.5rem 2rem;
    display: flex; align-items: center; gap: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 14px rgba(0,0,0,.18);
  }
  .vd-avatar {
    width: 68px; height: 68px; background: #FFD700; color: #0f1f3d;
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 1.4rem; flex-shrink: 0;
  }
  .vd-info { flex: 1; }
  .vd-nombre { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0 0 .2rem; }
  .vd-sub    { color: #FFD700; font-size: .88rem; margin: 0 0 .5rem; }
  .vd-badge  {
    display: inline-block; background: #FFD700; color: #0f1f3d;
    padding: .22rem .8rem; border-radius: 20px; font-size: .8rem; font-weight: 700;
  }
  .vd-score-box {
    border: 3px solid #FFD700; border-radius: 14px;
    padding: .85rem 1.4rem;
    display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
    min-width: 90px;
  }
  .vd-score-num   { font-size: 2.4rem; font-weight: 900; color: #FFD700; line-height: 1; }
  .vd-score-label { color: #94a3b8; font-size: .75rem; margin-top: 3px; }

  /* Cuerpo */
  .vd-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 1.25rem;
    align-items: start;
  }
  @media (max-width: 768px) { .vd-body { grid-template-columns: 1fr; } }

  /* Criterios card */
  .vd-criterios-card {
    background: #fff; border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,.07);
    overflow: hidden;
  }
  .vd-criterios-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
  }
  .vd-section-title  { font-weight: 700; color: #0f1f3d; font-size: .95rem; }
  .vd-completados-badge {
    background: #dcfce7; color: #14532d;
    padding: .25rem .9rem; border-radius: 20px;
    font-size: .8rem; font-weight: 600;
  }

  /* Filas de criterios */
  .vd-criterios-list { display: flex; flex-direction: column; }
  .vd-criterio-row {
    display: flex; align-items: center; gap: 1rem;
    padding: .9rem 1.5rem;
    border-bottom: 1px solid #f8fafc;
    transition: background .12s;
  }
  .vd-criterio-row:last-child { border-bottom: none; }
  .vd-criterio-row:hover { background: #fafbfc; }
  .vd-criterio--pending { opacity: .55; }

  /* Check circle */
  .vd-check {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: #fff;
  }
  .vd-check--done { background: #22c55e; border-color: #22c55e; }

  /* Nombre */
  .vd-criterio-nombre {
    flex: 1; font-size: .92rem; font-weight: 600; color: #1e293b;
  }
  .vd-criterio-nombre--pending { color: #94a3b8; font-weight: 400; }

  /* Score badge */
  .vd-score-badge {
    padding: .3rem .9rem; border-radius: 8px;
    font-size: .88rem; font-weight: 700;
    flex-shrink: 0; min-width: 72px; text-align: center;
  }

  /* Observaciones */
  .vd-obs-card {
    background: #fff; border-radius: 12px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,.07);
  }
  .vd-obs-title { font-weight: 700; color: #0f1f3d; font-size: .9rem; margin: 0 0 .75rem; }
  .vd-obs-box {
    background: #f8fafc; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: .85rem 1rem;
    font-size: .88rem; color: #475569; line-height: 1.5;
    min-height: 80px;
  }
`;