import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from '../context/AppContext';

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
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/files" element={<MainLayout><Files /></MainLayout>} />
          
          <Route path="/teachers" element={<MainLayout><Teachers /></MainLayout>} />
          <Route path="/teachers/:id" element={<MainLayout><TeacherProfile /></MainLayout>} />
          <Route path="/teachers/:id/semester/:semesterId" element={<MainLayout><TeacherProfile /></MainLayout>} />
          
          <Route path="/teachers/:id/course/:cursoId" element={<MainLayout><CourseDetail /></MainLayout>} />
          <Route path="/teachers/:id/history" element={<MainLayout><TeacherHistory /></MainLayout>} />
          <Route path="/teachers/:id/comparison" element={<MainLayout><TeacherComparison /></MainLayout>} />
          <Route path="/teachers/:id/checklists" element={<MainLayout><TeacherChecklists /></MainLayout>} />
          <Route path="/checklist" element={<MainLayout><Checklist /></MainLayout>} />
          
          <Route path="/coordinators" element={<MainLayout><Coordinators /></MainLayout>} />
          <Route path="/coordinators/:id" element={<MainLayout><CoordinatorProfile /></MainLayout>} />
          <Route path="/semesters" element={<MainLayout><Semesters /></MainLayout>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />

          <Route path="/profile-settings" element={<MainLayout><ProfileSettings /></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;