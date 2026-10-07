import { useEffect, useState } from "react";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import type { Rol } from "../lib/acces";
import { ProveidorProjectes, useProjectesCtx } from "../lib/ProveidorProjectes";
import { CORREU, GITHUB, LINKEDIN, WHATSAPP } from "../lib/contacte";
import { Entrada } from "./Moviment";
import { CV_NOM, CV_PDF } from "../lib/cv";
import { Historia } from "./Historia";
import { Idiomes } from "./Idiomes";
import { MenuMobil } from "./MenuMobil";
import { CopiarCorreu, Portada } from "./Portada";
import { Projectes } from "./Projectes";
import { Titol } from "./Titol";
import { Trajectoria } from "./Trajectoria";
import { Correu, Fletxa, GitHub, Baixa, LinkedIn, Xat } from "./Icones";
import logo from "../assets/logo.png";

// Las anclas de la cabecera y de la hoja del menu. Van en este orden aunque en la pagina la
// historia venga antes que los proyectos: lo que se busca primero son las demos.
const SECCIONS: { id: string; clau: Clau }[] = [
  { id: "projectes", clau: "nav.projects" },
  { id: "historia", clau: "nav.story" },
  { id: "trayectoria", clau: "nav.background" },
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
  // El boton del CV solo sale cuando la portada, que ya lo lleva grande, deja de verse.
  const [cvVisible, setCvVisible] = useState(false);

  useEffect(() => {
    const portada = document.getElementById("dalt");
    if (!portada || !("IntersectionObserver" in window)) return;
    // Los 56 px de arriba son la propia cabecera: lo que queda tapado por ella no cuenta
    // como portada a la vista. (Mismo valor que --barra en index.css.)
    const vigilant = new IntersectionObserver(
      ([entrada]) => setCvVisible(!entrada.isIntersecting),
      { rootMargin: "-56px 0px 0px 0px" }
    );
    vigilant.observe(portada);
    return () => vigilant.disconnect();
  }, []);

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
    <header className="sticky top-0 z-50 h-[var(--barra)] border-b border-linia/70 bg-fons/80 backdrop-blur-xl">
      <div className={`${AMPLE} flex h-full items-center justify-between gap-4`}>
        <a
          href="#dalt"
          aria-label="Alex Aiguadé"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[8px] transition-opacity duration-200 hover:opacity-80 motion-reduce:transition-none"
        >
          <img
            src={logo}
            alt=""
            width={40}
            height={40}
            decoding="async"
            className="h-10 w-10"
          />
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
          {/* Con la portada fuera de la vista el CV sigue a un toque. Apagado queda inerte:
              ni foco ni clic, solo el fundido de 200 ms. */}
          <a
            href={CV_PDF}
            download={CV_NOM}
            inert={!cvVisible}
            aria-label={t("hero.cv")}
            className={`hidden min-h-[44px] items-center gap-2 rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent-2 transition-[opacity,background-color] duration-200 hover:bg-accent-bg sm:inline-flex ${
              cvVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            CV
            <Baixa className="text-[18px]" />
          </a>
          <Idiomes />
          <button
            type="button"
            onClick={sortir}
            className="hidden min-h-[44px] items-center rounded-[8px] border border-linia px-3 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta lg:inline-flex"
          >
            {t("sortir")}
          </button>
          {/* Por debajo de 1024 px la navegacion y "Salir" van en una hoja, para que la
              cabecera siga siendo una sola fila. */}
          <MenuMobil seccions={SECCIONS} activa={activa} sortir={sortir} />
        </div>
      </div>
    </header>
  );
}

/* ---------- Contacto ---------- */

const PRIMARI = `${BOTO} min-h-12 w-full bg-accent text-sobre-accent hover:bg-accent-2 sm:w-auto`;
const SECUNDARI =
  `${BOTO} min-h-12 w-full border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta sm:w-auto`;

function Contacte() {
  const { t } = useIdioma();

  const vies = [
    { href: "mailto:" + CORREU, Icona: Correu, etiqueta: t("contact.mail"), valor: CORREU },
    { href: WHATSAPP, Icona: Xat, etiqueta: "WhatsApp", valor: "684 258 353" },
    { href: LINKEDIN, Icona: LinkedIn, etiqueta: "LinkedIn", valor: t("contact.li") },
    { href: GITHUB, Icona: GitHub, etiqueta: "GitHub", valor: t("contact.gh") }
  ];

  return (
    <section id="contacte" className="py-14 sm:py-20 lg:py-28">
      <div className={AMPLE}>
        <Titol numero="06" text={t("contact.h")} />

        <div className="mt-10 grid gap-10 sm:mt-12 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20 2xl:gap-28">
          <div>
            <p className="titular titular--xl">{t("contact.claim")}</p>
            <p className="mt-6 max-w-[48ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
              {t("cont.frase")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#cv" className={PRIMARI}>
                {t("contact.cv")}
              </a>
              <a href={CV_PDF} download={CV_NOM} className={SECUNDARI}>
                {t("cont.pdf")}
                <Baixa className="text-[18px]" />
              </a>
            </div>
          </div>

          <ul className="w-full max-w-[72ch] divide-y divide-linia lg:justify-self-end">
            {vies.map(({ href, Icona, etiqueta, valor }, i) => (
              <li key={etiqueta}>
                <Entrada retard={i * 0.06} y={8} duracio={0.24} className="flex items-center gap-2">
                  <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener"
                    className="group flex min-h-[72px] flex-1 items-center gap-4 py-5 transition-colors duration-200 hover:text-accent-2 sm:gap-6"
                  >
                    <Icona className="shrink-0 text-[22px] text-tinta-3 transition-colors duration-200 group-hover:text-accent" />
                    <span className="sr-only shrink-0 text-[14px] uppercase tracking-[0.12em] text-tinta-3 sm:not-sr-only sm:w-[120px]">
                      {etiqueta}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] text-tinta transition-colors duration-200 group-hover:text-accent-2 sm:text-[17px]">
                      {valor}
                    </span>
                    <Fletxa
                      className={`shrink-0 text-[20px] text-tinta-3 transition-colors duration-200 group-hover:text-accent ${
                        href.startsWith("mailto:") ? "max-sm:hidden" : ""
                      }`}
                    />
                  </a>
                  {/* El correo se puede copiar sin salir de la pagina. */}
                  {href.startsWith("mailto:") ? (
                    <CopiarCorreu className="inline-flex min-h-11 min-w-[5.5rem] shrink-0 items-center justify-center rounded-[8px] border border-linia px-3 text-[14px] font-medium text-accent-2 transition-colors duration-200 hover:border-accent/40 hover:bg-accent-bg" />
                  ) : null}
                </Entrada>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- El portafolio entero ---------- */

function Pagina({ sortir }: { sortir: () => void }) {
  const { t } = useIdioma();
  const { compte } = useProjectesCtx();

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
        <Portada />
        <Historia />

        <section id="projectes" className="py-14 sm:py-20 lg:py-28">
          <div className={AMPLE}>
            <Titol numero="04" text={t("proj.h")} />
            <p className="mb-12 mt-6 max-w-[62ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
              {t("proj.intro", { n: compte })}
            </p>
            <Projectes />
          </div>
        </section>

        <Trajectoria />
        <Contacte />
      </main>

      <footer className="border-t border-linia py-10">
        <div className={`${AMPLE} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[14px] text-tinta-3`}>
          <p>Alejandro (Alex) Aiguadé Alisultánov · Lleida</p>
          <p>
            {t("foot.made")} · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}

// Proyectos y demos se piden y se despiertan en un solo sitio, por encima de la portada y
// del carrusel, para que los dos vean lo mismo.
export function Portafoli({ rol, sortir }: { rol: Rol; sortir: () => void }) {
  return (
    <ProveidorProjectes rol={rol}>
      <Pagina sortir={sortir} />
    </ProveidorProjectes>
  );
}
