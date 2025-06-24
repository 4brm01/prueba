// src/components/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Tabs, 
  Tab, 
  Select, 
  SelectItem,
  Divider,
  Link,
  Checkbox
} from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from './Icons';
import usuariosService from '../../services/usuariosService';
import authService from '../../services/authService';

const AuthPage = ({ isOpen = true, onClose, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'responsable',
    cedula: '',
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('publicDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('publicDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && !acceptTerms) {
      setError('Debes aceptar los términos y condiciones para registrarte');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Clear token before login to avoid sending stale token
        localStorage.removeItem('authToken');
        const user = await usuariosService.validateLogin(formData.username, formData.password);
        if (user) {
          // Guarda el usuario autenticado para persistencia tras recarga
          localStorage.setItem('currentUser', JSON.stringify(user));

          // Intentar obtener y guardar vacunas, lotes y usuarios si tienes permisos
          try {
            const vacunas = await usuariosService.getVacunas?.();
            if (vacunas) localStorage.setItem('vacunas', JSON.stringify(vacunas));
          } catch (e) { console.warn('No se pudieron guardar vacunas en localStorage'); }

          try {
            const lotes = await usuariosService.getLotesVacunas?.();
            if (lotes) localStorage.setItem('lotesVacunas', JSON.stringify(lotes));
          } catch (e) { console.warn('No se pudieron guardar lotes en localStorage'); }

          try {
            const usuarios = await usuariosService.getUsuarios?.();
            if (usuarios) localStorage.setItem('usuarios', JSON.stringify(usuarios));
          } catch (e) { console.warn('No se pudieron guardar usuarios en localStorage'); }

          if (typeof onLogin === 'function') {
            onLogin(user);
          } else {
            console.error('onLogin is not a function');
          }
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        const newUser = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
        };

        const savedUser = await usuariosService.saveUsuario(newUser);
        onLogin(savedUser);
      }
    } catch (err) {
      // More user-friendly error messages
      let errorMessage = err.message || 'Error en el servidor. Intenta nuevamente.';
      
      if (errorMessage.includes('Error en la solicitud al servidor')) {
        errorMessage = 'Hay un problema temporal con el servidor de autenticación. ' +
                     'El sistema está intentando métodos alternativos de verificación. ' +
                     'Si el problema persiste, contacte al administrador.';
      } else if (errorMessage.includes('Invalid credentials')) {
        errorMessage = 'Usuario o contraseña incorrectos. Verifique sus credenciales.';
      } else if (errorMessage.includes('User account is inactive')) {
        errorMessage = 'Su cuenta está inactiva. Contacte al administrador.';
      }
      
      setError(errorMessage);
      console.error('Error de autenticación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleTabChange = (key) => {
    setIsLogin(key === "login");
    setError('');
    if (key === "login") {
      setFormData({ ...formData, username: '', password: '' });
    } else {
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        role: 'responsable',
        cedula: '',
        telefono: '',
      });
      setAcceptTerms(false);
    }
  };

  // Handler for demo login
  const handleDemoLogin = (demoUser) => {
    if (typeof onLogin === 'function') {
      onLogin(demoUser);
    } else {
      console.error('onLogin is not a function');
    }
  };

  const roleDescriptions = {
    responsable: {
      icon: '👨‍👩‍👧‍👦',
      title: 'Responsable',
      description: 'Accede al historial de vacunación de tus hijos y programa citas en centros de vacunación.'
    },
    doctor: {
      icon: '👩‍⚕️',
      title: 'Enfermero',
      description: 'Gestiona pacientes, registra vacunaciones y administra citas en los centros asignados.'
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Button
            onClick={onBack}
            variant="light"
            startContent={<span>←</span>}
            className="absolute left-0 top-0"
            title="Volver a la página principal"
          >
            Volver
          </Button>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            isIconOnly
            variant="light"
            className="absolute right-0 top-0"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </Button>
          <h1 className="text-4xl font-bold mb-2">Sistema de Vacunación</h1>
          <p className="text-lg text-default-500">Gestión integral de centros de vacunación y pacientes</p>
        </div>

        <div className="auth-content">
          <Card className="auth-card w-full max-w-md">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <Tabs 
                fullWidth 
                size="lg" 
                aria-label="Opciones de autenticación"
                selectedKey={isLogin ? "login" : "register"}
                onSelectionChange={handleTabChange}
              >
                <Tab key="login" title="Iniciar Sesión" />
                <Tab key="register" title="Registrarse" />
              </Tabs>
            </CardHeader>

            <CardBody className="py-5 px-6">
              {error && (
                <div className="bg-danger-50 border-l-4 border-danger text-danger p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <>
                    <Input
                      label="Usuario"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre de usuario"
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">👤</span>}
                    />

                    <Input
                      label="Contraseña"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      type={isPasswordVisible ? "text" : "password"}
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">🔒</span>}
                      endContent={
                        <button 
                          type="button" 
                          onClick={togglePasswordVisibility}
                          className="focus:outline-none"
                        >
                          {isPasswordVisible ? (
                            <EyeSlashIcon className="text-default-400 w-5 h-5" />
                          ) : (
                            <EyeIcon className="text-default-400 w-5 h-5" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex justify-between items-center">
                      <Checkbox size="sm">Recordarme</Checkbox>
                      <Link href="#" size="sm">¿Olvidaste tu contraseña?</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre Completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Cédula"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        placeholder="000-0000000-0"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        type="email"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="(809) 000-0000"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <Input
                      label="Usuario"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nombre de usuario único"
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">👤</span>}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        type={isPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button 
                            type="button" 
                            onClick={togglePasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                      <Input
                        label="Confirmar Contraseña"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button 
                            type="button" 
                            onClick={toggleConfirmPasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isConfirmPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                    </div>

                    <Select
                      label="Tipo de Usuario"
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleChange({target: {name: 'role', value: e.target.value}})}
                      variant="bordered"
                      fullWidth
                    >
                      <SelectItem key="responsable" value="responsable" startContent={<span>👨‍👩‍👧‍👦</span>}>
                        Responsable
                      </SelectItem>
                      <SelectItem key="doctor" value="doctor" startContent={<span>👩‍⚕️</span>}>
                        Enfermero
                      </SelectItem>
                    </Select>

                    {formData.role && (
                      <div className="bg-default-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{roleDescriptions[formData.role].icon}</span>
                          <h4 className="text-md font-semibold">{roleDescriptions[formData.role].title}</h4>
                        </div>
                        <p className="text-sm text-default-500">{roleDescriptions[formData.role].description}</p>
                      </div>
                    )}

                    <Checkbox 
                      isSelected={acceptTerms}
                      onValueChange={setAcceptTerms}
                      size="sm"
                    >
                      Acepto los <Link href="#" size="sm">términos y condiciones</Link> y la <Link href="#" size="sm">política de privacidad</Link>
                    </Checkbox>
                  </>
                )}

                <Divider className="my-4" />

                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  isLoading={loading}
                  isDisabled={!isLogin && !acceptTerms}
                  className="font-semibold"
                  size="lg"
                >
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                </Button>

                {isLogin && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold mb-3 text-blue-800">� Acceso Rápido - Usuarios Demo</h4>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium">👨‍💼 Administrador</span>
                          <p className="text-gray-500 text-xs">Acceso completo al sistema</p>
                        </div>
                        <Button 
                          size="sm" 
                          color="primary"
                          variant="flat" 
                          className="h-7 px-3"
                          onClick={async () => {
                            const result = await authService.demoLogin({
                              id: 'demo-admin',
                              username: 'admin',
                              name: 'Administrador Demo',
                              role: 'administrador'
                            });
                            if (result.success) handleDemoLogin(result.user);
                          }}
                        >
                          Ingresar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium">🏥 Director</span>
                          <p className="text-gray-500 text-xs">Gestión de centro</p>
                        </div>
                        <Button 
                          size="sm" 
                          color="secondary"
                          variant="flat" 
                          className="h-7 px-3"
                          onClick={async () => {
                            const result = await authService.demoLogin({
                              id: 'demo-director',
                              username: 'director',
                              name: 'Director Demo',
                              role: 'director'
                            });
                            if (result.success) handleDemoLogin(result.user);
                          }}
                        >
                          Ingresar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium">👩‍⚕️ Enfermero</span>
                          <p className="text-gray-500 text-xs">Aplicación de vacunas</p>
                        </div>
                        <Button 
                          size="sm" 
                          color="success"
                          variant="flat" 
                          className="h-7 px-3"
                          onClick={async () => {
                            const result = await authService.demoLogin({
                              id: 'demo-enfermero',
                              username: 'enfermero',
                              name: 'Enfermero Demo',
                              role: 'enfermero'
                            });
                            if (result.success) handleDemoLogin(result.user);
                          }}
                        >
                          Ingresar
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-medium">�‍�👩‍👧‍👦 Padre</span>
                          <p className="text-gray-500 text-xs">Consulta de hijos</p>
                        </div>
                        <Button 
                          size="sm" 
                          color="warning"
                          variant="flat" 
                          className="h-7 px-3"
                          onClick={async () => {
                            const result = await authService.demoLogin({
                              id: 'demo-responsable',
                              username: 'responsable',
                              name: 'Responsable Demo',
                              role: 'responsable'
                            });
                            if (result.success) handleDemoLogin(result.user);
                          }}
                        >
                          Ingresar
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                      <strong>💡 Acceso sin servidor:</strong> Estos usuarios funcionan aunque el servidor tenga problemas.
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <h5 className="text-xs font-semibold mb-2 text-blue-700">🔧 Login tradicional (requiere servidor funcionando):</h5>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="bordered" 
                          className="h-6 px-2 text-xs"
                          onClick={() => setFormData({...formData, username: 'admin', password: 'admin123'})}
                        >
                          Admin
                        </Button>
                        <Button 
                          size="sm" 
                          variant="bordered" 
                          className="h-6 px-2 text-xs"
                          onClick={() => setFormData({...formData, username: 'testuser', password: 'test123'})}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-default-500">
                      ¿No tienes una cuenta? 
                      <Button 
                        variant="light" 
                        className="ml-1 p-0" 
                        onClick={() => handleTabChange("register")}
                      >
                        Regístrate aquí
                      </Button>
                    </p>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;