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

// --- FACULTADES ---
export async function getFacultades() {
  const response = await fetch(`${BASE_URL}academico/facultades/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// --- CARRERAS ---
export async function getCarreras(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}academico/carreras/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

// --- SEMESTRES ---
export async function getSemestres() {
  const response = await fetch(`${BASE_URL}academico/semestres/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// --- CURSOS ---
export async function getCursos(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}academico/cursos/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

// --- PENSUMS ---
export async function getPensums() {
  const response = await fetch(`${BASE_URL}academico/pensums/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}
