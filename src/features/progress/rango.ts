import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useProgress } from "./ProgressContext";
import { fetchMisVuelos } from "../practica/vuelosPractica";
import { MANIOBRAS_VUELO } from "../../data/practicaVuelo";

export function calcularRango(input: {
  progresoGeneralPct: number;
  vuelosRegistrados: number;
  vuelosConfirmados: number;
}): string {
  const { progresoGeneralPct, vuelosRegistrados, vuelosConfirmados } = input;
  if (vuelosConfirmados >= MANIOBRAS_VUELO.length) return "Piloto de Monomotor";
  if (vuelosRegistrados > 0) return "Piloto en Práctica";
  if (progresoGeneralPct === 100) return "Piloto en Formación Teórica";
  return "Cadete";
}

/** Rango calculado del cadete a partir de su progreso teórico y su bitácora de práctica. */
export function useRango(): string {
  const { user } = useAuth();
  const { progresoGeneralPct } = useProgress();
  const [vuelosRegistrados, setVuelosRegistrados] = useState(0);
  const [vuelosConfirmados, setVuelosConfirmados] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchMisVuelos(user.id).then((vuelos) => {
      const confirmados = new Set(vuelos.filter((v) => v.estado === "confirmado").map((v) => v.maniobra_id));
      setVuelosRegistrados(vuelos.length);
      setVuelosConfirmados(confirmados.size);
    });
  }, [user]);

  return calcularRango({ progresoGeneralPct, vuelosRegistrados, vuelosConfirmados });
}
