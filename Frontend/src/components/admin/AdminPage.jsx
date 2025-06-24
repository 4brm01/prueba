// src/components/admin/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Button,
  Card,
  CardBody,
  Tabs,
  Tab,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@nextui-org/react";
import usuariosService from '../../services/usuariosService.jsx';
import centrosService from '../../services/centrosService.jsx';
import vacunasService from '../../services/vacunasService.jsx';
import CentrosSection from './CentrosSection.jsx';
import VacunasSection from './VacunasSection.jsx';
import LotesSection from './LotesSection.jsx';
import UsuariosSection from './UsuariosSection.jsx';

// Estilos CSS para los botones flotantes
const floatingButtonStyles = `
  .floating-action-btn {
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .floating-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .relative {
    position: relative;
  }
  
  .action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
    min-width: 150px;
    overflow: hidden;
  }
  
  .action-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
  }
  
  .action-menu-item:hover {
    background: #f5f5f5;
  }
`;

const AdminPage = () => {
  const {
    centrosVacunacion,
    setCentrosVacunacion,
    directores,
    setDirectores,
    vacunas,
    lotesVacunas,
    // Forzar recarga de datos global
    reloadData: globalReloadData
  } = useData();

  const { currentUser } = useAuth();

  // DEPURACIÓN: logs para entender el estado real
  console.log('[DEBUG] currentUser:', currentUser);
  console.log('[DEBUG] currentUser.role:', currentUser?.role);
  console.log('[DEBUG] directores:', directores);
  console.log('[DEBUG] centrosVacunacion:', centrosVacunacion);
  console.log('[DEBUG] centrosVacunacion.length:', centrosVacunacion?.length);

  // Filtrar centros basado en el rol del usuario
  const centrosFiltrados = React.useMemo(() => {
    console.log('[DEBUG] useMemo centrosFiltrados ejecutándose...');
    console.log('[DEBUG] currentUser en useMemo:', currentUser);
    console.log('[DEBUG] centrosVacunacion en useMemo:', centrosVacunacion);
    
    if (!currentUser) {
      console.log('[DEBUG] No hay currentUser, retornando array vacío');
      return [];
    }

    // Para administrador, mostrar todos los centros
    if (currentUser.role === 'administrador') {
      console.log('[DEBUG] Admin user detectado, centrosVacunacion:', centrosVacunacion);
      console.log('[DEBUG] Array.isArray(centrosVacunacion):', Array.isArray(centrosVacunacion));
      const result = Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
      console.log('[DEBUG] Resultado para admin:', result);
      return result;
    }

    // Para directores, mostrar solo sus centros asignados
    if (currentUser.role === 'director') {
      // Buscar al director en el contexto
      const director = (Array.isArray(directores) ? directores : []).find(d => String(d.id_usuario) === String(currentUser.id));
      let centrosAsignados = director?.centrosAsignados || [];

      // Fallback: si el usuario tiene centrosAsignados directamente
      if ((!centrosAsignados || centrosAsignados.length === 0) && Array.isArray(currentUser.centrosAsignados)) {
        centrosAsignados = currentUser.centrosAsignados;
      }

      // Fallback: si el usuario tiene id_centro único
      if ((!centrosAsignados || centrosAsignados.length === 0) && currentUser.id_centro) {
        centrosAsignados = [currentUser.id_centro];
      }

      console.log('[DEBUG] Director user, centrosAsignados usados:', centrosAsignados);

      // Filtrar por id_centro (como string y número), o por nombre de director
      const filtrados = (Array.isArray(centrosVacunacion) ? centrosVacunacion : []).filter(centro =>
        centro.director === currentUser.name ||
        String(centro.id_centro) === String(currentUser.centroId) ||
        centrosAsignados.map(String).includes(String(centro.id_centro))
      );
      console.log('[DEBUG] Centros filtrados para director:', filtrados);
      return filtrados;
    }

    // Fallback: si el role no es reconocido pero tenemos centrosVacunacion, mostrar todos
    console.log('[DEBUG] Role no reconocido o no detectado, aplicando fallback');
    console.log('[DEBUG] Mostrando todos los centros como fallback:', centrosVacunacion);
    return Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
  }, [currentUser, centrosVacunacion, directores]);

  // Log adicional para verificar el resultado final
  console.log('[DEBUG] centrosFiltrados final:', centrosFiltrados);
  console.log('[DEBUG] centrosFiltrados.length:', centrosFiltrados?.length);

  const [activeSection, setActiveSection] = useState('centros');
  const [showAddCentroModal, setShowAddCentroModal] = useState(false);
  const [showAddVacunaModal, setShowAddVacunaModal] = useState(false);
  const [showAddLoteModal, setShowAddLoteModal] = useState(false);
  const [showAddUsuarioModal, setShowAddUsuarioModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState(null);
  const [editingVacuna, setEditingVacuna] = useState(null);
  const [editingLote, setEditingLote] = useState(null);
  const [editingUsuario, setEditingUsuario] = useState(null);

  // Estado para formularios
  const [centroForm, setCentroForm] = useState({
    nombre_centro: '',
    nombre_corto: '',
    direccion: '',
    latitud: '',
    longitud: '',
    telefono: '',
    director: '',
    sitio_web: ''
  });

  const [vacunaForm, setVacunaForm] = useState({
    nombre_vacuna: '',
    fabricante: '',
    tipo: '',
    dosis_requeridas: 1,
    intervalo_dosis: 0,
    edad_minima: 0,
    edad_maxima: 100,
    descripcion: ''
  });

  const [loteForm, setLoteForm] = useState({
    id_vacuna: '',
    numero_lote: '',
    fecha_fabricacion: '',
    fecha_vencimiento: '',
    cantidad_dosis: 0,
    temperatura_almacenamiento: '',
    id_centro: ''
  });

  const [usuarioForm, setUsuarioForm] = useState({
    nombre: '', // Cambiado de name a nombre
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'director', // Cambiado de role a rol
    activo: true, // Cambiado de active a activo
    id_centro: '', // Asegura que siempre exista en el estado
    telefono: ''   // Asegura que siempre exista en el estado
  });

  const [usuarios, setUsuarios] = useState([]);

  // Protecciones para arrays en formularios y acciones
  const safeCentrosVacunacion = Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
  const safeVacunas = Array.isArray(vacunas) ? vacunas : [];

  // Handlers para centros
  const handleAddCentro = () => {
    setEditingCentro(null);
    setCentroForm({
      nombre_centro: '',
      nombre_corto: '',
      direccion: '',
      latitud: '',
      longitud: '',
      telefono: '',
      director: '',
      sitio_web: ''
    });
    setShowAddCentroModal(true);
  };

  const handleEditCentro = (centro) => {
    setEditingCentro(centro);
    setCentroForm({
      nombre_centro: centro.nombre_centro || '',
      nombre_corto: centro.nombre_corto || '',
      direccion: centro.direccion || '',
      latitud: centro.latitud || '',
      longitud: centro.longitud || '',
      telefono: centro.telefono || '',
      director: centro.director || '',
      sitio_web: centro.sitio_web || ''
    });
    setShowAddCentroModal(true);
  };

  const handleCentroFormChange = (e) => {
    const { name, value } = e.target;
    setCentroForm({
      ...centroForm,
      [name]: value
    });
  };

  const handleDeleteCentro = async (centro) => {
    if (window.confirm(`¿Está seguro que desea eliminar el centro ${centro.nombre_centro}?`)) {
      try {
        await centrosService.deleteCentro(centro.id_centro);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        if (centro.director) {
          const directorUser = directores.find(d => d.name === centro.director);
          if (directorUser) {
            await usuariosService.desasignarCentroDeDirector(directorUser.id);
            const usuariosActualizados = await usuariosService.getUsuarios();
            setDirectores(usuariosActualizados.filter(u => u.role === 'director'));
          }
        }

        alert('Centro eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar centro:', error);
        alert('Error al eliminar el centro. Por favor intente nuevamente.');
      }
    }
  };

  const handleSubmitCentro = async (e) => {
    e.preventDefault();
    try {
      const centroData = {
        nombre_centro: centroForm.nombre_centro,
        nombre_corto: centroForm.nombre_corto,
        direccion: centroForm.direccion,
        latitud: centroForm.latitud ? parseFloat(centroForm.latitud) : null,
        longitud: centroForm.longitud ? parseFloat(centroForm.longitud) : null,
        telefono: centroForm.telefono,
        director: centroForm.director,
        sitio_web: centroForm.sitio_web
      };
      if (editingCentro) centroData.id_centro = editingCentro.id_centro;
      await centrosService.saveCentro(centroData);
      if (typeof globalReloadData === 'function') {
        await globalReloadData();
      }
      alert(`Centro ${editingCentro ? 'actualizado' : 'creado'} correctamente`);
      setShowAddCentroModal(false);
      setCentroForm({
        nombre_centro: '',
        nombre_corto: '',
        direccion: '',
        latitud: '',
        longitud: '',
        telefono: '',
        director: '',
        sitio_web: ''
      });
      setEditingCentro(null);
    } catch (error) {
      console.error('Error al guardar centro:', error);
      alert(error.message || 'Error al guardar el centro. Por favor intente nuevamente.');
    }
  };

  // Handlers para vacunas
  const handleAddVacuna = () => {
    setEditingVacuna(null);
    setVacunaForm({
      nombre_vacuna: '',
      fabricante: '',
      tipo: '',
      dosis_requeridas: 1,
      intervalo_dosis: 0,
      edad_minima: 0,
      edad_maxima: 100,
      descripcion: ''
    });
    setShowAddVacunaModal(true);
  };

  const handleEditVacuna = (vacuna) => {
    setEditingVacuna(vacuna);
    setVacunaForm({
      nombre_vacuna: vacuna.nombre_vacuna || '',
      fabricante: vacuna.fabricante || '',
      tipo: vacuna.tipo || '',
      dosis_requeridas: vacuna.dosis_requeridas || 1,
      intervalo_dosis: vacuna.intervalo_dosis || 0,
      edad_minima: vacuna.edad_minima || 0,
      edad_maxima: vacuna.edad_maxima || 100,
      descripcion: vacuna.descripcion || ''
    });
    setShowAddVacunaModal(true);
  };

  const handleVacunaFormChange = (e) => {
    const { name, value } = e.target;
    setVacunaForm({
      ...vacunaForm,
      [name]: name === 'dosis_requeridas' || name === 'intervalo_dosis' ||
        name === 'edad_minima' || name === 'edad_maxima'
        ? parseInt(value, 10)
        : value
    });
  };

  const handleVacunaSubmit = async (e) => {
    e.preventDefault();
    try {
      const vacunaData = {
        nombre_vacuna: vacunaForm.nombre_vacuna,
        fabricante: vacunaForm.fabricante,
        tipo: vacunaForm.tipo,
        dosis_requeridas: vacunaForm.dosis_requeridas,
        intervalo_dosis: vacunaForm.intervalo_dosis,
        edad_minima: vacunaForm.edad_minima,
        edad_maxima: vacunaForm.edad_maxima,
        descripcion: vacunaForm.descripcion
      };
      if (editingVacuna) vacunaData.id_vacuna = editingVacuna.id_vacuna;
      await vacunasService.saveVacuna(vacunaData);
      if (typeof globalReloadData === 'function') {
        await globalReloadData();
      }
      alert(`Vacuna ${editingVacuna ? 'actualizada' : 'creada'} correctamente`);
      setShowAddVacunaModal(false);
      setVacunaForm({
        nombre_vacuna: '',
        fabricante: '',
        tipo: '',
        dosis_requeridas: 1,
        intervalo_dosis: 0,
        edad_minima: 0,
        edad_maxima: 100,
        descripcion: ''
      });
      setEditingVacuna(null);
    } catch (error) {
      console.error('Error al guardar vacuna:', error);
      alert(error.message || 'Error al guardar la vacuna. Por favor intente nuevamente.');
    }
  };

  // Handlers para lotes
  const handleAddLote = () => {
    setEditingLote(null);
    setLoteForm({
      id_vacuna: '',
      numero_lote: '',
      fecha_fabricacion: '',
      fecha_vencimiento: '',
      cantidad_dosis: 0,
      temperatura_almacenamiento: '',
      id_centro: ''
    });
    setShowAddLoteModal(true);
  };

  const handleEditLote = (lote) => {
    setEditingLote(lote);
    setLoteForm({
      id_vacuna: lote.id_vacuna || '',
      numero_lote: lote.numero_lote || '',
      fecha_fabricacion: lote.fecha_fabricacion ? lote.fecha_fabricacion.split('T')[0] : '',
      fecha_vencimiento: lote.fecha_vencimiento ? lote.fecha_vencimiento.split('T')[0] : '',
      cantidad_dosis: lote.cantidad_dosis || 0,
      temperatura_almacenamiento: lote.temperatura_almacenamiento || '',
      id_centro: lote.id_centro || ''
    });
    setShowAddLoteModal(true);
  };

  const handleLoteFormChange = (e) => {
    const { name, value } = e.target;
    setLoteForm({
      ...loteForm,
      [name]: name === 'cantidad_dosis' ? parseInt(value, 10) : value
    });
  };

  const handleLoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const loteData = {
        id_vacuna: loteForm.id_vacuna,
        numero_lote: loteForm.numero_lote,
        fecha_fabricacion: loteForm.fecha_fabricacion,
        fecha_vencimiento: loteForm.fecha_vencimiento,
        cantidad_dosis: loteForm.cantidad_dosis,
        temperatura_almacenamiento: loteForm.temperatura_almacenamiento,
        id_centro: loteForm.id_centro
      };
      if (editingLote) loteData.id_lote = editingLote.id_lote;
      await vacunasService.saveLote(loteData);
      if (typeof globalReloadData === 'function') {
        await globalReloadData();
      }
      alert(`Lote ${editingLote ? 'actualizado' : 'creado'} correctamente`);
      setShowAddLoteModal(false);
      setLoteForm({
        id_vacuna: '',
        numero_lote: '',
        fecha_fabricacion: '',
        fecha_vencimiento: '',
        cantidad_dosis: 0,
        temperatura_almacenamiento: '',
        id_centro: ''
      });
      setEditingLote(null);
    } catch (error) {
      console.error('Error al guardar lote:', error);
      alert(error.message || 'Error al guardar el lote. Por favor intente nuevamente.');
    }
  };

  // Handlers para usuarios
  const handleAddUsuario = () => {
    setEditingUsuario(null);
    setUsuarioForm({
      nombre: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'director',
      activo: true,
      id_centro: '', // Asegura que siempre exista en el estado
      telefono: ''   // Asegura que siempre exista en el estado
    });
    setShowAddUsuarioModal(true);
  };

  const handleEditUsuario = (usuario) => {
    setEditingUsuario(usuario);
    const userRole = usuario.rol || usuario.role || 'director';
    setUsuarioForm({
      nombre: usuario.nombre || usuario.name || '',
      username: usuario.username || '',
      email: usuario.email || '',
      password: '',
      confirmPassword: '',
      rol: userRole,
      activo: usuario.activo !== undefined ? usuario.activo : (usuario.active !== undefined ? usuario.active : true),
      // Incluir id_centro y telefono para todos los roles
      id_centro: usuario.id_centro || '',
      telefono: usuario.telefono || ''
    });
    setShowAddUsuarioModal(true);
  };

  const toggleUsuarioStatus = async (usuario) => {
    try {
      const updatedUser = {
        ...usuario,
        active: !usuario.active
      };

      await usuariosService.saveUsuario(updatedUser);

      const usuariosActualizados = await usuariosService.getUsuarios();
      setUsuarios(usuariosActualizados);
      setDirectores(usuariosActualizados.filter(u => u.role === 'director'));

      alert(`Usuario ${usuario.name} ${updatedUser.active ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error al actualizar estado del usuario:', error);
      alert('Error al actualizar el estado del usuario');
    }
  };

  const handleDeleteUsuario = async (usuario) => {
    if (usuario.role === 'administrador') {
      alert('No se puede eliminar al usuario administrador');
      return;
    }

    const confirmed = window.confirm(`¿Está seguro de eliminar al usuario ${usuario.name}?`);
    if (confirmed) {
      try {
        await usuariosService.deleteUsuario(usuario.id);

        const usuariosActualizados = await usuariosService.getUsuarios();
        setUsuarios(usuariosActualizados);
        setDirectores(usuariosActualizados.filter(u => u.role === 'director'));

        alert('Usuario eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  };

  const handleUsuarioFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuarioForm({
      ...usuarioForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUsuarioSubmit = async (e) => {
    e.preventDefault();

    // Validaciones requeridas por el backend
    if (!usuarioForm.password) {
      alert('La contraseña es obligatoria.');
      return;
    }
    
    if (usuarioForm.password !== usuarioForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar que el rol sea válido según el backend
    const rolesValidos = ['doctor', 'director', 'responsable', 'administrador'];
    if (!rolesValidos.includes(usuarioForm.rol)) {
      alert('El rol seleccionado no es válido');
      return;
    }

    // Validaciones específicas para responsable
    if (usuarioForm.rol === 'responsable') {
      if (!usuarioForm.id_centro) {
        alert('Debe seleccionar un centro asignado.');
        return;
      }
      if (!usuarioForm.telefono) {
        alert('El teléfono es obligatorio para responsables.');
        return;
      }
      // Validar formato de teléfono: +1-809-532-0001
      const telefonoRegex = /^\+?[0-9\-\s()]{10,}$/;
      if (!telefonoRegex.test(usuarioForm.telefono)) {
        alert('El teléfono debe tener un formato válido (Ej: +1-809-532-0001)');
        return;
      }
    }

    // Validar formato de teléfono si se proporciona (para cualquier rol)
    if (usuarioForm.telefono && usuarioForm.telefono.trim() !== '') {
      const telefonoRegex = /^\+?[0-9\-\s()]{10,}$/;
      if (!telefonoRegex.test(usuarioForm.telefono)) {
        alert('El teléfono debe tener un formato válido (Ej: +1-809-532-0001)');
        return;
      }
    }

    try {
      // Construir el objeto base del usuario
      const usuarioData = {
        nombre: usuarioForm.nombre,
        username: usuarioForm.username,
        email: usuarioForm.email,
        rol: usuarioForm.rol,
        password: usuarioForm.password,
        activo: usuarioForm.activo
      };

      // Incluir teléfono si se proporciona (para cualquier rol)
      if (usuarioForm.telefono && usuarioForm.telefono.trim() !== '') {
        usuarioData.telefono = usuarioForm.telefono;
      }

      // Incluir centro si se selecciona (para cualquier rol)
      if (usuarioForm.id_centro && usuarioForm.id_centro !== '') {
        usuarioData.id_centro = usuarioForm.id_centro;
      }

      // Para responsable, estos campos son obligatorios (ya validados arriba)
      if (usuarioForm.rol === 'responsable') {
        usuarioData.id_centro = usuarioForm.id_centro;
        usuarioData.telefono = usuarioForm.telefono;
      }

      // Si es edición, incluir el ID
      if (editingUsuario) {
        usuarioData.id = editingUsuario.id || editingUsuario.id_usuario;
      }

      console.log('Enviando datos del usuario:', usuarioData);
      
      await usuariosService.saveUsuario(usuarioData);
      
      // Recargar datos
      const usuariosActualizados = await usuariosService.getUsuarios();
      setUsuarios(usuariosActualizados);
      setDirectores(usuariosActualizados.filter(u => (u.rol || u.role) === 'director'));
      
      alert(`Usuario ${usuarioForm.nombre} ${editingUsuario ? 'actualizado' : 'creado'} correctamente`);
      
      // Limpiar formulario
      setShowAddUsuarioModal(false);
      setUsuarioForm({
        nombre: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: 'director',
        activo: true,
        id_centro: '', // Asegura que siempre exista en el estado
        telefono: ''   // Asegura que siempre exista en el estado
      });
      setEditingUsuario(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      
      // Manejar diferentes tipos de errores
      let errorMsg = 'Error al guardar el usuario. Por favor, inténtelo de nuevo.';
      
      if (error.response?.data?.data && Array.isArray(error.response.data.data)) {
        // Errores de validación del backend
        const errorMessages = error.response.data.data.map(err => err.msg).join(', ');
        errorMsg = `Errores de validación: ${errorMessages}`;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(errorMsg);
    }
  };

  const handleDeleteVacuna = async (vacuna) => {
    const confirmed = window.confirm(`¿Está seguro de eliminar la vacuna ${vacuna.nombre_vacuna}?\nEsta acción no se puede deshacer y eliminará también los lotes asociados.`);
    if (confirmed) {
      try {
        // Verificar si hay lotes asociados
        const lotesAsociados = Array.isArray(lotesVacunas) ? lotesVacunas.filter(lote => lote.id_vacuna === vacuna.id_vacuna) : [];
        if (lotesAsociados.length > 0) {
          alert('No se puede eliminar la vacuna porque tiene lotes asociados. Elimine primero los lotes.');
          return;
        }

        await vacunasService.deleteVacuna(vacuna.id_vacuna);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        alert('Vacuna eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar la vacuna:', error);
        alert(error.message || 'Error al eliminar la vacuna');
      }
    }
  };

  const handleDeleteLote = async (lote) => {
    const confirmed = window.confirm(`¿Está seguro de eliminar el lote ${lote.numero_lote}?\nEsta acción no se puede deshacer.`);
    if (confirmed) {
      try {
        await vacunasService.deleteLote(lote.id_lote);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        alert('Lote eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el lote:', error);
        alert(error.message || 'Error al eliminar el lote');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const usuariosCargados = await usuariosService.getUsuarios();
        setUsuarios(usuariosCargados);
        setDirectores(usuariosCargados.filter(u => u.role === 'director'));

        // CORREGIDO: Esperar la Promise antes de setear el estado
        const centrosCargados = await centrosService.getCentros();
        console.log('Centros cargados en AdminPage:', centrosCargados);
        setCentrosVacunacion(centrosCargados);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setUsuarios([]);
      }
    };
    loadData();
  }, [setDirectores, setCentrosVacunacion]);

  // Determinar permisos según el rol
  const isAdmin = currentUser?.rol === 'administrador' || currentUser?.role === 'administrador';

  // Permitir acceso a la sección de centros a todos, pero restringir el resto solo a admin
  if (!isAdmin && activeSection !== 'centros') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso denegado</h2>
        <p className="text-default-500">No tienes permisos para acceder a este panel.</p>
      </div>
    );
  }
 
  return (
    <div className="space-y-6 p-4 relative">
      <style>{floatingButtonStyles}</style>

      <Card shadow="sm" className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Panel de Administración</h2>
              <p className="text-default-500">Gestiona centros, vacunas, lotes y usuarios del sistema</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">🏥</span>
                  <span className="text-xl font-bold">{centrosVacunacion.length}</span>
                  <span className="text-small text-default-500">Centros</span>
                </CardBody>
              </Card>
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">💉</span>
                  <span className="text-xl font-bold">{vacunas.length}</span>
                  <span className="text-small text-default-500">Vacunas</span>
                </CardBody>
              </Card>
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">📦</span>
                  <span className="text-xl font-bold">{lotesVacunas.length}</span>
                  <span className="text-small text-default-500">Lotes</span>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs
        selectedKey={activeSection}
        onSelectionChange={setActiveSection}
        variant="underlined"
        color="primary"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab
          key="centros"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏥</span>
              <span>Centros de Vacunación</span>
            </div>
          }
        />
        {isAdmin && (
          <>
            <Tab
              key="vacunas"
              title={
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💉</span>
                  <span>Vacunas</span>
                </div>
              }
            />
            <Tab
              key="lotes"
              title={
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📦</span>
                  <span>Lotes de Vacunas</span>
                </div>
              }
            />
            <Tab
              key="usuarios"
              title={
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👥</span>
                  <span>Usuarios</span>
                </div>
              }
            />
          </>
        )}
      </Tabs>

      <div className="space-y-4">
        {/* Sección de Centros */}
        {activeSection === 'centros' && (
          <CentrosSection
            centros={centrosFiltrados}
            directores={directores}
            onAdd={isAdmin ? handleAddCentro : undefined}
            onEdit={isAdmin ? handleEditCentro : undefined}
            onDelete={isAdmin ? handleDeleteCentro : undefined}
            canEdit={isAdmin}
          />
        )}

        {/* Sección de Vacunas */}
        {activeSection === 'vacunas' && (
          <VacunasSection
            vacunas={vacunas}
            onAdd={handleAddVacuna}
            onEdit={handleEditVacuna}
            onDelete={handleDeleteVacuna}
            canEdit={isAdmin}
          />
        )}

        {/* Sección de Lotes */}
        {activeSection === 'lotes' && (
          <LotesSection
            lotes={lotesVacunas}
            vacunas={vacunas}
            centros={centrosVacunacion}
            onAdd={handleAddLote}
            onEdit={handleEditLote}
            onDelete={handleDeleteLote}
            canEdit={isAdmin}
          />
        )}

        {/* Sección de Usuarios */}
        {activeSection === 'usuarios' && (
          <UsuariosSection
            usuarios={usuarios}
            onAdd={handleAddUsuario}
            onEdit={handleEditUsuario}
            onDelete={handleDeleteUsuario}
            onToggleStatus={toggleUsuarioStatus}
            canEdit={isAdmin}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Modal para añadir/editar centro */}
      <Modal
        isOpen={showAddCentroModal}
        onClose={() => setShowAddCentroModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingCentro ? 'Editar Centro' : 'Añadir Nuevo Centro'}</h3>
                <p className="text-small text-default-500">
                  {editingCentro
                    ? 'Modifica la información del centro de vacunación'
                    : 'Completa la información para crear un nuevo centro de vacunación'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleSubmitCentro} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Nombre del Centro</label>
                      <input
                        type="text"
                        name="nombre_centro"
                        value={centroForm.nombre_centro}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Nombre Corto</label>
                      <input
                        type="text"
                        name="nombre_corto"
                        value={centroForm.nombre_corto}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={centroForm.direccion}
                      onChange={handleCentroFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Latitud</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="latitud"
                        value={centroForm.latitud}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Longitud</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="longitud"
                        value={centroForm.longitud}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={centroForm.telefono}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Director</label>
                      <select
                        name="director"
                        value={centroForm.director}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Seleccionar Director --</option>
                        {directores
                          .filter(director => director.active && director.role === 'director')
                          .map(director => (
                            <option key={director.id} value={director.name}>
                              {director.name}
                            </option>
                          ))
                        }
                        {directores.filter(director => director.active && director.role === 'director').length === 0 && (
                          <option value="" disabled>No hay directores disponibles</option>
                        )}
                      </select>
                      {directores.filter(director => director.active && director.role === 'director').length === 0 && (
                        <div className="text-warning text-xs mt-1">
                          No hay directores disponibles. Cree uno en la sección "Usuarios".
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Sitio Web</label>
                    <input
                      type="url"
                      name="sitio_web"
                      value={centroForm.sitio_web}
                      onChange={handleCentroFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://..."
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleSubmitCentro}
                >
                  {editingCentro ? 'Guardar Cambios' : 'Crear Centro'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar vacuna */}
      <Modal
        isOpen={showAddVacunaModal}
        onClose={() => setShowAddVacunaModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingVacuna ? 'Editar Vacuna' : 'Añadir Nueva Vacuna'}</h3>
                <p className="text-small text-default-500">
                  {editingVacuna
                    ? 'Modifica la información de la vacuna'
                    : 'Completa la información para crear una nueva vacuna'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleVacunaSubmit} className="modern-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de la Vacuna</label>
                      <input
                        type="text"
                        name="nombre_vacuna"
                        value={vacunaForm.nombre_vacuna}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Fabricante</label>
                      <input
                        type="text"
                        name="fabricante"
                        value={vacunaForm.fabricante}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Vacuna</label>
                    <select
                      name="tipo"
                      value={vacunaForm.tipo}
                      onChange={handleVacunaFormChange}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="ARNm">ARNm</option>
                      <option value="Vector viral">Vector viral</option>
                      <option value="Subunidad proteica">Subunidad proteica</option>
                      <option value="Virus inactivado">Virus inactivado</option>
                      <option value="Virus atenuado">Virus atenuado</option>
                      <option value="Toxoide">Toxoide</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Dosis Requeridas</label>
                      <input
                        type="number"
                        min="1"
                        name="dosis_requeridas"
                        value={vacunaForm.dosis_requeridas}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Intervalo entre Dosis (días)</label>
                      <input
                        type="number"
                        min="0"
                        name="intervalo_dosis"
                        value={vacunaForm.intervalo_dosis}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Edad Mínima (meses)</label>
                      <input
                        type="number"
                        min="0"
                        name="edad_minima"
                        value={vacunaForm.edad_minima}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Edad Máxima (meses)</label>
                      <input
                        type="number"
                        min="0"
                        name="edad_maxima"
                        value={vacunaForm.edad_maxima}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={vacunaForm.descripcion}
                      onChange={handleVacunaFormChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleVacunaSubmit}
                >
                  {editingVacuna ? 'Guardar Cambios' : 'Crear Vacuna'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar lote */}
      <Modal
        isOpen={showAddLoteModal}
        onClose={() => setShowAddLoteModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingLote ? 'Editar Lote' : 'Añadir Nuevo Lote'}</h3>
                <p className="text-small text-default-500">
                  {editingLote
                    ? 'Modifica la información del lote de vacunas'
                    : 'Completa la información para registrar un nuevo lote de vacunas'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleLoteSubmit} className="modern-form">
                  <div className="form-group">
                    <label>Vacuna</label>
                    <select
                      name="id_vacuna"
                      value={loteForm.id_vacuna}
                      onChange={handleLoteFormChange}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione una vacuna</option>
                      {safeVacunas.map(vacuna => (
                        <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>
                          {vacuna.nombre_vacuna} - {vacuna.fabricante}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Número de Lote</label>
                    <input
                      type="text"
                      name="numero_lote"
                      value={loteForm.numero_lote}
                      onChange={handleLoteFormChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Fabricación</label>
                      <input
                        type="date"
                        name="fecha_fabricacion"
                        value={loteForm.fecha_fabricacion}
                        onChange={handleLoteFormChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha de Vencimiento</label>
                      <input
                        type="date"
                        name="fecha_vencimiento"
                        value={loteForm.fecha_vencimiento}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad de Dosis</label>
                      <input
                        type="number"
                        min="1"
                        name="cantidad_dosis"
                        value={loteForm.cantidad_dosis}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Temperatura de Almacenamiento</label>
                      <input
                        type="text"
                        name="temperatura_almacenamiento"
                        value={loteForm.temperatura_almacenamiento}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        placeholder="Ej: 2-8°C"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Centro Asignado</label>
                    <select
                      name="id_centro"
                      value={loteForm.id_centro}
                      onChange={handleLoteFormChange}
                      className="form-control"
                    >
                      <option value="">Seleccione un centro</option>
                      {safeCentrosVacunacion.map(centro => (
                        <option key={centro.id_centro} value={centro.id_centro}>
                          {centro.nombre_centro}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleLoteSubmit}
                >
                  {editingLote ? 'Guardar Cambios' : 'Crear Lote'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar usuario */}
      <Modal
        isOpen={showAddUsuarioModal}
        onClose={() => setShowAddUsuarioModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingUsuario ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
                <p className="text-small text-default-500">
                  {editingUsuario
                    ? 'Modifica la información del usuario. Todos los campos son obligatorios.'
                    : 'Completa la información para crear un nuevo usuario. Todos los campos son obligatorios.'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleUsuarioSubmit} className="modern-form">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      name="nombre"
                      value={usuarioForm.nombre}
                      onChange={handleUsuarioFormChange}
                      className="form-control"
                      required
                      placeholder="Nombre y apellidos"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de Usuario</label>
                      <input
                        type="text"
                        name="username"
                        value={usuarioForm.username}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        required
                        placeholder="Nombre de usuario"
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input
                        type="email"
                        name="email"
                        value={usuarioForm.email}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        required
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={usuarioForm.password}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirmar Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={usuarioForm.confirmPassword}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        placeholder="Repetir contraseña"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      name="rol"
                      value={usuarioForm.rol}
                      onChange={handleUsuarioFormChange}
                      className="form-control"
                      required
                    >
                      <option value="director">Director</option>
                      <option value="doctor">Doctor</option>
                      <option value="responsable">Responsable</option>
                      {currentUser.role === 'administrador' && (
                        <option value="administrador">Administrador</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={usuarioForm.activo}
                        onChange={handleUsuarioFormChange}
                        className="mr-2"
                      />
                      Usuario Activo
                    </label>
                  </div>

                  <div className="form-row">
                    {/* Teléfono para todos los roles */}
                    <div className="form-group">
                      <label>Teléfono {usuarioForm.rol === 'responsable' ? '*' : '(Opcional)'}</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={usuarioForm.telefono || ''}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        required={usuarioForm.rol === 'responsable'}
                        pattern="^\+?[0-9\-\s()]{10,}$"
                        placeholder="Ej: +1-809-532-0001"
                      />
                    </div>
                    {/* Centro para todos los roles */}
                    <div className="form-group">
                      <label>Centro Asignado {usuarioForm.rol === 'responsable' ? '*' : '(Opcional)'}</label>
                      <select
                        name="id_centro"
                        value={usuarioForm.id_centro || ''}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        required={usuarioForm.rol === 'responsable'}
                      >
                        <option value="">Seleccione un centro</option>
                        {safeCentrosVacunacion.map(centro => (
                          <option key={centro.id_centro} value={centro.id_centro}>
                            {centro.nombre_centro}
                          </option>
                        ))}
                        </select>
                      </div>
                    </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleUsuarioSubmit}
                >
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminPage;