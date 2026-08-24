import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NoticeBoardPage from './pages/NoticeBoardPage';
import DashboardHomePage from './pages/DashboardHomePage';
import DirectoryPage from './pages/DirectoryPage';
import LoadingSkeleton from './components/Common/LoadingSkeleton';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/complaints" replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <ResidentDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notices"
              element={
                <ProtectedRoute>
                  <NoticeBoardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardHomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <DirectoryPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
