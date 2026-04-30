import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LandingPage } from "./apps/user/pages/LandingPage";
import { WelcomePage } from "./apps/user/pages/WelcomePage";
import { LoginPage } from "./apps/user/pages/LoginPage";
import { RegisterPage } from "./apps/user/pages/RegisterPage";
import { ProtectedRoute } from "./components/sections/auth/ProtectedRoute";
import { AdminApp } from "./apps/admin/AdminApp";
import { UserDashboard } from "./apps/user/pages/UserDashboard";
import { Toaster } from "sonner";
import { EventDetailPage } from "./apps/user/pages/EventDetailPage";
import { ResetPasswordPage } from "./apps/user/pages/ResetPasswordPage";
import { OrgApp } from "./apps/org/OrgApp";
import { NotFoundPage } from "./pages/NotFoundPage";


// Wrapper component to provide navigation logic for the Login Page
const LoginRoute = () => {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLoginSuccess={(role) => {
        if (role === "admin") {
          // Restore any deep-link the admin tried to reach before being redirected
          const adminRedirect = sessionStorage.getItem("admin_redirect_after_login");
          sessionStorage.removeItem("admin_redirect_after_login");
          navigate(adminRedirect || "/admin/dashboard");
        } else if (role === "organization") {
          navigate("/org/dashboard");
        } else {
          // Regular user — honour any stored deep-link
          const redirectTo = sessionStorage.getItem("redirect_after_login");
          sessionStorage.removeItem("redirect_after_login");
          navigate(redirectTo || "/dashboard");
        }
      }}
      onNavigateToRegister={() => {
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
          <Route path="/" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Protected Routes for Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
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

          {/* Protected Route for Admins — AdminApp manages its own auth */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Organization Route */}
          <Route
            path="/org/*"
            element={
              <ProtectedRoute>
                <OrgApp />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
