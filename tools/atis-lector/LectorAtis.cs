// Lector del programa ATIS de Villanueva Aviation.
// Lee los radios COM y la posicion del avion por SimConnect y sirve la ultima muestra en http://127.0.0.1:8767/muestra
// para que la pagina del ATIS decida que frecuencia se oye. Solo escucha en la propia PC.
//
// Sale del lector del instructor virtual (tools/instructor-lector). No trae las DLL de SimConnect: las busca donde
// ya estan instaladas (junto al .exe, el SDK de MSFS, SimHub o MobiFlight).
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
    public double Lat, Lon, AglFt;
    public double[] Mhz = new double[2];
    public bool[] Escucha = new bool[2];
    public double[] Volumen = new double[2]; // 0..1; NaN = no disponible

    public static string N(double x) { return x.ToString("0.###", CultureInfo.InvariantCulture); }
    public static string N6(double x) { return x.ToString("0.######", CultureInfo.InvariantCulture); }

    // Con el simulador caido (Review Focus 5): siempre esta forma, sin radios ni posicion.
    public const string JsonSinSim = "{\"sim\": null, \"com\": [], \"lat\": null, \"lon\": null, \"aglFt\": null}";

    public string Json()
    {
        var sb = new StringBuilder("{\"sim\": \"msfs\", \"com\": [");
        for (var i = 0; i < 2; i++)
        {
            if (i > 0) sb.Append(", ");
            // Volumen solo si el radio escucha y el avion lo informa (si no, null).
            var vol = Escucha[i] && !double.IsNaN(Volumen[i]) ? N(Volumen[i]) : "null";
            sb.Append("{\"mhz\": ").Append(N(Mhz[i])).Append(", \"escucha\": ").Append(Escucha[i] ? "true" : "false")
                .Append(", \"volumen\": ").Append(vol).Append('}');
        }
        return sb.Append("], \"lat\": ").Append(N6(Lat)).Append(", \"lon\": ").Append(N6(Lon))
            .Append(", \"aglFt\": ").Append(N(AglFt)).Append('}').ToString();
    }

    // Volumen en porcentaje de SimConnect -> 0..1. Si el avion da 0 en los dos mientras alguno recibe, no lo informa: NaN.
    public static double[] Volumenes(double v1, double v2, bool rx1, bool rx2)
    {
        if (v1 == 0 && v2 == 0 && (rx1 || rx2)) return new[] { double.NaN, double.NaN };
        return new[] { Math.Round(v1) / 100, Math.Round(v2) / 100 };
    }
}

class Opciones
{
    public bool Simulado, SinVentana;
    public string Url = LectorAtis.UrlPrograma;

    public static Opciones Leer(string[] args)
    {
        var o = new Opciones();
        for (var i = 0; i < args.Length; i++)
        {
            if (args[i] == "--simulado") o.Simulado = true;
            else if (args[i] == "--sin-ventana") o.SinVentana = true;
            else if (args[i] == "--url" && i + 1 < args.Length) o.Url = args[++i];
        }
        return o;
    }
}

static class LectorAtis
{
    const int Puerto = 8767;
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

    // Sin muestra nueva en 2 s: el simulador se cerro o se perdio la conexion.
    static string Estado()
    {
        lock (Candado) return ultima != null && Ahora() - recibida < 2 ? ultima.Json() : Muestra.JsonSinSim;
    }

    // --probar: revisa lo que se puede sin MSFS. Sale con 1 si algo falla.
    static int Probar()
    {
        var edge = ArgumentosEdge("https://x/atis", @"C:\p") ==
            "--app=https://x/atis --user-data-dir=\"C:\\p\" --window-size=480,860 --no-first-run " +
            "--autoplay-policy=no-user-gesture-required --disable-background-timer-throttling " +
            "--disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
        Console.WriteLine(edge ? "ArgumentosEdge: OK" : "ArgumentosEdge: FALLA");

        var perfil = PerfilEdge().EndsWith(@"VillanuevaAtis\Edge", StringComparison.Ordinal);
        Console.WriteLine(perfil ? "Perfil de Edge: OK" : "Perfil de Edge: FALLA");

        var o = Opciones.Leer(new[] { "--simulado", "--url", "http://localhost:5180/atis", "--sin-ventana" });
        var d = Opciones.Leer(new string[0]);
        var banderas = o.Simulado && o.Url == "http://localhost:5180/atis" && o.SinVentana
            && !d.Simulado && d.Url == UrlPrograma && !d.SinVentana;
        Console.WriteLine(banderas ? "Banderas: OK" : "Banderas: FALLA");

        var puerto = PuertoLibreTrasHijo();
        Console.WriteLine(puerto ? "Puerto libre tras abrir Edge: OK" : "Puerto libre tras abrir Edge: FALLA");

        // Sin muestra (simulador caido): la forma exacta de Review Focus 5.
        var sinSim = Estado() == "{\"sim\": null, \"com\": [], \"lat\": null, \"lon\": null, \"aglFt\": null}";
        Console.WriteLine(sinSim ? "Json sin simulador: OK" : "Json sin simulador: FALLA");

        // Primera muestra simulada: la forma exacta del contrato.
        var s = Simulado.En(0).Json();
        var forma = s == "{\"sim\": \"msfs\", \"com\": [{\"mhz\": 127.9, \"escucha\": true, \"volumen\": 0.8}, " +
            "{\"mhz\": 118.1, \"escucha\": false, \"volumen\": null}], \"lat\": 20.7, \"lon\": -103.31, \"aglFt\": 1500}";
        Console.WriteLine(forma ? "Json simulado: OK" : "Json simulado: FALLA " + s);

        // El avion que da 0 en los dos volumenes mientras recibe: null; si no, porcentaje / 100.
        var v0 = Muestra.Volumenes(0, 0, true, false);
        var v1 = Muestra.Volumenes(80, 0, true, false);
        var v2 = Muestra.Volumenes(0, 0, false, false);
        var vol = double.IsNaN(v0[0]) && double.IsNaN(v0[1]) && v1[0] == 0.8 && v1[1] == 0 && v2[0] == 0 && v2[1] == 0;
        Console.WriteLine(vol ? "Volumen: OK" : "Volumen: FALLA");

        // La ruta simulada: sube de 1500 a 6000 ft y despues va 1 NM al norte cada 5 s.
        var a = Simulado.En(0); var b = Simulado.En(15); var f = Simulado.En(600); var g = Simulado.En(605);
        var ruta = a.AglFt == 1500 && b.AglFt > 1500 && b.AglFt < 6000 && b.Lat == a.Lat && f.AglFt == 6000
            && Math.Abs((g.Lat - f.Lat) * 60 - 1) < 1e-6 && g.Lon == f.Lon;
        Console.WriteLine(ruta ? "Ruta simulada: OK" : "Ruta simulada: FALLA");
        return edge && perfil && banderas && puerto && sinSim && forma && vol && ruta ? 0 : 1;
    }

    // Lo que pasaba en el lector del instructor: Edge heredaba el puerto y, si el lector se cerraba, nadie podia volver a usarlo.
    static bool PuertoLibreTrasHijo()
    {
        var l = new TcpListener(IPAddress.Loopback, 0);
        l.Start();
        var puerto = ((IPEndPoint)l.LocalEndpoint).Port;
        var si = SinHeredar(Path.Combine(Environment.SystemDirectory, "ping.exe"), "-n 4 127.0.0.1");
        si.WindowStyle = ProcessWindowStyle.Hidden;
        var hijo = Process.Start(si);
        l.Stop();
        try
        {
            var otra = new TcpListener(IPAddress.Loopback, puerto);
            otra.Start();
            otra.Stop();
            return true;
        }
        catch (SocketException) { return false; }
        finally { try { hijo.Kill(); } catch { } }
    }

    static bool Responde()
    {
        try
        {
            var r = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + Puerto + "/muestra");
            r.Timeout = 2000;
            using (r.GetResponse()) return true;
        }
        catch { return false; }
    }

    public static ProcessStartInfo SinHeredar(string exe, string argumentos)
    {
        // Por el shell de Windows el hijo no hereda los handles: el puerto se queda solo con el lector.
        return new ProcessStartInfo(exe, argumentos) { UseShellExecute = true };
    }

    public const string UrlPrograma = "https://villanueva-aviation.pages.dev/atis";

    public static string ArgumentosEdge(string url, string perfil)
    {
        return "--app=" + url + " --user-data-dir=\"" + perfil + "\" --window-size=480,860 --no-first-run" +
            " --autoplay-policy=no-user-gesture-required --disable-background-timer-throttling" +
            " --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
    }

    public static string PerfilEdge()
    {
        return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"VillanuevaAtis\Edge");
    }

    public static string BuscarEdge()
    {
        const string clave = @"SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe";
        foreach (var raiz in new[] { Microsoft.Win32.Registry.LocalMachine, Microsoft.Win32.Registry.CurrentUser })
        {
            using (var k = raiz.OpenSubKey(clave))
            {
                var ruta = k == null ? null : k.GetValue("") as string;
                if (!string.IsNullOrEmpty(ruta) && File.Exists(ruta)) return ruta;
            }
        }
        foreach (var carpeta in new[] { "ProgramFiles(x86)", "ProgramFiles" })
        {
            var ruta = Path.Combine(Environment.GetEnvironmentVariable(carpeta) ?? "", @"Microsoft\Edge\Application\msedge.exe");
            if (File.Exists(ruta)) return ruta;
        }
        return null;
    }

    // Ventana propia de Edge (sin barra de direcciones) con su perfil: lo que el cadete configure se guarda ahi.
    public static void AbrirVentana(string url)
    {
        var edge = BuscarEdge();
        if (edge == null)
        {
            Console.WriteLine("No encontre Microsoft Edge. Abre la pagina del ATIS en tu navegador.");
            return;
        }
        try { Process.Start(SinHeredar(edge, ArgumentosEdge(url, PerfilEdge()))); }
        catch (Exception e) { Console.WriteLine("No pude abrir Edge: " + e.Message); }
    }

    static void Main(string[] args)
    {
        if (args.Length > 0 && args[0] == "--probar") Environment.Exit(Probar());
        Console.Title = "Villanueva Aviation - Lector del ATIS";
        var op = Opciones.Leer(args);

        var escucha = new TcpListener(IPAddress.Loopback, Puerto);
        try { escucha.Start(); }
        catch (SocketException)
        {
            if (Responde())
            {
                AbrirVentana(op.Url);
                Console.WriteLine("El lector ya estaba abierto: abri la ventana del ATIS.");
                Thread.Sleep(3000);
            }
            else
            {
                Console.WriteLine("Algo ocupa el puerto del lector. Cierra todas las ventanas del ATIS y vuelve a abrir el lector.");
                Thread.Sleep(15000);
            }
            return;
        }
        var servidor = new Thread(() => Servir(escucha));
        servidor.IsBackground = true;
        servidor.Start();
        if (!op.SinVentana) AbrirVentana(op.Url);

        if (op.Simulado)
        {
            Console.WriteLine("Modo simulado: no se conecta a MSFS.");
            Simulado.Correr();
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
        Console.WriteLine("Listo. Deja esta ventana abierta y abre la pagina del ATIS.");
        while (true)
        {
            try { Sim.Correr(); }
            catch (Exception e) { if (!(e is COMException)) Console.WriteLine("SimConnect: " + e.Message); }
            Console.WriteLine("Esperando a MSFS...");
            Thread.Sleep(5000);
        }
    }

    // ---- HTTP minimo: HttpListener pediria permisos de administrador para el puerto. ----

    static void Servir(TcpListener escucha)
    {
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

// ---- Avion simulado, sin MSFS: 10 NM al norte de MMGL con COM1 127.9 escuchando. ----

static class Simulado
{
    const double LatInicial = 20.70, LonInicial = -103.31;
    const double SubeFtPorSeg = 7.5; // 1500 -> 6000 ft en 600 s: da tiempo de oir el alcance cambiar con la altura
    const double TopeFt = 6000;
    const double NmPorSeg = 0.2;     // 1 NM cada 5 s

    // Muestra del avion simulado t segundos despues de arrancar.
    public static Muestra En(double t)
    {
        var tSube = (TopeFt - 1500) / SubeFtPorSeg;
        var m = new Muestra
        {
            Lat = LatInicial + Math.Max(0, t - tSube) * NmPorSeg / 60, Lon = LonInicial,
            AglFt = Math.Min(TopeFt, 1500 + t * SubeFtPorSeg),
        };
        m.Mhz[0] = 127.9; m.Escucha[0] = true; m.Volumen[0] = 0.8;
        m.Mhz[1] = 118.1; m.Escucha[1] = false; m.Volumen[1] = 0.5; // sin escuchar, el JSON manda null
        return m;
    }

    public static void Correr()
    {
        var inicio = LectorAtis.Ahora();
        while (true)
        {
            LectorAtis.Publicar(En(LectorAtis.Ahora() - inicio));
            Thread.Sleep(250);
        }
    }
}

// ---- SimConnect. Aparte para que el JIT no cargue la DLL antes de que Dlls.Preparar la encuentre. ----

static class Sim
{
    enum Def { Vuelo }
    enum Req { Vuelo }

    static readonly string[][] Vars =
    {
        new[] { "COM ACTIVE FREQUENCY:1", "MHz" },
        new[] { "COM ACTIVE FREQUENCY:2", "MHz" },
        new[] { "COM RECEIVE:1", "bool" },
        new[] { "COM RECEIVE:2", "bool" },
        new[] { "COM VOLUME:1", "percent" },
        new[] { "COM VOLUME:2", "percent" },
        new[] { "PLANE LATITUDE", "degrees" },
        new[] { "PLANE LONGITUDE", "degrees" },
        new[] { "PLANE ALT ABOVE GROUND", "feet" },
    };

    [StructLayout(LayoutKind.Sequential)]
    struct Vuelo { [MarshalAs(UnmanagedType.ByValArray, SizeConst = 9)] public double[] Valores; }

    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void Correr()
    {
        using (var senal = new EventWaitHandle(false, EventResetMode.AutoReset))
        using (var sim = new Microsoft.FlightSimulator.SimConnect.SimConnect("Villanueva ATIS", IntPtr.Zero, 0, senal, 0))
        {
            var abierto = true;
            Console.WriteLine("Conectado a MSFS.");
            sim.OnRecvQuit += (s, d) => abierto = false;
            // Un nombre de variable mal escrito no tumba el lector: sale aqui.
            sim.OnRecvException += (s, d) => Console.WriteLine("SimConnect: excepcion " + d.dwException + " en el parametro " + d.dwIndex);
            double ultimo = -1;
            sim.OnRecvSimobjectData += (s, d) =>
            {
                // Llegan unas 15-20 por segundo: se publica una cada 250 ms.
                if (LectorAtis.Ahora() - ultimo < 0.25) return;
                ultimo = LectorAtis.Ahora();
                var x = ((Vuelo)d.dwData[0]).Valores;
                bool rx1 = x[2] != 0, rx2 = x[3] != 0;
                var m = new Muestra { Lat = x[6], Lon = x[7], AglFt = Math.Round(x[8]), Volumen = Muestra.Volumenes(x[4], x[5], rx1, rx2) };
                m.Mhz[0] = Math.Round(x[0], 3); m.Mhz[1] = Math.Round(x[1], 3);
                m.Escucha[0] = rx1; m.Escucha[1] = rx2;
                LectorAtis.Publicar(m);
            };
            foreach (var v in Vars)
                sim.AddToDataDefinition(Def.Vuelo, v[0], v[1], Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATATYPE.FLOAT64, 0, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_UNUSED);
            sim.RegisterDataDefineStruct<Vuelo>(Def.Vuelo);
            // Cuadro visual con intervalo 4, como el instructor; arriba se filtra a 250 ms.
            sim.RequestDataOnSimObject(Req.Vuelo, Def.Vuelo, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_OBJECT_ID_USER,
                Microsoft.FlightSimulator.SimConnect.SIMCONNECT_PERIOD.VISUAL_FRAME, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 4, 0);
            while (abierto)
            {
                if (senal.WaitOne(10000)) sim.ReceiveMessage();
            }
        }
    }
}
