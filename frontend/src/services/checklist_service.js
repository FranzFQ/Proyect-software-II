import { getToken } from "./auth_service";
import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

function authHeaders(hasBody = false) {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || Object.values(errorData).flat().join(" ") || `Error ${response.status}`;
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

/**
 * Obtiene todas las checklists/observaciones guardadas.
 */
export async function getChecklists(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}evaluaciones/checklists/${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url, { headers: authHeaders() });
  return handleResponse(response);
}

/**
 * Guarda una nueva observación de checklist.
 * @param {object} data - Contiene docente, curso, y las observaciones JSON.
 */
export async function createChecklist(data) {
  const response = await fetch(`${BASE_URL}evaluaciones/checklists/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Obtiene una checklist específica por ID.
 */
export async function getChecklistById(id) {
  const response = await fetch(`${BASE_URL}evaluaciones/checklists/${id}/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

/**
 * Elimina una observación.
 */
export async function deleteChecklist(id) {
  const response = await fetch(`${BASE_URL}evaluaciones/checklists/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}
