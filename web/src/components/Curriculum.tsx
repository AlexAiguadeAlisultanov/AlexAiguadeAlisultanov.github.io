// Vista del curriculum. Vive dentro de la app, detras de la misma puerta de acceso, y se
// abre con el hash #cv. Es una pagina para leer, con un boton en la cabecera que descarga el PDF
// (public/cv-alejandro-aiguade.pdf). Si alguien la imprime, el @media print de index.css
// la deja en blanco y sin fondo animado.

import { useEffect } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { enllacProjecte } from "../lib/projectes";
import { Idiomes } from "./Idiomes";
import { LINKEDIN } from "./Portafoli";
import { Baixa, Correu, Enrere, Fletxa, LinkedIn, Mon, Ubicacio } from "./Icones";
import retrat from "../assets/alex.png";
import logo from "../assets/logo.png";

const CORREU = "alexaiguade@gmail.com";

// Mismo orden que el curriculum en papel. Las claves son las fichas de projectes.ts.
const APLICACIONS = [
  "crm-ventas",
  "notas-de-gasto",
  "reserva-espacios",
  "gestor-ausencias",
  "qrcodegenerator",
  "springboot-thymeleaf-web-master",
  "app-gestio-incidencies",
  "MVC-AJAX",
  "jondasiviz"
];

const TARGETA = "rounded-[20px] border border-linia bg-fons-2/60 p-6 sm:p-8 cv-targeta";
const XIP = "rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1.5 text-[14px] text-tinta-2";

function Seccio({
  numero,
  titol,
  index,
  children
}: {
  numero?: string;
  titol: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <section className="cv-entra" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="flex items-baseline gap-4">
        {numero ? (
          <span aria-hidden className="num !text-[clamp(1.75rem,3.6vw,3rem)]">
            {numero}
          </span>
        ) : null}
        <h2 className="titular text-[clamp(1.5rem,3.2vw,2.75rem)]">{titol}</h2>
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function Fila({
  quan,
  titol,
  lloc,
  etiqueta,
  punts
}: {
  quan: string;
  titol: string;
  lloc?: ReactNode;
  etiqueta?: string;
  punts?: string[];
}) {
  return (
    <li className="grid gap-x-8 gap-y-2 py-6 first:pt-0 last:pb-0 sm:grid-cols-[minmax(110px,150px)_minmax(0,1fr)]">
      <p className="text-[14px] tabular-nums text-tinta-3">{quan}</p>
      <div className="max-w-[68ch]">
        <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-tinta sm:text-[19px]">
          {titol}
          {etiqueta ? (
            <span className="ml-3 inline-flex items-center gap-2 rounded-[8px] bg-accent-bg px-2.5 py-0.5 align-middle text-[13px] font-medium text-accent-2 cv-etiqueta">
              <span aria-hidden className="size-1.5 rounded-full bg-accent-2" />
              {etiqueta}
            </span>
          ) : null}
        </h3>
        {lloc ? <p className="mt-1 text-[15px] text-accent-2 cv-lloc">{lloc}</p> : null}
        {punts && punts.length ? (
          <ul className="mt-3 grid gap-1.5 text-[15px] leading-relaxed text-tinta-2">
            {punts.map((punt) => (
              <li key={punt} className="relative pl-4">
                <span aria-hidden className="absolute left-0 top-[0.7em] size-1 rounded-full bg-accent" />
                {punt}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function Grup({ titol, xips }: { titol: string; xips: string[] }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{titol}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {xips.map((xip) => (
          <li key={xip} className={XIP}>
            {xip}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Curriculum({ tornar }: { tornar: (id?: string) => void }) {
  const { t, idioma } = useIdioma();
  const quiet = useReducedMotion();
  const tt = (clau: string) => t(clau as Clau);

  // Al abrirse desde el contacto la pagina estaba abajo del todo: se sube de golpe.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const enrere = (event: React.MouseEvent, id?: string) => {
    event.preventDefault();
    tornar(id);
  };

  const idiomes: [string, string][] = [
    [t("lg.ru"), tt("cv.lv.ru")],
    [t("lg.es"), t("lg.es.n")],
    [t("lg.ca"), tt("cv.lv.ca")],
    [t("lg.en"), tt("cv.lv.en")]
  ];

  return (
    <div className="cv">
      <a
        href="#cv-contingut"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("cv-contingut")?.focus();
        }}
        className="no-print sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[8px] focus:bg-accent focus:px-4 focus:py-2 focus:text-[14px] focus:font-semibold focus:text-sobre-accent"
      >
        {tt("cv.skip")}
      </a>

      <header className="no-print sticky top-0 z-50 border-b border-linia/70 bg-fons/80 backdrop-blur-xl">
        <div className="ample flex h-14 items-center justify-between gap-3">
          <a
            href="/"
            onClick={(event) => enrere(event)}
            className="group inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-[8px] pr-2 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:text-tinta"
          >
            <Enrere className="text-[18px] transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none" />
            {tt("cv.back")}
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <img src={logo} alt="" width={32} height={32} className="h-8 w-8" />
            </span>
            <a
              href="/cv-alejandro-aiguade.pdf"
              download="CV Alejandro Aiguadé - Técnico de Informática.pdf"
              aria-label={tt("cv.download")}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent transition-colors duration-200 hover:bg-accent-bg"
            >
              <Baixa className="text-[18px]" />
              <span className="hidden sm:inline">{tt("cv.download")}</span>
            </a>
            <Idiomes />
          </div>
        </div>
      </header>

      <main id="cv-contingut" tabIndex={-1} className="ample py-12 outline-none sm:py-16 lg:py-20">
        {/* Cabecera: retrato, nombre, puesto y perfil. */}
        <motion.div
          initial={quiet ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid items-center gap-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-12"
        >
          {/* El PNG lleva margen transparente: el circulo visible es el 75 % de la imagen,
              asi que se amplia y se recorta para que el retrato llene su marco. */}
          <div className="relative size-[160px] shrink-0 overflow-hidden rounded-full ring-1 ring-accent/50 ring-offset-4 ring-offset-fons sm:size-[200px]">
            <img
              src={retrat}
              alt={t("hero.alt")}
              width={400}
              height={400}
              decoding="async"
              draggable={false}
              style={{ maxWidth: "none" }}
              className="absolute left-1/2 top-1/2 h-auto w-[133.4%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <div>
            <p className="text-[14px] font-medium uppercase tracking-[0.16em] text-accent cv-accent sm:text-[15px]">
              {tt("cv.eyebrow")}
            </p>
            <h1 className="titular mt-3 text-[clamp(2.25rem,6.4vw,5.5rem)]">Alejandro Aiguadé</h1>
            <p className="mt-4 text-[16px] font-medium text-tinta sm:text-[18px]">{tt("cv.role")}</p>
          </div>
        </motion.div>

        <p className="cv-entra mt-10 max-w-[72ch] text-[16px] leading-relaxed text-tinta-2 sm:text-[17px]" style={{ animationDelay: "60ms" }}>
          {tt("cv.profile")}
        </p>

        <div className="mt-14 grid gap-14 lg:mt-16 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-16 2xl:gap-24">
          {/* Columna larga: lo que se lee en orden. */}
          <div className="grid content-start gap-14">
            <Seccio numero="01" titol={tt("cv.h.exp")} index={1}>
              <ul className="divide-y divide-linia">
                <Fila quan="2023" titol={tt("cv.e1.t")} lloc="Invelon Technologies" punts={[tt("cv.e1.b1"), tt("cv.e1.b2")]} />
                <Fila quan="2022" titol={tt("cv.e2.t")} lloc="Argal" punts={[tt("cv.e2.b1"), tt("cv.e2.b2")]} />
                <Fila quan="2022" titol={tt("cv.e3.t")} lloc="Fira de Teatre al Carrer de Tàrrega" />
                <Fila quan="2022" titol={tt("cv.e4.t")} lloc="Consell Esportiu Urgell · Qualia" />
              </ul>
            </Seccio>

            <Seccio numero="02" titol={tt("cv.h.edu")} index={2}>
              <ul className="divide-y divide-linia">
                <Fila
                  quan="2026"
                  titol={t("edu.ev.title")}
                  etiqueta={tt("cv.present")}
                  lloc={`Evolve · ${tt("cv.s1.n")}`}
                />
                <Fila
                  quan="2022 – 2024"
                  titol={tt("cv.s2.t")}
                  lloc={tt("cv.s2.n")}
                  punts={[tt("cv.s2.b1"), tt("cv.s2.b2")]}
                />
                <Fila quan="2020 – 2022" titol={tt("cv.s3.t")} punts={[tt("cv.s3.b1"), tt("cv.s3.b2")]} />
                <Fila quan="2022" titol={tt("cv.s4.t")} lloc="Consell Esportiu Urgell" />
              </ul>
            </Seccio>

            <Seccio numero="03" titol={tt("cv.h.proj")} index={3}>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["p1", "p2"] as const).map((p) => (
                  <article key={p} className={`${TARGETA} !p-6`}>
                    <h3 className="text-[16px] font-semibold tracking-tight text-tinta">{tt(`cv.${p}.t`)}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-tinta-2">{tt(`cv.${p}.d`)}</p>
                  </article>
                ))}
              </div>

              <h3 className="mt-10 text-[14px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">
                {tt("cv.apps.h")}
              </h3>
              <ul aria-label={tt("cv.apps.aria")} className="mt-4 flex flex-wrap gap-2">
                {APLICACIONS.map((nom) => {
                  const { titol, demo } = enllacProjecte(nom, idioma);
                  return (
                    <li key={nom}>
                      <a
                        href={demo}
                        target="_blank"
                        rel="noopener"
                        className="group inline-flex min-h-[44px] items-center gap-2 rounded-[8px] border border-linia bg-fons-3 px-3 text-[14px] text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-accent-2 print:min-h-0 print:py-1"
                      >
                        {titol}
                        <Fletxa className="text-[16px] text-tinta-3 transition-colors duration-200 group-hover:text-accent" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Seccio>
          </div>

          {/* Columna estrecha: datos de consulta rapida. */}
          <aside className="grid content-start gap-6">
            <section className={`${TARGETA} cv-entra`} style={{ animationDelay: "140ms" }}>
              <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{tt("cv.h.contact")}</h2>
              <ul className="mt-5 grid gap-4 text-[15px]">
                <li className="flex items-center gap-3">
                  <Correu className="shrink-0 text-[20px] text-tinta-3" />
                  <a
                    href={"mailto:" + CORREU}
                    className="min-w-0 break-words text-tinta transition-colors duration-200 hover:text-accent-2"
                  >
                    {CORREU}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <LinkedIn className="shrink-0 text-[20px] text-tinta-3" />
                  <a
                    href={LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tinta transition-colors duration-200 hover:text-accent-2"
                  >
                    LinkedIn
                  </a>
                </li>
                <li className="flex items-center gap-3 text-tinta">
                  <Ubicacio className="shrink-0 text-[20px] text-tinta-3" />
                  Lleida
                </li>
              </ul>
            </section>

            <section className={`${TARGETA} cv-entra`} style={{ animationDelay: "200ms" }}>
              <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{tt("cv.h.tech")}</h2>
              <div className="mt-5 grid gap-6">
                <Grup
                  titol={tt("cv.g1")}
                  xips={[
                    "Windows", "Ubuntu", "Kali Linux", tt("cv.c.consola"), tt("cv.c.redes"),
                    "Hardware", tt("cv.c.soporte")
                  ]}
                />
                <Grup
                  titol={tt("cv.g2")}
                  xips={["Pentesting", t("sk.esc"), "OSINT", tt("cv.c.forense"), "Bash"]}
                />
                <Grup
                  titol={tt("cv.g3")}
                  xips={["Java", "Spring Boot", "PHP", "Python", "MySQL", "HTML/CSS", "React", "TypeScript"]}
                />
                <Grup
                  titol={tt("cv.g4")}
                  xips={["Git", "Blender", "Unreal Engine", tt("cv.c.office")]}
                />
              </div>
            </section>

            <section className={`${TARGETA} cv-entra`} style={{ animationDelay: "260ms" }}>
              <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{tt("cv.h.lang")}</h2>
              <ul className="mt-3 divide-y divide-linia-suau">
                {idiomes.map(([nom, nivell]) => (
                  <li key={nom} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                    <span className="text-[15px] text-tinta">{nom}</span>
                    <span className="text-[14px] text-tinta-3">{nivell}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${TARGETA} cv-entra`} style={{ animationDelay: "320ms" }}>
              <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{tt("cv.h.soft")}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {["cv.k1", "cv.k2", "cv.k3", "cv.k4"].map((k) => (
                  <li key={k} className={XIP}>
                    {tt(k)}
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${TARGETA} cv-entra`} style={{ animationDelay: "380ms" }}>
              <h2 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent cv-accent">{tt("cv.h.other")}</h2>
              <ul className="mt-5 grid gap-4 text-[15px]">
                <li className="text-tinta">{tt("cv.o1")}</li>
                <li>
                  <a
                    href="/"
                    onClick={(event) => enrere(event, "dalt")}
                    className="group inline-flex items-center gap-3 text-tinta transition-colors duration-200 hover:text-accent-2"
                  >
                    <Mon className="shrink-0 text-[20px] text-tinta-3 transition-colors duration-200 group-hover:text-accent" />
                    {tt("cv.o2")}
                  </a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
