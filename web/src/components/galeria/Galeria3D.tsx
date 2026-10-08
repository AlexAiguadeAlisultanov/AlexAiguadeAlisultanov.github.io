// Motor comun de las dos galerias 3D del portafolio. Las tarjetas siguen siendo DOM de
// verdad (su captura, titulo, chips, boton de la demo, enlaces): la profundidad sale solo de
// transforms de CSS (perspective, rotateY, translateZ, opacidad), nunca de WebGL. Por eso lo
// que cambia de una galeria a otra es la funcion `colocar`, que dice donde va cada tarjeta
// segun su distancia al frente; el resto (giro automatico, pausa al pasar el raton, arrastre
// y swipe, botones anterior/pausa/siguiente, flechas del teclado y Tab que trae la tarjeta
// enfocada al frente) es igual en las dos y vive aqui.
//
// Una sola posicion continua `pos`, en pasos (un paso es una tarjeta), que da la vuelta. Cada
// fotograma se recorre la lista y se escribe el transform de cada tarjeta a partir de su
// distancia corta al frente. Todo por transform y opacidad, en un solo bucle, sin pasar por el
// estado de React.
//
// No monta nada con movimiento reducido ni en movil: ahi cada seccion cae a su carrusel plano
// de siempre (Carrusel.tsx). Cuando no se ve o la pestana esta detras, el bucle se para.

import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent as PEvent, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../../lib/idioma";
import { Anterior, Pausa, Reproduir, Seguent } from "../Icones";

type Motiu = "usuari" | "ratoli" | "focus" | "arrossega" | "boto";

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Distancia mas corta de la tarjeta i al frente, en pasos, dentro de (-n/2, n/2]. */
export function deltaCurt(i: number, pos: number, n: number): number {
  let d = mod(i - pos, n);
  if (d > n / 2) d -= n;
  return d;
}

export type Lloc = {
  /** El transform completo de la tarjeta (ya centrada en el escenario). */
  transform: string;
  opacitat: number;
  /** Orden de apilado: las de delante, encima. */
  z: number;
  /** Si recibe raton. Las muy apagadas no, para no pulsar una tarjeta que no se ve. */
  actiu: boolean;
};

/** Donde va cada tarjeta segun su distancia al frente. La define cada galeria. */
export type Colocar = (d: number, ctx: { n: number; ample: number; escenari: number }) => Lloc;

const BOTO =
  "inline-flex size-11 items-center justify-center rounded-[12px] border border-linia bg-fons-2 text-[18px] " +
  "text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta";

type Props = {
  children: ReactNode;
  colocar: Colocar;
  /** px de perspectiva del escenario. */
  perspectiva: number;
  /** Giro automatico, en pasos por segundo. */
  autoPasos?: number;
  /** Sentido del giro automatico. */
  sentido?: 1 | -1;
  /** Alto del escenario a partir del alto mayor de las tarjetas. */
  alturaEscenari: (altMax: number) => number;
  /** Clase del escenario (gal3d--anell o gal3d--escaparata). */
  variant: string;
  etiqueta?: string;
  /** Accion a la izquierda de los botones (la portada pone "despertar todas"). */
  acciones?: ReactNode;
  /** La barra de botones encima del escenario en vez de debajo. */
  barraDalt?: boolean;
};

export function Galeria3D({
  children,
  colocar,
  perspectiva,
  autoPasos = 0.16,
  sentido = 1,
  alturaEscenari,
  variant,
  etiqueta,
  acciones,
  barraDalt = false
}: Props) {
  const { t } = useIdioma();
  const quiet = !!useReducedMotion();
  const idUnic = useId().replace(/:/g, "");
  const id = "gal3d-" + idUnic;
  const escenari = useRef<HTMLDivElement>(null);
  const cinta = useRef<HTMLUListElement>(null);
  const [aturat, setAturat] = useState(false);
  const peces = Children.toArray(children);
  const n = peces.length;

  const m = useRef({
    pos: 0,
    vel: 0, // pasos por segundo del lanzamiento, decae solo
    auto: 0, // velocidad automatica suavizada
    anim: null as null | { desde: number; fins: number; t: number; dur: number },
    raf: 0,
    ant: 0,
    visible: true,
    motius: new Set<Motiu>(),
    ample: 0, // ancho de una tarjeta
    escenariAmple: 0,
    arr: null as null | { id: number; x0: number; pos0: number; activa: boolean; tipus: string; mostres: { t: number; x: number }[] },
    nomesClic: false,
    tBoto: 0
  });

  const items = () => Array.from(cinta.current?.children ?? []) as HTMLElement[];

  // px de arrastre que valen un paso (una tarjeta): ni muy sensible ni muy duro.
  const pasPx = (s: { ample: number; escenariAmple: number }) =>
    Math.max(160, Math.min(s.ample || 320, (s.escenariAmple || 640) * 0.5));

  const mesurar = useCallback(() => {
    const s = m.current;
    const esc = escenari.current;
    const lis = items();
    if (!esc || lis.length === 0) return;
    s.escenariAmple = esc.clientWidth;
    s.ample = lis[0].offsetWidth;
    let altMax = 0;
    for (const li of lis) altMax = Math.max(altMax, li.offsetHeight);
    esc.style.height = alturaEscenari(altMax) + "px";
  }, [alturaEscenari]);

  const pintar = useCallback(() => {
    const s = m.current;
    const lis = items();
    if (!s.ample || lis.length !== n) return;
    for (let i = 0; i < lis.length; i++) {
      const d = deltaCurt(i, s.pos, n);
      const lloc = colocar(d, { n, ample: s.ample, escenari: s.escenariAmple });
      const li = lis[i];
      li.style.transform = lloc.transform;
      li.style.opacity = lloc.opacitat.toFixed(3);
      li.style.zIndex = String(lloc.z);
      // Solo se toca cuando cambia: evita escribir el mismo valor cada fotograma y, con el, que
      // una tarjeta a medias atrape el raton. Nada de desenfoque por fotograma (da tirones).
      const actiu = lloc.actiu ? "1" : "0";
      if (li.dataset.actiu !== actiu) {
        li.dataset.actiu = actiu;
        li.style.pointerEvents = lloc.actiu ? "" : "none";
      }
    }
  }, [colocar, n]);

  const pas = useCallback(
    (ara: number) => {
      const s = m.current;
      s.raf = 0;
      const dt = s.ant ? Math.min(0.05, (ara - s.ant) / 1000) : 0;
      s.ant = ara;
      if (dt > 0) {
        const parat = s.motius.size > 0;
        if (s.arr?.activa) {
          // La posicion la lleva el dedo o el raton.
        } else if (s.anim) {
          s.anim.t += dt;
          const u = Math.min(1, s.anim.t / s.anim.dur);
          // ease-out suave (la misma curva que el resto de la web).
          const e = 1 - Math.pow(1 - u, 3);
          s.pos = s.anim.desde + (s.anim.fins - s.anim.desde) * e;
          if (u >= 1) {
            s.pos = s.anim.fins;
            s.anim = null;
          }
        } else {
          // Giro automatico suavizado mas el remate del lanzamiento, que decae solo.
          const objectiu = parat ? 0 : sentido * autoPasos;
          s.auto += (objectiu - s.auto) * (1 - Math.exp(-dt / 0.5));
          s.vel *= Math.exp(-dt / 0.6);
          if (Math.abs(s.vel) < 0.002) s.vel = 0;
          s.pos += (s.auto + s.vel) * dt;
        }
        s.pos = mod(s.pos, n);
        pintar();
      }
      const segueix =
        s.visible &&
        !document.hidden &&
        (!!s.anim || !!s.arr?.activa || s.motius.size === 0 || Math.abs(s.vel) > 0.002 || Math.abs(s.auto) > 0.002);
      if (segueix) s.raf = requestAnimationFrame(pas);
      else {
        s.ant = 0;
        s.auto = 0;
      }
    },
    [autoPasos, n, pintar, sentido]
  );

  const arrencar = useCallback(() => {
    const s = m.current;
    if (s.raf) return;
    s.ant = 0;
    s.raf = requestAnimationFrame(pas);
  }, [pas]);

  const motiu = useCallback(
    (quin: Motiu, si: boolean) => {
      const s = m.current;
      if (si) s.motius.add(quin);
      else s.motius.delete(quin);
      arrencar();
    },
    [arrencar]
  );

  /** Lleva el frente a un objetivo (el entero mas cercano que corresponde a esa tarjeta). */
  const portar = useCallback(
    (fins: number, dur = 0.5) => {
      const s = m.current;
      s.vel = 0;
      s.anim = { desde: s.pos, fins, t: 0, dur };
      arrencar();
    },
    [arrencar]
  );

  const anar = useCallback(
    (sentit: 1 | -1) => {
      const s = m.current;
      const actual = s.anim ? s.anim.fins : s.pos;
      portar(Math.round(actual) + sentit);
      s.motius.add("boto");
      clearTimeout(s.tBoto);
      s.tBoto = window.setTimeout(() => motiu("boto", false), 2600);
    },
    [motiu, portar]
  );

  /** Trae al frente la tarjeta i por el camino mas corto, respetando la vuelta. */
  const alFront = useCallback(
    (i: number) => {
      const s = m.current;
      const base = s.anim ? s.anim.fins : s.pos;
      portar(base + deltaCurt(i, base, n));
    },
    [n, portar]
  );

  useEffect(() => {
    if (quiet) return;
    mesurar();
    pintar();
    arrencar();
    const esc = escenari.current;
    const c = cinta.current;
    if (!esc || !c) return;
    let ample = esc.clientWidth;
    const ro = new ResizeObserver(() => {
      if (esc.clientWidth !== ample || Math.abs((items()[0]?.offsetWidth ?? 0) - m.current.ample) > 0.5) {
        ample = esc.clientWidth;
        mesurar();
        pintar();
      }
    });
    ro.observe(esc);
    ro.observe(c);
    const io = new IntersectionObserver(
      ([e]) => {
        m.current.visible = e.isIntersecting;
        arrencar();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(esc);
    const visibilitat = () => arrencar();
    document.addEventListener("visibilitychange", visibilitat);
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", visibilitat);
      cancelAnimationFrame(m.current.raf);
      m.current.raf = 0;
      clearTimeout(m.current.tBoto);
    };
  }, [quiet, mesurar, pintar, arrencar, n]);

  useEffect(() => {
    motiu("usuari", aturat);
  }, [aturat, motiu]);

  /* ---------- Raton y dedo ---------- */

  const sobre = (e: PEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || m.current.arr?.activa) return;
    motiu("ratoli", true);
  };
  const fora = (e: PEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    motiu("ratoli", false);
  };

  const baixa = (e: PEvent<HTMLDivElement>) => {
    if (!e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    const s = m.current;
    s.arr = { id: e.pointerId, x0: e.clientX, pos0: s.pos, activa: false, tipus: e.pointerType, mostres: [] };
  };

  const mou = (e: PEvent<HTMLDivElement>) => {
    const s = m.current;
    const a = s.arr;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x0;
    if (!a.activa) {
      if (Math.abs(dx) < 8) return;
      a.activa = true;
      a.pos0 = s.pos + dx / pasPx(s);
      s.anim = null;
      escenari.current?.setPointerCapture(e.pointerId);
      cinta.current?.setAttribute("data-arrossega", "");
      motiu("arrossega", true);
    }
    // Arrastrar a la derecha trae la tarjeta de la izquierda: el frente retrocede.
    s.pos = a.pos0 - dx / pasPx(s);
    a.mostres.push({ t: e.timeStamp, x: e.clientX });
    if (a.mostres.length > 6) a.mostres.shift();
  };

  const puja = (e: PEvent<HTMLDivElement>) => {
    const s = m.current;
    const a = s.arr;
    if (!a || a.id !== e.pointerId) return;
    s.arr = null;
    if (a.activa) {
      const recents = a.mostres.filter((p) => e.timeStamp - p.t < 120);
      let v = 0;
      if (recents.length > 1) {
        const p0 = recents[0];
        const p1 = recents[recents.length - 1];
        v = ((p1.x - p0.x) / Math.max(1, p1.t - p0.t)) * 1000; // px/s
      }
      s.vel = Math.max(-6, Math.min(6, -v / pasPx(s)));
      s.nomesClic = true;
      window.setTimeout(() => (s.nomesClic = false), 60);
      cinta.current?.removeAttribute("data-arrossega");
      // Al soltar, se asienta en la tarjeta mas cercana si no venia con impulso.
      if (Math.abs(s.vel) < 0.4) portar(Math.round(s.pos));
      motiu("arrossega", false);
    }
  };

  /** Pulsar una tarjeta que no es la de delante la trae al frente (si no se pulso un enlace). */
  const clic = (e: PEvent<HTMLDivElement>) => {
    const s = m.current;
    if (s.nomesClic) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const li = (e.target as Element).closest(".gal3d__peca") as HTMLElement | null;
    if (!li || (e.target as Element).closest("a, button")) return;
    const i = items().indexOf(li);
    if (i < 0) return;
    if (Math.abs(deltaCurt(i, s.pos, n)) > 0.1) {
      e.preventDefault();
      alFront(i);
    }
  };

  /* ---------- Teclado y foco ---------- */

  const tecla = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== escenari.current) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      anar(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      anar(-1);
    }
  };

  const entraFocus = (e: FocusEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    if (el === escenari.current || !el.matches(":focus-visible")) return;
    const li = el.closest(".gal3d__peca");
    const i = items().indexOf(li as HTMLElement);
    if (i < 0) return;
    motiu("focus", true);
    alFront(i);
  };
  const surtFocus = (e: FocusEvent<HTMLDivElement>) => {
    const cap = e.relatedTarget as Node | null;
    if (cap && escenari.current?.contains(cap)) return;
    motiu("focus", false);
  };

  const botons = (
    <div className={`flex shrink-0 gap-2 ${barraDalt ? "" : "mt-6 justify-center"}`}>
      <button type="button" className={BOTO} aria-label={t("car.prev")} aria-controls={id} onClick={() => anar(-1)}>
        <Anterior />
      </button>
      <button
        type="button"
        className={BOTO}
        aria-label={aturat ? t("car.play") : t("car.pause")}
        aria-controls={id}
        onClick={() => setAturat((a) => !a)}
      >
        {aturat ? <Reproduir className="text-[16px]" /> : <Pausa />}
      </button>
      <button type="button" className={BOTO} aria-label={t("car.next")} aria-controls={id} onClick={() => anar(1)}>
        <Seguent />
      </button>
    </div>
  );

  return (
    <div className={`gal3d ${variant}`}>
      {barraDalt ? (
        <div className="gal3d__barra">
          <div className="min-w-0">{acciones}</div>
          {botons}
        </div>
      ) : null}

      <div
        ref={escenari}
        id={id}
        role="region"
        aria-roledescription="carrusel"
        aria-label={etiqueta ?? t("car.aria")}
        tabIndex={0}
        className="gal3d__escenari"
        style={{ perspective: perspectiva + "px" }}
        onKeyDown={tecla}
        onFocus={entraFocus}
        onBlur={surtFocus}
        onPointerOver={sobre}
        onPointerLeave={fora}
        onPointerDown={baixa}
        onPointerMove={mou}
        onPointerUp={puja}
        onPointerCancel={puja}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={clic}
      >
        <ul ref={cinta} className="gal3d__cinta">
          {peces.map((peca, i) => (
            <li key={(peca as { key?: string }).key ?? i} className="gal3d__peca">
              {peca}
            </li>
          ))}
        </ul>
      </div>

      {barraDalt ? null : botons}
    </div>
  );
}
