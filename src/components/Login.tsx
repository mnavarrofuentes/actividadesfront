import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from "react";
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

interface LoginFormState {
  correo: string;
  contrasena: string;
}

interface LoginErrorState {
  correo: boolean;
  contrasena: boolean;
}

const LoginUsuario: React.FC = () => {
  const [form, setForm] = useState<LoginFormState>({
    correo: "",
    contrasena: "",
  });

  const [errors, setErrors] = useState<LoginErrorState>({
    correo: false,
    contrasena: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("si esta autenticado");
      navigate("/lugar-trabajo");
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: value === "",
    });
  };

  const enviarDatos = async () => {
    try {
      const response = await fetch("https://localhost:32768/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Error al enviar los datos");
      }

      const data = await response.json();
      console.log("hola");
      console.log(data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      console.log("pase");
      //toast.success("Inicio de sesión exitoso");
      console.log("mostre");
      navigate("/lugar-trabajo");
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(
        "Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo"
      );
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const newErrors = {
      correo: !form.correo,
      contrasena: !form.contrasena,
    };

    setErrors(newErrors);

    if (newErrors.correo || newErrors.contrasena) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

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
                Inicio de Sesión
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formCorreo">
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
                      Por favor, ingresa tu contraseña.
                    </Form.Text>
                  )}
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mt-4">
                  Iniciar Sesión
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate("/registro")}
                  className="w-100 mt-2"
                >
                  Registrarse
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

export default LoginUsuario;
