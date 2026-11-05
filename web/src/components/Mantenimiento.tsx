// Panel interno de mantenimiento. Vive dentro del portafolio pero detras de su propio login
// de administrador, que valida la API (aqui no hay ninguna clave). Se abre con el hash
// #mantenimiento y ensena la lista completa de proyectos, incluidos los que no salen en el
// portafolio publico. Esta en castellano a proposito: es una pantalla interna, no de cara al
// visitante.

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  cargarMantenimiento,
  desarMant,
  entrarMantenimiento,
  mantDesada,
  oblidarMant
} from "../lib/acces";
import type { FallaMant, ProjecteMant } from "../lib/acces";
import { Enrere, Escut, Fletxa, GitHub } from "./Icones";
import logo from "../assets/logo.png";

const AVIS_LENT = 5000; // a partir de aqui se avisa de que el servidor esta arrancando

// Cada fallo con su frase: dice que paso y como seguir, sin tecnicismos del servidor.
const MISSATGE: Record<FallaMant | "empty", string> = {
  empty: "Escribe el usuario y la contraseña.",
  creds: "El usuario o la contraseña no son correctos.",
  config: "El panel todavía no está configurado en el servidor.",
  rate: "Demasiados intentos. Espera un momento antes de volver a probar.",
  net: "No se ha podido contactar con el servidor. Mira la conexión y vuelve a intentarlo.",
  time: "El servidor no ha contestado a tiempo. Vuelve a intentarlo.",
  server: "El servidor ha contestado con un error. Prueba otra vez dentro de un momento.",
  auth: "La sesión ha caducado. Entra otra vez."
};

const LENT = "El servidor estaba dormido y está arrancando. Cerca de un minuto es lo normal.";

const camp =
  "h-11 w-full rounded-[8px] border border-linia bg-fons-2 px-4 text-[15px] text-tinta " +
  "outline-none transition-colors duration-200 placeholder:text-tinta-3 " +
  "focus:border-accent aria-[invalid=true]:border-malament";

const CARD =
  "flex flex-col rounded-[20px] border border-linia bg-fons-2/60 p-6 " +
  "transition-colors duration-200 hover:border-accent/30";

const PRIMARI =
  "inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-accent px-4 text-[14px] " +
  "font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2";

const SECUNDARI =
  "inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-linia px-4 text-[14px] " +
  "font-medium text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta";

/* ---------- Tarjeta de un proyecto ---------- */

function Targeta({ projecte }: { projecte: ProjecteMant }) {
  const { nombre, descripcion, url, repo, oculto } = projecte;
  return (
    <li className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-tight text-tinta">{nombre}</h2>
        {oculto ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-espera/40 bg-espera/10 px-2.5 py-1 text-[12px] font-medium uppercase tracking-[0.08em] text-espera">
            <span aria-hidden className="size-1.5 rounded-full bg-espera" />
            Oculto
          </span>
        ) : null}
      </div>

      {descripcion ? (
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-tinta-2">{descripcion}</p>
      ) : (
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-tinta-3">Sin descripción.</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className={PRIMARI}>
            Abrir demo
            <Fletxa className="text-[18px]" />
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center text-[14px] text-tinta-3">
            Pendiente de desplegar
          </span>
        )}
        {repo ? (
          <a href={repo} target="_blank" rel="noopener noreferrer" className={SECUNDARI}>
            Código
            <GitHub className="text-[18px]" />
          </a>
        ) : null}
      </div>
    </li>
  );
}

/* ---------- Panel ---------- */

export function Mantenimiento({ tornar }: { tornar: () => void }) {
  const quiet = useReducedMotion();

  const [token, setToken] = useState<string | null>(() => mantDesada()?.token ?? null);

  // Formulario de acceso.
  const [usuari, setUsuari] = useState("admin");
  const [clau, setClau] = useState("");
  const [enviant, setEnviant] = useState(false);
  const [errLogin, setErrLogin] = useState<FallaMant | "empty" | "">("");
  const [lentLogin, setLentLogin] = useState(false);
  const [avis, setAvis] = useState(false); // la sesion caduco mientras se usaba el panel

  // Lista de proyectos.
  const [projectes, setProjectes] = useState<ProjecteMant[] | null>(null);
  const [carregant, setCarregant] = useState(false);
  const [errLlista, setErrLlista] = useState<FallaMant | "">("");
  const [lentLlista, setLentLlista] = useState(false);
  const [intent, setIntent] = useState(0); // para reintentar la carga

  const clauRef = useRef<HTMLInputElement>(null);

  // Al abrirse, arriba del todo.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Sin sesion, el foco va a la contrasena: el usuario ya viene puesto en "admin".
  useEffect(() => {
    if (token) return;
    try {
      clauRef.current?.focus({ preventScroll: true });
    } catch {
      clauRef.current?.focus();
    }
  }, [token]);

  // Con token, se pide la lista. Si el token ya no vale se vuelve al login con un aviso.
  useEffect(() => {
    if (!token) return;

    let viu = true;
    setCarregant(true);
    setErrLlista("");
    setLentLlista(false);
    const rellotge = window.setTimeout(() => {
      if (viu) setLentLlista(true);
    }, AVIS_LENT);

    cargarMantenimiento(token).then((res) => {
      if (!viu) return;
      window.clearTimeout(rellotge);
      setLentLlista(false);
      setCarregant(false);
      if (res.ok) {
        setProjectes(res.proyectos);
        return;
      }
      if (res.falla === "auth") {
        setToken(null);
        setProjectes(null);
        setAvis(true);
        return;
      }
      setErrLlista(res.falla);
    });

    return () => {
      viu = false;
      window.clearTimeout(rellotge);
    };
  }, [token, intent]);

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviant) return;

    const nom = usuari.trim();
    if (!nom || !clau) {
      setErrLogin("empty");
      clauRef.current?.focus();
      return;
    }

    setEnviant(true);
    setErrLogin("");
    setAvis(false);
    setLentLogin(false);
    const rellotge = window.setTimeout(() => setLentLogin(true), AVIS_LENT);

    const res = await entrarMantenimiento(nom, clau);
    window.clearTimeout(rellotge);
    setLentLogin(false);

    if (!res.ok) {
      setEnviant(false);
      setErrLogin(res.falla);
      clauRef.current?.focus();
      return;
    }

    desarMant(res.token, res.expira);
    setClau("");
    setEnviant(false);
    setToken(res.token);
  };

  const sortir = () => {
    oblidarMant();
    setToken(null);
    setProjectes(null);
    setErrLlista("");
    setClau("");
    setAvis(false);
  };

  const ocults = projectes ? projectes.filter((p) => p.oculto).length : 0;
  // Los ocultos primero: son lo que no se ve en la web, lo que hay que vigilar.
  const ordenats = projectes
    ? [...projectes].sort((a, b) => Number(b.oculto) - Number(a.oculto))
    : [];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-50 border-b border-linia/70 bg-fons/80 backdrop-blur-xl">
        <div className="ample flex h-14 items-center justify-between gap-3">
          <button
            type="button"
            onClick={tornar}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-[8px] pr-2 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:text-tinta"
          >
            <Enrere className="text-[18px] transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" />
            Volver al portafolio
          </button>
          <div className="flex items-center gap-3">
            {token ? (
              <button
                type="button"
                onClick={sortir}
                className="inline-flex min-h-[44px] items-center rounded-[8px] border border-linia px-3 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta"
              >
                Salir
              </button>
            ) : null}
            <img src={logo} alt="" width={32} height={32} className="h-8 w-8" />
          </div>
        </div>
      </header>

      <main className="ample py-12 sm:py-16">
        <motion.div
          initial={quiet ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {token ? (
            /* ---------- Con sesion: la lista ---------- */
            <section aria-labelledby="mant-titol">
              <span className="inline-flex items-center gap-2 text-[14px] font-medium uppercase tracking-[0.16em] text-accent">
                <Escut className="text-[18px]" />
                Panel interno
              </span>
              <h1 id="mant-titol" className="titular titular--l mt-3">
                Mantenimiento
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-tinta-2">
                {carregant
                  ? "Cargando los proyectos."
                  : projectes
                    ? `${projectes.length} ${projectes.length === 1 ? "proyecto" : "proyectos"}${
                        ocults ? ` · ${ocults} ${ocults === 1 ? "oculto" : "ocultos"}` : ""
                      }`
                    : "Lista de todos los proyectos, incluidos los que no salen en el portafolio."}
              </p>

              {carregant ? (
                <p role="status" className="mt-10 flex items-start gap-2 text-[14px] leading-relaxed text-tinta-3">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                  {lentLlista ? LENT : "Comprobando la sesión y pidiendo la lista."}
                </p>
              ) : errLlista ? (
                <div className="mt-10">
                  <p role="alert" className="text-[15px] leading-relaxed text-malament">
                    {MISSATGE[errLlista]}
                  </p>
                  <button type="button" onClick={() => setIntent((n) => n + 1)} className={`${SECUNDARI} mt-5`}>
                    Volver a intentarlo
                  </button>
                </div>
              ) : ordenats.length ? (
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {ordenats.map((p, i) => (
                    <Targeta key={p.repo ?? p.url ?? p.nombre ?? i} projecte={p} />
                  ))}
                </ul>
              ) : (
                <p className="mt-10 text-[15px] leading-relaxed text-tinta-3">
                  Todavía no hay proyectos en la lista.
                </p>
              )}
            </section>
          ) : (
            /* ---------- Sin sesion: el login ---------- */
            <div className="mx-auto max-w-[420px]">
              <span className="inline-flex items-center gap-2 text-[14px] font-medium uppercase tracking-[0.16em] text-accent">
                <Escut className="text-[18px]" />
                Panel interno
              </span>
              <h1 className="titular titular--l mt-3">Mantenimiento</h1>
              <p className="mt-4 text-[15px] leading-relaxed text-tinta-2">
                Entra con la cuenta de administrador para ver la lista completa de proyectos.
              </p>

              <form
                onSubmit={enviar}
                noValidate
                aria-busy={enviant}
                className="mt-8 rounded-[20px] border border-linia bg-fons-2/80 p-6 backdrop-blur-xl sm:p-8"
              >
                {avis ? (
                  <p role="status" className="mb-5 text-[14px] leading-relaxed text-tinta-3">
                    {MISSATGE.auth}
                  </p>
                ) : null}

                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[14px] font-medium text-tinta-2">Usuario</span>
                    <input
                      className={camp}
                      name="usuario"
                      type="text"
                      value={usuari}
                      onChange={(e) => {
                        setUsuari(e.target.value);
                        if (errLogin) setErrLogin("");
                      }}
                      aria-invalid={errLogin ? true : undefined}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[14px] font-medium text-tinta-2">Contraseña</span>
                    <input
                      ref={clauRef}
                      className={camp}
                      name="contrasena"
                      type="password"
                      value={clau}
                      onChange={(e) => {
                        setClau(e.target.value);
                        if (errLogin) setErrLogin("");
                      }}
                      aria-invalid={errLogin ? true : undefined}
                      autoComplete="current-password"
                    />
                  </label>
                </div>

                {errLogin ? (
                  <p role="alert" className="mt-4 text-[14px] leading-relaxed text-malament">
                    {MISSATGE[errLogin]}
                  </p>
                ) : null}

                <button
                  type="submit"
                  aria-disabled={enviant}
                  className="mt-6 h-12 w-full rounded-[8px] bg-accent text-[15px] font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2 aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:bg-accent"
                >
                  {enviant ? "Comprobando" : "Entrar"}
                </button>

                {lentLogin ? (
                  <p role="status" className="mt-4 flex items-start gap-2 text-[14px] leading-relaxed text-tinta-3">
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                    {LENT}
                  </p>
                ) : null}
              </form>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
