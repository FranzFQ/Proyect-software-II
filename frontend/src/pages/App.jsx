import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importamos el Contexto de Ponderaciones para que esté disponible en toda la aplicación
import { AppProvider } from '../context/AppContext';

// Importamos las páginas principales (con los nuevos nombres en inglés)
import Login from './Login';
import Dashboard from './Dashboard';
import Files from './Files'; // Antes Archivos
import Checklist from './Checklist'; // Antes ListaVerificacion
import Teachers from './Teachers'; // Antes Docentes
import TeacherProfile from './teachers/TeacherProfile'; // Antes DocentePerfil
import MainLayout from '../components/layout/MainLayout';
import Coordinators from './Coordinators'; // Antes Coordinadores
import CoordinatorProfile from './CoordinatorProfile'; // Antes CoordinadorPerfil
import Semesters from './Semesters'; // Antes Semestres
import CourseDetail from './CourseDetail'; // Antes CursoDetalle
import TeacherHistory from './teachers/TeacherHistory' // Antes DocenteHistorico
import TeacherComparison from './teachers/TeacherComparison'; // Antes DocenteComparacion
import TeacherChecklists from './teachers/TeacherChecklists'; // Antes DocenteChecklists

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          
          {/* Rutas en inglés */}
          <Route path="/files" element={<MainLayout><Files /></MainLayout>} />
          
          <Route path="/teachers" element={<MainLayout><Teachers /></MainLayout>} />
          <Route path="/teachers/:id" element={<MainLayout><TeacherProfile /></MainLayout>} />
          <Route path="/teachers/:id/course/:cursoId" element={<MainLayout><CourseDetail /></MainLayout>} />
          <Route path="/teachers/:id/history" element={<MainLayout><TeacherHistory /></MainLayout>} />
          <Route path="/teachers/:id/comparison" element={<MainLayout><TeacherComparison /></MainLayout>} />
          <Route path="/teachers/:id/checklists" element={<MainLayout><TeacherChecklists /></MainLayout>} />

          <Route path="/checklist" element={<MainLayout><Checklist /></MainLayout>} />
          
          <Route path="/coordinators" element={<MainLayout><Coordinators /></MainLayout>} />
          <Route path="/coordinators/:id" element={<MainLayout><CoordinatorProfile /></MainLayout>} />
          
          <Route path="/semesters" element={<MainLayout><Semesters /></MainLayout>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;