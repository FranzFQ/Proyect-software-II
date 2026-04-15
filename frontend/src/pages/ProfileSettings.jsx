// src/pages/ProfileSettings.jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const ProfileSettings = () => {
  const { currentUser, setCurrentUser } = useContext(AppContext);
  
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [alertMessage, setAlertMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({ ...currentUser, nombre: nombre, username: username });
    }
    setAlertMessage("La información de tu perfil ha sido actualizada exitosamente.");
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
      
      <div>
        <h1 className="text-3xl font-bold text-url-blue mb-2 font-serif">Configuración de Perfil</h1>
        <p className="text-gray-500">Consulta y administra tu información personal en el sistema.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-4xl w-full mt-4 mx-auto">
        <h3 className="text-xl font-bold text-[#112240] border-b border-gray-100 pb-4 mb-8">
          Datos Institucionales del Usuario
        </h3>
        
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-url-yellow text-url-blue rounded-full flex items-center justify-center text-4xl font-bold shadow-inner shrink-0">
            {currentUser?.iniciales || 'U'}
          </div>
          <div>
            <p className="text-2xl font-bold text-url-blue">{nombre || 'Usuario'}</p>
            <p className="text-sm font-semibold text-gray-500 mt-1 bg-gray-100 px-3 py-1 rounded-md inline-block">
              Rol: {currentUser?.rol || 'Coordinador'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre Completo</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue transition-colors" 
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre de Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue transition-colors" 
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Correo Institucional</label>
            <input 
              type="email" 
              value={currentUser?.correo || 'correo@url.edu.gt'} 
              disabled 
              className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Facultad</label>
            <input 
              type="text" 
              value="Ingeniería" 
              disabled 
              className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium" 
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nivel de Acceso</label>
            <input 
              type="text" 
              value={currentUser?.rol || 'Administrador'} 
              disabled 
              className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium" 
            />
          </div>

          <div className="md:col-span-2 flex justify-start mt-2 pt-6 border-t border-gray-100">
            <Button type="submit" variant="primary" className="px-8 py-3 text-lg font-bold shadow-md">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>

      <Modal isOpen={!!alertMessage} onClose={() => setAlertMessage('')} title="Aviso del Sistema" zIndex="z-[60]">
         <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-500">
               <CheckCircleSolid className="w-8 h-8" />
            </div>
            <p className="text-lg text-[#112240] text-center font-bold">{alertMessage}</p>
            <Button variant="primary" className="mt-8 w-full py-3" onClick={() => setAlertMessage('')}>Aceptar</Button>
         </div>
      </Modal>

    </div>
  );
};

export default ProfileSettings;