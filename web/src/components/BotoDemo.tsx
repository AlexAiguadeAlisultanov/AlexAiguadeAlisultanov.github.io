// El boton de una demo, con las cuatro fases de siempre: dormida, arrancando, lista y sin
// respuesta. Lo usan la tarjeta del carrusel y la tarjeta pequena de la portada, y como los
// dos leen el mismo estado (ProveidorProjectes), una demo que se despierta en una sale ya
// lista en la otra.
//
// Mientras la demo no conteste el boton la despierta y cuenta los segundos; cuando contesta,
// el mismo hueco pasa a ser el enlace que la abre. Nunca los dos a la vez.
//
// Dos tamanos, con las mismas fases y los mismos colores:
//   normal  el del carrusel de #projectes (48 px, ancho completo).
//   mini    el de la portada (40 px, 44 con el dedo).
// Borde cian para probar y arrancar, relleno cuando contesta y rojo apagado solo cuando no
// responde. Se leen igual salvo la fase de reposo: la normal dice "Probar la demo", que
// cabe, y la mini "Probar". Una demo que se despierta en una tarjeta sale ya lista en la otra.
//
// El avance de la espera no va en el boton: es una linea de 2 px en la base de la captura de la
// tarjeta (Portada.tsx y Projectes.tsx), que crece con los segundos segun progres() y se queda al
// 90 % hasta que la demo contesta. Con movimiento reducido no se pinta, y el punto que late del
// boton tampoco late.

import { useIdioma } from "../lib/idioma";
import { useDespertar, useEstatDemo } from "../lib/ProveidorProjectes";
import { Fletxa } from "./Icones";

// Base del boton principal de una tarjeta, en el cian de la web.
export const CTA =
  "relative inline-flex min-h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-[12px] px-5 " +
  "text-[15px] font-semibold transition-[background-color,border-color,transform] duration-200 " +
  "active:scale-[0.98] aria-[disabled=true]:cursor-default aria-[disabled=true]:active:scale-100";

const CTA_PLE = `${CTA} bg-accent text-sobre-accent hover:bg-accent-2 aria-[disabled=true]:hover:bg-accent`;
const CTA_VORA =
  `${CTA} border border-accent/50 text-accent-2 hover:border-accent hover:bg-accent-bg ` +
  "aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent";
const CTA_ERROR = `${CTA} border border-malament/50 text-malament hover:border-malament hover:bg-malament/10`;

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

/** Cuanto lleva de los 60 s que suele tardar, sin pasar del 90 % antes de que conteste. Lo usan las
 *  tarjetas para la linea de avance de su captura. */
export const progres = (segons: number) => Math.min(0.9, segons / 60);

type Props = {
  url: string;
  /** Nombre de la demo, para anunciar en voz alta que esta arrancando. */
  titol: string;
  mida?: "mini" | "normal";
  /** Id del texto que explica el estado, para lectores de pantalla. */
  descrit?: string;
};

export function BotoDemo({ url, titol, mida = "normal", descrit }: Props) {
  const { t } = useIdioma();
  const { demos, dorm, fase, enMarxa, segons } = useEstatDemo(url);
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
        {/* Una demo que no duerme nunca no ha tenido que despertar: no hay nada que "abrir". */}
        {t(mini || dorm ? "boto.open" : "card.try")}
        <Fletxa />
      </a>
    );
  }

  const arrencant = fase === "waking";
  const fallit = fase === "fail";

  const text = arrencant
    ? t("boto.waking", { s: segons })
    : fallit
      ? t("boto.fail")
      : t(mini ? "boto.try" : "card.try");

  return (
    <button
      type="button"
      aria-describedby={descrit}
      aria-disabled={arrencant}
      onClick={() => despertar(url, titol)}
      className={fallit ? (mini ? MINI_ERROR : CTA_ERROR) : mini ? MINI_VORA : CTA_VORA}
    >
      {arrencant ? <span aria-hidden className="pols" /> : null}
      {text}
    </button>
  );
}
