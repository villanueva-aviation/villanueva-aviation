import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Send } from "lucide-react";
import { MANIOBRAS_VUELO } from "../../data/practicaVuelo";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useAuth } from "../auth/AuthContext";
import { fetchMisVuelos, registrarVuelo, type RedVuelo, type VueloPractica } from "./vuelosPractica";

interface RegistroInput {
  fecha: string;
  matricula: string;
  tiempo: string;
  red: RedVuelo;
  identificador: string;
}

function RegistroForm({ onSubmit }: { onSubmit: (input: RegistroInput) => Promise<void> }) {
  const [fecha, setFecha] = useState("");
  const [matricula, setMatricula] = useState("");
  const [tiempo, setTiempo] = useState("");
  const [red, setRed] = useState<RedVuelo>("ninguna");
  const [identificador, setIdentificador] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await onSubmit({ fecha, matricula, tiempo, red, identificador });
    setEnviando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2.5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_0.8fr_auto]">
        <input
          type="date"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50"
        />
        <input
          type="text"
          required
          placeholder="Matrícula (ej. XB-VLA)"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
        <input
          type="number"
          required
          step="0.1"
          min="0.1"
          placeholder="Horas"
          value={tiempo}
          onChange={(e) => setTiempo(e.target.value)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
        />
        <button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-transform duration-150 hover:scale-[1.02] disabled:opacity-50"
        >
          <Send size={13} /> {enviando ? "Enviando..." : "Registrar"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[0.8fr_1fr]">
        <select
          value={red}
          onChange={(e) => setRed(e.target.value as RedVuelo)}
          className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-gold-500/50"
        >
          <option value="ninguna" style={{ backgroundColor: "#0b1d34" }}>
            Sin red online
          </option>
          <option value="vatsim" style={{ backgroundColor: "#0b1d34" }}>
            VATSIM
          </option>
          <option value="ivao" style={{ backgroundColor: "#0b1d34" }}>
            IVAO
          </option>
        </select>
        {red !== "ninguna" && (
          <input
            type="text"
            placeholder={red === "vatsim" ? "Tu CID de VATSIM" : "Tu VID de IVAO"}
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold-500/50"
          />
        )}
      </div>
    </form>
  );
}

export function ManiobrasChecklist() {
  const { user } = useAuth();
  const [vuelos, setVuelos] = useState<VueloPractica[]>([]);
  const [loading, setLoading] = useState(true);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMisVuelos(user.id).then((data) => {
      setVuelos(data);
      setLoading(false);
    });
  }, [user]);

  const porManiobra = new Map(vuelos.map((v) => [v.maniobra_id, v]));
  const confirmadas = vuelos.filter((v) => v.estado === "confirmado").length;

  async function handleRegistrar(maniobra: (typeof MANIOBRAS_VUELO)[number], input: RegistroInput) {
    if (!user) return;
    setError(null);
    const horas = Number(input.tiempo);
    if (!input.fecha || !input.matricula.trim() || !horas || horas <= 0) {
      setError("Completa fecha, matrícula y horas antes de registrar.");
      return;
    }
    const { error: insertError } = await registrarVuelo({
      userId: user.id,
      email: user.email,
      maniobraId: maniobra.id,
      maniobraTitulo: maniobra.titulo,
      fecha: input.fecha,
      matricula: input.matricula.trim(),
      tiempo: horas,
      red: input.red,
      identificador: input.identificador.trim(),
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setAbierta(null);
    setVuelos(await fetchMisVuelos(user.id));
  }

  if (loading) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-base font-semibold text-white">Progresión de maniobras</h3>
          <p className="mt-1 text-sm text-white/55">
            Registra cada maniobra que hagas con tu instructor — se suma a las horas registradas en tu perfil cuando el fundador la revisa. Es un registro de la academia: tu bitácora oficial es la de tu escuela de vuelo.
          </p>
        </div>
        <span className="whitespace-nowrap font-mono text-xs text-white/45">
          {confirmadas}/{MANIOBRAS_VUELO.length} revisadas
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={(confirmadas / MANIOBRAS_VUELO.length) * 100} size="sm" />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col gap-2">
        {MANIOBRAS_VUELO.map((maniobra, i) => {
          const registro = porManiobra.get(maniobra.id);
          return (
            <div key={maniobra.id} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-white">
                    {i + 1}. {maniobra.titulo}
                  </span>
                  <p className="mt-0.5 text-xs text-white/45">{maniobra.descripcion}</p>
                </div>
                {registro?.estado === "confirmado" && (
                  <Badge tone="green">
                    <CheckCircle2 size={12} className="mr-1 -ml-0.5" /> Confirmado · {registro.tiempo}h
                  </Badge>
                )}
                {registro?.estado === "pendiente" && (
                  <Badge tone="gold">
                    <Clock size={12} className="mr-1 -ml-0.5" /> Pendiente de confirmación
                  </Badge>
                )}
                {!registro && (
                  <button
                    onClick={() => setAbierta(abierta === maniobra.id ? null : maniobra.id)}
                    className="shrink-0 text-xs font-medium text-gold-400 transition-colors hover:text-gold-300"
                  >
                    {abierta === maniobra.id ? "Cancelar" : "Registrar esta maniobra"}
                  </button>
                )}
              </div>
              {!registro && abierta === maniobra.id && (
                <RegistroForm onSubmit={(input) => handleRegistrar(maniobra, input)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
