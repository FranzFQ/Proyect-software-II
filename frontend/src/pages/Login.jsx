import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

import logoUrl from '../assets/logo-url.webp';

// Página de inicio de sesión con diseño dividido y formulario centrado
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simula el inicio de sesión
    navigate('/dashboard');
  };

  // Diseño dividido: lado izquierdo con información institucional y lado derecho con el formulario de login
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 bg-url-blue items-center justify-center p-12">
        <div className="text-white text-center flex flex-col items-center">
  
          {/* NOTA: La clase "brightness-0 invert" convierte el logo a color blanco puro. Si tu logo ya es blanco, quita esas dos palabras */}
          <img 
            src={logoUrl} 
            alt="Universidad Rafael Landívar" 
            className="w-64 mb-8 brightness-0 invert opacity-90"
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-url-blue mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Ingresa tus credenciales institucionales para continuar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input 
              id="email"
              type="email"
              label="CORREO INSTITUCIONAL" 
              placeholder="jrodriguez@correo.url.edu.gt" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              id="password"
              type="password"
              label="CONTRASEÑA" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Ya no hay botón de recuperar contraseña aquí */}
            <Button variant="primary" className="w-full py-3 mt-4 text-lg">
              Ingresar al Sistema
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;