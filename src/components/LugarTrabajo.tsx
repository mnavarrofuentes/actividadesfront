import React, { useState, useEffect, useRef } from "react";
import { Container, Modal, Form, Button, ListGroup } from "react-bootstrap";
import Navigation from "./Navbar";
import { useNavigate } from "react-router-dom";

interface Tarea {
  nombre: string;
  descripcion: string;
  fechaLimite: string;
}

const LugarTrabajo: React.FC = () => {
  const navigate = useNavigate();
  const initializedRef = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [newTarea, setNewTarea] = useState<Tarea>({
    nombre: "",
    descripcion: "",
    fechaLimite: "",
  });

  useEffect(() => {
    if (!initializedRef.current) {
      const isAuthenticated = !!localStorage.getItem("token");
      if (!isAuthenticated) {
        console.log("no esta autenticado");
        navigate("/login", { replace: true });
      } else {
        console.log("estoy dentro autenticado");
      }
      initializedRef.current = true;
    }
  }, [navigate]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTarea({ ...newTarea, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTareas([...tareas, newTarea]);
    setNewTarea({ nombre: "", descripcion: "", fechaLimite: "" });
    handleCloseModal();
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
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formDescripcion" className="mt-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={newTarea.descripcion}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formFechaLimite" className="mt-3">
                <Form.Label>Fecha Límite</Form.Label>
                <Form.Control
                  type="date"
                  name="fechaLimite"
                  value={newTarea.fechaLimite}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mt-4">
                Crear Tarea
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <ListGroup className="mt-4">
          {tareas.map((tarea, index) => (
            <ListGroup.Item key={index}>
              <h5>{tarea.nombre}</h5>
              <p>{tarea.descripcion}</p>
              <small>Fecha Límite: {tarea.fechaLimite}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </div>
  );
};

export default LugarTrabajo;
