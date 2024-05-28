import React from "react";
import { Navbar, Button, Container } from "react-bootstrap";

interface NavigationProps {
  onShowModal: () => void;
  onLogout: () => void;
  usuario: string;
  onCrearEquipo: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  onShowModal,
  onLogout,
  usuario,
  onCrearEquipo,
}) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/lugar-trabajo">Actividades</Navbar.Brand>
        <Navbar.Toggle />
        <div className="me-2">
          <Button
            variant="outline-light"
            onClick={onShowModal}
            className="me-2"
          >
            Crear Tarea
          </Button>
          <Button
            variant="outline-light"
            onClick={onCrearEquipo}
            className="me-2"
          >
            Crear Equipo
          </Button>
        </div>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text className="me-2">Hola, {usuario}</Navbar.Text>
          <Navbar.Text>
            <Button variant="outline-light" onClick={onLogout}>
              Cerrar Sesión
            </Button>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
