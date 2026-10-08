// La coreografia del chip en la pelicula: como se despieza cada grupo de piezas, la camara, el
// brillo y el remate, todo en funcion de p (y de q durante el viaje). Solo la importa
// Escena.tsx, asi que viaja en el trozo de la escena; lo que comparten las tarjetas, el rail y
// la escena (los centros de cada capitulo, el viaje, ventana) sigue en tabla.ts.
//
// Todo lo que toca al chip es una funcion continua de q y p, con derivada suave: entre punto y
// punto de cada tabla se pasa con smoothstep, y donde acaba la portada (q = 1) empieza la
// historia (p = 0) con el mismo valor. Nada cambia de golpe al cruzar un umbral, bajando o
// subiendo.

import { clamp01, ventana } from "./tabla";
import type { Tramos } from "./tabla";

/** Separacion comun de las capas (uSep) segun p. Empieza en 0,36 porque el chip ya se va
 *  separando durante el viaje (de 0,22 a 0,36 con q). En la historia se queda suave: el despiece
 *  de verdad lo hace cada grupo con su ALTURA, y al final todo vuelve a 0,22. */
export const SEP: Tramos = [
  [0, 0.36],
  [0.1, 0.4],
  [0.86, 0.4],
  [0.94, 0.26],
  [1, 0.22]
];

/* ---------- Despiece por grupos ----------
   El chip tiene ocho grupos de piezas, de abajo arriba (el numero es aGrup en los shaders):
     0 bolas BGA · 1 sustrato y condensadores · 2 pistas · 3 silicio (nucleos, cache, controlador
     de memoria y grafica) · 4 capas de metal · 5 pasta termica · 6 escudo · 7 tapa IHS.
   Cada fila es [p, valores de los ocho grupos]. Entre fila y fila se pasa con smoothstep, asi
   que todo es continuo y con derivada suave; dentro de cada capitulo hay dos filas distintas
   para que las piezas sigan moviendose mientras dura. */

export type Fila8 = readonly [number, readonly number[]];

/** Altura extra de cada grupo, en unidades del chip (el sustrato mide 4,2 de lado). */
export const ALTURA: readonly Fila8[] = [
  [0, [0, 0, 0, 0, 0, 0, 0, 0]],
  [0.1, [-0.7, 0, 0, 0.15, 0.2, 0.22, 0.24, 0.26]],
  [0.26, [-1.45, 0, 0, 0.3, 0.35, 0.4, 0.45, 0.5]],
  [0.38, [-0.6, -0.45, -0.45, 0.25, 0.55, 1.6, 1.75, 1.9]],
  [0.52, [-0.7, -0.6, -0.6, 0.45, 0.85, 2.1, 2.3, 2.5]],
  [0.7, [-0.35, -0.25, -0.25, -0.1, 0, 0.3, 0.6, 1.2]],
  [0.82, [-0.3, -0.25, -0.25, -0.1, 0, 0.4, 0.95, 2.3]],
  [0.93, [0, 0, 0, 0, 0, 0, 0, 0]]
];

/** Separacion en el plano: las bolas y los condensadores se abren un poco en Hardware y los
 *  bloques del silicio se apartan entre si en Software. */
export const OBERTURA: readonly Fila8[] = [
  [0, [0, 0, 0, 0, 0, 0, 0, 0]],
  [0.1, [0.06, 0.05, 0, 0, 0, 0, 0, 0]],
  [0.26, [0.12, 0.1, 0, 0.04, 0, 0, 0, 0]],
  [0.38, [0.06, 0.05, 0, 0.25, 0, 0, 0, 0]],
  [0.52, [0.06, 0.05, 0, 0.5, 0, 0, 0, 0]],
  [0.7, [0.03, 0.03, 0, 0.14, 0, 0, 0, 0]],
  [0.82, [0.03, 0.03, 0, 0.1, 0, 0, 0, 0]],
  [0.93, [0, 0, 0, 0, 0, 0, 0, 0]]
];

/** Brillo de cada grupo: el del capitulo entero (y con resplandor), los demas bastante apagados.
 *  En p = 0 coincide con la portada: las piezas de siempre enteras y las nuevas, suaves. Entre
 *  capitulos el que entra se enciende antes de que se apague el que sale, para que el chip no
 *  pase nunca por un momento a oscuras. */
export const PESOS: readonly Fila8[] = [
  [0, [1, 1, 1, 1, 0.2, 0.3, 0.3, 1]],
  [0.08, [1, 1, 1, 0.16, 0.12, 0.12, 0.12, 0.16]],
  [0.29, [1, 1, 1, 0.16, 0.12, 0.12, 0.12, 0.16]],
  [0.33, [1, 1, 1, 1, 1, 0.12, 0.12, 0.16]],
  [0.37, [0.16, 0.16, 0.2, 1, 1, 0.12, 0.12, 0.16]],
  [0.57, [0.16, 0.16, 0.2, 1, 1, 0.12, 0.12, 0.16]],
  [0.61, [0.16, 0.16, 0.2, 1, 1, 0.7, 1, 1]],
  [0.65, [0.16, 0.16, 0.16, 0.18, 0.14, 0.7, 1, 1]],
  [0.85, [0.16, 0.16, 0.16, 0.18, 0.14, 0.7, 1, 1]],
  [0.92, [1, 1, 1, 1, 0.6, 0.6, 0.6, 1]]
];

/** Resplandor de lo que esta encendido: sube con el primer capitulo y tiene su pico al montarse. */
export const BRILLO: Tramos = [
  [0, 0],
  [0.08, 1],
  [0.86, 1],
  [0.93, 1.5],
  [1, 0.6]
];

/** Pulsos de datos en todas las pistas: en Hardware, y otra vez al montarse. */
export const FLUJO: Tramos = [
  [0, 0],
  [0.06, 1],
  [0.3, 1],
  [0.38, 0.25],
  [0.86, 0.25],
  [0.93, 1],
  [1, 1]
];

/** Guias de montaje discontinuas entre las capas, mientras el chip esta despiezado. */
export const GUIAS: Tramos = [
  [0, 0],
  [0.08, 1],
  [0.86, 1],
  [0.93, 0]
];

/** Camara ligada al scroll. VUELTA: giro lento sobre si mismo (rad). INCLINA: mas de lado para
 *  ver la pila (rad, se suma a la inclinacion fija). ACERCA: escala del chip, mas cerca del silicio
 *  en Software. CENTRO_PILA: altura de la pila que queda en el centro de la capa (unidades). */
export const VUELTA: Tramos = [
  [0, 0],
  [0.18, 0.15],
  [0.46, 0.35],
  [0.75, 0.55],
  [1, 0.65]
];
export const INCLINA: Tramos = [
  [0, 0],
  [0.18, -0.1],
  [0.46, -0.16],
  [0.75, -0.12],
  [0.93, 0]
];
export const ACERCA: Tramos = [
  [0, 1],
  [0.18, 0.96],
  [0.46, 1.4],
  [0.75, 1.12],
  [0.93, 1]
];
export const CENTRO_PILA: Tramos = [
  [0, 0],
  [0.18, -0.55],
  [0.46, 1.0],
  [0.75, 1.6],
  [0.93, 0]
];

/** Suavizado de los pesos en el tiempo, en ms, por si el scroll llega a saltos (teclado, anclas).
 *  Sus objetivos ya son continuos: esto solo redondea. */
export const PESOS_MS = 120;

/** El remate: al montarse el chip, una rafaga de corriente sale por todas las pistas. Sale una
 *  vez al pasar por esta p bajando, y no se rearma hasta volver por debajo de en - histeresis. */
export const RAFAGA = { en: 0.93, histeresis: 0.03 } as const;

/** Despues del remate el chip baja de brillo: uForca pasa de 1 a 0,35 entre p 0,95 y 1. */
export const APAGADO = { desde: 0.95, hasta: 1, valor: [1, 0.35] } as const;

/** smootherstep de 0 a 1: primera y segunda derivada nulas en los dos extremos. */
export function suau(x: number): number {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Entre los puntos de una tabla [p, valor], ordenada por p, con smoothstep en cada tramo: el
 *  valor empalma en cada punto y la pendiente tambien (vale cero en el punto). */
export function tramos(tabla: Tramos, p: number): number {
  if (p <= tabla[0][0]) return tabla[0][1];
  for (let i = 1; i < tabla.length; i++) {
    const [p1, v1] = tabla[i];
    if (p <= p1) {
      const [p0, v0] = tabla[i - 1];
      return v0 + (v1 - v0) * ventana(p, p0, p1);
    }
  }
  return tabla[tabla.length - 1][1];
}

/** Los ocho valores de una tabla de grupos en p, escritos en `sortida` para no crear un vector
 *  en cada fotograma. Antes de la primera fila y despues de la ultima se quedan fijos. */
export function tramos8(tabla: readonly Fila8[], p: number, sortida: number[]): void {
  let i = 1;
  while (i < tabla.length - 1 && p > tabla[i][0]) i++;
  const [p0, w0] = tabla[i - 1];
  const [p1, w1] = tabla[i];
  const t = ventana(p, p0, p1);
  for (let k = 0; k < 8; k++) sortida[k] = w0[k] + (w1[k] - w0[k]) * t;
}

/** Brillo general del chip (uForca) en p. */
export const forca = (p: number) =>
  APAGADO.valor[0] + (APAGADO.valor[1] - APAGADO.valor[0]) * ventana(p, APAGADO.desde, APAGADO.hasta);
