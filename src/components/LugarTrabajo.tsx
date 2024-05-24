import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import Navigation from "./Navbar";
import { useNavigate } from "react-router-dom";

const LugarTrabajo: React.FC = () => {
  const navigate = useNavigate();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      // Verificar si el usuario está autenticado
      const isAuthenticated = !!localStorage.getItem("token");
      // Si no está autenticado, redirigir a la página de inicio de sesión
      if (!isAuthenticated) {
        console.log("no esta autenticado");
        navigate("/login", { replace: true }); // Replace para evitar que el usuario regrese a esta página utilizando el botón atrás del navegador
      } else {
        console.log("estoy dentro autenticado");
      }
      initializedRef.current = true;
    }
  }, [navigate]);

  return (
    <Container>
      <Navigation />
      <h1>Bienvenido al Lugar de Trabajo</h1>
      {/* Contenido del lugar de trabajo */}
    </Container>
  );
};

export default LugarTrabajo;
