import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Form, Button } from "react-bootstrap";
import Navigation from "./Navbar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  prioridad: number;
  completada: boolean;
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
  const navigate = useNavigate();
  const initializedRef = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [newTarea, setNewTarea] = useState<Tarea>({
    id: "",
    nombre: "",
    descripcion: "",
    fechaLimite: formatDate(new Date()),
    prioridad: 0,
    completada: false,
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

  const onDragEnd = (result: any) => {
    // Si el elemento es soltado fuera de una lista válida
    if (!result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    // Copiamos las listas de tareas actuales
    const updatedPendientes = [...tareasBoard.pendientes];
    const updatedCompletadas = [...tareasBoard.completadas];

    if (result.source.droppableId === "pendientes") {
      // Si la tarea se mueve desde "pendientes" a "completadas"
      if (result.destination.droppableId === "completadas") {
        const [movedTask] = updatedPendientes.splice(startIndex, 1);
        movedTask.completada = true; // Cambiamos el estado a completada
        updatedCompletadas.splice(endIndex, 0, movedTask);
      } else {
        // Si la tarea se mueve dentro de "pendientes"
        const [movedTask] = updatedPendientes.splice(startIndex, 1);
        updatedPendientes.splice(endIndex, 0, movedTask);
      }
    } else if (result.source.droppableId === "completadas") {
      // Si la tarea se mueve desde "completadas" a "pendientes"
      if (result.destination.droppableId === "pendientes") {
        const [movedTask] = updatedCompletadas.splice(startIndex, 1);
        movedTask.completada = false; // Cambiamos el estado a no completada
        updatedPendientes.splice(endIndex, 0, movedTask);
      } else {
        // Si la tarea se mueve dentro de "completadas"
        const [movedTask] = updatedCompletadas.splice(startIndex, 1);
        updatedCompletadas.splice(endIndex, 0, movedTask);
      }
    }

    // Actualizamos el estado con las listas actualizadas
    setTareasBoard({
      pendientes: updatedPendientes,
      completadas: updatedCompletadas,
    });
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
        `https://localhost:32770/api/tareas/creador/${creadorId}`
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token no encontrado");
      return;
    }

    const decodedToken: any = jwtDecode(token);
    const creadorId = decodedToken.userId; // ajusta esto según la estructura de tu token

    // Determinar la prioridad más alta y sumarle 1
    const maxPrioridad = Math.max(
      ...tareasBoard.pendientes.map((tarea) => tarea.prioridad),
      0
    );
    const nuevaPrioridad = maxPrioridad + 1;

    const tareaConDatos = {
      ...newTarea,
      prioridad: nuevaPrioridad,
      completada: false,
      creadorId: creadorId,
    };

    try {
      const response = await fetch("https://localhost:32770/api/tareas", {
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
          prioridad: 0,
          completada: false,
        });
        handleCloseModal();
        toast.success("Usuario creado exitosamente");
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
                                <h5 className="card-title">{tarea.nombre}</h5>
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
                                <h5 className="card-title">{tarea.nombre}</h5>
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
