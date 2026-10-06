// Vista del curriculum. Vive dentro de la app, detras de la misma puerta de acceso, y se
// abre con el hash #cv. Es una pagina para leer, con un boton en la cabecera que descarga el PDF
// (public/cv-alejandro-aiguade.pdf). Si alguien la imprime, el @media print de index.css
// la deja en blanco y sin fondo animado.
//
// Una sola columna, sin tarjetas ni etiquetas y con los datos escritos como texto, igual que
// el PDF: asi lo leen bien los filtros automaticos (ATS) y una persona lo recorre de arriba
// abajo sin saltar entre columnas. A diferencia del PDF, aqui no se publica el telefono.

import { useEffect } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { enllacProjecte } from "../lib/projectes";
import { Idiomes } from "./Idiomes";
import { LINKEDIN } from "./Portafoli";
import { Baixa, Enrere } from "./Icones";
import logo from "../assets/logo.png";

const CORREU = "alexaiguade@gmail.com";
const LINKEDIN_TEXT = "linkedin.com/in/alex-aiguade-alisultanov-076706230";
const WEB_TEXT = "alexaiguadealisultanov.github.io";

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

const ENLLAC = "font-medium text-accent-2 underline decoration-accent/40 underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-accent";
const TEXT = "text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]";

// Primera letra en minuscula, para listas que siguen a unos dos puntos.
const minuscula = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function Seccio({
  numero,
  titol,
  index,
  children
}: {
  numero: string;
  titol: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <section className="cv-entra border-t border-linia pt-8" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-baseline gap-4">
        <span aria-hidden className="num !text-[clamp(1.5rem,2.6vw,2.25rem)]">
          {numero}
        </span>
        <h2 className="titular text-[clamp(1.375rem,2.6vw,2rem)]">{titol}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Fila({ quan, titol, lloc, punts }: { quan: string; titol: string; lloc?: string; punts?: string[] }) {
  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="min-w-0 text-[16px] font-semibold leading-snug tracking-tight text-tinta sm:text-[17px]">
          {titol}
          {lloc ? <span className="font-medium text-accent-2"> · {lloc}</span> : null}
        </h3>
        <p className="shrink-0 text-[14px] tabular-nums text-tinta-3">{quan}</p>
      </div>
      {punts && punts.length ? (
        <ul className={`mt-2 list-disc pl-5 marker:text-accent ${TEXT}`}>
          {punts.map((punt) => (
            <li key={punt}>{punt}</li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Llista({ children }: { children: ReactNode }) {
  return <ul className={`grid list-disc gap-2 pl-5 marker:text-accent ${TEXT}`}>{children}</ul>;
}

function Punt({ titol, children }: { titol: string; children: ReactNode }) {
  return (
    <li>
      <strong className="font-semibold text-tinta">{titol}:</strong> {children}
    </li>
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

  const competencies: [string, string[]][] = [
    [tt("cv.g1"), ["Windows", "Ubuntu", "Kali Linux", tt("cv.c.consola"), tt("cv.c.redes"), "hardware", tt("cv.c.soporte")]],
    [tt("cv.g2"), ["pentesting", minuscula(t("sk.esc")), "OSINT", tt("cv.c.forense"), "Bash"]],
    [tt("cv.g3"), ["Java", "Spring Boot", "PHP", "Python", "MySQL", "HTML/CSS", "React", "TypeScript"]],
    [tt("cv.g4"), ["Git", "GitHub", "Claude", "Claude Code", "ChatGPT", "Blender", "Unreal Engine", tt("cv.c.office")]]
  ];

  const idiomes: [string, string][] = [
    [t("lg.ru"), tt("cv.lv.ru")],
    [t("lg.es"), t("lg.es.n")],
    [t("lg.ca"), tt("cv.lv.ca")],
    [t("lg.en"), tt("cv.lv.en")]
  ];

  const habilitats = ["cv.k1", "cv.k2", "cv.k5", "cv.k7", "cv.k3", "cv.k6", "cv.k4"]
    .map((k, i) => (i ? minuscula(tt(k)) : tt(k)))
    .join(", ");

  const seccions = [
    "cv.h.profile", "cv.h.exp", "cv.h.vol", "cv.h.edu", "cv.h.tech",
    "cv.h.proj", "cv.h.lang", "cv.h.soft", "cv.h.other"
  ] as const;
  const num = (clau: (typeof seccions)[number]) => String(seccions.indexOf(clau) + 1).padStart(2, "0");

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
        <div className="max-w-[900px]">
          {/* Cabecera: nombre, puesto y contacto escrito entero. */}
          <motion.header
            initial={quiet ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[14px] font-medium uppercase tracking-[0.16em] text-accent sm:text-[15px]">
              {tt("cv.eyebrow")}
            </p>
            <h1 className="titular mt-3 text-[clamp(2.25rem,6.4vw,5rem)]">Alejandro Aiguadé</h1>
            <p className="mt-4 text-[16px] font-medium text-tinta sm:text-[18px]">{tt("cv.role")}</p>
            <ul aria-label={tt("cv.h.contact")} className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-tinta-2">
              <li>Lleida, Catalunya</li>
              <li className="min-w-0 break-words">
                {tt("cv.l.email")}:{" "}
                <a href={"mailto:" + CORREU} className={ENLLAC}>
                  {CORREU}
                </a>
              </li>
              <li className="min-w-0 break-words">
                LinkedIn:{" "}
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className={ENLLAC}>
                  {LINKEDIN_TEXT}
                </a>
              </li>
              <li className="min-w-0 break-words">
                {tt("cv.l.web")}:{" "}
                <a href="/" onClick={(event) => enrere(event, "dalt")} className={ENLLAC}>
                  {WEB_TEXT}
                </a>
              </li>
            </ul>
          </motion.header>

          <div className="mt-12 grid gap-12 sm:mt-14">
            <Seccio numero={num("cv.h.profile")} titol={tt("cv.h.profile")} index={1}>
              <p className={`max-w-[72ch] ${TEXT}`}>{tt("cv.profile")}</p>
            </Seccio>

            <Seccio numero={num("cv.h.exp")} titol={tt("cv.h.exp")} index={2}>
              <ul className="grid gap-6">
                <Fila quan="2023" titol={tt("cv.e1.t")} lloc="Invelon Technologies" punts={[tt("cv.e1.b1"), tt("cv.e1.b2")]} />
                <Fila quan="2022" titol={tt("cv.e2.t")} lloc="Argal" punts={[tt("cv.e2.b1"), tt("cv.e2.b2")]} />
              </ul>
            </Seccio>

            <Seccio numero={num("cv.h.vol")} titol={tt("cv.h.vol")} index={3}>
              <ul className="grid gap-4">
                <Fila quan="2022" titol={tt("cv.e3.t")} lloc="Fira de Teatre al Carrer de Tàrrega" />
                <Fila quan="2022" titol={tt("cv.e4.t")} lloc="Consell Esportiu Urgell · Qualia" />
              </ul>
            </Seccio>

            <Seccio numero={num("cv.h.edu")} titol={tt("cv.h.edu")} index={4}>
              <ul className="grid gap-6">
                <Fila
                  quan="2026"
                  titol={`${t("edu.ev.title")} (${minuscula(tt("cv.present"))})`}
                  lloc={`Evolve · ${tt("cv.s1.n")}`}
                />
                <Fila quan="2022 - 2024" titol={tt("cv.s2.t")} lloc={tt("cv.s2.n")} punts={[tt("cv.s2.b1"), tt("cv.s2.b2")]} />
                <Fila quan="2020 - 2022" titol={tt("cv.s3.t")} punts={[tt("cv.s3.b1"), tt("cv.s3.b2")]} />
                <Fila quan="2022" titol={tt("cv.s4.t")} lloc="Consell Esportiu Urgell" />
              </ul>
            </Seccio>

            <Seccio numero={num("cv.h.tech")} titol={tt("cv.h.tech")} index={5}>
              <Llista>
                {competencies.map(([grup, items]) => (
                  <Punt key={grup} titol={grup}>
                    {items.join(", ")}.
                  </Punt>
                ))}
              </Llista>
            </Seccio>

            <Seccio numero={num("cv.h.proj")} titol={tt("cv.h.proj")} index={6}>
              <Llista>
                <Punt titol={tt("cv.p1.t")}>{tt("cv.p1.d")}</Punt>
                <Punt titol={tt("cv.p2.t")}>{tt("cv.p2.d")}</Punt>
                <li>
                  <strong className="font-semibold text-tinta">{tt("cv.apps.h")}:</strong>{" "}
                  {APLICACIONS.map((nom, i) => {
                    const { titol, demo } = enllacProjecte(nom, idioma);
                    return (
                      <span key={nom}>
                        <a href={demo} target="_blank" rel="noopener" className={ENLLAC}>
                          {titol}
                        </a>
                        {i < APLICACIONS.length - 1 ? ", " : "."}
                      </span>
                    );
                  })}
                </li>
              </Llista>
            </Seccio>

            <Seccio numero={num("cv.h.lang")} titol={tt("cv.h.lang")} index={7}>
              <Llista>
                {idiomes.map(([nom, nivell]) => (
                  <Punt key={nom} titol={nom}>
                    {nivell}
                  </Punt>
                ))}
              </Llista>
            </Seccio>

            <Seccio numero={num("cv.h.soft")} titol={tt("cv.h.soft")} index={8}>
              <p className={TEXT}>{habilitats}.</p>
            </Seccio>

            <Seccio numero={num("cv.h.other")} titol={tt("cv.h.other")} index={9}>
              <Llista>
                <li>{tt("cv.o1")}</li>
                <li>
                  <a href="/" onClick={(event) => enrere(event, "dalt")} className={ENLLAC}>
                    {tt("cv.o2")}
                  </a>
                  : {WEB_TEXT}
                </li>
              </Llista>
            </Seccio>
          </div>
        </div>
      </main>
    </div>
  );
}
