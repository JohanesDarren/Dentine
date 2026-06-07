import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/Shell";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DiagnosePhoto from "./pages/DiagnosePhoto";
import DiagnoseXRay from "./pages/DiagnoseXRay";
import Patients from "./pages/Patients";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AnimatePresence } from "framer-motion";
import { PageWrapper } from "./components/ui";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/diagnose/photo" element={<ProtectedRoute><PageWrapper><DiagnosePhoto /></PageWrapper></ProtectedRoute>} />
        <Route path="/diagnose/xray" element={<ProtectedRoute><PageWrapper><DiagnoseXRay /></PageWrapper></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PageWrapper><Patients /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell>
          <AnimatedRoutes />
        </AppShell>
      </Router>
    </AuthProvider>
  );
}
