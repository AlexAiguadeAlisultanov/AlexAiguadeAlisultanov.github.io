// Las piezas que se mueven: entrada escalonada, iman, fondo y anillo del puntero. Todas miran
// prefers-reduced-motion y, cuando esta puesto, se quedan quietas: no lentas, quietas. Nada usa
// WebGL ni una libreria de scroll aparte; la profundidad sale de perspective y transform, que
// no pesan nada.

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";

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

/** true en pantalla estrecha (movil). Ahi las demos de la portada son una fila con scroll nativo. */
export function useMovil(): boolean {
  const [si, setSi] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const consulta = window.matchMedia("(max-width: 767px)");
    const mirar = () => setSi(consulta.matches);
    mirar();
    consulta.addEventListener("change", mirar);
    return () => consulta.removeEventListener("change", mirar);
  }, []);
  return si;
}

/* ---------- Entrada escalonada ---------- */

export function Entrada({
  children,
  retard = 0,
  y = 24,
  duracio = 0.55,
  className = ""
}: {
  children: ReactNode;
  /** Segundos de espera antes de empezar. */
  retard?: number;
  /** Pixeles que sube al entrar. */
  y?: number;
  /** Segundos que dura la entrada. */
  duracio?: number;
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
      transition={{ duration: duracio, delay: retard, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
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
