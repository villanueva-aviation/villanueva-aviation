// Lector del instructor virtual de Villanueva Aviation.
// Lee el avion del cadete por SimConnect y sirve la ultima muestra en http://127.0.0.1:8766/muestra
// para que la pagina del instructor la califique. Solo escucha en la propia PC.
//
// No trae las DLL de SimConnect: las busca donde ya estan instaladas (junto al .exe, el SDK de MSFS,
// SimHub o MobiFlight), porque la licencia del SDK no las nombra como distribuibles.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

class Muestra
{
    public double T, Inclinacion, Altitud, Velocidad, Rumbo, Bola, Agl, Peso, Tasa;
    public bool EnTierra, Slew, Pausa;
    public string Titulo = "";

    public Muestra Copia() { return (Muestra)MemberwiseClone(); }

    static string N(double x) { return x.ToString("0.###", CultureInfo.InvariantCulture); }
    static string B(bool x) { return x ? "true" : "false"; }

    static string Texto(string s)
    {
        var sb = new StringBuilder("\"");
        foreach (var c in s)
        {
            if (c == '"' || c == '\\') sb.Append('\\').Append(c);
            else if (c < ' ') sb.Append("\\u").Append(((int)c).ToString("x4"));
            else sb.Append(c);
        }
        return sb.Append('"').ToString();
    }

    public string Json()
    {
        return "{\"t\":" + N(T) + ",\"inclinacion\":" + N(Inclinacion) + ",\"altitud\":" + N(Altitud) +
            ",\"velocidad\":" + N(Velocidad) + ",\"rumbo\":" + N(Rumbo) + ",\"bola\":" + N(Bola) +
            ",\"agl\":" + N(Agl) + ",\"peso\":" + N(Peso) + ",\"enTierra\":" + B(EnTierra) +
            ",\"slew\":" + B(Slew) + ",\"tasa\":" + N(Tasa) + ",\"pausa\":" + B(Pausa) +
            ",\"titulo\":" + Texto(Titulo) + "}";
    }
}

static class LectorInstructor
{
    const int Puerto = 8766;
    static readonly string[] Origenes = { "https://villanueva-aviation.pages.dev", "http://localhost:5180" };
    static readonly Stopwatch Reloj = Stopwatch.StartNew();
    static readonly object Candado = new object();
    static Muestra ultima;
    static double recibida = -10; // segundos de reloj en que llego la ultima muestra

    public static double Ahora() { return Reloj.Elapsed.TotalSeconds; }

    public static void Publicar(Muestra m)
    {
        lock (Candado) { ultima = m; recibida = Ahora(); }
    }

    static void Main(string[] args)
    {
        Console.Title = "Villanueva Aviation - Lector del instructor";
        var servidor = new Thread(Servir);
        servidor.IsBackground = true;
        servidor.Start();

        var modo = args.Length > 0 ? args[0] : "";
        if (modo == "--simulado" || modo == "--simulado-limpio")
        {
            Console.WriteLine("Modo simulado: no se conecta a MSFS.");
            Simulado.Correr(modo == "--simulado");
            return;
        }
        if (!Dlls.Preparar())
        {
            Console.WriteLine("No encontre las librerias de SimConnect en esta PC.");
            Console.WriteLine("Instala el SDK gratis de MSFS (lee LEEME.txt) y vuelve a abrir el lector.");
            Console.WriteLine("Presiona Enter para salir.");
            Console.ReadLine();
            return;
        }
        Console.WriteLine("Listo. Deja esta ventana abierta y abre la pagina del instructor.");
        while (true)
        {
            try { Sim.Correr(); }
            catch (Exception e) { if (!(e is COMException)) Console.WriteLine("SimConnect: " + e.Message); }
            Console.WriteLine("Esperando a MSFS...");
            Thread.Sleep(5000);
        }
    }

    // ---- HTTP minimo: HttpListener pediria permisos de administrador para el puerto. ----

    static void Servir()
    {
        var escucha = new TcpListener(IPAddress.Loopback, Puerto);
        try { escucha.Start(); }
        catch (SocketException)
        {
            Console.WriteLine("El puerto " + Puerto + " ya esta ocupado: quiza el lector ya esta abierto.");
            return;
        }
        while (true)
        {
            var cliente = escucha.AcceptTcpClient();
            ThreadPool.QueueUserWorkItem(_ => Atender(cliente));
        }
    }

    static void Atender(TcpClient cliente)
    {
        using (cliente)
        {
            try
            {
                cliente.ReceiveTimeout = 2000;
                var flujo = cliente.GetStream();
                var cabeza = LeerCabeza(flujo);
                if (cabeza == null) return;
                var lineas = cabeza.Split(new[] { "\r\n" }, StringSplitOptions.None);
                var partes = lineas[0].Split(' ');
                if (partes.Length < 2) return;
                string origen = null;
                foreach (var l in lineas)
                    if (l.StartsWith("Origin:", StringComparison.OrdinalIgnoreCase)) origen = l.Substring(7).Trim();

                var extra = new StringBuilder();
                if (origen != null && Array.IndexOf(Origenes, origen) >= 0)
                    extra.Append("Access-Control-Allow-Origin: ").Append(origen).Append("\r\nVary: Origin\r\n");

                if (partes[0] == "OPTIONS")
                {
                    if (extra.Length > 0)
                        extra.Append("Access-Control-Allow-Methods: GET\r\nAccess-Control-Allow-Private-Network: true\r\nAccess-Control-Max-Age: 600\r\n");
                    Responder(flujo, "204 No Content", extra.ToString(), null);
                }
                else if (partes[0] == "GET" && partes[1].Split('?')[0] == "/muestra")
                    Responder(flujo, "200 OK", extra.ToString(), Estado());
                else
                    Responder(flujo, "404 Not Found", extra.ToString(), null);
            }
            catch (IOException) { }
            catch (SocketException) { }
        }
    }

    static string LeerCabeza(NetworkStream flujo)
    {
        var buf = new byte[8192];
        var n = 0;
        while (n < buf.Length)
        {
            var leidos = flujo.Read(buf, n, buf.Length - n);
            if (leidos <= 0) return null;
            n += leidos;
            var s = Encoding.ASCII.GetString(buf, 0, n);
            var fin = s.IndexOf("\r\n\r\n", StringComparison.Ordinal);
            if (fin >= 0) return s.Substring(0, fin);
        }
        return null;
    }

    static string Estado()
    {
        lock (Candado)
        {
            // Sin muestra nueva en 2 s: el simulador se cerro, se pauso el envio o se perdio la conexion.
            var conectado = ultima != null && Ahora() - recibida < 2;
            return "{\"conectado\":" + (conectado ? "true" : "false") + ",\"muestra\":" + (conectado ? ultima.Json() : "null") + "}";
        }
    }

    static void Responder(NetworkStream flujo, string estado, string extra, string cuerpo)
    {
        var datos = Encoding.UTF8.GetBytes(cuerpo ?? "");
        var cabeza = "HTTP/1.1 " + estado + "\r\n" + extra +
            (cuerpo != null ? "Content-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\n" : "") +
            "Content-Length: " + datos.Length + "\r\nConnection: close\r\n\r\n";
        var bytes = Encoding.ASCII.GetBytes(cabeza);
        flujo.Write(bytes, 0, bytes.Length);
        flujo.Write(datos, 0, datos.Length);
    }
}

// ---- Busca las DLL de SimConnect que ya hay en la PC y las carga antes de tocar SimConnect. ----

static class Dlls
{
    const string Administrada = "Microsoft.FlightSimulator.SimConnect.dll";
    const string Nativa = "SimConnect.dll";
    static string administrada;

    [DllImport("kernel32", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern IntPtr LoadLibrary(string ruta);

    static IEnumerable<string[]> Candidatos()
    {
        var exe = AppDomain.CurrentDomain.BaseDirectory;
        yield return new[] { exe, exe };
        var sdks = new List<string>();
        var env = Environment.GetEnvironmentVariable("MSFS_SDK");
        if (!string.IsNullOrEmpty(env)) sdks.Add(env);
        sdks.Add(@"C:\MSFS SDK");
        foreach (var sdk in sdks)
        {
            var lib = Path.Combine(sdk, @"SimConnect SDK\lib");
            yield return new[] { Path.Combine(lib, "managed"), lib };
        }
        foreach (var pf in new[] { Environment.GetEnvironmentVariable("ProgramFiles(x86)"), Environment.GetEnvironmentVariable("ProgramFiles") })
        {
            if (string.IsNullOrEmpty(pf)) continue;
            var simhub = Path.Combine(pf, @"SimHub\_Addons\GamePlugins\FlightSimulator");
            yield return new[] { simhub, simhub };
        }
        var mobi = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"MobiFlight\MobiFlight Connector");
        yield return new[] { mobi, mobi };
    }

    public static bool Preparar()
    {
        foreach (var c in Candidatos())
        {
            var a = Path.Combine(c[0], Administrada);
            var n = Path.Combine(c[1], Nativa);
            if (!File.Exists(a) || !File.Exists(n)) continue;
            // La administrada busca "SimConnect.dll" por nombre: si ya esta cargada, usa esa.
            if (LoadLibrary(n) == IntPtr.Zero) continue;
            administrada = a;
            AppDomain.CurrentDomain.AssemblyResolve += (s, e) =>
                e.Name.StartsWith("Microsoft.FlightSimulator.SimConnect", StringComparison.OrdinalIgnoreCase) ? Assembly.LoadFrom(administrada) : null;
            Console.WriteLine("SimConnect: " + c[0]);
            return true;
        }
        return false;
    }
}

// ---- Escenario de prueba sin MSFS, igual que simularManiobra en el sitio. ----

static class Simulado
{
    static double Norm(double r) { return ((r % 360) + 360) % 360; }

    static List<Muestra> Escenario(bool caida)
    {
        const double hz = 10, dt = 1 / hz, v = 95;
        var out_ = new List<Muestra>();
        var rumbo = 90.0;
        Action<double, double> emitir = (incl, alt) =>
        {
            out_.Add(new Muestra { Inclinacion = incl, Altitud = alt, Velocidad = v, Rumbo = Norm(rumbo), Bola = 0, Agl = 2500, Peso = 2550, Tasa = 1, Titulo = "Cessna Skyhawk 172SP" });
        };
        Action<double> recto = seg => { for (var i = 0; i < Math.Round(seg * hz); i++) emitir(0, 3500); };
        Action<int, double, double, bool> virar = (sentido, angulo, maxima, conCaida) =>
        {
            double girado = 0, tl = 0, tCaida = 0;
            while (true)
            {
                var restante = angulo - girado;
                var incl = Math.Min(maxima, Math.Min(9 * tl, Math.Max(12, 3 * restante)));
                var alt = 3500.0;
                if (conCaida && girado >= 90 && tCaida < 6 - 1e-9) { alt = 3370; tCaida += dt; }
                var paso = 1091 * Math.Tan(incl * Math.PI / 180) / v * dt;
                if (paso >= restante) { rumbo += sentido * restante; emitir(0, 3500); return; }
                emitir(sentido * incl, alt);
                rumbo += sentido * paso;
                girado = incl < 10 ? paso : girado + paso;
                tl += dt;
            }
        };
        recto(20);
        virar(-1, 90, 20, false);
        virar(1, 90, 20, false);
        recto(10);
        virar(-1, 360, 45, caida);
        recto(3);
        virar(1, 360, 45, false);
        recto(15);
        return out_;
    }

    // Repite el escenario sin fin a 10 muestras por segundo.
    public static void Correr(bool caida)
    {
        var muestras = Escenario(caida);
        Console.WriteLine("Escenario de " + Math.Round(muestras.Count / 10.0) + " s" + (caida ? " con caida de 130 ft en el viraje izquierdo." : " limpio."));
        var inicio = LectorInstructor.Ahora();
        while (true)
        {
            var i = (int)((LectorInstructor.Ahora() - inicio) * 10) % muestras.Count;
            var m = muestras[i].Copia();
            m.T = LectorInstructor.Ahora();
            LectorInstructor.Publicar(m);
            Thread.Sleep(50);
        }
    }
}

// ---- SimConnect. Aparte para que el JIT no cargue la DLL antes de que Dlls.Preparar la encuentre. ----

static class Sim
{
    enum Def { Vuelo, Titulo }
    enum Req { Vuelo, Titulo }
    enum Evento { Pausa }

    static readonly string[][] Vars =
    {
        new[] { "PLANE BANK DEGREES", "degrees" },
        new[] { "INDICATED ALTITUDE", "feet" },
        new[] { "AIRSPEED INDICATED", "knots" },
        new[] { "PLANE HEADING DEGREES MAGNETIC", "degrees" },
        new[] { "TURN COORDINATOR BALL", "position" },
        new[] { "PLANE ALT ABOVE GROUND", "feet" },
        new[] { "TOTAL WEIGHT", "pounds" },
        new[] { "SIM ON GROUND", "bool" },
        new[] { "IS SLEW ACTIVE", "bool" },
        new[] { "SIMULATION RATE", "number" },
    };

    [StructLayout(LayoutKind.Sequential)]
    struct Vuelo { [MarshalAs(UnmanagedType.ByValArray, SizeConst = 10)] public double[] Valores; }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    struct Titulo { [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string Valor; }

    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void Correr()
    {
        using (var senal = new EventWaitHandle(false, EventResetMode.AutoReset))
        using (var sim = new Microsoft.FlightSimulator.SimConnect.SimConnect("Villanueva Instructor", IntPtr.Zero, 0, senal, 0))
        {
            var abierto = true;
            var pausa = false;
            var titulo = "";
            Console.WriteLine("Conectado a MSFS.");
            sim.OnRecvQuit += (s, d) => abierto = false;
            sim.OnRecvEvent += (s, d) => { if (d.uEventID == (uint)Evento.Pausa) pausa = d.dwData != 0; };
            sim.OnRecvSimobjectData += (s, d) =>
            {
                if (d.dwRequestID == (uint)Req.Titulo) { titulo = ((Titulo)d.dwData[0]).Valor ?? ""; return; }
                var x = ((Vuelo)d.dwData[0]).Valores;
                LectorInstructor.Publicar(new Muestra
                {
                    T = LectorInstructor.Ahora(), Inclinacion = x[0], Altitud = x[1], Velocidad = x[2], Rumbo = x[3], Bola = x[4],
                    Agl = x[5], Peso = x[6], EnTierra = x[7] != 0, Slew = x[8] != 0, Tasa = x[9], Pausa = pausa, Titulo = titulo,
                });
            };
            foreach (var v in Vars)
                sim.AddToDataDefinition(Def.Vuelo, v[0], v[1], Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATATYPE.FLOAT64, 0, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_UNUSED);
            sim.RegisterDataDefineStruct<Vuelo>(Def.Vuelo);
            sim.AddToDataDefinition(Def.Titulo, "TITLE", null, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATATYPE.STRING256, 0, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_UNUSED);
            sim.RegisterDataDefineStruct<Titulo>(Def.Titulo);
            sim.SubscribeToSystemEvent(Evento.Pausa, "Pause");
            // VISUAL_FRAME con intervalo 4, como el six pack: unas 15-20 muestras por segundo.
            sim.RequestDataOnSimObject(Req.Vuelo, Def.Vuelo, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_OBJECT_ID_USER,
                Microsoft.FlightSimulator.SimConnect.SIMCONNECT_PERIOD.VISUAL_FRAME, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 4, 0);
            sim.RequestDataOnSimObject(Req.Titulo, Def.Titulo, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_OBJECT_ID_USER,
                Microsoft.FlightSimulator.SimConnect.SIMCONNECT_PERIOD.VISUAL_FRAME, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 4, 0);
            while (abierto)
                if (senal.WaitOne(10000)) sim.ReceiveMessage();
        }
    }
}
