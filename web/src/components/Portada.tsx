// La portada (#dalt): lo que alguien busca en los diez primeros segundos, en una sola
// pantalla. Desde 1280 px son tres columnas: quien soy y como contactar, el retrato (con el
// chip 3D detras) y un carrusel con todos los proyectos, que se pueden probar ahi mismo (las
// cuatro destacadas van primero). Cada paso del carrusel es una columna con dos proyectos, uno
// encima de otro, en tarjetas verticales: la captura arriba y debajo el nombre, el stack y el
// boton. De 768 a 1279 quedan dos columnas, y en el movil una sola con las demos en una fila
// deslizable. La rejilla y los tamanos viven en index.css (.portada*), que es donde estan
// tambien los cortes de ventana.
//
// El retrato es la primera <img> de la seccion y tiene que seguir siendolo: Escena.tsx se
// coloca buscandola y escala el chip con su ancho. Por eso es un solo elemento que cambia de
// sitio con la rejilla (no uno por tamano de pantalla) y por eso mide lo mismo que el circulo
// que se ve: el chip sale a 2,1 veces el retrato.

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { CORREU, GITHUB, LINKEDIN, WHATSAPP } from "../lib/contacte";
import { CV_NOM, CV_PDF } from "../lib/cv";
import type { Projecte } from "../lib/projectes";
import { useDespertarTotes, useEstatDemo, useProjectesCtx } from "../lib/ProveidorProjectes";
import { BotoDemo, progres } from "./BotoDemo";
import { Captura } from "./Captura";
import { Carrusel } from "./Carrusel";
import { Fons3D } from "./Fons3D";
import { Baixa, Correu, Dreta, GitHub, LinkedIn, Xat } from "./Icones";
import { Entrada, Iman, useMovil } from "./Moviment";
import { useRelat } from "./relat/Escenari";
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

/* ---------- Las demos: un carrusel de columnas de dos proyectos ---------- */

/**
 * La tarjeta del carrusel, vertical: la captura arriba, tan ancha como la tarjeta, y debajo el
 * nombre, el stack y el boton de la demo. Dos de estas, una encima de otra, son cada paso del
 * carrusel. El alto de la captura lo fija index.css (.portada__captura) para que las dos
 * tarjetas de la primera columna quepan enteras en el primer pantallazo.
 */
function TargetaMini({ dades, prioritaria }: { dades: Projecte; prioritaria: boolean }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { fase, segons } = useEstatDemo(dades.demo);

  // La marca de equipo no es una tecnologia: en la tarjeta va en una sola palabra.
  const equip = t("chip.equip");
  const stack = dades.tec.slice(0, 3).map((una) => (una === equip ? t("demos.equip") : una));

  // Lo que va a la derecha del stack, en la misma linea para no sumar alto a todas las tarjetas
  // (las filas del carrusel miden lo que mide la mas alta): la nota de que la demo pide crear
  // una cuenta o, si no hay demo que abrir, en que punto esta el proyecto.
  const nota = dades.registre
    ? t("demos.registre")
    : !dades.demo && !dades.tancat && dades.marca
      ? t(dades.marca)
      : "";

  // Lo mismo que la tarjeta grande: si el rol no puede abrirla, lo dice; si no tiene demo,
  // lleva al codigo o cuenta en que punto esta.
  let pie: ReactNode = null;
  if (dades.tancat) {
    pie = (
      <p className="flex items-baseline gap-2 text-[13px] leading-snug">
        <span aria-hidden className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-espera" />
        <span className="font-medium text-tinta">{t("obres.nom")}</span>
      </p>
    );
  } else if (dades.demo) {
    pie = <BotoDemo url={dades.demo} titol={dades.titol} mida="mini" />;
  } else if (dades.url) {
    pie = (
      <a
        href={dades.url}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-linia px-3 text-[14px] font-semibold text-tinta transition-colors duration-200 hover:border-accent/40 pointer-coarse:min-h-11"
      >
        <GitHub />
        {t("feed.code")}
      </a>
    );
  }

  return (
    <article className="targeta portada__targeta rounded-[20px] border border-linia bg-fons-2">
      <div className="portada__captura relative overflow-hidden rounded-[8px] border border-linia bg-fons-3">
        {dades.captura ? (
          <Captura src={dades.captura} titol={dades.titol} alta={dades.alta} prioritaria={prioritaria} />
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

      <div className="portada__text">
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-[22px] text-tinta">{dades.curt}</h3>
        {/* El stack a la izquierda y, si la hay, la nota a la derecha, siempre en una linea: una
            nota que bajara de linea alargaria la fila de todas las columnas. El stack ocupa lo que
            deja la nota y ensena las piezas enteras que caben (index.css, .portada__pila-lista). */}
        <div className="portada__pila">
          <p className="portada__pila-lista">
            {stack.map((una) => (
              <span key={una}>{una}</span>
            ))}
          </p>
          {nota ? <p className="shrink-0 whitespace-nowrap text-tinta-2">{nota}</p> : null}
        </div>
        {pie ? <div className="mt-auto pt-2">{pie}</div> : null}
      </div>
    </article>
  );
}

/**
 * Cierra el carrusel con la salida hacia la seccion de proyectos. Mide lo mismo que una
 * tarjeta, para que la columna en la que cae no cambie de altura: el numero de proyectos en
 * contorno, como el de las secciones, y abajo el enlace.
 */
function TargetaTots({ n }: { n: number }) {
  const { t } = useIdioma();
  return (
    <a href="#projectes" className="targeta portada__tots rounded-[20px] border border-linia bg-fons-2">
      <span aria-hidden className="num portada__tots-num">
        {n}
      </span>
      <span className="portada__tots-pie">
        <span className="text-[16px] font-semibold leading-snug text-tinta">{t("demos.tots")}</span>
        <span aria-hidden className="portada__tots-fletxa">
          <Dreta className="text-[18px]" />
        </span>
      </span>
    </a>
  );
}

type Peca = { clau: string; dades?: Projecte };

function Demos() {
  const { t } = useIdioma();
  const { llista, destacats, compte } = useProjectesCtx();
  // "Despertar todas" toca todas las demos de la lista, no solo las que se ven.
  const { comptes: c, apagat, despertarTotes } = useDespertarTotes();
  const movil = useMovil();

  // Primero las cuatro destacadas, en su orden fijo, y despues el resto de la lista: el
  // carrusel lleva todos los proyectos. Cada paso del carrusel es una columna de dos, y detras
  // del ultimo proyecto va la tarjeta que baja a #projectes. Con nueve proyectos esa tarjeta
  // completa la ultima columna, y con una cuenta par se queda sola ocupando la columna entera.
  const destacades = new Set(destacats.map((p) => p.nom));
  const totes = [...destacats, ...llista.filter((p) => !destacades.has(p.nom))];
  const peces: Peca[] = [...totes.map((dades) => ({ clau: dades.nom, dades })), { clau: "tots" }];
  const columnes: Peca[][] = [];
  for (let i = 0; i < peces.length; i += 2) columnes.push(peces.slice(i, i + 2));

  if (!totes.length) return null;

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

      <p className="portada__nota">{t("demos.nota")}</p>

      <div className="portada__carrusel">
        {/* El movil lleva la fila quieta con scroll nativo y snap: el dedo la mueve mejor que
            una cinta que avanza sola, y la portada no se mueve mientras se lee. Las columnas
            entran por la derecha y salen por la izquierda: tras la primera llega la segunda, y
            "Ver todos" queda al final del recorrido en vez de ser lo primero que aparece. */}
        <Carrusel
          compacte
          entra="dreta"
          quieta={movil}
          etiqueta={t("demos.titol")}
          acciones={
            c.total > 0 ? (
              <button
                type="button"
                aria-disabled={apagat}
                onClick={despertarTotes}
                className="inline-flex min-h-11 items-center rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent-2 transition-colors duration-200 hover:border-accent hover:bg-accent-bg aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent"
              >
                {apagat ? t("proj.compte", { k: c.on, n: c.total }) : t("proj.totes")}
              </button>
            ) : null
          }
        >
          {columnes.map((columna, c) => (
            <div key={columna.map((peca) => peca.clau).join("+")} className="portada__col">
              {columna.map((peca) =>
                peca.dades ? (
                  <TargetaMini key={peca.clau} dades={peca.dades} prioritaria={c < 2} />
                ) : (
                  <TargetaTots key={peca.clau} n={compte} />
                )
              )}
            </div>
          ))}
        </Carrusel>
      </div>
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
      href="#historia"
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
  const { pelicula, retrat } = useRelat();
  const seccio = useRef<HTMLElement>(null);

  return (
    <section id="dalt" ref={seccio} className="portada" data-tapa>
      {/* En modo normal la escena vive solo detras de la portada: mas abajo estorbaria a la
          lectura y no habria por que estar pintando nada. En la pelicula la pone la capa fijada
          de relat/Escenari.tsx, que la lleva de la portada a la historia. */}
      {pelicula ? null : (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <Fons3D />
        </div>
      )}

      <div className="ample portada__reixa">
        {/* Primera <img> de la seccion: ver la nota de arriba. */}
        <Entrada className="portada__retrat" retard={0.06} y={8} duracio={0.24}>
          <Iman className="size-full">
            <img
              ref={retrat}
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
          <Demos />
        </Entrada>
      </div>

      <Pista seccio={seccio} />
    </section>
  );
}
