import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAMPO_PUNTO as C, puntoEn, type FaseMapa, type Grabacion, type Punto } from "./recorrido";

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
const entre = (ps: Punto[], a: number, b: number) => ps.filter((p) => p[C.t] >= a && p[C.t] <= b);

const numero = (n: number | string, color = ROJO) =>
  L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid #fff;color:#fff;font:700 12px system-ui;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.6)">${n}</div>`,
  });
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
  const tocar = useRef(alTocarError);
  tocar.current = alTocarError;

  useEffect(() => {
    const ps = grabacion.puntos;
    if (!contenedor.current || ps.length < 2) return;
    // En teléfono, arrastrar el mapa con un dedo impediría bajar por la página.
    const m = L.map(contenedor.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile, maxZoom: 18 });
    L.tileLayer(MOSAICO, { attribution: ATRIBUCION, maxZoom: 18 }).addTo(m);

    const z = grabacion.zona;
    if (z?.poligono) L.polygon(z.poligono, { color: ORO, weight: 1.5, fill: false, dashArray: "6 6" }).addTo(m);
    else if (z) L.circle([z.lat, z.lon], { radius: z.radioNm * 1852, color: ORO, weight: 1.5, fill: false, dashArray: "6 6" }).addTo(m);

    for (const f of grabacion.fases) {
      const tramo = entre(ps, f.inicio, f.fin);
      if (tramo.length > 1) L.polyline(tramo.map(latLng), ESTILO[f.fase]).addTo(m);
    }
    for (const e of grabacion.errores) {
      if (e.inicio === null) continue;
      const tramo = entre(ps, e.inicio, e.fin ?? e.inicio);
      if (tramo.length > 1) L.polyline(tramo.map(latLng), { color: ROJO, weight: 6, opacity: 0.9 }).addTo(m);
      const p = puntoEn(ps, e.inicio);
      if (p) L.marker(latLng(p), { icon: numero(e.n), zIndexOffset: 500 }).on("click", () => tocar.current(e.n)).addTo(m);
    }
    const a = grabacion.anulada;
    if (a) {
      const p = puntoEn(ps, a.t);
      if (p) L.marker(latLng(p), { icon: numero("✕"), zIndexOffset: 600 }).bindTooltip(a.motivo).addTo(m);
    }
    m.fitBounds(L.latLngBounds(ps.map(latLng)), { padding: [20, 20] });
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
    const ps = foco ? entre(grabacion.puntos, foco.inicio, foco.fin) : grabacion.puntos;
    if (ps.length) m.fitBounds(L.latLngBounds(ps.map(latLng)), { padding: [30, 30], maxZoom: 15 });
  }, [foco, grabacion]);

  return <div ref={contenedor} className="h-80 w-full overflow-hidden rounded-xl border border-white/10 bg-navy-950 sm:h-[28rem]" />;
}
