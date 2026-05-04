import React, { useState } from 'react';
import './App.css';
import Login from './componentes/Login';
import Registro from './componentes/Registro';
import Dashboard from './componentes/Dashboard';

function App() {
  const [pantalla, setPantalla] = useState('login');

  return (
    <div className="App">
      {pantalla === 'login'
        ? <Login setPantalla={setPantalla} />
        : pantalla === 'registro'
        ? <Registro setPantalla={setPantalla} />
        : <Dashboard setPantalla={setPantalla} />
      }
    </div>
  );
}

export default App;