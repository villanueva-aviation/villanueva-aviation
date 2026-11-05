import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { FOUNDER_EMAIL } from "../../lib/constants";
import { contarVuelosPendientes } from "../practica/vuelosPractica";
import { contarReservasPendientes } from "./reservas";
import { contarGraduadosPorReconocer } from "../progress/graduacionTeoria";
import { contarPorRevisar } from "../instructor/intentos";

/** Conteo de pendientes por confirmar, para mostrar en el nav (desktop y móvil). */
export function usePendientesFundador() {
  const { user } = useAuth();
  const esFundador = user?.email === FOUNDER_EMAIL;
  const [vuelosPendientes, setVuelosPendientes] = useState(0);
  const [reservasPendientes, setReservasPendientes] = useState(0);
  const [graduadosPendientes, setGraduadosPendientes] = useState(0);
  const [maniobrasPendientes, setManiobrasPendientes] = useState(0);

  useEffect(() => {
    if (!esFundador) return;
    contarVuelosPendientes().then(setVuelosPendientes);
    contarReservasPendientes().then(setReservasPendientes);
    contarGraduadosPorReconocer().then(setGraduadosPendientes);
    // Lanza si la tabla aún no existe (migración 0022 sin correr): se queda en 0.
    contarPorRevisar().then(setManiobrasPendientes, () => {});
  }, [esFundador]);

  return {
    esFundador,
    vuelosPendientes,
    reservasPendientes,
    graduadosPendientes,
    maniobrasPendientes,
    totalPendientes: vuelosPendientes + reservasPendientes + graduadosPendientes + maniobrasPendientes,
  };
}
