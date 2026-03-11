// src/pages/App.jsx
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Login from './Login';
import Checklist from './Checklist';

function App() {
  return (
    <MainLayout>
      <Checklist />
    </MainLayout>
  );
}

export default App;