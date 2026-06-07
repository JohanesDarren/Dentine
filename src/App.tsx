import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/Shell";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DiagnosePhoto from "./pages/DiagnosePhoto";
import DiagnoseXRay from "./pages/DiagnoseXRay";
import Patients from "./pages/Patients";
import { AnimatePresence } from "framer-motion";
import { PageWrapper } from "./components/ui";

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/diagnose/photo" element={<PageWrapper><DiagnosePhoto /></PageWrapper>} />
        <Route path="/diagnose/xray" element={<PageWrapper><DiagnoseXRay /></PageWrapper>} />
        <Route path="/patients" element={<PageWrapper><Patients /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </Router>
  );
}
