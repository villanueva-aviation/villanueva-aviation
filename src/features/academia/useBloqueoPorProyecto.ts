import { useEffect, useState } from "react";
import { ACADEMIA_MODULOS } from "../../data/academia";
import { ACADEMIA_DESBLOQUEADA } from "../../lib/constants";
import { useAuth } from "../auth/AuthContext";
import { fetchMisReservasPorTema, temaProyectoFinal } from "../admin/reservas";

export interface BloqueoProyecto {
  moduloPrevioSlug: string;
  moduloPrevioTitulo: string;
  /** "sin-enviar" si nunca lo mandó; "rechazada" si el último envío fue rechazado. */
  motivo: "sin-enviar" | "rechazada";
  motivoRechazo: string | null;
}

/**
 * Bloquea lo evaluable de un módulo hasta que el cadete haya enviado (y no le
 * hayan rechazado) el proyecto final del módulo anterior. Un proyecto pendiente
 * de revisión NO bloquea. `undefined` = todavía cargando; `null` = sin bloqueo.
 */
export function useBloqueoPorProyecto(slug: string | undefined): BloqueoProyecto | null | undefined {
  const { user } = useAuth();
  const [bloqueo, setBloqueo] = useState<BloqueoProyecto | null | undefined>(undefined);

  useEffect(() => {
    const index = ACADEMIA_MODULOS.findIndex((m) => m.slug === slug);
    const previo = index > 0 ? ACADEMIA_MODULOS[index - 1] : null;
    const previoTieneProyecto = previo?.actividades.some((a) => a.tipo === "proyecto");

    if (!previo || !previoTieneProyecto || ACADEMIA_DESBLOQUEADA.includes(user?.email?.toLowerCase() ?? "")) {
      setBloqueo(null);
      return;
    }

    let cancelado = false;
    fetchMisReservasPorTema(temaProyectoFinal(previo.titulo)).then((entregas) => {
      if (cancelado) return;
      const ultima = entregas[0];
      if (!ultima) {
        setBloqueo({ moduloPrevioSlug: previo.slug, moduloPrevioTitulo: previo.titulo, motivo: "sin-enviar", motivoRechazo: null });
      } else if (ultima.estado === "rechazada") {
        setBloqueo({
          moduloPrevioSlug: previo.slug,
          moduloPrevioTitulo: previo.titulo,
          motivo: "rechazada",
          motivoRechazo: ultima.motivo_revision,
        });
      } else {
        setBloqueo(null);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [slug, user?.email]);

  return bloqueo;
}
