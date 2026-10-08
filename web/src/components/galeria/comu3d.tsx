// Lo que comparten las dos galerias de verdad en 3D (WebGL, con react-three-fiber) SIN arrastrar
// three. Esto es importante: la portada y los proyectos importan de aqui `useCapaz` y `Limit` de
// forma normal, asi que este fichero no puede tocar three ni fiber. Si lo hiciera, el peso de
// three se colaria en el trozo del portafolio y se descargaria aunque nadie llegue a ver una
// galeria (en el movil, con movimiento reducido o sin WebGL). Las piezas que si usan three viven
// en piezas3d.tsx, que solo importan las galerias (que ya van en trozos aparte, lazy).

import { Component, useEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { capac } from "../Fons3D";

/** El cian de la web. Las dos galerias pintan sus particulas y sus acentos con el, nunca con
 *  el azul de la referencia original. */
export const CIAN = "#5FC6D4";
export const CIAN_CLAR = "#8CD9E4";

/**
 * Hay WebGL de verdad y el equipo puede con el (reutiliza capac(), el mismo juez que decide si la
 * portada lleva la escena del chip). No cambia mientras la pagina esta abierta, asi que se mide
 * una vez. Cada seccion lo combina con "escritorio y movimiento normal" para decidir si monta el
 * 3D o se queda con su respaldo.
 */
export function useCapaz(): boolean {
  const [capaz] = useState(() => {
    try {
      return capac();
    } catch {
      return false;
    }
  });
  return capaz;
}

/**
 * "always" solo cuando la seccion se ve y la pestana esta delante; el resto del tiempo "never",
 * que deja el lienzo quieto sin gastar GPU. Asi, con la portada arriba y los proyectos mas abajo,
 * nunca hay dos lienzos pintando al mismo tiempo.
 */
export function useBucle(ref: RefObject<HTMLElement | null>): "always" | "never" {
  const [dins, setDins] = useState(false);
  const [ocult, setOcult] = useState(() => document.hidden);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDins(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    const alCanviar = () => setOcult(document.hidden);
    document.addEventListener("visibilitychange", alCanviar);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", alCanviar);
    };
  }, [ref]);

  return dins && !ocult ? "always" : "never";
}

/**
 * Si el lienzo o un shader se caen (contexto perdido, WebGL que falla al montar), no se deja un
 * hueco: se cambia por el respaldo plano, que ya es usable. Es el mismo patron que la escena del
 * chip de la portada. No usa three, asi que puede vivir en el trozo del portafolio.
 */
export class Limit extends Component<
  { respaldo: ReactNode; avisar?: () => void; children: ReactNode },
  { trencat: boolean }
> {
  state = { trencat: false };

  static getDerivedStateFromError() {
    return { trencat: true };
  }

  componentDidCatch() {
    this.props.avisar?.();
  }

  render() {
    return this.state.trencat ? this.props.respaldo : this.props.children;
  }
}
