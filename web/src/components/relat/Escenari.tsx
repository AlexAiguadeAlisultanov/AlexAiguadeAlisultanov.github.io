// #escenari: la portada y la historia dentro de un mismo escenario.
//
// En modo pelicula su primer hijo es una pista del alto del escenario, fuera del flujo, y dentro
// va la capa fijada (sticky) del alto de la ventana, con la escena 3D y la sombra que respira.
// La capa se queda quieta bajo la cabecera mientras pasan por delante la portada y las tarjetas
// de la historia, y se suelta justo cuando acaba #historia. Debajo vuelve a asomar la placa del
// fondo, porque motor.tsx solo la borra detras de [data-tapa].
//
// La pista existe por una razon: con la capa en el flujo y un margen inferior negativo (para
// que no ocupara sitio), Chrome limita el sticky por la caja de margen, asi que la capa se
// salia 844 px por debajo del escenario y seguia fijada tapando el principio de Proyectos.
//
// Aqui se calculan los dos recorridos (q, la portada saliendo; p, la historia fijada) con un
// listener de scroll propio y no con useScroll: framer los actualiza en su propio fotograma,
// despues de que la escena haya leido el valor, y el chip iba un fotograma por detras del
// retrato. El evento de scroll llega antes que los requestAnimationFrame del mismo fotograma.
//
// En modo normal #escenari es un div sin mas: la portada lleva su propio fondo (Fons3D en modo
// portada) y la historia va en bloques. Que el div este en los dos modos evita que React vuelva
// a montar la portada al cambiar de uno a otro.

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Fons3D } from "../Fons3D";
import { usePelicula } from "./usePelicula";
import { CENTRO, CIERRE, SOMBRA, VIAJE, clamp01, opacidad, ventana } from "./tabla";

type Relat = {
  /** true con la capa fijada y la historia de 380svh. */
  pelicula: boolean;
  /** q: 0 con la portada arriba del todo, 1 cuando ya se ha ido bajo la cabecera. */
  sortida: MotionValue<number>;
  /** p: el recorrido de la historia mientras la capa esta fijada. */
  progres: MotionValue<number>;
  /** El retrato de la portada, del que sale el chip. */
  retrat: RefObject<HTMLImageElement | null>;
};

const RelatCtx = createContext<Relat | null>(null);

export function useRelat(): Relat {
  const valor = useContext(RelatCtx);
  if (!valor) throw new Error("useRelat fuera de <Escenari>");
  return valor;
}

/** Lo que se estaba leyendo al cambiar de modo, para devolverlo al mismo sitio. */
type Ancora = { node: Element; y: number; centre: boolean };

function ancoraActual(): Ancora | null {
  const mig = window.innerHeight / 2;
  // Con la portada en pantalla no hace falta nada: mide lo mismo en los dos modos.
  const dalt = document.getElementById("dalt");
  if (!dalt || dalt.getBoundingClientRect().bottom > mig) return null;
  let millor: Ancora | null = null;
  let distancia = Infinity;
  // Los bloques de la historia se miden por el centro, que es donde va la tarjeta en la
  // pelicula; las secciones de despues, por arriba.
  for (const node of document.querySelectorAll("[data-ancora], #projectes, #trayectoria, #contacte")) {
    const r = node.getBoundingClientRect();
    const centre = node.hasAttribute("data-ancora");
    const y = centre ? r.top + r.height / 2 : r.top;
    const d = r.top <= mig && r.bottom >= mig ? 0 : Math.min(Math.abs(r.top - mig), Math.abs(r.bottom - mig));
    if (d < distancia) {
      distancia = d;
      millor = { node, y, centre };
    }
  }
  return millor;
}

export function Escenari({ children }: { children: ReactNode }) {
  const sortida = useMotionValue(0);
  const progres = useMotionValue(0);
  const retrat = useRef<HTMLImageElement>(null);
  const ancora = useRef<Ancora | null>(null);

  const abans = useCallback(() => {
    ancora.current = ancoraActual();
  }, []);
  const { pelicula, fallar } = usePelicula(abans);

  // Despues de cambiar de modo, lo que se leia vuelve a quedar donde estaba.
  useLayoutEffect(() => {
    const a = ancora.current;
    ancora.current = null;
    if (!a || !a.node.isConnected) return;
    const r = a.node.getBoundingClientRect();
    const y = a.centre ? r.top + r.height / 2 : r.top;
    if (Math.abs(y - a.y) > 1) window.scrollBy({ top: y - a.y, behavior: "instant" });
  }, [pelicula]);

  // Los dos recorridos. Se mide al montar, al cambiar el tamano de la ventana o de la pagina, y
  // en cada scroll solo se divide.
  useLayoutEffect(() => {
    if (!pelicula) return;
    const dalt = document.getElementById("dalt");
    const historia = document.getElementById("historia");
    if (!dalt || !historia) return;

    let altPortada = 1;
    let iniciHistoria = 0;
    let recorregut = 1;

    const llegir = () => {
      const y = window.scrollY;
      sortida.set(clamp01(y / altPortada));
      progres.set(clamp01((y - iniciHistoria) / recorregut));
    };
    const mesurar = () => {
      altPortada = Math.max(1, dalt.offsetHeight);
      const r = historia.getBoundingClientRect();
      iniciHistoria = r.top + window.scrollY;
      recorregut = Math.max(1, r.height - window.innerHeight);
      llegir();
    };

    mesurar();
    const vigilant = new ResizeObserver(mesurar);
    vigilant.observe(document.body);
    vigilant.observe(dalt);
    vigilant.observe(historia);
    window.addEventListener("scroll", llegir, { passive: true });
    window.addEventListener("resize", mesurar);
    return () => {
      vigilant.disconnect();
      window.removeEventListener("scroll", llegir);
      window.removeEventListener("resize", mesurar);
    };
  }, [pelicula, sortida, progres]);

  // La sombra que respira: oscurece la columna de las tarjetas cuanto mas se ve la tarjeta mas
  // visible. Entra con el viaje del chip, para que arriba del todo la portada sea la de siempre.
  const ombra = useTransform([sortida, progres], ([q, p]: number[]) => {
    const tarjeta = Math.max(
      opacidad(p, CENTRO.hw),
      opacidad(p, CENTRO.sw),
      opacidad(p, CENTRO.seg),
      ventana(p, CIERRE[0], CIERRE[1])
    );
    return clamp01((SOMBRA.base + SOMBRA.extra * tarjeta) * ventana(q, VIAJE.desde, 1));
  });

  const valor = useMemo(() => ({ pelicula, sortida, progres, retrat }), [pelicula, sortida, progres]);

  return (
    <RelatCtx.Provider value={valor}>
      <div id="escenari" className={pelicula ? "escenari" : undefined} data-tapa={pelicula ? "tot" : undefined}>
        {pelicula ? (
          <div className="escenari__pista" aria-hidden>
            <div className="escenari__capa">
              <Fons3D modo="pelicula" ancla={retrat} sortida={sortida} progres={progres} onFalla={fallar} />
              <motion.div className="escenari__ombra" style={{ opacity: ombra }} />
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </RelatCtx.Provider>
  );
}
