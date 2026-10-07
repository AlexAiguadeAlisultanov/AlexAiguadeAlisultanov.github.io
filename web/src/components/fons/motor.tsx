// Motor del fondo animado. Se ocupa de todo lo que no es la figura: el lienzo a
// pantalla completa, la densidad de pixeles, el redimensionado, la pausa con la pestana
// oculta, el movimiento reducido, el tactil, la linterna que sigue al cursor y el corte
// bajo la portada. La figura (placa.ts) solo pinta lo suyo, asi que cambiarla por otra
// es escribir otro fichero con el mismo contrato y pasarselo a <FonsCanvas />.
//
// Como se dibuja cada fotograma:
//   1. la figura en reposo, pre-renderizada una vez (casi invisible);
//   2. la linterna: un circulo de la misma figura pintada encendida, recortado alrededor
//      del cursor y fundido por los bordes;
//   3. lo que se mueve (la corriente, los chips encendidos), que pinta la figura;
//   4. el borrado de la zona de la portada, que ya tiene su escena 3D.
//
// Cuando nada se mueve, el bucle se duerme hasta el siguiente evento ambiente.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useRaton } from "../Moviment";

/* ---------- Ajustes comunes ---------- */

export const COLOR = "95, 198, 212";  // rgb del acento del portfolio
const SEGUIMIENTO_FOCO = 12;           // rapidez con la que la linterna alcanza al cursor
const FPS_MOVIL = 30;                  // tope de fotogramas fuera de escritorio
const FUNDIDO_PORTADA = 160;           // px del degradado con el que el fondo asoma bajo la portada

export const rgba = (alfa: number) => `rgba(${COLOR}, ${alfa})`;
export const MONO = '"Cascadia Code", ui-monospace, "SF Mono", Consolas, monospace';

/* ---------- Contrato de una figura ---------- */

export type Cursor = { x: number; y: number; dentro: boolean; luz: number };
export type Entorno = { ample: number; alt: number; movil: boolean };

export interface Figura {
  /** Linterna: radio en px e intensidad de 0 a 1. */
  foco: { radio: number; intensidad: number };
  /** Cada cuantos ms (minimo, maximo) ocurre algo solo, sin tocar nada. */
  ambiente: [number, number];
  /** Pinta la figura quieta dos veces: apagada y encendida. Puede guardar los contextos
   *  para retocarlos despues. */
  pintar(base: CanvasRenderingContext2D, encendida: CanvasRenderingContext2D): void;
  /** Avanza lo que se mueve. Devuelve si queda algo vivo. */
  avanzar(dt: number, ahora: number): boolean;
  /** Dibuja lo que se mueve, encima de la figura y de la linterna. */
  dibujar(ctx: CanvasRenderingContext2D, ahora: number, cursor: Cursor): void;
  /** El cursor (o el dedo arrastrando) se ha movido `paso` px. */
  mover(x: number, y: number, paso: number): void;
  /** Clic o toque. */
  pulsar(x: number, y: number, ahora: number): void;
  /** Toca un evento ambiente. */
  alAmbiente(ahora: number): void;
}

export type CrearFigura = (entorno: Entorno) => Figura;

/* ---------- Utilidades para las figuras ---------- */

/** Cola de un punto que se mueve: linea que se estrecha y se apaga hacia atras. */
export function pintarCola(ctx: CanvasRenderingContext2D, cola: { x: number; y: number }[], cabeza: boolean): void {
  const n = cola.length;
  ctx.lineCap = "round";
  for (let i = 1; i < n; i++) {
    ctx.lineWidth = 1 + (i / n) * 1.6;
    ctx.strokeStyle = rgba((i / n) * 0.9);
    ctx.beginPath();
    ctx.moveTo(cola[i - 1].x, cola[i - 1].y);
    ctx.lineTo(cola[i].x, cola[i].y);
    ctx.stroke();
  }
  if (cabeza && n > 0) pintarDestello(ctx, cola[n - 1].x, cola[n - 1].y, 12);
}

/** Punto brillante con halo. */
export function pintarDestello(ctx: CanvasRenderingContext2D, x: number, y: number, radio: number): void {
  const halo = ctx.createRadialGradient(x, y, 0, x, y, radio);
  halo.addColorStop(0, rgba(0.9));
  halo.addColorStop(1, rgba(0));
  ctx.fillStyle = halo;
  ctx.fillRect(x - radio, y - radio, radio * 2, radio * 2);
  ctx.fillStyle = "rgba(225, 250, 253, 1)";
  ctx.beginPath();
  ctx.arc(x, y, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

export const azar = (min: number, max: number) => min + Math.random() * (max - min);
export const elegir = <T,>(lista: T[]): T => lista[Math.floor(Math.random() * lista.length)];

/* ---------- Componente ---------- */

/** Borra lo pintado detras de la portada y deja un fundido donde termina. Ahi ya esta
 * la escena 3D y las dos juntas se pisaban. */
export function taparPortada(ctx: CanvasRenderingContext2D, ample: number, alt: number): void {
  const portada = document.getElementById("dalt");
  const limite = Math.min(alt, portada ? portada.getBoundingClientRect().bottom : 0);
  if (limite <= 0) return;
  const corte = limite - FUNDIDO_PORTADA;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  if (corte > 0) ctx.fillRect(0, 0, ample, corte);
  const g = ctx.createLinearGradient(0, corte, 0, limite);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, corte, ample, FUNDIDO_PORTADA);
  ctx.restore();
}

type Estado = {
  figura: Figura;
  ctx: CanvasRenderingContext2D;
  base: HTMLCanvasElement;
  encendida: HTMLCanvasElement;
  foco: HTMLCanvasElement;
  dpr: number;
  ample: number;
  alt: number;
  cursor: Cursor;
  ultimo: { x: number; y: number } | null;
  proximaAmbiente: number;
  ultimoFrame: number;
  acumulado: number;
  rafId: number;
  temporizador: number;
  corriendo: boolean;
};

function pintarFrame(e: Estado, ahora: number): void {
  const { ctx, ample, alt, dpr, cursor } = e;
  ctx.clearRect(0, 0, ample, alt);
  ctx.drawImage(e.base, 0, 0, ample, alt);

  if (cursor.luz > 0.01) {
    const R = e.figura.foco.radio;
    const lado = e.foco.width;
    const f = e.foco.getContext("2d")!;
    f.globalCompositeOperation = "copy";
    f.drawImage(e.encendida, (cursor.x - R) * dpr, (cursor.y - R) * dpr, lado, lado, 0, 0, lado, lado);
    f.globalCompositeOperation = "destination-in";
    const g = f.createRadialGradient(lado / 2, lado / 2, 0, lado / 2, lado / 2, lado / 2);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.45, "rgba(0,0,0,.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    f.fillStyle = g;
    f.fillRect(0, 0, lado, lado);

    ctx.globalAlpha = cursor.luz * e.figura.foco.intensidad;
    const halo = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, R);
    halo.addColorStop(0, rgba(0.06));
    halo.addColorStop(1, rgba(0));
    ctx.fillStyle = halo;
    ctx.fillRect(cursor.x - R, cursor.y - R, R * 2, R * 2);
    ctx.drawImage(e.foco, 0, 0, lado, lado, cursor.x - R, cursor.y - R, lado / dpr, lado / dpr);
    ctx.globalAlpha = 1;
  }

  e.figura.dibujar(ctx, ahora, cursor);
  taparPortada(ctx, ample, alt);
}

export function FonsCanvas({ crear }: { crear: CrearFigura }) {
  const quiet = useReducedMotion();
  const ambRaton = useRaton();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasInicial = canvasRef.current;
    if (!canvasInicial) return;
    const canvas: HTMLCanvasElement = canvasInicial;
    let estado: Estado | null = null;
    let resizeTimer = 0;

    const programar = (ahora: number, figura: Figura) => ahora + azar(figura.ambiente[0], figura.ambiente[1]);

    function iniciar(): void {
      if (!estado || estado.corriendo || quiet || document.hidden) return;
      estado.corriendo = true;
      estado.ultimoFrame = 0;
      window.clearTimeout(estado.temporizador);
      estado.rafId = requestAnimationFrame(tick);
    }

    function tick(ahora: number): void {
      const e = estado;
      if (!e) return;
      e.acumulado += e.ultimoFrame ? (ahora - e.ultimoFrame) / 1000 : 1 / 60;
      e.ultimoFrame = ahora;
      if (!ambRaton && e.acumulado < 1 / FPS_MOVIL) {
        e.rafId = requestAnimationFrame(tick);
        return;
      }
      // Tras una pausa larga, un dt enorme de golpe lo apagaria todo de una vez.
      const dt = Math.min(e.acumulado, 0.1);
      e.acumulado = 0;

      const { cursor } = e;
      const objetivo = cursor.dentro ? 1 : 0;
      const seguir = 1 - Math.exp(-SEGUIMIENTO_FOCO * dt);
      cursor.luz += (objetivo - cursor.luz) * seguir;
      if (Math.abs(objetivo - cursor.luz) < 0.005) cursor.luz = objetivo;

      if (ahora >= e.proximaAmbiente) {
        e.figura.alAmbiente(ahora);
        e.proximaAmbiente = programar(ahora, e.figura);
      }

      const vivo = e.figura.avanzar(dt, ahora);
      pintarFrame(e, ahora);

      if (vivo || cursor.luz !== objetivo) {
        e.rafId = requestAnimationFrame(tick);
      } else {
        e.corriendo = false;
        e.temporizador = window.setTimeout(iniciar, Math.max(50, e.proximaAmbiente - ahora));
      }
    }

    function lienzo(ancho: number, alto: number): HTMLCanvasElement {
      const c = document.createElement("canvas");
      c.width = ancho;
      c.height = alto;
      return c;
    }

    function configurar(): void {
      const ample = window.innerWidth;
      const alt = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(ample * dpr);
      const h = Math.round(alt * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${ample}px`;
      canvas.style.height = `${alt}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const figura = crear({ ample, alt, movil: !ambRaton });
      const base = lienzo(w, h);
      const encendida = lienzo(w, h);
      const bctx = base.getContext("2d");
      const ectx = encendida.getContext("2d");
      if (!bctx || !ectx) return;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ectx.setTransform(dpr, 0, 0, dpr, 0, 0);
      figura.pintar(bctx, ectx);
      const lado = Math.ceil(figura.foco.radio * 2 * dpr);

      const previo = estado;
      if (previo) {
        window.cancelAnimationFrame(previo.rafId);
        window.clearTimeout(previo.temporizador);
      }
      const ahora = performance.now();
      estado = {
        figura,
        ctx,
        base,
        encendida,
        foco: lienzo(lado, lado),
        dpr,
        ample,
        alt,
        cursor: previo?.cursor ?? { x: ample / 2, y: alt / 2, dentro: false, luz: 0 },
        ultimo: null,
        proximaAmbiente: ahora + 500,
        ultimoFrame: 0,
        acumulado: 0,
        rafId: 0,
        temporizador: 0,
        corriendo: false
      };
      pintarFrame(estado, ahora);
      iniciar();
    }

    function alMover(event: PointerEvent): void {
      const e = estado;
      if (!e) return;
      const raton = event.pointerType === "mouse";
      // En tactil solo cuenta el dedo apoyado y arrastrando, y sin linterna: el dedo
      // taparia justo lo que ilumina.
      if (!raton && event.buttons === 0) return;
      const { clientX: x, clientY: y } = event;
      const paso = e.ultimo ? Math.hypot(x - e.ultimo.x, y - e.ultimo.y) : 0;
      e.ultimo = { x, y };
      if (raton) {
        e.cursor.x = x;
        e.cursor.y = y;
        e.cursor.dentro = true;
      }
      e.figura.mover(x, y, paso);
      iniciar();
    }

    function alPulsar(event: PointerEvent): void {
      if (!estado) return;
      estado.ultimo = { x: event.clientX, y: event.clientY };
      estado.figura.pulsar(event.clientX, event.clientY, performance.now());
      iniciar();
    }

    function alSalir(event: MouseEvent): void {
      if (event.relatedTarget || !estado) return;
      estado.cursor.dentro = false;
      estado.ultimo = null;
      iniciar();
    }

    function alRedimensionar(): void {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(configurar, 200);
    }

    // Al hacer scroll cambia donde acaba la portada: hay que repintar el corte.
    function alDesplazar(): void {
      const e = estado;
      if (!e || e.corriendo) return;
      requestAnimationFrame((t) => pintarFrame(e, t));
    }

    function alCambiarVisibilidad(): void {
      if (!estado) return;
      if (document.hidden) {
        window.cancelAnimationFrame(estado.rafId);
        window.clearTimeout(estado.temporizador);
        estado.corriendo = false;
      } else {
        iniciar();
      }
    }

    // El corte de la portada depende de donde acaba #dalt, y eso cambia cuando el portafolio se
    // monta (despues de entrar) o cambia de alto. Con movimiento reducido no hay bucle que lo
    // repinte, y hasta el primer scroll se veria la placa por debajo de la escena.
    const vigilantAlt = new ResizeObserver(alDesplazar);
    vigilantAlt.observe(document.body);

    configurar();
    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    if (!quiet) {
      window.addEventListener("pointermove", alMover, { passive: true });
      window.addEventListener("pointerdown", alPulsar, { passive: true });
      window.addEventListener("mouseout", alSalir);
    }

    return () => {
      vigilantAlt.disconnect();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", alRedimensionar);
      window.removeEventListener("scroll", alDesplazar);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      window.removeEventListener("pointermove", alMover);
      window.removeEventListener("pointerdown", alPulsar);
      window.removeEventListener("mouseout", alSalir);
      if (estado) {
        window.cancelAnimationFrame(estado.rafId);
        window.clearTimeout(estado.temporizador);
      }
      estado = null;
    };
  }, [quiet, ambRaton, crear]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
