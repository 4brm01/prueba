// src/App.jsx
import React, { useState, Component } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Contexts
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

// Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import PublicPage from "./components/public/PublicPage";
import AuthPage from "./components/auth/AuthPage";
import AdminPage from "./components/admin/AdminPage";
import { Modal } from "./components/ui/Modal";
import { MisHijos } from "./components/padres";
import { DoctorDashboard } from "./components/doctor";
import { DirectorDashboard } from "./components/director";
import GestionPacientes from "./components/pacientes/GestionPacientes";
import CentrosPage from "./components/centros/CentrosPage";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Algo salió mal.</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AppContent({ activeTab, setActiveTab }) {
  const { currentUser, currentPage, handleLogin, showAuthPage, showPublicPage } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(() => {
    if (currentPage === 'public' && window.location.pathname !== '/') navigate('/');
    if (currentPage === 'auth' && window.location.pathname !== '/auth') navigate('/auth');
    if (currentUser && window.location.pathname === '/auth') {
      let newTab = 'centros';
      if (currentUser.role === 'administrador') newTab = 'admin';
      else if (currentUser.role === 'director') newTab = 'mis-centros';
      else if (currentUser.role === 'doctor') newTab = 'doctor';
      else if (currentUser.role === 'padre') newTab = 'padre';
      setActiveTab(newTab);
      navigate('/dashboard');
    }
  }, [currentPage, currentUser, navigate, setActiveTab]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <PublicPage onShowAuth={showAuthPage} />
        }
      />
      <Route
        path="/auth"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <AuthPage onBack={showPublicPage} onLogin={handleLogin} />
        }
      />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <div className="container-fluid">
              <Header onShowLogin={() => setShowLoginModal(true)} />
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="content-wrapper animate-fadeIn">
                {(() => {
                  switch (activeTab) {
                    case "centros":
                      return <CentrosPage />;
                    case "pacientes":
                      return <GestionPacientes />;
                    case "admin":
                      return <AdminPage activeSection="admin" />;
                    case "mis-hijos":
                      return <MisHijos />;
                    case "mis-centros":
                      return <DirectorDashboard />;
                    case "doctor":
                      return <DoctorDashboard />;
                    default:
                      return <div>Seleccione una sección válida.</div>;
                  }
                })()}
              </div>
              {showLoginModal && (
                <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
                  <AuthPage
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLogin={handleLogin}
                  />
                </Modal>
              )}
            </div>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("centros");

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;