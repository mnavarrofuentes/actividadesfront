import React from "react";
import { ListGroup, Container } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import { Tarea } from "./Tareas";
import { Equipo } from "./Equipo";

interface ListaGruposProps {
  equipos: Equipo[];
  onEquipoClick: (tareas: Tarea[]) => void;
  equipoSeleccionado: number | null;
  setEquipoSeleccionado: (equipoId: number | null) => void; // Nueva prop para actualizar el estado
}

const ListaGrupos: React.FC<ListaGruposProps> = ({
  equipos,
  onEquipoClick,
  equipoSeleccionado,
  setEquipoSeleccionado, // Nueva prop para actualizar el estado
}) => {
  const handleEquipoClick = async (equipoId: number) => {
    try {
      setEquipoSeleccionado(equipoId); // Actualizar el estado con el ID del equipo seleccionado

      if (equipoId === 0) {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Token no encontrado");
          return;
        }

        const decodedToken: any = jwtDecode(token);
        const usuarioId = decodedToken.userId;
        const response = await fetch(
          `https://localhost:32768/api/tareas/creador/${usuarioId}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener las tareas");
        }
        const data = await response.json();
        onEquipoClick(data);
      } else {
        const response = await fetch(
          `https://localhost:32768/api/Equipos/${equipoId}/tareas`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener las tareas del equipo");
        }

        const data = await response.json();
        onEquipoClick(data);
      }
    } catch (error) {
      console.error("Error al obtener las tareas del equipo:", error);
    }
  };

  return (
    <Container fluid style={{ paddingTop: 100 }}>
      <h2>Area de trabajo</h2>
      <ListGroup>
        <ListGroup.Item
          action
          active={!equipoSeleccionado}
          onClick={() => handleEquipoClick(0)}
        >
          Mis Tareas(individual)
        </ListGroup.Item>
        {equipos.map((equipo) => (
          <ListGroup.Item
            key={equipo.id}
            action
            active={equipoSeleccionado === equipo.id}
            onClick={() => handleEquipoClick(equipo.id)}
          >
            {equipo.nombre}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default ListaGrupos;
