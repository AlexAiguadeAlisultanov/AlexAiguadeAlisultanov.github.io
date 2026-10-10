// La trayectoria (#trayectoria): el indice que se escanea despues de la historia. Experiencia
// y formacion en dos columnas, cada una con su filete vertical y sus hitos; debajo, las
// herramientas y los idiomas.
//
// El filete cian crece con el scroll de la linea de tiempo, y cada hito se enciende cuando su
// fila cruza la franja central de la pantalla (ver Fila.tsx). Con movimiento reducido el filete
// esta entero y todos los nodos llenos desde el principio.

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { Entrada } from "./Moviment";
import { Fila } from "./Fila";
import { Titol } from "./Titol";

type Xip = string | { clau: Clau };

// Los tres grupos de herramientas reutilizan los nombres del curriculum (cv.g1, cv.g2, cv.g3).
const EINES: { titol: Clau; xips: Xip[] }[] = [
  {
    titol: "cv.g1",
    xips: ["Windows", "Ubuntu", { clau: "cv.c.consola" }, "TCP/IP", { clau: "cv.c.soporte" }]
  },
  {
    titol: "cv.g2",
    xips: ["Kali Linux", "Nmap", "Burp Suite", "Wireshark", "Metasploit", "SQLMap", "OSINT"]
  },
  { titol: "cv.g3", xips: ["Python", "Java", "PHP", "TypeScript", "MySQL"] }
];

// Ruso primero, que es la lengua de casa. Los codigos del marco europeo van igual en los tres
// idiomas.
const IDIOMES: [Clau, Clau][] = [
  ["lg.ru", "lg.ru.n"],
  ["lg.es", "lg.es.n"],
  ["lg.ca", "lg.ca.n"],
  ["lg.en", "lg.en.n"]
];

const TARGETA = "h-full rounded-[20px] border border-linia bg-fons-2/60 p-5 sm:p-8";
const TITOL_TARGETA = "text-[15px] font-semibold uppercase tracking-[0.14em] text-accent";

function Columna({
  titol,
  filete,
  children
}: {
  titol: string;
  filete: MotionValue<number> | number;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className={TITOL_TARGETA}>{titol}</h3>
      <div className="tray__col">
        <span aria-hidden className="tray__pista" />
        <motion.span aria-hidden className="tray__filete" style={{ scaleY: filete }} />
        <ul>{children}</ul>
      </div>
    </div>
  );
}

export function Trajectoria() {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const linia = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: linia, offset: ["start 70%", "end 60%"] });
  const creixement = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <section id="trayectoria" className="py-14 sm:py-20 lg:py-28">
      <div className="ample">
        <Titol numero="05" text={t("tray.h")} />

        <div ref={linia} className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-2 lg:gap-20">
          <Columna titol={t("tray.exp")} filete={quiet ? 1 : creixement}>
            <Fila
              hito
              quan="2023"
              tipus={t("tray.prac")}
              titol={t("cv.e1.t")}
              lloc="Invelon Technologies"
            />
            <Fila hito quan="2022" tipus={t("tray.prac")} titol={t("cv.e2.t")} lloc="Argal" />
            <Fila
              hito
              quan="2022"
              tipus={t("tray.vol")}
              titol={t("cv.e3.t")}
              lloc="Fira de Teatre al Carrer de Tàrrega"
            />
            <Fila
              hito
              quan="2022"
              tipus={t("tray.vol")}
              titol={t("cv.e4.t")}
              lloc="Consell Esportiu Urgell · Qualia"
            />
          </Columna>

          <Columna titol={t("tray.edu")} filete={quiet ? 1 : creixement}>
            <Fila
              hito="curs"
              quan="2026"
              etiqueta={t("tray.now")}
              titol={t("edu.ev.title")}
              lloc={`Evolve · ${t("cv.s1.n")}`}
            />
            <Fila
              hito
              quan="2022 – 2024"
              titol={t("cv.s2.t")}
              lloc="La Salle Mollerussa"
              punts={[t("edu.ls.note")]}
            />
            <Fila hito quan="2020 – 2022" titol={t("cv.s3.t")} lloc="Ins Alfons Costafreda" />
          </Columna>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
          <Entrada y={8} duracio={0.24} className="h-full">
            <div className={TARGETA}>
              <h3 className={TITOL_TARGETA}>{t("tray.tools")}</h3>
              <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-6">
                {EINES.map((grup) => (
                  <div key={grup.titol}>
                    <h4 className="text-[14px] text-tinta-3">{t(grup.titol)}</h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {grup.xips.map((xip) => {
                        const text = typeof xip === "string" ? xip : t(xip.clau);
                        return (
                          <li
                            key={text}
                            className="rounded-[8px] border border-linia bg-fons-3 px-2 py-1 text-[13px] text-tinta-2 sm:px-2.5 sm:py-1.5 sm:text-[14px]"
                          >
                            {text}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Entrada>

          <Entrada y={8} duracio={0.24} retard={0.06} className="h-full">
            <div className={TARGETA}>
              <h3 className={TITOL_TARGETA}>{t("tray.lang")}</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 sm:block sm:divide-y sm:divide-linia-suau">
                {IDIOMES.map(([nom, nivell]) => (
                  <li
                    key={nom}
                    className="flex flex-col py-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4 sm:gap-y-1 sm:py-3"
                  >
                    <span className="text-[15px] text-tinta">{t(nom)}</span>
                    <span className="text-[14px] text-tinta-3">{t(nivell)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Entrada>
        </div>
      </div>
    </section>
  );
}
