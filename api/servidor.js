// Comprueba quién entra en el portfolio.
//
// Existe porque el portfolio es una web estática en GitHub Pages: ahí no hay dónde
// guardar una contraseña, y cualquier comprobación hecha en el navegador la lee
// quien abra las herramientas de desarrollo. Esto sí es un servidor: las
// contraseñas viven cifradas en la base y nunca salen de aquí.
//
// Variables de entorno:
//   DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME   la base de datos
//   FIRMA                                          secreto para firmar los pases
//   ORIGEN                                         de dónde se aceptan peticiones
//   PORT                                           lo pone el hosting

import { createServer } from "node:http";
import { createHmac, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";
import mysql from "mysql2/promise";

const PUERTO = Number(process.env.PORT ?? 3000);
const FIRMA = process.env.FIRMA ?? "";
const ORIGEN = process.env.ORIGEN ?? "https://alexaiguadealisultanov.github.io";
const HORAS = 12;

if (!FIRMA) {
  console.error("Falta FIRMA: sin ella cualquiera podría fabricarse un pase.");
  process.exit(1);
}

const base = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 4000),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? "portfolio",
  ssl: { minVersion: "TLSv1.2" },
  waitForConnections: true,
  connectionLimit: 4,
});

/* ---------- Pases ---------- */

// Un pase es "datos.firma". Los datos se ven, pero sin la firma no se pueden
// cambiar: cualquier retoque deja de cuadrar con el HMAC.
function firmar(datos) {
  return createHmac("sha256", FIRMA).update(datos).digest("base64url");
}

function crearPase(usuario, rol) {
  const caduca = Date.now() + HORAS * 3600 * 1000;
  const datos = Buffer.from(JSON.stringify({ usuario, rol, caduca, id: randomUUID() })).toString("base64url");
  return { pase: datos + "." + firmar(datos), caduca };
}

function leerPase(pase) {
  if (typeof pase !== "string" || !pase.includes(".")) return null;
  const [datos, firma] = pase.split(".");
  const esperada = firmar(datos);
  // timingSafeEqual y no ===, para no ir filtrando la firma carácter a carácter.
  if (firma.length !== esperada.length) return null;
  if (!timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))) return null;
  try {
    const cuerpo = JSON.parse(Buffer.from(datos, "base64url").toString());
    if (Date.now() > cuerpo.caduca) return null;
    return cuerpo;
  } catch {
    return null;
  }
}

/* ---------- Contraseñas ---------- */

function contrasenaCorrecta(contrasena, guardado) {
  const [algoritmo, sal, esperado] = String(guardado).split("$");
  if (algoritmo !== "scrypt" || !sal || !esperado) return false;
  const calculado = scryptSync(contrasena, sal, 64).toString("hex");
  if (calculado.length !== esperado.length) return false;
  return timingSafeEqual(Buffer.from(calculado), Buffer.from(esperado));
}

/* ---------- Freno a la fuerza bruta ---------- */

// Sin esto, con dos usuarios conocidos y un bucle se acaba adivinando. Se cuenta
// por IP y se olvida solo.
const intentos = new Map();
const LIMITE = 8;
const VENTANA = 10 * 60 * 1000;

function demasiados(ip) {
  const ahora = Date.now();
  const previos = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA);
  intentos.set(ip, previos);
  return previos.length >= LIMITE;
}

function anotarFallo(ip) {
  const previos = intentos.get(ip) ?? [];
  previos.push(Date.now());
  intentos.set(ip, previos);
}

setInterval(() => {
  const ahora = Date.now();
  for (const [ip, lista] of intentos) {
    const vivos = lista.filter((t) => ahora - t < VENTANA);
    if (vivos.length) intentos.set(ip, vivos);
    else intentos.delete(ip);
  }
}, VENTANA).unref();

/* ---------- Servidor ---------- */

function responder(res, codigo, cuerpo) {
  const texto = JSON.stringify(cuerpo);
  res.writeHead(codigo, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": ORIGEN,
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-max-age": "86400",
    "cache-control": "no-store",
  });
  res.end(texto);
}

async function leerCuerpo(req) {
  const trozos = [];
  let total = 0;
  for await (const t of req) {
    total += t.length;
    // Un cuerpo enorme solo puede ser alguien haciendo el tonto.
    if (total > 4096) throw new Error("demasiado grande");
    trozos.push(t);
  }
  return JSON.parse(Buffer.concat(trozos).toString() || "{}");
}

const servidor = createServer(async (req, res) => {
  const ruta = (req.url ?? "/").split("?")[0];

  if (req.method === "OPTIONS") return responder(res, 204, {});
  if (ruta === "/api/salud") return responder(res, 200, { ok: true });

  if (ruta === "/api/entrar" && req.method === "POST") {
    const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0].trim();
    if (demasiados(ip)) {
      return responder(res, 429, { error: "Demasiados intentos. Prueba dentro de un rato." });
    }
    let cuerpo;
    try {
      cuerpo = await leerCuerpo(req);
    } catch {
      return responder(res, 400, { error: "Petición mal formada." });
    }
    const usuario = String(cuerpo.usuario ?? "").trim().toLowerCase();
    const contrasena = String(cuerpo.contrasena ?? "");
    if (!usuario || !contrasena) {
      return responder(res, 400, { error: "Faltan el usuario o la contraseña." });
    }
    try {
      const [filas] = await base.query("SELECT hash, rol FROM usuarios WHERE usuario = ? LIMIT 1", [usuario]);
      const fila = filas[0];
      // Mismo mensaje tanto si el usuario no existe como si la contraseña falla:
      // decir cuál de los dos ha fallado es regalar la mitad del trabajo.
      if (!fila || !contrasenaCorrecta(contrasena, fila.hash)) {
        anotarFallo(ip);
        return responder(res, 401, { error: "El usuario o la contraseña no son correctos." });
      }
      const { pase, caduca } = crearPase(usuario, fila.rol);
      return responder(res, 200, { ok: true, rol: fila.rol, token: pase, expira: caduca });
    } catch (e) {
      console.error("Error consultando la base:", e.message);
      return responder(res, 503, { error: "No se ha podido comprobar el acceso." });
    }
  }

  if (ruta === "/api/yo" && req.method === "GET") {
    const cabecera = String(req.headers.authorization ?? "");
    const pase = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";
    const cuerpo = leerPase(pase);
    if (!cuerpo) return responder(res, 401, { error: "La sesión no vale o ha caducado." });
    return responder(res, 200, { ok: true, rol: cuerpo.rol, usuario: cuerpo.usuario });
  }

  responder(res, 404, { error: "No encontrado." });
});

servidor.listen(PUERTO, "0.0.0.0", () => {
  console.log(`Acceso del portfolio escuchando en el puerto ${PUERTO}`);
  console.log(`Aceptando peticiones de ${ORIGEN}`);
});
