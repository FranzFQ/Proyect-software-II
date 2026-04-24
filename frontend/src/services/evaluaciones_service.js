import { getToken } from "./auth_service";
import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

/**
 * Ayuda a construir los headers con el token JWT.
 */
function authHeaders(hasBody = false) {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  return headers;
}

/**
 * Maneja la respuesta del servidor.
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || Object.values(errorData).flat().join(" ") || `Error ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

// --- EVALUACIONES CONSOLIDADAS (TABLA MACRO) ---
export async function getEvaluaciones(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/evaluaciones/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

// --- EVALUACIONES POR CURSO (DETALLE Y COMENTARIOS) ---
export async function getEvaluacionesCurso(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/evaluaciones-curso/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

// --- CURSOS DADOS (AGENDA DOCENTE) ---
export async function getCursosDados(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/cursos-dados/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

// --- CRITERIOS DE EVALUACIÓN ---
export async function getCriterios() {
  const response = await fetch(`${BASE_URL}evaluaciones/criterios/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// --- CONFIGURACIÓN DE PONDERACIONES ---
export async function getPonderaciones() {
  const response = await fetch(`${BASE_URL}evaluaciones/ponderaciones/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function updatePonderacion(id, data) {
    const response = await fetch(`${BASE_URL}evaluaciones/ponderaciones/${id}/`, {
      method: "PATCH",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
}

// --- INGESTA DE DATOS (EXCEL) ---
/**
 * Envía archivos Excel al backend para su procesamiento.
 * @param {FormData} formData - Debe contener los archivos con las keys correctas
 */
export async function subirExcels(formData) {
  const response = await fetch(`${BASE_URL}evaluaciones/ingesta/subir-archivo/`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });
  return handleResponse(response);
}
