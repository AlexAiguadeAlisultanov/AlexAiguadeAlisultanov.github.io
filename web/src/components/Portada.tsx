// La portada (#dalt): lo que alguien busca en los diez primeros segundos, en una sola
// pantalla. Desde 1280 px son tres columnas: quien soy y como contactar, el retrato (con el
// chip 3D detras) y cuatro demos que se pueden probar ahi mismo. De 768 a 1279 quedan dos
// columnas, y en el movil una sola con las demos en una fila deslizable. La rejilla y los
// tamanos viven en index.css (.portada*), que es donde estan tambien los cortes de ventana.
//
// El retrato es la primera <img> de la seccion y tiene que seguir siendolo: Escena.tsx se
// coloca buscandola y escala el chip con su ancho. Por eso es un solo elemento que cambia de
// sitio con la rejilla (no uno por tamano de pantalla) y por eso mide lo mismo que el circulo
// que se ve: el chip sale a 2,1 veces el retrato.

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { CORREU, GITHUB, LINKEDIN, WHATSAPP } from "../lib/contacte";
import { CV_NOM, CV_PDF } from "../lib/cv";
import { esAdormida } from "../lib/demos";
import type { Projecte } from "../lib/projectes";
import { useEstatDemo, useProjectesCtx } from "../lib/ProveidorProjectes";
import { BotoDemo, progres } from "./BotoDemo";
import { Fons3D } from "./Fons3D";
import { Baixa, Correu, Dreta, GitHub, LinkedIn, Xat } from "./Icones";
import { Entrada, Iman } from "./Moviment";
import retrat400 from "../assets/alex-400.webp";
import retrat800 from "../assets/alex-800.webp";

/* ---------- Copiar el correo ---------- */

async function copiarText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Sin permiso o sin contexto seguro: se prueba el camino antiguo.
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(area);
    area.select();
    const be = document.execCommand("copy");
    area.remove();
    return be;
  } catch {
    return false;
  }
}

/**
 * Boton que copia el correo. Durante dos segundos dice "Copiado", y una region aria-live lo
 * anuncia a quien no ve el boton. Lo usan la portada y el contacto del final, cada uno con
 * su aspecto (className).
 */
export function CopiarCorreu({ className = "" }: { className?: string }) {
  const { t } = useIdioma();
  const [copiat, setCopiat] = useState(false);
  const rellotge = useRef(0);

  useEffect(() => () => window.clearTimeout(rellotge.current), []);

  const copiar = async () => {
    if (!(await copiarText(CORREU))) return;
    setCopiat(true);
    window.clearTimeout(rellotge.current);
    rellotge.current = window.setTimeout(() => setCopiat(false), 2000);
  };

  return (
    <>
      <button type="button" onClick={copiar} className={className}>
        {copiat ? t("copiat") : t("copiar")}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copiat ? t("copiat") : ""}
      </span>
    </>
  );
}

/* ---------- Contacto rapido ---------- */

const ICONA =
  "inline-grid size-11 place-items-center rounded-[8px] border border-linia text-[20px] text-tinta-2 " +
  "transition-colors duration-200 hover:border-accent/40 hover:text-accent-2 max-md:w-full";

function ContacteRapid() {
  const { t } = useIdioma();
  return (
    <div className="portada__contacte">
      {/* Con ancho para ello, el correo va escrito y con su boton de copiar. En el movil
          es un icono mas, igual que los otros tres. */}
      <div className="hidden items-stretch overflow-hidden rounded-[8px] outline outline-1 -outline-offset-1 outline-linia md:inline-flex">
        <a
          href={"mailto:" + CORREU}
          className="inline-flex min-h-11 items-center pl-3.5 pr-3 text-[14px] text-tinta transition-colors duration-200 hover:text-accent-2"
        >
          {CORREU}
        </a>
        <CopiarCorreu className="inline-flex min-h-11 min-w-[4.75rem] items-center justify-center border-l border-linia px-3 text-[12px] font-medium text-accent-2 transition-colors duration-200 hover:bg-accent-bg" />
      </div>
      <a
        href={"mailto:" + CORREU}
        aria-label={`${t("contact.mail")}: ${CORREU}`}
        className={`${ICONA} md:hidden`}
      >
        <Correu />
      </a>
      <a href={WHATSAPP} target="_blank" rel="noopener" aria-label="WhatsApp" className={ICONA}>
        <Xat />
      </a>
      <a href={LINKEDIN} target="_blank" rel="noopener" aria-label="LinkedIn" className={ICONA}>
        <LinkedIn />
      </a>
      <a href={GITHUB} target="_blank" rel="noopener" aria-label="GitHub" className={ICONA}>
        <GitHub />
      </a>
    </div>
  );
}

/* ---------- Ficha ---------- */

type Cel = { k: Clau; v: Clau; n: Clau; punt?: true };

const CELS: Cel[] = [
  { k: "fitxa.busco", v: "fitxa.busco.v", n: "fitxa.busco.n", punt: true },
  { k: "fitxa.on", v: "fitxa.on.v", n: "fitxa.on.n" },
  { k: "fitxa.ara", v: "fitxa.ara.v", n: "fitxa.ara.n" },
  { k: "fitxa.exp", v: "fitxa.exp.v", n: "fitxa.exp.n" }
];

function Fitxa() {
  const { t } = useIdioma();
  return (
    <dl className="fitxa">
      {CELS.map(({ k, v, n, punt }) => (
        <div key={k} className="fitxa__cel">
          <dt>{t(k)}</dt>
          <dd className="fitxa__v">
            {punt ? <span aria-hidden className="portada__punt" /> : null}
            {t(v)}
          </dd>
          <dd className="fitxa__n">{t(n)}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Con que trabajo ---------- */

type Xip = string | { clau: Clau };

const XIPS: Xip[] = [
  { clau: "stack.win" },
  { clau: "stack.red" },
  "Kali Linux",
  "Wireshark",
  "Burp Suite",
  "Python",
  "Java",
  "MySQL"
];

function Stack() {
  const { t } = useIdioma();
  return (
    <div className="portada__stack">
      <p id="portada-stack" className="portada__etiqueta">
        {t("hero.stack")}
      </p>
      <ul aria-labelledby="portada-stack" className="mt-2 flex flex-wrap gap-1.5">
        {XIPS.map((xip) => {
          const text = typeof xip === "string" ? xip : t(xip.clau);
          return (
            <li
              key={text}
              className="rounded-[8px] border border-linia bg-fons-3 px-2 py-[3px] text-[13px] leading-snug text-tinta-2"
            >
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Demos destacadas ---------- */

function TargetaMini({ dades }: { dades: Projecte }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { fase, segons } = useEstatDemo(dades.demo);

  // La marca de equipo no es una tecnologia: en la tarjeta pequena va en una sola palabra.
  const equip = t("chip.equip");
  const stack = dades.tec
    .slice(0, 3)
    .map((una) => (una === equip ? t("demos.equip") : una))
    .join(" · ");

  return (
    <li className="targeta flex flex-col overflow-hidden rounded-[20px] border border-linia bg-fons-2 portada__carta">
      <div className="portada__captura captura-marc relative overflow-hidden border-b border-linia bg-fons-3">
        {dades.captura ? (
          <img
            src={dades.captura}
            alt={t("card.shot", { t: dades.titol })}
            decoding="async"
            draggable={false}
            className={`captura ${dades.alta ? "captura--alta" : "captura--plana"}`}
          />
        ) : (
          <span aria-hidden className="composicio absolute inset-0" />
        )}
        {/* Mientras la demo arranca, una linea de 2 px en la base de la captura avanza con los
            segundos y se queda al 90 % hasta que contesta. Con movimiento reducido no se pinta. */}
        {fase === "waking" && !quiet ? (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${progres(segons)})` }}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-tinta">{dades.curt}</h3>
        <p className="mt-0.5 truncate text-[12px] leading-snug text-tinta-3">{stack}</p>
        {dades.registre ? (
          <p className="mt-1 text-[12px] leading-snug text-tinta-3">{t("demos.registre")}</p>
        ) : null}
        <div className="mt-auto pt-2.5">
          <BotoDemo url={dades.demo} titol={dades.titol} mida="mini" />
        </div>
      </div>
    </li>
  );
}

function DemosDestacades() {
  const { t } = useIdioma();
  const { destacats, demos, compte } = useProjectesCtx();

  // "Despertar las cuatro" solo toca estas cuatro, no las nueve de la lista.
  const adreces = destacats.map((p) => p.demo).filter((url) => esAdormida(url));
  const fases = adreces.map((url) => demos.fase(url));
  const llestes = fases.filter((fase) => fase === "on").length;
  const arrencant = fases.some((fase) => fase === "waking");
  const apagat = arrencant || (fases.length > 0 && llestes === fases.length);

  const despertarTotes = () => {
    if (apagat) return;
    let quantes = 0;
    for (const url of adreces) {
      const fase = demos.fase(url);
      if (fase === "off" || fase === "fail") {
        demos.despertar(url);
        quantes += 1;
      }
    }
    if (quantes) {
      demos.anunciar(quantes === 1 ? t("wake.live.on.one") : t("wake.live.on", { n: quantes }));
    }
  };

  if (!destacats.length) return null;

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="portada-demos" className="portada__etiqueta portada__etiqueta--accent">
          {t("demos.titol")}
        </h2>
        <a
          href="#projectes"
          className="-my-3 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-[14px] text-accent-2 transition-colors duration-200 hover:text-tinta"
        >
          {t("demos.totes", { n: compte })}
          <Dreta className="text-[16px]" />
        </a>
      </div>

      <div className="portada__nota">
        <p>{t("demos.nota")}</p>
        <button
          type="button"
          aria-disabled={apagat}
          onClick={despertarTotes}
          className="mt-2 inline-flex min-h-11 items-center rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent-2 transition-colors duration-200 hover:border-accent hover:bg-accent-bg aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent"
        >
          {apagat ? t("proj.compte", { k: llestes, n: fases.length }) : t("demos.quatre")}
        </button>
      </div>

      <ul aria-labelledby="portada-demos" className="portada__graella">
        {destacats.map((dades) => (
          <TargetaMini key={dades.nom} dades={dades} />
        ))}
      </ul>
    </>
  );
}

/* ---------- Pista hacia la historia ---------- */

/** "Como he llegado hasta aqui": se apaga entre q = 0 y q = 0,15 del recorrido de la portada. */
function Pista({ seccio }: { seccio: RefObject<HTMLElement | null> }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { scrollY } = useScroll();
  const alt = useRef(0);
  const [activa, setActiva] = useState(true);

  useEffect(() => {
    const node = seccio.current;
    if (!node) return;
    const mesurar = () => {
      alt.current = node.offsetHeight;
    };
    mesurar();
    const vigilant = new ResizeObserver(mesurar);
    vigilant.observe(node);
    return () => vigilant.disconnect();
  }, [seccio]);

  const opacitat = useTransform(scrollY, (y) => Math.max(0, 1 - y / (0.15 * (alt.current || window.innerHeight))));
  // Apagada no recibe ni foco ni clic.
  useMotionValueEvent(opacitat, "change", (valor) => setActiva(quiet || valor > 0.05));

  return (
    <motion.a
      href="#sobre-mi"
      inert={!activa}
      style={quiet ? undefined : { opacity: opacitat }}
      className="portada__pista"
    >
      {t("hero.pista")}
      <Baixa className="text-[16px]" />
    </motion.a>
  );
}

/* ---------- La portada ---------- */

export function Portada() {
  const { t } = useIdioma();
  const seccio = useRef<HTMLElement>(null);

  return (
    <section id="dalt" ref={seccio} className="portada">
      {/* La escena vive solo detras de la portada. Mas abajo estorbaria a la lectura y no
          habria por que estar pintando nada. */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Fons3D />
      </div>

      <div className="ample portada__reixa">
        {/* Primera <img> de la seccion: ver la nota de arriba. */}
        <Entrada className="portada__retrat" retard={0.06} y={8} duracio={0.24}>
          <Iman className="size-full">
            <img
              src={retrat400}
              srcSet={`${retrat400} 400w, ${retrat800} 800w`}
              sizes="(min-width: 1280px) 340px, 120px"
              width={400}
              height={400}
              alt={t("hero.alt")}
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="portada__foto"
            />
          </Iman>
        </Entrada>

        <Entrada className="portada__id" y={8} duracio={0.24}>
          <div className="portada__cap">
            <p className="portada__ante">{t("hero.ante")}</p>
            <h1 className="titular portada__h1">
              Alex
              <br />
              Aiguadé
            </h1>
          </div>

          <p className="portada__lema">{t("hero.lema")}</p>

          {/* En el movil la ficha se resume en dos lineas. */}
          <p className="portada__meta">
            <span aria-hidden className="portada__punt" />
            {t("hero.mov1")}
            <br />
            {t("hero.mov2")}
          </p>

          <Fitxa />

          <div className="portada__accions">
            <a
              href={CV_PDF}
              download={CV_NOM}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] bg-accent px-5 text-[15px] font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2 max-md:w-full"
            >
              {t("hero.cv")}
              <Baixa className="text-[18px]" />
            </a>
            <a
              href="#cv"
              className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-linia px-5 text-[15px] font-semibold text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta max-md:hidden"
            >
              {t("hero.vercv")}
            </a>
          </div>

          <ContacteRapid />
          <Stack />
        </Entrada>

        <Entrada className="portada__demos" retard={0.12} y={8} duracio={0.24}>
          <DemosDestacades />
        </Entrada>
      </div>

      <Pista seccio={seccio} />
    </section>
  );
}
