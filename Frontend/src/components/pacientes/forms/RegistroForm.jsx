import React, { useState, useEffect } from "react";
import NinoForm from "./NinoForm";
import PadreForm from "./PadreForm";
import { Button, Divider, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import apiService from "../../../services/apiService";

export default function RegistroForm({
  onClose,
  onNinoAdd,
  onTutorAdd,
  ninoToEdit,
  onUpdateNino,
  onUpdateTutor,
  tutores,
  centros,
}) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!ninoToEdit;
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    identificacion: "",
    fecha_nacimiento: "",
    genero: "",
    direccion_residencia: "",
    nacionalidad: "",
    pais_nacimiento: "",
    id_centro_salud: "",
    contacto_principal: "",
    id_salud_nacional: "",
  });
  const [padreData, setPadreData] = useState({
    nombre_completo: "",
    identificacion: "",
    telefono: "",
    correo_electronico: "",
    direccion: "",
    relacion: "",
  });
  const [tutorExistente, setTutorExistente] = useState("");
  const [usarTutorExistente, setUsarTutorExistente] = useState(false);
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [tutoresFiltrados, setTutoresFiltrados] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const todosTutores = [...tutores];
    const filtrados =
      busquedaCedula.trim() === ""
        ? todosTutores
        : todosTutores.filter((tutor) =>
            (tutor.identificacion || "").toLowerCase().includes(busquedaCedula.toLowerCase())
          );
    setTutoresFiltrados(filtrados);
  }, [busquedaCedula, tutores, isEditMode]);

  useEffect(() => {
    if (isEditMode && ninoToEdit) {
      setFormData({
        nombre_completo: ninoToEdit.nombre_completo || "",
        identificacion: ninoToEdit.identificacion || "",
        fecha_nacimiento: ninoToEdit.fecha_nacimiento || "",
        genero: ninoToEdit.genero || "",
        direccion_residencia: ninoToEdit.direccion_residencia || "",
        nacionalidad: ninoToEdit.nacionalidad || "",
        pais_nacimiento: ninoToEdit.pais_nacimiento || "",
        id_centro_salud: ninoToEdit.id_centro_salud || "",
        contacto_principal: ninoToEdit.contacto_principal || "",
        id_salud_nacional: ninoToEdit.id_salud_nacional || "",
      });

      if (ninoToEdit.id_tutor) {
        setUsarTutorExistente(true);
        setTutorExistente(ninoToEdit.id_tutor);
      }
    }
  }, [isEditMode, ninoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePadreChange = (e) => {
    const { name, value } = e.target;
    setPadreData({
      ...padreData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (paso === 1) {
      setPaso(2);
    } else {
      try {
        if (isEditMode) {
          let tutorIdToUse = ninoToEdit.id_tutor;
          if (usarTutorExistente) {
            tutorIdToUse = tutorExistente;
            const tutorYaExiste = tutores.some((t) => t.id_tutor === tutorExistente);
            if (!tutorYaExiste) {
              // No necesitamos crear un nuevo tutor aquí, solo actualizar
            }
          }
          const updatedNino = {
            ...ninoToEdit,
            ...formData,
            id_tutor: tutorIdToUse,
            fecha_actualizacion: new Date().toISOString(),
          };
          onUpdateNino(updatedNino);
        } else {
          let tutorId;
          if (usarTutorExistente) {
            tutorId = tutorExistente;
          } else {
            const newTutor = {
              id_niño: null, // Se asignará después de crear el niño
              nombre: padreData.nombre_completo,
              identificacion: padreData.identificacion,
              relacion: padreData.relacion,
              telefono: padreData.telefono,
              email: padreData.correo_electronico,
              direccion: padreData.direccion,
              nacionalidad: formData.nacionalidad, // Usar nacionalidad del niño por ahora
            };
            const response = await apiService.post("/api/guardians", newTutor);
            tutorId = response.id_tutor;
            onTutorAdd({ ...newTutor, id_tutor: tutorId });
          }

          const newNino = {
            ...formData,
            id_niño: `temp-${Math.random()}`,
            id_tutor: tutorId,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
            activo: true,
          };
          onNinoAdd(newNino);
        }

        onClose();
      } catch (err) {
        setError("Error al procesar el registro. Intenta nuevamente.");
        console.error("Error en handleSubmit:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setPaso(1);
  };

  return (
    <div>
      <Tabs
        selectedKey={paso.toString()}
        onSelectionChange={(key) => setPaso(parseInt(key))}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        <Tab
          key="1"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">1</span>
              <span>Información del Paciente</span>
            </div>
          }
        />
        <Tab
          key="2"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">2</span>
              <span>Información del Tutor</span>
            </div>
          }
          isDisabled={paso < 2}
        />
      </Tabs>
      <form onSubmit={handleSubmit} className="space-y-6">
        {paso === 1 ? (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">
              {isEditMode ? "Editar Información del Paciente" : "Información del Paciente"}
            </h4>
            <NinoForm formData={formData} handleChange={handleChange} centros={centros} />
          </div>
        ) : (
          <div>
            <h4 className="text-xl font-semibold">Información del Tutor</h4>
            <Card shadow="sm">
              <CardBody className="space-y-4">
                <Button
                  color={usarTutorExistente ? "primary" : "default"}
                  variant="bordered"
                  onClick={() => setUsarTutorExistente((v) => !v)}
                  className="mb-2"
                >
                  El responsable existe
                </Button>
                {usarTutorExistente ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Ingrese la cédula del responsable"
                      className="input input-bordered w-full mb-2"
                      value={busquedaCedula || ""}
                      onChange={(e) => setBusquedaCedula(e.target.value)}
                    />
                    {busquedaCedula.trim() !== "" ? (
                      <div className="space-y-2">
                        {tutoresFiltrados
                          .filter((t) =>
                            (t.identificacion || "").toLowerCase().includes(busquedaCedula.toLowerCase())
                          )
                          .map((usuarioResponsable, idx) => {
                            const yaEsTutor = tutores.some((t) => t.id_tutor === usuarioResponsable.id_tutor);
                            return (
                              <Card
                                shadow={tutorExistente === usuarioResponsable.id_tutor ? "md" : "xs"}
                                className={`mb-2 cursor-pointer ${
                                  tutorExistente === usuarioResponsable.id_tutor
                                    ? "border-2 border-success-500"
                                    : ""
                                }`}
                                key={usuarioResponsable.id_tutor + "_" + idx}
                                onClick={() => setTutorExistente(usuarioResponsable.id_tutor)}
                              >
                                <CardBody>
                                  <div className="mb-2 font-semibold">Responsable encontrado:</div>
                                  <div>
                                    <b>Nombre:</b> {usuarioResponsable.nombre} {usuarioResponsable.apellido}
                                  </div>
                                  <div>
                                    <b>Cédula:</b> {usuarioResponsable.identificacion}
                                  </div>
                                  {tutorExistente === usuarioResponsable.id_tutor && (
                                    <div className="text-success-600 font-bold mt-1">
                                      Seleccionado
                                    </div>
                                  )}
                                  <Button
                                    type="button"
                                    size="sm"
                                    color={
                                      tutorExistente === usuarioResponsable.id_tutor ? "success" : "primary"
                                    }
                                    variant={yaEsTutor ? "flat" : "solid"}
                                    className="ml-2 mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTutorExistente(usuarioResponsable.id_tutor);
                                      if (!yaEsTutor) {
                                        onTutorAdd({
                                          id_tutor: usuarioResponsable.id_tutor,
                                          nombre: usuarioResponsable.nombre,
                                          apellido: usuarioResponsable.apellido,
                                          identificacion: usuarioResponsable.identificacion,
                                          telefono: usuarioResponsable.telefono || "",
                                          direccion: usuarioResponsable.direccion || "",
                                          correo: usuarioResponsable.correo || "",
                                        });
                                      }
                                    }}
                                  >
                                    {yaEsTutor
                                      ? tutorExistente === usuarioResponsable.id_tutor
                                        ? "Seleccionado"
                                        : "Seleccionar"
                                      : "Seleccionar y agregar"}
                                  </Button>
                                </CardBody>
                              </Card>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-danger-500">
                        No se encontró un responsable con esa cédula.
                      </div>
                    )}
                  </div>
                ) : (
                  <PadreForm formData={padreData} handleChange={handlePadreChange} />
                )}
              </CardBody>
            </Card>
          </div>
        )}
        <Divider />
        <div className="flex justify-between">
          {paso === 2 && (
            <Button variant="flat" color="default" onClick={handleBack}>
              Atrás
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="flat" color="danger" onClick={onClose}>
              Cancelar
            </Button>
            {paso === 1 ? (
              <Button
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  setPaso(2);
                }}
                isDisabled={loading}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                color="primary"
                isDisabled={loading || (usarTutorExistente && !tutorExistente)}
              >
                {isEditMode ? "Guardar Cambios" : "Registrar"}
              </Button>
            )}
          </div>
        </div>
        {error && <div className="text-danger-500 mt-2">{error}</div>}
      </form>
    </div>
  );
}