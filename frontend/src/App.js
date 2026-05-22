import React, { useState } from 'react';
import './App.css';
import Login from './componentes/Login';
import Registro from './componentes/Registro';
import Dashboard from './componentes/Dashboard';

function App() {
  /* Controla qué pantalla se muestra: 'login' | 'registro' | 'dashboard' */
  const [pantalla, setPantalla] = useState('login');
  const [usuario, setUsuario] = useState(null);

  return (
    <div className="App">
      {pantalla === 'login' && (
        <Login setPantalla={setPantalla} setUsuario={setUsuario} />
      )}
      {pantalla === 'registro' && (
        <Registro setPantalla={setPantalla} setUsuario={setUsuario} />
      )}
      {pantalla === 'dashboard' && (
        <Dashboard setPantalla={setPantalla} usuario={usuario} />
      )}
    </div>
  );
}

export default App;
