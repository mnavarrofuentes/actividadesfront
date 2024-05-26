import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Form, Button } from "react-bootstrap";
import Navigation from "./Navbar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Select from "react-select";
import { FaArrowDown, FaArrowUp, FaExclamationCircle } from "react-icons/fa";

interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  orden: number;
  completada: boolean;
  prioridad: number;
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const LugarTrabajo: React.FC = () => {
  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 1:
        return <FaArrowDown style={{ color: "green" }} />;
      case 2:
        return <FaArrowUp style={{ color: "orange" }} />;
      case 3:
        return <FaExclamationCircle style={{ color: "red" }} />;
      default:
        return null;
    }
  };
  const priorityOptions = [
    {
      value: 1,
      label: (
        <>
          <FaArrowDown className="me-2" style={{ color: "green" }} /> Baja
        </>
      ),
    },
    {
      value: 2,
      label: (
        <>
          <FaArrowUp className="me-2" style={{ color: "orange" }} /> Media
        </>
      ),
    },
    {
      value: 3,
      label: (
        <>
          <FaExclamationCircle className="me-2" style={{ color: "red" }} />{" "}
          Crítica
        </>
      ),
    },
  ];
  const navigate = useNavigate();
  const initializedRef = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [newTarea, setNewTarea] = useState<Tarea>({
    id: "",
    nombre: "",
    descripcion: "",
    fechaLimite: formatDate(new Date()),
    orden: 0,
    completada: false,
    prioridad: 1,
  });

  const [tareasBoard, setTareasBoard] = useState<{
    pendientes: Tarea[];
    completadas: Tarea[];
  }>({
    pendientes: [],
    completadas: [],
  });

  useEffect(() => {
    if (!initializedRef.current) {
      const isAuthenticated = !!localStorage.getItem("token");
      if (!isAuthenticated) {
        console.log("no esta autenticado");
        navigate("/login", { replace: true });
      } else {
        console.log("estoy dentro autenticado");
        obtenerTareas(); // Llamada a la función para obtener tareas
      }
      initializedRef.current = true;
    }
  }, [navigate]);

  const onDragEnd = async (result: any) => {
    // Si el elemento es soltado fuera de una lista válida
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // Copiamos las listas de tareas actuales
    const updatedPendientes = [...tareasBoard.pendientes];
    const updatedCompletadas = [...tareasBoard.completadas];

    let movedTask;

    if (result.source.droppableId === "pendientes") {
      // Si la tarea se mueve desde "pendientes" a "completadas"
      if (result.destination.droppableId === "completadas") {
        [movedTask] = updatedPendientes.splice(startIndex, 1);
        if (movedTask) movedTask.completada = true; // Cambiamos el estado a completada
        updatedCompletadas.splice(endIndex, 0, movedTask);
      } else {
        // Si la tarea se mueve dentro de "pendientes"
        [movedTask] = updatedPendientes.splice(startIndex, 1);
        updatedPendientes.splice(endIndex, 0, movedTask);
      }
    } else if (result.source.droppableId === "completadas") {
      // Si la tarea se mueve desde "completadas" a "pendientes"
      if (result.destination.droppableId === "pendientes") {
        [movedTask] = updatedCompletadas.splice(startIndex, 1);
        if (movedTask) movedTask.completada = false; // Cambiamos el estado a no completada
        updatedPendientes.splice(endIndex, 0, movedTask);
      } else {
        // Si la tarea se mueve dentro de "completadas"
        [movedTask] = updatedCompletadas.splice(startIndex, 1);
        updatedCompletadas.splice(endIndex, 0, movedTask);
      }
    }

    // Si no se movió ninguna tarea, terminamos la función
    if (!movedTask) {
      return;
    }

    // Actualizamos el estado de tareas
    setTareasBoard({
      pendientes: updatedPendientes,
      completadas: updatedCompletadas,
    });

    // Enviamos la actualización al servidor
    try {
      await fetch(`https://localhost:32768/api/tareas/${movedTask.id}`, {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orden: endIndex,
          prioridad: movedTask.prioridad, // Asegúrate de que esta propiedad exista en la tarea
          completada: movedTask.completada,
        }),
      });
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  const obtenerTareas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token no encontrado");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const creadorId = decodedToken.userId;

      const response = await fetch(
        `https://localhost:32768/api/tareas/creador/${creadorId}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener las tareas");
      }
      const data = await response.json();
      const tareasPendientes = data.filter((tarea: Tarea) => !tarea.completada);
      const tareasCompletadas = data.filter((tarea: Tarea) => tarea.completada);
      setTareasBoard({
        pendientes: tareasPendientes,
        completadas: tareasCompletadas,
      });
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTarea({ ...newTarea, [name]: value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = formatDate(date);
      setNewTarea({ ...newTarea, fechaLimite: formattedDate });
    }
  };

  const handlePriorityChange = (selectedOption: any) => {
    console.log("Selected priority:", selectedOption.value); // Verifica que se está seleccionando la prioridad correcta
    setNewTarea({ ...newTarea, prioridad: selectedOption.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token no encontrado");
      return;
    }

    const decodedToken: any = jwtDecode(token);
    const creadorId = decodedToken.userId; // ajusta esto según la estructura de tu token

    // Determinar el orden más alta y sumarle 1
    const maxOrden = Math.max(
      ...tareasBoard.pendientes.map((tarea) => tarea.orden),
      0
    );
    const nuevaOrden = maxOrden + 1;

    const tareaConDatos = {
      ...newTarea,
      orden: nuevaOrden,
      completada: false,
      creadorId: creadorId,
    };

    console.log("mirmeos;");
    console.log(tareaConDatos);

    try {
      const response = await fetch("https://localhost:32768/api/tareas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tareaConDatos),
      });

      if (response.ok) {
        const nuevaTarea = await response.json();
        setTareasBoard({
          pendientes: [nuevaTarea, ...tareasBoard.pendientes],
          completadas: tareasBoard.completadas,
        });
        setNewTarea({
          id: "",
          nombre: "",
          descripcion: "",
          fechaLimite: formatDate(new Date()),
          orden: 0,
          completada: false,
          prioridad: 1,
        });
        handleCloseModal();
        toast.success("Tarea creada exitosamente");
      } else {
        console.error("Error al crear la tarea");
      }
    } catch (error) {
      console.error("Error al conectar con la API", error);
    }
  };

  return (
    <div>
      <Navigation onShowModal={handleShowModal} />
      <Container style={{ marginTop: "4rem" }}>
        <h1>Bienvenido al Lugar de Trabajo</h1>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Crear Nueva Tarea</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={newTarea.nombre}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formDescripcion" className="mt-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={newTarea.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formFechaLimite" className="mt-3">
                <Form.Label>Fecha Límite</Form.Label>
                <DatePicker
                  selected={parseDate(newTarea.fechaLimite)}
                  onChange={handleDateChange}
                  dateFormat="dd-MM-yyyy"
                  className="form-control"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPrioridad" className="mt-3">
                <Form.Label>Prioridad</Form.Label>
                <Select
                  options={priorityOptions}
                  value={priorityOptions.find(
                    (option) => option.value === newTarea.prioridad
                  )}
                  onChange={handlePriorityChange}
                  isClearable={false}
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-4">
                Crear Tarea
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: "flex" }}>
            <div
              style={{
                marginRight: "2rem",
                backgroundColor: "lightgray",
                borderRadius: "10px",
                padding: "20px",
                width: "50%",
              }}
            >
              <h3>Tareas Pendientes</h3>
              <Droppable droppableId="pendientes">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tareasBoard.pendientes.map((tarea, index) => (
                      <Draggable
                        key={tarea.id}
                        draggableId={tarea.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="card mb-3">
                              <div className="card-body">
                                <h5 className="card-title">
                                  {tarea.nombre}{" "}
                                  {getPriorityIcon(tarea.prioridad)}
                                </h5>
                                <p className="card-text">{tarea.descripcion}</p>
                                <p className="card-text">
                                  <small className="text-muted">
                                    Fecha Límite: {tarea.fechaLimite}
                                  </small>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div
              style={{
                backgroundColor: "lightgray",
                borderRadius: "10px",
                padding: "20px",
                width: "50%",
              }}
            >
              <h3>Tareas Completadas</h3>
              <Droppable droppableId="completadas">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tareasBoard.completadas.map((tarea, index) => (
                      <Draggable
                        key={tarea.id}
                        draggableId={tarea.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div className="card mb-3">
                              <div className="card-body">
                                <h5 className="card-title">
                                  {tarea.nombre}{" "}
                                  {getPriorityIcon(tarea.prioridad)}
                                </h5>
                                <p className="card-text">{tarea.descripcion}</p>
                                <p className="card-text">
                                  <small className="text-muted">
                                    Fecha Límite: {tarea.fechaLimite}
                                  </small>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </Container>
    </div>
  );
};

export default LugarTrabajo;
