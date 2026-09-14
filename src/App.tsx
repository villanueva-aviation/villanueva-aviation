import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { PageLoader } from "./components/layout/PageLoader";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { AuthProvider } from "./features/auth/AuthContext";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { PremiumRoute } from "./features/payments/PremiumRoute";
import { ProgressProvider } from "./features/progress/ProgressContext";
import { ROUTES } from "./lib/routes";
import { Home } from "./pages/Home";

const Academia = lazy(() => import("./pages/Academia").then((m) => ({ default: m.Academia })));
const AcademiaModulo = lazy(() => import("./pages/AcademiaModulo").then((m) => ({ default: m.AcademiaModulo })));
const MiFormacion = lazy(() => import("./pages/MiFormacion").then((m) => ({ default: m.MiFormacion })));
const Tracker = lazy(() => import("./pages/Tracker").then((m) => ({ default: m.Tracker })));
const Evaluaciones = lazy(() => import("./pages/Evaluaciones").then((m) => ({ default: m.Evaluaciones })));
const ContenidoExclusivo = lazy(() => import("./pages/ContenidoExclusivo").then((m) => ({ default: m.ContenidoExclusivo })));
const Descargas = lazy(() => import("./pages/Descargas").then((m) => ({ default: m.Descargas })));
const ChecklistC172 = lazy(() => import("./pages/ChecklistC172").then((m) => ({ default: m.ChecklistC172 })));
const ChecklistC152 = lazy(() => import("./pages/ChecklistC152").then((m) => ({ default: m.ChecklistC152 })));
const PlanDeVuelo = lazy(() => import("./pages/PlanDeVuelo").then((m) => ({ default: m.PlanDeVuelo })));
const BitacoraVuelo = lazy(() => import("./pages/BitacoraVuelo").then((m) => ({ default: m.BitacoraVuelo })));
const PesoBalance = lazy(() => import("./pages/PesoBalance").then((m) => ({ default: m.PesoBalance })));
const AudioRodajeDespegue = lazy(() => import("./pages/AudioRodajeDespegue").then((m) => ({ default: m.AudioRodajeDespegue })));
const AudioEmergenciasAproximacion = lazy(() =>
  import("./pages/AudioEmergenciasAproximacion").then((m) => ({ default: m.AudioEmergenciasAproximacion })),
);
const ChecklistPremiumC172 = lazy(() => import("./pages/ChecklistPremiumC172").then((m) => ({ default: m.ChecklistPremiumC172 })));
const ChecklistPremiumC152 = lazy(() => import("./pages/ChecklistPremiumC152").then((m) => ({ default: m.ChecklistPremiumC152 })));
const SimulacroOral = lazy(() => import("./pages/SimulacroOral").then((m) => ({ default: m.SimulacroOral })));
const SimulacroVuelo = lazy(() => import("./pages/SimulacroVuelo").then((m) => ({ default: m.SimulacroVuelo })));
const PracticaVuelo = lazy(() => import("./pages/PracticaVuelo").then((m) => ({ default: m.PracticaVuelo })));
const AgendarCita = lazy(() => import("./pages/AgendarCita").then((m) => ({ default: m.AgendarCita })));
const GuiaVFR = lazy(() => import("./pages/GuiaVFR").then((m) => ({ default: m.GuiaVFR })));
const Comunidad = lazy(() => import("./pages/Comunidad").then((m) => ({ default: m.Comunidad })));
const Perfil = lazy(() => import("./pages/Perfil").then((m) => ({ default: m.Perfil })));
const AdminVuelosPractica = lazy(() => import("./pages/AdminVuelosPractica").then((m) => ({ default: m.AdminVuelosPractica })));
const AdminReservas = lazy(() => import("./pages/AdminReservas").then((m) => ({ default: m.AdminReservas })));
const Legal = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Legal })));
const Ingresar = lazy(() => import("./pages/Ingresar").then((m) => ({ default: m.Ingresar })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RoutedContent() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname}>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <div className="flex min-h-screen flex-col bg-navy-950">
          <ScrollToTop />
          <Navbar />
          <main className="flex-1">
            <RoutedContent />
          </main>
          <Footer />
        </div>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
