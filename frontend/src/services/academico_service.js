import { getToken, fetchWithAuth } from "./auth_service";
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

// --- FACULTADES ---
export async function getFacultades() {
  const response = await fetchWithAuth(`${BASE_URL}academico/facultades/`);
  return handleResponse(response);
}

// --- CARRERAS ---
export async function getCarreras(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}academico/carreras/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url, { headers: authHeaders() });
  return handleResponse(response);
}

export async function getCarrerasWithoutParams() {
  const response = await fetchWithAuth(`${BASE_URL}academico/carreras/`, { headers: authHeaders() });
  return handleResponse(response);
}

// --- SEMESTRES ---
export async function getSemestres(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}academico/semestres/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url, { headers: authHeaders() });
  return handleResponse(response);
}

export async function createSemestre(data) {
  const response = await fetch(`${BASE_URL}academico/semestres/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateSemestre(id, data) {
  const response = await fetchWithAuth(`${BASE_URL}academico/semestres/${id}/`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteSemestre(id) {
  const response = await fetch(`${BASE_URL}academico/semestres/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getSemestreActivo() {
    const response = await fetchWithAuth(`${BASE_URL}academico/semestres/activo/`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
}

// --- CURSOS ---
export async function getCursos(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}academico/cursos/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url, { headers: authHeaders() });
  return handleResponse(response);
}

export async function getCursosWithoutParams() {
  const response = await fetchWithAuth(`${BASE_URL}academico/cursos/`, { headers: authHeaders() });
  return handleResponse(response);
}

// --- PENSUMS ---
export async function getPensums() {
  const response = await fetchWithAuth(`${BASE_URL}academico/pensums/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}
