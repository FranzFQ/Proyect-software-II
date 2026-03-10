import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

function App() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-url-blue">Dashboard de Prueba</h1>
        <p className="text-gray-500 mt-1">Aquí probamos nuestros componentes globales.</p>
      </div>

      {/* Grid para poner tarjetas lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card title="Prueba de Botones">
          <div className="flex flex-col gap-4 items-start">
            <Button variant="primary">Botón Primario</Button>
            <Button variant="secondary">Botón Secundario</Button>
            <Button variant="danger">Botón de Alerta</Button>
          </div>
        </Card>

        <Card title="Información General">
          <p className="text-gray-600 mb-4">
            Este es un contenedor estándar. Cualquier contenido que pongas aquí adentro respetará los márgenes y el diseño global establecido en Figma/Canva.
          </p>
          <Button variant="primary">Ver Detalles</Button>
        </Card>

      </div>
    </MainLayout>
  );
}

export default App;