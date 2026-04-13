import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SimpleLandingPage } from "./apps/user/pages/simpleLandingPage";
import { MainPage } from "./apps/user/pages/MainPage";
import { LoginPage } from "./apps/user/pages/LoginPage";
import { RegisterPage } from "./apps/user/pages/RegisterPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminApp } from "./apps/admin/AdminApp";
import { Dashboard } from "./apps/user/pages/Dashboard";
import { Toaster } from "sonner";
import { EventDetailPage } from "./apps/user/pages/EventDetailPage";
import { ResetPasswordPage } from "./apps/user/pages/ResetPasswordPage";

// Wrapper component to provide navigation logic for the Login Page
const LoginRoute = () => {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLoginSuccess={() => {
        const redirectTo = sessionStorage.getItem("redirect_after_login");
        sessionStorage.removeItem("redirect_after_login");
        navigate(redirectTo || "/dashboard");
      }}
      onNavigateToRegister={() => {
        // Preserve the redirect path when going to register too
        navigate("/register");
      }}
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
          <Route path="/main" element={<MainPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes for Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId"
            element={
              <ProtectedRoute>
                <EventDetailPage />
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
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
