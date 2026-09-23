// Las piezas que se mueven. Todas miran prefers-reduced-motion y, cuando esta puesto, se
// quedan quietas: no lentas, quietas. Nada usa WebGL ni una libreria de scroll aparte;
// la profundidad sale de perspective y transform, que no pesan nada.

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import type { MotionValue } from "framer-motion";

/** true solo si hay raton de verdad. En tactil no hay puntero al que reaccionar. */
export function useRaton(): boolean {
  const [hi, setHi] = useState(false);
  useEffect(() => {
    const consulta = window.matchMedia("(hover: hover) and (pointer: fine)");
    const mirar = () => setHi(consulta.matches);
    mirar();
    consulta.addEventListener("change", mirar);
    return () => consulta.removeEventListener("change", mirar);
  }, []);
  return hi;
}

/* ---------- Entrada escalonada ---------- */

export function Entrada({
  children,
  retard = 0,
  y = 24,
  className = ""
}: {
  children: ReactNode;
  retard?: number;
  y?: number;
  className?: string;
}) {
  const quiet = useReducedMotion();
  if (quiet) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.55, delay: retard, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Texto que se revela segun bajas ---------- */

function Troc({
  text,
  progres,
  inici,
  fi
}: {
  text: string;
  progres: MotionValue<number>;
  inici: number;
  fi: number;
}) {
  const opacity = useTransform(progres, [inici, fi], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} aria-hidden>
      {text}
    </motion.span>
  );
}

/**
 * Revela el texto pieza a pieza a medida que la seccion sube. Por letra en frases cortas
 * y por palabra en parrafos, que con mil spans el navegador se resiente.
 */
export function Revelat({
  text,
  com = "paraula",
  className = "",
  etiqueta: Etiqueta = "p"
}: {
  text: string;
  com?: "lletra" | "paraula";
  className?: string;
  etiqueta?: "p" | "h2" | "h3" | "span";
}) {
  const quiet = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start 0.9", "end 0.55"]
  });

  if (quiet) return <Etiqueta className={className}>{text}</Etiqueta>;

  const trossos =
    com === "lletra" ? Array.from(text) : text.split(" ").map((p, i, a) => (i < a.length - 1 ? p + " " : p));
  const total = trossos.length;

  return (
    <Etiqueta className={className}>
      <span ref={ref} aria-label={text} className="inline">
        {trossos.map((tros, i) => (
          <Troc
            key={i}
            text={tros}
            progres={scrollYProgress}
            inici={Math.max(0, i / total - 0.08)}
            fi={Math.min(1, i / total + 0.18)}
          />
        ))}
      </span>
    </Etiqueta>
  );
}

/* ---------- Efecto iman ---------- */

/** Sigue al raton con suavidad cuando el cursor se acerca, y vuelve despacio al salir. */
export function Iman({
  children,
  forca = 0.22,
  radi = 1.35,
  className = ""
}: {
  children: ReactNode;
  forca?: number;
  radi?: number;
  className?: string;
}) {
  const quiet = useReducedMotion();
  const ambRaton = useRaton();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const gir = useMotionValue(0);

  // Al acercarse el resorte es rapido; al soltar, el mismo resorte con poca rigidez hace
  // que vuelva despacio, que es justo lo que se pide.
  const sx = useSpring(x, { stiffness: 120, damping: 18, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 120, damping: 18, mass: 0.7 });
  const sgir = useSpring(gir, { stiffness: 90, damping: 20, mass: 0.8 });

  const viu = !quiet && ambRaton;

  useEffect(() => {
    if (!viu) return;
    const seguir = (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      const caixa = node.getBoundingClientRect();
      const cx = caixa.left + caixa.width / 2;
      const cy = caixa.top + caixa.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const abast = (Math.max(caixa.width, caixa.height) / 2) * radi;
      const dist = Math.hypot(dx, dy);

      if (dist > abast) {
        x.set(0);
        y.set(0);
        gir.set(0);
        return;
      }
      // Cuanto mas cerca del centro, mas tira. Al borde del radio no tira nada.
      const pes = 1 - dist / abast;
      x.set(dx * forca * pes);
      y.set(dy * forca * pes);
      gir.set((dx / abast) * 5 * pes);
    };

    const soltar = () => {
      x.set(0);
      y.set(0);
      gir.set(0);
    };

    window.addEventListener("pointermove", seguir, { passive: true });
    window.addEventListener("pointerleave", soltar);
    return () => {
      window.removeEventListener("pointermove", seguir);
      window.removeEventListener("pointerleave", soltar);
    };
  }, [viu, forca, radi, x, y, gir]);

  if (!viu) return <div className={className}>{children}</div>;

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div ref={ref} style={{ x: sx, y: sy, rotateY: sgir, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- Tira de palabras que se desplaza con el scroll ---------- */

const COPIES = 6;

export function Tira({
  paraules,
  sentit = 1,
  className = ""
}: {
  paraules: string[];
  sentit?: 1 | -1;
  className?: string;
}) {
  const quiet = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start end", "end start"]
  });
  const recorregut = 100 / COPIES * 2;   // dos copias de las seis
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    sentit > 0 ? ["0%", `-${recorregut}%`] : [`-${recorregut}%`, "0%"]
  );

  const files = [];
  for (let c = 0; c < COPIES; c++) {
    for (const paraula of paraules) {
      files.push(
        <span key={c + "-" + paraula} className="flex items-center">
          <span className="px-6 text-[clamp(1rem,2vw,1.5rem)] font-medium tracking-tight text-tinta-2">
            {paraula}
          </span>
          <span aria-hidden className="size-1 rounded-full bg-accent/50" />
        </span>
      );
    }
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`} aria-hidden>
      <motion.div className="tira" style={quiet ? undefined : { x }}>
        {files}
      </motion.div>
    </div>
  );
}

/* ---------- Tarjetas que se apilan y se encogen ----------
   El apilado necesita sitio por donde correr: la tarjeta se queda pegada arriba mientras
   la siguiente sube por encima. En pantallas estrechas una tarjeta puede ser mas alta que
   la ventana, y entonces quedaria medio pegada y medio no, asi que ahi se lee en fila
   normal. */

function useAmpla(minim: number): boolean {
  const [si, setSi] = useState(false);
  useEffect(() => {
    const consulta = window.matchMedia(`(min-width: ${minim}px)`);
    const mirar = () => setSi(consulta.matches);
    mirar();
    consulta.addEventListener("change", mirar);
    return () => consulta.removeEventListener("change", mirar);
  }, [minim]);
  return si;
}

export function Apilada({
  children,
  index,
  total
}: {
  children: ReactNode;
  index: number;
  total: number;
}) {
  const quiet = useReducedMotion();
  const ampla = useAmpla(1024);
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as RefObject<HTMLElement>,
    offset: ["start 0.14", "end 0.42"]
  });
  // Solo encoge. Bajarle la opacidad dejaria ver la tarjeta de debajo a traves de la de
  // arriba, que es justo lo contrario de lo que tiene que parecer una pila.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 4]);

  const apila = ampla && !quiet;
  const ultima = index === total - 1;

  // El sticky va en el propio elemento de la lista: su sitio por donde correr es el alto
  // de la lista entera, no el de una tarjeta sola.
  return (
    <li
      ref={ref}
      className={apila ? "sticky" : ""}
      style={apila ? { top: 88 + index * 20, zIndex: index + 1, perspective: 1400 } : undefined}
    >
      <motion.div
        style={apila && !ultima ? { scale, rotateX, transformOrigin: "center top" } : undefined}
      >
        {children}
      </motion.div>
    </li>
  );
}

/* ---------- Fondo: degradados radiales con un poco de deriva ---------- */

export function Fons() {
  const quiet = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={quiet ? undefined : { y: y1 }}
        className="absolute -left-[20vw] -top-[25vh] h-[75vh] w-[75vw] rounded-full opacity-70 blur-[90px]"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle_at_center,rgba(95,198,212,.16),transparent_68%)]" />
      </motion.div>
      <motion.div
        style={quiet ? undefined : { y: y2 }}
        className="absolute -right-[25vw] top-[35vh] h-[70vh] w-[70vw] rounded-full opacity-60 blur-[110px]"
      >
        <div className="size-full rounded-full bg-[radial-gradient(circle_at_center,rgba(52,132,158,.18),transparent_70%)]" />
      </motion.div>
      <div className="absolute bottom-0 left-[10vw] h-[55vh] w-[60vw] rounded-full opacity-50 blur-[120px]">
        <div className="size-full rounded-full bg-[radial-gradient(circle_at_center,rgba(150,118,78,.10),transparent_70%)]" />
      </div>
    </div>
  );
}

/* ---------- Puntero acompanado ----------
   No sustituye al cursor del sistema: el puntero de siempre sigue ahi y este anillo lo
   acompana con retardo. Fuera en tactil y con movimiento reducido. */

export function Anell() {
  const quiet = useReducedMotion();
  const ambRaton = useRaton();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.35 });
  const [aprop, setAprop] = useState(false);

  const viu = !quiet && ambRaton;

  useEffect(() => {
    if (!viu) return;
    const moure = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const sota = event.target as Element | null;
      setAprop(!!sota?.closest?.("a, button, input, [role='button']"));
    };
    window.addEventListener("pointermove", moure, { passive: true });
    return () => window.removeEventListener("pointermove", moure);
  }, [viu, x, y]);

  if (!viu) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] rounded-full border border-accent/60"
      style={{
        x: sx,
        y: sy,
        width: 28,
        height: 28,
        marginLeft: -14,
        marginTop: -14
      }}
      animate={{ scale: aprop ? 1.6 : 1, opacity: aprop ? 0.9 : 0.4 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    />
  );
}
