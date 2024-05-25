import React, { useState, ChangeEvent, FormEvent, MouseEvent } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  InputGroup,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

interface FormState {
  nombre: string;
  correo: string;
  contrasena: string;
}

interface ErrorState {
  nombre: boolean;
  correo: boolean;
  contrasena: boolean;
}

const RegistroUsuario: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    correo: "",
    contrasena: "",
  });

  const [errors, setErrors] = useState<ErrorState>({
    nombre: false,
    correo: false,
    contrasena: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Validar el campo correspondiente
    setErrors({
      ...errors,
      [name]:
        value === "" || (name === "contrasena" && !validarContrasena(value)),
    });
  };

  const validarContrasena = (contrasena: string): boolean => {
    // Validar longitud mínima, al menos una mayúscula, una minúscula, un número y un caracter especial
    const regex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(contrasena);
  };

  const enviarDatos = async () => {
    try {
      const response = await fetch("https://localhost:32770/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos");
      }

      // Aquí puedes manejar la respuesta de la API según tus necesidades
      toast.success("Usuario creado exitosamente");
    } catch (error) {
      console.error("Error:", error.message);
      toast.error("Error al registrar el usuario");
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // Validar que todos los campos estén completos y marcar errores
    const newErrors = {
      nombre: !form.nombre,
      correo: !form.correo,
      contrasena: !validarContrasena(form.contrasena),
    };

    setErrors(newErrors);

    // Mostrar mensaje de error si hay errores
    if (newErrors.nombre || newErrors.correo || newErrors.contrasena) {
      toast.error("Por favor, completa todos los campos correctamente.");
      return;
    }

    console.log("Datos del formulario:", form);
    enviarDatos();
  };

  const handleTogglePasswordVisibility = (e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md="6">
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">
                Registro de Usuario
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formNombre">
                  <Form.Label className={errors.nombre ? "text-danger" : ""}>
                    Nombre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={errors.nombre ? "is-invalid" : ""}
                  />
                  {errors.nombre && (
                    <Form.Text className="text-danger">
                      Por favor, ingresa tu nombre completo.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="formCorreo" className="mt-3">
                  <Form.Label className={errors.correo ? "text-danger" : ""}>
                    Correo Electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo electrónico"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    className={errors.correo ? "is-invalid" : ""}
                  />
                  {errors.correo && (
                    <Form.Text className="text-danger">
                      Por favor, ingresa un correo electrónico válido.
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="formPassword" className="mt-3">
                  <Form.Label
                    className={errors.contrasena ? "text-danger" : ""}
                  >
                    Contraseña
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      name="contrasena"
                      value={form.contrasena}
                      onChange={handleChange}
                      className={errors.contrasena ? "is-invalid" : ""}
                    />
                    <InputGroup.Text
                      onClick={handleTogglePasswordVisibility}
                      style={{ cursor: "pointer" }}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </InputGroup.Text>
                  </InputGroup>
                  {errors.contrasena && (
                    <Form.Text className="text-danger">
                      La contraseña debe tener al menos 8 caracteres y contener
                      al menos una mayúscula, una minúscula, un número y un
                      carácter especial.
                    </Form.Text>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-4">
                  Registrarse
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="w-100 mt-2"
                >
                  Iniciar Sesión
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
};

export default RegistroUsuario;
