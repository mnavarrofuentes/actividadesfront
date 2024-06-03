import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Modal,
  Form,
  Button,
  ListGroup,
  InputGroup,
} from "react-bootstrap";
import Navigation from "./Navbar";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Select from "react-select";
import { FaArrowDown, FaArrowUp, FaExclamationCircle } from "react-icons/fa";
import ListaGrupos from "./ListaGrupos";
import { Tarea } from "./Tareas";
import { Equipo } from "./Equipo";
import { Usuario } from "./Usuario";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
  const [usuarioLog, setUsuarioLog] = useState("");
  const [grafica, setGrafica] = useState<any>(null);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState<null | number>(null);
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const handleCloseReportModal = () => setShowReportModal(false);

  const getPriorityIcon = (priority: number | undefined) => {
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
  const [showModalData, setShowModalData] = useState(false);
  const [newTarea, setNewTarea] = useState<Tarea>({
    id: "",
    nombre: "",
    descripcion: "",
    fechaLimite: formatDate(new Date()),
    orden: 0,
    completada: false,
    prioridad: 1,
    grupoId: 0,
    responsableId: 0,
    asignado: "",
  });
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [showAsingTeamModal, setShowAsingTeamModal] = useState(false);
  const [equipoNombre, setEquipoNombre] = useState("");

  const handleShowEquipoModal = () => setShowEquipoModal(true);
  const handleCloseEquipoModal = () => setShowEquipoModal(false);

  const handleCloseAsingTeamModal = () => setShowAsingTeamModal(false);
  const [selectedUsuarioResId, setSelectedUsuarioResId] = useState("");

  const handleOpenModalAsing = () => {
    obtenerUsuariosNoEnEquipo(); // Llamar a obtenerUsuariosNoEnEquipo justo antes de abrir el modal
    setShowAsingTeamModal(true);
  };

  useEffect(() => {
    if (selectedUsuarioResId !== "") {
      console.log("usuario:" + selectedUsuarioResId);
      // Aquí puedes agregar cualquier lógica adicional que dependa de selectedUsuarioResId
    }
  }, [selectedUsuarioResId]);

  const handleOpenModalTarea = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token no encontrado");
      return;
    }
    const decodedToken: any = jwtDecode(token);
    const usuarioId = decodedToken.userId;
    console.log("usuarioantes:" + usuarioId);
    setSelectedUsuarioResId(usuarioId);
    if (equipoSeleccionado === 0) {
      setUsuarios([]);
    } else {
      try {
        const response = await fetch(
          `https://localhost:32768/api/Equipos/${equipoSeleccionado}/usuarios`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Error al obtener los usuarios del equipo");
        }

        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    }
    setShowModal(true);
  };

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | null>(
    0
  );
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [tareasBoard, setTareasBoard] = useState<{
    pendientes: Tarea[];
    completadas: Tarea[];
  }>({
    pendientes: [],
    completadas: [],
  });

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
        `https://localhost:32768/api/equipos/usuario/${usuarioId}/equipos`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
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

  useEffect(() => {
    if (!initializedRef.current) {
      const isAuthenticated = !!localStorage.getItem("token");
      if (!isAuthenticated) {
        console.log("no esta autenticado");
        navigate("/login", { replace: true });
      } else {
        console.log("estoy dentro autenticado");
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Token no encontrado");
          return;
        }
        const decodedToken: any = jwtDecode(token);
        const usuarioId = decodedToken.userId;
        console.log("log:" + decodedToken.userId);
        setUsuarioLog(usuarioId);
        obtenerTareas(); // Llamada a la función para obtener tareas
        obtenerEquipos();
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

  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);

  const obtenerTareas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token no encontrado");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const creadorId = decodedToken.userId;

      let url = "";
      if (equipoSeleccionado) {
        url = `https://localhost:32768/api/Equipos/${equipoSeleccionado}/tareas`;
      } else {
        url = `https://localhost:32768/api/tareas/creador/${creadorId}`;
      }

      const response = await fetch(
        url,
        equipoSeleccionado
          ? {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          : undefined
      );
      if (!response.ok) {
        throw new Error("Error al obtener las tareas");
      }
      const data = await response.json();

      // Aplicar los filtros en el frontend
      const tareasFiltradas = data.filter((tarea: Tarea) => {
        let cumpleFiltro = true;
        if (filtroNombre !== "" && !tarea.nombre.includes(filtroNombre)) {
          cumpleFiltro = false;
        }
        if (filtroPrioridad !== null && tarea.prioridad !== filtroPrioridad) {
          cumpleFiltro = false;
        }
        if (
          filtroResponsable !== "" &&
          !tarea.asignado.includes(filtroResponsable)
        ) {
          cumpleFiltro = false;
        }
        return cumpleFiltro;
      });

      const tareasPendientes = tareasFiltradas.filter(
        (tarea: Tarea) => !tarea.completada
      );
      const tareasCompletadas = tareasFiltradas.filter(
        (tarea: Tarea) => tarea.completada
      );
      setTareasBoard({
        pendientes: tareasPendientes,
        completadas: tareasCompletadas,
      });
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
    }
  };

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
      grupoId: equipoSeleccionado,
      responsableId:
        newTarea.responsableId === 0 ? usuarioLog : newTarea.responsableId,
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
        /*const nuevaTarea = await response.json();
        setTareasBoard({
          pendientes: [nuevaTarea, ...tareasBoard.pendientes],
          completadas: tareasBoard.completadas,
        });*/
        console.log("antes:" + equipoSeleccionado);
        handleEquipoClick(equipoSeleccionado ?? 0);
        setNewTarea({
          id: "",
          nombre: "",
          descripcion: "",
          fechaLimite: formatDate(new Date()),
          orden: 0,
          completada: false,
          prioridad: 1,
          grupoId: equipoSeleccionado,
          responsableId: 0,
          asignado: "",
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

  const handleTareasActualizadas = (nuevasTareas: Tarea[]) => {
    setFiltroNombre("");
    setFiltroPrioridad(null);
    setFiltroResponsable("");
    setTareasBoard({
      pendientes: nuevasTareas.filter((tarea) => !tarea.completada),
      completadas: nuevasTareas.filter((tarea) => tarea.completada),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

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
        obtenerEquipos();
      } else {
        console.error("Error al crear el equipo");
      }
    } catch (error) {
      console.error("Error al conectar con la API", error);
    }
  };

  const [usuariosNoEnEquipo, setUsuariosNoEnEquipo] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("");

  const obtenerUsuariosNoEnEquipo = async () => {
    try {
      const response = await fetch(
        `https://localhost:32768/api/Equipos/${equipoSeleccionado}/usuariosno`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los usuarios fuera del equipo.");
      }
      const data = await response.json();
      setUsuariosNoEnEquipo(data);
    } catch (error) {
      console.error("Error al obtener usuarios fuera del equipo:", error);
    }
  };

  const handleSelectUsuario = (e: any) => {
    setSelectedUsuarioId(e.target.value);
  };

  const handleSelectUsuarioRes = (selectedOption: any) => {
    console.log("Selected priority:", selectedOption.value);
    setNewTarea({ ...newTarea, responsableId: selectedOption.value });
  };

  const handleAsignarMiembro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://localhost:32768/api/Equipos/${equipoSeleccionado}/asignarmiembro`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuarioId: selectedUsuarioId }),
        }
      );

      if (response.ok) {
        setEquipoNombre("");
        handleCloseAsingTeamModal();
        toast.success("asignacion exitosamente");
        obtenerEquipos();
      } else {
        console.error("Error al crear el equipo");
      }
    } catch (error) {
      console.error("Error al conectar con la API", error);
    }
  };

  const handleEquipoClick = async (equipoId: number) => {
    try {
      console.log("equipo:" + equipoId);
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
        setTareasBoard({
          pendientes: data.filter((tarea: Tarea) => !tarea.completada),
          completadas: data.filter((tarea: Tarea) => tarea.completada),
        });
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
        setTareasBoard({
          pendientes: data.filter((tarea: Tarea) => !tarea.completada),
          completadas: data.filter((tarea: Tarea) => tarea.completada),
        });
      }
    } catch (error) {
      console.error("Error al obtener las tareas del equipo:", error);
    }
  };

  const obtenerComentarios = async (tareaId: any) => {
    try {
      const response = await fetch(
        `https://localhost:32768/api/tareas/${tareaId}/comentarios`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los comentarios");
      }
      const data = await response.json();
      setComentarios(data);
    } catch (error) {
      console.error("Error al obtener los comentarios:", error);
    }
  };

  const agregarComentario = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Token no encontrado");
        return;
      }
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.userId;
      const nuevoComentario = {
        tareaId: selectedTarea?.id,
        contenido: comentario,
        usuarioId: userId,
      };
      const response = await fetch(`https://localhost:32768/api/comentario`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoComentario),
      });
      if (!response.ok) {
        throw new Error("Error al agregar el comentario");
      }
      setComentario("");
      obtenerComentarios(selectedTarea?.id);
      toast.success("Comentario creado exitosamente");
    } catch (error) {
      console.error("Error al agregar el comentario:", error);
    }
  };

  const handleShowTareaModal = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    obtenerComentarios(tarea.id);
    setShowModalData(true);
  };

  // Nueva función para crear los datos del gráfico de barras por prioridad
  const createPriorityBarData = (tareas: any) => {
    console.log(tareas);
    const prioridadLabels = ["Baja", "Media", "Alta"];
    const prioridadCounts = [0, 0, 0];
    const prioridadCompletadas = [0, 0, 0];

    tareas.forEach((tarea: any) => {
      if (tarea.completada) {
        console.log("entre");
        prioridadCompletadas[tarea.prioridad - 1]++;
      } else {
        prioridadCounts[tarea.prioridad - 1]++;
      }
    });

    return {
      labels: prioridadLabels,
      datasets: [
        {
          label: "Pendientes",
          data: prioridadCounts,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Completadas",
          data: prioridadCompletadas,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const createAsignadoBarData = (tareas: Tarea[]): any => {
    const asignadoCounts: { [key: string]: number } = {};
    const asignadoLabels: string[] = [];

    tareas.forEach((tarea) => {
      const asignado = tarea.asignado;
      if (!asignadoCounts[asignado]) {
        asignadoCounts[asignado] = 1;
        asignadoLabels.push(asignado);
      } else {
        asignadoCounts[asignado]++;
      }
    });

    const data = {
      labels: asignadoLabels,
      datasets: [
        {
          label: "Número de Tareas",
          data: asignadoLabels.map((asignado) => asignadoCounts[asignado]),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    return data;
  };

  const handleShowReport = () => {
    setShowReportModal(true);
    const pieData = {
      labels: ["Pendientes", "Completadas"],
      datasets: [
        {
          label: "Tareas",
          data: [tareasBoard.pendientes.length, tareasBoard.completadas.length],
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
          ],
          borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
          borderWidth: 1,
        },
      ],
    };

    const priorityBarData = createPriorityBarData([
      ...tareasBoard.pendientes,
      ...tareasBoard.completadas,
    ]);
    const responsableBarData = createAsignadoBarData([
      ...tareasBoard.pendientes,
      ...tareasBoard.completadas,
    ]);

    setGrafica({
      pieData,
      priorityBarData,
      responsableBarData,
    });
  };

  useEffect(() => {
    obtenerTareas();
  }, [filtroNombre, filtroPrioridad, filtroResponsable]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Menú lateral izquierdo */}
      <div style={{ backgroundColor: "white", width: "20%" }}>
        <ListaGrupos
          equipos={equipos}
          onEquipoClick={handleTareasActualizadas}
          equipoSeleccionado={equipoSeleccionado}
          setEquipoSeleccionado={setEquipoSeleccionado}
        />
      </div>

      {/* Contenedor principal */}
      <div style={{ flex: 1 }}>
        <Navigation
          onShowModal={handleOpenModalTarea}
          onLogout={handleLogout}
          usuario={usuario}
          onCrearEquipo={handleShowEquipoModal}
        />

        <Container style={{ marginTop: "4rem" }}>
          <h1 className="text-white font-weight-bold me-2">
            Tablero
            {equipoSeleccionado !== 0 && (
              <Button
                variant="primary"
                className="ms-3 me-2"
                onClick={handleOpenModalAsing}
              >
                Agregar Miembro
              </Button>
            )}
            <Button className="ms-3" onClick={() => handleShowReport()}>
              Ver Reportes
            </Button>
          </h1>

          <Form.Group controlId="formFiltros" className="mb-3">
            <div className="row">
              <div className="col-md-4 mb-3">
                <Form.Label className="text-white font-weight-bold">
                  Filtrar por Prioridad
                </Form.Label>
                <Select
                  options={[
                    { value: null, label: "Ninguno" },
                    ...priorityOptions,
                  ]}
                  value={
                    filtroPrioridad === null
                      ? { value: null, label: "Ninguno" }
                      : priorityOptions.find(
                          (option) => option.value === filtroPrioridad
                        )
                  }
                  onChange={(selectedOption: any) =>
                    setFiltroPrioridad(selectedOption.value)
                  }
                  isClearable={true}
                />
              </div>

              <div className="col-md-4 mb-3">
                <Form.Label className="text-white font-weight-bold">
                  Buscar por Nombre de Tarea
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                  />
                  {filtroNombre && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFiltroNombre("")}
                    >
                      X
                    </Button>
                  )}
                </InputGroup>
              </div>

              <div className="col-md-4 mb-3">
                <Form.Label className="text-white font-weight-bold">
                  Buscar por Responsable
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={filtroResponsable}
                    onChange={(e) => setFiltroResponsable(e.target.value)}
                  />
                  {filtroResponsable && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setFiltroResponsable("")}
                    >
                      X
                    </Button>
                  )}
                </InputGroup>
              </div>
            </div>
          </Form.Group>

          <Modal
            show={showReportModal}
            onHide={handleCloseReportModal}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Reporte de Tareas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-md-6">
                  <h5>Distribución completado</h5>
                  <Pie data={grafica?.pieData} />
                </div>
                <div className="col-md-6">
                  <h5>Distribución por Prioridad</h5>
                  <Bar data={grafica?.responsableBarData} />
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
                  <h5>Distribución por Responsable</h5>
                  <Bar data={grafica?.priorityBarData} />
                </div>
                {/* Aquí puedes agregar otra gráfica si lo deseas */}
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={showModalData} onHide={() => setShowModalData(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{selectedTarea?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{selectedTarea?.descripcion}</p>
              <p>Fecha Límite: {selectedTarea?.fechaLimite}</p>
              <p>Prioridad: {getPriorityIcon(selectedTarea?.prioridad)}</p>
              <Form.Group controlId="formComentario">
                <Form.Label>Agregar Comentario</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
                <Button
                  variant="primary"
                  className="mt-2"
                  onClick={agregarComentario}
                >
                  Agregar Comentario
                </Button>
              </Form.Group>
              <h5 className="mt-4">Comentarios</h5>
              <ListGroup>
                {comentarios.map((comentario: any) => (
                  <ListGroup.Item key={comentario.id}>
                    <p>{comentario.contenido}</p>
                    <small>Por: {comentario.usuarioEmail}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Modal.Body>
          </Modal>

          <Modal show={showAsingTeamModal} onHide={handleCloseAsingTeamModal}>
            <Modal.Header closeButton>
              <Modal.Title>Agregar Miembro al Equipo</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleAsignarMiembro}>
                <Form.Group controlId="formUsuario">
                  <Form.Label>Seleccionar Usuario</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={handleSelectUsuario}
                    value={selectedUsuarioId}
                  >
                    <option value="">Seleccionar...</option>
                    {usuariosNoEnEquipo.map((usuario: Usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.correo}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-4">
                  Asignar Miembro
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

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
                <Form.Group controlId="formUsuario" className="mt-3">
                  <Form.Label>Seleccionar Responsable</Form.Label>
                  <Select
                    defaultValue={{
                      value: selectedUsuarioResId,
                      label: "automatico",
                    }}
                    options={usuarios.map((usuario: Usuario) => ({
                      value: usuario.id,
                      label: usuario.correo,
                    }))}
                    onChange={handleSelectUsuarioRes}
                    isClearable={false}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-4">
                  Crear Tarea
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

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
                              onClick={() => handleShowTareaModal(tarea)}
                            >
                              <div className="card mb-3">
                                <div className="card-body">
                                  <h5 className="card-title">
                                    {tarea.nombre}{" "}
                                    {getPriorityIcon(tarea.prioridad)}
                                  </h5>
                                  <p className="card-text">
                                    {tarea.descripcion}
                                  </p>
                                  <p className="card-text">
                                    <small className="text-muted">
                                      Fecha Límite: {tarea.fechaLimite}
                                    </small>
                                  </p>

                                  <p className="card-text">
                                    <small className="text-muted">
                                      Responsable: {tarea.asignado}
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
                              onClick={() => handleShowTareaModal(tarea)}
                            >
                              <div className="card mb-3">
                                <div className="card-body">
                                  <h5 className="card-title">
                                    {tarea.nombre}{" "}
                                    {getPriorityIcon(tarea.prioridad)}
                                  </h5>
                                  <p className="card-text">
                                    {tarea.descripcion}
                                  </p>
                                  <p className="card-text">
                                    <small className="text-muted">
                                      Fecha Límite: {tarea.fechaLimite}
                                    </small>
                                  </p>
                                  <p className="card-text">
                                    <small className="text-muted">
                                      Responsable: {tarea.asignado}
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
          <ToastContainer />
        </Container>
      </div>
    </div>
  );
};

export default LugarTrabajo;
