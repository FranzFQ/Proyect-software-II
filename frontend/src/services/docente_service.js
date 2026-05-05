import { getToken, fetchWithAuth } from "./auth_service";
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
 * Obtiene la lista de docentes.
 * Soporta filtros como ?facultad=1 o ?search=nombre
 */
export async function getDocentes(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}usuarios/docentes/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url, { headers: authHeaders() });
  return handleResponse(response);
}

/**
 * Obtiene el detalle de un docente específico por su ID.
 * Útil para la página de TeacherProfile.
 */
export async function getDocenteById(id) {
  const response = await fetchWithAuth(`${BASE_URL}usuarios/docentes/${id}/`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function getTopDocentes() {
    const response = await fetch(`${BASE_URL}usuarios/docentes/top_docentes/`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
}

/**
 * Permite actualizar datos del docente (si es necesario).
 */
export async function updateDocente(id, data) {
  const response = await fetch(`${BASE_URL}usuarios/docentes/${id}/`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Función de utilidad para normalizar los datos del docente para los componentes UI.
 */
export function normalizeDocente(d) {
  return {
    id: d.id,
    nombre: d.nombre_completo || `${d.first_name} ${d.last_name}`,
    codigo: d.codigo_docente || d.id,
    facultad: d.FacultadNombre || "N/A",
    correo: d.email || "Sin correo",
    // Agrega aquí más campos según lo que devuelva tu serializer
  };
}
