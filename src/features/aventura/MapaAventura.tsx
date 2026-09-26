import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VueloAventura } from "./aventura";

const ORO = "#d4af37";

/** La ruta completa: una línea por vuelo y un punto por aeropuerto; el último destino, resaltado. */
export function MapaAventura({ vuelos }: { vuelos: VueloAventura[] }) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contenedor.current || vuelos.length === 0) return;
    // En teléfono, arrastrar el mapa con un dedo impediría bajar por la página.
    const mapa = L.map(contenedor.current, { scrollWheelZoom: false, dragging: !L.Browser.mobile });
    // ponytail: mosaicos públicos de OpenStreetMap, oscurecidos con CSS (.tiles-oscuros). Sirven para poco
    // tráfico; si la página crece, cambiar a un proveedor con llave (MapTiler, Stadia).
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 12,
      className: "tiles-oscuros",
    }).addTo(mapa);

    const puntos: L.LatLngTuple[] = [];
    const vistos = new Set<string>();
    const ultimo = vuelos[vuelos.length - 1];

    for (const v of vuelos) {
      const a: L.LatLngTuple = [v.origen_lat, v.origen_lon];
      const b: L.LatLngTuple = [v.destino_lat, v.destino_lon];
      L.polyline([a, b], { color: ORO, weight: 2, opacity: 0.75 }).addTo(mapa);
      for (const [icao, nombre, punto] of [
        [v.origen_icao, v.origen_nombre, a],
        [v.destino_icao, v.destino_nombre, b],
      ] as const) {
        puntos.push(punto);
        if (vistos.has(icao)) continue;
        vistos.add(icao);
        const actual = icao === ultimo.destino_icao;
        L.circleMarker(punto, {
          radius: actual ? 8 : 5,
          color: actual ? "#ffffff" : ORO,
          weight: actual ? 2 : 0,
          fillColor: ORO,
          fillOpacity: 1,
        })
          .bindTooltip(`${icao} · ${nombre}`)
          .addTo(mapa);
      }
    }

    mapa.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 7 });
    return () => {
      mapa.remove();
    };
  }, [vuelos]);

  return (
    <div
      ref={contenedor}
      role="img"
      aria-label="Mapa con la ruta y los aeropuertos visitados"
      className="h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-950 sm:h-[440px]"
    />
  );
}
