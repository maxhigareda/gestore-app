// import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import PlaceholderPage from './components/PlaceholderPage';
import FichaPage from './pages/Ficha';
import MyTeamPage from './pages/MyTeam'; // Import MyTeamPage
import EvaluationsPage from './pages/Evaluations';
import PortalPage from './pages/Portal';
import TrainingPage from './pages/Training'; // Import TrainingPage
import DirectoryPage from './pages/Directory';
import OrganigramaPage from './pages/Directory/Organigrama';
import AdminPage from './pages/Admin';
import CollaboratorsPage from './pages/Admin/Collaborators';
import CreateCollaborator from './pages/Admin/Collaborators/CreateCollaborator';
import ActiveCollaborators from './pages/Admin/Collaborators/ActiveCollaborators';
import RequestsPage from './pages/Admin/Collaborators/Requests';
import OrganizationPage from './pages/Admin/Organization';
import AttendancePage from './pages/Admin/Attendance';

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
                <Route path="team" element={<MyTeamPage />} />
                <Route path="directory" element={<DirectoryPage />} />
                <Route path="org-chart" element={<OrganigramaPage />} />

                {/* Growth & Feedback */}
                <Route path="evaluations" element={<EvaluationsPage />} />
                <Route path="surveys" element={<PlaceholderPage title="Mis Encuestas" />} />
                <Route path="training-my" element={<TrainingPage />} />
                <Route path="recognition" element={<PlaceholderPage title="Reconocimientos" />} />

                {/* Admin Module Routes */}
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/collaborators" element={<CollaboratorsPage />} />
                <Route path="admin/collaborators/create" element={<CreateCollaborator />} />
                <Route path="admin/collaborators/active" element={<ActiveCollaborators />} />
                <Route path="admin/collaborators/groups" element={<PlaceholderPage title="Grupos de Colaboradores (En construcción)" />} />
                <Route path="admin/collaborators/requests" element={<RequestsPage />} />

                <Route path="admin/organization" element={<OrganizationPage />} />
                <Route path="admin/attendance" element={<AttendancePage />} />

                {/* Other Module Placeholders */}
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
