import { API_URL } from "./global_URL";

const BASE_URL = API_URL;

// Claves que usamos en sessionStorage (constantes para evitar typos)
const TOKEN_KEY   = 'auth_token';
const REFRESH_KEY = 'auth_refresh';
const USER_KEY    = 'auth_user';

// LOGIN
export async function login(identifier, password) {
  const response = await fetch(`${BASE_URL}token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },

    // Compatibilidad con username y email
    body: JSON.stringify({
      username: identifier,
      password
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Credenciales incorrectas');
  }

  const data = await response.json();

  const access  = data.access;
  const refresh = data.refresh;

  // Guardar tokens
  sessionStorage.setItem(TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);

  const user = await fetchCurrentUser(access);

  sessionStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token: access, user };
}

// REFRESH TOKEN

async function refreshToken() {
  const refresh = sessionStorage.getItem(REFRESH_KEY);

  if (!refresh) {
    logout();
    throw new Error("No hay refresh token");
  }

  const response = await fetch(`${BASE_URL}token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    logout();
    throw new Error("Sesión expirada");
  }

  const data = await response.json();

  const newAccess = data.access;

  sessionStorage.setItem(TOKEN_KEY, newAccess);

  return newAccess;
}

// OBTENER USUARIO ACTUAL

async function fetchCurrentUser(token) {
  const response = await fetch(`${BASE_URL}usuarios/usuarios/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el usuario");
  }

  const data = await response.json();

  return normalizeUser(data);
}

// FETCH CON AUTO-REFRESH

export async function fetchWithAuth(url, options = {}) {
  let token = getToken();

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // REFRESCAR EL TOKEN SI ES NECESARIO 
  if (response.status === 401) {
    try {
      token = await refreshToken();

      response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

    } catch (error) {
      logout();
      throw new Error("Sesión expirada, vuelve a iniciar sesión");
    }
  }

  // MANEJO DE RESPUESTA AQUÍ
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Error ${response.status}`);
  }

  if (response.status === 204) return null;

  return response;
}

// LOGOUT

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getSavedUser() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// DECODIFICAR

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

// NORMALIZADOR 
export function normalizeUser(u) {
  const firstName = u.first_name || "";
  const lastName = u.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || u.username;

  const iniciales =
    firstName
      ? `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase()
      : (u.username?.[0] || "U").toUpperCase();

  return {
    id: u.id,
    username: u.username,
    email: u.email,
    nombre: fullName,
    iniciales,
    rol: u.is_staff ? "Administrador" : "Coordinador",
    facultad: u.FacultadNombre || u.facultad || null,
    carrera: u.CarreraNombre || u.carrera || null,
    is_staff: u.is_staff,
    is_active: u.is_active,
  };
}