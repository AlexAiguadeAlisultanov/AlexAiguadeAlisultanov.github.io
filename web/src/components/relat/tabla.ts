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
// Lo que solo mueve el chip (el despiece de cada grupo de piezas, la camara, el brillo) esta en
// despiece.ts, que solo importa la escena: asi viaja en su trozo y no en el de la pagina.

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

/** Opacidad de una tarjeta de capitulo: entera cerca de su centro y nada lejos de el. */
export const opacidad = (p: number, centro: number) =>
  1 - ventana(Math.abs(p - centro), OPACIDAD.dentro, OPACIDAD.fuera);
