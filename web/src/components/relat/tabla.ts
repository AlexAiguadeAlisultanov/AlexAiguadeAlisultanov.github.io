// La coreografia de la pelicula en un solo sitio. Escena, Historia y Rail leen de aqui, asi
// que mover un capitulo o cambiar cuando se despieza una capa es tocar una cifra, no buscarla
// por tres ficheros.
//
// Dos recorridos, los dos de 0 a 1:
//   q (sortida): la portada saliendo por arriba. 0 con la pagina arriba del todo, 1 cuando la
//     portada ya se ha ido entera bajo la cabecera.
//   p (progres): la historia mientras la capa de la escena esta fijada. 0 cuando #historia toca
//     el borde de arriba de la ventana, 1 cuando su final toca el de abajo. Son 280svh de scroll
//     (380svh de seccion menos la ventana): unos 2.520 px con 900 de alto.
//
// La historia son cinco bloques: titular de 60svh y 01, 02, 03 y cierre de 80svh. El centro de
// una tarjeta pasa por el centro de la ventana en p = (su centro en svh - 50) / 280, que es de
// donde salen los numeros de CENTRO.
//
// Todo lo que toca al chip es una funcion continua de q y p, con derivada suave: entre punto y
// punto de cada tabla se pasa con smoothstep, y donde acaba la portada (q = 1) empieza la
// historia (p = 0) con el mismo valor. Nada cambia de golpe al cruzar un umbral, bajando o
// subiendo.

export type Tramos = readonly (readonly [number, number])[];

/** p en la que el centro de cada tarjeta pasa por el centro de la ventana. */
export const CENTRO = { hw: 0.179, sw: 0.464, seg: 0.75 } as const;

/** A que distancia de su centro (en p) una tarjeta empieza a apagarse y deja de verse:
 *  0,22 y 0,42 alturas de ventana, divididas entre las 2,8 del recorrido. */
export const OPACIDAD = { dentro: 0.079, fuera: 0.15 } as const;

/** El titular usa la misma regla con su propio recorrido, centrado en 0,5. */
export const TITULAR = 0.5;

/** El cierre lleva botones: solo sube, entre estas dos p, y ya no se apaga. */
export const CIERRE = [0.8, 0.88] as const;

/** Separacion de las capas (uSep) segun p. Empieza en 0,36 porque el chip ya se va separando
 *  durante el viaje (de 0,22 a 0,36 con q). La tapa, la que mas sube, llega arriba en 0,75. */
export const SEP: Tramos = [
  [0, 0.36],
  [0.18, 0.55],
  [0.46, 0.9],
  [0.75, 1.0],
  [1, 0.22]
];

type Pes = readonly [number, number, number, number];

/** Brillo de cada capa [bolas, sustrato, silicio, tapa] a lo largo de p. Con la portada y en p = 0
 *  van las cuatro enteras; la capa de cada capitulo se enciende mientras entra su tarjeta y se
 *  cambia de una a otra alrededor de 0,32, 0,6 y 0,88, siempre con curva y sin escalones. */
export const PESOS: readonly (readonly [number, Pes])[] = [
  [0, [1, 1, 1, 1]],
  [0.08, [1, 1, 0.3, 0.3]],
  [0.28, [1, 1, 0.3, 0.3]],
  [0.36, [0.3, 0.3, 1, 0.3]],
  [0.56, [0.3, 0.3, 1, 0.3]],
  [0.64, [0.3, 0.3, 0.3, 1]],
  [0.84, [0.3, 0.3, 0.3, 1]],
  [0.92, [1, 1, 1, 1]]
];

/** Suavizado de los pesos en el tiempo, en ms, por si el scroll llega a saltos (teclado, anclas).
 *  Sus objetivos ya son continuos: esto solo redondea. */
export const PESOS_MS = 120;

/** La rafaga de corriente sale una vez al pasar por esta p bajando, y no se rearma hasta
 *  volver por debajo de en - histeresis. */
export const RAFAGA = { en: 0.64, histeresis: 0.03 } as const;

/** Al final el chip baja de brillo: uForca pasa de 1 a 0,35 entre p 0,92 y 1. */
export const APAGADO = { desde: 0.92, hasta: 1, valor: [1, 0.35] } as const;

/** Lo que llena cada segmento del rail: Hardware, Software, Seguridad y Montado. */
export const RAIL: Tramos = [
  [0, 0.32],
  [0.32, 0.6],
  [0.6, 0.88],
  [0.88, 1]
];

/** Sombra que respira detras de las tarjetas: base + extra * la opacidad de la mas visible. */
export const SOMBRA = { base: 0.3, extra: 0.7 } as const;

/** El viaje del chip desde el retrato hasta su sitio en la capa, segun q. Sale de donde esta el
 *  retrato con la pagina arriba y se desliza hasta su sitio con suau(q) a lo largo de toda la
 *  portada: no sube con el scroll, es el retrato el que se va y lo deja a la vista. */
export const VIAJE = {
  /** La sombra que respira entra con smoothstep(desde, 1, q). */
  desde: 0.3,
  /** Donde acaba su centro, en fracciones del ancho y el alto de la capa. */
  ancla: [0.62, 0.5],
  /** Lado final del encapsulado: min(58svh, 40vw). Sale a 2,1 veces el retrato. */
  lado: { svh: 0.58, vw: 0.4 },
  /** Entre q = 0 y esta q se apaga, con curva, el despiece por cercania del puntero, y la
   *  inclinacion baja a la mitad. */
  puntero: 0.3,
  inclinacion: 0.5,
  /** Mascara del lienzo (radios de la elipse en %): la de la portada al salir y otra mas
   *  cerrada alrededor del chip ya en su sitio. */
  mascara: { desde: [62, 90], hasta: [45, 70] }
} as const;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** smoothstep: 0 hasta a, 1 desde b y una curva suave en medio. */
export function ventana(x: number, a: number, b: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

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

/** Opacidad de una tarjeta de capitulo: entera cerca de su centro y nada lejos de el. */
export const opacidad = (p: number, centro: number) =>
  1 - ventana(Math.abs(p - centro), OPACIDAD.dentro, OPACIDAD.fuera);

/** Los cuatro pesos en p, escritos en `sortida` para no crear un vector en cada fotograma. */
export function pesos(p: number, sortida: number[]): void {
  let i = 1;
  while (i < PESOS.length - 1 && p > PESOS[i][0]) i++;
  const [p0, w0] = PESOS[i - 1];
  const [p1, w1] = PESOS[i];
  const t = ventana(p, p0, p1);
  for (let k = 0; k < 4; k++) sortida[k] = w0[k] + (w1[k] - w0[k]) * t;
}

/** Brillo general del chip (uForca) en p. */
export const forca = (p: number) =>
  APAGADO.valor[0] + (APAGADO.valor[1] - APAGADO.valor[0]) * ventana(p, APAGADO.desde, APAGADO.hasta);
