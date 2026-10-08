// La historia (#historia): como se llega de un equipo por dentro a protegerlo. Tres capitulos
// (hardware, software y seguridad), uno por capa del chip, y un cierre con las tres montadas.
// El texto es siempre DOM real y va en orden de lectura, con cada capitulo en un <article>.
//
// Dos modos (ver Escenari y usePelicula):
// - Pelicula (escritorio con WebGL): la seccion mide 380svh, en bloques de 60 y 80svh. Las
//   tarjetas pasan en flujo normal por delante del chip fijado, sobre un fondo casi solido, y
//   su opacidad sale de p (tabla.ts) con MotionValues: nada de estado de React por fotograma y
//   nunca visibility: hidden. El cierre solo sube, porque lleva botones.
// - Normal (movil, tableta, movimiento reducido, sin WebGL): bloques de alto natural, cada uno
//   con su capa dibujada en cian (XipCapes), y entrada con Entrada.

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIdioma } from "../../lib/idioma";
import type { Clau } from "../../lib/idioma";
import { CORREU } from "../../lib/contacte";
import { useProjectesCtx } from "../../lib/ProveidorProjectes";
import { Entrada } from "../Moviment";
import { XipCapes } from "../XipCapes";
import type { Capa } from "../XipCapes";
import { useRelat } from "./Escenari";
import { CENTRO, CIERRE, TITULAR, opacidad, ventana } from "./tabla";

type Xip = string | { clau: Clau };

type Capitol = {
  id: Exclude<Capa, "todo">;
  num: string;
  anys: string;
  titol: Clau;
  text: Clau;
  xips: Xip[];
};

// Las tres capas y los años de cada etapa. Las herramientas salen del curriculum.
const CAPITOLS: Capitol[] = [
  {
    id: "hw",
    num: "01",
    anys: "2020 · 2022",
    titol: "rail.hw",
    text: "hist.hw",
    xips: ["Windows · Ubuntu", "Hardware", { clau: "cv.c.soporte" }]
  },
  {
    id: "sw",
    num: "02",
    anys: "2022 · 2024",
    titol: "rail.sw",
    text: "hist.sw",
    xips: ["Java · Spring Boot", "PHP · MySQL", "React · TypeScript"]
  },
  {
    id: "seg",
    num: "03",
    anys: "2026",
    titol: "rail.seg",
    text: "hist.seg",
    xips: ["HackTheBox", "Kali Linux", "OSINT"]
  }
];

const BOTO =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[8px] px-5 text-[15px] font-semibold " +
  "transition-colors duration-200 sm:w-auto";

/** Lo de dentro de la tarjeta de un capitulo, igual en los dos modos. */
function Targeta({ cap }: { cap: Capitol }) {
  const { t } = useIdioma();
  const { compte } = useProjectesCtx();
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <span aria-hidden className="num">
          {cap.num}
        </span>
        <span className="text-[14px] tabular-nums text-tinta-3">{cap.anys}</span>
      </div>
      <h3 id={`historia-${cap.id}`} className="titular historia__nom">
        {t(cap.titol)}
      </h3>
      <p className="mt-4 text-[15px] leading-normal text-tinta-2 sm:text-[16px] sm:leading-relaxed">
        {t(cap.text, { n: compte })}
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {cap.xips.map((xip) => {
          const text = typeof xip === "string" ? xip : t(xip.clau);
          return (
            <li key={text} className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1 text-[14px] text-tinta-2">
              {text}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** El cierre: las tres capas montadas y dos salidas, las demos o el correo. */
function Tancament() {
  const { t } = useIdioma();
  return (
    <>
      <p className="historia__frase text-[clamp(1.25rem,2.2vw,2rem)] font-semibold leading-snug tracking-tight text-tinta">
        {t("hist.fi")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="#projectes" className={`${BOTO} bg-accent text-sobre-accent hover:bg-accent-2`}>
          {t("hist.fi.demos")}
        </a>
        <a
          href={"mailto:" + CORREU}
          className={`${BOTO} border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta`}
        >
          {t("hist.fi.mail")}
        </a>
      </div>
    </>
  );
}

/** En la pelicula cada tarjeta lleva su opacidad; en flujo normal entra con Entrada. */
function Entra({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Entrada y={8} duracio={0.24} className={className}>
      {children}
    </Entrada>
  );
}

export function Historia() {
  const { t } = useIdioma();
  const { pelicula, progres } = useRelat();
  const titol = useRef<HTMLDivElement>(null);

  // El titular tiene su propio recorrido: de que asoma por abajo a que se va por arriba.
  const { scrollYProgress: pasTitol } = useScroll({ target: titol, offset: ["start end", "end start"] });
  const oTitol = useTransform(pasTitol, (x) => opacidad(x, TITULAR));
  const oHw = useTransform(progres, (p) => opacidad(p, CENTRO.hw));
  const oSw = useTransform(progres, (p) => opacidad(p, CENTRO.sw));
  const oSeg = useTransform(progres, (p) => opacidad(p, CENTRO.seg));
  const oFi = useTransform(progres, (p) => ventana(p, CIERRE[0], CIERRE[1]));
  const opacitats = { hw: oHw, sw: oSw, seg: oSeg };

  return (
    <section id="historia" className={pelicula ? "historia historia--pelicula" : "historia"}>
      <div className="ample">
        <div ref={titol} className="historia__cap" data-ancora>
          {pelicula ? (
            <motion.h2 className="titular titular--xl historia__titol" style={{ opacity: oTitol }}>
              {t("hist.titol")}
            </motion.h2>
          ) : (
            <Entra>
              <h2 className="titular titular--xl historia__titol">{t("hist.titol")}</h2>
            </Entra>
          )}
        </div>

        {CAPITOLS.map((cap) => (
          <article key={cap.id} className="historia__bloc" aria-labelledby={`historia-${cap.id}`} data-ancora>
            {pelicula ? (
              <motion.div className="historia__tarjeta" style={{ opacity: opacitats[cap.id] }}>
                <Targeta cap={cap} />
              </motion.div>
            ) : (
              <Entra className="historia__ent">
                <XipCapes activa={cap.id} className="historia__xip" />
                <div className="historia__tarjeta">
                  <Targeta cap={cap} />
                </div>
              </Entra>
            )}
          </article>
        ))}

        <div className="historia__bloc" data-ancora>
          {pelicula ? (
            <motion.div className="historia__tarjeta historia__tarjeta--fi" style={{ opacity: oFi }}>
              <Tancament />
            </motion.div>
          ) : (
            <Entra className="historia__ent historia__ent--fi">
              <XipCapes activa="todo" className="historia__xip" />
              <div className="historia__fi">
                <Tancament />
              </div>
            </Entra>
          )}
        </div>
      </div>
    </section>
  );
}
