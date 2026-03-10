import React, { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
 // Estados locales para controlar los valores de los campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enviando credenciales:', { email, password });
  };

  return (
    // Contenedor principal: Flexbox para dividir la pantalla en dos columnas
    <div className="min-h-screen flex">
      
      {/* LADO IZQUIERDO: Fondo azul institucional y Logo */}
      {/* En móviles se oculta (hidden), en pantallas medianas/grandes ocupa la mitad (md:flex md:w-1/2) */}
      <div className="hidden md:flex md:w-1/2 bg-url-blue items-center justify-center p-12">
        <div className="text-white text-center">
          {/* Placeholder del logo: Aquí reemplazarás con un <img src={logoUrl} alt="Logo" /> cuando lo tengas en assets */}
          <div className="border border-white/20 p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-serif border-b border-white pb-2 mb-2">Universidad</h1>
            <h2 className="text-5xl font-serif mb-2">Rafael Landívar</h2>
            <p className="text-sm font-light tracking-widest uppercase">Identidad Jesuita en Guatemala</p>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Formulario de inicio de sesión */}
      {/* Ocupa el 100% en móviles, y la otra mitad en pantallas grandes */}
      <div className="w-full md:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          
          {/* Textos de bienvenida */}
          <h2 className="text-3xl font-bold text-url-blue mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Ingresa tus credenciales institucionales para continuar
          </p>

          {/* Formulario */}
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

            {/* Botón Ingresar */}
            <Button variant="primary" className="w-full py-3 mt-2 text-lg">
              Ingresar al Sistema
            </Button>

            {/* Enlace de recuperación */}
            <div className="text-center mt-4">
              <a href="#" className="text-sm text-url-yellow hover:text-yellow-600 hover:underline font-semibold transition-colors">
                ¿Olvidaste tu contraseña? Recuperar acceso &rarr;
              </a>
            </div>

          </form>
        </div>
      </div>
      
    </div>
  );
};

export default Login;