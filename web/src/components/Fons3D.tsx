// Decide si la portada lleva la escena 3D o el fondo estatico, y carga three solo si toca.
//
// El fondo estatico esta siempre puesto, debajo. La escena se monta encima cuando el
// equipo da la talla, y si algo falla (no hay WebGL, se pierde el contexto, el modulo no
// llega) basta con quitarla: lo que queda debajo ya es un fondo acabado, no un hueco.
//
// Por que en el movil no se carga: la portada ocupa casi la pantalla entera, asi que el
// lienzo seria del tamano de la ventana pintando sin parar mientras se lee. Eso en un
// telefono se nota en la bateria y en la temperatura, y ademas la mitad de la escena es la
// reaccion al puntero, que en una pantalla tactil no existe. Ahi el fondo estatico dice lo
// mismo y no cuesta nada.
//
// Dos modos. "portada" es el de siempre: el fondo vive dentro de #dalt. "pelicula" lo monta
// relat/Escenari.tsx en su capa fijada y le pasa el retrato y los dos recorridos de scroll;
// si la escena falla ahi, se avisa hacia arriba (onFalla) para volver al modo normal.

import { Component, Suspense, lazy, useCallback, useEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import type { MotionValue } from "framer-motion";

const Escena = lazy(() => import("./Escena"));

/** Fondo de siempre: rejilla en fuga y un halo del acento. Puro CSS, coste cero. */
function Estatic() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(95,198,212,.10) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(95,198,212,.07) 1px, transparent 1px)",
          backgroundSize: "clamp(56px, 7vw, 104px) clamp(56px, 7vw, 104px)",
          maskImage:
            "radial-gradient(ellipse 66% 78% at 50% 46%, #000 6%, rgba(0,0,0,.45) 46%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 66% 78% at 50% 46%, #000 6%, rgba(0,0,0,.45) 46%, transparent 82%)"
        }}
      />
      <div
        className="absolute left-1/2 top-[45%] h-[52vh] w-[52vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(95,198,212,.14), transparent 68%)"
        }}
      />
    </div>
  );
}

/** Se prueba una vez por visita: la grafica no cambia mientras la pagina esta abierta. */
let webgl: boolean | undefined;

function teWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  try {
    const prova = document.createElement("canvas");
    const gl = (prova.getContext("webgl2") ||
      prova.getContext("webgl")) as WebGLRenderingContext | null;
    // El contexto de prueba se cierra: no hace falta gastar uno de los pocos que hay.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    webgl = !!gl;
  } catch {
    webgl = false;
  }
  return webgl;
}

/** Hay WebGL de verdad y el equipo tiene con que moverlo. Lo usa tambien la pelicula. */
export function capac(): boolean {
  try {
    if (window.innerWidth < 768) return false;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;

    const nuclis = navigator.hardwareConcurrency || 4;
    const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (nuclis < 4) return false;
    if (typeof memoria === "number" && memoria < 4) return false;

    return teWebGL();
  } catch {
    return false;
  }
}

/** Si el modulo de la escena no llega a descargarse, la portada sigue con su fondo. */
class Xarxa extends Component<{ children: ReactNode; avisar: () => void }, { trencat: boolean }> {
  state = { trencat: false };

  static getDerivedStateFromError() {
    return { trencat: true };
  }

  componentDidCatch() {
    this.props.avisar();
  }

  render() {
    return this.state.trencat ? null : this.props.children;
  }
}

type Props = {
  modo?: "portada" | "pelicula";
  /** Pelicula: el retrato del que sale el chip. */
  ancla?: RefObject<HTMLElement | null>;
  /** Pelicula: q, la portada saliendo. */
  sortida?: MotionValue<number>;
  /** Pelicula: p, el recorrido de la historia. */
  progres?: MotionValue<number>;
  /** Se llama si la escena falla, despues de quitarla. */
  onFalla?: () => void;
};

export function Fons3D({ modo = "portada", ancla, sortida, progres, onFalla }: Props) {
  const [amb3D, setAmb3D] = useState(false);
  const fallar = useCallback(() => {
    setAmb3D(false);
    onFalla?.();
  }, [onFalla]);

  useEffect(() => {
    if (capac()) setAmb3D(true);
  }, []);

  const pelicula = modo === "pelicula" ? { ancla, sortida, progres } : null;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Estatic />
      {amb3D ? (
        <div className="absolute inset-0">
          <Xarxa avisar={fallar}>
            <Suspense fallback={null}>
              <Escena onFalla={fallar} {...pelicula} />
            </Suspense>
          </Xarxa>
        </div>
      ) : null}
    </div>
  );
}
