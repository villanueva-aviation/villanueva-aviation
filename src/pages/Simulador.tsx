// /simulador: H135 en el navegador, gratis y sin cuenta. Cabina de laptop (vista 3D + PFD arriba, HSI abajo,
// paneles a la derecha) y de celular (vista 3D, HSI, palancas táctiles y pestañas).
import { memo, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../lib/routes";
import { GuiaControles, PalancasTactiles, PosicionMandos } from "../features/simulador/Controles";
import { useControles } from "../features/simulador/useControles";
import { ElegirLugar, type Eleccion } from "../features/simulador/ElegirLugar";
import { HsiSim } from "../features/simulador/HsiSim";
import { Navegador } from "../features/simulador/Navegador";
import { PanelAp } from "../features/simulador/PanelAp";
import { Pfd } from "../features/simulador/Pfd";
import { pulsar } from "../features/simulador/piloto.ts";
import { alternarMotor } from "../features/simulador/bucle.ts";
import { PanelRadios } from "../features/simulador/PanelRadios";
import { guiaGps, nombreCom, recibirNav } from "../features/simulador/radios.ts";
import type { Terreno } from "../features/simulador/terreno.ts";
import { useSimulador, type Arranque } from "../features/simulador/useSimulador";
import { VistaSintetica } from "../features/simulador/VistaSintetica";
import { aNm, rumbo } from "../features/home/navGeo.ts";

const Vista3D = memo(VistaSintetica);
const tactil = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

function arranqueDe(el: Eleccion): Arranque {
  const decl = el.vorCercano?.decl ?? 0;
  return {
    args: [el.lugar, el.enElAire],
    decl,
    respaldoFt: el.enElAire ? el.enElAire.vor.elevFt : el.lugar.elevFt,
    ajustar: (s) => {
      const nav = el.vorCercano?.mhz ?? s.radios.nav1[0];
      const com = el.aeropuerto?.com.find((c) => /TWR|TOWER/i.test(c.tipo))?.mhz ?? el.aeropuerto?.com[0]?.mhz ?? s.radios.com1[0];
      // CRS inicial: hacia el VOR (en el aire) o el rumbo de la pista.
      const obs = Math.round((s.e.rumboV - decl + 360) % 360) || 360;
      return { ...s, viento: el.viento, radios: { ...s.radios, nav1: [nav, s.radios.nav1[1]], com1: [com, 121.5], obs }, sel: { ...s.sel, hdg: obs } };
    },
  };
}

export function Simulador() {
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const arranque = useMemo(() => (eleccion ? arranqueDe(eleccion) : null), [eleccion]);
  const terrenoRef = useRef<Terreno | null>(null);
  const { sim, leerEstado, accion, teclas } = useSimulador(eleccion?.datos ?? null, arranque, terrenoRef);
  const vista = useRef<HTMLDivElement>(null);
  const { capturado, capturar } = useControles(teclas, accion, vista);
  const [pestana, setPestana] = useState<"ap" | "radios" | "mapa">("ap");
  const [verMapa, setVerMapa] = useState(() => {
    try {
      return localStorage.getItem("simulador-mapa") !== "0";
    } catch {
      return true;
    }
  });
  const cambiarMapa = () => {
    setVerMapa(!verMapa);
    try {
      localStorage.setItem("simulador-mapa", verMapa ? "0" : "1");
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  };

  if (!eleccion || !sim || !arranque) {
    return (
      <div className="min-h-screen bg-[#05090f]">
        <Encabezado />
        <ElegirLugar onElegir={setEleccion} />
      </div>
    );
  }

  const datos = eleccion.datos;
  const decl = arranque.decl;
  const e = sim.e;
  const nav1 = recibirNav(sim.radios.nav1[0], sim.radios.obs, e, datos.vors);
  const nav2 = recibirNav(sim.radios.nav2[0], 0, e, datos.vors);
  const gps = sim.gps ? { ident: sim.gps.ident, guia: guiaGps(e, sim.gps, sim.gps.curso) } : null;

  const recibido = {
    com1: nombreCom(sim.radios.com1[0], datos.aeropuertos, e),
    nav1: nav1 ? `${nav1.vor.ident} · ${nav1.vor.nombre}` : null,
    nav2: nav2 ? `${nav2.vor.ident} · ${nav2.vor.nombre}` : null,
  };
  const onDirecto = (d: { lat: number; lon: number; ident: string } | null) =>
    accion((s) => ({
      ...s,
      gps: d && { ...d, curso: rumbo(aNm(s.e.lat, s.e.lon, d.lat, d.lon), { x: 0, y: 0 }) },
      fuente: d ? "gps" : "vor",
    }));

  const panelAp = (
    <PanelAp
      ap={sim.ap}
      sel={sim.sel}
      onPulsar={(b) => accion((s) => ({ ...s, ap: pulsar(s.ap, b, s.e, s.sel) }))}
      onSel={(p) => accion((s) => ({ ...s, sel: { ...s.sel, ...p } }))}
      onSyncHdg={() => accion((s) => ({ ...s, sel: { ...s.sel, hdg: Math.round((s.e.rumboV - decl + 360) % 360) || 360 } }))}
    />
  );
  const radios = (
    <PanelRadios
      radios={sim.radios}
      recibido={recibido}
      onCambio={(r) => accion((s) => ({ ...s, radios: { ...s.radios, ...r } }))}
      onSyncCrs={() => nav1 && accion((s) => ({ ...s, radios: { ...s.radios, obs: Math.round(nav1.desde ? nav1.radial : (nav1.radial + 180) % 360) || 360 } }))}
    />
  );
  const mapa = <Navegador e={e} datos={datos} nav1={nav1} obs={sim.radios.obs} gps={sim.gps} onDirecto={onDirecto} />;
  const hsi = (
    <HsiSim e={e} decl={decl} fuente={sim.fuente} crs={sim.radios.obs} hdg={sim.sel.hdg} nav1={nav1} nav2={nav2} gps={gps} viento={sim.viento} onFuente={() => accion((s) => ({ ...s, fuente: s.fuente === "vor" ? "gps" : "vor" }))} />
  );
  const botones = (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => accion((s) => ({ ...s, pausa: !s.pausa }))} className="rounded-md bg-[#16233a] px-3 py-1.5 text-sm font-bold text-white">
        {sim.pausa ? "Seguir" : "Pausa"}
      </button>
      <button
        type="button"
        onClick={() => accion(alternarMotor)}
        disabled={!e.enTierra}
        title={e.enTierra ? undefined : "Solo en tierra"}
        className="rounded-md bg-[#16233a] px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40"
      >
        {sim.motor ? "Apagar motor" : "Encender motor"}
      </button>
      <button type="button" onClick={() => setEleccion({ ...eleccion })} className="rounded-md bg-[#16233a] px-3 py-1.5 text-sm font-bold text-white">Reiniciar</button>
      <button type="button" onClick={() => setEleccion(null)} className="rounded-md bg-[#16233a] px-3 py-1.5 text-sm text-white">Cambiar lugar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05090f] text-[#e6edf3]">
      <Encabezado />
      <div className="mx-auto grid max-w-[1400px] gap-3 px-4 pb-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="grid content-start gap-2">
          <div
            ref={vista}
            onClick={() => !tactil && !capturado && capturar()}
            onContextMenu={(ev) => ev.preventDefault()}
            className={`relative aspect-video w-full overflow-hidden rounded-lg lg:mx-auto lg:max-w-[calc(54vh*16/9)] border-4 border-[#1a1f27] bg-black ${tactil ? "" : "cursor-crosshair"}`}
          >
            <Vista3D leer={leerEstado} aeropuerto={eleccion.aeropuerto} terrenoRef={terrenoRef} />
            <Pfd e={e} ap={sim.ap} sel={sim.sel} decl={decl} />
            {!tactil && !capturado && (
              <span className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs">Clic aquí para volar con el ratón · teclado siempre activo</span>
            )}
            {sim.pausa && <span className="absolute inset-0 grid place-items-center bg-black/40 font-display text-xl font-bold">En pausa</span>}
          </div>
          <div className="aspect-[600/340] overflow-hidden rounded-lg border-4 border-[#1a1f27] bg-black lg:aspect-auto lg:h-[36vh]">{hsi}</div>
          {tactil && <PalancasTactiles sim={sim} accion={accion} teclas={teclas} />}
          {botones}
        </div>

        {/* Laptop: todo a la derecha. Celular: pestañas. */}
        <div className="hidden content-start gap-2 lg:grid">
          <PosicionMandos m={sim.mandos} />
          {panelAp}
          <button type="button" onClick={cambiarMapa} aria-expanded={verMapa} className="flex items-center justify-between rounded-md border border-[#1f2b3d] bg-[#0a1220] px-3 py-1.5 text-xs font-bold text-white hover:border-[#4cc9f0]">
            <span>Mapa de navegación</span>
            <span className="text-[#4cc9f0]">{verMapa ? "Ocultar ▲" : "Mostrar ▼"}</span>
          </button>
          {verMapa && mapa}
          {radios}
        </div>
        <div className="grid gap-2 lg:hidden">
          {/* En celular las palancas táctiles ya muestran dónde va cada mando. */}
          {!tactil && <PosicionMandos m={sim.mandos} />}
          <div className="grid grid-cols-3 gap-1" role="tablist">
            {(["ap", "radios", "mapa"] as const).map((p) => (
              <button key={p} role="tab" aria-selected={pestana === p} type="button" onClick={() => setPestana(p)} className={`rounded-md px-2 py-1.5 text-sm font-bold ${pestana === p ? "bg-[#24365a] text-white" : "bg-[#0a1220] text-[#9fb0c6]"}`}>
                {p === "ap" ? "Piloto automático" : p === "radios" ? "Radios" : "Mapa"}
              </button>
            ))}
          </div>
          {pestana === "ap" ? panelAp : pestana === "radios" ? radios : mapa}
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-4 pb-4">
        <GuiaControles />
      </div>
      <footer className="px-4 pb-6 text-center text-[11px] text-[#7d8da3]">
        Solo para simulación · Elevación: Mapzen/AWS Terrain Tiles · Navegación: OurAirports
      </footer>
    </div>
  );
}

function Encabezado() {
  return (
    <header className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">
      <Link to={ROUTES.home} className="font-display text-sm font-bold text-white">Villanueva Aviation</Link>
      <span className="text-xs text-[#9fb0c6]">Simulador H135 · gratis</span>
    </header>
  );
}
