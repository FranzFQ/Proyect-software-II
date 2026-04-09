import { useState, useEffect } from 'react';
import { listaDocentesGlobal } from '../../utils/mockData';

// ── Cambia esta variable a true cuando tengas el backend listo ─────────────────
const USE_BACKEND = false;
const API_BASE = 'https://tu-api.com'; // <-- cambia esto por tu URL real

// ── Hook: un docente por id ────────────────────────────────────────────────────
export function useDocente(id) {
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    if (USE_BACKEND) {
      fetch(`${API_BASE}/docentes/${id}`)
        .then((res) => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
        .then((data) => setDocente(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      const found = listaDocentesGlobal.find((d) => String(d.id) === String(id));
      setDocente(found ?? listaDocentesGlobal[0]);
      setLoading(false);
    }
  }, [id]);

  return { docente, loading, error };
}

// ── Hook: lista completa ───────────────────────────────────────────────────────
export function useDocentes() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    if (USE_BACKEND) {
      fetch(`${API_BASE}/docentes`)
        .then((res) => { if (!res.ok) throw new Error(`Error ${res.status}`); return res.json(); })
        .then((data) => setDocentes(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setDocentes(listaDocentesGlobal);
      setLoading(false);
    }
  }, []);

  return { docentes, loading, error };
}
