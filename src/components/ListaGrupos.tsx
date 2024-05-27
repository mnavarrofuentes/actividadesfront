import React, { useEffect, useState } from "react";
import { ListGroup, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Equipo {
  id: number;
  nombre: string;
}

const ListaGrupos: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Token no encontrado");
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const usuarioId = decodedToken.userId;

        const response = await fetch(
          `https://localhost:32768/api/equipos/usuario/${usuarioId}/equipos`
        );

        if (!response.ok) {
          throw new Error("Error al obtener los equipos");
        }

        const data = await response.json();
        setEquipos(data);
      } catch (error) {
        console.error("Error al obtener los equipos:", error);
      }
    };

    obtenerEquipos();
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        width: "100%",
        paddingTop: "100px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <h3>Area de trabajo</h3>
      <Container fluid style={{ padding: 0 }}>
        <ListGroup>
          <ListGroup.Item action onClick={() => navigate("/mis-tareas")}>
            Mis Tareas
          </ListGroup.Item>
          {equipos.map((equipo) => (
            <ListGroup.Item
              key={equipo.id}
              action
              onClick={() => navigate(`/equipos/${equipo.id}`)}
            >
              {equipo.nombre}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    </div>
  );
};

export default ListaGrupos;
