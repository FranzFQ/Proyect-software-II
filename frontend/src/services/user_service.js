import { getToken, fetchWithAuth } from "./auth_service";
import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

/**
 * Construye los headers HTTP con el token JWT.
 * @param {boolean} hasBody - true si la petición lleva un JSON body
 */
function authHeaders(hasBody = false) {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  return headers;
}

/**
 * Si el response no es OK, lanza un Error con el detalle del backend.
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // El backend de DRF devuelve errores en diferentes formatos; intentamos
    // obtener el mensaje más descriptivo posible.
    const message =
      errorData.detail ||
      Object.values(errorData).flat().join(" ") ||
      `Error ${response.status}`;
    throw new Error(message);
  }
  // 204 No Content (respuesta de DELETE) no tiene body
  if (response.status === 204) return null;
  return response.json();
}

/**
 * Obtiene la lista de usuarios del backend.
 * Soporta parámetros de búsqueda y filtrado del ViewSet de Django.
 *
 * @param {object} params - Parámetros de query opcionales
 * @returns {Promise<Array>}
 */
export async function getUsuarios(params = {}) {
  // Convertimos el objeto params a query string: { search: 'juan' } → '?search=juan'
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}usuarios/usuarios/${queryString ? `?${queryString}` : ""}`;
  const response = await fetchWithAuth(url, {
    method: "GET",
  });
  return handleResponse(response);
}

/**
 * Crea un nuevo usuario/coordinador en el backend.
 *
 * El serializer de Django maneja el hash de la contraseña mediante set_password().
 *
 * @param {object} data 
 * @returns {Promise<object>}
 */
export async function createUsuario(data) {
  const response = await fetch(`${BASE_URL}usuarios/usuarios/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Actualiza parcialmente un usuario existente.
 *
 * Si no quieres cambiar la contraseña, simplemente no incluyas el campo
 * "password" en el objeto data. El serializer de Django lo ignora si no
 * está presente (porque tiene required: False).
 *
 * @param {number} id   
 * @param {object} data 
 * @returns {Promise<object>} 
 */
export async function updateUsuario(id, data) {
  const response = await fetch(`${BASE_URL}usuarios/usuarios/${id}/`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

/**
 * Elimina un usuario por su ID.
 * El backend responde con 204 No Content si fue exitoso.
 *
 * @param {number} id 
 * @returns {Promise<null>}
 */
export async function deleteUsuario(id) {
  const response = await fetchWithAuth(
    `${BASE_URL}usuarios/usuarios/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_active: false }),
    }
  );

  return handleResponse(response);
}

/**
 * Convierte el formato del backend al formato que usa Coordinadores.jsx.
 *
 * @param {object} u 
 * @returns {object}  
 */
export function normalizeCoordinador(u) {
  const firstName = u.first_name || "";
  const lastName = u.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || u.username;
  const iniciales =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  return {
    id: u.id,
    nombre_completo: fullName,
    nombre: firstName,
    apellido: lastName,
    iniciales,
    correo: u.email,
    carrera: u.CarreraNombre || "—",
    facultad: u.FacultadNombre || "—",
    esAdmin: u.is_staff,
    // Guardamos el username por si necesitas enviar PATCH
    username: u.username,
    // Guardamos los IDs de FK por si necesitas editarlos
    carreraId: u.carrera,
    facultadId: u.facultad,
  };
}
