// El rail de la pelicula: cuatro segmentos (Hardware, Software, Seguridad y Montado) que se
// llenan con el recorrido de la historia, y al lado la salida a los proyectos. Cada segmento
// es un boton que lleva al centro de su tarjeta; el del capitulo que se lee lleva
// aria-current="step". Solo existe en modo pelicula y solo se ve con la historia en pantalla.
//
// Va abajo a la derecha y no a la izquierda como pedia el plan: las tarjetas suben por la
// columna de la izquierda de abajo arriba, y un rail fijo en esa esquina se cruzaba con todas.
// A la derecha solo tiene debajo el chip, que es dibujo y no texto.

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useIdioma } from "../../lib/idioma";
import type { Clau } from "../../lib/idioma";
import { useRelat } from "./Escenari";
import { CENTRO, RAIL, clamp01 } from "./tabla";

// Donde cae cada boton: el centro de su tarjeta, y el cierre al final del recorrido.
const SEGMENTS: { clau: Clau; p: number }[] = [
  { clau: "rail.hw", p: CENTRO.hw },
  { clau: "rail.sw", p: CENTRO.sw },
  { clau: "rail.seg", p: CENTRO.seg },
  { clau: "rail.todo", p: 1 }
];

const actiu = (p: number) => {
  const i = RAIL.findIndex(([, fi]) => p < fi);
  return i < 0 ? RAIL.length - 1 : i;
};

function Segment({ i, progres, actual, anar }: { i: number; progres: MotionValue<number>; actual: boolean; anar: (p: number) => void }) {
  const { t } = useIdioma();
  const [desde, fins] = RAIL[i];
  const ple = useTransform(progres, (p) => clamp01((p - desde) / (fins - desde)));
  const nom = t(SEGMENTS[i].clau);
  return (
    <li>
      <button
        type="button"
        aria-label={nom}
        aria-current={actual ? "step" : undefined}
        onClick={() => anar(SEGMENTS[i].p)}
        className="rail__boto"
      >
        <span aria-hidden className="rail__pista">
          <motion.span className="rail__ple" style={{ scaleX: ple }} />
        </span>
        <span aria-hidden className="rail__nom">
          {nom}
        </span>
      </button>
    </li>
  );
}

export function Rail() {
  const { t } = useIdioma();
  const { progres } = useRelat();
  const [visible, setVisible] = useState(false);
  const [capitol, setCapitol] = useState(() => actiu(progres.get()));

  useMotionValueEvent(progres, "change", (p) => {
    const i = actiu(p);
    setCapitol((ara) => (ara === i ? ara : i));
  });

  // A la vista desde que la historia ocupa media ventana hasta que se acaba: entonces llegan
  // los proyectos y el rail se apaga en 200 ms.
  useEffect(() => {
    const historia = document.getElementById("historia");
    if (!historia) return;
    const mirar = () => {
      const r = historia.getBoundingClientRect();
      const ara = r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight - 1;
      setVisible((abans) => (abans === ara ? abans : ara));
    };
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    window.addEventListener("resize", mirar);
    return () => {
      window.removeEventListener("scroll", mirar);
      window.removeEventListener("resize", mirar);
    };
  }, []);

  /** Lleva la tarjeta de ese capitulo al centro de la ventana. */
  const anar = (p: number) => {
    const historia = document.getElementById("historia");
    if (!historia) return;
    const r = historia.getBoundingClientRect();
    const inici = r.top + window.scrollY;
    window.scrollTo({ top: inici + p * (r.height - window.innerHeight), behavior: "smooth" });
  };

  return (
    <nav aria-label={t("rail.aria")} className="rail" data-visible={visible} inert={!visible}>
      <ol className="rail__llista">
        {SEGMENTS.map((s, i) => (
          <Segment key={s.clau} i={i} progres={progres} actual={capitol === i} anar={anar} />
        ))}
      </ol>
      <a href="#projectes" className="rail__salt">
        {t("rail.skip")}
      </a>
    </nav>
  );
}
