// Terreno 3D de la vista sintética: baja mosaicos Terrarium por anillos alrededor del helicóptero,
// los convierte en mallas y responde la altura del suelo. Coordenadas locales en metros:
// x al este, y arriba, z al sur (−norte), alrededor de un origen que se recentra cada 20 km.
import * as THREE from "three";
import type { AeropuertoSim } from "./datos.ts";
import { alrededor, anillos, limitesMosaico, metrosTerrarium, urlMosaico, type Calidad, type Mosaico } from "./mosaicos.ts";

const M_POR_FT = 0.3048;
const RAD = Math.PI / 180;
const MAX_MOSAICOS = 64;
const REINTENTO_MS = 60_000;
const RECENTRAR_M = 20_000;

type Pieza = { m: Mosaico; alturas: Float32Array | null; malla: THREE.Mesh | null; fallo: number; cargando: boolean };

const VERTEX = /* glsl */ `
  varying float vAlt;
  varying vec3 vNormal;
  varying float vDist;
  void main() {
    vAlt = position.y;
    vNormal = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAGMENT = /* glsl */ `
  uniform float altAvion;
  uniform float avisos;
  uniform vec3 niebla;
  uniform float densidad;
  varying float vAlt;
  varying vec3 vNormal;
  varying float vDist;
  void main() {
    vec3 c = vec3(0.24, 0.42, 0.20);
    c = mix(c, vec3(0.55, 0.48, 0.30), smoothstep(1200.0, 2200.0, vAlt));
    c = mix(c, vec3(0.50, 0.50, 0.50), smoothstep(2600.0, 3300.0, vAlt));
    c = mix(c, vec3(0.95, 0.95, 0.97), smoothstep(3800.0, 4300.0, vAlt));
    if (vAlt < 1.0) c = vec3(0.12, 0.25, 0.45);
    // Terreno cerca o por encima del helicóptero.
    if (avisos > 0.5) {
      if (vAlt > altAvion) c = mix(c, vec3(0.85, 0.10, 0.10), 0.75);
      else if (vAlt > altAvion - 304.8) c = mix(c, vec3(0.90, 0.75, 0.10), 0.6);
    }
    float luz = 0.35 + 0.65 * max(dot(normalize(vNormal), normalize(vec3(0.4, 0.8, 0.3))), 0.0);
    c *= luz;
    float f = 1.0 - exp(-pow(vDist * densidad, 2.0));
    gl_FragColor = vec4(mix(c, niebla, clamp(f, 0.0, 1.0)), 1.0);
  }
`;

export class Terreno {
  private escena: THREE.Scene;
  private grupo = new THREE.Group();
  private piezas = new Map<string, Pieza>();
  private materiales = new Map<number, THREE.ShaderMaterial>();
  readonly uniforms = {
    altAvion: { value: 0 },
    avisos: { value: 0 }, // 1 = colores de terreno cercano; apagados cerca del suelo (despegue y aterrizaje)
    niebla: { value: new THREE.Color(0.62, 0.74, 0.86) },
    densidad: { value: 1 / 120_000 },
  };
  private origen: { lat: number; lon: number } | null = null;
  private pistasGrupo: THREE.Group | null = null;
  private aeropuerto: AeropuertoSim | null = null;
  private plano: THREE.Mesh;

  constructor(escena: THREE.Scene) {
    this.escena = escena;
    escena.add(this.grupo);
    // Suelo plano de respaldo: se ve solo donde todavía no hay mosaico (o sin internet).
    this.plano = new THREE.Mesh(new THREE.PlaneGeometry(600_000, 600_000).rotateX(-Math.PI / 2), this.material(0));
    escena.add(this.plano);
  }

  private material(z: number): THREE.ShaderMaterial {
    let m = this.materiales.get(z);
    if (!m) {
      // Los anillos gruesos quedan "detrás" de los finos donde se enciman.
      m = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT, polygonOffset: true, polygonOffsetFactor: 14 - z, polygonOffsetUnits: (14 - z) * 4 });
      this.materiales.set(z, m);
    }
    return m;
  }

  private local(lat: number, lon: number): { x: number; z: number } {
    const o = this.origen!;
    return { x: (lon - o.lon) * 111_320 * Math.cos(o.lat * RAD), z: -(lat - o.lat) * 110_540 };
  }

  actualizar(lat: number, lon: number, altFt: number, calidad: Calidad): void {
    this.uniforms.altAvion.value = altFt * M_POR_FT;
    if (!this.origen) this.recentrar(lat, lon);
    else {
      const p = this.local(lat, lon);
      if (Math.hypot(p.x, p.z) > RECENTRAR_M) this.recentrar(lat, lon);
    }
    const quiero = new Set<string>();
    for (const a of anillos(calidad)) {
      for (const m of alrededor(lat, lon, a.z, a.radio)) {
        const k = `${m.z}/${m.x}/${m.y}/${a.segmentos}`;
        quiero.add(k);
        const p = this.piezas.get(k);
        if (p) {
          this.piezas.delete(k);
          this.piezas.set(k, p); // LRU: al final = usado hace poco
          if (!p.alturas && !p.cargando && Date.now() - p.fallo > REINTENTO_MS) void this.cargar(p, a.segmentos);
        } else {
          const nueva: Pieza = { m, alturas: null, malla: null, fallo: 0, cargando: false };
          this.piezas.set(k, nueva);
          void this.cargar(nueva, a.segmentos);
        }
      }
    }
    for (const [k, p] of this.piezas) if (p.malla) p.malla.visible = quiero.has(k);
    while (this.piezas.size > MAX_MOSAICOS) {
      const [k, p] = this.piezas.entries().next().value!;
      if (quiero.has(k)) break;
      this.quitar(k, p);
    }
    const debajo = this.alturaEn(lat, lon);
    this.plano.visible = debajo === null;
    this.uniforms.avisos.value = altFt - (debajo ?? this.aeropuerto?.elevFt ?? 0) > 500 ? 1 : 0;
    this.plano.position.y = (this.aeropuerto?.elevFt ?? 0) * M_POR_FT;
    const centro = this.local(lat, lon);
    this.plano.position.x = centro.x;
    this.plano.position.z = centro.z;
  }

  private recentrar(lat: number, lon: number) {
    this.origen = { lat, lon };
    for (const p of this.piezas.values()) if (p.malla) this.colocar(p.malla, p.m);
    if (this.aeropuerto) this.pistas(this.aeropuerto);
  }

  private colocar(malla: THREE.Mesh, m: Mosaico) {
    const l = limitesMosaico(m);
    const p = this.local(l.norte, l.oeste);
    malla.position.set(p.x, 0, p.z);
  }

  private async cargar(p: Pieza, segmentos: number) {
    p.cargando = true;
    try {
      const r = await fetch(urlMosaico(p.m));
      if (!r.ok) throw new Error(String(r.status));
      const bmp = await createImageBitmap(await r.blob());
      const lienzo = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = lienzo.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const px = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
      const alturas = new Float32Array(256 * 256);
      for (let i = 0; i < alturas.length; i++) alturas[i] = Math.max(0, metrosTerrarium(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]));
      p.alturas = alturas;
      p.malla = this.malla(p.m, alturas, segmentos);
      this.colocar(p.malla, p.m);
      this.grupo.add(p.malla);
    } catch {
      p.fallo = Date.now();
    } finally {
      p.cargando = false;
    }
  }

  private malla(m: Mosaico, alturas: Float32Array, s: number): THREE.Mesh {
    const l = limitesMosaico(m);
    const o = this.origen!;
    const ancho = (l.este - l.oeste) * 111_320 * Math.cos(o.lat * RAD);
    const pos = new Float32Array((s + 1) * (s + 1) * 3);
    let i = 0;
    for (let fila = 0; fila <= s; fila++) {
      // Mercator: las filas de píxeles van parejas en y de Mercator, no en latitud.
      const lat = limitesMosaico({ z: m.z + 8, x: 0, y: (m.y << 8) + (fila / s) * 256 }).norte;
      const zLocal = -(lat - l.norte) * 110_540;
      const py = Math.min(255, Math.round((fila / s) * 255));
      for (let col = 0; col <= s; col++) {
        const pxX = Math.min(255, Math.round((col / s) * 255));
        pos[i++] = (col / s) * ancho;
        pos[i++] = alturas[py * 256 + pxX];
        pos[i++] = zLocal;
      }
    }
    const idx: number[] = [];
    for (let f = 0; f < s; f++)
      for (let c = 0; c < s; c++) {
        const a = f * (s + 1) + c;
        idx.push(a, a + s + 1, a + 1, a + 1, a + s + 1, a + s + 2);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, this.material(m.z));
  }

  /** Altura del suelo en pies con el mosaico más fino que haya, o null si no hay ninguno cargado. */
  alturaEn(lat: number, lon: number): number | null {
    let mejor: { z: number; h: number } | null = null;
    for (const p of this.piezas.values()) {
      if (!p.alturas || (mejor && p.m.z <= mejor.z)) continue;
      const l = limitesMosaico(p.m);
      if (lon < l.oeste || lon >= l.este || lat > l.norte || lat <= l.sur) continue;
      const n = 2 ** p.m.z;
      const fx = (((lon + 180) / 360) * n - p.m.x) * 256;
      const latR = lat * RAD;
      const fy = (((1 - Math.log(Math.tan(latR) + 1 / Math.cos(latR)) / Math.PI) / 2) * n - p.m.y) * 256;
      const x = Math.min(254, Math.max(0, Math.floor(fx)));
      const y = Math.min(254, Math.max(0, Math.floor(fy)));
      const tx = fx - x;
      const ty = fy - y;
      const a = p.alturas;
      const h =
        (a[y * 256 + x] * (1 - tx) + a[y * 256 + x + 1] * tx) * (1 - ty) +
        (a[(y + 1) * 256 + x] * (1 - tx) + a[(y + 1) * 256 + x + 1] * tx) * ty;
      mejor = { z: p.m.z, h };
    }
    return mejor ? mejor.h / M_POR_FT : null;
  }

  /** Pistas del aeropuerto de salida como rectángulos grises a la elevación del aeropuerto. */
  pistas(aeropuerto: AeropuertoSim | null): void {
    this.aeropuerto = aeropuerto;
    if (this.pistasGrupo) {
      this.escena.remove(this.pistasGrupo);
      this.pistasGrupo.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      this.pistasGrupo = null;
    }
    if (!aeropuerto || !this.origen) return;
    const grupo = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: 0x555a60, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -16 });
    const y = aeropuerto.elevFt * M_POR_FT + 0.5;
    for (const p of aeropuerto.pistas) {
      const a = this.local(p.latA, p.lonA);
      const b = this.local(p.latB, p.lonB);
      const largo = Math.hypot(b.x - a.x, b.z - a.z);
      const ancho = Math.max(15, p.anchoFt * M_POR_FT);
      const malla = new THREE.Mesh(new THREE.PlaneGeometry(ancho, largo).rotateX(-Math.PI / 2), material);
      malla.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      malla.rotation.y = -Math.atan2(b.x - a.x, -(b.z - a.z));
      grupo.add(malla);
    }
    if (aeropuerto.helipuerto || !aeropuerto.pistas.length) {
      const c = this.local(aeropuerto.lat, aeropuerto.lon);
      const h = new THREE.Mesh(new THREE.CircleGeometry(12, 24).rotateX(-Math.PI / 2), material);
      h.position.set(c.x, y, c.z);
      grupo.add(h);
    }
    this.pistasGrupo = grupo;
    this.escena.add(grupo);
  }

  /** Posición de cámara en metros locales para un punto. */
  aLocal(lat: number, lon: number, altFt: number): THREE.Vector3 {
    if (!this.origen) this.recentrar(lat, lon);
    const p = this.local(lat, lon);
    return new THREE.Vector3(p.x, altFt * M_POR_FT, p.z);
  }

  private quitar(k: string, p: Pieza) {
    if (p.malla) {
      this.grupo.remove(p.malla);
      p.malla.geometry.dispose();
    }
    this.piezas.delete(k);
  }

  liberar(): void {
    for (const [k, p] of this.piezas) this.quitar(k, p);
    this.pistas(null);
    this.plano.geometry.dispose();
    for (const m of this.materiales.values()) m.dispose();
    this.escena.remove(this.grupo, this.plano);
  }
}
