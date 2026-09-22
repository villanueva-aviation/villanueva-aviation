import type { LucideIcon } from "lucide-react";
import { Award, Compass, Radio, Rocket, ShieldCheck, Target } from "lucide-react";

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  desbloqueado: boolean;
}

export interface Certificado {
  id: string;
  titulo: string;
  fecha: string | null;
  obtenido: boolean;
}

export const CADETE_BASE = {
  xpPorActividad: 40,
  xpPorNivel: 300,
  horasSimulador: 12.5,
};

export const LOGROS_BASE: Logro[] = [
  { id: "primer-vuelo", titulo: "Primer despegue", descripcion: "Completa tu primera lección.", icon: Rocket, desbloqueado: true },
  { id: "meteorologo", titulo: "Meteorólogo novato", descripcion: "Aprueba el examen de Meteorología.", icon: Compass, desbloqueado: false },
  { id: "comunicador", titulo: "Voz de la torre", descripcion: "Aprueba el examen de Comunicaciones.", icon: Radio, desbloqueado: false },
  { id: "piloto-vfr", titulo: "Ruta VFR completada", descripcion: "Completa todos los módulos de la ruta VFR.", icon: ShieldCheck, desbloqueado: false },
  { id: "francotirador", titulo: "Precisión de instrumentos", descripcion: "Obtén 100% en una evaluación teórica.", icon: Target, desbloqueado: false },
  { id: "cadete-destacado", titulo: "Cadete destacado", descripcion: "Alcanza el nivel 3 de formación.", icon: Award, desbloqueado: false },
];

export const CERTIFICADOS_BASE: Certificado[] = [
  { id: "fundamentos", titulo: "Certificado de la Academia: Fundamentos", fecha: null, obtenido: false },
  { id: "vfr", titulo: "Certificado de la Academia: Módulo VFR", fecha: null, obtenido: false },
  { id: "ifr", titulo: "Certificado de la Academia: Módulo IFR", fecha: null, obtenido: false },
];
