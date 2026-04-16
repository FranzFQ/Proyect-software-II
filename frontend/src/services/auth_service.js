import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

// Claves que usamos en sessionStorage (constantes para evitar typos)
const TOKEN_KEY   = 'auth_token';
const USER_KEY    = 'auth_user';

/**
 * Hace POST /api/token/ (JWT de DRF Simple JWT).
 * @param {string} email    
 * @param {string} password 
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  const response = await fetch(`${BASE_URL}token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    // Lanzamos un error con el mensaje del backend si existe
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Credenciales incorrectas');
  }

  const data = await response.json();
  // DRF Simple JWT devuelve { access: "...", refresh: "..." }
  const token = data.access;

  // Con el token, pedimos los datos del usuario logueado
  const user = await fetchCurrentUser(token);

  // ★ PERSISTENCIA: guardamos en sessionStorage
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token, user };
}

/**
 * Borra el token y el usuario de sessionStorage.
 */
export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

/**
 * Lee sessionStorage y devuelve el usuario guardado (o null si no hay sesión).
 * @returns {object|null}
 */
export function getSavedUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Devuelve el token JWT guardado en sessionStorage.
 * @returns {string|null}
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Utilidad rápida: retorna true si hay un token guardado.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Llama a /api/usuarios/me/ (o el endpoint que tengas) para obtener los datos del login
 */
async function fetchCurrentUser(token) {
  // Si no tienes un endpoint /me/, puedes construir el objeto manualmente
  const response = await fetch(`${BASE_URL}usuarios/usuarios/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la información del usuario');
  }

  const userData = await response.json();
  console.log("Datos del usuario obtenidos del backend:", userData);

  // Adaptamos los campos del backend a la forma que usa el Sidebar
  return normalizeUser(userData);
}

/**
 * Convierte el objeto Usuario del backend al formato que consume el frontend.
 * @param {object} backendUser 
 * @returns {object}           
 */
export function normalizeUser(backendUser) {
  const firstName = backendUser.first_name || '';
  const lastName  = backendUser.last_name  || '';

  const fullName = `${firstName} ${lastName}`.trim() || backendUser.username;

  let iniciales = 'U';

  if (firstName && lastName) {
    iniciales = `${firstName[0]}${lastName[0]}`;
  } else if (firstName) {
    iniciales = firstName.substring(0, 2);
  } else if (backendUser.username) {
    iniciales = backendUser.username.substring(0, 2);
  }

  return {
    id: backendUser.id,
    username: backendUser.username,
    email: backendUser.email,
    nombre: fullName,
    iniciales: iniciales.toUpperCase(),
    rol: backendUser.is_staff ? 'Administrador' : 'Coordinador',
    facultad: backendUser.FacultadNombre || backendUser.facultad || null,
    carrera: backendUser.CarreraNombre || backendUser.carrera || null,
    is_staff: backendUser.is_staff,
    is_active: backendUser.is_active,
  };
}