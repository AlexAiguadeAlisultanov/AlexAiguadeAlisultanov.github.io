// El boton de una demo, con las cuatro fases de siempre: dormida, arrancando, lista y sin
// respuesta. Lo usan la tarjeta del carrusel y la tarjeta pequena de la portada, y como los
// dos leen el mismo estado (ProveidorProjectes), una demo que se despierta en una sale ya
// lista en la otra.
//
// Mientras la demo no conteste el boton la despierta y cuenta los segundos; cuando contesta,
// el mismo hueco pasa a ser el enlace que la abre. Nunca los dos a la vez.
//
// Dos tamanos:
//   normal  el del carrusel (48 px, ancho completo). Conserva el aspecto y los textos de
//           siempre: relleno de cian en todas las fases. Cuando la tarjeta pierda su
//           pastilla y su nota (paso 7 del plan), pasa a verse y a leerse como mini.
//   mini    el de la portada (40 px, 44 con el dedo). Borde cian para probar y arrancar,
//           relleno cuando contesta y rojo apagado solo cuando no responde.
//
// La barra de progreso (opcional) es una linea de 2 px en el borde de abajo del boton que
// avanza con los segundos y se queda al 90 % hasta que la demo contesta. Con movimiento
// reducido no se pinta, y el punto que late tampoco late.

import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import { useDespertar, useEstatDemo } from "../lib/ProveidorProjectes";
import { Fletxa } from "./Icones";

// Base del boton principal de una tarjeta, en el cian de la web.
export const CTA =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] px-5 " +
  "text-[15px] font-semibold transition-[background-color,border-color,transform] duration-200 " +
  "active:scale-[0.98] aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-70 " +
  "aria-[disabled=true]:active:scale-100";

const CTA_PLE = `${CTA} bg-accent text-sobre-accent hover:bg-accent-2 aria-[disabled=true]:hover:bg-accent`;

const MINI =
  "relative inline-flex min-h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-[12px] px-3 " +
  "text-[14px] font-semibold transition-[background-color,border-color,color,transform] duration-200 " +
  "active:scale-[0.98] pointer-coarse:min-h-11 aria-[disabled=true]:cursor-default " +
  "aria-[disabled=true]:active:scale-100";

const MINI_PLE = `${MINI} bg-accent text-sobre-accent hover:bg-accent-2`;
const MINI_VORA =
  `${MINI} border border-accent/50 text-accent-2 hover:border-accent hover:bg-accent-bg ` +
  "aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent";
const MINI_ERROR = `${MINI} border border-malament/50 text-malament hover:border-malament hover:bg-malament/10`;

/** Cuanto lleva de los 60 s que suele tardar, sin pasar del 90 % antes de que conteste. */
const progres = (segons: number) => Math.min(0.9, segons / 60);

type Props = {
  url: string;
  /** Nombre de la demo, para anunciar en voz alta que esta arrancando. */
  titol: string;
  mida?: "mini" | "normal";
  barra?: boolean;
  /** Id del texto que explica el estado, para lectores de pantalla. */
  descrit?: string;
};

export function BotoDemo({ url, titol, mida = "normal", barra = false, descrit }: Props) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { demos, fase, enMarxa, segons } = useEstatDemo(url);
  const despertar = useDespertar();
  const mini = mida === "mini";

  if (enMarxa) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener"
        onClick={() => demos.visita(url)}
        className={mini ? MINI_PLE : CTA_PLE}
      >
        {t(mini ? "boto.open" : "card.try")}
        <Fletxa />
      </a>
    );
  }

  const arrencant = fase === "waking";
  const fallit = fase === "fail";

  let text: string;
  if (mini) {
    text = arrencant ? t("boto.waking", { s: segons }) : fallit ? t("boto.fail") : t("boto.try");
  } else {
    text = arrencant ? t("card.waking", { s: segons }) : fallit ? t("estat.again") : t("card.try");
  }

  return (
    <button
      type="button"
      aria-describedby={descrit}
      aria-disabled={arrencant}
      onClick={() => despertar(url, titol)}
      className={!mini ? CTA_PLE : fallit ? MINI_ERROR : MINI_VORA}
    >
      {mini && arrencant ? <span aria-hidden className="pols" /> : null}
      {text}
      {barra && arrencant && !quiet ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${progres(segons)})` }}
        />
      ) : null}
    </button>
  );
}
