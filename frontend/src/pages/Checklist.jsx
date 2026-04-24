import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ChecklistForm from '../components/checklist/ChecklistForm';
import ChecklistEjecucion from '../components/checklist/ChecklistEjecucion';
import Button from '../components/common/Button';

// Servicios
import { getChecklists, createChecklist } from '../services/checklist_service';
import { getSemestres } from '../services/academico_service';
import { API_URL } from '../services/global_URL';

function colorDePunteo(score) {
  if (score >= 9) return '#22c55e';
  if (score >= 7) return '#f97316';
  if (score >  0) return '#ef4444';
  return '#F5C518';
}

function ScoreBar({ punteo, color }) {
  const pct = Math.min((punteo / 10) * 100, 100);
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function ChecklistCard({ checklist, onEditar, onEjecutar }) {
  const color = colorDePunteo(checklist.punteo);
  const scoreColor =
    checklist.punteo >= 9 ? 'text-green-600' :
    checklist.punteo >= 7 ? 'text-orange-500' : 'text-red-500';

  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3 border border-gray-200 border-t-4 cursor-pointer"
      style={{ borderTopColor: color }}
      onClick={() => onEjecutar(checklist)}
    >
      <div>
        <h3 className="font-bold text-url-blue text-base">{checklist.nombre}</h3>
        <p className="text-sm text-gray-500">Docente: {checklist.docente}</p>
        {checklist.nombreCurso && (
          <p className="text-xs text-gray-400">Curso: {checklist.nombreCurso}</p>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{checklist.criterios} criterios</span>
        <span>
          Punteo de visita{' '}
          <strong className={`${checklist.punteo > 0 ? scoreColor : 'text-gray-400'} text-base`}>
            {checklist.punteo > 0 ? checklist.punteo : '—'}
          </strong>
        </span>
      </div>

      <ScoreBar punteo={checklist.punteo} color={color} />

      <div className="flex justify-between items-center pt-1">
        <span className="bg-url-blue text-white text-xs px-3 py-1 rounded font-semibold">
          {checklist.codigoDocente}
        </span>
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
  // raw.datos vendrá undefined en la lista (GET /), pero vendrá lleno en GET /id/
  const datos = raw.datos ?? {};
  
  // Buscamos el punteo en la raíz o dentro del JSON de datos
  const punteo = parseFloat(raw.punteo || datos.punteo_final || 0);

  return {
    id:           raw.id,
    cursoDadoId:  raw.curso_dado,
    nombre:       raw.titulo,
    docente:      raw.DocenteNombre || datos.docente || '',
    docenteId:    datos.docenteId ?? null,
    codigoDocente:raw.CodigoDocente || datos.codigoDocente || raw.CursoDadoStr || '',
    nombreCurso:  raw.NombreCurso || datos.nombreCurso || '',
    seccion:      datos.seccion ?? '',
    criterios:    (datos.criteriosList ?? []).length,
    criteriosList:datos.criteriosList ?? [],
    punteo,
    datos,
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

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const [checklistsData, semData] = await Promise.all([
        getChecklists({ limit: itemsPerPage, offset }),
        getSemestres({ activo_para_carga: true }),
      ]);
      
      // Ajuste: Soportar respuesta paginada {results: []} o lista simple []
      const list = Array.isArray(checklistsData) ? checklistsData : (checklistsData.results ?? []);
      setChecklists(list.map(normalizeChecklist));
      setTotalChecklists(checklistsData.count ?? list.length);

      const semList = Array.isArray(semData) ? semData : semData.results ?? [];
      setSemestre(semList[0] ?? null);
    } catch (error) {
      console.error("Error al cargar checklists:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaChecklist = () => { setEditingChecklist(null); setShowForm(true); };

  const handleEditar = async (checklist) => {
    // Para editar o ejecutar, necesitamos el JSON completo (datos), 
    // así que hacemos un fetch del detalle por ID
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}evaluaciones/checklists/${checklist.id}/`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}` }
        });
        const fullData = await res.json();
        const normalized = normalizeChecklist(fullData);
        setEditingChecklist(normalized);
        setModoEdicion(true);
        setEjecutandoChecklist(normalized);
    } catch (e) {
        console.error("Error al cargar detalle:", e);
    } finally {
        setLoading(false);
    }
  };

  const handleEjecutar = async (checklist) => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}evaluaciones/checklists/${checklist.id}/`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}` }
        });
        const fullData = await res.json();
        const normalized = normalizeChecklist(fullData);
        setModoEdicion(false);
        setEjecutandoChecklist(normalized);
    } catch (e) {
        console.error("Error al cargar detalle:", e);
    } finally {
        setLoading(false);
    }
  };

  const handleGuardarChecklist = async (data) => {
    const payload = {
      curso_dado: data.cursoDadoId,
      titulo:     data.nombre,
      usuario:    currentUser?.id ?? null,
      punteo:     data.punteo ?? 0,
      datos: {
        docente:      data.docente,
        docenteId:    data.docenteId,
        codigoDocente:data.codigoDocente,
        nombreCurso:  data.nombreCurso,
        seccion:      data.seccion,
        criteriosList:data.criteriosList,
        punteo_final: data.punteo ?? 0,
      },
    };
    try {
      let res;
      if (editingChecklist) {
        res = await fetch(`${API_URL}evaluaciones/checklists/${editingChecklist.id}/`, {
          method: 'PATCH', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }, 
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}evaluaciones/checklists/`, {
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }, 
          body: JSON.stringify(payload),
        });
      }
      
      if (res.ok) {
        await fetchData();
        setShowForm(false);
        setEditingChecklist(null);
      }
    } catch (e) {
      console.error('Error guardando checklist:', e);
    }
    setShowForm(false);
    setEditingChecklist(null);
  };

  const handleGuardarEjecucion = async (resultado) => {
    const { criteriosList, evaluaciones, observaciones } = resultado;

    const completadas = evaluaciones.filter(e => e.completado && e.score !== null);
    const punteoCalculado = completadas.length
      ? parseFloat((completadas.reduce((a, e) => a + e.score, 0) / completadas.length).toFixed(1))
      : ejecutandoChecklist.punteo;

    // 1. Actualizamos la Checklist (el contenido/JSON)
    const checklistPatch = {
      datos: {
        ...(ejecutandoChecklist.datos ?? {}),
        criteriosList,
        evaluaciones,
        observaciones,
        punteo_final: punteoCalculado,
      },
    };

    // 2. Creamos o actualizamos la Observación (la relación y la nota)
    const observationPayload = {
      curso_dado: ejecutandoChecklist.cursoDadoId,
      checklist: ejecutandoChecklist.id,
      usuario: currentUser?.id ?? null,
      punteo: punteoCalculado
    };

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      };

      // Guardar cambios en la Checklist
      await fetch(`${API_URL}evaluaciones/checklists/${ejecutandoChecklist.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify(checklistPatch),
      });

      // Crear el registro de observación para conectar con el docente/curso
      await fetch(`${API_URL}evaluaciones/checklist-observaciones/`, {
        method: 'POST', headers, body: JSON.stringify(observationPayload),
      });

      await fetchData();
    } catch (error) {
        console.error("Error al guardar ejecución:", error);
    }

    setEjecutandoChecklist(null);
    setModoEdicion(false);
  };

  if (ejecutandoChecklist && !loading) {
    return (
      <ChecklistEjecucion
        checklist={ejecutandoChecklist}
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
            {semLabel} · <strong>{totalChecklists} registrados</strong>
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
          <p className="font-semibold mb-1">No hay checklists registrados</p>
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
              />
            ))}
          </div>

          {/* Paginación */}
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
