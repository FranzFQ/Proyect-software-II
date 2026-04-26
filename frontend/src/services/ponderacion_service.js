// src/services/ponderacion_service.js
import { getToken } from './auth_service';
import { API_URL } from './global_URL';

// Mapeo frontend-key <-> nombre exacto del criterio en la BD
export const CRITERIO_LABELS = {
  estudiantil:    'Evaluación Estudiantil',
  ceat:           'Evaluaciones CEAT',
  autoevaluacion: 'Autoevaluaciones',
  coordinador:    'Criterios de Coordinador',
  visitas:        'Checklist',
  apoyo:          'Apoyo y Colaboración',
};

export const PONDERACIONES_DEFAULT = {
  estudiantil:    30,
  ceat:           20,
  autoevaluacion: 10,
  coordinador:    20,
  visitas:        10,
  apoyo:          10,
};

function authHeaders(hasBody = false) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (hasBody) h['Content-Type'] = 'application/json';
  return h;
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Carga semestre activo, criterios y ponderaciones del backend.
 * Devuelve { values, meta, semestre }
 *   values   = { estudiantil: 30, ... }  — valores reales de la BD
 *   meta     = { estudiantil: { criterioId, semestreId, pondId }, ... }
 *   semestre = objeto del semestre activo
 */
export async function getPonderaciones() {
  // 1. Semestre activo — filtrar por activo_para_carga=true (campo booleano real)
  const semRes  = await fetch(`${API_URL}academico/semestres/?activo_para_carga=true`, { headers: authHeaders() });
  const semData = await handleResponse(semRes);
  const semList = Array.isArray(semData) ? semData : semData.results ?? [];
  const activo  = semList[0] ?? null;

  if (!activo) {
    return { values: { ...PONDERACIONES_DEFAULT }, meta: {}, semestre: null };
  }

  // 2. Criterios y ponderaciones en paralelo
  const [critRes, pondRes] = await Promise.all([
    fetch(`${API_URL}evaluaciones/criterios/`, { headers: authHeaders() }),
    fetch(`${API_URL}evaluaciones/ponderaciones/?semestre=${activo.id}`, { headers: authHeaders() }),
  ]);

  const critData = await handleResponse(critRes);
  const pondData = await handleResponse(pondRes);

  const criterios = Array.isArray(critData) ? critData : critData.results ?? [];
  const pondList  = Array.isArray(pondData) ? pondData : pondData.results ?? [];

  const values = { ...PONDERACIONES_DEFAULT };
  const meta   = {};

  for (const [key, label] of Object.entries(CRITERIO_LABELS)) {
    const criterio = criterios.find(c => c.nombre === label);
    if (!criterio) {
      // Criterio no existe en la BD — lo guardamos sin criterioId para que savePonderaciones lo salte
      meta[key] = { criterioId: null, semestreId: activo.id, pondId: null };
      continue;
    }
    const pond = pondList.find(p => p.criterio === criterio.id);
    meta[key] = {
      criterioId: criterio.id,
      semestreId: activo.id,
      pondId:     pond?.id ?? null,
    };
    if (pond) values[key] = Number(pond.porcentaje_asignado);
  }

  return { values, meta, semestre: activo };
}

/**
 * Guarda las ponderaciones en el backend (PATCH si existe, POST si no).
 * @param {object} values - { estudiantil: 30, ... }
 * @param {object} meta   - de getPonderaciones()
 * @returns {object} meta actualizado con los pondId de los registros creados
 */
export async function savePonderaciones(values, meta) {
  const updatedMeta = { ...meta };

  for (const [key, val] of Object.entries(values)) {
    const m = meta[key];
    // Saltar si no hay criterioId (criterio no existe en la BD)
    if (!m || !m.criterioId) continue;

    const payload = {
      semestre:            m.semestreId,
      criterio:            m.criterioId,
      porcentaje_asignado: Number(val),
    };

    if (m.pondId) {
      // Ya existe — PATCH
      await fetch(`${API_URL}evaluaciones/ponderaciones/${m.pondId}/`, {
        method:  'PATCH',
        headers: authHeaders(true),
        body:    JSON.stringify(payload),
      });
    } else {
      // No existe — POST
      const res     = await fetch(`${API_URL}evaluaciones/ponderaciones/`, {
        method:  'POST',
        headers: authHeaders(true),
        body:    JSON.stringify(payload),
      });
      const created = await handleResponse(res);
      if (created?.id) {
        updatedMeta[key] = { ...m, pondId: created.id };
      }
    }
  }

  return updatedMeta;
}