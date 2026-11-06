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
    // v1.3, para vuelo lento y perdidas. Cabeceo: positivo = nariz arriba. Flaps: indice de la palanca, 0 = arriba.
    public double Cabeceo, Vs, Flaps, Rpm;
    public bool Perdida;
    // v1.4, para seguir un vuelo completo. RumboV y VientoDir: verdaderos. Mezcla y Acelerador: 0-100. Altimetro y Qnh: inHg.
    public double Lat, Lon, Gs, RumboV, Mezcla, Acelerador, XpdrModo, Altimetro, Qnh, Com1, VientoDir, VientoKt;
    public bool Motor, MagIzq, MagDer, Master, LuzBeacon, LuzNav, LuzAterrizaje, LuzStrobe, LuzTaxi, Freno, Tren;
    public string Xpdr = "0000";
    public string Titulo = "";

    public Muestra Copia() { return (Muestra)MemberwiseClone(); }

    public static string N(double x) { return x.ToString("0.###", CultureInfo.InvariantCulture); }
    public static string N6(double x) { return x.ToString("0.######", CultureInfo.InvariantCulture); }
    static string N2(double x) { return x.ToString("0.##", CultureInfo.InvariantCulture); }
    static string B(bool x) { return x ? "true" : "false"; }

    public static string Texto(string s)
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
            ",\"cabeceo\":" + N(Cabeceo) + ",\"vs\":" + N(Vs) + ",\"perdida\":" + B(Perdida) +
            ",\"flaps\":" + N(Flaps) + ",\"rpm\":" + N(Rpm) +
            ",\"lat\":" + N6(Lat) + ",\"lon\":" + N6(Lon) + ",\"gs\":" + N(Gs) + ",\"rumboV\":" + N(RumboV) +
            ",\"motor\":" + B(Motor) + ",\"mezcla\":" + N(Mezcla) + ",\"acelerador\":" + N(Acelerador) +
            ",\"magIzq\":" + B(MagIzq) + ",\"magDer\":" + B(MagDer) + ",\"master\":" + B(Master) +
            ",\"luzBeacon\":" + B(LuzBeacon) + ",\"luzNav\":" + B(LuzNav) + ",\"luzAterrizaje\":" + B(LuzAterrizaje) +
            ",\"luzStrobe\":" + B(LuzStrobe) + ",\"luzTaxi\":" + B(LuzTaxi) + ",\"freno\":" + B(Freno) +
            ",\"xpdr\":" + Texto(Xpdr) + ",\"xpdrModo\":" + N(XpdrModo) + ",\"altimetro\":" + N2(Altimetro) +
            ",\"qnh\":" + N2(Qnh) + ",\"com1\":" + N(Com1) + ",\"tren\":" + B(Tren) +
            ",\"vientoDir\":" + N(VientoDir) + ",\"vientoKt\":" + N(VientoKt) +
            ",\"titulo\":" + Texto(Titulo) + "}";
    }

    // Lee lo que escribe Json(): un objeto plano de numeros, booleanos y textos. Cada clave es el campo con minuscula inicial.
    public static Muestra Desde(string json)
    {
        var m = new Muestra();
        var i = 0;
        while (true)
        {
            var k0 = json.IndexOf('"', i);
            if (k0 < 0) return m;
            var k1 = json.IndexOf('"', k0 + 1);
            var clave = json.Substring(k0 + 1, k1 - k0 - 1);
            i = json.IndexOf(':', k1) + 1;
            string valor;
            if (json[i] == '"')
            {
                var sb = new StringBuilder();
                for (i++; json[i] != '"'; i++)
                {
                    if (json[i] != '\\') { sb.Append(json[i]); continue; }
                    i++;
                    if (json[i] == 'u') { sb.Append((char)Convert.ToInt32(json.Substring(i + 1, 4), 16)); i += 4; }
                    else sb.Append(json[i]);
                }
                valor = sb.ToString();
                i++;
            }
            else
            {
                var fin = json.IndexOfAny(new[] { ',', '}' }, i);
                valor = json.Substring(i, fin - i);
                i = fin;
            }
            var campo = typeof(Muestra).GetField(char.ToUpperInvariant(clave[0]) + clave.Substring(1));
            if (campo == null) continue;
            if (campo.FieldType == typeof(double)) campo.SetValue(m, double.Parse(valor, CultureInfo.InvariantCulture));
            else if (campo.FieldType == typeof(bool)) campo.SetValue(m, valor == "true");
            else campo.SetValue(m, valor);
        }
    }
}

class Opciones
{
    public string Modo = "";
    public string Url = LectorInstructor.UrlPrograma;
    public bool SinVentana;
    public string Grabar, Archivo;
    public double Rapido = 1;

    public static Opciones Leer(string[] args)
    {
        var o = new Opciones();
        for (var i = 0; i < args.Length; i++)
        {
            if (args[i] == "--simulado" || args[i] == "--simulado-limpio" || args[i] == "--simulado-lento") o.Modo = args[i];
            else if (args[i] == "--reproducir" && i + 1 < args.Length) { o.Modo = args[i]; o.Archivo = args[++i]; }
            else if (args[i] == "--rapido" && i + 1 < args.Length) o.Rapido = Math.Max(0.1, double.Parse(args[++i], CultureInfo.InvariantCulture));
            else if (args[i] == "--grabar" && i + 1 < args.Length) o.Grabar = args[++i];
            else if (args[i] == "--sin-ventana") o.SinVentana = true;
            else if (args[i] == "--url" && i + 1 < args.Length) o.Url = args[++i];
        }
        return o;
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
    // Ultimos 120 s: si Chrome frena la pagina (pestana oculta o ventana tapada por MSFS), la pagina pide lo que le falto.
    static readonly List<Muestra> Historial = new List<Muestra>();
    const double GuardarSeg = 120;
    static string aeropuerto; // JSON del aeropuerto mas cercano; null mientras no llega
    // --grabar: una linea JSON por muestra, a lo mas 5 por segundo, y una {"aeropuerto":...} cuando cambia.
    static StreamWriter grabacion;
    static double grabada = double.NegativeInfinity;

    public static void Grabar(string ruta)
    {
        lock (Candado) grabacion = new StreamWriter(ruta, true, new UTF8Encoding(false)) { AutoFlush = true };
        Console.WriteLine("Grabando el vuelo en " + Path.GetFullPath(ruta));
    }

    public static void PonerAeropuerto(string json)
    {
        lock (Candado)
        {
            if (grabacion != null && json != null && json != aeropuerto) grabacion.WriteLine("{\"aeropuerto\":" + json + "}");
            aeropuerto = json;
        }
    }

    public static Muestra Ultima() { lock (Candado) return ultima; }

    public static double Ahora() { return Reloj.Elapsed.TotalSeconds; }

    public static void Publicar(Muestra m)
    {
        lock (Candado)
        {
            if (grabacion != null && m.T - grabada >= 0.2) { grabacion.WriteLine(m.Json()); grabada = m.T; }
            ultima = m;
            recibida = Ahora();
            Historial.Add(m);
            var viejas = 0;
            while (viejas < Historial.Count && Historial[viejas].T < m.T - GuardarSeg) viejas++;
            if (viejas > 0) Historial.RemoveRange(0, viejas);
        }
    }

    // El evento "Pause" de MSFS 2020 se queda pegado en 1 (pasa al cargar o tras una pausa): no sirve.
    // En pausa el reloj del simulador deja de avanzar aunque sigan llegando cuadros.
    public static bool Pausado(double tiempoSim, double ahora, ref double simAnterior, ref double ultimoAvance)
    {
        if (tiempoSim != simAnterior) { simAnterior = tiempoSim; ultimoAvance = ahora; }
        return ahora - ultimoAvance > 0.5;
    }

    // --probar: revisa Pausado sin MSFS. Sale con 1 si algo falla.
    static int Probar()
    {
        double ant = -1, ult = 0;
        var ok = !Pausado(100.00, 10.00, ref ant, ref ult)   // avanza
              && !Pausado(100.00, 10.06, ref ant, ref ult)   // un cuadro repetido no es pausa
              && !Pausado(100.10, 10.10, ref ant, ref ult)
              && !Pausado(100.10, 10.50, ref ant, ref ult)   // 0.4 s quieto: todavía no
              && Pausado(100.10, 10.70, ref ant, ref ult)    // 0.6 s quieto: pausa
              && !Pausado(100.20, 10.80, ref ant, ref ult);  // vuelve a avanzar
        Console.WriteLine(ok ? "Pausado: OK" : "Pausado: FALLA");

        var edge = ArgumentosEdge("https://x/instructor/programa", @"C:\p") ==
            "--app=https://x/instructor/programa --user-data-dir=\"C:\\p\" --window-size=480,860 --no-first-run " +
            "--autoplay-policy=no-user-gesture-required --disable-background-timer-throttling " +
            "--disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
        Console.WriteLine(edge ? "ArgumentosEdge: OK" : "ArgumentosEdge: FALLA");

        var o = Opciones.Leer(new[] { "--simulado", "--url", "http://localhost:5180/instructor/programa", "--sin-ventana" });
        var d = Opciones.Leer(new string[0]);
        var banderas = o.Modo == "--simulado" && o.Url == "http://localhost:5180/instructor/programa" && o.SinVentana
            && d.Modo == "" && d.Url == UrlPrograma && !d.SinVentana;
        Console.WriteLine(banderas ? "Banderas: OK" : "Banderas: FALLA");

        var puerto = PuertoLibreTrasHijo();
        Console.WriteLine(puerto ? "Puerto libre tras abrir Edge: OK" : "Puerto libre tras abrir Edge: FALLA");

        // v1.3: los campos del vuelo lento salen en el JSON y el modo de prueba se reconoce.
        var j = new Muestra { Cabeceo = 7.5, Vs = -120, Perdida = true, Flaps = 3, Rpm = 1850 }.Json();
        var json = j.Contains("\"cabeceo\":7.5") && j.Contains("\"vs\":-120") && j.Contains("\"perdida\":true")
            && j.Contains("\"flaps\":3") && j.Contains("\"rpm\":1850")
            && Opciones.Leer(new[] { "--simulado-lento" }).Modo == "--simulado-lento";
        Console.WriteLine(json ? "Json: OK" : "Json: FALLA");

        // v1.4: los campos del vuelo completo.
        var v = new Muestra { Lat = 20.52, Xpdr = "1200", Com1 = 118.1, Motor = true }.Json();
        var json14 = v.Contains("\"lat\":20.52") && v.Contains("\"xpdr\":\"1200\"") && v.Contains("\"com1\":118.1") && v.Contains("\"motor\":true");
        Console.WriteLine(json14 ? "Json v1.4: OK" : "Json v1.4: FALLA");

        // v1.4: el aeropuerto va en la raiz de /muestra; null mientras no llega.
        var sinAeropuerto = Estado(double.NaN).Contains("\"aeropuerto\":null");
        PonerAeropuerto("{\"icao\":\"MMGL\"}");
        var aeropuerto = sinAeropuerto && Estado(double.NaN).Contains("\"aeropuerto\":{\"icao\":\"MMGL\"}");
        PonerAeropuerto(null);
        Console.WriteLine(aeropuerto ? "Aeropuerto: OK" : "Aeropuerto: FALLA");

        // v1.4: --grabar / --reproducir. Una muestra leida y vuelta a escribir queda igual.
        var ida = new Muestra { T = 0, Lat = 20.521834, Lon = -103.311234, Xpdr = "1200", Motor = true, Titulo = "Cessna \"172\"\\x" };
        var vuelta = new Muestra { T = 0.5, Lat = 20.5219 };
        var ruta = Path.Combine(Path.GetTempPath(), "villanueva-probar.jsonl");
        File.WriteAllLines(ruta, new[] { ida.Json(), "{\"aeropuerto\":{\"icao\":\"MMGL\"}}", vuelta.Json() });
        string aeroGrabado;
        var leidas = Simulado.LeerGrabacion(ruta, out aeroGrabado);
        File.Delete(ruta);
        var r = Opciones.Leer(new[] { "--reproducir", "x.jsonl", "--rapido", "10" });
        var g = Opciones.Leer(new[] { "--grabar", "y.jsonl" });
        var grabado = leidas.Count == 2 && leidas[0].T == 0 && leidas[1].T == 0.5 && aeroGrabado == "{\"icao\":\"MMGL\"}"
            && leidas[0].Json() == ida.Json() && Muestra.Desde(vuelta.Json()).Json() == vuelta.Json()
            && r.Modo == "--reproducir" && r.Archivo == "x.jsonl" && r.Rapido == 10 && g.Grabar == "y.jsonl" && g.Modo == "";
        Console.WriteLine(grabado ? "Grabacion: OK" : "Grabacion: FALLA");
        return ok && edge && banderas && puerto && json && json14 && aeropuerto && grabado ? 0 : 1;
    }

    // Lo que pasaba: Edge heredaba el puerto del lector y, si el lector se cerraba, nadie podia volver a usarlo.
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

    public const string UrlPrograma = "https://villanueva-aviation.pages.dev/instructor/programa";

    public static string ArgumentosEdge(string url, string perfil)
    {
        return "--app=" + url + " --user-data-dir=\"" + perfil + "\" --window-size=480,860 --no-first-run" +
            " --autoplay-policy=no-user-gesture-required --disable-background-timer-throttling" +
            " --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";
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

    // Ventana propia de Edge (sin barra de direcciones) con su perfil: la sesion del cadete se guarda ahi.
    public static void AbrirVentana(string url)
    {
        var edge = BuscarEdge();
        if (edge == null)
        {
            Console.WriteLine("No encontre Microsoft Edge. Abre la pagina del instructor en tu navegador.");
            return;
        }
        var perfil = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"VillanuevaInstructor\Edge");
        try { Process.Start(SinHeredar(edge, ArgumentosEdge(url, perfil))); }
        catch (Exception e) { Console.WriteLine("No pude abrir Edge: " + e.Message); }
    }

    static void Main(string[] args)
    {
        if (args.Length > 0 && args[0] == "--probar") Environment.Exit(Probar());
        Console.Title = "Villanueva Aviation - Lector del instructor";
        var op = Opciones.Leer(args);

        var escucha = new TcpListener(IPAddress.Loopback, Puerto);
        try { escucha.Start(); }
        catch (SocketException)
        {
            if (Responde())
            {
                AbrirVentana(op.Url);
                Console.WriteLine("El lector ya estaba abierto: abri la ventana del instructor.");
                Thread.Sleep(3000);
            }
            else
            {
                // Una ventana abierta por un lector viejo (v1.1) puede quedarse con el puerto.
                Console.WriteLine("Algo ocupa el puerto del lector. Cierra todas las ventanas del Instructor virtual y vuelve a abrir el lector.");
                Thread.Sleep(15000);
            }
            return;
        }
        var servidor = new Thread(() => Servir(escucha));
        servidor.IsBackground = true;
        servidor.Start();
        if (!op.SinVentana) AbrirVentana(op.Url);

        if (op.Modo == "--reproducir")
        {
            Simulado.Reproducir(op.Archivo, op.Rapido);
            return;
        }
        if (op.Modo != "")
        {
            Console.WriteLine("Modo simulado: no se conecta a MSFS.");
            Simulado.Correr(op.Modo);
            return;
        }
        if (op.Grabar != null) Grabar(op.Grabar);
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
                    Responder(flujo, "200 OK", extra.ToString(), Estado(Desde(partes[1])));
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

    // "?desde=12.3" -> 12.3; sin el parametro, NaN (no manda historial).
    static double Desde(string ruta)
    {
        var q = ruta.IndexOf("?desde=", StringComparison.Ordinal);
        double d;
        if (q < 0 || !double.TryParse(ruta.Substring(q + 7).Split('&')[0], NumberStyles.Float, CultureInfo.InvariantCulture, out d)) return double.NaN;
        return d;
    }

    static string Estado(double desde)
    {
        lock (Candado)
        {
            // Sin muestra nueva en 2 s: el simulador se cerro, se pauso el envio o se perdio la conexion.
            var conectado = ultima != null && Ahora() - recibida < 2;
            var sb = new StringBuilder("{\"conectado\":").Append(conectado ? "true" : "false")
                .Append(",\"muestra\":").Append(conectado ? ultima.Json() : "null").Append(",\"muestras\":[");
            if (conectado && !double.IsNaN(desde))
            {
                var primera = true;
                foreach (var m in Historial)
                {
                    if (m.T <= desde) continue;
                    if (!primera) sb.Append(',');
                    sb.Append(m.Json());
                    primera = false;
                }
            }
            return sb.Append("],\"aeropuerto\":").Append(aeropuerto ?? "null").Append('}').ToString();
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
            out_.Add(new Muestra { Inclinacion = incl, Altitud = alt, Velocidad = v, Rumbo = Norm(rumbo), Bola = 0, Agl = 2500, Peso = 2550, Tasa = 1, Rpm = 2300, Titulo = "Cessna Skyhawk 172SP" });
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

    // Vuelo lento limpio, igual que simularLento en el sitio: flaps completos, de 95 a 58 kt, 35 s recto,
    // 90 grados a la izquierda y 90 a la derecha a 15 de inclinacion, y salida con potencia hasta 80 kt.
    static List<Muestra> EscenarioLento()
    {
        const double hz = 10, dt = 1 / hz;
        var out_ = new List<Muestra>();
        double v = 95, rumbo = 90, rpm = 1700;
        Action<double> emitir = incl =>
        {
            out_.Add(new Muestra { Inclinacion = incl, Altitud = 3500, Velocidad = v, Rumbo = Norm(rumbo), Bola = 0, Agl = 2500, Peso = 2550, Tasa = 1,
                Cabeceo = 0, Vs = 0, Perdida = false, Flaps = 3, Rpm = rpm, Titulo = "Cessna Skyhawk 172SP" });
        };
        while (v > 58) { emitir(0); v = Math.Max(58, v - 2 * dt); }
        for (var i = 0; i < 35 * hz; i++) emitir(0);
        Action<int> virar = sentido =>
        {
            double girado = 0, tl = 0;
            while (true)
            {
                var restante = 90 - girado;
                var incl = Math.Min(15, Math.Min(9 * tl, Math.Max(5, restante / 2)));
                var paso = 1091 * Math.Tan(incl * Math.PI / 180) / v * dt;
                if (paso >= restante) { rumbo += sentido * restante; emitir(0); return; }
                emitir(sentido * incl);
                rumbo += sentido * paso;
                girado += paso;
                tl += dt;
            }
        };
        virar(-1);
        for (var i = 0; i < 2 * hz; i++) emitir(0);
        virar(1);
        for (var i = 0; i < 3 * hz; i++) emitir(0);
        rpm = 2450;
        while (v < 80) { emitir(0); v = Math.Min(80, v + 2 * dt); }
        for (var i = 0; i < 10 * hz; i++) emitir(0);
        return out_;
    }

    // Lee un vuelo grabado con --grabar. aeropuerto: el primero que aparece (null si no hay).
    // ponytail: un solo aeropuerto por grabacion; guardar el momento de cada cambio si se graban vuelos de travesia.
    public static List<Muestra> LeerGrabacion(string ruta, out string aeropuerto)
    {
        const string Aero = "{\"aeropuerto\":";
        aeropuerto = null;
        var muestras = new List<Muestra>();
        foreach (var linea in File.ReadLines(ruta))
        {
            var l = linea.Trim();
            if (l.StartsWith(Aero, StringComparison.Ordinal)) { if (aeropuerto == null) aeropuerto = l.Substring(Aero.Length, l.Length - Aero.Length - 1); }
            else if (l.StartsWith("{", StringComparison.Ordinal)) muestras.Add(Muestra.Desde(l));
        }
        return muestras;
    }

    // Publica la grabacion con sus tiempos (divididos entre rapido) y se queda en la ultima muestra.
    // Los t publicados conservan la separacion original: el evaluador ve el vuelo a su ritmo real.
    public static void Reproducir(string ruta, double rapido)
    {
        string aeropuerto;
        var muestras = LeerGrabacion(ruta, out aeropuerto);
        if (muestras.Count == 0) { Console.WriteLine("La grabacion no tiene muestras: " + ruta); return; }
        LectorInstructor.PonerAeropuerto(aeropuerto);
        var t0 = muestras[0].T;
        var duracion = muestras[muestras.Count - 1].T - t0;
        Console.WriteLine("Reproduciendo " + muestras.Count + " muestras (" + Math.Round(duracion) + " s de vuelo) a x" + rapido + ".");
        var inicio = LectorInstructor.Ahora();
        foreach (var g in muestras)
        {
            var espera = (g.T - t0) / rapido - (LectorInstructor.Ahora() - inicio);
            if (espera > 0) Thread.Sleep((int)(espera * 1000));
            var m = g.Copia();
            m.T = inicio + (g.T - t0);
            LectorInstructor.Publicar(m);
        }
        Console.WriteLine("Fin de la grabacion: el lector se queda en la ultima muestra.");
        var ultima = LectorInstructor.Ultima();
        var fin = LectorInstructor.Ahora();
        while (true)
        {
            Thread.Sleep(100);
            var m = ultima.Copia();
            m.T = ultima.T + (LectorInstructor.Ahora() - fin);
            LectorInstructor.Publicar(m);
        }
    }

    // Repite el escenario sin fin a 10 muestras por segundo.
    public static void Correr(string modo)
    {
        var caida = modo == "--simulado";
        var muestras = modo == "--simulado-lento" ? EscenarioLento() : Escenario(caida);
        Console.WriteLine("Escenario de " + Math.Round(muestras.Count / 10.0) + " s" +
            (modo == "--simulado-lento" ? " de vuelo lento." : caida ? " con caida de 130 ft en el viraje izquierdo." : " limpio."));
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
    enum Def { Vuelo, Titulo, Aeropuerto }
    enum Req { Vuelo, Titulo, Aeropuertos, DatosAeropuerto }

    // Aeropuerto mas cercano, en el orden de CamposAeropuerto. Unidades del SDK: metros y Hz.
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    struct DatoAeropuerto { public double Lat, Lon, Alt; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string Nombre; }
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    struct DatoPista { public double Lat, Lon, Alt; public float Rumbo, Largo, Ancho; public int N1, D1, N2, D2; }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    struct DatoFrecuencia { public int Tipo, Hz; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)] public string Nombre; }

    static readonly string[] CamposAeropuerto =
    {
        "OPEN AIRPORT", "LATITUDE", "LONGITUDE", "ALTITUDE", "NAME",
        "OPEN RUNWAY", "LATITUDE", "LONGITUDE", "ALTITUDE", "HEADING", "LENGTH", "WIDTH",
        "PRIMARY_NUMBER", "PRIMARY_DESIGNATOR", "SECONDARY_NUMBER", "SECONDARY_DESIGNATOR", "CLOSE RUNWAY",
        "OPEN FREQUENCY", "TYPE", "FREQUENCY", "NAME", "CLOSE FREQUENCY", "CLOSE AIRPORT",
    };

    static string JsonAeropuerto(string icao, DatoAeropuerto a, List<DatoPista> pistas, List<DatoFrecuencia> frecuencias)
    {
        var sb = new StringBuilder("{\"icao\":").Append(Muestra.Texto(icao)).Append(",\"nombre\":").Append(Muestra.Texto(a.Nombre ?? ""))
            .Append(",\"lat\":").Append(Muestra.N6(a.Lat)).Append(",\"lon\":").Append(Muestra.N6(a.Lon)).Append(",\"altM\":").Append(Muestra.N(a.Alt))
            .Append(",\"pistas\":[");
        for (var i = 0; i < pistas.Count; i++)
        {
            var p = pistas[i];
            if (i > 0) sb.Append(',');
            sb.Append("{\"lat\":").Append(Muestra.N6(p.Lat)).Append(",\"lon\":").Append(Muestra.N6(p.Lon)).Append(",\"rumboV\":").Append(Muestra.N(p.Rumbo))
                .Append(",\"largoM\":").Append(Muestra.N(p.Largo)).Append(",\"anchoM\":").Append(Muestra.N(p.Ancho))
                .Append(",\"n1\":").Append(p.N1).Append(",\"d1\":").Append(p.D1).Append(",\"n2\":").Append(p.N2).Append(",\"d2\":").Append(p.D2).Append('}');
        }
        sb.Append("],\"frecuencias\":[");
        for (var i = 0; i < frecuencias.Count; i++)
        {
            var f = frecuencias[i];
            if (i > 0) sb.Append(',');
            sb.Append("{\"tipo\":").Append(f.Tipo).Append(",\"hz\":").Append(f.Hz).Append(",\"nombre\":").Append(Muestra.Texto(f.Nombre ?? "")).Append('}');
        }
        return sb.Append("]}").ToString();
    }

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
        new[] { "SIMULATION TIME", "seconds" },
        // v1.3
        new[] { "PLANE PITCH DEGREES", "degrees" },
        new[] { "VERTICAL SPEED", "feet per minute" },
        new[] { "STALL WARNING", "bool" },
        new[] { "FLAPS HANDLE INDEX", "number" },
        new[] { "GENERAL ENG RPM:1", "rpm" },
        // v1.4 (x[16]..x[39])
        new[] { "PLANE LATITUDE", "degrees" },
        new[] { "PLANE LONGITUDE", "degrees" },
        new[] { "GROUND VELOCITY", "knots" },
        new[] { "PLANE HEADING DEGREES TRUE", "degrees" },
        new[] { "GENERAL ENG COMBUSTION:1", "bool" },
        new[] { "GENERAL ENG MIXTURE LEVER POSITION:1", "percent" },
        new[] { "GENERAL ENG THROTTLE LEVER POSITION:1", "percent" },
        new[] { "RECIP ENG LEFT MAGNETO:1", "bool" },
        new[] { "RECIP ENG RIGHT MAGNETO:1", "bool" },
        new[] { "ELECTRICAL MASTER BATTERY", "bool" },
        new[] { "LIGHT BEACON", "bool" },
        new[] { "LIGHT NAV", "bool" },
        new[] { "LIGHT LANDING", "bool" },
        new[] { "LIGHT STROBE", "bool" },
        new[] { "LIGHT TAXI", "bool" },
        new[] { "BRAKE PARKING POSITION", "bool" },
        new[] { "TRANSPONDER CODE:1", "Bco16" },
        new[] { "TRANSPONDER STATE:1", "number" },
        new[] { "KOHLSMAN SETTING HG:1", "inHg" },
        new[] { "SEA LEVEL PRESSURE", "inHg" },
        new[] { "COM ACTIVE FREQUENCY:1", "MHz" },
        new[] { "GEAR HANDLE POSITION", "bool" },
        new[] { "AMBIENT WIND DIRECTION", "degrees" },
        new[] { "AMBIENT WIND VELOCITY", "knots" },
    };

    [StructLayout(LayoutKind.Sequential)]
    struct Vuelo { [MarshalAs(UnmanagedType.ByValArray, SizeConst = 40)] public double[] Valores; }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    struct Titulo { [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string Valor; }

    [MethodImpl(MethodImplOptions.NoInlining)]
    public static void Correr()
    {
        using (var senal = new EventWaitHandle(false, EventResetMode.AutoReset))
        using (var sim = new Microsoft.FlightSimulator.SimConnect.SimConnect("Villanueva Instructor", IntPtr.Zero, 0, senal, 0))
        {
            var abierto = true;
            double simAnterior = -1, ultimoAvance = 0;
            var titulo = "";
            Console.WriteLine("Conectado a MSFS.");
            sim.OnRecvQuit += (s, d) => abierto = false;
            // Un nombre de variable mal escrito no tumba el lector: sale aqui con su indice en Vars.
            sim.OnRecvException += (s, d) => Console.WriteLine("SimConnect: excepcion " + d.dwException + " en la variable " + d.dwIndex);
            sim.OnRecvSimobjectData += (s, d) =>
            {
                if (d.dwRequestID == (uint)Req.Titulo) { titulo = ((Titulo)d.dwData[0]).Valor ?? ""; return; }
                var x = ((Vuelo)d.dwData[0]).Valores;
                var ahora = LectorInstructor.Ahora();
                LectorInstructor.Publicar(new Muestra
                {
                    T = ahora, Inclinacion = x[0], Altitud = x[1], Velocidad = x[2], Rumbo = x[3], Bola = x[4],
                    Agl = x[5], Peso = x[6], EnTierra = x[7] != 0, Slew = x[8] != 0, Tasa = x[9],
                    Pausa = LectorInstructor.Pausado(x[10], ahora, ref simAnterior, ref ultimoAvance), Titulo = titulo,
                    // SimConnect da el cabeceo con nariz arriba negativo.
                    Cabeceo = -x[11], Vs = x[12], Perdida = x[13] != 0, Flaps = x[14], Rpm = x[15],
                    Lat = x[16], Lon = x[17], Gs = x[18], RumboV = x[19], Motor = x[20] != 0, Mezcla = x[21], Acelerador = x[22],
                    MagIzq = x[23] != 0, MagDer = x[24] != 0, Master = x[25] != 0, LuzBeacon = x[26] != 0, LuzNav = x[27] != 0,
                    LuzAterrizaje = x[28] != 0, LuzStrobe = x[29] != 0, LuzTaxi = x[30] != 0, Freno = x[31] != 0,
                    // El codigo llega en BCD: 0x1200 es el 1200.
                    Xpdr = ((int)x[32]).ToString("X4"), XpdrModo = x[33], Altimetro = x[34], Qnh = x[35], Com1 = x[36],
                    Tren = x[37] != 0, VientoDir = x[38], VientoKt = x[39],
                });
            };
            foreach (var v in Vars)
                sim.AddToDataDefinition(Def.Vuelo, v[0], v[1], Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATATYPE.FLOAT64, 0, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_UNUSED);
            sim.RegisterDataDefineStruct<Vuelo>(Def.Vuelo);
            sim.AddToDataDefinition(Def.Titulo, "TITLE", null, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATATYPE.STRING256, 0, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_UNUSED);
            sim.RegisterDataDefineStruct<Titulo>(Def.Titulo);
            // VISUAL_FRAME con intervalo 4, como el six pack: unas 15-20 muestras por segundo.
            sim.RequestDataOnSimObject(Req.Vuelo, Def.Vuelo, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_OBJECT_ID_USER,
                Microsoft.FlightSimulator.SimConnect.SIMCONNECT_PERIOD.VISUAL_FRAME, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 4, 0);
            sim.RequestDataOnSimObject(Req.Titulo, Def.Titulo, Microsoft.FlightSimulator.SimConnect.SimConnect.SIMCONNECT_OBJECT_ID_USER,
                Microsoft.FlightSimulator.SimConnect.SIMCONNECT_PERIOD.VISUAL_FRAME, Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 4, 0);
            // Aeropuerto mas cercano: la lista del simulador cada 30 s; los datos solo cuando cambia.
            var cercanos = new List<Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_FACILITY_AIRPORT>();
            string icaoActual = null, icaoPedido = null;
            var datoAeropuerto = new DatoAeropuerto();
            var pistas = new List<DatoPista>();
            var frecuencias = new List<DatoFrecuencia>();
            var conAeropuertos = true;
            try
            {
                foreach (var campo in CamposAeropuerto) sim.AddToFacilityDefinition(Def.Aeropuerto, campo);
                sim.RegisterFacilityDataDefineStruct<DatoAeropuerto>(Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.AIRPORT);
                sim.RegisterFacilityDataDefineStruct<DatoPista>(Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.RUNWAY);
                sim.RegisterFacilityDataDefineStruct<DatoFrecuencia>(Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.FREQUENCY);
            }
            catch (Exception e) { conAeropuertos = false; Console.WriteLine("Sin datos de aeropuerto: " + e.Message); }
            sim.OnRecvAirportList += (s, d) =>
            {
                if (d.dwEntryNumber == 0) cercanos.Clear();
                foreach (var o in d.rgData) cercanos.Add((Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_FACILITY_AIRPORT)o);
                if (d.dwEntryNumber + 1 < d.dwOutOf) return;
                var m = LectorInstructor.Ultima();
                if (m == null || cercanos.Count == 0 || icaoPedido != null) return;
                var cos = Math.Cos(m.Lat * Math.PI / 180);
                Func<Microsoft.FlightSimulator.SimConnect.SIMCONNECT_DATA_FACILITY_AIRPORT, double> dist = a =>
                    Math.Pow(a.Latitude - m.Lat, 2) + Math.Pow((a.Longitude - m.Lon) * cos, 2);
                var mejor = cercanos[0];
                foreach (var a in cercanos) if (dist(a) < dist(mejor)) mejor = a;
                if (mejor.Ident == icaoActual) return;
                icaoPedido = mejor.Ident;
                pistas.Clear();
                frecuencias.Clear();
                try { sim.RequestFacilityData(Def.Aeropuerto, Req.DatosAeropuerto, mejor.Ident, mejor.Region ?? ""); }
                catch (Exception e) { Console.WriteLine("No se pudo pedir " + mejor.Ident + ": " + e.Message); icaoPedido = null; }
            };
            sim.OnRecvFacilityData += (s, d) =>
            {
                var dato = d.Data[0];
                if (d.Type == (uint)Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.AIRPORT) datoAeropuerto = (DatoAeropuerto)dato;
                else if (d.Type == (uint)Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.RUNWAY) pistas.Add((DatoPista)dato);
                else if (d.Type == (uint)Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_DATA_TYPE.FREQUENCY) frecuencias.Add((DatoFrecuencia)dato);
            };
            sim.OnRecvFacilityDataEnd += (s, d) =>
            {
                if (icaoPedido == null) return;
                icaoActual = icaoPedido;
                icaoPedido = null;
                LectorInstructor.PonerAeropuerto(JsonAeropuerto(icaoActual, datoAeropuerto, pistas, frecuencias));
                Console.WriteLine("Aeropuerto: " + icaoActual + " (" + pistas.Count + " pistas, " + frecuencias.Count + " frecuencias)");
            };
            double ultimaLista = -100;
            while (abierto)
            {
                if (senal.WaitOne(10000)) sim.ReceiveMessage();
                if (conAeropuertos && LectorInstructor.Ultima() != null && LectorInstructor.Ahora() - ultimaLista > 30)
                {
                    ultimaLista = LectorInstructor.Ahora();
                    try { sim.RequestFacilitiesList(Microsoft.FlightSimulator.SimConnect.SIMCONNECT_FACILITY_LIST_TYPE.AIRPORT, Req.Aeropuertos); }
                    catch (Exception e) { Console.WriteLine("Lista de aeropuertos: " + e.Message); }
                }
            }
        }
    }
}
