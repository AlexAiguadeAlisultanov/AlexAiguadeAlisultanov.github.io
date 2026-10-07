// La navegacion de la cabecera cuando no cabe en una fila, por debajo de 1024 px. Un boton
// de 44 px abre una hoja que sube desde abajo con las secciones, la descarga del CV y
// "Salir".
//
// La hoja es un <dialog> modal. El navegador deja inerte el resto de la pagina, cierra con
// Escape y devuelve el foco al boton al cerrar. Lo que se anade aqui es el ciclo de Tab
// dentro de la hoja, el cierre al tocar fuera, el cierre si la ventana se ensancha hasta el
// menu de escritorio y, en index.css (.menu-fulla), la animacion y el bloqueo del scroll.

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { CV_NOM, CV_PDF } from "../lib/cv";
import { Baixa, Menu, Tancar } from "./Icones";

export type Seccio = { id: string; clau: Clau };

// Desde este ancho la cabecera ya lleva las anclas en linea y la hoja sobra.
const ESCRITORI = "(min-width: 1024px)";

const ENLLAC_FOCUS = "a[href], button:not([disabled])";

const PRIMARI =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[8px] bg-accent px-5 " +
  "text-[15px] font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2";

const SECUNDARI =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-[8px] border border-linia px-5 " +
  "text-[15px] font-semibold text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta";

export function MenuMobil({
  seccions,
  activa,
  sortir
}: {
  seccions: Seccio[];
  activa: string;
  sortir: () => void;
}) {
  const { t } = useIdioma();
  const dialeg = useRef<HTMLDialogElement>(null);
  // Si el gesto que acaba en un clic empezo fuera de la hoja. Sin esto, arrastrar para
  // seleccionar algo dentro y soltar fuera la cerraria.
  const comencaFora = useRef(false);
  const [obert, setObert] = useState(false);
  const idFulla = useId();
  const idTitol = useId();

  const obrir = () => {
    const d = dialeg.current;
    if (d && !d.open) d.showModal();
    setObert(true);
  };

  const tancar = useCallback(() => {
    const d = dialeg.current;
    if (d?.open) d.close();
  }, []);

  // Si la ventana se ensancha con la hoja abierta, el menu de escritorio ya esta a la
  // vista: la hoja se cierra y la pagina recupera el scroll.
  useEffect(() => {
    const consulta = window.matchMedia(ESCRITORI);
    const alCanviar = () => {
      if (consulta.matches) tancar();
    };
    consulta.addEventListener("change", alCanviar);
    return () => consulta.removeEventListener("change", alCanviar);
  }, [tancar]);

  // Tab y Mayus+Tab dan la vuelta dentro de la hoja: de la ultima accion se pasa a la
  // primera y al reves, sin salir a la pagina de detras.
  const alTeclat = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const d = dialeg.current;
    if (!d) return;
    const focs = Array.from(d.querySelectorAll<HTMLElement>(ENLLAC_FOCUS));
    if (!focs.length) return;
    const primer = focs[0];
    const ultim = focs[focs.length - 1];
    const actiu = document.activeElement;
    if (e.shiftKey && (actiu === primer || actiu === d)) {
      e.preventDefault();
      ultim.focus();
    } else if (!e.shiftKey && actiu === ultim) {
      e.preventDefault();
      primer.focus();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={obrir}
        aria-haspopup="dialog"
        aria-expanded={obert}
        aria-controls={idFulla}
        className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-[8px] border border-linia px-2.5 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta sm:w-auto sm:px-3 lg:hidden"
      >
        <Menu className="text-[20px]" />
        <span className="sr-only sm:not-sr-only">{t("nav.menu")}</span>
      </button>

      <dialog
        ref={dialeg}
        id={idFulla}
        aria-labelledby={idTitol}
        className="menu-fulla"
        onClose={() => setObert(false)}
        onKeyDown={alTeclat}
        onPointerDown={(e: PointerEvent<HTMLDialogElement>) => {
          comencaFora.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (comencaFora.current && e.target === e.currentTarget) tancar();
          comencaFora.current = false;
        }}
      >
        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center justify-between">
            <p
              id={idTitol}
              className="text-[13px] font-medium uppercase tracking-[0.14em] text-tinta-3"
            >
              {t("nav.menu")}
            </p>
            <button
              type="button"
              onClick={tancar}
              className="-mr-3 inline-flex min-h-[44px] items-center gap-2 rounded-[8px] px-3 text-[14px] font-medium text-tinta-2 transition-colors duration-200 hover:text-tinta"
            >
              {t("nav.close")}
              <Tancar className="text-[18px]" />
            </button>
          </div>

          <nav aria-label={t("nav.aria")} className="mt-1">
            <ul className="divide-y divide-linia-suau">
              {seccions.map((s) => (
                <li key={s.id}>
                  <a
                    href={"#" + s.id}
                    onClick={tancar}
                    aria-current={activa === s.id ? "true" : undefined}
                    className={`flex min-h-14 items-center text-[18px] font-medium transition-colors duration-200 ${
                      activa === s.id ? "text-accent-2" : "text-tinta hover:text-accent-2"
                    }`}
                  >
                    {t(s.clau)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 grid gap-3">
            <a href={CV_PDF} download={CV_NOM} onClick={tancar} className={PRIMARI}>
              {t("hero.cv")}
              <Baixa className="text-[18px]" />
            </a>
            <button type="button" onClick={sortir} className={SECUNDARI}>
              {t("sortir")}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
