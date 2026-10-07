// Una fila de lista con fecha: el curriculum (Curriculum.tsx) y la trayectoria (Trajectoria.tsx)
// la comparten. Con `hito` la fila es un punto de una linea de tiempo: lleva su nodo en el
// filete de la columna, que se enciende cuando la fila cruza la franja central de la pantalla,
// y su titulo pasa del gris al blanco. Sin `hito` es la fila de siempre.

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * La fila ya ha cruzado la franja central de la pantalla (o la ha pasado) y por tanto esta
 * "alcanzada": su borde de arriba esta por encima de la mitad de la ventana. Se mide con el
 * scroll y no con un IntersectionObserver sobre una franja fina, porque ese solo avisa cuando
 * la fila entra o sale de la franja, y un salto de pagina o un golpe de rueda fuerte la
 * cruzan sin pararse en ella: el nodo se quedaba apagado con la fila ya por encima.
 */
function useAlcanzada(ref: RefObject<HTMLElement | null>, siempre: boolean): boolean {
  const [alcanzada, setAlcanzada] = useState(siempre);
  useEffect(() => {
    const node = ref.current;
    if (siempre || !node) {
      setAlcanzada(true);
      return;
    }
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      setAlcanzada(node.getBoundingClientRect().top < window.innerHeight / 2);
    };
    const pedir = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [ref, siempre]);
  return alcanzada;
}

/** La fila esta en pantalla. Sirve para que el nodo de "en curso" solo lata mientras se ve. */
function useVisible(ref: RefObject<HTMLElement | null>, apagado: boolean): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (apagado || !node || !("IntersectionObserver" in window)) return;
    const vigilant = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    vigilant.observe(node);
    return () => vigilant.disconnect();
  }, [ref, apagado]);
  return visible;
}

export function Fila({
  quan,
  titol,
  lloc,
  etiqueta,
  tipus,
  punts,
  hito
}: {
  quan: string;
  titol: string;
  lloc?: ReactNode;
  etiqueta?: string;
  /** Matiz bajo la fecha: "Practicas", "Voluntariado". */
  tipus?: string;
  punts?: string[];
  /** Fila de una linea de tiempo. "curs" es la que sigue en marcha: su nodo late. */
  hito?: boolean | "curs";
}) {
  const quiet = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  // Con movimiento reducido todo esta ya alcanzado: filete entero y nodos llenos.
  const alcanzada = useAlcanzada(ref, !hito || !!quiet);
  const visible = useVisible(ref, hito !== "curs" || !!quiet);

  return (
    <li
      ref={ref}
      className={`grid gap-x-8 first:pt-0 last:pb-0 sm:grid-cols-[minmax(110px,150px)_minmax(0,1fr)] ${
        hito ? "gap-y-1 py-3 sm:gap-y-2 sm:py-6" : "gap-y-2 py-6"
      }`}
    >
      <div className="relative">
        {hito ? (
          <span
            aria-hidden
            data-on={alcanzada}
            data-curs={hito === "curs" ? "" : undefined}
            data-visible={visible}
            className="tray__node"
          />
        ) : null}
        {/* En el movil la fecha y el matiz van en una sola linea; con sitio, uno bajo el otro. */}
        <div className="flex items-baseline gap-2 sm:block">
          <p className="text-[14px] tabular-nums text-tinta-3">{quan}</p>
          {tipus ? (
            <p className="text-[13px] text-tinta-3 max-sm:before:mr-2 max-sm:before:content-['·'] sm:mt-0.5">
              {tipus}
            </p>
          ) : null}
        </div>
      </div>
      <div className="max-w-[68ch]">
        <h3
          className={`text-[17px] font-semibold leading-snug tracking-tight transition-colors duration-200 sm:text-[19px] ${
            alcanzada ? "text-tinta" : "text-tinta-3"
          }`}
        >
          {titol}
          {etiqueta ? (
            <span className="ml-3 inline-flex items-center gap-2 rounded-[8px] bg-accent-bg px-2.5 py-0.5 align-middle text-[13px] font-medium text-accent-2 cv-etiqueta">
              <span aria-hidden className="size-1.5 rounded-full bg-accent-2" />
              {etiqueta}
            </span>
          ) : null}
        </h3>
        {lloc ? <p className="mt-1 text-[15px] text-accent-2 cv-lloc">{lloc}</p> : null}
        {punts && punts.length ? (
          <ul className="mt-3 grid gap-1.5 text-[15px] leading-relaxed text-tinta-2">
            {punts.map((punt) => (
              <li key={punt} className="relative pl-4">
                <span aria-hidden className="absolute left-0 top-[0.7em] size-1 rounded-full bg-accent" />
                {punt}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
