import React, { useState } from "react";
import { Navbar, Button, Container, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface NavigationProps {
  onShowModal: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onShowModal }) => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [equipoNombre, setEquipoNombre] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleShowEquipoModal = () => setShowEquipoModal(true);
  const handleCloseEquipoModal = () => setShowEquipoModal(false);

  const handleCrearEquipo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token no encontrado");
      return;
    }

    const decodedToken: any = jwtDecode(token);
    const usuarioId = decodedToken.userId;

    try {
      const response = await fetch("https://localhost:32768/api/Equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: equipoNombre, usuarioId }),
      });

      if (response.ok) {
        setEquipoNombre("");
        handleCloseEquipoModal();
        toast.success("Equipo creado exitosamente");
      } else {
        console.error("Error al crear el equipo");
      }
    } catch (error) {
      console.error("Error al conectar con la API", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/lugar-trabajo">Actividades</Navbar.Brand>
        <Navbar.Toggle />
        <Button variant="outline-light" onClick={onShowModal} className="mr-3">
          Crear Tarea
        </Button>
        <Button
          variant="outline-light"
          onClick={handleShowEquipoModal}
          className="mr-3"
        >
          Crear Equipo
        </Button>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="me-2">Hola, {usuario}</Navbar.Text>
          <Navbar.Text className="mr-3">
            <Button variant="outline-light" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
      <Modal show={showEquipoModal} onHide={handleCloseEquipoModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearEquipo}>
            <Form.Group controlId="formEquipoNombre">
              <Form.Label>Nombre del Equipo</Form.Label>
              <Form.Control
                type="text"
                value={equipoNombre}
                onChange={(e) => setEquipoNombre(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-4">
              Crear Equipo
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default Navigation;
