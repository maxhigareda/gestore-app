import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import PlaceholderPage from './components/PlaceholderPage';
import FichaPage from './pages/Ficha';
import EvaluationsPage from './pages/Evaluations';
import PortalPage from './pages/Portal';
import TrainingPage from './pages/Training';
import DirectoryPage from './pages/Directory';
import OrganigramaPage from './pages/Directory/Organigrama';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Cargando...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                {/* Default redirect to Portal */}
                <Route index element={<Navigate to="/portal" replace />} />

                {/* Home Module Routes */}
                <Route path="portal" element={<PortalPage />} />
                <Route path="ficha" element={<FichaPage />} />

                {/* Team & Directory */}
                <Route path="team" element={<PlaceholderPage title="Mi Equipo" />} />
                <Route path="directory" element={<DirectoryPage />} />
                <Route path="org-chart" element={<OrganigramaPage />} />

                {/* Growth & Feedback */}
                <Route path="evaluations" element={<EvaluationsPage />} />
                <Route path="surveys" element={<PlaceholderPage title="Mis Encuestas" />} />
                <Route path="training-my" element={<TrainingPage />} />
                <Route path="recognition" element={<PlaceholderPage title="Reconocimientos" />} />

                {/* Other Module Placeholders */}
                <Route path="admin/*" element={<PlaceholderPage title="Módulo Administrativo" />} />
                <Route path="org-dev/*" element={<PlaceholderPage title="Desarrollo Organizacional" />} />
                <Route path="training/*" element={<PlaceholderPage title="Gestión de Capacitaciones" />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
