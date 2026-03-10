// src/pages/App.jsx
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Dashboard from './Dashboard';

function App() {
  // Al envolver el Dashboard con MainLayout, automáticamente 
  // le ponemos el Sidebar izquierdo y el fondo gris claro.
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}

export default App;