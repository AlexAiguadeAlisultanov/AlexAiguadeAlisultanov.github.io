// La captura de una demo dentro de su marco (el marco, con su alto y su recorte, lo pone quien la
// usa). La tarjeta de la portada y la del carrusel grande la pintan igual.
//
// No lleva loading="lazy" a proposito. Las capturas viven dentro de un carrusel que recorta
// (overflow: clip, o scroll horizontal en el movil) y el navegador solo cuenta una imagen como
// cercana a la pantalla cuando entra en ese recorte, de modo que con lazy no empezaba a bajar
// hasta estar a la vista: la tarjeta entraba vacia y la imagen aparecia de golpe. Son nueve
// imagenes de 10 a 45 kB, asi que se piden todas ya. Las que no se ven en el primer pantallazo
// van con prioridad baja, para que no compitan con el retrato ni con lo que si se ve, y cuando
// una termina de bajar se decodifica sin esperar a que le toque pintarse.

import { useIdioma } from "../lib/idioma";

/** Decodifica la imagen en cuanto esta bajada, fuera del hilo principal. */
function decodificar(img: HTMLImageElement | null) {
  if (!img) return;
  // decode() rechaza la promesa si la imagen falla; no es un error de la pagina.
  const fer = () => void img.decode().catch(() => {});
  if (img.complete && img.naturalWidth > 0) fer();
  else img.addEventListener("load", fer, { once: true });
}

type Props = {
  src: string;
  /** Nombre del proyecto, para el texto alternativo. */
  titol: string;
  /** Mas larga que el marco: al pasar el raton se recorre hacia abajo. */
  alta?: boolean;
  /** Se ve en el primer pantallazo o en cuanto empieza a moverse el carrusel. */
  prioritaria?: boolean;
};

export function Captura({ src, titol, alta = false, prioritaria = false }: Props) {
  const { t } = useIdioma();
  return (
    <img
      ref={decodificar}
      src={src}
      alt={t("card.shot", { t: titol })}
      loading="eager"
      decoding="async"
      fetchPriority={prioritaria ? "auto" : "low"}
      draggable={false}
      className={`captura ${alta ? "captura--alta" : "captura--plana"}`}
    />
  );
}
