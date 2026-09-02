import type { PhraseologyElement } from "./AudioPhraseology";

export interface EvaluationResult {
  elemento: PhraseologyElement;
  dicho: boolean;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function evaluarRespuesta(
  transcript: string,
  elementos: PhraseologyElement[]
): EvaluationResult[] {
  const transcriptNormalizado = normalizar(transcript);
  return elementos.map((elemento) => ({
    elemento,
    dicho: elemento.palabrasClave.some((palabra) =>
      transcriptNormalizado.includes(normalizar(palabra))
    ),
  }));
}