// Motor de audio del ATIS: une las piezas MP3 en un solo buffer y lo toca en loop con sonido de radio VHF.
// Nada de globals del navegador a nivel de módulo: los tests de node importan pausaTras de aquí.
import type { AeropuertoAtis } from "./datos.ts";
import { textoDePieza, type Pieza } from "./frases.ts";
import type { Atis } from "./generado.ts";
import type { Mezcla } from "./radio.ts";

const PAUSA_ENTRE_IDIOMAS_SEG = 1.2;
const COLA_SEG = 2; // silencio al final: la pausa entre repeticiones del loop
const FUNDIDO_SEG = 0.005; // 5 ms de fundido lineal en cada unión
const UMBRAL_RECORTE = 10 ** (-45 / 20); // −45 dBFS
const TREMOLO_HZ = 0.4;
const RAMPA_SEG = 0.2;
const CLIC_SEG = 0.03;
const VOLUMEN_CLIC = 0.25; // ponytail: a ojo, ajustar al oído en Task 7

// Pausa tras una pieza según la puntuación final de su texto hablado.
export function pausaTras(textoHablado: string): number {
  const fin = textoHablado.trimEnd().slice(-1);
  return fin === "." ? 0.45 : fin === "," ? 0.22 : 0.06;
}

// Caché de la sesión: url → muestras mono ya recortadas (null = falló; no se guarda, se reintenta).
const cache = new Map<string, Promise<Float32Array | null>>();

const urlDe = (p: Pieza) => `/atis/piezas/${p.idioma}/${encodeURIComponent(p.clave)}.mp3`;

async function cargarPieza(ctx: AudioContext, url: string): Promise<Float32Array | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const audio = await ctx.decodeAudioData(await r.arrayBuffer());
    // Mezcla a mono.
    const mono = new Float32Array(audio.length);
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const canal = audio.getChannelData(c);
      for (let i = 0; i < mono.length; i++) mono[i] += canal[i] / audio.numberOfChannels;
    }
    // Recorta el silencio de las orillas.
    let ini = 0;
    let fin = mono.length;
    while (ini < fin && Math.abs(mono[ini]) < UMBRAL_RECORTE) ini++;
    while (fin > ini && Math.abs(mono[fin - 1]) < UMBRAL_RECORTE) fin--;
    return mono.slice(ini, fin);
  } catch {
    return null;
  }
}

function piezaEnCache(ctx: AudioContext, url: string): Promise<Float32Array | null> {
  let p = cache.get(url);
  if (!p) {
    p = cargarPieza(ctx, url).then((m) => {
      if (!m) cache.delete(url);
      return m;
    });
    cache.set(url, p);
  }
  return p;
}

export async function cargarAudio(ctx: AudioContext, atis: Atis, aeropuertos: AeropuertoAtis[]): Promise<{ buffer: AudioBuffer; faltantes: string[] }> {
  const piezas = atis.partes.filter((p) => !p.soloTexto).flatMap((p) => p.piezas);
  const datos = await Promise.all(piezas.map((p) => piezaEnCache(ctx, urlDe(p))));
  const sr = ctx.sampleRate;
  const faltantes: string[] = [];

  // Cada pieza presente con el silencio que va después de ella.
  const tramos: { muestras: Float32Array; pausa: number }[] = [];
  piezas.forEach((p, i) => {
    const m = datos[i];
    if (!m) {
      if (!faltantes.includes(p.clave)) faltantes.push(p.clave);
      return;
    }
    const sig = piezas.slice(i + 1).find((_, j) => datos[i + 1 + j]); // siguiente pieza que sí suena
    const pausa = sig && sig.idioma !== p.idioma ? PAUSA_ENTRE_IDIOMAS_SEG : pausaTras(textoDePieza(p, aeropuertos) ?? "");
    tramos.push({ muestras: m, pausa });
  });

  const total = tramos.reduce((s, t) => s + t.muestras.length + Math.round(t.pausa * sr), 0) + Math.round(COLA_SEG * sr);
  const buffer = ctx.createBuffer(1, total, sr);
  const salida = buffer.getChannelData(0);
  const nFundido = Math.round(FUNDIDO_SEG * sr);
  let pos = 0;
  for (const { muestras, pausa } of tramos) {
    // Cada unión es pieza ↔ silencio, así que el fundido cruzado de 5 ms queda en entrada y salida de la pieza.
    const n = Math.min(nFundido, Math.floor(muestras.length / 2));
    for (let i = 0; i < muestras.length; i++) {
      const g = Math.min(1, i < n ? i / n : 1, muestras.length - 1 - i < n ? (muestras.length - 1 - i) / n : 1);
      salida[pos + i] = muestras[i] * g;
    }
    pos += muestras.length + Math.round(pausa * sr);
  }
  return { buffer, faltantes };
}

// Ruido rosa (filtro de Paul Kellet) en un buffer de 4 s para loop.
function ruidoRosa(ctx: AudioContext): AudioBuffer {
  const buf = ctx.createBuffer(1, 4 * ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

function filtro(ctx: AudioContext, type: BiquadFilterType, hz: number): BiquadFilterNode {
  return new BiquadFilterNode(ctx, { type, frequency: hz });
}

// Encadena nodos en orden y devuelve el último.
function cadena(...nodos: AudioNode[]): AudioNode {
  nodos.reduce((a, b) => a.connect(b));
  return nodos[nodos.length - 1];
}

export class RadioAtis {
  private ctx: AudioContext;
  private entrada: AudioNode;
  private voz: GainNode;
  private tremolo: GainNode;
  private profundidad: GainNode;
  private ruido: GainNode;
  private fuente: AudioBufferSourceNode | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    // Voz: 2× pasa-altos 300, 2× pasa-bajos 3000, compresor, makeup ×2, tanh, voz, trémolo.
    this.entrada = filtro(ctx, "highpass", 300);
    const compresor = new DynamicsCompressorNode(ctx, { threshold: -24, ratio: 8, attack: 0.003, release: 0.06, knee: 0 });
    const tanh = new WaveShaperNode(ctx, {
      curve: Float32Array.from({ length: 1024 }, (_, i) => Math.tanh((i / 1023) * 2 - 1)),
    });
    this.voz = new GainNode(ctx, { gain: 0 });
    this.tremolo = new GainNode(ctx, { gain: 1 });
    cadena(this.entrada, filtro(ctx, "highpass", 300), filtro(ctx, "lowpass", 3000), filtro(ctx, "lowpass", 3000),
      compresor, new GainNode(ctx, { gain: 2 }), tanh, this.voz, this.tremolo, ctx.destination);

    // LFO de 0.4 Hz sumado a la ganancia base del trémolo.
    this.profundidad = new GainNode(ctx, { gain: 0 });
    const lfo = new OscillatorNode(ctx, { frequency: TREMOLO_HZ });
    cadena(lfo, this.profundidad).connect(this.tremolo.gain);
    lfo.start();

    // Estática: ruido rosa en loop, pasa-altos 400, pasa-bajos 4000.
    this.ruido = new GainNode(ctx, { gain: 0 });
    const estatica = new AudioBufferSourceNode(ctx, { buffer: ruidoRosa(ctx), loop: true });
    cadena(estatica, filtro(ctx, "highpass", 400), filtro(ctx, "lowpass", 4000), this.ruido, ctx.destination);
    estatica.start();
  }

  // El buffer ya trae los 2 s de cola, así que el loop simple deja la pausa entre repeticiones.
  reproducir(buffer: AudioBuffer, offsetSeg: number): void {
    this.fuente?.stop();
    this.fuente = new AudioBufferSourceNode(this.ctx, { buffer, loop: true });
    this.fuente.connect(this.entrada);
    this.fuente.start(0, offsetSeg % buffer.duration);
  }

  private rampa(param: AudioParam, valor: number): void {
    const t = this.ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(valor, t + RAMPA_SEG);
  }

  ajustar(m: Mezcla): void {
    this.rampa(this.voz.gain, m.voz);
    this.rampa(this.ruido.gain, m.ruido);
    this.rampa(this.profundidad.gain, m.tremolo / 2);
    this.rampa(this.tremolo.gain, 1 - m.tremolo / 2);
  }

  // Golpe de ruido de 30 ms al sintonizar.
  clic(): void {
    const n = Math.round(CLIC_SEG * this.ctx.sampleRate);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * VOLUMEN_CLIC * (1 - i / n);
    const s = new AudioBufferSourceNode(this.ctx, { buffer: buf });
    s.connect(this.ctx.destination);
    s.start();
  }

  detener(): void {
    this.rampa(this.voz.gain, 0);
    this.rampa(this.ruido.gain, 0);
    this.fuente?.stop(this.ctx.currentTime + RAMPA_SEG);
    this.fuente = null;
  }
}
