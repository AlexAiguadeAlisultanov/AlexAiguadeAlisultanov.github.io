// Carrusel de proyectos. Una cinta que avanza sola, despacio, y que se acelera un poco
// mientras la pagina baja. Se para cuando el raton se posa en una tarjeta, cuando un dedo
// la toca, cuando el foco del teclado entra o cuando se pulsa la pausa; se puede arrastrar
// y lanzar, y las flechas la mueven tarjeta a tarjeta.
//
// No hay copias de las tarjetas: cada una se recoloca con su propio transform al salir por
// un lado, asi que los botones de las demos existen una sola vez y su estado no se duplica.
// Si las tarjetas no llenan el ancho (o con movimiento reducido) la cinta no da la vuelta:
// pasa a ser una fila con scroll horizontal nativo y snap, quieta. Ahi, si el foco del teclado
// llega a una tarjeta que no se ve entera, se trae a la vista (el navegador no lo hace solo).
//
// Todo lo que se mueve va por transform y se escribe en el DOM desde un unico bucle, sin
// pasar por el estado de React.
//
// Tiene dos formas. La de siempre sangra hasta los bordes de la ventana (proyectos). La
// compacta (compacte) queda contenida en su columna, con piezas que son una columna de dos
// tarjetas verticales (es lo que pone la portada), sin entrada propia y con un hueco a la
// izquierda de los botones para una accion suya (la portada pone ahi "despertar todas"). En las
// dos la logica, las medidas y las garantias son las mismas: lo que cambia entre ellas vive en
// el CSS.
//
// Por que lado entran las piezas al avanzar sola la cinta lo decide `entra`. De siempre es por
// la izquierda (las piezas se desplazan hacia la derecha). Con entra="dreta" es al reves: las
// piezas llegan por la derecha y salen por la izquierda, como si se pulsara "siguiente" sin
// parar, y tras la primera viene la segunda. Solo cambia el signo de la velocidad de la
// cinta: el arrastre, el lanzamiento, la aceleracion con el scroll, los botones, las flechas
// y el foco no saben de ese sentido y valen igual en los dos.

import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent as PEvent, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import { Entrada } from "./Moviment";
import { Anterior, Pausa, Reproduir, Seguent } from "./Icones";

type Motiu = "usuari" | "ratoli" | "focus" | "dit" | "arrossega" | "boto";
type Amortit = { value: number; velocity: number };

/** Muelle criticamente amortiguado: llega al objetivo sin pasarse. */
function amortir(e: Amortit, objectiu: number, temps: number, dt: number) {
  const w = 2 / temps;
  const x = w * dt;
  const k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const dif = e.value - objectiu;
  const tmp = (e.velocity + w * dif) * dt;
  let nou = objectiu + (dif + tmp) * k;
  e.velocity = (e.velocity - w * tmp) * k;
  if (objectiu - e.value > 0 === nou > objectiu) {
    nou = objectiu;
    e.velocity = 0;
  }
  e.value = nou;
}

const mod = (a: number, b: number) => ((a % b) + b) % b;

const BOTO =
  "inline-flex size-11 items-center justify-center rounded-[12px] border border-linia bg-fons-2 text-[18px] " +
  "text-tinta-2 transition-colors duration-200 hover:border-accent/40 hover:text-tinta";

type Props = {
  children: ReactNode;
  /** Version contenida en una columna: sin sangrar a los bordes ni entrada propia. */
  compacte?: boolean;
  /** Fuerza el respaldo quieto (fila con scroll nativo y snap), igual que movimiento reducido. */
  quieta?: boolean;
  /** Nombre del carrusel para lectores de pantalla, si no vale "Carrusel de proyectos". */
  etiqueta?: string;
  /** Accion que comparte fila con los botones, a su izquierda. Solo en la version compacta. */
  acciones?: ReactNode;
  /**
   * Lado por el que entran las piezas cuando la cinta avanza sola. "esquerra" (el de siempre):
   * entran por la izquierda y salen por la derecha. "dreta": entran por la derecha y salen por
   * la izquierda, en el orden del documento.
   */
  entra?: "esquerra" | "dreta";
};

export function Carrusel({
  children,
  compacte = false,
  quieta = false,
  etiqueta,
  acciones,
  entra = "esquerra"
}: Props) {
  const { t } = useIdioma();
  const reduit = !!useReducedMotion();
  const quiet = reduit || quieta;
  // Signo de la velocidad de la cinta: positivo la desplaza hacia la derecha (las piezas entran
  // por la izquierda), negativo hacia la izquierda.
  const signe = entra === "dreta" ? -1 : 1;
  // Dos carruseles en la misma pagina no pueden compartir id: el de proyectos conserva el de
  // siempre y el compacto saca el suyo de useId.
  const idUnic = useId();
  const id = compacte ? "carrusel-" + idUnic.replace(/:/g, "") : "carrusel-projectes";
  const finestra = useRef<HTMLDivElement>(null);
  const cinta = useRef<HTMLUListElement>(null);
  const [roda, setRoda] = useState(false);
  const [aturat, setAturat] = useState(false);
  const peces = Children.toArray(children);

  // Estado del bucle. Vive en una ref porque cambia a cada fotograma.
  const m = useRef({
    pos: 0,
    vel: { value: 0, velocity: 0 } as Amortit,
    anim: null as null | { estat: Amortit; objectiu: number },
    impuls: 0,
    scrollAnt: 0,
    ant: 0,
    raf: 0,
    visible: true,
    motius: new Set<Motiu>(),
    R: [] as number[],
    pas: 0,
    tot: 0,
    V: 0,
    marge: 0,
    // Ancho de la cinta cuando se midio. Si ahora mide otra cosa, las medidas son viejas.
    ample: 0,
    // Donde esta el raton dentro de la ventana, para saber que tarjeta tiene debajo aunque
    // sea la cinta la que se mueve y no el raton.
    punter: null as null | { x: number; y: number },
    calenta: null as HTMLElement | null,
    tRevisa: 0,
    arr: null as null | { id: number; x0: number; y0: number; pos0: number; activa: boolean; tipus: string; mostres: { t: number; x: number }[] },
    nomesClic: false,
    tDit: 0,
    tBoto: 0
  });

  const items = () => Array.from(cinta.current?.children ?? []) as HTMLElement[];
  // Se rellena mas abajo, cuando ya existen motiu y marcarCalenta. El bucle la llama por aqui.
  const revisarRef = useRef(() => {});

  // Medidas: donde cae cada tarjeta sin transform, cuanto ocupa la vuelta entera y si
  // las tarjetas llenan el ancho como para dar la vuelta sin dejar un hueco.
  const mesurar = useCallback(() => {
    const s = m.current;
    const v = finestra.current;
    const c = cinta.current;
    const lis = items();
    if (!v || !c || lis.length === 0) return false;
    for (const li of lis) li.style.transform = "";
    const gap = parseFloat(getComputedStyle(c).columnGap) || 0;
    // Con decimales: los anchos salen de vw y offsetLeft los redondea, lo que dejaba los
    // huecos desiguales en uno o dos pixeles.
    const caixes = lis.map((li) => li.getBoundingClientRect());
    const primer = caixes[0].left;
    const darrer = caixes[caixes.length - 1];
    const pas = caixes.length > 1 ? caixes[1].left - primer : caixes[0].width + gap;
    const anterior = s.pas;
    s.R = caixes.map((caixa) => caixa.left - primer);
    s.pas = pas;
    s.tot = darrer.right + gap - primer;
    s.ample = c.getBoundingClientRect().width;
    s.V = v.clientWidth;
    s.marge = -parseFloat(getComputedStyle(v).marginLeft) || 0;
    if (anterior && anterior !== pas) s.pos *= pas / anterior;
    return s.tot >= s.V + s.pas;
  }, []);

  const pintar = useCallback(() => {
    const s = m.current;
    const lis = items();
    if (!s.tot || lis.length !== s.R.length) return;
    // Las tarjetas cambian de ancho con la ventana. Si la cinta ya no mide lo que medía, se
    // vuelve a medir antes de colocar nada: colocar con el paso viejo es lo que montaba una
    // tarjeta encima de otra justo al redimensionar.
    if (Math.abs(cinta.current!.getBoundingClientRect().width - s.ample) > 0.1) mesurar();
    // Quieta, se clava al pixel para que el texto no quede borroso.
    const quieta = !s.arr?.activa && !s.anim && Math.abs(s.vel.value) < 4;
    const dpr = window.devicePixelRatio || 1;
    for (let i = 0; i < lis.length; i++) {
      let x = mod(s.pos + s.R[i] + s.pas, s.tot) - s.pas;
      if (quieta) x = Math.round(x * dpr) / dpr;
      lis[i].style.transform = `translate3d(${(x - s.R[i]).toFixed(2)}px,0,0)`;
    }
  }, [mesurar]);

  const pas = useCallback(
    (ara: number) => {
      const s = m.current;
      s.raf = 0;
      const dt = s.ant ? Math.min(0.1, (ara - s.ant) / 1000) : 0;
      s.ant = ara;
      if (dt > 0) {
        // La cinta corre un poco mas mientras la pagina se desplaza.
        const y = window.scrollY;
        const objectiu = Math.min(60, (Math.abs(y - s.scrollAnt) / dt) * 0.05);
        s.scrollAnt = y;
        s.impuls += (objectiu - s.impuls) * (1 - Math.exp(-dt / (objectiu > s.impuls ? 0.15 : 0.8)));

        const parada = s.motius.size > 0;
        if (s.arr?.activa) {
          // La posicion la marca el dedo o el raton.
        } else if (s.anim) {
          amortir(s.anim.estat, s.anim.objectiu, 0.28, dt);
          s.pos = s.anim.estat.value;
          if (Math.abs(s.anim.objectiu - s.pos) < 0.1 && Math.abs(s.anim.estat.velocity) < 2) {
            s.pos = s.anim.objectiu;
            s.anim = null;
            s.tRevisa = 0;
          }
        } else {
          const base = Math.min(36, Math.max(21, s.V * 0.025));
          amortir(s.vel, parada ? 0 : signe * (base + s.impuls), parada ? 0.3 : 0.6, dt);
          s.pos += s.vel.value * dt;
        }
        pintar();
        // Si la cinta se ha movido debajo de un raton quieto, el resaltado pasa a la
        // tarjeta que ahora tiene debajo.
        if (s.punter && ara - s.tRevisa > 100) {
          s.tRevisa = ara;
          revisarRef.current();
        }
      }
      const segueix =
        s.visible &&
        !document.hidden &&
        (!!s.anim || !!s.arr?.activa || s.motius.size === 0 || Math.abs(s.vel.value) > 0.3 || Math.abs(s.vel.velocity) > 0.3);
      if (segueix) s.raf = requestAnimationFrame(pas);
      else {
        s.ant = 0;
        pintar();
      }
    },
    [pintar, signe]
  );

  const arrencar = useCallback(() => {
    const s = m.current;
    if (s.raf || !s.tot) return;
    s.ant = 0;
    s.scrollAnt = window.scrollY;
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

  // Decide el modo y lo vuelve a decidir si cambia el ancho o el numero de tarjetas.
  useEffect(() => {
    const v = finestra.current;
    const c = cinta.current;
    if (!v || !c) return;
    const s = m.current;
    const decidir = () => {
      const cap = mesurar();
      const vol = !quiet && cap;
      setRoda((ara) => {
        if (vol && !ara) s.pos = s.marge;
        return vol;
      });
      if (vol) {
        pintar();
        arrencar();
      } else {
        for (const li of items()) li.style.transform = "";
        s.tot = 0;
      }
    };
    decidir();
    // Se mira la ventana (cambia el ancho disponible) y la cinta (cambia el ancho de las
    // tarjetas o el hueco, por ejemplo con otro tamano de letra). Solo se decide de nuevo
    // si algo mide distinto de lo que se midio.
    let ample = v.clientWidth;
    const ro = new ResizeObserver(() => {
      const cintaAra = c.getBoundingClientRect().width;
      if (v.clientWidth !== ample || (s.tot > 0 && Math.abs(cintaAra - s.ample) > 0.1)) {
        ample = v.clientWidth;
        decidir();
      }
    });
    ro.observe(v);
    ro.observe(c);
    const mo = new MutationObserver(decidir);
    mo.observe(c, { childList: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [quiet, mesurar, pintar, arrencar, peces.length]);

  // Solo se anima cuando se ve y con la pestana delante.
  useEffect(() => {
    const v = finestra.current;
    if (!v || !roda) return;
    const s = m.current;
    v.scrollLeft = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = e.isIntersecting;
        arrencar();
      },
      { rootMargin: "8% 0px" }
    );
    io.observe(v);
    const visibilitat = () => arrencar();
    document.addEventListener("visibilitychange", visibilitat);
    const scroll = () => arrencar();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", visibilitat);
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      clearTimeout(s.tDit);
      clearTimeout(s.tBoto);
      for (const li of items()) li.style.transform = "";
    };
  }, [roda, arrencar]);

  useEffect(() => {
    motiu("usuari", aturat);
  }, [aturat, motiu]);

  /** Lleva una tarjeta concreta al margen izquierdo, por el camino mas corto. */
  const portar = useCallback(
    (desti: number) => {
      const s = m.current;
      s.anim = { estat: { value: s.pos, velocity: s.anim?.estat.velocity ?? s.vel.value }, objectiu: desti };
      s.vel.value = 0;
      s.vel.velocity = 0;
      arrencar();
    },
    [arrencar]
  );

  const anar = useCallback(
    (sentit: 1 | -1) => {
      const s = m.current;
      if (!roda) {
        const v = finestra.current;
        const li = items()[0];
        if (!v || !li) return;
        const gap = parseFloat(getComputedStyle(cinta.current!).columnGap) || 0;
        v.scrollBy({ left: sentit * (li.getBoundingClientRect().width + gap), behavior: quiet ? "auto" : "smooth" });
        return;
      }
      // "Siguiente" trae la tarjeta de la derecha: la cinta se corre hacia la izquierda.
      const actual = s.anim ? s.anim.objectiu : s.pos;
      const alineat = s.marge + Math.round((actual - s.marge) / s.pas) * s.pas;
      portar(alineat - sentit * s.pas);
      s.motius.add("boto");
      clearTimeout(s.tBoto);
      s.tBoto = window.setTimeout(() => motiu("boto", false), 4000);
    },
    [roda, quiet, portar, motiu]
  );

  /* ---------- Raton y dedo ---------- */

  const marcarCalenta = (li: HTMLElement | null) => {
    const c = cinta.current;
    const v = finestra.current;
    const s = m.current;
    if (!c || !v || li === s.calenta) return;
    s.calenta = li;
    // Las que no estan resaltadas encogen desde su centro. Si se quedaran con el origen de
    // cuando lo estuvieron, el borde que da a la resaltada no se apartaria y el hueco entre
    // las dos se quedaria casi en nada.
    for (const el of items()) {
      if (el === li) continue;
      delete el.dataset.calenta;
      el.style.removeProperty("--origen");
    }
    if (li) {
      const caixa = li.getBoundingClientRect();
      const marc = v.getBoundingClientRect();
      li.style.setProperty("--origen", caixa.left + caixa.width / 2 < marc.left + marc.width / 2 ? "0% 50%" : "100% 50%");
      li.dataset.calenta = "";
      c.dataset.calenta = "";
    } else delete c.dataset.calenta;
  };

  /** Resalta la tarjeta que hay bajo el raton ahora mismo, se haya movido el raton o la cinta. */
  useEffect(() => {
    revisarRef.current = () => {
      const s = m.current;
      if (!s.punter || s.arr?.activa) return;
      const el = document.elementFromPoint(s.punter.x, s.punter.y)?.closest(".carrusel__peca");
      const dins = el && cinta.current?.contains(el) ? (el as HTMLElement) : null;
      if (dins === s.calenta) return;
      marcarCalenta(dins);
      if (roda) motiu("ratoli", !!dins);
    };
  });

  const sobre = (e: PEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || m.current.arr?.activa) return;
    m.current.punter = { x: e.clientX, y: e.clientY };
    const li = (e.target as Element).closest(".carrusel__peca");
    const dins = li && cinta.current?.contains(li) ? (li as HTMLElement) : null;
    marcarCalenta(dins);
    if (roda) motiu("ratoli", !!dins);
  };

  const fora = (e: PEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    m.current.punter = null;
    marcarCalenta(null);
    if (roda) motiu("ratoli", false);
  };

  const baixa = (e: PEvent<HTMLDivElement>) => {
    if (!roda || !e.isPrimary || (e.pointerType === "mouse" && e.button !== 0)) return;
    const s = m.current;
    s.arr = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos0: s.pos, activa: false, tipus: e.pointerType, mostres: [] };
    if (e.pointerType !== "mouse") {
      clearTimeout(s.tDit);
      s.tDit = window.setTimeout(() => motiu("dit", true), 150);
    }
  };

  const mou = (e: PEvent<HTMLDivElement>) => {
    const s = m.current;
    if (e.pointerType === "mouse") s.punter = { x: e.clientX, y: e.clientY };
    const a = s.arr;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x0;
    const dy = e.clientY - a.y0;
    if (!a.activa) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      a.activa = true;
      a.pos0 = s.pos - dx;
      s.anim = null;
      finestra.current?.setPointerCapture(e.pointerId);
      cinta.current?.setAttribute("data-arrossega", "");
      marcarCalenta(null);
      motiu("arrossega", true);
    }
    s.pos = a.pos0 + dx;
    a.mostres.push({ t: e.timeStamp, x: e.clientX });
    if (a.mostres.length > 8) a.mostres.shift();
  };

  const puja = (e: PEvent<HTMLDivElement>) => {
    const s = m.current;
    const a = s.arr;
    if (!a || a.id !== e.pointerId) return;
    s.arr = null;
    if (a.activa) {
      // Se suelta con la velocidad que llevaba: la cinta sigue de largo y frena sola.
      const recents = a.mostres.filter((p) => e.timeStamp - p.t < 120);
      let v = 0;
      if (recents.length > 1) {
        const p0 = recents[0];
        const p1 = recents[recents.length - 1];
        v = ((p1.x - p0.x) / Math.max(1, p1.t - p0.t)) * 1000;
      }
      s.vel.value = Math.max(-2000, Math.min(2000, v));
      s.vel.velocity = 0;
      s.nomesClic = true;
      window.setTimeout(() => (s.nomesClic = false), 60);
      cinta.current?.removeAttribute("data-arrossega");
      clearTimeout(s.tDit);
      s.motius.delete("dit");
      s.tRevisa = 0;
      motiu("arrossega", false);
    } else if (a.tipus !== "mouse") {
      clearTimeout(s.tDit);
      s.tDit = window.setTimeout(() => motiu("dit", false), 450);
    }
  };

  /* ---------- Teclado ---------- */

  const tecla = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== finestra.current) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      anar(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      anar(-1);
    }
  };

  /**
   * Con la fila quieta (movimiento reducido o movil) el navegador da por visible un control al que
   * le asoma un trozo y no mueve la fila: el boton de una tarjeta de fuera se quedaba con un 6 %
   * a la vista, y el snap nativo tampoco lo corrige. Si la tarjeta del foco no se ve entera, se
   * trae. Solo en horizontal: el vertical lo resuelve el propio foco.
   */
  const portarQuieta = (el: HTMLElement) => {
    const v = finestra.current;
    const li = el.closest(".carrusel__peca");
    if (!v || !li) return;
    const marc = v.getBoundingClientRect();
    const caixa = li.getBoundingClientRect();
    if (caixa.left >= marc.left - 1 && caixa.right <= marc.right + 1) return;
    el.scrollIntoView({ inline: "center", block: "nearest", behavior: reduit ? "auto" : "smooth" });
  };

  const entraFocus = (e: FocusEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    if (el === finestra.current || !el.matches(":focus-visible")) return;
    if (!roda) {
      portarQuieta(el);
      return;
    }
    motiu("focus", true);
    const li = el.closest(".carrusel__peca");
    const s = m.current;
    const i = items().indexOf(li as HTMLElement);
    if (i < 0) return;
    // La ventana va con overflow: clip y no se puede desplazar. Si algun navegador la
    // moviera igualmente, ese desplazamiento se sumaria al del carrusel.
    if (finestra.current!.scrollLeft) finestra.current!.scrollLeft = 0;
    // Si la tarjeta con el foco no se ve entera, se trae al margen.
    const x = mod(s.pos + s.R[i] + s.pas, s.tot) - s.pas;
    const ample = (li as HTMLElement).getBoundingClientRect().width;
    if (x < s.marge || x + ample > s.V - s.marge) portar(s.pos + (s.marge - x));
  };

  const surtFocus = (e: FocusEvent<HTMLDivElement>) => {
    const cap = e.relatedTarget as Node | null;
    if (cap && finestra.current?.contains(cap)) return;
    motiu("focus", false);
  };

  const contingut = (
    <>
      <div className={compacte ? "carrusel__barra" : "mb-4 flex justify-end"}>
        {compacte ? <div className="min-w-0">{acciones}</div> : null}
        <div className="flex shrink-0 gap-2">
          <button type="button" className={BOTO} aria-label={t("car.prev")} aria-controls={id} onClick={() => anar(-1)}>
            <Anterior />
          </button>
          {roda ? (
            <button
              type="button"
              className={BOTO}
              aria-label={aturat ? t("car.play") : t("car.pause")}
              aria-controls={id}
              onClick={() => setAturat((a) => !a)}
            >
              {aturat ? <Reproduir className="text-[16px]" /> : <Pausa />}
            </button>
          ) : null}
          <button type="button" className={BOTO} aria-label={t("car.next")} aria-controls={id} onClick={() => anar(1)}>
            <Seguent />
          </button>
        </div>
      </div>

      <div
        ref={finestra}
        id={id}
        role="region"
        aria-label={etiqueta ?? t("car.aria")}
        tabIndex={0}
        className={`carrusel ${compacte ? "carrusel--compacte " : ""}${roda ? "carrusel--roda" : "carrusel--quiet"}`}
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
        onClickCapture={(e) => {
          if (m.current.nomesClic) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <ul ref={cinta} className="carrusel__cinta">
          {peces.map((peca, i) => (
            <li key={(peca as { key?: string }).key ?? i} className="carrusel__peca">
              <div className="carrusel__cos h-full">{peca}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  // La entrada mueve el carrusel entero, ventana incluida. Si moviera solo la cinta dentro
  // de una ventana que recorta, la parte de abajo de las tarjetas se cortaria al subir. La
  // compacta ya entra con la columna que la lleva.
  return compacte ? <div>{contingut}</div> : <Entrada>{contingut}</Entrada>;
}
