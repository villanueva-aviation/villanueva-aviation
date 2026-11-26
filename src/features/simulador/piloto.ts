// Piloto automático del H135: modos laterales (HDG, NAV, APR) sobre la inclinación, verticales (ALT, VS, ALTA)
// sobre el colectivo, e IAS sobre el cabeceo. Tocar un eje desconecta ese eje. Los pedales siempre son del piloto.
import { difAngulo } from "../home/navGeo.ts";
import type { Ficha } from "./ficha.ts";
import { potenciaRequerida, sigma, type Estado, type Objetivos } from "./modelo.ts";
import type { Guia } from "./radios.ts";

export type ModoLat = "ATT" | "HDG" | "NAV" | "APR";
export type ModoVert = "ATT" | "ALT" | "VS" | "ALTA";
export type EstadoAp = {
  ap: boolean;
  lat: ModoLat;
  armado: "NAV" | "APR" | null;
  vert: ModoVert;
  ias: boolean;
  ref: { cabeceo: number; inclinacion: number; altFt: number };
  aviso: string | null;
};
export type Selecciones = { hdg: number; altSel: number; vsSel: number; iasSel: number }; // hdg magnético
export type Boton = "AP" | "HDG" | "NAV" | "APR" | "ALT" | "VS" | "IAS" | "ALTA";

export const AP_APAGADO: EstadoAp = { ap: false, lat: "ATT", armado: null, vert: "ATT", ias: false, ref: { cabeceo: 0, inclinacion: 0, altFt: 0 }, aviso: null };

const RAD = Math.PI / 180;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const CAPTURA = { NAV: 1.0, APR: 0.5 };
const GANANCIA_XTK = { NAV: 30, APR: 45 };

export function pulsar(ap: EstadoAp, boton: Boton, e: Estado, sel: Selecciones): EstadoAp {
  void sel;
  if (boton === "AP" && ap.ap) return { ...AP_APAGADO, aviso: "AP desconectado" };
  // Cualquier modo enciende el AP si estaba apagado.
  const base: EstadoAp = ap.ap
    ? { ...ap, aviso: null }
    : { ...AP_APAGADO, ap: true, ref: { cabeceo: e.cabeceo, inclinacion: e.inclinacion, altFt: e.altFt } };
  switch (boton) {
    case "AP":
      return base;
    case "HDG":
      return { ...base, lat: ap.ap && ap.lat === "HDG" ? "ATT" : "HDG" };
    case "NAV":
    case "APR":
      if (base.lat === boton || base.armado === boton) return { ...base, lat: base.lat === boton ? "HDG" : base.lat, armado: null };
      return { ...base, lat: base.lat === "NAV" || base.lat === "APR" ? "HDG" : base.lat, armado: boton };
    case "IAS":
      return { ...base, ias: !(ap.ap && ap.ias) };
    default: {
      const vert = ap.ap && ap.vert === boton ? "ATT" : boton;
      return { ...base, vert, ref: { ...base.ref, altFt: e.altFt } };
    }
  }
}

function inclinacionHacia(errorGrados: number, tas: number): number {
  const limite = Math.min(20, Math.atan((3 * tas) / 1091) / RAD);
  return clamp(1.5 * errorGrados, -limite, limite);
}

export function pilotar(
  ap: EstadoAp,
  e: Estado,
  sel: Selecciones,
  guia: Guia | null,
  manual: Objetivos,
  tocado: { lat: boolean; lon: boolean; col: boolean },
  f: Ficha,
  decl: number,
  dt: number,
): { ap: EstadoAp; objetivos: Objetivos } {
  void dt;
  if (!ap.ap) return { ap, objetivos: manual };
  let a = ap;

  // Tocar un eje lo desconecta.
  if (tocado.lat && (a.lat !== "ATT" || a.armado)) a = { ...a, lat: "ATT", armado: null, aviso: `${a.lat === "ATT" ? a.armado : a.lat} desconectado` };
  if (tocado.lon && a.ias) a = { ...a, ias: false, aviso: "IAS desconectado" };
  if (tocado.col && a.vert !== "ATT") a = { ...a, vert: "ATT", aviso: `${a.vert} desconectado` };

  // Armado → captura; sin guía → HDG.
  if ((a.armado || a.lat === "NAV" || a.lat === "APR") && !guia) a = { ...a, lat: "HDG", armado: null, aviso: "Sin señal" };
  if (a.armado && guia && Math.abs(guia.xtkNm) <= CAPTURA[a.armado]) a = { ...a, lat: a.armado, armado: null };

  const s = sigma(e.altFt);
  const tas = e.ias / Math.sqrt(s);

  let inclinacion = manual.inclinacion;
  if (a.lat === "HDG") inclinacion = inclinacionHacia(difAngulo(e.rumboV - decl, sel.hdg), tas);
  else if ((a.lat === "NAV" || a.lat === "APR") && guia) {
    const correccion = clamp(guia.xtkNm * GANANCIA_XTK[a.lat], -30, 30);
    inclinacion = inclinacionHacia(difAngulo(e.track, guia.curso + correccion), tas);
  }

  if (a.vert === "ALTA" && Math.abs(sel.altSel - e.altFt) <= 200) a = { ...a, vert: "ALT", ref: { ...a.ref, altFt: sel.altSel } };
  let colectivo = manual.colectivo;
  if (a.vert !== "ATT") {
    const vs =
      a.vert === "ALT" ? clamp(2 * (a.ref.altFt - e.altFt), -800, 800)
      : a.vert === "VS" ? sel.vsSel
      : Math.sign(sel.altSel - e.altFt) * Math.max(Math.abs(sel.vsSel), 500);
    colectivo = clamp((potenciaRequerida(f, e.ias) + vs / f.kVs) / s ** 1.2, 0, 1);
  }

  const cabeceo = a.ias
    ? clamp(5 - sel.iasSel / Math.sqrt(s) / 8 + 0.3 * (e.ias - sel.iasSel), -f.cabeceoMax, f.cabeceoArribaMax)
    : manual.cabeceo;

  return { ap: a, objetivos: { cabeceo, inclinacion, colectivo, pedales: manual.pedales } };
}
