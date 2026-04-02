import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SimpleLandingPage } from "./apps/user/pages/simpleLandingPage";
import { LoginPage } from "./apps/user/pages/LoginPage";
import { RegisterPage } from "./apps/user/pages/RegisterPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminApp } from "./apps/admin/AdminApp";
import { ParticipantDashboard } from "./apps/user/pages/ParticipantDashboard";

// Wrapper component to provide navigation logic for the Login Page
const LoginRoute = () => {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLoginSuccess={() => navigate("/dashboard")}
      onNavigateToRegister={() => navigate("/register")}
    />
  );
};

// Wrapper component to provide navigation logic for the Registration Page
const RegisterRoute = () => {
  const navigate = useNavigate();
  return <RegisterPage onNavigateToLogin={() => navigate("/login")} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<SimpleLandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />

          {/* Protected Routes for Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Route for Admins */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
