// src/components/demo/RolesUsuariosDemo.jsx
import React from 'react';

const RolesUsuariosDemo = () => {
  const roles = [
    {
      nombre: 'Administrador',
      username: 'admin',
      password: 'admin123',
      icono: '👨‍💼',
      color: 'bg-red-50 border-red-200 text-red-800',
      descripcion: 'Control total del sistema',
      permisos: [
        'Gestión completa de usuarios',
        'Configuración del sistema',
        'Acceso a todos los centros',
        'Gestión de roles y permisos',
        'Reportes administrativos',
        'Configuración de campañas',
        'Supervisión general'
      ]
    },
    {
      nombre: 'Padre/Tutor',
      username: 'padre',
      password: 'padre123',
      icono: '👨‍👩‍👧‍👦',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      descripcion: 'Acceso a información de sus hijos',
      permisos: [
        'Ver historial de vacunación de sus hijos',
        'Programar citas de vacunación',
        'Actualizar datos de contacto',
        'Recibir notificaciones importantes',
        'Ver próximas citas',
        'Descargar certificados de vacunación',
        'Contactar con personal médico'
      ]
    },
    {
      nombre: 'Director',
      username: 'director',
      password: 'director123',
      icono: '🏥',
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      descripcion: 'Administración del centro médico',
      permisos: [
        'Gestión del personal del centro',
        'Supervisión de campañas',
        'Reportes del centro',
        'Gestión de inventario',
        'Programación de horarios',
        'Coordinación con otros centros',
        'Evaluación de desempeño'
      ]
    },
    {
      nombre: 'Doctor',
      username: 'doctor',
      password: 'doctor123',
      icono: '👩‍⚕️',
      color: 'bg-green-50 border-green-200 text-green-800',
      descripcion: 'Atención médica y vacunación',
      permisos: [
        'Administrar vacunas',
        'Registrar historial médico',
        'Evaluar pacientes',
        'Generar prescripciones',
        'Actualizar protocolos médicos',
        'Consultar historial de vacunación',
        'Reportar efectos adversos'
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 Roles y Permisos del Sistema
        </h1>
        <p className="text-gray-600">
          El sistema cuenta con 4 tipos de usuarios con diferentes niveles de acceso y funcionalidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((rol, index) => (
          <div key={index} className={`border rounded-lg shadow-sm ${rol.color.replace('text-', 'border-').split(' ')[1]} bg-white`}>
            <div className={`px-6 py-4 border-b ${rol.color.replace('text-', 'border-').split(' ')[1]} ${rol.color.split(' ')[0]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{rol.icono}</span>
                  <div>
                    <h2 className={`text-xl font-bold ${rol.color.split(' ')[2]}`}>
                      {rol.nombre}
                    </h2>
                    <p className={`text-sm ${rol.color.split(' ')[2]} opacity-80`}>
                      {rol.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Credenciales de acceso */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">🔑 Credenciales de Acceso</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usuario:</span>
                    <code className="bg-white px-2 py-1 rounded border">{rol.username}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contraseña:</span>
                    <code className="bg-white px-2 py-1 rounded border">{rol.password}</code>
                  </div>
                </div>
              </div>

              {/* Permisos y funcionalidades */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">✅ Permisos y Funcionalidades</h3>
                <ul className="space-y-2">
                  {rol.permisos.map((permiso, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 text-sm mr-2 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700">{permiso}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔒 Seguridad y Autenticación
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Las contraseñas están simplificadas para demo</li>
            <li>• En producción, usar contraseñas seguras</li>
            <li>• Implementar autenticación de 2 factores</li>
            <li>• Auditoría de acceso y actividades</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            🚀 Funcionalidades por Implementar
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Gestión granular de permisos</li>
            <li>• Notificaciones push</li>
            <li>• Chat integrado</li>
            <li>• Firma digital de documentos</li>
          </ul>
        </div>
      </div>

      {/* Flujo de trabajo típico */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔄 Flujo de Trabajo Típico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <h4 className="font-semibold">1. Padre</h4>
            <p className="text-sm text-gray-600">Programa cita para su hijo</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🏥</span>
            </div>
            <h4 className="font-semibold">2. Director</h4>
            <p className="text-sm text-gray-600">Asigna recursos y personal</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">👩‍⚕️</span>
            </div>
            <h4 className="font-semibold">3. Doctor</h4>
            <p className="text-sm text-gray-600">Administra la vacuna</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <h4 className="font-semibold">4. Admin</h4>
            <p className="text-sm text-gray-600">Supervisa y genera reportes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesUsuariosDemo;