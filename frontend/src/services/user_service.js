// src/services/usuarioService.js
// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO DE USUARIOS / COORDINADORES
//
// ¿Qué hace este archivo?
//   Encapsula todas las llamadas al endpoint /api/usuarios/ del backend.
//   Cada función corresponde a una operación CRUD:
//     • getUsuarios()          → GET    /api/usuarios/
//     • createUsuario()        → POST   /api/usuarios/
//     • updateUsuario()        → PATCH  /api/usuarios/{id}/
//     • deleteUsuario()        → DELETE /api/usuarios/{id}/
//
// ¿Por qué PATCH y no PUT?
//   PUT reemplaza el objeto COMPLETO (debes enviar todos los campos).
//   PATCH actualiza solo los campos que envías. Como el formulario puede
//   omitir la contraseña (para no cambiarla), PATCH es lo correcto.
//
// ¿Cómo funciona la autenticación?
//   Todas las funciones llaman a getToken() de authService para adjuntar
//   el JWT en el header "Authorization: Bearer <token>". Si el token es
//   null (sesión expirada), el backend devolverá 401 y el interceptor
//   de errores lo manejará.
// ─────────────────────────────────────────────────────────────────────────────

import { getToken } from "./auth_service";
import GLOBAL_API_URL from "./global_URL";

const BASE_URL = GLOBAL_API_URL;

// ─── HELPER: headers comunes ──────────────────────────────────────────────────
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

// ─── HELPER: manejo de errores ────────────────────────────────────────────────
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

// ─── 1. LISTAR USUARIOS ───────────────────────────────────────────────────────
/**
 * Obtiene la lista de usuarios del backend.
 * Soporta parámetros de búsqueda y filtrado del ViewSet de Django.
 *
 * Ejemplos de uso:
 *   getUsuarios()                           → todos
 *   getUsuarios({ search: 'juan' })         → busca por nombre/email/username
 *   getUsuarios({ is_staff: true })         → solo administradores
 *   getUsuarios({ carrera: 3 })             → filtrar por carrera (id)
 *
 * @param {object} params - Parámetros de query opcionales
 * @returns {Promise<Array>}
 */
export async function getUsuarios(params = {}) {
  // Convertimos el objeto params a query string: { search: 'juan' } → '?search=juan'
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/usuarios/usuarios/${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// ─── 2. CREAR USUARIO ─────────────────────────────────────────────────────────
/**
 * Crea un nuevo usuario/coordinador en el backend.
 *
 * El body debe tener al menos:
 *   { username, email, first_name, last_name, password, is_staff, carrera?, facultad? }
 *
 * El serializer de Django maneja el hash de la contraseña mediante set_password().
 *
 * @param {object} data - Datos del nuevo usuario
 * @returns {Promise<object>} - El usuario creado con su id asignado
 */
export async function createUsuario(data) {
  const response = await fetch(`${BASE_URL}/usuarios/usuarios/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// ─── 3. ACTUALIZAR USUARIO (PATCH) ────────────────────────────────────────────
/**
 * Actualiza parcialmente un usuario existente.
 *
 * Si no quieres cambiar la contraseña, simplemente no incluyas el campo
 * "password" en el objeto data. El serializer de Django lo ignora si no
 * está presente (porque tiene required: False).
 *
 * @param {number} id   - ID del usuario a actualizar
 * @param {object} data - Campos a actualizar (solo los que cambian)
 * @returns {Promise<object>} - El usuario actualizado
 */
export async function updateUsuario(id, data) {
  const response = await fetch(`${BASE_URL}/usuarios/usuarios/${id}/`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// ─── 4. ELIMINAR USUARIO ──────────────────────────────────────────────────────
/**
 * Elimina un usuario por su ID.
 * El backend responde con 204 No Content si fue exitoso.
 *
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<null>}
 */
export async function deleteUsuario(id) {
  const response = await fetch(`${BASE_URL}/usuarios/usuarios/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// ─── 5. NORMALIZAR USUARIO ────────────────────────────────────────────────────
/**
 * Convierte el formato del backend al formato que usa Coordinadores.jsx.
 *
 * El backend devuelve:
 *   { id, username, email, first_name, last_name, CarreraNombre,
 *     FacultadNombre, is_staff, is_active, ... }
 *
 * El componente espera:
 *   { id, nombre, iniciales, correo, carrera, facultad, esAdmin }
 *
 * @param {object} u - Usuario tal como viene del backend
 * @returns {object}  - Usuario normalizado para el componente
 */
export function normalizeCoordinador(u) {
  const firstName = u.first_name || "";
  const lastName = u.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || u.username;
  const iniciales =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

  return {
    id: u.id,
    nombre: fullName,
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
