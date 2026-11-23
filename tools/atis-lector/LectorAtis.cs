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
using System.Text.RegularExpressions;
using System.Threading;
using SC = Microsoft.FlightSimulator.SimConnect; // alias de compilacion: no carga la DLL

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

// ---- Aeropuertos con ATIS cerca del avion (de MSFS o, en --simulado, MMGL). Sin tipos de SimConnect: --probar los usa. ----

class Lugar
{
    public string Icao, Region;
    public double Lat, Lon;
}

class Pista
{
    public string Ident;
    public int RumboV, LargoFt;
}

class Aeropuerto : Lugar
{
    public string Nombre;
    public int ElevFt;
    public List<double> Mhz = new List<double>();
    public List<Pista> Pistas = new List<Pista>();

    public const double Radio = 200;   // NM
    const double Rebusca = 10;         // NM movido antes de volver a buscar
    public const double PiesPorMetro = 3.28084;

    // Numero 1-36 y designador de MSFS (1 L, 2 R, 3 C; los demas sin letra). Fuera de 1-36 (N, NE...): null.
    public static string Ident(int numero, int designador)
    {
        if (numero < 1 || numero > 36) return null;
        var letra = designador == 1 ? "L" : designador == 2 ? "R" : designador == 3 ? "C" : "";
        return numero.ToString("00", CultureInfo.InvariantCulture) + letra;
    }

    // Los dos extremos de una pista de MSFS: rumbo verdadero del primario y su opuesto; largo en metros -> ft.
    public static List<Pista> Extremos(float rumbo, float largoM, int n1, int d1, int n2, int d2)
    {
        var largo = (int)Math.Round(largoM * PiesPorMetro);
        var r = new List<Pista>();
        var a = Ident(n1, d1);
        var b = Ident(n2, d2);
        if (a != null) r.Add(new Pista { Ident = a, RumboV = (int)Math.Round(rumbo) % 360, LargoFt = largo });
        if (b != null) r.Add(new Pista { Ident = b, RumboV = (int)Math.Round((rumbo + 180) % 360) % 360, LargoFt = largo });
        return r;
    }

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

    public static string Json(List<Aeropuerto> lista)
    {
        var sb = new StringBuilder("[");
        for (var i = 0; i < lista.Count; i++)
        {
            var a = lista[i];
            if (i > 0) sb.Append(", ");
            sb.Append("{\"icao\": ").Append(Texto(a.Icao)).Append(", \"nombre\": ").Append(Texto(a.Nombre))
                .Append(", \"lat\": ").Append(Muestra.N6(a.Lat)).Append(", \"lon\": ").Append(Muestra.N6(a.Lon))
                .Append(", \"elevFt\": ").Append(a.ElevFt.ToString(CultureInfo.InvariantCulture)).Append(", \"atisMhz\": [");
            for (var k = 0; k < a.Mhz.Count; k++) sb.Append(k > 0 ? ", " : "").Append(Muestra.N(a.Mhz[k]));
            sb.Append("], \"pistas\": [");
            for (var k = 0; k < a.Pistas.Count; k++)
            {
                var p = a.Pistas[k];
                sb.Append(k > 0 ? ", " : "").Append("{\"ident\": ").Append(Texto(p.Ident))
                    .Append(", \"rumboV\": ").Append(p.RumboV.ToString(CultureInfo.InvariantCulture))
                    .Append(", \"largoFt\": ").Append(p.LargoFt.ToString(CultureInfo.InvariantCulture)).Append('}');
            }
            sb.Append("]}");
        }
        return sb.Append(']').ToString();
    }

    // --volcar: [{icao, nombre, lat, lon, region}] de los aeropuertos con ATIS, para armar los nombres hablados.
    public static string ElementoVolcado(Aeropuerto a)
    {
        return "{\"icao\": " + Texto(a.Icao) + ", \"nombre\": " + Texto(a.Nombre)
            + ", \"lat\": " + Muestra.N6(a.Lat) + ", \"lon\": " + Muestra.N6(a.Lon)
            + ", \"region\": " + Texto(a.Region ?? "") + "}";
    }

    public static string JsonVolcado(List<Aeropuerto> lista)
    {
        var sb = new StringBuilder("[");
        for (var i = 0; i < lista.Count; i++) sb.Append(i > 0 ? ",\n" : "\n").Append(ElementoVolcado(lista[i]));
        return sb.Append("\n]").ToString();
    }

    // Archivo parcial del volcado (una linea JSON por ICAO terminado): el elemento del volcado, o {"icao", "atis": false}.
    public static string LineaSinAtis(string icao) { return "{\"icao\": " + Texto(icao) + ", \"atis\": false}"; }

    static string Campo(string linea, string clave)
    {
        var m = Regex.Match(linea, "\"" + clave + "\": \"((?:[^\"\\\\]|\\\\.)*)\"");
        if (!m.Success) return null;
        return Regex.Replace(m.Groups[1].Value, "\\\\(u[0-9a-fA-F]{4}|.)", x =>
            x.Groups[1].Value.Length == 5 ? ((char)int.Parse(x.Groups[1].Value.Substring(1), NumberStyles.HexNumber)).ToString() : x.Groups[1].Value);
    }

    static bool Num(string linea, string clave, out double v)
    {
        var m = Regex.Match(linea, "\"" + clave + "\": (-?[0-9.]+)");
        v = 0;
        return m.Success && double.TryParse(m.Groups[1].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out v);
    }

    // Una linea del archivo parcial. false = linea cortada o ilegible (un cierre a medias): se ignora y ese ICAO se vuelve a pedir.
    // ap queda null si el aeropuerto no tiene ATIS.
    public static bool LeerLinea(string linea, out string icao, out Aeropuerto ap)
    {
        ap = null;
        icao = null;
        linea = (linea ?? "").Trim();
        if (!linea.StartsWith("{") || !linea.EndsWith("}")) return false;
        icao = Campo(linea, "icao");
        if (string.IsNullOrEmpty(icao)) return false;
        if (linea.Contains("\"atis\": false")) return true;
        double lat, lon;
        var nombre = Campo(linea, "nombre");
        var region = Campo(linea, "region");
        if (nombre == null || region == null || !Num(linea, "lat", out lat) || !Num(linea, "lon", out lon)) { icao = null; return false; }
        ap = new Aeropuerto { Icao = icao, Nombre = nombre, Region = region, Lat = lat, Lon = lon };
        return true;
    }

    // ICAO -> aeropuerto (null = sin ATIS) de todo lo ya guardado; la ultima linea de un ICAO manda.
    public static Dictionary<string, Aeropuerto> Cargar(IEnumerable<string> lineas)
    {
        var r = new Dictionary<string, Aeropuerto>();
        foreach (var l in lineas)
        {
            string icao;
            Aeropuerto ap;
            if (LeerLinea(l, out icao, out ap)) r[icao] = ap;
        }
        return r;
    }

    // Lee el parcial aunque el escritor lo tenga abierto (File.ReadAllLines chocaria con el).
    public static List<string> LeerLineas(string ruta)
    {
        var r = new List<string>();
        using (var f = new FileStream(ruta, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
        using (var sr = new StreamReader(f, Encoding.UTF8))
        {
            string l;
            while ((l = sr.ReadLine()) != null) r.Add(l);
        }
        return r;
    }

    public static bool TopeAlcanzado(int nuevos, int max) { return nuevos >= max; }

    // total <= 0: no se sabe (se cayo antes de tener la lista).
    public static string Resumen(int listos, int total)
    {
        var de = total > 0 ? " de " + total + " (faltan " + Math.Max(0, total - listos) + ")" : "";
        return "Llevo " + listos + de + " aeropuertos guardados. Vuelve a ejecutar el mismo comando para continuar.";
    }

    public static double Nm(Lugar a, Lugar b)
    {
        double r = Math.PI / 180;
        var h = Math.Pow(Math.Sin((b.Lat - a.Lat) * r / 2), 2) + Math.Cos(a.Lat * r) * Math.Cos(b.Lat * r) * Math.Pow(Math.Sin((b.Lon - a.Lon) * r / 2), 2);
        return 2 * 3440.065 * Math.Asin(Math.Min(1, Math.Sqrt(h)));
    }

    // Los que quedan a nm o menos de pos, el mas cercano primero.
    public static List<T> Cercanos<T>(List<T> lista, Lugar pos, double nm) where T : Lugar
    {
        var dist = new List<double>();
        var r = new List<T>();
        foreach (var l in lista)
        {
            var d = Nm(pos, l);
            if (d <= nm) { r.Add(l); dist.Add(d); }
        }
        var orden = r.ToArray();
        Array.Sort(dist.ToArray(), orden);
        return new List<T>(orden);
    }

    // Sin busqueda previa o tras moverse 10 NM: buscar otra vez (Review Focus 4).
    public static bool DebeBuscar(Lugar ultima, Lugar pos)
    {
        return ultima == null || Nm(ultima, pos) >= Rebusca;
    }
}

class Opciones
{
    public bool Simulado, SinVentana;
    public string Volcar; // --volcar <archivo.json>: vuelca los aeropuertos con ATIS y sale
    public int Max = 5000; // --max N: tope de aeropuertos nuevos por corrida del volcado
    public string Url = LectorAtis.UrlPrograma;

    public static Opciones Leer(string[] args)
    {
        var o = new Opciones();
        for (var i = 0; i < args.Length; i++)
        {
            if (args[i] == "--simulado") o.Simulado = true;
            else if (args[i] == "--sin-ventana") o.SinVentana = true;
            else if (args[i] == "--volcar" && i + 1 < args.Length) o.Volcar = args[++i];
            else if (args[i] == "--max" && i + 1 < args.Length) { int n; if (int.TryParse(args[++i], out n) && n > 0) o.Max = n; }
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

    static List<Aeropuerto> conAtis = new List<Aeropuerto>(); // el hilo del simulador la reemplaza, nunca la cambia

    public static void PublicarAeropuertos(List<Aeropuerto> lista)
    {
        lock (Candado) conAtis = lista;
    }

    // Los aeropuertos con ATIS a 200 NM de la ultima posicion; sin simulador o sin posicion, [].
    static string Aeropuertos()
    {
        List<Aeropuerto> lista;
        Lugar pos;
        lock (Candado)
        {
            if (ultima == null || Ahora() - recibida >= 2) return "[]";
            lista = conAtis;
            pos = new Lugar { Lat = ultima.Lat, Lon = ultima.Lon };
        }
        return Aeropuerto.Json(Aeropuerto.Cercanos(lista, pos, Aeropuerto.Radio));
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
            && !d.Simulado && d.Url == "https://villanueva-aviation.pages.dev/atis/programa" && !d.SinVentana;
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

        // Identificador de pista: 2 cifras + L/R/C; fuera de 1-36, nada.
        var ident = Aeropuerto.Ident(19, 0) == "19" && Aeropuerto.Ident(9, 1) == "09L" && Aeropuerto.Ident(27, 2) == "27R"
            && Aeropuerto.Ident(36, 3) == "36C" && Aeropuerto.Ident(37, 0) == null && Aeropuerto.Ident(0, 0) == null && Aeropuerto.Ident(9, 4) == "09";
        Console.WriteLine(ident ? "Ident de pista: OK" : "Ident de pista: FALLA");

        // Una pista de MSFS da sus dos extremos: rumbo verdadero y el opuesto, largo en ft.
        var ex = Aeropuerto.Extremos(114.0f, 3538, 11, 2, 29, 1);
        var extremos = ex.Count == 2 && ex[0].Ident == "11R" && ex[0].RumboV == 114 && ex[0].LargoFt == 11608
            && ex[1].Ident == "29L" && ex[1].RumboV == 294 && ex[1].LargoFt == 11608
            && Aeropuerto.Extremos(270.4f, 1000, 27, 0, 40, 0).Count == 1;
        Console.WriteLine(extremos ? "Extremos de pista: OK" : "Extremos de pista: FALLA");

        // MMGL simulado: la forma exacta del contrato de /aeropuertos.
        var j = Aeropuerto.Json(new List<Aeropuerto> { Simulado.Mmgl() });
        var mmgl = j == "[{\"icao\": \"MMGL\", \"nombre\": \"Don Miguel Hidalgo Intl\", \"lat\": 20.523342, \"lon\": -103.310108, " +
            "\"elevFt\": 5016, \"atisMhz\": [127.9], \"pistas\": [{\"ident\": \"11L\", \"rumboV\": 114, \"largoFt\": 11608}, " +
            "{\"ident\": \"29R\", \"rumboV\": 294, \"largoFt\": 11608}, {\"ident\": \"11R\", \"rumboV\": 113, \"largoFt\": 13123}, " +
            "{\"ident\": \"29L\", \"rumboV\": 293, \"largoFt\": 13123}]}]";
        Console.WriteLine(mmgl ? "Json de aeropuertos: OK" : "Json de aeropuertos: FALLA " + j);

        var esc = Aeropuerto.Texto("a\"b\\c\n") == "\"a\\\"b\\\\c\\u000a\"" && Aeropuerto.Json(new List<Aeropuerto>()) == "[]";
        Console.WriteLine(esc ? "Json escapa el nombre: OK" : "Json escapa el nombre: FALLA");

        // Sin simulador ni posicion: lista vacia.
        var sinAp = Aeropuertos() == "[]";
        Console.WriteLine(sinAp ? "Aeropuertos sin simulador: OK" : "Aeropuertos sin simulador: FALLA");

        // Solo los de menos de 200 NM, el mas cercano primero (1 grado de latitud = 60 NM).
        var aqui = new Lugar { Lat = 20, Lon = -103 };
        var lista = new List<Lugar> {
            new Lugar { Icao = "LEJ", Lat = 20 + 150 / 60.0, Lon = -103 }, new Lugar { Icao = "FUE", Lat = 20 - 250 / 60.0, Lon = -103 },
            new Lugar { Icao = "CER", Lat = 20, Lon = -103 + 10 / 60.0 }, new Lugar { Icao = "MED", Lat = 20 - 60 / 60.0, Lon = -103 } };
        var c = Aeropuerto.Cercanos(lista, aqui, 200);
        var cercanos = c.Count == 3 && c[0].Icao == "CER" && c[1].Icao == "MED" && c[2].Icao == "LEJ";
        Console.WriteLine(cercanos ? "Cercanos: OK" : "Cercanos: FALLA");

        // Se vuelve a buscar al moverse 10 NM, no a los 9; sin busqueda previa, si.
        var buscar = Aeropuerto.DebeBuscar(aqui, new Lugar { Lat = 20 + 10 / 60.0, Lon = -103 })
            && !Aeropuerto.DebeBuscar(aqui, new Lugar { Lat = 20 + 9 / 60.0, Lon = -103 }) && Aeropuerto.DebeBuscar(null, aqui);
        Console.WriteLine(buscar ? "Buscar cada 10 NM: OK" : "Buscar cada 10 NM: FALLA");

        // --volcar: bandera con archivo y la forma exacta del volcado.
        var ov = Opciones.Leer(new[] { "--volcar", "v.json" });
        var vm = Simulado.Mmgl(); vm.Region = "MM";
        var jv = Aeropuerto.JsonVolcado(new List<Aeropuerto> { vm });
        var volcado = ov.Volcar == "v.json" && d.Volcar == null && Aeropuerto.JsonVolcado(new List<Aeropuerto>()) == "[\n]"
            && jv == "[\n{\"icao\": \"MMGL\", \"nombre\": \"Don Miguel Hidalgo Intl\", \"lat\": 20.523342, \"lon\": -103.310108, \"region\": \"MM\"}\n]";
        Console.WriteLine(volcado ? "Volcado: OK" : "Volcado: FALLA " + jv);

        // Archivo parcial: ida y vuelta con comillas y acentos, sin ATIS, linea cortada, repetidos; tope y mensaje.
        var raro = new Aeropuerto { Icao = "KXYZ", Nombre = "Say \"Hi\" \\ \u0001 Niño", Lat = -33.5, Lon = 20.25, Region = "K1" };
        var cargado = Aeropuerto.Cargar(new[]
        {
            Aeropuerto.ElementoVolcado(raro), Aeropuerto.LineaSinAtis("KAAA"), "", "{\"icao\": \"KCUT\", \"nombre\": \"Cor", "basura",
            Aeropuerto.LineaSinAtis("KXYZ"), Aeropuerto.ElementoVolcado(raro)
        });
        var k = cargado.ContainsKey("KXYZ") ? cargado["KXYZ"] : null;
        var parcial = cargado.Count == 2 && cargado.ContainsKey("KAAA") && cargado["KAAA"] == null && !cargado.ContainsKey("KCUT") && k != null
            && k.Nombre == raro.Nombre && k.Lat == -33.5 && k.Lon == 20.25 && k.Region == "K1"
            && Aeropuerto.TopeAlcanzado(5000, 5000) && !Aeropuerto.TopeAlcanzado(4999, 5000) && new Opciones().Max == 5000
            && Opciones.Leer(new[] { "--max", "7" }).Max == 7
            && Aeropuerto.Resumen(10, 25) == "Llevo 10 de 25 (faltan 15) aeropuertos guardados. Vuelve a ejecutar el mismo comando para continuar.";
        Console.WriteLine(parcial ? "Parcial: OK" : "Parcial: FALLA");
        return edge && perfil && banderas && puerto && sinSim && forma && vol && ruta
            && ident && extremos && mmgl && esc && sinAp && cercanos && buscar && volcado && parcial ? 0 : 1;
    }

    // --volcar: sin servidor ni ventana; conecta, pide todos los aeropuertos y escribe los que tienen ATIS.
    static int Volcar(string archivo, int max)
    {
        if (!Dlls.Preparar())
        {
            Console.WriteLine("No encontre las librerias de SimConnect en esta PC.");
            return 1;
        }
        try { return Sim.Correr(archivo, max); }
        catch (Exception e)
        {
            // MSFS se cerro o la conexion se rompio: lo terminado ya esta en el archivo parcial (se escribe linea a linea).
            Console.WriteLine("Se corto el volcado: " + e.Message);
            try
            {
                Console.WriteLine(Aeropuerto.Resumen(Aeropuerto.Cargar(Aeropuerto.LeerLineas(archivo + ".parcial.jsonl")).Count, 0));
                Console.WriteLine("Ultimos pedidos antes del corte: " + File.ReadAllText(archivo + ".pedidos.txt"));
            }
            catch (Exception) { }
            return 1;
        }
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

    public const string UrlPrograma = "https://villanueva-aviation.pages.dev/atis/programa";

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
        if (op.Volcar != null) Environment.Exit(Volcar(op.Volcar, op.Max));

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
                else if (partes[0] == "GET" && partes[1].Split('?')[0] == "/aeropuertos")
                    Responder(flujo, "200 OK", extra.ToString(), Aeropuertos());
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

    // MMGL como en MX.json, para /aeropuertos sin MSFS.
    public static Aeropuerto Mmgl()
    {
        var a = new Aeropuerto { Icao = "MMGL", Nombre = "Don Miguel Hidalgo Intl", Lat = 20.523342, Lon = -103.310108, ElevFt = 5016 };
        a.Mhz.Add(127.9);
        a.Pistas.Add(new Pista { Ident = "11L", RumboV = 114, LargoFt = 11608 });
        a.Pistas.Add(new Pista { Ident = "29R", RumboV = 294, LargoFt = 11608 });
        a.Pistas.Add(new Pista { Ident = "11R", RumboV = 113, LargoFt = 13123 });
        a.Pistas.Add(new Pista { Ident = "29L", RumboV = 293, LargoFt = 13123 });
        return a;
    }

    public static void Correr()
    {
        var inicio = LectorAtis.Ahora();
        LectorAtis.PublicarAeropuertos(new List<Aeropuerto> { Mmgl() });
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
    enum Def { Vuelo, Aeropuerto, Volcado }
    enum Req { Vuelo, Lista } // los pedidos de aeropuerto usan 100, 101...
    const uint PrimerPedido = 100;
    const int MaxAbiertos = 4;
    const int MaxAbiertosVolcado = 2; // el volcado va despacio: tumbo al simulador a 4 a toda velocidad
    const double EsperaSeg = 10; // un pedido sin respuesta (ICAO raro, excepcion) no traba la cola

    // El orden exacto de los campos manda la forma de las estructuras de abajo.
    static readonly string[] Campos =
    {
        "OPEN AIRPORT", "LATITUDE", "LONGITUDE", "ALTITUDE", "NAME", "N_RUNWAYS", "N_FREQUENCIES",
        "OPEN FREQUENCY", "TYPE", "FREQUENCY", "NAME", "CLOSE FREQUENCY",
        "OPEN RUNWAY", "LATITUDE", "LONGITUDE", "ALTITUDE", "HEADING", "LENGTH",
        "PRIMARY_NUMBER", "PRIMARY_DESIGNATOR", "SECONDARY_NUMBER", "SECONDARY_DESIGNATOR", "CLOSE RUNWAY",
        "CLOSE AIRPORT",
    };

    // --volcar: solo el aeropuerto y sus frecuencias (nombre, posicion, ATIS); sin pistas, para pedirle menos al simulador.
    static readonly string[] CamposVolcado =
    {
        "OPEN AIRPORT", "LATITUDE", "LONGITUDE", "ALTITUDE", "NAME", "N_RUNWAYS", "N_FREQUENCIES",
        "OPEN FREQUENCY", "TYPE", "FREQUENCY", "NAME", "CLOSE FREQUENCY",
        "CLOSE AIRPORT",
    };

    [StructLayout(LayoutKind.Sequential, Pack = 1, CharSet = CharSet.Ansi)]
    struct ApFac { public double Lat, Lon, Alt; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string Nombre; public int NPistas, NFrec; }

    [StructLayout(LayoutKind.Sequential, Pack = 1, CharSet = CharSet.Ansi)]
    struct FrecFac { public int Tipo, Hz; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)] public string Nombre; }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    struct PistaFac { public double Lat, Lon, Alt; public float Rumbo, Largo; public int N1, D1, N2, D2; }

    class Pedido { public string Icao; public double Desde; public uint Unico; public Aeropuerto Ap; }

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

    // Agrega al archivo parcial; si un corte dejo la ultima linea a medias, la cierra antes de seguir.
    static StreamWriter AbrirParcial(string ruta)
    {
        var cortada = File.Exists(ruta) && new FileInfo(ruta).Length > 0 && !File.ReadAllText(ruta).EndsWith("\n");
        var w = new StreamWriter(ruta, true, new UTF8Encoding(false)) { AutoFlush = true }; // cada linea sale al disco: un corte pierde pocas
        if (cortada) w.Write("\n");
        return w;
    }

    [MethodImpl(MethodImplOptions.NoInlining)]
    public static int Correr(string volcar = null, int max = 5000)
    {
        var parcial = volcar + ".parcial.jsonl";
        using (var escritor = volcar != null ? AbrirParcial(parcial) : null)
        using (var senal = new EventWaitHandle(false, EventResetMode.AutoReset))
        using (var sim = new Microsoft.FlightSimulator.SimConnect.SimConnect("Villanueva ATIS", IntPtr.Zero, 0, senal, 0))
        {
            var abierto = true;
            Console.WriteLine("Conectado a MSFS.");
            sim.OnRecvQuit += (s, d) => abierto = false;
            // Un nombre de variable mal escrito no tumba el lector: sale aqui.
            sim.OnRecvException += (s, d) => Console.WriteLine("SimConnect: excepcion " + d.dwException + " en el parametro " + d.dwIndex);
            double ultimo = -1;
            // Aeropuertos: todo se borra en cada conexion (Review Focus 5).
            var mundo = new List<Lugar>();
            var mundoListo = false;
            // ponytail: cache sin tope (cada aeropuerto se pide una vez por conexion; un vuelo largo junta unos miles de entradas chicas).
            var cache = new Dictionary<string, Aeropuerto>(); // null = sin ATIS o pedido en curso
            var conAtis = new List<Aeropuerto>();
            var cola = new Queue<string>();
            var abiertos = new Dictionary<uint, Pedido>();  // por RequestID
            var porUnico = new Dictionary<uint, Pedido>();  // por UniqueRequestId del aeropuerto, por si un hijo no trae el RequestID
            var reintentado = new HashSet<string>();         // ya vencieron una vez
            var regiones = new Dictionary<string, string>(); // region de cada aeropuerto, para el volcado
            var encolado = false;                            // --volcar: ya se encolo todo el mundo
            var nuevos = 0;                                  // --volcar: aeropuertos terminados en esta corrida
            var listos = 0;                                  // --volcar: terminados en total (parcial + esta corrida)
            var pedidos = 0;                                 // --volcar: pedidos hechos en esta corrida, para las pausas
            var maxAbiertos = volcar != null ? MaxAbiertosVolcado : MaxAbiertos;
            var siguiente = PrimerPedido;
            Lugar pos = null, buscadoEn = null;
            if (volcar == null) LectorAtis.PublicarAeropuertos(new List<Aeropuerto>());
            else
            {
                // Retoma lo ya guardado: esos ICAO no se piden otra vez.
                foreach (var kv in Aeropuerto.Cargar(Aeropuerto.LeerLineas(parcial))) { cache[kv.Key] = kv.Value; listos++; }
                if (listos > 0) Console.WriteLine("Retomo el volcado: " + listos + " aeropuertos ya guardados en " + parcial);
            }

            // definitivo = false: vencio y se va a reintentar, no se guarda todavia (solo --volcar).
            Action<uint, bool> terminar = (id, definitivo) =>
            {
                Pedido p;
                if (!abiertos.TryGetValue(id, out p)) return;
                abiertos.Remove(id);
                if (p.Unico != 0) porUnico.Remove(p.Unico);
                if (volcar != null)
                {
                    if (!definitivo) return;
                    var conAtisP = p.Ap != null && p.Ap.Mhz.Count > 0;
                    escritor.WriteLine(conAtisP ? Aeropuerto.ElementoVolcado(p.Ap) : Aeropuerto.LineaSinAtis(p.Icao));
                    listos++;
                    if (++nuevos % 1000 == 0)
                        Console.WriteLine("Volcado: " + listos + " de " + mundo.Count + " (" + nuevos + " en esta corrida); en vuelo: " + string.Join(" ", EnVuelo(abiertos)));
                    return;
                }
                if (p.Ap == null || p.Ap.Mhz.Count == 0) return; // queda null en la cache: no se vuelve a pedir
                cache[p.Icao] = p.Ap;
                conAtis.Add(p.Ap);
                LectorAtis.PublicarAeropuertos(new List<Aeropuerto>(conAtis));
            };

            // Tras cada mensaje: vence pedidos colgados, rebusca cada 10 NM y abre hasta 4, el mas cercano primero.
            Action avanzar = () =>
            {
                var ahora = LectorAtis.Ahora();
                foreach (var id in new List<uint>(abiertos.Keys))
                    if (ahora - abiertos[id].Desde > EsperaSeg)
                    {
                        // Sin respuesta (MSFS cargando, ICAO raro): se reintenta una vez enseguida, rehaciendo la cola desde el mas
                        // cercano (asi el aeropuerto de salida no se pierde con el avion parado). A la segunda queda null: no se pide mas.
                        var icao = abiertos[id].Icao;
                        Console.WriteLine("ATIS: " + icao + " no respondio");
                        var primera = reintentado.Add(icao);
                        if (primera)
                        {
                            cache.Remove(icao);
                            if (volcar != null) cola.Enqueue(icao); else buscadoEn = null;
                        }
                        terminar(id, !primera);
                    }
                if (volcar != null && mundoListo && !encolado)
                {
                    encolado = true;
                    foreach (var l in mundo) if (!cache.ContainsKey(l.Icao)) cola.Enqueue(l.Icao);
                }
                else if (volcar == null && mundoListo && pos != null && Aeropuerto.DebeBuscar(buscadoEn, pos))
                {
                    buscadoEn = pos;
                    cola.Clear();
                    foreach (var l in Aeropuerto.Cercanos(mundo, pos, Aeropuerto.Radio))
                        if (!cache.ContainsKey(l.Icao)) cola.Enqueue(l.Icao);
                }
                while (abiertos.Count < maxAbiertos && cola.Count > 0 && !(volcar != null && Aeropuerto.TopeAlcanzado(nuevos, max)))
                {
                    var icao = cola.Dequeue();
                    if (cache.ContainsKey(icao)) continue;
                    cache[icao] = null;
                    var id = siguiente++;
                    abiertos[id] = new Pedido { Icao = icao, Desde = ahora };
                    // Antes de pedir: si el simulador cae, aqui quedan los ICAO que iban en vuelo.
                    if (volcar != null)
                        try { File.WriteAllText(volcar + ".pedidos.txt", string.Join(" ", EnVuelo(abiertos))); } catch (Exception) { }
                    // Un pedido que falla (MSFS cerrandose, ICAO raro) cuenta como terminado: no ocupa lugar ni tumba la conexion.
                    try { sim.RequestFacilityData(volcar != null ? Def.Volcado : Def.Aeropuerto, (Req)id, icao, ""); }
                    catch (Exception e)
                    {
                        Console.WriteLine("ATIS: no pude pedir " + icao + ": " + e.Message);
                        abiertos.Remove(id);
                        if (volcar != null) { cache.Remove(icao); abierto = false; } // sin la conexion no hay volcado: se corta y se guarda
                        break; // el resto espera al siguiente mensaje; si MSFS se cerro, el ciclo termina
                    }
                    if (volcar != null)
                    {
                        Thread.Sleep(10);
                        if (++pedidos % 1000 == 0) Thread.Sleep(1500); // respiro para el simulador
                    }
                }
            };

            // Una excepcion en un manejador saldria de ReceiveMessage y reconectaria pidiendo otra vez los 42 000:
            // un dato ilegible tira solo ese aeropuerto.
            sim.OnRecvAirportList += (s, d) =>
            {
                var malos = 0;
                foreach (var o in d.rgData)
                {
                    try
                    {
                        var a = (SC.SIMCONNECT_DATA_FACILITY_AIRPORT)o;
                        mundo.Add(new Lugar { Icao = a.Ident, Lat = a.Latitude, Lon = a.Longitude });
                        regiones[a.Ident] = a.Region;
                    }
                    catch (Exception) { malos++; }
                }
                if (malos > 0) Console.WriteLine("ATIS: " + malos + " aeropuertos ilegibles en la lista");
                if (d.dwEntryNumber + 1 >= d.dwOutOf && !mundoListo)
                {
                    mundoListo = true;
                    Console.WriteLine("Aeropuertos en MSFS: " + mundo.Count);
                }
            };
            // Los hijos (frecuencias, pistas) llegan despues de su aeropuerto con el mismo RequestID.
            sim.OnRecvFacilityData += (s, d) =>
            {
                Pedido p;
                if (!abiertos.TryGetValue(d.UserRequestId, out p) && !porUnico.TryGetValue(d.ParentUniqueRequestId, out p)) return;
                try
                {
                    var o = d.Data[0];
                    if (o is ApFac)
                    {
                        var a = (ApFac)o;
                        p.Unico = d.UniqueRequestId;
                        if (p.Unico != 0) porUnico[p.Unico] = p;
                        string region;
                        regiones.TryGetValue(p.Icao, out region);
                        p.Ap = new Aeropuerto { Icao = p.Icao, Region = region, Nombre = (a.Nombre ?? "").Trim(), Lat = a.Lat, Lon = a.Lon, ElevFt = (int)Math.Round(a.Alt * Aeropuerto.PiesPorMetro) };
                    }
                    else if (p.Ap == null) return;
                    else if (o is FrecFac)
                    {
                        var f = (FrecFac)o;
                        var mhz = Math.Round(f.Hz / 1e6, 3);
                        if (f.Tipo == 1 && !p.Ap.Mhz.Contains(mhz)) p.Ap.Mhz.Add(mhz);
                    }
                    else if (o is PistaFac)
                    {
                        var r = (PistaFac)o;
                        p.Ap.Pistas.AddRange(Aeropuerto.Extremos(r.Rumbo, r.Largo, r.N1, r.D1, r.N2, r.D2));
                    }
                }
                catch (Exception e)
                {
                    // Sin p.Ap el resto de sus datos se ignora (sale antes del try) y al terminar queda null: una linea por aeropuerto.
                    Console.WriteLine("ATIS: dato ilegible de " + p.Icao + ": " + e.Message);
                    p.Ap = null;
                }
            };
            sim.OnRecvFacilityDataEnd += (s, d) => terminar(d.RequestId, true);

            sim.OnRecvSimobjectData += (s, d) =>
            {
                // Llegan unas 15-20 por segundo: se publica una cada 250 ms.
                if (LectorAtis.Ahora() - ultimo < 0.25) return;
                ultimo = LectorAtis.Ahora();
                var x = ((Vuelo)d.dwData[0]).Valores;
                pos = new Lugar { Lat = x[6], Lon = x[7] };
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

            foreach (var c in Campos) sim.AddToFacilityDefinition(Def.Aeropuerto, c);
            foreach (var c in CamposVolcado) sim.AddToFacilityDefinition(Def.Volcado, c);
            sim.RegisterFacilityDataDefineStruct<ApFac>(SC.SIMCONNECT_FACILITY_DATA_TYPE.AIRPORT);
            sim.RegisterFacilityDataDefineStruct<FrecFac>(SC.SIMCONNECT_FACILITY_DATA_TYPE.FREQUENCY);
            sim.RegisterFacilityDataDefineStruct<PistaFac>(SC.SIMCONNECT_FACILITY_DATA_TYPE.RUNWAY);
            // La lista del mundo (unos 42 000) llega en paginas, aun en el menu principal.
            sim.RequestFacilitiesList(SC.SIMCONNECT_FACILITY_LIST_TYPE.AIRPORT, Req.Lista);
            while (abierto)
            {
                if (senal.WaitOne(10000)) sim.ReceiveMessage();
                avanzar();
                if (volcar != null && encolado && abiertos.Count == 0)
                {
                    if (cola.Count == 0)
                    {
                        // Todo terminado: el archivo final sale del parcial.
                        var hechos = Aeropuerto.Cargar(Aeropuerto.LeerLineas(parcial));
                        var ats = new List<Aeropuerto>();
                        foreach (var a in hechos.Values) if (a != null) ats.Add(a);
                        ats.Sort((x, y) => string.CompareOrdinal(x.Icao, y.Icao));
                        File.WriteAllText(volcar, Aeropuerto.JsonVolcado(ats), new UTF8Encoding(false));
                        Console.WriteLine("Volcado listo: " + ats.Count + " aeropuertos con ATIS de " + hechos.Count + " en " + volcar);
                        return 0;
                    }
                    if (Aeropuerto.TopeAlcanzado(nuevos, max))
                    {
                        Console.WriteLine("Llegue al tope de " + max + " aeropuertos nuevos en esta corrida.");
                        Console.WriteLine(Aeropuerto.Resumen(listos, mundo.Count));
                        return 2; // no hay archivo final todavia
                    }
                }
            }
            if (volcar == null) return 0;
            // MSFS se cerro (o la conexion se rompio) antes de terminar: lo guardado queda en el parcial.
            Console.WriteLine("MSFS se cerro o se perdio la conexion antes de terminar el volcado.");
            Console.WriteLine(Aeropuerto.Resumen(listos, mundo.Count));
            Console.WriteLine("Ultimos pedidos (sin respuesta): " + string.Join(" ", EnVuelo(abiertos)) + ". Estan en " + volcar + ".pedidos.txt");
            return 1;
        }
    }

    static List<string> EnVuelo(Dictionary<uint, Pedido> abiertos)
    {
        var r = new List<string>();
        foreach (var p in abiertos.Values) r.Add(p.Icao);
        return r;
    }
}
