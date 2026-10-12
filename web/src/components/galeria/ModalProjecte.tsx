// El modal con el detalle de un proyecto: la captura, de que va, que hizo Alex, con que pila y las
// dos salidas (probar la demo, que se inicia desde aqui, y el codigo). Es el mismo para el anillo de
// las demos de arriba (orbita.tsx) y para la galaxia de proyectos de abajo (galaxia.tsx).
//
// Se cierra con la X, con Escape o tocando fuera, atrapa el foco mientras esta abierto y lo devuelve a
// donde estaba al cerrar. Va en un portal al <body>: asi queda por encima de la cabecera aunque quien
// lo abre viva dentro de una seccion con su propio contexto de apilado (la banda de las demos, en la
// pelicula).

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { useEstatDemo } from "../../lib/ProveidorProjectes";
import { BotoDemo, CTA, progres } from "../BotoDemo";
import { Captura } from "../Captura";
import { GitHub, Tancar } from "../Icones";

const ETIQUETA = "text-[12px] font-medium uppercase leading-normal tracking-[0.14em] text-tinta-3";

export function ModalProjecte({ projecte, onTancar }: { projecte: Projecte; onTancar: () => void }) {
  const { t } = useIdioma();
  const { dorm, fase, segons } = useEstatDemo(projecte.demo);
  const quiet = useReducedMotion();
  const dialeg = useRef<HTMLDivElement>(null);
  // Quien abre el modal pasa una funcion nueva en cada render: el efecto de abajo no tiene que
  // volver a empezar (y a llevar el foco al principio) cada vez que quien lo abre se repinta.
  const tancar = useRef(onTancar);
  tancar.current = onTancar;
  const idTitol = "modal-titol-" + projecte.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const individual = projecte.persones <= 1;

  // Atrapa el foco dentro del dialogo, cierra con Escape y devuelve el foco a donde estaba.
  useEffect(() => {
    const abans = document.activeElement as HTMLElement | null;
    const node = dialeg.current;
    const focos = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const primero = focos()[0] ?? node;
    primero?.focus();

    const alTeclat = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        tancar.current();
        return;
      }
      if (e.key !== "Tab") return;
      const llista = focos();
      if (!llista.length) return;
      const primer = llista[0];
      const ultim = llista[llista.length - 1];
      if (e.shiftKey && document.activeElement === primer) {
        e.preventDefault();
        ultim.focus();
      } else if (!e.shiftKey && document.activeElement === ultim) {
        e.preventDefault();
        primer.focus();
      }
    };

    document.addEventListener("keydown", alTeclat, true);
    const abansOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclat, true);
      document.body.style.overflow = abansOverflow;
      abans?.focus?.();
    };
  }, []);

  const avanc =
    projecte.demo && dorm && fase === "waking" && !quiet ? (
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
        style={{ transform: `scaleX(${progres(segons)})` }}
      />
    ) : null;

  return createPortal(
    <div
      className="modal-projecte"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onTancar();
      }}
    >
      <div
        ref={dialeg}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitol}
        className="modal-projecte__cos targeta rounded-[20px] border border-linia bg-fons-2"
      >
        <button
          type="button"
          onClick={onTancar}
          aria-label={t("nav.close")}
          className="absolute right-3 top-3 z-[2] inline-grid size-10 place-items-center rounded-[12px] border border-linia bg-fons-2/80 text-[18px] text-tinta-2 backdrop-blur transition-colors duration-200 hover:border-accent/40 hover:text-tinta"
        >
          <Tancar />
        </button>

        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[20px] border-b border-linia bg-fons-3">
          {projecte.captura ? (
            <Captura src={projecte.captura} titol={projecte.titol} alta={projecte.alta} prioritaria />
          ) : (
            <span className="composicio absolute inset-0" aria-hidden />
          )}
          {avanc}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className={`${ETIQUETA} flex flex-wrap items-center gap-x-2`}>
              {projecte.anyInici ? <span>{projecte.anyInici}</span> : null}
              {projecte.anyInici && projecte.persones ? <span aria-hidden>·</span> : null}
              {projecte.persones ? (
                <span>{individual ? t("proj.sol") : t("proj.equip", { n: projecte.persones })}</span>
              ) : null}
            </p>
            {projecte.demo && projecte.url ? (
              <a
                href={projecte.url}
                target="_blank"
                rel="noopener"
                className="-my-2 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] px-2 text-[14px] text-tinta-3 transition-colors duration-200 hover:text-tinta"
              >
                <GitHub />
                {t("feed.code")}
              </a>
            ) : null}
          </div>

          <h3 id={idTitol} className="mt-2 text-[21px] font-semibold leading-snug tracking-tight text-tinta">
            {projecte.titol}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-2">{projecte.lema}</p>

          {projecte.aportacio.length ? (
            <>
              <p className={`${ETIQUETA} mt-5`}>{t(individual ? "proj.paper.sol" : "proj.paper.equip")}</p>
              <ul className="mt-2 space-y-1.5">
                {projecte.aportacio.map((frase) => (
                  <li
                    key={frase}
                    className="relative pl-4 text-[14px] leading-5 text-tinta-2 before:absolute before:left-0 before:top-2.5 before:h-px before:w-2 before:bg-accent"
                  >
                    {frase}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {projecte.pila.length ? (
            <ul aria-label={t("chips.aria")} className="mt-5 flex flex-wrap gap-1.5">
              {projecte.pila.map((una) => (
                <li
                  key={una}
                  className="rounded-[8px] border border-linia bg-fons-3 px-1.5 py-[3px] text-[12px] leading-snug text-tinta-2"
                >
                  {una}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6">
            {projecte.demo ? (
              <BotoDemo url={projecte.demo} titol={projecte.titol} />
            ) : projecte.url ? (
              <a
                href={projecte.url}
                target="_blank"
                rel="noopener"
                className={`${CTA} border border-linia text-tinta hover:border-accent/40`}
              >
                <GitHub />
                {t("proj.code")}
              </a>
            ) : null}
            {/* La nota de que la demo pide crear cuenta (el Volkswagen), donde toca. */}
            {projecte.registre ? <p className="mt-3 text-[13px] text-tinta-3">{t("demos.registre")}</p> : null}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
