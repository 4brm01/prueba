// src/components/centros/MisCentros.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, CardBody, CardHeader, Divider, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Tabs, Tab, Tooltip, Input
} from "@nextui-org/react";
import { useData } from '../../context/DataContext';
import centrosService from '../../services/centrosService';
import jsonService from '../../services/jsonService';
import { useAuth } from '../../context/AuthContext';
import usuariosService from '../../services/usuariosService';

const MisCentros = () => {
  const { centrosVacunacion, vacunas, lotesVacunas, setCentrosVacunacion, setLotesVacunas } = useData();
  const { currentUser } = useAuth();
  const [centrosDirector, setCentrosDirector] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [checkedDoctors, setCheckedDoctors] = useState([]);
  const [centrosConDoctores, setCentrosConDoctores] = useState({});
  const [activeTab, setActiveTab] = useState("vacunas");
  const [vacunaForm, setVacunaForm] = useState({
    nombre_vacuna: '', fabricante: '', tipo: '', dosis_requeridas: 1, intervalo_dosis: 0, edad_minima: 0, edad_maxima: 100, descripcion: ''
  });
  const [loteForm, setLoteForm] = useState({
    id_vacuna: '', numero_lote: '', fecha_fabricacion: '', fecha_vencimiento: '', cantidad_dosis: 0, temperatura_almacenamiento: '', id_centro: ''
  });
  const [centroForm, setCentroForm] = useState({
    nombre_centro: '', nombre_corto: '', direccion: '', latitud: '', longitud: '', telefono: '', director: '', sitio_web: ''
  });
  const [editingVacuna, setEditingVacuna] = useState(null);
  const [editingLote, setEditingLote] = useState(null);
  const [editingCentro, setEditingCentro] = useState(null);
  const [showVacunaModal, setShowVacunaModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [showCentroModal, setShowCentroModal] = useState(false);
  const [error, setError] = useState(null);

  const centrosDirectorOptions = centrosDirector.map(c => ({ value: c.id_centro, label: c.nombre_centro }));

  let centrosDelDoctor = [];
  if (currentUser && currentUser.role === 'doctor') {
    if (Array.isArray(currentUser.centrosAsignados) && currentUser.centrosAsignados.length > 0) {
      centrosDelDoctor = centrosVacunacion.filter(c => currentUser.centrosAsignados.includes(c.id_centro));
    } else if (currentUser.id_centro) {
      centrosDelDoctor = centrosVacunacion.filter(c => c.id_centro === currentUser.id_centro);
    }
  }

  const handleAddCentro = () => {
    setEditingCentro(null);
    setCentroForm({
      nombre_centro: '', nombre_corto: '', direccion: '', latitud: '', longitud: '', telefono: '', director: '', sitio_web: ''
    });
    setShowCentroModal(true);
  };

  const handleEditCentro = (centro) => {
    setEditingCentro(centro);
    setCentroForm({
      ...centro,
      latitud: centro.latitud || '',
      longitud: centro.longitud || '',
      sitio_web: centro.sitio_web || ''
    });
    setShowCentroModal(true);
  };

  const handleDeleteCentro = async (centro) => {
    if (window.confirm(`¿Eliminar el centro ${centro.nombre_centro}?`)) {
      try {
        await centrosService.deleteCentro(centro.id_centro);
        setCentrosVacunacion(centrosVacunacion.filter(c => c.id_centro !== centro.id_centro));
        setCentrosDirector(centrosDirector.filter(c => c.id_centro !== centro.id_centro));
      } catch (error) {
        setError(error.message || 'Error al eliminar el centro');
      }
    }
  };

  const handleCentroFormChange = (e) => {
    const { name, value } = e.target;
    setCentroForm({ ...centroForm, [name]: value });
  };

  const handleCentroSubmit = async (e) => {
    e.preventDefault();
    try {
      const centroData = {
        ...centroForm,
        latitud: centroForm.latitud ? parseFloat(centroForm.latitud) : undefined,
        longitud: centroForm.longitud ? parseFloat(centroForm.longitud) : undefined
      };
      const response = await centrosService.saveCentro(centroData);
      const updatedCentros = editingCentro
        ? centrosVacunacion.map(c => c.id_centro === centroData.id_centro ? centroData : c)
        : [...centrosVacunacion, { ...centroData, id_centro: response.id_centro }];
      setCentrosVacunacion(updatedCentros);
      setCentrosDirector(editingCentro
        ? centrosDirector.map(c => c.id_centro === centroData.id_centro ? centroData : c)
        : [...centrosDirector, { ...centroData, id_centro: response.id_centro }]);
      setShowCentroModal(false);
      setError(null);
    } catch (error) {
      setError(error.message || 'Error al guardar el centro');
    }
  };

  const handleAddVacuna = () => {
    setEditingVacuna(null);
    setVacunaForm({ nombre_vacuna: '', fabricante: '', tipo: '', dosis_requeridas: 1, intervalo_dosis: 0, edad_minima: 0, edad_maxima: 100, descripcion: '' });
    setShowVacunaModal(true);
  };

  const handleEditVacuna = (vac) => {
    setEditingVacuna(vac);
    setVacunaForm({ ...vac });
    setShowVacunaModal(true);
  };

  const handleDeleteVacuna = (vac) => {
    if (window.confirm(`¿Eliminar la vacuna ${vac.nombre_vacuna}?`)) {
      jsonService.saveData('Vacunas', 'DELETE', { id: vac.id_vacuna });
    }
  };

  const handleVacunaFormChange = (e) => {
    const { name, value } = e.target;
    setVacunaForm({
      ...vacunaForm,
      [name]: ['dosis_requeridas', 'intervalo_dosis', 'edad_minima', 'edad_maxima'].includes(name) ? parseInt(value, 10) || 0 : value
    });
  };

  const handleVacunaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVacuna) {
        const vacunaEditada = {
          ...vacunaForm,
          id_vacuna: editingVacuna.id_vacuna,
          fecha_actualizacion: new Date().toISOString()
        };
        await jsonService.saveData('Vacunas', 'PUT', vacunaEditada);
      } else {
        const newVacuna = {
          ...vacunaForm,
          id_vacuna: crypto?.randomUUID() || `vacuna-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        };
        await jsonService.saveData('Vacunas', 'POST', newVacuna);
      }
      setShowVacunaModal(false);
    } catch (error) {
      setError(error.message || 'Error al guardar la vacuna');
    }
  };

  const handleAddLote = () => {
    setEditingLote(null);
    setLoteForm({ id_vacuna: '', numero_lote: '', fecha_fabricacion: '', fecha_vencimiento: '', cantidad_dosis: 0, temperatura_almacenamiento: '', id_centro: '' });
    setShowLoteModal(true);
  };

  const handleEditLote = (lote) => {
    setEditingLote(lote);
    setLoteForm({ ...lote });
    setShowLoteModal(true);
  };

  const handleDeleteLote = (lote) => {
    if (window.confirm(`¿Eliminar el lote ${lote.numero_lote}?`)) {
      jsonService.saveData('Lotes_Vacunas', 'DELETE', { id: lote.id_lote });
    }
  };

  const handleLoteFormChange = (e) => {
    const { name, value } = e.target;
    setLoteForm({ ...loteForm, [name]: name === 'cantidad_dosis' ? parseInt(value, 10) || 0 : value });
  };

  const handleLoteSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLote) {
        const loteEditado = {
          ...loteForm,
          id_lote: editingLote.id_lote,
          cantidad_disponible: typeof loteForm.cantidad_dosis === 'number' ? loteForm.cantidad_dosis : 0,
          fecha_actualizacion: new Date().toISOString()
        };
        await jsonService.saveData('Lotes_Vacunas', 'PUT', loteEditado);
      } else {
        const newLote = {
          ...loteForm,
          id_lote: crypto?.randomUUID() || `lote-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cantidad_disponible: typeof loteForm.cantidad_dosis === 'number' ? loteForm.cantidad_dosis : 0,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString()
        };
        await jsonService.saveData('Lotes_Vacunas', 'POST', newLote);
        const lotesActualizados = [
          ...jsonService.getData('Lotes_Vacunas', 'GET'),
          ...jsonService.getData('Lotes_Vacunas', 'POST'),
          ...jsonService.getData('Lotes_Vacunas', 'PUT')
        ];
        setLotesVacunas(lotesActualizados.reduce((acc, l) => {
          const id_lote = l?.id_lote || l?.id || `${l?.id_vacuna}_${l?.numero_lote}`;
          if (!id_lote) return acc;
          if (!acc.some(x => (x.id_lote || x.id) === id_lote)) acc.push({ ...l, id_lote });
          return acc;
        }, []));
      }
      setShowLoteModal(false);
    } catch (error) {
      setError(error.message || 'Error al guardar el lote');
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log("Current user role:", currentUser.role);
      if (currentUser.role === 'director') {
        // Usar name o username, según lo que venga del API
        const directorName = (currentUser.name || currentUser.username || '').trim().toLowerCase();
        console.log("Director name:", directorName);
        console.log("Centros disponibles:", centrosVacunacion);
        
        const filtrados = centrosVacunacion.filter(
          c => c.director && c.director.trim().toLowerCase() === directorName
        );
        console.log("Centros filtrados para el director:", filtrados);
        setCentrosDirector(filtrados);
      } else if (currentUser.role === 'administrador') {
        // Los administradores pueden ver todos los centros
        setCentrosDirector(centrosVacunacion);
      }
    }
  }, [centrosVacunacion, currentUser]);

  useEffect(() => {
    async function fetchDoctores() {
      try {
        const usuarios = await usuariosService.getUsuarios();
        console.log("Usuarios obtenidos:", usuarios);
        const doctoresFiltrados = usuarios.filter(u => u.role === 'doctor' || u.rol === 'doctor');
        console.log("Doctores filtrados:", doctoresFiltrados);
        setDoctores(doctoresFiltrados);
      } catch (e) {
        console.error("Error al obtener doctores:", e);
        setDoctores([]);
      }
    }
    fetchDoctores();
  }, []);

  useEffect(() => {
    const mapping = {};
    doctores.forEach(doc => {
      if (Array.isArray(doc.centrosAsignados)) {
        doc.centrosAsignados.forEach(cid => {
          if (!mapping[cid]) mapping[cid] = [];
          mapping[cid].push(doc.id);
        });
      }
    });
    setCentrosConDoctores(mapping);
  }, [doctores]);

  const handleOpenModal = (centro) => {
    console.log("Abriendo modal para centro:", centro);
    setSelectedCentro(centro);
    
    // Obtener los doctores ya asignados a este centro
    const doctoresAsignados = centrosConDoctores[centro.id_centro] || [];
    console.log("Doctores asignados a este centro:", doctoresAsignados);
    
    setCheckedDoctors(doctoresAsignados);
    setShowModal(true);
  };

  const getVacunaNombreById = (id) => {
    const vacuna = vacunas.find(v => v.id_vacuna === id);
    return vacuna ? vacuna.nombre_vacuna : 'Sin vacuna';
  };

  const getCentroNombreById = (id) => {
    const centro = centrosDirectorOptions.find(c => c.value === id);
    return centro ? centro.label : 'Sin centro';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return fecha;
    }
  };

  return (
    <>
      {currentUser && currentUser.role === 'doctor' && (
        <div className="mb-6">
          <Card shadow="sm">
            <CardHeader>
              <h4 className="text-lg font-bold">Centros donde trabajas</h4>
            </CardHeader>
            <CardBody>
              {centrosDelDoctor.length === 0 ? (
                <p className="text-default-500">No tienes centros asignados.</p>
              ) : (
                <ul className="list-disc ml-6">
                  {centrosDelDoctor.map(centro => (
                    <li key={centro.id_centro}>
                      <span className="font-semibold">{centro.nombre_centro}</span> <span className="text-default-400">({centro.direccion})</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      )}
      {currentUser?.role === 'administrador' && (
        <div className="mb-6">
          <Button color="primary" onClick={handleAddCentro}>
            Añadir Nuevo Centro
          </Button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-danger-100 text-danger-700 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centrosDirector.length === 0 && (
          <div className="col-span-full text-center text-default-500 py-10">
            No tienes centros asignados.
          </div>
        )}
        {centrosDirector.map((centro) => (
          <div key={centro.id_centro} className="h-full flex flex-col">
            <Card className="flex-grow" shadow="sm">
              <CardHeader className="flex gap-3 bg-primary-50 dark:bg-primary-900/20">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{centro.nombre_centro}</p>
                  <p className="text-small text-default-500">{centro.nombre_corto || "Sin nombre corto"}</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-2">
                  <p><span className="font-semibold">Dirección:</span> {centro.direccion}</p>
                  <p><span className="font-semibold">Teléfono:</span> {centro.telefono}</p>
                  <p><span className="font-semibold">Director:</span> {centro.director || "No asignado"}</p>
                  <p><span className="font-semibold">Doctores asignados:</span></p>
                  <ul className="list-disc ml-6">
                    {(centrosConDoctores[centro.id_centro] || []).length === 0 && (
                      <li className="text-default-400">Ninguno</li>
                    )}
                    {(centrosConDoctores[centro.id_centro] || []).map(id => {
                      const doc = doctores.find(d => d.id === id);
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <span>{doc ? doc.name : id}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            aria-label="Quitar doctor"
                            className="ml-2"
                            onClick={() => {
                              setCentrosConDoctores(prev => ({
                                ...prev,
                                [centro.id_centro]: (prev[centro.id_centro] || []).filter(docId => docId !== id)
                              }));
                              setCheckedDoctors(prev => prev.filter(docId => docId !== id));
                            }}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M10 11v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="#e00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardBody>
            </Card>
            <div className="mt-2 flex gap-2">
              {/* Botón para asignar doctores - visible para administradores y directores */}
              {(currentUser?.role === 'administrador' || currentUser?.role === 'director') && (
                <Button color="primary" fullWidth onClick={() => handleOpenModal(centro)} className="font-semibold flex items-center gap-2 text-base">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#06b6d4" /></svg>
                  Asignar Doctores
                </Button>
              )}
              
              {/* Botones de editar y eliminar - solo visibles para administradores */}
              {currentUser?.role === 'administrador' && (
                <>
                  <Button color="primary" onClick={() => handleEditCentro(centro)}>
                    Editar
                  </Button>
                  <Button color="danger" onClick={() => handleDeleteCentro(centro)}>
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ModalContent>
          <ModalHeader>Asignar Doctores al Centro</ModalHeader>
          <ModalBody>
            <ul className="space-y-2">
              {doctores.length === 0 ? (
                <li className="text-default-400">No hay doctores disponibles.</li>
              ) : (
                doctores.map(doc => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checkedDoctors.includes(doc.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setCheckedDoctors(prev => [...prev, doc.id]);
                        } else {
                          setCheckedDoctors(prev => prev.filter(id => id !== doc.id));
                        }
                      }}
                    />
                    <span>{doc.name} <span className="text-xs text-default-400">({doc.active ? 'Activo' : 'Inactivo'})</span></span>
                  </li>
                ))
              )}
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => {
              if (selectedCentro) {
                setCentrosConDoctores(prev => ({
                  ...prev,
                  [selectedCentro.id_centro]: checkedDoctors
                }));
              }
              setShowModal(false);
            }}>
              Guardar
            </Button>
            <Button variant="light" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="mt-8">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          aria-label="Vacunas y Lotes"
          variant="underlined"
          className="max-w-3xl mx-auto"
        >
          <Tab key="vacunas" title="Vacunas">
            <div className="flex flex-col gap-4">
              {vacunas.length === 0 && <div className="text-default-400 text-center py-10">No hay vacunas registradas.</div>}
              <div className="modern-table-wrapper">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">Vacunas</div>
                  <Button color="primary" size="md" className="btn-primary" onClick={handleAddVacuna}>
                    <span className="btn-icon">+</span>
                    <span>Añadir Vacuna</span>
                  </Button>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Fabricante</th>
                      <th>Tipo</th>
                      <th>Dosis Requeridas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacunas && vacunas.map(vac => (
                      <tr key={vac.id_vacuna}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">💉</span>
                            <span>{vac.nombre_vacuna}</span>
                          </div>
                        </td>
                        <td>{vac.fabricante}</td>
                        <td>
                          <span className="badge">{vac.tipo}</span>
                        </td>
                        <td>
                          <span className="badge badge-info">{vac.dosis_requeridas}</span>
                        </td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar vacuna" placement="top">
                              <Button color="primary" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleEditVacuna(vac)}>
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar vacuna" placement="top">
                              <Button color="danger" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleDeleteVacuna(vac)}>
                                <span className="mr-1">🗑️</span> Eliminar
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab>
          <Tab key="lotes" title="Lotes">
            <div className="flex flex-col gap-4">
              {lotesVacunas.filter(l => centrosDirectorOptions.some(c => c.value === l.id_centro)).length === 0 && (
                <div className="text-default-400 text-center py-10">No hay lotes registrados.</div>
              )}
              <div className="modern-table-wrapper">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">Lotes</div>
                  <Button color="primary" size="md" className="btn-primary" onClick={handleAddLote}>
                    <span className="btn-icon">+</span>
                    <span>Añadir Lote</span>
                  </Button>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Vacuna</th>
                      <th>Número de Lote</th>
                      <th>Centro</th>
                      <th>Dosis</th>
                      <th>Vencimiento</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesVacunas.filter(l => centrosDirectorOptions.some(c => c.value === l.id_centro)).map(lote => (
                      <tr key={lote.id_lote}>
                        <td>{getVacunaNombreById(lote.id_vacuna)}</td>
                        <td>{lote.numero_lote}</td>
                        <td>{getCentroNombreById(lote.id_centro)}</td>
                        <td>{lote.cantidad_dosis}</td>
                        <td>{formatFecha(lote.fecha_vencimiento)}</td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar lote" placement="top">
                              <Button color="primary" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleEditLote(lote)}>
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar lote" placement="top">
                              <Button color="danger" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleDeleteLote(lote)}>
                                <span className="mr-1">🗑️</span> Eliminar
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Asignar Doctores</h3>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-2">
                  <div className="font-semibold">Selecciona los doctores a asignar:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {doctores.length === 0 ? (
                      <p className="text-default-500 col-span-2">No hay doctores disponibles para asignar.</p>
                    ) : (
                      doctores.map(doc => (
                        <label key={doc.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                          <input
                            type="checkbox"
                            checked={checkedDoctors.includes(doc.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setCheckedDoctors(prev => [...prev, doc.id]);
                              } else {
                                setCheckedDoctors(prev => prev.filter(id => id !== doc.id));
                              }
                            }}
                          />
                          <span>{doc.name || doc.username || `Doctor ID: ${doc.id}`}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="flat" onClick={onClose}>Cancelar</Button>
                <Button color="primary" onClick={async () => {
                  const centroId = selectedCentro.id_centro;
                  const prevDoctorIds = centrosConDoctores[centroId] || [];
                  const newDoctorIds = checkedDoctors;
                  const allDoctorIds = Array.from(new Set([...prevDoctorIds, ...newDoctorIds]));
                  allDoctorIds.forEach(docId => {
                    const doc = doctores.find(d => d.id === docId);
                    if (!doc) return;
                    let centros = Array.isArray(doc.centrosAsignados) ? [...doc.centrosAsignados] : [];
                    if (newDoctorIds.includes(docId)) {
                      if (!centros.includes(centroId)) centros.push(centroId);
                    } else {
                      centros = centros.filter(cid => cid !== centroId);
                    }
                    usuariosService.asignarCentrosADoctor(docId, centros);
                  });
                  setCentrosConDoctores(prev => ({
                    ...prev,
                    [centroId]: newDoctorIds
                  }));
                  setShowModal(false);
                }}>
                  Guardar Asignaciones
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={showVacunaModal} onClose={() => setShowVacunaModal(false)} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingVacuna ? 'Editar Vacuna' : 'Añadir Nueva Vacuna'}</h3>
                <p className="text-small text-default-500">
                  {editingVacuna ? 'Modifica la información de la vacuna' : 'Completa la información para crear una nueva vacuna'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleVacunaSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de la Vacuna</label>
                      <input type="text" name="nombre_vacuna" value={vacunaForm.nombre_vacuna} onChange={handleVacunaFormChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Fabricante</label>
                      <input type="text" name="fabricante" value={vacunaForm.fabricante} onChange={handleVacunaFormChange} className="form-control" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tipo de Vacuna</label>
                    <select name="tipo" value={vacunaForm.tipo} onChange={handleVacunaFormChange} className="form-control" required>
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
                      <input type="number" min="1" name="dosis_requeridas" value={vacunaForm.dosis_requeridas} onChange={handleVacunaFormChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Intervalo entre Dosis (días)</label>
                      <input type="number" min="0" name="intervalo_dosis" value={vacunaForm.intervalo_dosis} onChange={handleVacunaFormChange} className="form-control" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Edad Mínima (meses)</label>
                      <input type="number" min="0" name="edad_minima" value={vacunaForm.edad_minima} onChange={handleVacunaFormChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Edad Máxima (meses)</label>
                      <input type="number" min="0" name="edad_maxima" value={vacunaForm.edad_maxima} onChange={handleVacunaFormChange} className="form-control" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={vacunaForm.descripcion} onChange={handleVacunaFormChange} className="form-control" rows="3"></textarea>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" color="default" variant="flat" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" color="primary" className="font-semibold">{editingVacuna ? 'Guardar Cambios' : 'Crear Vacuna'}</Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={showLoteModal} onClose={() => setShowLoteModal(false)} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingLote ? 'Editar Lote' : 'Añadir Nuevo Lote'}</h3>
                <p className="text-small text-default-500">
                  {editingLote ? 'Modifica la información del lote de vacunas' : 'Completa la información para registrar un nuevo lote de vacunas'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleLoteSubmit}>
                  <div className="form-group">
                    <label>Vacuna</label>
                    <select name="id_vacuna" value={loteForm.id_vacuna} onChange={handleLoteFormChange} className="form-control" required>
                      <option value="">Seleccione una vacuna</option>
                      {vacunas && vacunas.map(v => (
                        <option key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número de Lote</label>
                    <input type="text" name="numero_lote" value={loteForm.numero_lote} onChange={handleLoteFormChange} className="form-control" required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Fabricación</label>
                      <input type="date" name="fecha_fabricacion" value={loteForm.fecha_fabricacion} onChange={handleLoteFormChange} className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Fecha de Vencimiento</label>
                      <input type="date" name="fecha_vencimiento" value={loteForm.fecha_vencimiento} onChange={handleLoteFormChange} className="form-control" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad de Dosis</label>
                      <input type="number" min="1" name="cantidad_dosis" value={loteForm.cantidad_dosis} onChange={handleLoteFormChange} className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Temperatura de Almacenamiento</label>
                      <input type="text" name="temperatura_almacenamiento" value={loteForm.temperatura_almacenamiento} onChange={handleLoteFormChange} className="form-control" placeholder="Ej: 2-8°C" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Centro Asignado</label>
                    <select name="id_centro" value={loteForm.id_centro} onChange={handleLoteFormChange} className="form-control" required>
                      <option value="">Seleccione un centro</option>
                      {centrosDirectorOptions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" color="default" variant="flat" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" color="primary" className="font-semibold">{editingLote ? 'Guardar Cambios' : 'Crear Lote'}</Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={showCentroModal} onClose={() => setShowCentroModal(false)} size="2xl" scrollBehavior="inside" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingCentro ? 'Editar Centro' : 'Añadir Nuevo Centro'}</h3>
                <p className="text-small text-default-500">
                  {editingCentro ? 'Modifica la información del centro' : 'Completa la información para crear un nuevo centro'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                {error && (
                  <div className="mb-4 p-4 bg-danger-100 text-danger-700 rounded">
                    {error}
                  </div>
                )}
                <form onSubmit={handleCentroSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Centro</label>
                      <Input
                        name="nombre_centro"
                        value={centroForm.nombre_centro}
                        onChange={handleCentroFormChange}
                        required
                        placeholder="Ej: Centro de Salud Santo Domingo"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nombre Corto</label>
                      <Input
                        name="nombre_corto"
                        value={centroForm.nombre_corto}
                        onChange={handleCentroFormChange}
                        placeholder="Ej: CSSD"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <Input
                      name="direccion"
                      value={centroForm.direccion}
                      onChange={handleCentroFormChange}
                      required
                      placeholder="Ej: Calle 1, Santo Domingo"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitud</label>
                      <Input
                        type="number"
                        name="latitud"
                        value={centroForm.latitud}
                        onChange={handleCentroFormChange}
                        placeholder="Ej: 18.4861"
                        step="any"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitud</label>
                      <Input
                        type="number"
                        name="longitud"
                        value={centroForm.longitud}
                        onChange={handleCentroFormChange}
                        placeholder="Ej: -69.9312"
                        step="any"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <Input
                      name="telefono"
                      value={centroForm.telefono}
                      onChange={handleCentroFormChange}
                      placeholder="Ej: 8098765432"
                    />
                  </div>
                  <div className="form-group">
                    <label>Director</label>
                    <Input
                      name="director"
                      value={centroForm.director}
                      onChange={handleCentroFormChange}
                      placeholder="Ej: Dr. José Gómez"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sitio Web</label>
                    <Input
                      name="sitio_web"
                      value={centroForm.sitio_web}
                      onChange={handleCentroFormChange}
                      placeholder="Ej: http://cssd.gov.do"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" color="default" variant="flat" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" color="primary" className="font-semibold">
                      {editingCentro ? 'Guardar Cambios' : 'Crear Centro'}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default MisCentros;