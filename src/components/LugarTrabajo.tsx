import React from "react";
import { Container } from "react-bootstrap";
import Navigation from "./Navbar";

const LugarTrabajo: React.FC = () => {
  return (
    <Container>
      <Navigation />
      <h1>Bienvenido al Lugar de Trabajo</h1>
      {/* Contenido del lugar de trabajo */}
    </Container>
  );
};

export default LugarTrabajo;
