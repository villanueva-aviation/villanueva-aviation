import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { FOUNDER_EMAIL } from "../../lib/constants";
import { contarVuelosPendientes } from "../practica/vuelosPractica";
import { contarReservasPendientes } from "./reservas";

/** Conteo de pendientes por confirmar, para mostrar en el nav (desktop y móvil). */
export function usePendientesFundador() {
  const { user } = useAuth();
  const esFundador = user?.email === FOUNDER_EMAIL;
  const [vuelosPendientes, setVuelosPendientes] = useState(0);
  const [reservasPendientes, setReservasPendientes] = useState(0);

  useEffect(() => {
    if (!esFundador) return;
    contarVuelosPendientes().then(setVuelosPendientes);
    contarReservasPendientes().then(setReservasPendientes);
  }, [esFundador]);

  return { esFundador, vuelosPendientes, reservasPendientes, totalPendientes: vuelosPendientes + reservasPendientes };
}
