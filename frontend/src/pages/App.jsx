import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos el Contexto de Ponderaciones para que esté disponible en toda la aplicación
import { AppProvider } from '../context/AppContext';

// Importamos las páginas principales
import Login from './Login';
import Dashboard from './Dashboard';
import Archivos from './Archivos';
import Docentes from './Docentes';
import DocentePerfil from './DocentePerfil';
import MainLayout from '../components/layout/MainLayout';
import Coordinadores from './Coordinadores';
import CoordinadorPerfil from './CoordinadorPerfil';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/archivos" element={<MainLayout><Archivos /></MainLayout>} />
          <Route path="/docentes" element={<MainLayout><Docentes /></MainLayout>} />
          <Route path="/docentes/:id" element={<MainLayout><DocentePerfil /></MainLayout>} />

          <Route path="/checklist" element={<MainLayout><div className="text-2xl font-bold text-gray-400 p-8">Vista en construcción...</div></MainLayout>} />
          <Route path="/coordinadores" element={<MainLayout><Coordinadores /></MainLayout>} />
          <Route path="/coordinadores/:id" element={<MainLayout><CoordinadorPerfil /></MainLayout>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;