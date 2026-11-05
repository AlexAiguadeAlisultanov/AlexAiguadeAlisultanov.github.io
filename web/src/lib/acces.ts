// Quien puede entrar lo decide la API, no esta pagina: aqui no hay ninguna contrasena,
// ni en claro ni cifrada. El navegador manda usuario y contrasena, y lo que vuelve es un
// token y el rol.

export type Rol = "invitado" | "admin";
export type FallaAcces = "empty" | "creds" | "net" | "time" | "server";

// Interruptor de la pantalla de acceso. En false, el portafolio se abre directo
// (como invitado) sin pedir usuario ni contrasena: util para enlazarlo en abierto
// (LinkedIn, etc.). Todo el login se queda guardado; para volver a exigirlo, basta
// con poner esto en true.
export const ACCESO_ACTIVO = false;

const PRODUCCIO = "https://portfolio-acceso.onrender.com";

// En desarrollo las llamadas van por el proxy de Vite. La API solo acepta el dominio
// publicado como Origin, asi que desde localhost el navegador las bloquearia; el proxy
// las reenvia desde el servidor, donde no hay CORS. Sigue haciendo falta la contrasena
// de verdad: esto no salta ningun control.
const BASE = import.meta.env.DEV ? "/acceso-dev" : PRODUCCIO;

const CLAU_SESSIO = "portafoli-sessio";
const ESPERA = 120000;  // el servidor duerme en un plan gratuito: hay que darle margen

export type Sessio = { token: string; expira: number };

export function desarSessio(token: string, expira: unknown): void {
  try {
    window.localStorage.setItem(
      CLAU_SESSIO,
      JSON.stringify({ token, expira: Number(expira) || 0 })
    );
  } catch {
    // Ventana privada o almacenamiento bloqueado: la sesion dura lo que la pestana.
  }
}

export function oblidarSessio(): void {
  try {
    window.localStorage.removeItem(CLAU_SESSIO);
  } catch {
    // Si no se puede borrar, el token caduca solo en el servidor.
  }
}

export function sessioDesada(): Sessio | null {
  try {
    const cru = window.localStorage.getItem(CLAU_SESSIO);
    if (!cru) return null;
    const dades = JSON.parse(cru) as Partial<Sessio>;
    if (!dades || typeof dades.token !== "string" || !dades.token) return null;
    // Si ya sabemos que ha caducado, ni se pregunta.
    if (dades.expira && Date.now() > Number(dades.expira)) return null;
    return { token: dades.token, expira: Number(dades.expira) || 0 };
  } catch {
    return null;
  }
}

/** Una llamada con su propio limite de tiempo, porque el servidor puede estar dormido. */
async function cridar(cami: string, opcions: RequestInit): Promise<Response> {
  const control = new AbortController();
  let perTemps = false;
  const limit = window.setTimeout(() => {
    perTemps = true;
    control.abort();
  }, ESPERA);

  try {
    return await fetch(BASE + cami, { ...opcions, signal: control.signal });
  } catch (error) {
    throw perTemps ? new Error("temps") : error;
  } finally {
    window.clearTimeout(limit);
  }
}

function rolValid(valor: unknown): Rol {
  return String(valor) === "admin" ? "admin" : "invitado";
}

export type ResultatEntrada =
  | { ok: true; rol: Rol; token: string; expira: number }
  | { ok: false; falla: FallaAcces };

export async function entrar(usuario: string, contrasena: string): Promise<ResultatEntrada> {
  let resposta: Response;
  try {
    resposta = await cridar("/api/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
      cache: "no-store",
      credentials: "omit"
    });
  } catch (error) {
    const perTemps = error instanceof Error && error.message === "temps";
    return { ok: false, falla: perTemps ? "time" : "net" };
  }

  if (resposta.status === 401) return { ok: false, falla: "creds" };
  if (!resposta.ok) return { ok: false, falla: "server" };

  try {
    const dades = (await resposta.json()) as Record<string, unknown>;
    if (!dades || dades.ok !== true || typeof dades.token !== "string" || !dades.token) {
      return { ok: false, falla: "server" };
    }
    return {
      ok: true,
      rol: rolValid(dades.rol),
      token: dades.token,
      expira: Number(dades.expira) || 0
    };
  } catch {
    return { ok: false, falla: "server" };
  }
}

/** Le pregunta a la API si el token guardado todavia vale. Devuelve el rol o nada. */
export async function comprovarSessio(token: string): Promise<Rol | null> {
  let resposta: Response;
  try {
    resposta = await cridar("/api/yo", {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      credentials: "omit"
    });
  } catch {
    // Sin red o sin respuesta a tiempo se deja el token donde esta: puede valer en la
    // proxima visita.
    return null;
  }

  if (resposta.status === 401) {
    // El token ya no vale: se tira y se pide entrar otra vez.
    oblidarSessio();
    return null;
  }
  if (!resposta.ok) return null;

  try {
    const dades = (await resposta.json()) as Record<string, unknown>;
    return dades && dades.ok === true ? rolValid(dades.rol) : null;
  } catch {
    return null;
  }
}

/* ---------- Panel de mantenimiento ----------
   Login de administrador aparte del acceso normal al portafolio: tiene su propia clave en
   el servidor, su propio token y su propia sesion guardada, sin pisar la del invitado. Aqui
   tampoco vive ninguna contrasena; quien entra lo decide la API. */

const CLAU_MANT = "portafoli-mant";

export type ProjecteMant = {
  nombre: string;
  descripcion: string;
  url: string;
  repo?: string;
  oculto?: boolean;
};

// "auth" solo sale al cargar la lista: el token ya no vale y hay que volver a entrar.
export type FallaMant = "creds" | "config" | "rate" | "net" | "time" | "server" | "auth";

export type ResultatMant =
  | { ok: true; token: string; expira: number }
  | { ok: false; falla: FallaMant };

export type ResultatProjectes =
  | { ok: true; proyectos: ProjecteMant[] }
  | { ok: false; falla: FallaMant };

export function desarMant(token: string, expira: unknown): void {
  try {
    window.localStorage.setItem(
      CLAU_MANT,
      JSON.stringify({ token, expira: Number(expira) || 0 })
    );
  } catch {
    // Ventana privada o almacenamiento bloqueado: la sesion dura lo que la pestana.
  }
}

export function oblidarMant(): void {
  try {
    window.localStorage.removeItem(CLAU_MANT);
  } catch {
    // Si no se puede borrar, el token caduca solo en el servidor.
  }
}

export function mantDesada(): Sessio | null {
  try {
    const cru = window.localStorage.getItem(CLAU_MANT);
    if (!cru) return null;
    const dades = JSON.parse(cru) as Partial<Sessio>;
    if (!dades || typeof dades.token !== "string" || !dades.token) return null;
    if (dades.expira && Date.now() > Number(dades.expira)) return null;
    return { token: dades.token, expira: Number(dades.expira) || 0 };
  } catch {
    return null;
  }
}

function netejarProjecte(cru: unknown): ProjecteMant {
  const p = (cru ?? {}) as Record<string, unknown>;
  return {
    nombre: typeof p.nombre === "string" ? p.nombre : "",
    descripcion: typeof p.descripcion === "string" ? p.descripcion : "",
    url: typeof p.url === "string" ? p.url : "",
    repo: typeof p.repo === "string" && p.repo ? p.repo : undefined,
    oculto: p.oculto === true
  };
}

/** Entra al panel con la cuenta de admin. El servidor compara la clave; aqui no hay ninguna. */
export async function entrarMantenimiento(usuario: string, clave: string): Promise<ResultatMant> {
  let resposta: Response;
  try {
    resposta = await cridar("/api/mantenimiento/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usuario, clave }),
      cache: "no-store",
      credentials: "omit"
    });
  } catch (error) {
    const perTemps = error instanceof Error && error.message === "temps";
    return { ok: false, falla: perTemps ? "time" : "net" };
  }

  if (resposta.status === 401) return { ok: false, falla: "creds" };
  if (resposta.status === 429) return { ok: false, falla: "rate" };
  if (resposta.status === 503) return { ok: false, falla: "config" };
  if (!resposta.ok) return { ok: false, falla: "server" };

  try {
    const dades = (await resposta.json()) as Record<string, unknown>;
    if (!dades || dades.ok !== true || typeof dades.token !== "string" || !dades.token) {
      return { ok: false, falla: "server" };
    }
    return { ok: true, token: dades.token, expira: Number(dades.expira) || 0 };
  } catch {
    return { ok: false, falla: "server" };
  }
}

/** Trae la lista de proyectos del panel (incluidos los ocultos). Si el token ya no vale, lo tira. */
export async function cargarMantenimiento(token: string): Promise<ResultatProjectes> {
  let resposta: Response;
  try {
    resposta = await cridar("/api/mantenimiento", {
      headers: { Authorization: "Bearer " + token, Accept: "application/json" },
      cache: "no-store",
      credentials: "omit"
    });
  } catch (error) {
    const perTemps = error instanceof Error && error.message === "temps";
    return { ok: false, falla: perTemps ? "time" : "net" };
  }

  if (resposta.status === 401) {
    oblidarMant();
    return { ok: false, falla: "auth" };
  }
  if (!resposta.ok) return { ok: false, falla: "server" };

  try {
    const dades = (await resposta.json()) as Record<string, unknown>;
    if (!dades || dades.ok !== true || !Array.isArray(dades.proyectos)) {
      return { ok: false, falla: "server" };
    }
    return { ok: true, proyectos: dades.proyectos.map(netejarProjecte) };
  } catch {
    return { ok: false, falla: "server" };
  }
}
