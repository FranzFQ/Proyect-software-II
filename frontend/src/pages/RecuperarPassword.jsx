import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';


// Página de recuperación de contraseña con formulario controlado y navegación de regreso al login
const RecuperarPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Se ha enviado un enlace de recuperación a: ${email}`);
    navigate('/login'); // Lo regresamos al login después de enviar
  };

  return (
    <div className="min-h-screen bg-url-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        
        <h1 className="text-2xl font-bold text-url-blue mb-2 text-center">Recuperar Contraseña</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu acceso.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input 
            id="email"
            type="email"
            label="CORREO INSTITUCIONAL" 
            placeholder="jrodriguez@correo.url.edu.gt" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button variant="primary" className="w-full py-3 mt-2 text-lg">
            Enviar enlace de recuperación
          </Button>
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-gray-500 hover:text-url-blue hover:underline mt-4 font-semibold transition-colors"
          >
            &larr; Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecuperarPassword;