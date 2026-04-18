import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { login } from '../services/auth_service';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import logoUrl from '../assets/logo-url.webp';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();

  // Se Usa un setCurrentUser para guardar el usuario en el contexto
  const { setCurrentUser } = useContext(AppContext);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // conexion al backend 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica en frontend
    if (!identifier || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      // LLAMADA REAL AL BACKEND
      const { user } = await login(identifier, password);
      // Guardamos el usuario en el contexto global de React.
      setCurrentUser(user);

      // Redirigimos al dashboard
      navigate('/dashboard');

    } catch (err) {
      // Mensaje de error del backend o de validacion
      setError(err.message || 'Ocurrió un error al iniciar sesión. Intenta de nuevo.');
    } finally {
      // Siempre apagamos el spinner, haya error o no
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo (decorativo) */}
      <div className="hidden md:flex md:w-1/2 bg-url-blue items-center justify-center p-12">
        <div className="text-white text-center flex flex-col items-center">
          <img
            src={logoUrl}
            alt="Universidad Rafael Landívar"
            className="w-80 lg:w-96 mb-8 brightness-0 invert opacity-90"
          />
        </div>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="w-full md:w-1/2 bg-[#F8FAFC] flex flex-col justify-center items-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-url-blue mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-500 mb-8 text-sm">Ingresa tus credenciales institucionales para continuar</p>

          {/* Mensaje de error del backend o de validación */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-semibold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="identifier"
              type="text"
              label="Usuario o correo institucional"
              placeholder="jrodriguez@correo.url.edu.gt"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
            />

            {/* Campo contraseña con ojito */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider">CONTRASEÑA</label>
              <div className="relative">
                <input 
                  id="password" type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                  disabled={isLoading} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-url-blue transition-shadow pr-12 disabled:opacity-70 disabled:bg-gray-100" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50" disabled={isLoading}>
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="primary" className="w-full py-3 mt-4 text-lg flex justify-center items-center gap-2 disabled:opacity-70 shadow-md" disabled={isLoading}>
              {isLoading ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verificando...</>
              ) : 'Ingresar al Sistema'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;