import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { EyeIcon, TrashIcon, UserPlusIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../services/global_URL';
import { getDocentes, updateDocente } from '../services/docente_service';
import { getFacultades } from '../services/academico_service';

const Teachers = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);

  const [docentes,           setDocentes]           = useState([]);
  const [facultades,         setFacultades]         = useState([]);
  const [cursosPorDocente,   setCursosPorDocente]   = useState({});
  const [promedioPorDocente, setPromedioPorDocente] = useState({});
  const [totalDocentes,      setTotalDocentes]      = useState(0);
  const [loading,            setLoading]            = useState(true);
  const [saving,             setSaving]             = useState(false);

  const [filtroTexto,  setFiltroTexto]  = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen,   setIsFormModalOpen]   = useState(false);
  const [docenteActual,     setDocenteActual]     = useState(null);

  const [formNombre,   setFormNombre]   = useState('');
  const [formCodigo,   setFormCodigo]   = useState('');
  const [formTipoPlan, setFormTipoPlan] = useState('');
  const [formFacultad, setFormFacultad] = useState('');
  
  const [cursosForm, setCursosForm] = useState([]);
  
  // Estados para el ComboBox de Cursos
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [currentPage, filtroTexto]); 

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const params = {
        limit: itemsPerPage,
        offset: offset,
        search: filtroTexto
      };

      const [docentesData, facsData, cursosRes] = await Promise.all([
        getDocentes(params),
        getFacultades(),
        fetch(`${API_URL}academico/cursos/`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}` }
        }).catch(() => ({ ok: false }))
      ]);

      const lista = docentesData.results ?? [];
      setDocentes(lista);
      setTotalDocentes(docentesData.count ?? lista.length);
      setFacultades(Array.isArray(facsData) ? facsData : facsData.results ?? []);

      if (cursosRes && cursosRes.ok) {
        const cData = await cursosRes.json();
        setCursosDisponibles(Array.isArray(cData) ? cData : cData.results ?? []);
      }

      const promedios = {};
      const conteos = {};
      lista.forEach(doc => {
        if (doc.promedio_punteo !== null && doc.promedio_punteo !== undefined) {
          promedios[doc.id] = doc.promedio_punteo;
        }
        conteos[doc.id] = doc.conteo_cursos ?? 0;
      });
      setPromedioPorDocente(promedios);
      setCursosPorDocente(conteos);

    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPromedioDocente = (docId) => {
    return promedioPorDocente[docId] ?? null;
  };

  const clasificarEstado = (doc) => {
    const p = getPromedioDocente(doc.id);
    if (p === null) return 'Sin datos';
    if (p >= 8) return 'Excelente';
    if (p >= 6) return 'Buena';
    return 'Deficiente';
  };

  const getIniciales = (nombre) => (nombre ?? '').split(' ').slice(0, 2).map(p => p[0] ?? '').join('').toUpperCase();

  const handleSearch = () => setCurrentPage(1);
  const handleFilter = (estado) => { setFiltroEstado(filtroEstado === estado ? '' : estado); setCurrentPage(1); };

  const docentesFiltrados = docentes.filter(doc => {
    const estado = clasificarEstado(doc);
    const matchEstado = filtroEstado === '' || estado === filtroEstado;
    return matchEstado;
  });

  const totalPages      = Math.ceil(totalDocentes / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems    = docentesFiltrados; 

  const renderEstado = (estado) => {
    const colores = {
      Excelente:  'bg-green-100 text-green-700 border-green-200',
      Buena:      'bg-yellow-100 text-yellow-700 border-yellow-200',
      Deficiente: 'bg-red-100 text-red-700 border-red-200',
      'Sin datos':'bg-gray-100 text-gray-500 border-gray-200',
    };
    return <span className={`px-4 py-1.5 rounded-md text-sm font-bold border ${colores[estado] ?? 'bg-gray-100'}`}>{estado}</span>;
  };

  const confirmarEliminacion = (doc) => { setDocenteActual(doc); setIsDeleteModalOpen(true); };

  const ejecutarEliminacion = async () => {
    try {
      const response = await fetch(`${API_URL}usuarios/docentes/${docenteActual.id}/`, { 
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('auth_token')}` }
      });
      
      if (response.ok || response.status === 204) {
        setDocentes(prev => prev.filter(d => d.id !== docenteActual.id));
        showToast('Docente eliminado correctamente del sistema.', 'success');
      } else {
        showToast('Error al intentar eliminar el docente.', 'error');
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast('Error de conexión con el servidor.', 'error');
    }
    setIsDeleteModalOpen(false);
    setDocenteActual(null);
  };

  const abrirFormulario = (doc = null) => {
    setDocenteActual(doc);
    setFormNombre(doc?.nombre_completo ?? '');
    setFormCodigo(doc?.codigo_docente  ?? '');
    setFormTipoPlan(doc?.tipo_plan     ?? '');
    setFormFacultad(String(doc?.facultad ?? ''));
    
    setCursosForm([]);
    setCursoSeleccionadoId('');
    setIsFormModalOpen(true);
  };

  const agregarCursoAlFormulario = () => {
    if (cursoSeleccionadoId !== '') { 
      const cursoObj = cursosDisponibles.find(c => String(c.id) === String(cursoSeleccionadoId));
      if (cursoObj && !cursosForm.includes(cursoObj.nombre)) {
        setCursosForm([...cursosForm, cursoObj.nombre]); 
      }
      setCursoSeleccionadoId(''); 
    }
  };

  const eliminarCursoDelFormulario = (index) => { setCursosForm(cursosForm.filter((_, i) => i !== index)); };

  const guardarDocente = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      nombre_completo: formNombre,
      codigo_docente:  formCodigo,
      tipo_plan:       formTipoPlan,
      facultad:        formFacultad ? parseInt(formFacultad) : null,
      // cursos: cursosForm // Si el backend los recibe directamente
    };
    try {
      if (docenteActual) {
        await updateDocente(docenteActual.id, payload);
      } else {
        const res = await fetch(`${API_URL}usuarios/docentes/`, {
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }, 
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al crear docente");
      }
      
      await fetchInitialData();
      setIsFormModalOpen(false);
      showToast(docenteActual
        ? 'Información del docente actualizada exitosamente.'
        : 'Nuevo docente agregado exitosamente al sistema.'
      , 'success');
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast('Error al guardar la información del docente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-url-blue mb-2">Docentes</h1>
          <p className="text-gray-500 font-medium">Mostrando {docentesFiltrados.length} docentes en total</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2 shadow-md" onClick={() => abrirFormulario(null)}>
          <UserPlusIcon className="w-5 h-5" /> Agregar Docente
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex w-full md:w-1/2">
          <input
            type="text"
            placeholder="Búsqueda por nombre o código..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-url-blue"
            value={filtroTexto}
            onChange={e => setFiltroTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button onClick={handleSearch} className="bg-[#e2e8f0] text-[#112240] font-bold px-6 py-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-300 transition-colors">
            Buscar
          </button>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {[{ label: 'Deficiente', active: 'bg-red-600 text-white shadow-md', idle: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200' },
            { label: 'Buena', active: 'bg-yellow-500 text-white shadow-md', idle: 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200' },
            { label: 'Excelente', active: 'bg-green-600 text-white shadow-md', idle: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' },
          ].map(({ label, active, idle }) => (
            <button key={label} onClick={() => handleFilter(label)} className={`px-6 py-2 rounded-lg font-bold transition-all ${filtroEstado === label ? active : idle}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-[#112240] text-white">
              <tr>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm">Nombre / Código</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Cursos</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Facultad</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Estado</th>
                <th className="py-3 px-3 md:py-4 md:px-6 font-semibold text-xs md:text-sm text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan="5" className="py-4 px-6"><div className="h-4 bg-gray-200 rounded animate-pulse w-full" /></td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-gray-500 font-semibold">No se encontraron docentes.</td></tr>
              ) : (
                currentItems.map((doc, index) => {
                  const estado = clasificarEstado(doc);
                  const iniciales = getIniciales(doc.nombre_completo);
                  const conteoCursos = cursosPorDocente[doc.id] ?? 0;
                  return (
                    <tr key={doc.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-2 px-3 md:py-4 md:px-6">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base shrink-0 shadow-sm ${estado === 'Excelente' ? 'bg-url-yellow text-url-blue' : 'bg-url-blue text-white'}`}>
                            {iniciales}
                          </div>
                          <div>
                            <h4 className="font-bold text-url-blue text-sm md:text-base">{doc.nombre_completo}</h4>
                            <p className="text-[10px] md:text-xs text-gray-400">{doc.codigo_docente}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 md:py-4 md:px-6 text-center font-semibold text-url-blue text-sm md:text-base">{conteoCursos === 0 ? <span className="text-gray-400 text-xs font-normal">0</span> : conteoCursos}</td>
                      <td className="py-2 px-3 md:py-4 md:px-6 text-center text-url-blue font-semibold text-xs md:text-sm">{doc.FacultadNombre ?? '—'}</td>
                      <td className="py-2 px-3 md:py-4 md:px-6 text-center"><div className="flex flex-col items-center gap-1">{renderEstado(estado)}</div></td>
                      <td className="py-2 px-3 md:py-4 md:px-6 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button onClick={() => navigate(`/teachers/${doc.id}`)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-url-yellow text-url-yellow rounded-md flex items-center justify-center hover:bg-url-yellow hover:text-white transition-colors" title="Ver perfil"><EyeIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                          <button onClick={() => abrirFormulario(doc)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-blue-400 text-blue-500 rounded-md flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Editar docente"><PencilSquareIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                          <button onClick={() => confirmarEliminacion(doc)} className="w-7 h-7 md:w-8 md:h-8 border-2 border-red-200 text-red-500 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="Eliminar docente"><TrashIcon className="w-3 h-3 md:w-4 md:h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-auto flex justify-end items-center pt-4 pb-2 text-sm text-[#112240] font-bold gap-4">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">&larr; Anterior</button>
        <span>Página {safeCurrentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors">Siguiente &rarr;</button>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={docenteActual ? 'Editar Docente' : 'Agregar Nuevo Docente'}>
        <form onSubmit={guardarDocente} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Completo</label>
              <input type="text" placeholder="Ej. Juan Pérez" value={formNombre} onChange={e => setFormNombre(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Código Docente</label>
              <input type="text" placeholder="Ej. CAT-12345" value={formCodigo} onChange={e => setFormCodigo(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Plan Docente</label>
              <input type="text" placeholder="Ej. Plan Diario / Fin de semana" value={formTipoPlan} onChange={e => setFormTipoPlan(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Facultad</label>
              <select value={formFacultad} onChange={e => setFormFacultad(e.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue" required>
                <option value="">Seleccionar facultad...</option>
                {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          <div className="flex flex-col gap-3">
             <label className="text-sm font-bold text-[#112240]">Cursos Asignados al Docente</label>
             <div className="flex gap-2">
                <select 
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue"
                  value={cursoSeleccionadoId}
                  onChange={(e) => setCursoSeleccionadoId(e.target.value)}
                >
                  <option value="">Seleccione un curso...</option>
                  {cursosDisponibles.map(curso => (
                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                  ))}
                </select>
                <button type="button" onClick={agregarCursoAlFormulario} className="bg-[#112240] text-white px-5 py-2.5 rounded-md font-bold hover:bg-blue-900 transition shadow-sm flex items-center gap-1 text-sm"><PlusIcon className="w-4 h-4"/> Agregar</button>
             </div>
             
             <div className="flex flex-wrap gap-2 mt-2">
               {cursosForm.length > 0 ? (
                 cursosForm.map((curso, index) => (
                   <div key={index} className="flex items-center gap-2 bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 shadow-sm">
                     <span>{curso}</span>
                     <button type="button" onClick={() => eliminarCursoDelFormulario(index)} className="text-gray-400 hover:text-red-500 transition"><TrashIcon className="w-4 h-4" /></button>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-gray-400 italic">No hay cursos asignados aún.</p>
               )}
             </div>
          </div>

          <div className="flex justify-start gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="submit" variant="primary" className={saving ? 'opacity-60 pointer-events-none' : ''}>{saving ? 'Guardando...' : docenteActual ? 'Guardar Cambios' : 'Guardar Docente'}</Button>
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-gray-700">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0"><TrashIcon className="w-6 h-6" /></div>
            <p>¿Estás seguro de que deseas eliminar al docente <strong className="text-url-blue">{docenteActual?.nombre_completo}</strong> del sistema?</p>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={ejecutarEliminacion}>Sí, Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Teachers;