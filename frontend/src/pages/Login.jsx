import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// Página de inicio de sesión con formulario controlado y navegación simulada al dashboard
const Login = () => {
  const navigate = useNavigate(); // <-- Agregado para navegar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enviando credenciales:', { email, password });
    // Simulamos un inicio de sesión exitoso redirigiendo al dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      
      {/* LADO IZQUIERDO */}
      <div className="hidden md:flex md:w-1/2 bg-url-blue items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="border border-white/20 p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-serif border-b border-white pb-2 mb-2">Universidad</h1>
            <h2 className="text-5xl font-serif mb-2">Rafael Landívar</h2>
            <p className="text-sm font-light tracking-widest uppercase">Identidad Jesuita en Guatemala</p>
          </div>
        </div>
      </div>

      {/* LADO DERECHO */}
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

            <Button variant="primary" className="w-full py-3 mt-2 text-lg">
              Ingresar al Sistema
            </Button>

            <div className="text-center mt-4">
              {/* <-- Cambiado a botón para usar navigate() --> */}
              <button 
                type="button"
                onClick={() => navigate('/recuperar-password')}
                className="text-sm text-url-yellow hover:text-yellow-600 hover:underline font-semibold transition-colors"
              >
                ¿Olvidaste tu contraseña? Recuperar acceso &rarr;
              </button>
            </div>

          </form>
        </div>
      </div>
      
    </div>
  );
};

export default Login;