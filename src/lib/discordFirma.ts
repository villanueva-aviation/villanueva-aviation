// Verifica que una petición viene de Discord (firma Ed25519 de la clave pública de la aplicación).
const bytes = (hex: string) => Uint8Array.from(hex.match(/../g) ?? [], (b) => parseInt(b, 16));

// Discord reenvía interacciones viejas si respondes lento; una firma de hace más de 5 min no es válida.
const TOLERANCIA_S = 300;

export async function firmaValida(
  cuerpo: string,
  firmaHex: string | null,
  timestamp: string | null,
  publicKeyHex: string,
  ahoraS: number = Date.now() / 1000,
): Promise<boolean> {
  if (!firmaHex || !timestamp) return false;
  if (!/^[0-9a-f]{64}$/i.test(publicKeyHex) || !/^[0-9a-f]{128}$/i.test(firmaHex)) return false;
  if (!(Math.abs(ahoraS - Number(timestamp)) <= TOLERANCIA_S)) return false;

  const datos = new TextEncoder().encode(timestamp + cuerpo);
  // Cloudflare Workers acepta "Ed25519" (estándar) y, en versiones viejas, "NODE-ED25519".
  const algoritmos = [{ name: "Ed25519" }, { name: "NODE-ED25519", namedCurve: "NODE-ED25519" }] as unknown as Algorithm[];
  for (const alg of algoritmos) {
    try {
      const clave = await crypto.subtle.importKey("raw", bytes(publicKeyHex), alg, false, ["verify"]);
      return await crypto.subtle.verify(alg, clave, bytes(firmaHex), datos);
    } catch {
      // probar el siguiente nombre de algoritmo
    }
  }
  return false;
}
