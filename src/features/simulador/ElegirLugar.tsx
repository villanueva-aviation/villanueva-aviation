// Elegir país, VOR o aeropuerto, empezar en la plataforma o en el aire, y el viento.
import { useEffect, useMemo, useState } from "react";
import { aNm, rumbo } from "../home/navGeo.ts";
import { GuiaControles } from "./Controles";
import { buscar, cargarPais, type AeropuertoSim, type DatosPais, type Pais, type Vor } from "./datos.ts";
import type { Viento } from "./modelo.ts";
import type { EnElAire } from "./bucle.ts";

const CLAVE = "simulador-pais";
const CLAVE_AIRE = "simulador-aire";

/** Dónde aparecer en el aire: radial (magnético), distancia y altitud; altitud null = 3,000 ft sobre el VOR. */
type Aire = { radial: number; distNm: number; altFt: number | null };
const AIRE_INICIAL: Aire = { radial: 180, distNm: 10, altFt: null };
function leerAire(): Aire {
  try {
    const a = JSON.parse(localStorage.getItem(CLAVE_AIRE) ?? "null") as Partial<Aire> | null;
    if (!a) return AIRE_INICIAL;
    return {
      radial: Number.isFinite(a.radial) ? Number(a.radial) : AIRE_INICIAL.radial,
      distNm: Number.isFinite(a.distNm) ? Number(a.distNm) : AIRE_INICIAL.distNm,
      altFt: Number.isFinite(a.altFt) ? Number(a.altFt) : null,
    };
  } catch {
    return AIRE_INICIAL;
  }
}
const cien = (ft: number) => Math.round(ft / 100) * 100;
/** La altitud a la que aparece sobre este VOR: la elegida, pero nunca a menos de 1,000 ft sobre la estación. */
const altitudSobre = (vor: Vor, a: Aire) => Math.max(cien(vor.elevFt + 1000), a.altFt ?? cien(vor.elevFt + 3000));
const radial3 = (r: number) => String(r % 360 || 360).padStart(3, "0");
const nombrePais = (() => {
  try {
    const d = new Intl.DisplayNames(["es"], { type: "region" });
    return (iso: string) => d.of(iso) ?? iso;
  } catch {
    return (iso: string) => iso;
  }
})();

export type Eleccion = {
  datos: DatosPais;
  lugar: { lat: number; lon: number; elevFt: number; rumboV: number };
  enElAire?: EnElAire;
  aeropuerto: AeropuertoSim | null;
  vorCercano: Vor | null;
  viento: Viento;
};

const distancia = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const p = aNm(a.lat, a.lon, b.lat, b.lon);
  return Math.hypot(p.x, p.y);
};
function masCercano<T extends { lat: number; lon: number }>(lista: T[], p: { lat: number; lon: number }): T | null {
  let mejor: T | null = null;
  for (const x of lista) if (!mejor || distancia(x, p) < distancia(mejor, p)) mejor = x;
  return mejor;
}
/** Rumbo de la primera pista (o 0 en un helipuerto). */
function rumboPista(a: AeropuertoSim): number {
  const p = a.pistas[0];
  if (!p) return 0;
  return rumbo(aNm(p.latA, p.lonA, a.lat, a.lon), aNm(p.latB, p.lonB, a.lat, a.lon));
}

export function ElegirLugar({ onElegir }: { onElegir: (e: Eleccion) => void }) {
  const [paises, setPaises] = useState<Pais[] | null>(null);
  const [iso, setIso] = useState(() => {
    try {
      return localStorage.getItem(CLAVE) || "MX";
    } catch {
      return "MX";
    }
  });
  const [datos, setDatos] = useState<{ iso: string; d: DatosPais } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [viento, setViento] = useState<Viento>({ dir: 0, kt: 0 });
  const [aire, setAireEstado] = useState<Aire>(leerAire);
  const setAire = (a: Aire) => {
    setAireEstado(a);
    try {
      localStorage.setItem(CLAVE_AIRE, JSON.stringify(a));
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  };

  useEffect(() => {
    fetch("/data/sim/paises.json")
      .then((r) => r.json())
      .then((p: Pais[]) => setPaises([...p].sort((a, b) => (a.iso === "MX" ? -1 : b.iso === "MX" ? 1 : nombrePais(a.iso).localeCompare(nombrePais(b.iso), "es")))))
      .catch(() => setError("No se pudo cargar la lista de países. Revisa tu conexión y recarga la página."));
  }, []);

  useEffect(() => {
    let vivo = true;
    try {
      localStorage.setItem(CLAVE, iso);
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
    cargarPais(iso)
      .then((d) => vivo && (setDatos({ iso, d }), setError(null)))
      .catch(() => vivo && setError("No se pudieron cargar los VOR de este país. Revisa tu conexión."));
    return () => {
      vivo = false;
    };
  }, [iso]);

  const d = datos?.iso === iso ? datos.d : null;
  const res = useMemo(() => (d ? buscar(d, q) : null), [d, q]);

  const enAire = (vor: Vor) => {
    if (!d) return;
    onElegir({ datos: d, lugar: { lat: vor.lat, lon: vor.lon, elevFt: vor.elevFt, rumboV: 0 }, enElAire: { vor, distNm: aire.distNm, altFt: altitudSobre(vor, aire), radial: aire.radial % 360 }, aeropuerto: masCercano(d.aeropuertos.filter((a) => !a.helipuerto), vor), vorCercano: vor, viento });
  };
  const enPlataforma = (a: AeropuertoSim) => {
    if (!d) return;
    onElegir({ datos: d, lugar: { lat: a.lat, lon: a.lon, elevFt: a.elevFt, rumboV: rumboPista(a) }, aeropuerto: a, vorCercano: masCercano(d.vors, a), viento });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 text-[#e6edf3]">
      <h1 className="font-display text-2xl font-bold">Simulador H135</h1>
      <p className="mt-1 text-sm text-[#9fb0c6]">Gratis y sin cuenta. Elige dónde volar: un VOR para empezar en el aire, o un aeropuerto o helipuerto para despegar.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_2fr]">
        <label className="grid gap-1 text-sm">
          <span className="text-[#7d8da3]">País</span>
          <select value={iso} onChange={(ev) => setIso(ev.target.value)} className="rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-2">
            {(paises ?? [{ iso, vors: 0 }]).map((p) => (
              <option key={p.iso} value={p.iso}>{nombrePais(p.iso)}{p.vors ? ` (${p.vors} VOR)` : ""}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-[#7d8da3]">Buscar VOR o aeropuerto</span>
          <input value={q} onChange={(ev) => setQ(ev.target.value)} placeholder="GDL, Guadalajara, MMGL, Burgos…" className="rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-2" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
        <label className="grid gap-1">
          <span className="text-[#7d8da3]">Viento de (°)</span>
          <input type="number" min={0} max={360} step={10} value={viento.dir} onChange={(ev) => setViento({ ...viento, dir: Number(ev.target.value) % 360 })} className="w-24 rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-1.5" />
        </label>
        <label className="grid gap-1">
          <span className="text-[#7d8da3]">Velocidad (kt)</span>
          <input type="number" min={0} max={60} step={5} value={viento.kt} onChange={(ev) => setViento({ ...viento, kt: Math.max(0, Math.min(60, Number(ev.target.value))) })} className="w-24 rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-1.5" />
        </label>
        <span className="pb-2 text-xs text-[#7d8da3]">{viento.kt === 0 ? "Calma" : `Viento ${String(viento.dir).padStart(3, "0")}/${viento.kt}`}</span>
      </div>

      {error && <p className="mt-4 rounded-md bg-[#3a1414] p-3 text-sm">{error}</p>}
      {!d && !error && <p className="mt-4 text-sm text-[#9fb0c6]">Cargando…</p>}

      {res && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section>
            <h2 className="mb-1 text-sm font-bold text-[#3ddc84]">VOR · empezar en el aire</h2>
            <div className="mb-2 grid grid-cols-3 gap-2 text-xs">
              <label className="grid gap-1">
                <span className="text-[#7d8da3]">Radial</span>
                <input type="number" min={1} max={360} step={10} value={aire.radial} onChange={(ev) => setAire({ ...aire, radial: Math.max(0, Math.min(360, Math.round(Number(ev.target.value) || 0))) })} className="w-full rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-1.5" />
              </label>
              <label className="grid gap-1">
                <span className="text-[#7d8da3]">Distancia (NM)</span>
                <input type="number" min={1} max={40} step={1} value={aire.distNm} onChange={(ev) => setAire({ ...aire, distNm: Math.max(1, Math.min(40, Number(ev.target.value) || 1)) })} className="w-full rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-1.5" />
              </label>
              <label className="grid gap-1">
                <span className="text-[#7d8da3]">Altitud (ft)</span>
                <input type="number" min={0} max={20000} step={500} value={aire.altFt ?? ""} placeholder="+3,000" onChange={(ev) => setAire({ ...aire, altFt: ev.target.value === "" ? null : Math.max(0, Math.min(20000, Number(ev.target.value) || 0)) })} className="w-full rounded-md border border-[#1f2b3d] bg-[#0a1220] px-2 py-1.5" />
              </label>
            </div>
            <p className="mb-2 text-xs text-[#7d8da3]">Apareces con rumbo hacia la estación y el CRS puesto. Sin altitud: 3,000 ft sobre el VOR.</p>
            <ul className="grid gap-1">
              {res.vors.map((v) => (
                <li key={v.ident + v.mhz}>
                  <button type="button" onClick={() => enAire(v)} className="w-full rounded-md border border-[#1f2b3d] bg-[#0a1220] px-3 py-2 text-left hover:border-[#3ddc84]">
                    <b className="font-display">{v.ident}</b> · {v.nombre}
                    <span className="block text-xs text-[#9fb0c6]">{v.mhz.toFixed(2)} MHz{v.dme ? " · DME" : ""} · R-{radial3(aire.radial)}, {aire.distNm} NM, {altitudSobre(v, aire).toLocaleString("es-MX")} ft</span>
                  </button>
                </li>
              ))}
              {!res.vors.length && <li className="text-xs text-[#7d8da3]">Ningún VOR coincide.</li>}
            </ul>
          </section>
          <section>
            <h2 className="mb-1 text-sm font-bold text-[#4cc9f0]">Aeropuerto o helipuerto · en la plataforma</h2>
            <ul className="grid gap-1">
              {res.aeropuertos.map((a) => (
                <li key={a.icao}>
                  <button type="button" onClick={() => enPlataforma(a)} className="w-full rounded-md border border-[#1f2b3d] bg-[#0a1220] px-3 py-2 text-left hover:border-[#4cc9f0]">
                    <b className="font-display">{a.icao}</b> · {a.nombre}
                    <span className="block text-xs text-[#9fb0c6]">
                      {a.helipuerto ? "Helipuerto" : `${a.pistas.length} pista${a.pistas.length === 1 ? "" : "s"}`} · {Math.round(a.elevFt).toLocaleString("es-MX")} ft
                      {a.com.length ? ` · ${a.com.slice(0, 2).map((c) => `${c.tipo} ${c.mhz.toFixed(3)}`).join(" · ")}` : ""}
                    </span>
                  </button>
                </li>
              ))}
              {!res.aeropuertos.length && <li className="text-xs text-[#7d8da3]">Ningún aeropuerto coincide.</li>}
            </ul>
          </section>
        </div>
      )}
      <div className="mt-6">
        <GuiaControles />
      </div>
      <p className="mt-4 text-xs text-[#7d8da3]">Solo para simulación. No sirve para navegación real.</p>
    </div>
  );
}
