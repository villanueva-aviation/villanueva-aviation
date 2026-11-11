import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAMPO_PUNTO as C, marcasErrores, puntoEn, type FaseMapa, type Grabacion, type Punto } from "./recorrido";
import { destino, figuraEspera, puntosArco } from "./figurasMapa";
import { COLOR_SECTOR } from "../entrenador/EntrenadorEsperas";

// Esri World Imagery. Sin llave mientras solo entra el fundador; antes de abrir a cadetes va VITE_ARCGIS_KEY (spec 2026-11-10).
const LLAVE = import.meta.env.VITE_ARCGIS_KEY as string | undefined;
const MOSAICO = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}${LLAVE ? `?token=${LLAVE}` : ""}`;
const ATRIBUCION = "Imagen: Esri, Maxar, Earthstar Geographics";

const ESTILO: Record<FaseMapa, L.PolylineOptions> = {
  rodaje: { color: "#e6e8eb", weight: 2, dashArray: "4 6", opacity: 0.9 },
  despegue: { color: "#5aa9e6", weight: 3 },
  zona: { color: "#ffffff", weight: 3 },
  circuitos: { color: "#ffffff", weight: 3 },
  aterrizaje: { color: "#5fc27e", weight: 3 },
  "rodaje-regreso": { color: "#e6e8eb", weight: 2, dashArray: "4 6", opacity: 0.9 },
};
const ROJO = "#ff4d4d";
const ORO = "#d4af37";

const latLng = (p: Punto): L.LatLngTuple => [p[C.lat], p[C.lon]];
const etiqueta = (texto: string, color: string) =>
  L.divIcon({
    className: "",
    iconSize: [60, 18],
    iconAnchor: [30, 9],
    html: `<div style="text-align:center;font:700 11px system-ui;color:${color};text-shadow:0 0 3px #000,0 0 3px #000">${texto}</div>`,
  });
const hexagono = (ident: string) =>
  L.divIcon({
    className: "",
    iconSize: [44, 40],
    iconAnchor: [22, 12],
    html: `<svg width="24" height="24" viewBox="-12 -12 24 24" style="display:block;margin:0 auto;filter:drop-shadow(0 1px 2px #000)"><polygon points="10,0 5,8.7 -5,8.7 -10,0 -5,-8.7 5,-8.7" fill="none" stroke="${ORO}" stroke-width="2.5"/><circle r="2" fill="${ORO}"/></svg><div style="text-align:center;font:700 11px system-ui;color:${ORO};text-shadow:0 0 3px #000">${ident}</div>`,
  });
const entre = (ps: Punto[], a: number, b: number) => ps.filter((p) => p[C.t] >= a && p[C.t] <= b);

const numero = (n: number | string, color = ROJO) => {
  const ancho = 24 + Math.max(0, String(n).length - 1) * 7;
  return L.divIcon({
    className: "",
    iconSize: [ancho, 24],
    iconAnchor: [ancho / 2, 12],
    html: `<div style="width:${ancho}px;height:24px;border-radius:12px;background:${color};border:2px solid #fff;color:#fff;font:700 12px system-ui;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.6)">${n}</div>`,
  });
};
const avion = (rumbo: number) =>
  L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<svg width="30" height="30" viewBox="-12 -12 24 24" style="transform:rotate(${rumbo}deg);filter:drop-shadow(0 1px 2px #000)"><path d="M0,-10 L3,-2 L10,2 L3,2 L2,8 L5,10 L-5,10 L-2,8 L-3,2 L-10,2 L-3,-2 Z" fill="${ORO}" stroke="#000" stroke-width=".6"/></svg>`,
  });

/** El recorrido sobre la imagen satelital: color por fase, errores en rojo y numerados, el avión de la repetición. */
export function MapaVuelo({
  grabacion,
  cursorT,
  foco,
  alTocarError,
}: {
  grabacion: Grabacion;
  cursorT: number | null;
  foco: { inicio: number; fin: number } | null;
  alTocarError: (n: number) => void;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcaAvion = useRef<L.Marker | null>(null);
  const todo = useRef<L.LatLngBounds | null>(null);
  const tocar = useRef(alTocarError);
  tocar.current = alTocarError;

  useEffect(() => {
    const ps = grabacion.puntos;
    if (!contenedor.current || ps.length < 2) return;
    // En teléfono, arrastrar el mapa con un dedo impediría bajar por la página.
    const m = L.map(contenedor.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, maxZoom: 18, zoomSnap: 0.25 });
    L.tileLayer(MOSAICO, { attribution: ATRIBUCION, maxZoom: 18 }).addTo(m);

    const z = grabacion.zona;
    const estiloZona = { color: ORO, weight: 2, fill: false, dashArray: "6 6" };
    if (z?.poligono) L.polygon(z.poligono, estiloZona).addTo(m);
    else if (z) L.circle([z.lat, z.lon], { radius: z.radioNm * 1852, ...estiloZona }).addTo(m);

    // IFR: el VOR y el radial de cada intento, de la estación hacia afuera hasta 5 NM más allá de donde voló el avión.
    const v = grabacion.vor;
    const figurasExtra: L.LatLngTuple[] = [];
    if (v) {
      for (const rad of grabacion.radiales ?? []) {
        const i = grabacion.intentos.find((x) => x.n === rad.intento);
        const dmes = (i ? entre(ps, i.inicio, i.fin) : []).map((p) => p[C.dme]).filter((d): d is number => d !== undefined);
        const largo = (dmes.length ? Math.max(...dmes) : 10) + 5;
        const fin = destino(v.lat, v.lon, rad.radial + v.decl, largo);
        L.polyline([[v.lat, v.lon], fin], { color: "#ffffff", weight: 1.5, dashArray: "2 6", opacity: 0.85 }).addTo(m);
        L.marker(fin, { icon: etiqueta(`R-${String(rad.radial % 360 || 360).padStart(3, "0")}`, "#ffffff"), interactive: false }).addTo(m);
      }
      // Los arcos, punteados como los radiales; las esperas con sus sectores de entrada.
      for (const a of grabacion.arcos ?? []) {
        const ps = puntosArco(v, a.radioNm, a.desde, a.hasta, a.sentido, v.decl);
        L.polyline(ps, { color: "#ffffff", weight: 1.5, dashArray: "2 6", opacity: 0.85 }).addTo(m);
        L.marker(ps[Math.floor(ps.length / 2)], { icon: etiqueta(`${a.radioNm} NM`, "#ffffff"), interactive: false }).addTo(m);
        figurasExtra.push(...ps);
      }
      for (const es of grabacion.esperas ?? []) {
        const f = figuraEspera(v, es, v.decl);
        for (const s of f.sectores) L.polygon(s.poligono, { stroke: false, fillColor: COLOR_SECTOR[s.entrada], fillOpacity: 1, interactive: false }).addTo(m);
        L.polyline(f.pista, { color: "#ffffff", weight: 2, opacity: 0.9 }).addTo(m);
        figurasExtra.push(...f.pista, ...f.sectores.flatMap((s) => s.poligono));
      }
      L.marker([v.lat, v.lon], { icon: hexagono(v.ident), interactive: false, zIndexOffset: 400 }).addTo(m);
    }

    for (const f of grabacion.fases) {
      const tramo = entre(ps, f.inicio, f.fin);
      if (tramo.length > 1) L.polyline(tramo.map(latLng), ESTILO[f.fase]).addTo(m);
    }
    for (const e of grabacion.errores) {
      if (e.inicio === null) continue;
      const tramo = entre(ps, e.inicio, e.fin ?? e.inicio);
      if (tramo.length > 1) L.polyline(tramo.map(latLng), { color: ROJO, weight: 6, opacity: 0.9 }).addTo(m);
    }
    for (const { punto, ns } of marcasErrores(grabacion))
      L.marker(latLng(punto), { icon: numero(ns.join("·")), zIndexOffset: 500 }).on("click", () => tocar.current(ns[0])).addTo(m);
    const a = grabacion.anulada;
    if (a) {
      const p = puntoEn(ps, a.t);
      if (p) L.marker(latLng(p), { icon: numero("✕"), zIndexOffset: 600 }).bindTooltip(a.motivo).addTo(m);
    }
    // Todo el vuelo incluye la zona completa, para ver dónde quedaron las maniobras dentro de ella.
    todo.current = L.latLngBounds(ps.map(latLng));
    // El círculo aún no tiene mapa con vista, así que sus límites salen del centro y el radio.
    if (z) todo.current.extend(z.poligono ? L.latLngBounds(z.poligono) : L.latLng(z.lat, z.lon).toBounds(z.radioNm * 1852 * 2));
    if (v) todo.current.extend([v.lat, v.lon]);
    for (const p of figurasExtra) todo.current.extend(p);
    m.fitBounds(todo.current, { padding: [20, 20] });
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      marcaAvion.current = null;
    };
  }, [grabacion]);

  // El avión de la repetición.
  useEffect(() => {
    const m = mapa.current;
    if (!m || cursorT === null) return;
    const p = puntoEn(grabacion.puntos, cursorT);
    if (!p) return;
    if (!marcaAvion.current) marcaAvion.current = L.marker(latLng(p), { icon: avion(p[C.rumbo]), zIndexOffset: 1000, interactive: false }).addTo(m);
    else marcaAvion.current.setLatLng(latLng(p)).setIcon(avion(p[C.rumbo]));
  }, [cursorT, grabacion]);

  // Acercarse a la fase o al error elegido; sin foco, todo el vuelo.
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const ps = foco ? entre(grabacion.puntos, foco.inicio, foco.fin) : [];
    if (ps.length) m.fitBounds(L.latLngBounds(ps.map(latLng)), { padding: [30, 30], maxZoom: 15 });
    else if (!foco && todo.current) m.fitBounds(todo.current, { padding: [20, 20] });
  }, [foco, grabacion]);

  return <div ref={contenedor} className="h-80 w-full overflow-hidden rounded-xl border border-white/10 bg-navy-950 sm:h-[28rem]" />;
}
