import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import type { Rol } from "../lib/acces";
import { Apilada, Entrada, Iman, Revelat, Tira } from "./Moviment";
import { Fons3D } from "./Fons3D";
import { Idiomes } from "./Idiomes";
import { Projectes } from "./Projectes";
import { Correu, Fletxa, GitHub, Baixa, LinkedIn, Xat } from "./Icones";
import retrat from "../assets/alex.png";

const LINKEDIN = "https://www.linkedin.com/in/alex-aiguade-alisultanov-076706230/";
const GITHUB = "https://github.com/AlexAiguadeAlisultanov";
const CORREU = "alexaiguade@gmail.com";
const WHATSAPP = "https://wa.me/34684258353";

const SECCIONS: { id: string; clau: Clau }[] = [
  { id: "sobre-mi", clau: "nav.about" },
  { id: "projectes", clau: "nav.projects" },
  { id: "formacio", clau: "nav.edu" },
  { id: "habilitats", clau: "nav.skills" },
  { id: "contacte", clau: "nav.contact" }
];

// El ancho lo fija la clase .ample de index.css: margen lateral que crece con la ventana
// y sin tope util hasta 2560. Lo que sujeta la lectura es la medida de cada bloque de
// texto, no una columna que encierre la pagina entera.
const AMPLE = "ample";

const BOTO =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[8px] px-5 text-[15px] " +
  "font-semibold transition-colors duration-200";

/* ---------- Cabecera ---------- */

function Capcalera({ sortir }: { sortir: () => void }) {
  const { t } = useIdioma();
  const [activa, setActiva] = useState("");

  useEffect(() => {
    const nodes = SECCIONS.map((s) => document.getElementById(s.id)).filter(
      (n): n is HTMLElement => !!n
    );
    if (!nodes.length || !("IntersectionObserver" in window)) return;

    const vigilant = new IntersectionObserver(
      (entrades) => {
        const vista = entrades
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vista) setActiva(vista.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );
    nodes.forEach((node) => vigilant.observe(node));
    return () => vigilant.disconnect();
  }, []);

  const enllac = (id: string) =>
    `inline-flex min-h-[44px] items-center whitespace-nowrap rounded-[8px] px-3 text-[14px] transition-colors duration-200 ${
      activa === id ? "text-accent-2" : "text-tinta-2 hover:text-tinta"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-linia/70 bg-fons/80 backdrop-blur-xl">
      <div className={`${AMPLE} flex h-14 items-center justify-between gap-4`}>
        <a
          href="#dalt"
          className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-[8px] pr-2 text-[15px] font-semibold tracking-tight text-tinta"
        >
          Alex Aiguadé
        </a>

        <nav aria-label={t("nav.aria")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {SECCIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={"#" + s.id}
                  className={enllac(s.id)}
                  aria-current={activa === s.id ? "true" : undefined}
                >
                  {t(s.clau)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Idiomes />
          <button
            type="button"
            onClick={sortir}
            className="min-h-[44px] rounded-[8px] border border-linia px-3 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta"
          >
            {t("sortir")}
          </button>
        </div>
      </div>

      {/* En pantallas estrechas la navegacion pasa a una fila propia que se arrastra de
          lado, para no perderla y no meter un menu desplegable de mas. */}
      <nav
        aria-label={t("nav.aria")}
        className="border-t border-linia/50 lg:hidden"
      >
        <ul className="flex items-center gap-1 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECCIONS.map((s) => (
            <li key={s.id}>
              <a
                href={"#" + s.id}
                className={enllac(s.id)}
                aria-current={activa === s.id ? "true" : undefined}
              >
                {t(s.clau)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/* ---------- Encabezado de seccion ---------- */

function Titol({
  numero,
  text,
  clar = false
}: {
  numero: string;
  text: string;
  clar?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
      <span aria-hidden className={`num ${clar ? "num--clar" : ""}`}>
        {numero}
      </span>
      <h2 className={`titular titular--l ${clar ? "titular--clar" : ""}`}>{text}</h2>
    </div>
  );
}

/* ---------- Portada ---------- */

/** Un dato de la fila de la portada: etiqueta arriba, dato en grande y matiz debajo. */
function Dada({
  etiqueta,
  valor,
  nota
}: {
  etiqueta: string;
  valor: ReactNode;
  nota: string;
}) {
  return (
    <div className="bg-fons-2/40 px-6 py-5 backdrop-blur-sm lg:px-8 lg:py-6">
      <dt className="text-[13px] uppercase tracking-[0.16em] text-tinta-3">{etiqueta}</dt>
      <dd className="mt-2 text-[16px] font-medium leading-snug text-tinta sm:text-[17px]">
        {valor}
      </dd>
      <dd className="mt-1 text-[14px] leading-snug text-tinta-3">{nota}</dd>
    </div>
  );
}

function Portada({ compte }: { compte: number }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();

  return (
    <section id="dalt" className="relative pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
      {/* La escena vive solo detras de la portada. Mas abajo estorbaria a la lectura y no
          habria por que estar pintando nada. */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Fons3D />
      </div>

      <div className={`${AMPLE} relative`}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16 2xl:gap-24">
          <div>
            <motion.p
              initial={quiet ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[15px] font-medium uppercase tracking-[0.16em] text-accent sm:text-[16px]"
            >
              {t("hero.eyebrow")}
            </motion.p>

            <motion.h1
              initial={quiet ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 0.61, 0.36, 1] }}
              className="titular titular--xxl mt-5"
            >
              Alex
              <br />
              Aiguadé
            </motion.h1>

            <motion.div
              initial={quiet ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
            >
              <p className="mt-8 max-w-[52ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[17px]">
                {t("hero.lead")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="#projectes" className={`${BOTO} bg-accent text-sobre-accent hover:bg-accent-2`}>
                  {t("hero.cta")}
                  <Baixa />
                </a>
                <a
                  href={LINKEDIN}
                  target="_blank"
                  rel="noopener"
                  className={`${BOTO} border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta`}
                >
                  LinkedIn
                  <Fletxa />
                </a>
              </div>
            </motion.div>
          </div>

          <Iman className="justify-self-center lg:justify-self-end">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(95,198,212,.22),transparent_65%)] blur-2xl"
              />
              <img
                src={retrat}
                width={400}
                height={400}
                alt={t("hero.alt")}
                fetchPriority="high"
                decoding="async"
                className="w-[min(72vw,400px)] select-none rounded-[20px] lg:w-[min(30vw,480px)] 2xl:w-[min(26vw,560px)]"
                draggable={false}
              />
            </div>
          </Iman>
        </div>

        {/* Debajo del titular sobraba sitio en pantallas anchas. Ahi van los cuatro datos
            que alguien busca en los diez primeros segundos: que estudia ahora, de donde
            viene, cuanto hay publicado y desde donde trabaja. */}
        <motion.dl
          initial={quiet ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26 }}
          className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-linia/70 bg-linia/70 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          <Dada etiqueta={t("hero.d1k")} valor={t("hero.d1v")} nota={t("hero.d1n")} />
          <Dada etiqueta={t("hero.d2k")} valor={t("hero.d2v")} nota={t("hero.d2n")} />
          <Dada
            etiqueta={t("hero.d3k")}
            valor={
              <span className="tabular-nums">{compte > 0 ? compte : " "}</span>
            }
            nota={t("hero.d3n")}
          />
          <Dada etiqueta={t("hero.d4k")} valor={t("hero.d4v")} nota={t("hero.d4n")} />
        </motion.dl>
      </div>
    </section>
  );
}

/* ---------- Sobre mi ---------- */

function Sobre() {
  const { t } = useIdioma();
  return (
    <section id="sobre-mi" className="scroll-mt-28 py-20 lg:py-28">
      <div className={AMPLE}>
        <Titol numero="01" text={t("about.h")} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-20 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] 2xl:gap-28">
          <Revelat
            text={t("about.claim")}
            com="lletra"
            etiqueta="p"
            className="max-w-[18ch] text-[clamp(1.5rem,3.2vw,4rem)] font-semibold leading-[1.12] tracking-tight text-tinta"
          />
          {/* Los tres parrafos no se ensanchan: a partir de 1536 se parten en dos columnas
              y cada una se queda en su medida de lectura. */}
          <div className="grid gap-6 gap-x-16 2xl:grid-cols-2 2xl:items-start">
            <div className="grid max-w-[62ch] gap-6 2xl:max-w-[68ch]">
              {(["about.p1", "about.p2"] as Clau[]).map((clau) => (
                <Revelat
                  key={clau}
                  text={t(clau)}
                  com="paraula"
                  className="text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]"
                />
              ))}
            </div>
            <div className="grid max-w-[62ch] gap-6 2xl:max-w-[68ch]">
              <Revelat
                text={t("about.p3")}
                com="paraula"
                className="text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tira de palabras ---------- */

const FILA_A = ["Kali Linux", "Nmap", "Burp Suite", "Wireshark", "Metasploit", "OSINT", "SQLMap"];
const FILA_B = ["Blue Team", "SOC", "SIEM", "OWASP", "NIS2", "ENS", "Python", "Java"];

function Cinta() {
  return (
    <div className="border-y border-linia/60 py-8">
      <Tira paraules={FILA_A} sentit={1} />
      <div className="h-3" />
      <Tira paraules={FILA_B} sentit={-1} />
    </div>
  );
}

/* ---------- Formacion ---------- */

type Estudi = {
  quan: Clau;
  titol: Clau;
  lloc: string;
  tag?: Clau;
  nota?: Clau;
  chips?: (Clau | string)[];
};

const ESTUDIS: Estudi[] = [
  {
    quan: "edu.ev.when",
    titol: "edu.ev.title",
    lloc: "Evolve",
    tag: "edu.ev.tag",
    chips: [
      "edu.ev.c1", "edu.ev.c2", "edu.ev.c3", "edu.ev.c4", "edu.ev.c5", "Metasploit",
      "edu.ev.c7", "edu.ev.c8", "edu.ev.c9", "sk.iacyber", "edu.ev.c11"
    ]
  },
  {
    quan: "edu.ls.when",
    titol: "edu.ls.title",
    lloc: "La Salle Mollerussa",
    nota: "edu.ls.note"
  },
  {
    quan: "edu.gm.when",
    titol: "edu.gm.title",
    lloc: "Ins Alfons Costafreda"
  }
];

const CLAUS = new Set<string>([
  "edu.ev.c1", "edu.ev.c2", "edu.ev.c3", "edu.ev.c4", "edu.ev.c5",
  "edu.ev.c7", "edu.ev.c8", "edu.ev.c9", "edu.ev.c11", "sk.iacyber"
]);

function Formacio() {
  const { t } = useIdioma();

  return (
    <section id="formacio" className="scroll-mt-28 py-20 lg:py-28">
      <div className={AMPLE}>
        <Titol numero="03" text={t("edu.h")} />
        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
          {t("edu.intro")}
        </p>

        <ol className="mt-12 space-y-6">
          {ESTUDIS.map((estudi, i) => (
            <Apilada key={estudi.titol} index={i} total={ESTUDIS.length}>
                <article className="rounded-[20px] border border-linia bg-fons-2/60 p-6 sm:p-8 lg:p-10">
                  <div className="grid gap-6 lg:grid-cols-[minmax(200px,280px)_minmax(0,1fr)] lg:gap-12 2xl:gap-16">
                    <div>
                      <p className="text-[14px] text-tinta-2">{t(estudi.quan)}</p>
                      {estudi.tag ? (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-[8px] bg-accent-bg px-2.5 py-1 text-[14px] font-medium text-accent-2">
                          <span aria-hidden className="size-1.5 rounded-full bg-accent-2" />
                          {t(estudi.tag)}
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={
                        estudi.chips
                          ? "grid gap-6 2xl:grid-cols-[minmax(0,48ch)_minmax(0,1fr)] 2xl:gap-16"
                          : ""
                      }
                    >
                      <div className="max-w-[62ch]">
                        <h3 className="text-[19px] font-semibold leading-snug tracking-tight sm:text-[22px]">
                          {t(estudi.titol)}
                        </h3>
                        <p className="mt-2 text-[14px] text-tinta-2">{estudi.lloc}</p>
                        {estudi.nota ? (
                          <p className="mt-3 text-[14px] text-tinta-2">{t(estudi.nota)}</p>
                        ) : null}
                      </div>
                      {estudi.chips ? (
                        <ul aria-label={t("edu.aria")} className="flex flex-wrap content-start gap-2">
                          {estudi.chips.map((chip) => (
                            <li
                              key={chip}
                              className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1.5 text-[14px] text-tinta-2"
                            >
                              {CLAUS.has(chip) ? t(chip as Clau) : chip}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </article>
            </Apilada>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Aptitudes ---------- */

const GRUPS: { titol: Clau; chips: (Clau | string)[] }[] = [
  {
    titol: "skills.g1",
    chips: [
      "Kali Linux", "Nmap", "Burp Suite", "SQLMap", "Metasploit", "Wireshark", "OSINT",
      "sk.explo", "sk.esc", "sk.lat", "sk.post", "Payloads", "sk.wifi", "sk.e2e", "sk.info"
    ]
  },
  { titol: "skills.g2", chips: ["Blue Team", "Purple Team", "SOC", "sk.inc", "SIEM", "sk.cve"] },
  { titol: "skills.g3", chips: ["OWASP", "PTES", "ENS", "NIS2", "sk.rgpd"] },
  { titol: "skills.g4", chips: ["Python", "Java", "MariaDB", "TCP/IP"] },
  { titol: "skills.g5", chips: ["sk.ag", "sk.ml", "sk.llm", "sk.iacyber"] }
];

const CLAUS_SK = new Set<string>([
  "sk.explo", "sk.esc", "sk.lat", "sk.post", "sk.wifi", "sk.e2e", "sk.info",
  "sk.inc", "sk.cve", "sk.rgpd", "sk.ag", "sk.ml", "sk.llm", "sk.iacyber"
]);

// Ruso primero, que es la lengua de casa. Despues los dos que estan certificados al mismo
// nivel, y el ingles al final. Los codigos del marco europeo van igual en los tres idiomas.
const IDIOMES: [Clau, Clau][] = [
  ["lg.ru", "lg.ru.n"],
  ["lg.es", "lg.es.n"],
  ["lg.ca", "lg.ca.n"],
  ["lg.en", "lg.en.n"]
];

function Habilitats() {
  const { t } = useIdioma();

  return (
    <section id="habilitats" className="scroll-mt-28 py-20 lg:py-28">
      <div className={AMPLE}>
        <Titol numero="04" text={t("skills.h")} />
        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
          {t("skills.intro")}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
          {GRUPS.map((grup, i) => (
            <Entrada key={grup.titol} retard={Math.min(i, 4) * 0.06} className="h-full">
              <div className="h-full rounded-[20px] border border-linia bg-fons-2/60 p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {t(grup.titol)}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {grup.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1.5 text-[14px] text-tinta-2"
                    >
                      {CLAUS_SK.has(chip) ? t(chip as Clau) : chip}
                    </li>
                  ))}
                </ul>
              </div>
            </Entrada>
          ))}

          <Entrada retard={0.3} className="h-full">
            <div className="h-full rounded-[20px] border border-linia bg-fons-2/60 p-6 sm:p-8">
              <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent">
                {t("skills.g6")}
              </h3>
              <p className="mt-5 max-w-[56ch] text-[14px] leading-relaxed text-tinta-2">
                {t("skills.soft")}
              </p>
            </div>
          </Entrada>

          <Entrada retard={0.36} className="h-full">
            <div className="h-full rounded-[20px] border border-linia bg-fons-2/60 p-6 sm:p-8">
              <h3 className="text-[15px] font-semibold uppercase tracking-[0.14em] text-accent">
                {t("skills.g7")}
              </h3>
              <ul className="mt-5 divide-y divide-linia-suau">
                {IDIOMES.map(([nom, nivell]) => (
                  <li key={nom} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
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

/* ---------- Contacto ---------- */

function Contacte() {
  const { t } = useIdioma();

  const vies = [
    { href: "mailto:" + CORREU, Icona: Correu, etiqueta: t("contact.mail"), valor: CORREU },
    { href: WHATSAPP, Icona: Xat, etiqueta: "WhatsApp", valor: "684 258 353" },
    { href: LINKEDIN, Icona: LinkedIn, etiqueta: "LinkedIn", valor: t("contact.li") },
    { href: GITHUB, Icona: GitHub, etiqueta: "GitHub", valor: t("contact.gh") }
  ];

  return (
    <section id="contacte" className="scroll-mt-28 py-20 lg:py-28">
      <div className={AMPLE}>
        <Titol numero="05" text={t("contact.h")} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20 2xl:gap-28">
          <div>
            <p className="titular titular--xl">{t("contact.claim")}</p>
            <p className="mt-6 max-w-[48ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
              {t("contact.intro")}
            </p>
          </div>

          <ul className="w-full max-w-[72ch] divide-y divide-linia lg:justify-self-end">
            {vies.map(({ href, Icona, etiqueta, valor }, i) => (
              <Entrada key={etiqueta} retard={Math.min(i, 4) * 0.06}>
                <li>
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener"
                    className="group flex min-h-[72px] items-center gap-4 py-5 transition-colors duration-200 hover:text-accent-2 sm:gap-6"
                  >
                    <Icona className="shrink-0 text-[22px] text-tinta-3 transition-colors duration-200 group-hover:text-accent" />
                    <span className="w-[88px] shrink-0 text-[14px] uppercase tracking-[0.12em] text-tinta-3 sm:w-[120px]">
                      {etiqueta}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] text-tinta transition-colors duration-200 group-hover:text-accent-2 sm:text-[17px]">
                      {valor}
                    </span>
                    <Fletxa className="shrink-0 text-[20px] text-tinta-3 transition-colors duration-200 group-hover:text-accent" />
                  </a>
                </li>
              </Entrada>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- El portafolio entero ---------- */

export function Portafoli({ rol, sortir }: { rol: Rol; sortir: () => void }) {
  const { t } = useIdioma();
  const [compte, setCompte] = useState(0);
  const guardarCompte = useCallback((n: number) => setCompte(n), []);

  return (
    <>
      <a
        href="#contingut"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[8px] focus:bg-accent focus:px-4 focus:py-2 focus:text-[14px] focus:font-semibold focus:text-sobre-accent"
      >
        {t("skip")}
      </a>

      <Capcalera sortir={sortir} />

      <main id="contingut">
        <Portada compte={compte} />
        <Sobre />
        <Cinta />

        <section id="projectes" className="scroll-mt-28 py-20 lg:py-28">
          <div className={AMPLE}>
            <Titol numero="02" text={t("proj.h")} />
            <p className="mb-12 mt-6 max-w-[62ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
              {t("proj.intro")}
            </p>
            <Projectes rol={rol} onCompte={guardarCompte} />
          </div>
        </section>

        <Formacio />
        <Habilitats />
        <Contacte />
      </main>

      <footer className="border-t border-linia py-10">
        <div className={`${AMPLE} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[14px] text-tinta-3`}>
          <p>Alex Aiguadé Alisultánov</p>
          <p>
            {t("foot.made")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
