// src/components/common/ModalPonderacion.jsx
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Button from './Button';

const ModalPonderacion = ({ onClose }) => {
  const { ponderaciones, setPonderaciones, showToast } = useContext(AppContext);

  const handleChange = (criterio, valor) => {
    setPonderaciones({
      ...ponderaciones,
      [criterio]: Number(valor)
    });
  };

  const total = Object.values(ponderaciones).reduce((acc, curr) => acc + curr, 0);

  const handleGuardar = () => {
    if (total !== 100) {
      showToast(`Error: Las ponderaciones suman ${total}%. Deben sumar exactamente 100%.`, 'error');
      return;
    }
    showToast("¡Ponderaciones actualizadas correctamente!", 'success');
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 text-sm mb-2">
        Ajuste los porcentajes para cada criterio de evaluación. La suma total debe ser obligatoriamente 100%.
      </p>

      <div className="space-y-3">
        {Object.entries({
          estudiantil: 'Evaluación Estudiantil',
          ceat: 'Evaluaciones CEAT',
          autoevaluacion: 'Autoevaluaciones',
          coordinador: 'Criterios de Coordinador',
          visitas: 'Checklist',
          apoyo: 'Apoyo y Colaboración'
        }).map(([key, label]) => (
          <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
            <label className="font-semibold text-gray-700 text-sm">{label}</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="0" 
                max="100"
                value={ponderaciones[key]} 
                onChange={(e) => handleChange(key, e.target.value)}
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