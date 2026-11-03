import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, Download, Loader2 } from "lucide-react";
import { PageHero } from "../components/layout/PageHero";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { supabase } from "../lib/supabaseClient";
import { ROUTES } from "../lib/routes";

// Los .zip viven en el bucket privado simhub-exclusivo (migración 0021); se arman con simhub-sixpack/paquetes.py.
const DASHES = [
  {
    archivo: "villanueva-simhub-v35b.zip",
    nombre: "Beechcraft V35B Bonanza",
    requiere: "V35B Bonanza de Microsoft y Carenado (Marketplace de MSFS)",
    trae: "Coordinador, velocímetro, horizonte, altímetro, VOR, ADF, HSI y variómetro, más su página de motor.",
    imagen: "/images/simhub-v35b.jpg",
    checklist: "v35",
  },
  {
    archivo: "villanueva-simhub-a36tc.zip",
    nombre: "A36TC Bonanza",
    requiere: "Bonanza Professional de Black Square",
    trae: "HSI, RMI, radioaltímetro, VOR y DME, más una página de motor turbo en dos filas.",
    imagen: "/images/simhub-a36tc.jpg",
    checklist: "a36",
  },
  {
    archivo: "villanueva-simhub-c208.zip",
    nombre: "C208 Caravan",
    requiere: "Caravan Professional de Black Square (no el Grand Caravan EX de G1000 que trae MSFS)",
    trae: "HSI, RMI, radioaltímetro, VOR y DME, más el motor turbohélice: torque, hélice, ITT, Ng, aceite y combustible.",
    imagen: "/images/simhub-c208.jpg",
    checklist: "c208",
  },
  {
    archivo: "villanueva-simhub-arrow.zip",
    nombre: "Piper PA28R Arrow III",
    requiere: "PA28R Arrow III de Carenado",
    trae: "El panel como en la cabina: reloj, altímetro con tambores de presión, HSI, VOR y ADF, más su página de motor.",
    imagen: "/images/simhub-arrow.jpg",
    checklist: "arrow",
  },
  {
    archivo: "villanueva-simhub-seneca.zip",
    nombre: "Piper PA34 Seneca V",
    requiere: "PA34T Seneca V de Carenado",
    trae: "HSI, ADF y VOR, más una página con los dos motores: admisión, RPM, TIT, flujo, CHT y aceite.",
    imagen: "/images/simhub-seneca.jpg",
    checklist: "seneca",
  },
];

export function SimhubExclusivo() {
  const [descargando, setDescargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function descargar(archivo: string) {
    setDescargando(archivo);
    setError(null);
    const { data, error: fallo } = await supabase.storage.from("simhub-exclusivo").createSignedUrl(archivo, 60, { download: true });
    setDescargando(null);
    if (fallo || !data) {
      setError("No pudimos preparar la descarga. Intenta de nuevo en un momento; si sigue fallando, escríbenos.");
      return;
    }
    window.location.href = data.signedUrl;
  }

  return (
    <div>
      <PageHero
        eyebrow="Contenido Exclusivo · SimHub"
        title="Dashes de SimHub para tu pantalla extra"
        description="Los instrumentos de cinco aviones de MSFS 2020 redibujados para un monitor extra, con el valor exacto bajo cada uno y una página de motor."
      />
      <Container className="py-12 md:py-16">
        <div className="rounded-2xl border border-gold-500/25 bg-gold-500/[0.05] p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-white">Antes de descargar</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-white/70 marker:text-gold-400">
            <li>
              Necesitas <span className="font-semibold text-white">SimHub con licencia</span>: sin ella el dash no funciona como debe. La licencia se compra
              en la página de SimHub; no está incluida aquí.
            </li>
            <li>Microsoft Flight Simulator 2020 y el avión de cada dash; varios son add-ons de pago de otros estudios y no vienen incluidos.</li>
            <li>Una pantalla extra. Están diseñados para 1920×720; en otras medidas SimHub los escala.</li>
            <li>Cada .zip trae el instalador del plugin y un LEEME con los pasos. Si ya instalaste otro dash de Villanueva, vuelve a correr el instalador.</li>
          </ul>
          <p className="mt-3 text-sm text-white/55">
            ¿Vuelas el C152? Su dash es gratis en{" "}
            <Link to={ROUTES.descargas} className="text-gold-400 underline hover:text-gold-300">
              Descargas
            </Link>
            .
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {DASHES.map((d) => (
            <article key={d.archivo} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <img src={d.imagen} alt={`Panel de vuelo del dash ${d.nombre}`} width={1200} height={450} className="w-full bg-black" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-white">{d.nombre}</h3>
                <p className="mt-1 text-sm text-gold-400">Requiere: {d.requiere}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/65">{d.trae}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button onClick={() => descargar(d.archivo)} disabled={descargando !== null}>
                    {descargando === d.archivo ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Descargar ZIP
                  </Button>
                  <Link
                    to={ROUTES.checklistPremiumAvion(d.checklist)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-gold-400"
                  >
                    <ClipboardCheck size={15} /> Su checklist
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
