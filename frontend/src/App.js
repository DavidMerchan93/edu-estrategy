import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './componentes/Login';
import Registro from './componentes/Registro';
import Dashboard from './componentes/Dashboard';
import { apiObtenerPerfil } from './services/api';

function App() {
  const [pantalla, setPantalla] = useState('cargando');
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('edu_token');
    if (!token) {
      setPantalla('login');
      return;
    }
    apiObtenerPerfil(token)
      .then((data) => {
        setUsuario(data);
        setPantalla('dashboard');
      })
      .catch(() => {
        localStorage.removeItem('edu_token');
        setPantalla('login');
      });
  }, []);

  if (pantalla === 'cargando') {
    return (
      <div
        className="App"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <p style={{ color: '#64748b' }}>Cargando...</p>
      </div>
    );
  }

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
