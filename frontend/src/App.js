import React, { useState } from 'react';
import './App.css';
import Login from './componentes/Login';
import Registro from './componentes/Registro';
import Dashboard from './componentes/Dashboard';

function App() {
  /* Controla qué pantalla se muestra: 'login' | 'registro' | 'dashboard' */
  const [pantalla, setPantalla] = useState('login');

  return (
    <div className="App">
      {/* Se eliminó el nav para que los botones vivan dentro de cada tarjeta */}
      {pantalla === 'login' && <Login setPantalla={setPantalla} />}
      {pantalla === 'registro' && <Registro setPantalla={setPantalla} />}
      {pantalla === 'dashboard' && <Dashboard setPantalla={setPantalla} />}
    </div>
  );
}

export default App;
