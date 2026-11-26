// El instructor IFR dentro del simulador web: elegir lección, pedir cuenta o Exclusivo, y la lección misma
// (la página del instructor de MSFS, que aquí lee las muestras del simulador).
import { lazy, memo, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { estadoLeccionWeb, LECCIONES_IFR } from "../instructor/lecciones";
import { usePremiumAccess } from "../payments/usePremiumAccess";
import { FOUNDER_EMAIL } from "../../lib/constants";
import { ROUTES } from "../../lib/routes";

const InstructorRepaso = lazy(() => import("../../pages/InstructorRepaso").then((m) => ({ default: m.InstructorRepaso })));
const CLAVE = "simulador-leccion";

function leccionInicial(param: string | null): number | null {
  const valida = (x: string | null) => {
    const n = Number(x);
    return LECCIONES_IFR.some((l) => l.numero === n && l.disponible) ? n : null;
  };
  if (param) return valida(param);
  try {
    return valida(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

/** memo: la cabina se vuelve a pintar 30 veces por segundo y la lección no tiene por qué. */
export const PanelInstructor = memo(function PanelInstructor({ enElAire, onCambiarLugar }: { enElAire: boolean; onCambiarLugar: () => void }) {
  const [params, setParams] = useSearchParams();
  const [n, setN] = useState(() => leccionInicial(params.get("leccion")));
  const { user, loading } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const acceso = { fundador: user?.email === FOUNDER_EMAIL, exclusivo: hasAccess };
  const leccion = LECCIONES_IFR.find((l) => l.numero === n) ?? null;
  const estado = leccion ? estadoLeccionWeb(leccion, acceso) : null;

  const elegir = (v: string) => {
    const x = v ? Number(v) : null;
    setN(x);
    // La URL sigue a la elección: el panel se vuelve a montar en cada vuelo y lee ?leccion= primero.
    setParams(
      (p) => {
        const q = new URLSearchParams(p);
        if (x) q.set("leccion", String(x));
        else q.delete("leccion");
        return q;
      },
      { replace: true },
    );
    try {
      if (x) localStorage.setItem(CLAVE, String(x));
      else localStorage.removeItem(CLAVE);
    } catch {
      /* sin almacenamiento: dura lo que la página */
    }
  };

  const enlace = "font-bold text-[#4cc9f0] underline";
  let contenido;
  if (!leccion) {
    contenido = <p className="text-[#9fb0c6]">Elige una lección: el instructor te da los ejercicios por voz, te califica y al final te explica tu vuelo con el mapa.</p>;
  } else if (loading) {
    contenido = <p className="text-[#9fb0c6]">Cargando…</p>;
  } else if (!user) {
    const desde = encodeURIComponent(`${ROUTES.simulador}?leccion=${leccion.numero}`);
    contenido = (
      <p>
        El instructor guarda tus intentos: <Link to={`${ROUTES.ingresar}?from=${desde}`} className={enlace}>inicia sesión</Link> para usarlo. La lección 1 es gratis.
      </p>
    );
  } else if (estado === "candado") {
    contenido = (
      <p>
        Esta lección es de Exclusivo. La lección 1 es gratis. <Link to={ROUTES.contenidoExclusivo} className={enlace}>Ver Exclusivo</Link>
      </p>
    );
  } else if (enElAire) {
    contenido = (
      <p>
        La lección empieza en tierra, en la plataforma.{" "}
        <button type="button" onClick={onCambiarLugar} className={enlace}>Elegir aeropuerto</button>
      </p>
    );
  } else {
    contenido = (
      <Suspense fallback={<p className="text-[#9fb0c6]">Cargando la lección…</p>}>
        <InstructorRepaso key={leccion.numero} programa="ifr" numero={String(leccion.numero)} />
      </Suspense>
    );
  }

  return (
    <div className="grid gap-2 text-sm text-[#c9d4e3]">
      <label className="flex items-center gap-2">
        <span className="text-[#7d8da3]">Lección IFR</span>
        <select value={n ?? ""} onChange={(ev) => elegir(ev.target.value)} className="min-w-0 flex-1 rounded-md border border-[#1f2b3d] bg-[#05090f] px-2 py-1.5">
          <option value="">Sin lección</option>
          {LECCIONES_IFR.map((l) => (
            <option key={l.numero} value={l.numero} disabled={!l.disponible}>
              {l.numero}. {l.nombre.es}
              {!l.disponible ? " (próximamente)" : l.numero === 1 ? " · gratis" : estadoLeccionWeb(l, acceso) === "candado" ? " · Exclusivo" : ""}
            </option>
          ))}
        </select>
      </label>
      {contenido}
    </div>
  );
});
