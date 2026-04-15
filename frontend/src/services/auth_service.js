// src/services/authService.js
// ─────────────────────────────────────────────────────────────────────────────
// SERVICIO DE AUTENTICACIÓN
//
// ¿Qué hace este archivo?
//   Centraliza TODO lo relacionado con login/logout y almacenamiento del usuario.
//   Ningún componente debería llamar al API de auth directamente; siempre pasan
//   por aquí. Así, si el día de mañana cambias la URL del backend o el nombre
//   del campo del token, solo editas UN lugar.
//
// ¿Por qué sessionStorage y no localStorage?
//   sessionStorage se borra automáticamente cuando el usuario CIERRA la pestaña
//   o el navegador, cumpliendo el requisito "mientras no cierre sesión".
//   localStorage sobreviviría incluso después de cerrar el navegador, lo que
//   puede ser un riesgo de seguridad en equipos compartidos.
//
// ─────────────────────────────────────────────────────────────────────────────
import GLOBAL_API_URL from "./global_URL";

const BASE_URL = GLOBAL_API_URL;

// Claves que usamos en sessionStorage (constantes para evitar typos)
const TOKEN_KEY   = 'auth_token';
const USER_KEY    = 'auth_user';

// ─── 1. LOGIN ────────────────────────────────────────────────────────────────
/**
 * Hace POST /api/token/ (JWT de DRF Simple JWT).
 * Si las credenciales son correctas, guarda el token Y los datos del usuario
 * en sessionStorage, y retorna el objeto usuario para que el contexto lo use.
 *
 * @param {string} email    - Correo institucional
 * @param {string} password - Contraseña
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // El backend de DRF Simple JWT espera "username" aunque tú envíes un email.
    // Si tu backend ya acepta email, cambia el campo aquí.
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

// ─── 2. LOGOUT ───────────────────────────────────────────────────────────────
/**
 * Borra el token y el usuario de sessionStorage.
 * Llamar esta función es suficiente para "cerrar sesión" en el frontend.
 * Si tu backend maneja un blacklist de tokens (refresh tokens), aquí
 * también harías el POST /api/token/blacklist/.
 */
export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

// ─── 3. OBTENER USUARIO GUARDADO ─────────────────────────────────────────────
/**
 * Lee sessionStorage y devuelve el usuario guardado (o null si no hay sesión).
 * Se usa al iniciar la app para "rehidratar" el contexto sin pedir login.
 *
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

// ─── 4. OBTENER TOKEN GUARDADO ────────────────────────────────────────────────
/**
 * Devuelve el token JWT guardado en sessionStorage.
 * Lo usamos en los demás servicios para las peticiones autenticadas.
 *
 * @returns {string|null}
 */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// ─── 5. ¿HAY SESIÓN ACTIVA? ───────────────────────────────────────────────────
/**
 * Utilidad rápida: retorna true si hay un token guardado.
 *
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

// ─── 6. HELPER INTERNO ───────────────────────────────────────────────────────
/**
 * Llama a /api/usuarios/me/ (o el endpoint que tengas) para obtener
 * los datos del usuario que acaba de hacer login.
 * Ajusta la URL si tu backend usa otro path.
 */
async function fetchCurrentUser(token) {
  // Si no tienes un endpoint /me/, puedes construir el objeto manualmente
  // a partir de la respuesta del token o de un endpoint separado.
  const response = await fetch(`${BASE_URL}/usuarios/usuarios/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la información del usuario');
  }

  const userData = await response.json();
  console.log("Datos del usuario obtenidos del backend:", userData);

  // Adaptamos los campos del backend a la forma que usa el Sidebar
  // (iniciales, nombre, rol)
  return normalizeUser(userData);
}

// ─── 7. NORMALIZADOR ──────────────────────────────────────────────────────────
/**
 * Convierte el objeto Usuario del backend al formato que consume el frontend.
 * Centralizar esto aquí significa que si el backend cambia un campo,
 * solo actualizas esta función.
 *
 * @param {object} backendUser - Objeto tal como viene del serializer Django
 * @returns {object}           - Objeto normalizado para el frontend
 */
export function normalizeUser(backendUser) {
  const firstName = backendUser.first_name || '';
  const lastName  = backendUser.last_name  || '';

  const fullName = `${firstName} ${lastName}`.trim() || backendUser.username;

  // 🔥 NUEVA LÓGICA DE INICIALES
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