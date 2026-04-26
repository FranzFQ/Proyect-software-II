// src/components/common/ModalPonderacion.jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Button from './Button';
import { savePonderaciones, CRITERIO_LABELS } from '../../services/ponderacion_service';

const ModalPonderacion = ({ onClose, onError }) => {
  const {
    ponderaciones,
    setPonderaciones,
    ponderacionesMeta,
    setPonderacionesMeta,
  } = useContext(AppContext);

  // Estado local: editar sin tocar el contexto hasta confirmar
  const [local,   setLocal]   = useState({ ...ponderaciones });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, valor) => {
    setLocal(prev => ({ ...prev, [key]: Number(valor) }));
  };

  const total = Object.values(local).reduce((a, b) => a + b, 0);

  const handleGuardar = async () => {
    if (total !== 100) {
      onError(`La suma debe ser exactamente 100%. Actualmente suma ${total}%.`);
      return;
    }
    setLoading(true);
    try {
      const updatedMeta = await savePonderaciones(local, ponderacionesMeta);
      setPonderaciones(local);
      setPonderacionesMeta(updatedMeta);
      onClose('¡Ponderaciones actualizadas correctamente!');
    } catch (e) {
      console.error('Error guardando ponderaciones:', e);
      onError('Error al guardar ponderaciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-sm mb-2">
        Ajuste los porcentajes para cada criterio de evaluación. La suma total debe ser obligatoriamente 100%.
      </p>

      <div className="space-y-3">
        {Object.entries(CRITERIO_LABELS).map(([key, label]) => (
          <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="font-semibold text-gray-700 text-sm">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={local[key] ?? 0}
                onChange={e => handleChange(key, e.target.value)}
                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-url-blue"
              />
              <span className="text-gray-500 font-bold">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`flex justify-between items-center p-4 rounded-lg mt-2 font-bold text-lg transition-colors ${
        total === 100
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      }`}>
        <span>Total Ponderación:</span>
        <span>{total}%</span>
      </div>

      <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100">
        <Button variant="primary" onClick={handleGuardar} disabled={loading}>
          {loading ? 'Guardando...' : 'Actualizar Ponderaciones'}
        </Button>
      </div>
    </div>
  );
};

export default ModalPonderacion;