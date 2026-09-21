import { Link } from "react-router-dom";
import { ArrowRight, Award, CalendarCheck, ClipboardCheck, ListChecks, Radio, TrendingUp } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Container } from "../components/ui/Container";
import { Badge } from "../components/ui/Badge";
import { LockedOverlay } from "../components/ui/LockedOverlay";
import { Reveal } from "../components/ui/Reveal";
import { CONTENIDO_EXCLUSIVO } from "../data/exclusivo";
import { useAuth } from "../features/auth/AuthContext";
import { usePremiumAccess } from "../features/payments/usePremiumAccess";
import { PayPalButton } from "../features/payments/PayPalButton";
import { PRECIO_CONTENIDO_EXCLUSIVO } from "../lib/constants";
import { ROUTES } from "../lib/routes";

const numChecklists = CONTENIDO_EXCLUSIVO.filter((i) => i.tipo === "Checklist").length;
const numExamenes = CONTENIDO_EXCLUSIVO.filter((i) => i.tipo === "Examen").length;
const numAudios = CONTENIDO_EXCLUSIVO.filter((i) => i.tipo === "Audio").length;

const STATS = [
  { icon: ClipboardCheck, valor: numChecklists, label: "Checklists premium", detalle: "6 aviones" },
  { icon: Award, valor: numExamenes, label: "Simulacros de checkride", detalle: "Oral y en vuelo" },
  { icon: Radio, valor: numAudios, label: "Sets de audio ATC", detalle: "Situaciones reales" },
  { icon: ListChecks, valor: "12", label: "Maniobras de práctica", detalle: "De familiarización a TyD" },
  { icon: CalendarCheck, valor: "1", label: "Sesión con el fundador", detalle: "Revisión personal" },
];

export function ContenidoExclusivo() {
  const { isAuthenticated } = useAuth();
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const puedeAbrir = isAuthenticated && hasAccess;

  return (
    <div>
      <PageHero
        eyebrow="Contenido Exclusivo"
        title="La biblioteca privada de la Academia"
        description="Checklists premium, simulacros de checkride y revisión personal del fundador, disponibles únicamente para cadetes de Villanueva Aviation."
      />

      {!puedeAbrir && (
        <Container className="pt-12">
          <Reveal
            id="desbloquear"
            className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-b from-gold-500/[0.08] to-gold-500/[0.02] p-6 text-center sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Todo lo que obtienes</p>
            <p className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">
              Una biblioteca completa para llegar listo a tu checkride
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {STATS.map(({ icon: Icon, valor, label, detalle }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-white/[0.03] p-4">
                  <Icon size={20} className="text-gold-400" />
                  <p className="font-display text-2xl font-bold text-white">{valor}</p>
                  <p className="text-xs font-medium leading-tight text-white/70">{label}</p>
                  <p className="text-[11px] leading-tight text-white/40">{detalle}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/50">
              <TrendingUp size={13} className="text-gold-400" />
              Seguimos agregando contenido cada mes — tu pago único incluye todo lo nuevo, sin costo extra.
            </p>

            <div className="mt-6 border-t border-white/10 pt-6">
              {accessLoading ? null : isAuthenticated ? (
                <>
                  <p className="text-sm text-white/60">
                    Pago único de <span className="font-semibold text-white">${PRECIO_CONTENIDO_EXCLUSIVO} USD</span>{" "}
                    — acceso de por vida, sin vencimiento.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <PayPalButton onSuccess={() => window.location.reload()} />
                  </div>
                  <p className="mt-3 text-center text-[11px] text-white/35">
                    Al pagar aceptas nuestros{" "}
                    <Link to={`${ROUTES.legal}#terminos`} className="underline hover:text-gold-400">
                      términos
                    </Link>{" "}
                    y{" "}
                    <Link to={`${ROUTES.legal}#reembolsos`} className="underline hover:text-gold-400">
                      política de reembolsos
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-white/60">
                    Desde <span className="font-semibold text-white">${PRECIO_CONTENIDO_EXCLUSIVO} USD</span>, pago
                    único — acceso de por vida.
                  </p>
                  <Link
                    to={`${ROUTES.ingresar}?from=${encodeURIComponent(ROUTES.contenidoExclusivo)}`}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition-transform duration-200 hover:scale-[1.03]"
                  >
                    Crear cuenta gratis para desbloquear
                    <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </Reveal>
        </Container>
      )}

      <Container className="py-16 md:py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENIDO_EXCLUSIVO.map((item, i) => {
            const card = (
              <Reveal
                key={item.id}
                delay={i * 100}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                {!isAuthenticated && <LockedOverlay label="Contenido de cadetes" />}
                {isAuthenticated && !hasAccess && (
                  <LockedOverlay label="Desbloquea Contenido Exclusivo" cta="Ver arriba" to="#desbloquear" />
                )}
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      puedeAbrir ? "group-hover:scale-105" : "scale-105 blur-sm"
                    }`}
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge tone="gold">{item.tipo}</Badge>
                  <h3 className="mt-3 font-display text-base font-semibold text-white">{item.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{item.descripcion}</p>
                  <p className="mt-3 text-xs text-white/40">{item.duracion}</p>
                  {puedeAbrir && item.interactivoHref && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-400">
                      Abrir
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </Reveal>
            );

            if (puedeAbrir && item.interactivoHref) {
              return (
                <Link key={item.id} to={item.interactivoHref}>
                  {card}
                </Link>
              );
            }
            return card;
          })}
        </div>
      </Container>
    </div>
  );
}
