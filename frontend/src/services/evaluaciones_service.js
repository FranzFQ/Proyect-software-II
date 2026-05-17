import { fetchWithAuth } from "./auth_service";
import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

// --- EVALUACIONES CONSOLIDADAS (TABLA MACRO) ---
export async function getEvaluaciones(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/evaluaciones/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

// --- EVALUACIONES POR CURSO (DETALLE Y COMENTARIOS) ---
export async function getEvaluacionesCurso(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/evaluaciones-curso/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

export async function createCursoDado(data) {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/cursos-dados/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// --- CURSOS DADOS (AGENDA DOCENTE) ---
export async function getCursosDados(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/cursos-dados/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

/**
 * Obtiene el detalle de una asignación específica por su ID.
 */
export async function getCursoDadoById(id) {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/cursos-dados/${id}/`);
  return response.json();
}

// --- CRITERIOS DE EVALUACIÓN ---
export async function getCriterios() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/criterios/`);
  return response.json();
}

// --- CONFIGURACIÓN DE PONDERACIONES ---
export async function getPonderaciones() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/ponderaciones/`);
  return response.json();
}

export async function updatePonderacion(id, data) {
    const response = await fetchWithAuth(`${BASE_URL}evaluaciones/ponderaciones/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
}

export async function getAnalisisTexto(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/analisis-texto/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

// 
export async function getDashboardResumen() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/dashboard/resumen/`);
  return response.json();
}

export async function getDashboardEstadisticas() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/dashboard/estadisticas/`);
  return response.json();
}

export async function getDashboardPromediosCriterios() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/dashboard/promedios_criterios/`);
  return response.json();
}

export async function getDashboardDistribucionRendimiento() {
  const response = await fetchWithAuth(`${BASE_URL}evaluaciones/dashboard/distribucion_rendimiento/`);
  return response.json();
}

//INGESTA DE DATOS (EXCEL)
export async function subirExcels(formData) {
  const response = await fetch(`${BASE_URL}evaluaciones/ingesta/subir-archivo/`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

