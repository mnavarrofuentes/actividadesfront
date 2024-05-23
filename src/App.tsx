import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RegistroUsuario from "./components/RegistroUsuario";
import LoginUsuario from "./components/Login";
import LugarTrabajo from "./components/LugarTrabajo";

const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/registro" element={<RegistroUsuario />} />
        <Route path="/login" element={<LoginUsuario />} />
        <Route
          path="/lugar-trabajo"
          element={
            isAuthenticated ? <LugarTrabajo /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
