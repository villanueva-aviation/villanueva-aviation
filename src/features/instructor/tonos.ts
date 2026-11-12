// Notas cortas hechas en el navegador: dos suben al abrir una sección del checklist y bajan al cerrarla;
// una aguda confirma un punto hecho y una grave avisa uno que se venció sin hacerse.
const NOTAS = { abre: [660, 880], cierra: [880, 660], punto: [1320], falta: [220] } as const;
const NOTA_SEG = 0.12;
const PAUSA_SEG = 0.04;
const VOLUMEN = 0.15;

let ctx: AudioContext | null = null;
/** Cuándo termina lo último que se programó: lo nuevo va después, sin encimarse. */
let libre = 0;

export function sonarTonos(tonos: (keyof typeof NOTAS)[]) {
  if (!tonos.length || typeof AudioContext === "undefined") return;
  ctx ??= new AudioContext();
  void ctx.resume();
  let t = Math.max(ctx.currentTime + 0.02, libre);
  for (const tono of tonos) {
    for (const hz of NOTAS[tono]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = hz;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(VOLUMEN, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + NOTA_SEG);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + NOTA_SEG);
      t += NOTA_SEG + PAUSA_SEG;
    }
    t += 0.15;
  }
  libre = t;
}
