// src/pages/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from '../context/AppContext';
import ProtectedRoute from '../components/auth/ProtectedRoute'; // Importamos el protector

import Login from './Login';
import Dashboard from './Dashboard';
import Files from './Files'; 
import Teachers from './Teachers'; 
import TeacherProfile from './teachers/TeacherProfile'; 
import MainLayout from '../components/layout/MainLayout';
import Coordinators from './Coordinators'; 
import CoordinatorProfile from './CoordinatorProfile'; 
import Semesters from './Semesters'; 
import CourseDetail from './CourseDetail'; 
import TeacherHistory from './teachers/TeacherHistory'; 
import TeacherComparison from './teachers/TeacherComparison'; 
import TeacherChecklists from './teachers/TeacherChecklists'; 
import Checklist from './Checklist'; 
import ProfileSettings from './ProfileSettings';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTA PÚBLICA (Sin protección) */}
          <Route path="/login" element={<Login />} />

          {/* RUTAS PROTEGIDAS (Envueltas en ProtectedRoute) */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/files" element={<ProtectedRoute><MainLayout><Files /></MainLayout></ProtectedRoute>} />
          
          <Route path="/teachers" element={<ProtectedRoute><MainLayout><Teachers /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers/:id" element={<ProtectedRoute><MainLayout><TeacherProfile /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers/:id/semester/:semesterId" element={<ProtectedRoute><MainLayout><TeacherProfile /></MainLayout></ProtectedRoute>} />
          
          <Route path="/teachers/:id/course/:cursoId" element={<ProtectedRoute><MainLayout><CourseDetail /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers/:id/history" element={<ProtectedRoute><MainLayout><TeacherHistory /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers/:id/comparison" element={<ProtectedRoute><MainLayout><TeacherComparison /></MainLayout></ProtectedRoute>} />
          <Route path="/teachers/:id/checklists" element={<ProtectedRoute><MainLayout><TeacherChecklists /></MainLayout></ProtectedRoute>} />
          <Route path="/checklist" element={<ProtectedRoute><MainLayout><Checklist /></MainLayout></ProtectedRoute>} />
          
          <Route path="/coordinators" element={<ProtectedRoute><MainLayout><Coordinators /></MainLayout></ProtectedRoute>} />
          <Route path="/coordinators/:id" element={<ProtectedRoute><MainLayout><CoordinatorProfile /></MainLayout></ProtectedRoute>} />
          <Route path="/semesters" element={<ProtectedRoute><MainLayout><Semesters /></MainLayout></ProtectedRoute>} />
          
          <Route path="/profile-settings" element={<ProtectedRoute><MainLayout><ProfileSettings /></MainLayout></ProtectedRoute>} />

          {/* RUTA DE CAPTURA (Si pone una URL que no existe o la raíz, lo manda al login) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;