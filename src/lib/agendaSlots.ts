function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Primera fecha agendable: hoy + 2 días, para dar margen de organización. */
export function fechaMinima(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return toDateInputValue(d);
}

export interface Horario {
  value: string;
  label: string;
}

function formatearHora(hora: number): string {
  const periodo = hora < 12 ? "AM" : "PM";
  const hora12 = hora % 12 === 0 ? 12 : hora % 12;
  return `${hora12}:00 ${periodo}`;
}

function generarSlots(desde: number, hasta: number): Horario[] {
  const slots: Horario[] = [];
  for (let h = desde; h < hasta; h++) {
    slots.push({ value: `${String(h).padStart(2, "0")}:00`, label: formatearHora(h) });
  }
  return slots;
}

/**
 * Horarios disponibles según el día de la semana de una fecha (YYYY-MM-DD):
 * Lunes a viernes 5pm-10pm, sábado y domingo 8am-10pm.
 */
export function horariosDisponibles(fecha: string): Horario[] {
  if (!fecha) return [];
  const diaSemana = new Date(`${fecha}T00:00:00`).getDay(); // 0=domingo, 6=sábado
  const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
  return esFinDeSemana ? generarSlots(8, 22) : generarSlots(17, 22);
}
