// Vista sintética 3D: cámara en el helicóptero sobre el terreno real. Se pinta con su propio
// requestAnimationFrame (sin re-render de React) y ajusta la calidad sola según los cuadros por segundo.
// Sin WebGL dibuja cielo y tierra planos.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { AeropuertoSim } from "./datos.ts";
import type { Estado } from "./modelo.ts";
import type { Calidad } from "./mosaicos.ts";
import { Terreno } from "./terreno.ts";

const RAD = Math.PI / 180;
const ORDEN: Calidad[] = ["baja", "media", "alta"];

const CIELO_VERTEX = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const CIELO_FRAGMENT = /* glsl */ `uniform vec3 niebla; varying vec3 vDir; void main(){
  float t = clamp(vDir.y, -0.1, 1.0);
  vec3 arriba = vec3(0.11, 0.30, 0.58);
  vec3 c = mix(niebla, arriba, smoothstep(0.0, 0.5, t));
  if (vDir.y < 0.0) c = mix(niebla, vec3(0.30, 0.28, 0.22), smoothstep(0.0, -0.1, vDir.y));
  gl_FragColor = vec4(c, 1.0); }`;

function hayWebgl(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function VistaSintetica(props: { leer: () => Estado; aeropuerto: AeropuertoSim | null; terrenoRef: { current: Terreno | null } }) {
  const caja = useRef<HTMLDivElement>(null);
  const [webgl] = useState(hayWebgl);
  const { leer, aeropuerto, terrenoRef } = props;

  useEffect(() => {
    const div = caja.current;
    if (!div || !webgl) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !matchMedia("(pointer: coarse)").matches
        // Sin profundidad logarítmica: los shaders propios y el polygonOffset de los anillos la necesitan lineal.
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    div.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(50, 16 / 9, 3, 500_000);
    camara.rotation.order = "YXZ";
    const terreno = new Terreno(escena);
    terrenoRef.current = terreno;
    const cielo = new THREE.Mesh(
      new THREE.SphereGeometry(400_000, 24, 12),
      new THREE.ShaderMaterial({ uniforms: { niebla: terreno.uniforms.niebla }, vertexShader: CIELO_VERTEX, fragmentShader: CIELO_FRAGMENT, side: THREE.BackSide, depthWrite: false }),
    );
    cielo.renderOrder = -1;
    escena.add(cielo);

    const ajustar = () => {
      const w = div.clientWidth;
      const h = div.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(ajustar);
    ro.observe(div);
    ajustar();

    let calidad: Calidad = matchMedia("(pointer: coarse)").matches ? "baja" : "media";
    let ventana = performance.now();
    let cuadros = 0;
    let rapidoDesde = 0;
    let ultimaCarga = 0;
    let id = 0;
    const cuadro = (t: number) => {
      id = requestAnimationFrame(cuadro);
      if (document.hidden) return;
      const e = leer();
      if (t - ultimaCarga > 250) {
        terreno.actualizar(e.lat, e.lon, e.altFt, calidad);
        ultimaCarga = t;
      }
      const p = terreno.aLocal(e.lat, e.lon, e.altFt + 6);
      camara.position.copy(p);
      cielo.position.copy(p);
      camara.rotation.set(e.cabeceo * RAD, -e.rumboV * RAD, -e.inclinacion * RAD);
      renderer.render(escena, camara);

      cuadros++;
      if (t - ventana >= 2000) {
        const fps = (cuadros * 1000) / (t - ventana);
        const i = ORDEN.indexOf(calidad);
        if (fps < 28 && i > 0) {
          calidad = ORDEN[i - 1];
          rapidoDesde = 0;
        } else if (fps > 55) {
          rapidoDesde ||= t;
          if (t - rapidoDesde >= 10_000 && i < 2) {
            calidad = ORDEN[i + 1];
            rapidoDesde = 0;
          }
        } else rapidoDesde = 0;
        (div.dataset as DOMStringMap).fps = fps.toFixed(0);
        div.dataset.calidad = calidad;
        ventana = t;
        cuadros = 0;
      }
    };
    id = requestAnimationFrame(cuadro);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
      terreno.liberar();
      terrenoRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [webgl, leer, terrenoRef]);

  useEffect(() => {
    terrenoRef.current?.pistas(aeropuerto);
  }, [aeropuerto, terrenoRef]);

  if (!webgl) return <HorizontePlano leer={leer} />;
  return <div ref={caja} className="absolute inset-0 bg-[#6f9fd0]" />;
}

/** Cielo y tierra planos para equipos sin WebGL. */
function HorizontePlano({ leer }: { leer: () => Estado }) {
  const g = useRef<SVGGElement>(null);
  useEffect(() => {
    let id = 0;
    const cuadro = () => {
      id = requestAnimationFrame(cuadro);
      const e = leer();
      g.current?.setAttribute("transform", `rotate(${-e.inclinacion} 300 150) translate(0 ${e.cabeceo * 6})`);
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [leer]);
  return (
    <svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <g ref={g}>
        <rect x="-600" y="-900" width="1800" height="1050" fill="#3a78c2" />
        <rect x="-600" y="150" width="1800" height="1050" fill="#7a5a32" />
        <line x1="-600" y1="150" x2="1200" y2="150" stroke="#fff" strokeWidth="2" />
      </g>
    </svg>
  );
}
