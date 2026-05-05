import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Button from './Button';
import { API_URL } from '../../services/global_URL';

const ModalPonderacion = ({ onClose }) => {
  const { ponderaciones, setPonderaciones, showToast } = useContext(AppContext);
  
  const [valores, setValores] = useState({
    estudiantil: 0,
    ceat: 0,
    coordinador: 0,
    visitas: 0
  });
  
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (ponderaciones) {
      setValores({
        estudiantil: ponderaciones.estudiantil || 0,
        ceat: ponderaciones.ceat || 0,
        coordinador: ponderaciones.coordinador || 0,
        visitas: ponderaciones.visitas || 0
      });
    }
  }, [ponderaciones]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores({ ...valores, [name]: parseInt(value) || 0 });
  };

  const sumaTotal = Object.values(valores).reduce((a, b) => a + b, 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (sumaTotal !== 100) {
      return showToast('La suma de las ponderaciones debe ser exactamente 100%.', 'error');
    }

    setCargando(true);
    try {
      // Si tienes un endpoint para guardar las ponderaciones, iría aquí:
      // await fetch(`${API_URL}evaluaciones/configuracion-ponderacion/1/`, { ... })
      
      setPonderaciones(valores);
      showToast('Ponderaciones actualizadas correctamente.', 'success');
      onClose();
    } catch (error) {
      showToast('Error al actualizar las ponderaciones.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500 mb-2">Ajuste los porcentajes de cada categoría activa. La suma debe ser exactamente 100%.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Eval. Estudiantil</label>
          <input type="number" name="estudiantil" value={valores.estudiantil} onChange={handleChange} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" min="0" max="100" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Evaluación CEAT</label>
          <input type="number" name="ceat" value={valores.ceat} onChange={handleChange} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" min="0" max="100" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Eval. Coordinador</label>
          <input type="number" name="coordinador" value={valores.coordinador} onChange={handleChange} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" min="0" max="100" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Visitas (Checklists)</label>
          <input type="number" name="visitas" value={valores.visitas} onChange={handleChange} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-url-blue" min="0" max="100" />
        </div>
      </div>

      <div className={`mt-2 p-3 rounded-md text-center font-bold shadow-sm border ${sumaTotal === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
        Suma Total: {sumaTotal}% {sumaTotal !== 100 && '(Debe ser 100%)'}
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={sumaTotal !== 100 || cargando} className="bg-url-yellow text-[#112240] hover:bg-yellow-500 border-none font-bold disabled:opacity-50">
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
};

export default ModalPonderacion;