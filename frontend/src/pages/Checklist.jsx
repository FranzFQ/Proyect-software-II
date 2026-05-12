import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ChecklistForm from '../components/checklist/ChecklistForm';
import ChecklistEjecucion from '../components/checklist/ChecklistEjecucion';
import Button from '../components/common/Button';

import { getSemestres } from '../services/academico_service';
import { getChecklists, getChecklistById, deleteChecklist as deleteChecklistService } from '../services/checklist_service';
import { API_URL } from '../services/global_URL';
import { fetchWithAuth } from '../services/auth_service';

function colorDePunteo(score) {
  if (score >= 9) return '#22c55e';
  if (score >= 7) return '#f97316';
  if (score >  0) return '#ef4444';
  return '#F5C518';
}

function ChecklistCard({ checklist, onEditar, onEjecutar, onEliminar, onToggleActivo }) {
  const activo      = checklist.activo !== false;
  const colorCard   = activo ? (checklist.color || '#1a2744') : '#9ca3af';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm transition flex flex-col gap-3 border border-gray-200 border-t-4 relative ${activo ? 'hover:shadow-md cursor-pointer' : 'opacity-60 cursor-default'}`}
      style={{ borderTopColor: colorCard }}
      onClick={() => { if (activo) onEjecutar(checklist); }}
    >
      {!activo && (
        <span className="absolute top-3 left-3 bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Inactiva
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          className="w-4 h-4 rounded-full inline-block border-2 border-white shadow-sm shrink-0 mt-1"
          style={{ background: colorCard }}
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base ${activo ? 'text-url-blue' : 'text-gray-400'}`}>{checklist.titulo}</h3>
          <p className="text-sm text-gray-500 mt-1">{checklist.criterios} criterios</p>
        </div>

        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
                <button
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${activo ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                  onClick={() => { setMenuOpen(false); onToggleActivo(checklist); }}
                >
                  {activo ? "Desactivar" : "Activar"}
                </button>

                <div className="border-t border-gray-100 my-1" />

                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-semibold transition"
                  onClick={() => { setMenuOpen(false); onEliminar(checklist); }}
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center pt-1">
        <Button
          variant="secondary"
          onClick={(e) => { e.stopPropagation(); onEditar(checklist); }}
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

function normalizeChecklist(raw) {
  const datos = raw.datos ?? {};
  const punteo = parseFloat(raw.punteo ?? datos.punteo_final ?? 0);

  return {
    id:           raw.id,
    titulo:       raw.titulo,
    nombre:       raw.titulo,
    color:        datos.color || '#1a2744',
    punteo,
    activo:       raw.activo,
    criterios:    (datos.criteriosList ?? []).length,
    criteriosList:datos.criteriosList ?? [],
    datos,
    docentesObservados: datos.docentesObservados ?? [],
  };
}

export default function Checklist() {
  const { currentUser } = useContext(AppContext);

  const [checklists,          setChecklists]          = useState([]);
  const [totalChecklists,     setTotalChecklists]     = useState(0);
  const [semestre,            setSemestre]            = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [currentPage,         setCurrentPage]         = useState(1);
  const itemsPerPage = 12;

  const [showForm,            setShowForm]            = useState(false);
  const [editingChecklist,    setEditingChecklist]    = useState(null);
  const [ejecutandoChecklist, setEjecutandoChecklist] = useState(null);
  const [modoEdicion,         setModoEdicion]         = useState(false);

  useEffect(() => { fetchData(); }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const [data, semRes] = await Promise.all([
        getChecklists({ limit: itemsPerPage, offset }),
        getSemestres(),
      ]);

      const list = Array.isArray(data) ? data : (data.results ?? []);
      setChecklists(list.map(normalizeChecklist));
      setTotalChecklists(data.count ?? list.length);

      const semList = Array.isArray(semRes) ? semRes : semRes.results ?? [];
      setSemestre(semList.find(e => e.activo_para_carga));
    } catch (error) {
      console.error('Error al cargar checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaChecklist  = () => { setEditingChecklist(null); setShowForm(true); };

  const loadFull = async (id) => {
    const data = await getChecklistById(id);
    return normalizeChecklist(data);
  };

  const handleEditar = async (checklist) => {
    setLoading(true);
    try {
      const full = await loadFull(checklist.id);
      setEditingChecklist(full);
      setShowForm(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEjecutar = async (checklist) => {
    setLoading(true);
    try {
      const full = await loadFull(checklist.id);
      setModoEdicion(false);
      setEjecutandoChecklist(full);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEliminar = async (checklist) => {
    if (!window.confirm(`¿Eliminar la checklist "${checklist.titulo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteChecklistService(checklist.id);
      await fetchData();
    } catch (e) { console.error('Error al eliminar checklist:', e); }
  };

  const handleToggleActivo = async (checklist) => {
    try {
      const res = await fetchWithAuth(`${API_URL}evaluaciones/checklists/${checklist.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !checklist.activo }),
      });
      if (res.ok) await fetchData();
    } catch (e) { console.error('Error al cambiar estado:', e); }
  };

  const handleGuardarChecklist = async (data) => {
    const payload = {
      titulo:  data.titulo,
      activo:  true,
      datos: {
        color:         data.color,
        criteriosList: data.criteriosList,
      },
    };
    try {
      if (editingChecklist) {
        await fetchWithAuth(`${API_URL}evaluaciones/checklists/${editingChecklist.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAuth(`${API_URL}evaluaciones/checklists/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      await fetchData();
    } catch (e) { console.error('Error guardando checklist:', e); }
    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleGuardarEjecucion = async (resultado) => {
    const { criteriosList, evaluaciones, observaciones, docentesObservados } = resultado;

    const completadas = evaluaciones.filter(e => e.completado && e.score !== null);
    const punteoCalculado = completadas.length
      ? parseFloat((completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1))
      : ejecutandoChecklist.punteo;

    try {
      await fetchWithAuth(`${API_URL}evaluaciones/checklists/${ejecutandoChecklist.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          punteo: punteoCalculado,
          datos: {
            ...(ejecutandoChecklist.datos ?? {}),
            criteriosList,
            docentesObservados,
          },
        }),
      });

      for (const doc of docentesObservados) {
        const obsPayload = {
          curso_dado: doc.cursoDadoId,
          checklist:  ejecutandoChecklist.id,
          usuario:    currentUser?.id ?? null,
          punteo:     punteoCalculado,
          datos: {
            criteriosList,
            evaluaciones,
            observaciones,
            docente:       doc.docente,
            codigoDocente: doc.codigoDocente,
            nombreCurso:   doc.nombreCurso,
            seccion:       doc.seccion,
            punteo_final:  punteoCalculado,
          },
        };
        await fetchWithAuth(`${API_URL}evaluaciones/checklist-observaciones/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obsPayload),
        });
      }

      await fetchData();
    } catch (error) {
      console.error('Error al guardar ejecución:', error);
    }

    setEjecutandoChecklist(null);
    setModoEdicion(false);
  };

  if (ejecutandoChecklist && !loading) {
    return (
      <ChecklistEjecucion
        checklist={ejecutandoChecklist}
        semestre={semestre}
        modoEdicion={modoEdicion}
        onGuardar={handleGuardarEjecucion}
        onCancelar={() => { setEjecutandoChecklist(null); setModoEdicion(false); }}
      />
    );
  }

  const semLabel = semestre ? `${semestre.anio} - Ciclo ${semestre.ciclo}` : '—';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue">Checklists</h1>
          <p className="text-gray-500">
            {semLabel} · <strong>{totalChecklists} registradas</strong>
          </p>
        </div>
        <Button variant="primary" onClick={handleNuevaChecklist}>
          + Nueva Checklist
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : checklists.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200 shadow-sm">
          <p className="font-semibold mb-1">No hay checklists registradas</p>
          <p className="text-sm">Crea una nueva checklist para comenzar.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {checklists.map(checklist => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onEditar={() => handleEditar(checklist)}
                onEjecutar={() => handleEjecutar(checklist)}
                onEliminar={handleEliminar}
                onToggleActivo={handleToggleActivo}
              />
            ))}
          </div>

          {totalChecklists > itemsPerPage && (
            <div className="mt-8 flex justify-end items-center gap-4 text-sm font-bold text-url-blue">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40"
              >
                &larr; Anterior
              </button>
              <span>Página {currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={(currentPage * itemsPerPage) >= totalChecklists}
                className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40"
              >
                Siguiente &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <ChecklistForm
          checklist={editingChecklist}
          onGuardar={handleGuardarChecklist}
          onCancelar={() => { setShowForm(false); setEditingChecklist(null); }}
        />
      )}
    </div>
  );
}