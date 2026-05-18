// frontend/src/components/common/ModalPonderacion.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { getPonderaciones, updatePonderacion } from '../../services/evaluaciones_service';
import Button from './Button';

const ModalPonderacion = ({ onClose }) => {
  const { showToast } = useContext(AppContext);
  const [ponderacionesList, setPonderacionesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);

  // Mapeo: SOLO incluimos las 4 categorías activas (Excluimos Autoevaluación y Apoyo)
  const mapping = {
    'Evaluaciones Estudiantes': 'Eval. Estudiantil',
    'Capacitaciones CEAT':      'Evaluación CEAT',
    'Control Docente':          'Eval. Coordinador',
    'Criterios de Coordinador': 'Eval. Coordinador',
    'Checklist':                'Visitas (Checklists)'
  };

  useEffect(() => {
    const fetchPonderaciones = async () => {
      try {
        const data = await getPonderaciones();
        
        // Agrupar y filtrar datos reales de la BD
        const groupedData = {};
        data.forEach(item => {
          const shortName = mapping[item.CriterioNombre];
          // Solo lo guardamos si existe en nuestro mapping (así ignoramos las obsoletas)
          if (shortName && !groupedData[shortName]) {
            groupedData[shortName] = {
              ...item,
              labelVisual: shortName
            };
          }
        });

        setPonderacionesList(Object.values(groupedData));
      } catch (error) {
        showToast("Error al cargar ponderaciones", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPonderaciones();
  }, []);

  const handleChange = (id, valor) => {
    setPonderacionesList(prev => prev.map(p => 
        p.id === id ? { ...p, porcentaje_asignado: parseInt(valor) || 0 } : p
    ));
  };

  const sumaTotal = ponderacionesList.reduce((acc, curr) => acc + (curr.porcentaje_asignado || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (sumaTotal !== 100) {
      return showToast(`Error: Las ponderaciones suman ${sumaTotal}%. Deben sumar exactamente 100%.`, 'error');
    }

    setCargando(true);
    try {
        // Obtenemos todas las ponderaciones originales de nuevo para limpiar las que no están en el mapping
        const allData = await getPonderaciones();
        
        // Preparamos los updates
        const updates = allData.map(originalItem => {
            // Buscamos si este item está en nuestra lista editada
            const editedItem = ponderacionesList.find(p => p.id === originalItem.id);
            
            if (editedItem) {
                // Si está en la lista editada, enviamos el nuevo valor
                return updatePonderacion(originalItem.id, { porcentaje_asignado: editedItem.porcentaje_asignado });
            } else {
                // Si NO está en la lista editada (es una categoría obsoleta o excluida), la ponemos a 0
                return updatePonderacion(originalItem.id, { porcentaje_asignado: 0 });
            }
        });

        await Promise.all(updates);
        showToast("¡Ponderaciones actualizadas correctamente!", 'success');
        onClose();
    } catch (error) {
        showToast("Error al guardar ponderaciones", "error");
    } finally {
        setCargando(false);
    }
  };

  if (loading) return <p className="text-center p-8 text-[#112240] font-bold animate-pulse">Cargando ponderaciones...</p>;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 mb-2">
        Ajuste los porcentajes de cada categoría activa. La suma debe ser exactamente 100%.
      </p>
      
      {/* GRID ESTANDARIZADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ponderacionesList.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">{item.labelVisual}</label>
            <div className="relative">
              <input 
                type="number" 
                min="0" 
                max="100"
                value={item.porcentaje_asignado} 
                onChange={(e) => handleChange(item.id, e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-2 p-3 rounded-md text-center font-bold shadow-sm border ${sumaTotal === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
        Suma Total: {sumaTotal}% {sumaTotal !== 100 && '(Debe ser 100%)'}
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={sumaTotal !== 100 || cargando} className="bg-[#112240] text-white hover:bg-blue-900 border-none font-bold disabled:opacity-50">
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default ModalPonderacion;