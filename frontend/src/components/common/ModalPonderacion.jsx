// src/components/common/ModalPonderacion.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { getPonderaciones, updatePonderacion } from '../../services/evaluaciones_service';
import Button from './Button';

const ModalPonderacion = ({ onClose }) => {
  const { showToast } = useContext(AppContext);
  const [ponderacionesList, setPonderacionesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPonderaciones = async () => {
      try {
        const data = await getPonderaciones();
        // Nota: El backend debería filtrar por semestre activo, 
        // pero por ahora manejamos la lista que viene.
        setPonderacionesList(data);
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
        p.id === id ? { ...p, porcentaje_asignado: Number(valor) } : p
    ));
  };

  const total = ponderacionesList.reduce((acc, curr) => acc + curr.porcentaje_asignado, 0);

  const handleGuardar = async () => {
    if (total !== 100) {
      showToast(`Error: Las ponderaciones suman ${total}%. Deben sumar exactamente 100%.`, 'error');
      return;
    }

    try {
        // Actualizar cada ponderación individualmente (o podrías crear un endpoint batch)
        await Promise.all(ponderacionesList.map(p => 
            updatePonderacion(p.id, { porcentaje_asignado: p.porcentaje_asignado })
        ));
        showToast("¡Ponderaciones actualizadas correctamente!", 'success');
        onClose();
    } catch (error) {
        showToast("Error al guardar ponderaciones", "error");
    }
  };

  if (loading) return <p className="text-center p-4">Cargando ponderaciones...</p>;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-sm mb-2">
        Ajuste los porcentajes para cada criterio de evaluación del semestre activo. La suma total debe ser obligatoriamente 100%.
      </p>

      <div className="space-y-3">
        {ponderacionesList.map((item) => (
          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="font-semibold text-gray-700 text-sm">{item.CriterioNombre}</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="0" 
                max="100"
                value={item.porcentaje_asignado} 
                onChange={(e) => handleChange(item.id, e.target.value)}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-url-blue"
              />
              <span className="text-gray-500 font-bold">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`flex justify-between items-center p-4 rounded-lg mt-2 font-bold text-lg transition-colors ${total === 100 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        <span>Total Ponderación:</span>
        <span>{total}%</span>
      </div>

      <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
        <Button variant="primary" onClick={handleGuardar}>
          Actualizar Ponderaciones
        </Button>
      </div>
    </div>
  );
};

export default ModalPonderacion;