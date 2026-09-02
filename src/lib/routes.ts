import { BookOpen, ClipboardCheck, Compass, Download, Home, Sparkles, UserCircle, Users, Waypoints } from "lucide-react";

export const ROUTES = {
  home: "/",
  academia: "/academia",
  academiaModulo: (slug: string) => `/academia/${slug}`,
  miFormacion: "/mi-formacion",
  tracker: "/tracker",
  evaluaciones: "/evaluaciones",
  contenidoExclusivo: "/contenido-exclusivo",
  descargas: "/descargas",
  checklistC172: "/checklist-c172",
  comunidad: "/comunidad",
  perfil: "/perfil",
  ingresar: "/ingresar",
} as const;

export const NAV_LINKS = [
  { label: "Inicio", to: ROUTES.home, icon: Home },
  { label: "Academia", to: ROUTES.academia, icon: BookOpen },
  { label: "Mi Formación", to: ROUTES.miFormacion, icon: Compass },
  { label: "Tracker", to: ROUTES.tracker, icon: Waypoints },
  { label: "Evaluaciones", to: ROUTES.evaluaciones, icon: ClipboardCheck },
  { label: "Contenido Exclusivo", to: ROUTES.contenidoExclusivo, icon: Sparkles },
  { label: "Descargas", to: ROUTES.descargas, icon: Download },
  { label: "Comunidad", to: ROUTES.comunidad, icon: Users },
];

export const CADET_TABS = [
  { label: "Mi Formación", to: ROUTES.miFormacion, icon: Compass },
  { label: "Tracker", to: ROUTES.tracker, icon: Waypoints },
  { label: "Evaluaciones", to: ROUTES.evaluaciones, icon: ClipboardCheck },
  { label: "Perfil", to: ROUTES.perfil, icon: UserCircle },
];
