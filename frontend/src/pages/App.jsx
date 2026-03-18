import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import Archivos from './Archivos';
import RecuperarPassword from './RecuperarPassword';
import Docentes from './Docentes';
import DocentePerfil from './DocentePerfil';
import MainLayout from '../components/layout/MainLayout';

// 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* RUTAS PROTEGIDAS */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/archivos" element={<MainLayout><Archivos /></MainLayout>} />

        <Route path="/docentes" element={<MainLayout><Docentes /></MainLayout>} />
        <Route path="/docentes/:id" element={<MainLayout><DocentePerfil /></MainLayout>} />

        {/* RUTAS EN CONSTRUCCIÓN */}
       
        <Route path="/checklist" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista de Checklist en construcción...</div></MainLayout>} />
        <Route path="/coordinadores" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista de Coordinadores en construcción...</div></MainLayout>} />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;