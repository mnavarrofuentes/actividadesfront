import React from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/">Mi Aplicación</Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link href="/lugar-trabajo">Lugar de Trabajo</Nav.Link>
      </Nav>
      {usuario?.nombre && (
        <Navbar.Text className="mr-3">Hola, {usuario.nombre}</Navbar.Text>
      )}
      <Button variant="outline-light" onClick={handleLogout}>
        Cerrar Sesión
      </Button>
    </Navbar>
  );
};

export default Navigation;
