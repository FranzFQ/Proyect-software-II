// src/pages/App.jsx
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Archivos from './Archivos';
import Dashboard from './Dashboard';

function App() {
  return (
    <MainLayout>
      <Archivos />
    </MainLayout>
  );
}

export default App;