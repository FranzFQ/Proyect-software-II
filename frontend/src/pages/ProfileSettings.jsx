import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { updateUsuario } from '../services/user_service';
import { normalizeUser } from '../services/auth_service';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const ProfileSettings = () => {
  const { currentUser, setCurrentUser } = useContext(AppContext);
  const [firstName, setFirstName] = useState(currentUser?.nombre?.split(' ')[0] || '');
  const [lastName,  setLastName]  = useState(currentUser?.nombre?.split(' ').slice(1).join(' ') || '');
  const [username,  setUsername]  = useState(currentUser?.username || '');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass,     setShowNewPass]     = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSaving,      setIsSaving]      = useState(false);
  const [alertMessage,  setAlertMessage]  = useState('');
  const [errorMessage,  setErrorMessage]  = useState('');
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validación de contraseñas antes de llamar al backend
    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas nuevas no coinciden. Verifícalas.');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const payload = {
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      username:   username.trim(),
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    setIsSaving(true);
    try {
      const updatedBackend = await updateUsuario(currentUser.id, payload);
      const updatedUser = normalizeUser(updatedBackend);
      setCurrentUser(updatedUser);
      setNewPassword('');
      setConfirmPassword('');

      setAlertMessage('Tu información ha sido actualizada exitosamente.');
    } catch (err) {
      setErrorMessage(err.message || 'Ocurrió un error al guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
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
            {`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || currentUser?.iniciales || 'U'}
          </div>
          <div>
            <p className="text-2xl font-bold text-url-blue">
              {`${firstName} ${lastName}`.trim() || 'Usuario'}
            </p>
            <p className="text-sm font-semibold text-gray-500 mt-1 bg-gray-100 px-3 py-1 rounded-md inline-block">
              Rol: {currentUser?.rol || 'Coordinador'}
            </p>
          </div>
        </div>
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-semibold mb-6">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
                value={currentUser?.email || 'correo@url.edu.gt'}
                disabled
                className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Facultad</label>
              <input
                type="text"
                value={currentUser?.facultad || '—'}
                disabled
                className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nivel de Acceso</label>
              <input
                type="text"
                value={currentUser?.rol || 'Coordinador'}
                disabled
                className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed font-medium"
              />
            </div>

          </div>
          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-[#112240] mb-1">Cambiar Contraseña</h3>
            <p className="text-sm text-gray-400 mb-6">
              Deja estos campos en blanco si no deseas cambiar tu contraseña.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-11 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Repite la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-url-blue pr-11 transition-colors ${
                      newPassword && confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-xs text-red-500 font-semibold">Las contraseñas no coinciden</span>
                )}
              </div>

            </div>
          </div>
          <div className="flex justify-start pt-2 border-t border-gray-100">
            <Button
              type="submit"
              variant="primary"
              className="px-8 py-3 text-lg font-bold shadow-md disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Cambios'
              )}
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
          <Button variant="primary" className="mt-8 w-full py-3" onClick={() => setAlertMessage('')}>
            Aceptar
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default ProfileSettings;