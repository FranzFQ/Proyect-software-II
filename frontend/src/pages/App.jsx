import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos todas nuestras vistas y el Layout
import Login from './Login';
import Dashboard from './Dashboard';
import Archivos from './Archivos';
import MainLayout from '../components/layout/MainLayout';

function App() {
  return (
    // BrowserRouter envuelve toda la app para habilitar la navegación
    <BrowserRouter>
      <Routes>
        
        {/* RUTA PÚBLICA: El Login ocupa toda la pantalla, no lleva Sidebar */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PROTEGIDAS: Todas llevan el MainLayout (Sidebar + Contenido) */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } 
        />
        
        <Route 
          path="/archivos" 
          element={
            <MainLayout>
              <Archivos />
            </MainLayout>
          } 
        />

        {/* Rutas pendientes: Muestran un mensaje temporal mientras las construyes */}
        <Route path="/docentes" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista de Docentes en construcción...</div></MainLayout>} />
        <Route path="/checklist" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista de Checklist en construcción...</div></MainLayout>} />
        <Route path="/coordinadores" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista de Coordinadores en construcción...</div></MainLayout>} />

        {/* Redirección por defecto: Si alguien entra a una ruta que no existe o a la raíz ("/"), lo mandamos al Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;