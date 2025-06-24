// src/components/demo/JsonDataDemo.jsx
import React, { useState, useEffect } from 'react';
import jsonDataService from '../../services/jsonDataService';
import dashboardService from '../../services/dashboardService';

const JsonDataDemo = () => {
  const [datos, setDatos] = useState({
    centros: [],
    vacunas: [],
    ninos: [],
    usuarios: [],
    estadisticas: null,
    loading: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar datos básicos
        const centros = jsonDataService.getCentros();
        const vacunas = jsonDataService.getVacunas();
        const ninos = jsonDataService.getNinos();
        const usuarios = jsonDataService.getUsuarios();
        
        // Cargar estadísticas del dashboard
        const estadisticas = await dashboardService.getEstadisticasGenerales();
        
        setDatos({
          centros,
          vacunas,
          ninos,
          usuarios,
          estadisticas,
          loading: false
        });
      } catch (error) {
        console.error('Error cargando datos:', error);
        setDatos(prev => ({ ...prev, loading: false }));
      }
    };

    cargarDatos();
  }, []);

  if (datos.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando datos del JSON...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🗂️ Demostración de Datos del JSON
        </h1>
        <p className="text-gray-600">
          Todos los datos ahora provienen del archivo <code className="bg-gray-100 px-2 py-1 rounded">json_prueba.json</code>
        </p>
      </div>

      {/* Estadísticas Generales */}
      {datos.estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600 text-2xl mr-3">🏥</div>
              <div>
                <p className="text-sm font-medium text-blue-600">Centros</p>
                <p className="text-2xl font-bold text-blue-900">{datos.estadisticas.totalCentros}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-3">💉</div>
              <div>
                <p className="text-sm font-medium text-green-600">Vacunas</p>
                <p className="text-2xl font-bold text-green-900">{datos.estadisticas.totalVacunas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-purple-600 text-2xl mr-3">👶</div>
              <div>
                <p className="text-sm font-medium text-purple-600">Pacientes</p>
                <p className="text-2xl font-bold text-purple-900">{datos.estadisticas.totalNinos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-orange-600 text-2xl mr-3">👥</div>
              <div>
                <p className="text-sm font-medium text-orange-600">Usuarios</p>
                <p className="text-2xl font-bold text-orange-900">{datos.estadisticas.totalUsuarios}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Centros de Vacunación */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              🏥 Centros de Vacunación
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {datos.centros.map((centro, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900">{centro.nombre_centro}</h3>
                  <p className="text-sm text-gray-600">{centro.direccion}</p>
                  <p className="text-sm text-gray-500">Director: {centro.director}</p>
                  <p className="text-xs text-gray-400">Tel: {centro.telefono}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vacunas Disponibles */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              💉 Vacunas Disponibles
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {datos.vacunas.map((vacuna, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900">{vacuna.nombre_vacuna}</h3>
                  <p className="text-sm text-gray-600">Fabricante: {vacuna.fabricante}</p>
                  <p className="text-sm text-gray-500">Tipo: {vacuna.tipo_vacuna}</p>
                  <p className="text-xs text-gray-400">
                    Dosis requeridas: {vacuna.dosis_totales_requeridas}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pacientes Registrados */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              👶 Pacientes Registrados
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {datos.ninos.slice(0, 5).map((nino, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3">
                  <h3 className="font-medium text-gray-900">{nino.nombre_completo}</h3>
                  <p className="text-sm text-gray-600">ID: {nino.identificacion}</p>
                  <p className="text-sm text-gray-500">
                    Nacimiento: {new Date(nino.fecha_nacimiento).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">Género: {nino.genero}</p>
                </div>
              ))}
              {datos.ninos.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... y {datos.ninos.length - 5} pacientes más
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Usuarios del Sistema */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              👥 Usuarios del Sistema
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {datos.usuarios.map((usuario, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{usuario.nombre}</h3>
                      <p className="text-sm text-gray-600">@{usuario.username}</p>
                      <p className="text-sm text-gray-500">Email: {usuario.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.rol === 'Administrador' ? 'bg-red-100 text-red-800' :
                        usuario.rol === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                        usuario.rol === 'Enfermera' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.rol}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{usuario.estado}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ℹ️ Información del Sistema
        </h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>✅ Todos los servicios ahora obtienen datos del archivo JSON</p>
          <p>✅ Servicios de autenticación configurados con usuarios de prueba</p>
          <p>✅ Servicios de centros, pacientes, vacunas y usuarios funcionando</p>
          <p>✅ Servicios de campañas, inventario y reportes implementados</p>
          <p>✅ Dashboard con estadísticas en tiempo real</p>
          <p>✅ Hooks personalizados para manejo de datos reactivo</p>
        </div>
      </div>

      {/* Usuarios de prueba para login */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          👤 Usuarios de Prueba para Login
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <strong>👨‍💼 Administrador:</strong><br/>
            Usuario: <code>admin</code><br/>
            Contraseña: <code>admin123</code>
          </div>
          <div className="bg-white p-3 rounded border">
            <strong>👨‍👩‍👧‍👦 Padre/Tutor:</strong><br/>
            Usuario: <code>padre</code><br/>
            Contraseña: <code>padre123</code>
          </div>
          <div className="bg-white p-3 rounded border">
            <strong>🏥 Director:</strong><br/>
            Usuario: <code>director</code><br/>
            Contraseña: <code>director123</code>
          </div>
          <div className="bg-white p-3 rounded border">
            <strong>👩‍⚕️ Doctor:</strong><br/>
            Usuario: <code>doctor</code><br/>
            Contraseña: <code>doctor123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonDataDemo;