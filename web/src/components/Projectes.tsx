// La seccion de proyectos: una cabecera con la nota de siempre, el contador de demos listas y
// el boton de despertarlas todas, y debajo el carrusel grande. Cada tarjeta cuenta lo justo para
// leerse de un vistazo: captura, de que va, que hizo Alex, con que pila y cuando, y las dos
// salidas (la demo y el codigo). Todo en el cian de la web, sin colores por proyecto.
//
// La lista y el estado de las demos vienen de ProveidorProjectes: lo que se despierte en la
// portada se ve aqui, y la lista se pide una sola vez.

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Projecte } from "../lib/projectes";
import {
  useDespertar,
  useDespertarTotes,
  useEstatDemo,
  useProjectesCtx
} from "../lib/ProveidorProjectes";
import { BotoDemo, CTA, progres } from "./BotoDemo";
import { Carrusel } from "./Carrusel";
import { GitHub } from "./Icones";
import { Entrada } from "./Moviment";

// Etiqueta pequena en mayusculas, con la medida de las de la portada (.portada__etiqueta).
const ETIQUETA = "text-[12px] font-medium uppercase leading-normal tracking-[0.14em] text-tinta-3";

function Chips({ pila, etiqueta }: { pila: string[]; etiqueta: string }) {
  if (!pila.length) return null;
  return (
    <ul aria-label={etiqueta} className="mt-5 flex flex-wrap gap-1.5">
      {pila.map((una) => (
        <li
          key={una}
          className="rounded-[8px] border border-linia bg-fons-3 px-1.5 py-[3px] text-[12px] leading-snug text-tinta-2"
        >
          {una}
        </li>
      ))}
    </ul>
  );
}

/** Proyecto sin captura: sus iniciales en contorno sobre un halo del acento. */
function Composicio({ titol }: { titol: string }) {
  const inicials = titol
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return (
    <div className="composicio absolute inset-0 grid place-items-center" aria-hidden>
      <span className="composicio__lletres">{inicials || titol.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

function Targeta({ dades }: { dades: Projecte }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { demos, dorm, fase, enMarxa, segons } = useEstatDemo(dades.demo);
  const despertarDemo = useDespertar();
  const clau = dades.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const idTitol = "proj-titol-" + clau;
  const idPaper = "proj-paper-" + clau;
  const idEstat = "proj-estat-" + clau;
  const individual = dades.persones <= 1;

  const despertar = () => despertarDemo(dades.demo, dades.titol);

  const imatge = dades.captura ? (
    <img
      src={dades.captura}
      alt={t("card.shot", { t: dades.titol })}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`captura ${dades.alta ? "captura--alta" : "captura--plana"}`}
    />
  ) : (
    <Composicio titol={dades.titol} />
  );

  // Mientras la demo arranca, una linea de 2 px en la base de la captura avanza con los segundos
  // y se queda al 90 % hasta que contesta, igual que en la tarjeta pequena de la portada. El
  // resto del estado lo cuenta el boton. Con movimiento reducido no se pinta.
  const avanc =
    dorm && fase === "waking" && !quiet ? (
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
        style={{ transform: `scaleX(${progres(segons)})` }}
      />
    ) : null;

  // La captura tambien abre la demo, pero solo con el raton o el dedo: para el teclado y
  // los lectores de pantalla ya esta el boton, y asi no hay dos paradas iguales.
  let marc: ReactNode;
  const classeMarc = "captura-marc relative block aspect-[16/10] overflow-hidden border-b border-linia bg-fons-3";
  if (dades.demo && enMarxa) {
    marc = (
      <a
        href={dades.demo}
        target="_blank"
        rel="noopener"
        tabIndex={-1}
        aria-hidden
        onClick={() => demos.visita(dades.demo)}
        className={classeMarc}
      >
        {imatge}
      </a>
    );
  } else {
    marc = (
      <div
        className={`${classeMarc} ${dades.demo && !dades.tancat ? "cursor-pointer" : ""}`}
        onClick={dades.demo && !dades.tancat ? despertar : undefined}
      >
        {imatge}
        {avanc}
      </div>
    );
  }

  return (
    <article
      aria-labelledby={idTitol}
      className="targeta flex h-full flex-col overflow-hidden rounded-[20px] border border-linia bg-fons-2"
    >
      {marc}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Cuando empezo, si lo hizo solo o en equipo y, a la derecha, el codigo. El enlace no va
            en el pie para que el pie sea igual en todas: un proyecto con el repositorio privado
            no lo tiene y su boton quedaria mas abajo que el de las demas. */}
        {dades.anyInici || dades.persones || (dades.demo && dades.url) ? (
          <div className="flex items-center justify-between gap-3">
            <p className={`${ETIQUETA} flex flex-wrap items-center gap-x-2`}>
              {dades.anyInici ? <span>{dades.anyInici}</span> : null}
              {dades.anyInici && dades.persones ? <span aria-hidden>·</span> : null}
              {dades.persones ? (
                <span>{individual ? t("proj.sol") : t("proj.equip", { n: dades.persones })}</span>
              ) : null}
            </p>
            {dades.demo && dades.url ? (
              <a
                href={dades.url}
                target="_blank"
                rel="noopener"
                aria-label={t("proj.codi", { t: dades.titol })}
                className="-my-3 -mr-2 ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] px-2 text-[14px] text-tinta-3 transition-colors duration-200 hover:text-tinta"
              >
                <GitHub />
                {t("feed.code")}
              </a>
            ) : null}
          </div>
        ) : null}

        <h3
          id={idTitol}
          className="mt-2 text-[19px] font-semibold leading-snug tracking-tight text-tinta sm:text-[21px]"
        >
          {dades.titol}
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-tinta-2">{dades.lema}</p>

        {dades.aportacio.length ? (
          <>
            <p id={idPaper} className={`${ETIQUETA} mt-5`}>
              {t(individual ? "proj.paper.sol" : "proj.paper.equip")}
            </p>
            {/* En el movil se queda con las dos primeras: la tercera es la que menos cuenta. */}
            <ul aria-labelledby={idPaper} className="mt-2 space-y-1.5">
              {dades.aportacio.map((frase, i) => (
                <li
                  key={frase}
                  className={`relative pl-4 text-[14px] leading-5 text-tinta-2 before:absolute before:left-0 before:top-2.5 before:h-px before:w-2 before:bg-accent ${
                    i > 1 ? "max-sm:hidden" : ""
                  }`}
                >
                  {frase}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <Chips pila={dades.pila} etiqueta={t("chips.aria")} />

        {/* Proyecto que este rol no puede abrir: la tarjeta se queda sin pie, con la
            linea que dice que esta a medias ocupando ese sitio. */}
        {dades.tancat ? (
          <p className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-6 text-[14px]">
            <span aria-hidden className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-espera" />
            <span className="font-medium text-tinta">{t("obres.nom")}</span>
            <span className="text-tinta-3">{t("obres.why")}</span>
          </p>
        ) : (
          <div className="mt-auto pt-6">
            {dades.demo ? (
              // Mientras la demo no conteste, el boton la despierta y cuenta los segundos; cuando
              // contesta, el mismo hueco pasa a ser el enlace que la abre. Nunca los dos a la vez.
              <BotoDemo
                url={dades.demo}
                titol={dades.titol}
                descrit={dorm && fase === "fail" ? idEstat : undefined}
              />
            ) : dades.url ? (
              <a
                href={dades.url}
                target="_blank"
                rel="noopener"
                className={`${CTA} border border-linia text-tinta hover:border-accent/40`}
              >
                <GitHub />
                {t("proj.code")}
              </a>
            ) : null}

            {/* Lo que el boton no cabe en decir cuando falla. Solo se oye: la tarjeta no crece. */}
            {dorm && fase === "fail" ? (
              <p id={idEstat} className="sr-only">
                {t("estat.fail.why")}
              </p>
            ) : null}

            {!dades.demo && dades.marca ? (
              <p className="mt-3 text-[14px] text-tinta-3">{t(dades.marca)}</p>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

// Una sola nota, el contador de las que ya contestan y el boton de despertarlas todas, en el
// mismo cian que el resto. En pantallas anchas todo va en una fila; en el movil el boton se
// queda al lado del contador si cabe y, si no, debajo.
function Capcalera() {
  const { t } = useIdioma();
  const { compte } = useProjectesCtx();
  const { comptes: c, apagat, despertarTotes } = useDespertarTotes();

  return (
    <Entrada y={8} duracio={0.24} className="mb-8 mt-6 sm:mb-10 sm:mt-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-tinta-2 sm:text-[16px]">
          {t("proj.intro", { n: compte })}
        </p>

        {c.total > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 max-sm:justify-between">
            {/* Cada vez que una contesta, el numero cambia y se anuncia solo. */}
            <p role="status" className="flex items-center gap-2.5 text-[14px] tabular-nums text-tinta-2">
              <span
                aria-hidden
                className={c.waking ? "pols" : `size-2 rounded-full ${c.on > 0 ? "bg-accent" : "bg-tinta-3"}`}
              />
              {t("proj.compte", { k: c.on, n: c.total })}
            </p>
            <button
              type="button"
              aria-disabled={apagat}
              onClick={despertarTotes}
              className="inline-flex min-h-11 items-center rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent-2 transition-colors duration-200 hover:border-accent hover:bg-accent-bg aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent"
            >
              {t("proj.totes")}
            </button>
          </div>
        ) : null}
      </div>
    </Entrada>
  );
}

export function Projectes() {
  const { t } = useIdioma();
  const { llista, estat } = useProjectesCtx();

  return (
    <>
      <Capcalera />

      {estat ? (
        <p role="status" className="mb-8 flex items-center gap-2.5 text-[14px] text-tinta-2">
          <span
            aria-hidden
            className={`size-2 rounded-full ${estat === "feed.loading" ? "bg-accent" : "bg-espera"}`}
          />
          {t(estat)}
        </p>
      ) : null}

      <Carrusel>
        {llista.map((dades) => (
          <Targeta key={dades.nom} dades={dades} />
        ))}
      </Carrusel>
    </>
  );
}
