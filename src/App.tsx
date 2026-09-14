import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { PremiumRoute } from "./features/payments/PremiumRoute";
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
import { ChecklistC152 } from "./pages/ChecklistC152";
import { PlanDeVuelo } from "./pages/PlanDeVuelo";
import { BitacoraVuelo } from "./pages/BitacoraVuelo";
import { PesoBalance } from "./pages/PesoBalance";
import { AudioRodajeDespegue } from "./pages/AudioRodajeDespegue";
import { AudioEmergenciasAproximacion } from "./pages/AudioEmergenciasAproximacion";
import { ChecklistPremiumC172 } from "./pages/ChecklistPremiumC172";
import { ChecklistPremiumC152 } from "./pages/ChecklistPremiumC152";
import { SimulacroOral } from "./pages/SimulacroOral";
import { SimulacroVuelo } from "./pages/SimulacroVuelo";
import { PracticaVuelo } from "./pages/PracticaVuelo";
import { AgendarCita } from "./pages/AgendarCita";
import { GuiaVFR } from "./pages/GuiaVFR";
import { Comunidad } from "./pages/Comunidad";
import { Perfil } from "./pages/Perfil";
import { AdminVuelosPractica } from "./pages/AdminVuelosPractica";
import { AdminReservas } from "./pages/AdminReservas";
import { Legal } from "./pages/Legal";
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
              <Route path={ROUTES.checklistC152} element={<ChecklistC152 />} />
              <Route path={ROUTES.planVuelo} element={<PlanDeVuelo />} />
              <Route path={ROUTES.bitacoraVuelo} element={<BitacoraVuelo />} />
              <Route path={ROUTES.pesoBalance} element={<PesoBalance />} />
              <Route
                path={ROUTES.audioRodajeDespegue}
                element={
                  <PremiumRoute>
                    <AudioRodajeDespegue />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.audioEmergenciasAproximacion}
                element={
                  <PremiumRoute>
                    <AudioEmergenciasAproximacion />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.checklistPremiumC172}
                element={
                  <PremiumRoute>
                    <ChecklistPremiumC172 />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.checklistPremiumC152}
                element={
                  <PremiumRoute>
                    <ChecklistPremiumC152 />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.simulacroOral}
                element={
                  <PremiumRoute>
                    <SimulacroOral />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.simulacroVuelo}
                element={
                  <PremiumRoute>
                    <SimulacroVuelo />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.practicaVuelo}
                element={
                  <PremiumRoute>
                    <PracticaVuelo />
                  </PremiumRoute>
                }
              />
              <Route
                path={ROUTES.agendarCita}
                element={
                  <PremiumRoute>
                    <AgendarCita />
                  </PremiumRoute>
                }
              />
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
              <Route path={ROUTES.legal} element={<Legal />} />
              <Route
                path={ROUTES.adminVuelosPractica}
                element={
                  <ProtectedRoute>
                    <AdminVuelosPractica />
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.adminReservas}
                element={
                  <ProtectedRoute>
                    <AdminReservas />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
