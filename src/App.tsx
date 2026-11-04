import { Route, Routes, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, useRef } from "react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { EnFooter, EnNavbar } from "./components/layout/EnLayout";
import { RUTAS_EN, esIngles, parDeIdioma } from "./lib/idioma";
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
const ExamenTipo = lazy(() => import("./pages/ExamenTipo").then((m) => ({ default: m.ExamenTipo })));
const GuiaEstudioPdf = lazy(() => import("./pages/GuiaEstudioPdf").then((m) => ({ default: m.GuiaEstudioPdf })));
const MiFormacion = lazy(() => import("./pages/MiFormacion").then((m) => ({ default: m.MiFormacion })));
const Tracker = lazy(() => import("./pages/Tracker").then((m) => ({ default: m.Tracker })));
const Evaluaciones = lazy(() => import("./pages/Evaluaciones").then((m) => ({ default: m.Evaluaciones })));
const ContenidoExclusivo = lazy(() => import("./pages/ContenidoExclusivo").then((m) => ({ default: m.ContenidoExclusivo })));
const Descargas = lazy(() => import("./pages/Descargas").then((m) => ({ default: m.Descargas })));
const ChecklistC172 = lazy(() => import("./pages/ChecklistC172").then((m) => ({ default: m.ChecklistC172 })));
const ChecklistC152 = lazy(() => import("./pages/ChecklistC152").then((m) => ({ default: m.ChecklistC152 })));
const PlanDeVuelo = lazy(() => import("./pages/PlanDeVuelo").then((m) => ({ default: m.PlanDeVuelo })));
const BriefingPiloto = lazy(() => import("./pages/BriefingPiloto").then((m) => ({ default: m.BriefingPiloto })));
const RutasMexico = lazy(() => import("./pages/RutasMexico").then((m) => ({ default: m.RutasMexico })));
const BitacoraVuelo = lazy(() => import("./pages/BitacoraVuelo").then((m) => ({ default: m.BitacoraVuelo })));
const PesoBalance = lazy(() => import("./pages/PesoBalance").then((m) => ({ default: m.PesoBalance })));
const AudioRodajeDespegue = lazy(() => import("./pages/AudioRodajeDespegue").then((m) => ({ default: m.AudioRodajeDespegue })));
const AudioEmergenciasAproximacion = lazy(() =>
  import("./pages/AudioEmergenciasAproximacion").then((m) => ({ default: m.AudioEmergenciasAproximacion })),
);
const ChecklistPremiumC172 = lazy(() => import("./pages/ChecklistPremiumC172").then((m) => ({ default: m.ChecklistPremiumC172 })));
const Paneles = lazy(() => import("./pages/Paneles").then((m) => ({ default: m.Paneles })));
const Controles = lazy(() => import("./pages/Controles").then((m) => ({ default: m.Controles })));
const ChecklistAvion = lazy(() => import("./pages/ChecklistAvion").then((m) => ({ default: m.ChecklistAvion })));
const ChecklistPremiumAvion = lazy(() => import("./pages/ChecklistPremiumAvion").then((m) => ({ default: m.ChecklistPremiumAvion })));
const ChecklistPremiumC152 = lazy(() => import("./pages/ChecklistPremiumC152").then((m) => ({ default: m.ChecklistPremiumC152 })));
const SimulacroOral = lazy(() => import("./pages/SimulacroOral").then((m) => ({ default: m.SimulacroOral })));
const SimulacroVuelo = lazy(() => import("./pages/SimulacroVuelo").then((m) => ({ default: m.SimulacroVuelo })));
const PracticaVuelo = lazy(() => import("./pages/PracticaVuelo").then((m) => ({ default: m.PracticaVuelo })));
const SimhubExclusivo = lazy(() => import("./pages/SimhubExclusivo").then((m) => ({ default: m.SimhubExclusivo })));
const AgendarCita = lazy(() => import("./pages/AgendarCita").then((m) => ({ default: m.AgendarCita })));
const GuiaVFR = lazy(() => import("./pages/GuiaVFR").then((m) => ({ default: m.GuiaVFR })));
const Aventura = lazy(() => import("./pages/Aventura").then((m) => ({ default: m.Aventura })));
const QuienesSomos = lazy(() => import("./pages/QuienesSomos").then((m) => ({ default: m.QuienesSomos })));
const Flota = lazy(() => import("./pages/Flota").then((m) => ({ default: m.Flota })));
const AdminAventura = lazy(() => import("./pages/AdminAventura").then((m) => ({ default: m.AdminAventura })));
const EntrenadorEsperas = lazy(() => import("./pages/EntrenadorEsperas").then((m) => ({ default: m.EntrenadorEsperasPage })));
const Eventos = lazy(() => import("./pages/Eventos").then((m) => ({ default: m.Eventos })));
const OverlayGratis = lazy(() => import("./pages/OverlayGratis").then((m) => ({ default: m.OverlayGratis })));
const AeropuertoMMGL = lazy(() => import("./pages/AeropuertoMMGL").then((m) => ({ default: m.AeropuertoMMGL })));
const GimnasioAutorizaciones = lazy(() =>
  import("./pages/GimnasioAutorizacionesPage").then((m) => ({ default: m.GimnasioAutorizacionesPage })),
);
const ResumenHsi = lazy(() => import("./pages/ResumenHsi").then((m) => ({ default: m.ResumenHsi })));
const Comunidad = lazy(() => import("./pages/Comunidad").then((m) => ({ default: m.Comunidad })));
const Perfil = lazy(() => import("./pages/Perfil").then((m) => ({ default: m.Perfil })));
const AdminVuelosPractica = lazy(() => import("./pages/AdminVuelosPractica").then((m) => ({ default: m.AdminVuelosPractica })));
const AdminReservas = lazy(() => import("./pages/AdminReservas").then((m) => ({ default: m.AdminReservas })));
const AdminPruebasRed = lazy(() => import("./pages/AdminPruebasRed").then((m) => ({ default: m.AdminPruebasRed })));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback").then((m) => ({ default: m.AdminFeedback })));
const AdminGraduados = lazy(() => import("./pages/AdminGraduados").then((m) => ({ default: m.AdminGraduados })));
const AdminCadetes = lazy(() => import("./pages/AdminCadetes").then((m) => ({ default: m.AdminCadetes })));
const Feedback = lazy(() => import("./pages/Feedback").then((m) => ({ default: m.Feedback })));
const Legal = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Legal })));
const Empieza = lazy(() => import("./pages/Empieza").then((m) => ({ default: m.Empieza })));
const TestNivel = lazy(() => import("./pages/TestNivel").then((m) => ({ default: m.TestNivel })));
const Asesorias = lazy(() => import("./pages/Asesorias").then((m) => ({ default: m.Asesorias })));
const Diagnostico = lazy(() => import("./pages/Diagnostico").then((m) => ({ default: m.Diagnostico })));
const RutaRed = lazy(() => import("./pages/RutaRed").then((m) => ({ default: m.RutaRed })));
const RutaRedLeccion = lazy(() => import("./pages/RutaRedLeccion").then((m) => ({ default: m.RutaRedLeccion })));
const PruebaRed = lazy(() => import("./pages/PruebaRed").then((m) => ({ default: m.PruebaRed })));
const Ingresar = lazy(() => import("./pages/Ingresar").then((m) => ({ default: m.Ingresar })));
const SeccionPage = lazy(() => import("./pages/Seccion").then((m) => ({ default: m.SeccionPage })));
const EnHome = lazy(() => import("./pages/en/EnHome").then((m) => ({ default: m.EnHome })));
const EnCoaching = lazy(() => import("./pages/en/EnCoaching").then((m) => ({ default: m.EnCoaching })));
const EnLegal = lazy(() => import("./pages/en/EnLegal").then((m) => ({ default: m.EnLegal })));
const NotFound = lazy(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const TITULO_ES = "Villanueva Aviation — Todo para volar mejor tu simulador";
const TITULOS: Record<string, string> = {
  [ROUTES.aeropuertoMMGL]: "Guadalajara MMGL: guía de radio, salida y llegada para tu simulador — Villanueva Aviation",
  [ROUTES.eventos]: "Eventos de IVAO y VATSIM en español, en grupo — Villanueva Aviation",
  [ROUTES.overlayGratis]: "Overlay gratis para streamers de simulador (OBS) — Villanueva Aviation",
  [RUTAS_EN.home]: "Villanueva Aviation — Learn to fly for real in your simulator",
  [RUTAS_EN.coaching]: "One-on-one flight sim coaching — Villanueva Aviation",
  [RUTAS_EN.assessment]: "Book your free assessment — Villanueva Aviation",
  [RUTAS_EN.signIn]: "Sign in — Villanueva Aviation",
  [RUTAS_EN.legal]: "Terms, privacy and refunds — Villanueva Aviation",
};
const ORIGEN = "https://villanueva-aviation.pages.dev";

/** lang, título, canónica y hreflang según la página (el index.html es uno solo para todo el sitio). */
function EtiquetasIdioma() {
  const { pathname } = useLocation();
  const anterior = useRef(pathname);
  useEffect(() => {
    const ingles = esIngles(pathname);
    document.documentElement.lang = ingles ? "en" : "es";
    if (TITULOS[pathname]) document.title = TITULOS[pathname];
    else if (TITULOS[anterior.current] || esIngles(anterior.current)) document.title = TITULO_ES;
    anterior.current = pathname;

    document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((l) => l.remove());
    const link = (attrs: Record<string, string>) => {
      const l = document.createElement("link");
      Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
      document.head.appendChild(l);
    };
    link({ rel: "canonical", href: ORIGEN + pathname });
    const par = parDeIdioma(pathname);
    if (par) {
      link({ rel: "alternate", hreflang: "es", href: ORIGEN + par.es });
      link({ rel: "alternate", hreflang: "en", href: ORIGEN + par.en });
      link({ rel: "alternate", hreflang: "x-default", href: ORIGEN + par.es });
    }
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
          <Route path={ROUTES.vuela} element={<SeccionPage clave="vuela" />} />
          <Route path={ROUTES.hangar} element={<SeccionPage clave="hangar" />} />
          <Route path={ROUTES.aprende} element={<SeccionPage clave="aprende" />} />
          <Route
            path={ROUTES.academia}
            element={
              <ProtectedRoute>
                <Academia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academia/avion/:clave/guia"
            element={
              <ProtectedRoute>
                <GuiaEstudioPdf />
              </ProtectedRoute>
            }
          />
          <Route
            path="/academia/avion/:clave"
            element={
              <ProtectedRoute>
                <ExamenTipo />
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
          <Route path="/checklist/:avion" element={<ChecklistAvion />} />
          <Route path={ROUTES.planVuelo} element={<PlanDeVuelo />} />
          <Route path={ROUTES.briefing} element={<BriefingPiloto />} />
          <Route path={ROUTES.rutas} element={<RutasMexico />} />
          <Route path={ROUTES.controles} element={<Controles />} />
          <Route path={ROUTES.paneles} element={<Paneles />} />
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
            path="/premium/checklist/:avion"
            element={
              <PremiumRoute>
                <ChecklistPremiumAvion />
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
            path={ROUTES.simhubExclusivo}
            element={
              <PremiumRoute>
                <SimhubExclusivo />
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
          <Route path={ROUTES.aventura} element={<Aventura />} />
          <Route path={ROUTES.flota} element={<Flota />} />
          <Route path={ROUTES.quienesSomos} element={<QuienesSomos />} />
          <Route path={ROUTES.entrenadorEsperas} element={<EntrenadorEsperas />} />
          <Route path={ROUTES.gimnasioAutorizaciones} element={<GimnasioAutorizaciones />} />
          <Route path={ROUTES.aeropuertoMMGL} element={<AeropuertoMMGL />} />
          <Route path={ROUTES.overlayGratis} element={<OverlayGratis />} />
          <Route path={ROUTES.eventos} element={<Eventos />} />
          <Route path={ROUTES.resumenHsi} element={<ResumenHsi />} />
          <Route
            path={ROUTES.adminAventura}
            element={
              <ProtectedRoute>
                <AdminAventura />
              </ProtectedRoute>
            }
          />
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
          <Route
            path={ROUTES.adminPruebasRed}
            element={
              <ProtectedRoute>
                <AdminPruebasRed />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.adminFeedback}
            element={
              <ProtectedRoute>
                <AdminFeedback />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.adminGraduados}
            element={
              <ProtectedRoute>
                <AdminGraduados />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.adminCadetes}
            element={
              <ProtectedRoute>
                <AdminCadetes />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.feedback}
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.empieza} element={<Empieza />} />
          <Route path={ROUTES.testNivel} element={<TestNivel />} />
          <Route path={ROUTES.asesorias} element={<Asesorias />} />
          <Route
            path={ROUTES.diagnostico}
            element={
              <ProtectedRoute>
                <Diagnostico />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.rutaRed} element={<RutaRed />} />
          <Route
            path={ROUTES.pruebaRed}
            element={
              <ProtectedRoute>
                <PruebaRed />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.rutaRedLeccion(":id")} element={<RutaRedLeccion />} />
          <Route path={RUTAS_EN.home} element={<EnHome />} />
          <Route path={RUTAS_EN.coaching} element={<EnCoaching />} />
          <Route
            path={RUTAS_EN.assessment}
            element={
              <ProtectedRoute>
                <Diagnostico />
              </ProtectedRoute>
            }
          />
          <Route path={RUTAS_EN.signIn} element={<Ingresar />} />
          <Route path={RUTAS_EN.legal} element={<EnLegal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  // La página de aterrizaje va sin barra ni pie del sitio: cada enlace de más es una salida.
  const { pathname } = useLocation();
  const aterrizaje = pathname === ROUTES.empieza;
  const ingles = esIngles(pathname);
  return (
    <AuthProvider>
      <ProgressProvider>
        <div className="flex min-h-screen flex-col bg-navy-950">
          <ScrollToTop />
          <EtiquetasIdioma />
          {!aterrizaje && <div className="contents print:hidden">{ingles ? <EnNavbar /> : <Navbar />}</div>}
          <main className="flex-1">
            <RoutedContent />
          </main>
          {!aterrizaje && <div className="contents print:hidden">{ingles ? <EnFooter /> : <Footer />}</div>}
        </div>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
