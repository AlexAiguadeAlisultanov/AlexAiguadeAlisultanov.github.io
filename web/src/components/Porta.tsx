// Pantalla de acceso. Es lo primero y lo unico que se ve hasta que la API dice quien
// entra. El contenido del portafolio no se monta hasta entonces.

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { comprovarSessio, desarSessio, entrar, sessioDesada } from "../lib/acces";
import type { FallaAcces, Rol } from "../lib/acces";
import { Idiomes } from "./Idiomes";
import { Escut } from "./Icones";

const AVIS_LENT = 5000;  // a partir de aqui se dice que el servidor esta arrancando

export function Porta({ obrir }: { obrir: (rol: Rol) => void }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();

  const [usuari, setUsuari] = useState("invitado");
  const [clau, setClau] = useState("plebeyo1234");
  const [enviant, setEnviant] = useState(false);
  const [error, setError] = useState<FallaAcces | "">("");
  const [pista, setPista] = useState<Clau | "">("");

  const botoRef = useRef<HTMLButtonElement>(null);
  const clauRef = useRef<HTMLInputElement>(null);
  const lent = useRef<number | null>(null);

  const pararLent = () => {
    if (lent.current) window.clearTimeout(lent.current);
    lent.current = null;
  };

  // Los dos campos vienen puestos: lo unico que queda por hacer es pulsar el boton, asi
  // que el foco va ahi. Quien quiera otra cuenta borra los campos y escribe.
  useEffect(() => {
    try {
      botoRef.current?.focus({ preventScroll: true });
    } catch {
      botoRef.current?.focus();
    }
  }, []);

  // Al cargar, si hay un token guardado se le pregunta a la API si todavia vale. No se
  // bloquea el formulario mientras tanto: quien quiera entrar a mano puede hacerlo.
  useEffect(() => {
    const desada = sessioDesada();
    if (!desada) return;

    let comprovant = true;
    setPista("porta.checking");
    lent.current = window.setTimeout(() => {
      if (comprovant) setPista("porta.slow");
    }, AVIS_LENT);

    comprovarSessio(desada.token).then((rol) => {
      if (!comprovant) return;
      comprovant = false;
      pararLent();
      if (rol) {
        obrir(rol);
        return;
      }
      setPista("");
    });

    // Si el formulario se usa antes de que conteste, o React vuelve a montar el efecto,
    // esta comprobacion se deja de lado sin tocar lo que haya escrito la persona.
    return () => {
      comprovant = false;
      pararLent();
    };
  }, [obrir]);

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (enviant) return;

    const nom = usuari.trim();
    if (!nom || !clau) {
      setError("empty");
      clauRef.current?.focus();
      return;
    }

    setEnviant(true);
    setError("");
    setPista("");
    pararLent();
    lent.current = window.setTimeout(() => setPista("porta.slow"), AVIS_LENT);

    const resultat = await entrar(nom, clau);
    pararLent();
    setPista("");

    if (!resultat.ok) {
      setEnviant(false);
      setError(resultat.falla);
      clauRef.current?.focus();
      return;
    }

    desarSessio(resultat.token, resultat.expira);
    setClau("");
    setEnviant(false);
    obrir(resultat.rol);
  };

  const reintent = error === "net" || error === "time" || error === "server";
  const etiqueta: Clau = enviant ? "porta.sending" : reintent ? "porta.retry" : "porta.enter";

  const camp =
    "h-11 w-full rounded-[8px] border border-linia bg-fons-2 px-4 text-[15px] text-tinta " +
    "outline-none transition-colors duration-200 placeholder:text-tinta-3 " +
    "focus:border-accent aria-[invalid=true]:border-malament";

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        {/* En pantallas estrechas se queda solo el escudo: la palabra y los tres botones
            de idioma no caben en la misma fila sin pisarse. */}
        <span className="inline-flex min-w-0 items-center gap-2 text-[14px] font-medium uppercase tracking-[0.18em] text-tinta-3">
          <Escut className="shrink-0 text-[20px] text-accent" />
          <span className="hidden truncate sm:inline">{t("porta.eyebrow")}</span>
        </span>
        <Idiomes />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
        <motion.div
          initial={quiet ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="grid w-full max-w-[1400px] items-center gap-12 lg:grid-cols-[1.15fr_minmax(340px,420px)] lg:gap-20"
        >
          <div>
            <h1 className="titular titular--xl">
              Alex
              <br />
              Aiguadé
            </h1>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-tinta-2 sm:text-base">
              {t("porta.titular")}
            </p>
          </div>

          <form
            onSubmit={enviar}
            noValidate
            aria-busy={enviant}
            className="rounded-[20px] border border-linia bg-fons-2/80 p-6 backdrop-blur-xl sm:p-8"
          >
            {/* La cuenta de invitado viene puesta, contrasena incluida: entrar es pulsar
                el boton. Que esa contrasena este a la vista da igual, solo abre la
                visita. La de administrador no esta aqui y la comprueba el servidor. */}
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[14px] font-medium text-tinta-2">
                  {t("porta.user")}
                </span>
                <input
                  className={camp}
                  name="usuario"
                  type="text"
                  value={usuari}
                  onChange={(e) => {
                    setUsuari(e.target.value);
                    if (error) setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[14px] font-medium text-tinta-2">
                  {t("porta.pass")}
                </span>
                <input
                  ref={clauRef}
                  className={camp}
                  name="contrasena"
                  type="password"
                  value={clau}
                  onChange={(e) => {
                    setClau(e.target.value);
                    if (error) setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  autoComplete="current-password"
                />
              </label>
            </div>

            {error ? (
              <p role="alert" className="mt-4 text-[14px] leading-relaxed text-malament">
                {t(("porta.err." + error) as Clau)}
              </p>
            ) : null}

            <button
              ref={botoRef}
              type="submit"
              aria-disabled={enviant}
              className="mt-6 h-12 w-full rounded-[8px] bg-accent text-[15px] font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2 aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:bg-accent"
            >
              {t(etiqueta)}
            </button>

            {pista ? (
              <p role="status" className="mt-4 flex items-start gap-2 text-[14px] leading-relaxed text-tinta-3">
                <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                {t(pista)}
              </p>
            ) : null}

            <p className="mt-6 border-t border-linia-suau pt-5 text-[14px] leading-relaxed text-tinta-3">
              {t("porta.nota")}
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
