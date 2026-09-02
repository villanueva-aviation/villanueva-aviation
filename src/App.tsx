import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { LiveBar } from "./components/layout/LiveBar";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { ProgressProvider } from "./features/progress/ProgressContext";
import { ROUTES } from "./lib/routes";
import { Home } from "./pages/Home";
import { Academia } from "./pages/Academia";
import { AcademiaModulo } from "./pages/AcademiaModulo";
import { MiFormacion } from "./pages/MiFormacion";
import { Tracker } from "./pages/Tracker";
import { Evaluaciones } from "./pages/Evaluaciones";
import { ContenidoExclusivo } from "./pages/ContenidoExclusivo";
import { Descargas } from "./pages/Descargas";
import { ChecklistC172 } from "./pages/ChecklistC172";
import { GuiaVFR } from "./pages/GuiaVFR";
import { Comunidad } from "./pages/Comunidad";
import { Perfil } from "./pages/Perfil";
import { Ingresar } from "./pages/Ingresar";
import { NotFound } from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <div className="flex min-h-screen flex-col bg-navy-950">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path={ROUTES.home} element={<Home />} />
              <Route
                path={ROUTES.academia}
                element={
                  <ProtectedRoute>
                    <Academia />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/academia/:slug"
                element={
                  <ProtectedRoute>
                    <AcademiaModulo />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.miFormacion}
                element={
                  <ProtectedRoute>
                    <MiFormacion />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.tracker}
                element={
                  <ProtectedRoute>
                    <Tracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.evaluaciones}
                element={
                  <ProtectedRoute>
                    <Evaluaciones />
                  </ProtectedRoute>
                }
              />
              <Route path={ROUTES.contenidoExclusivo} element={<ContenidoExclusivo />} />
              <Route path={ROUTES.descargas} element={<Descargas />} />
              <Route path={ROUTES.checklistC172} element={<ChecklistC172 />} />
              <Route path={ROUTES.guiaVFR} element={<GuiaVFR />} />
              <Route path={ROUTES.comunidad} element={<Comunidad />} />
              <Route
                path={ROUTES.perfil}
                element={
                  <ProtectedRoute>
                    <Perfil />
                  </ProtectedRoute>
                }
              />
              <Route path={ROUTES.ingresar} element={<Ingresar />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <LiveBar />
        </div>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
