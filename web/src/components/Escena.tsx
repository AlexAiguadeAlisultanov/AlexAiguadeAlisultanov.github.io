// Fondo de la portada: un procesador en 3D dibujado solo con lineas de luz, construido por
// codigo. No hay ningun modelo importado ni ninguna textura.
//
// Por que esta escena: el resto de la pagina lleva de fondo una placa base, asi que la
// portada enseña la pieza central de esa placa. El chip esta despiezado en sus capas (la rejilla
// de bolas de soldadura, el sustrato con sus condensadores, el silicio con sus nucleos y el
// disipador integrado) y de sus bordes salen pistas con corriente que se pierden hacia la placa
// de abajo.
//
// El chip se centra detras del retrato y es algo mayor que el: la foto queda como el
// nucleo del procesador y alrededor asoman el encapsulado, las bolas y las pistas.
//
// Lo que hace el cursor: el chip se inclina hacia el, y al acercarse las capas se separan
// como en un plano de montaje, con las guias discontinuas entre esquinas. Un clic en la
// portada manda una rafaga de corriente por todas las pistas.
//
// Modo pelicula (escritorio, ver relat/Escenari.tsx): el lienzo vive en una capa fijada que
// cubre la portada y la historia, y la escena recibe dos recorridos de scroll, q (la portada
// saliendo) y p (la historia). Con q el chip se queda donde estaba el retrato mientras este se
// va con la pagina, y se desliza hasta el 62 % / 50 % de la capa encogiendo y empezando a
// separarse. Con p se despieza de verdad: ocho grupos de piezas (bolas, sustrato, pistas,
// silicio en bloques, capas de metal, pasta termica, escudo y tapa) suben, bajan y se abren
// segun el capitulo, el del capitulo se enciende con resplandor, la camara gira y se acerca, y
// unas etiquetas con linea guia nombran las piezas. Al final todo se vuelve a montar con una
// rafaga de corriente. Todo sale de funciones continuas de q y p (relat/despiece.ts), asi que es
// un solo movimiento, bajando o subiendo. Las piezas nuevas solo existen en la pelicula: sin
// progres la portada se ve y se comporta como siempre.
//
// De three se importan solo las piezas que se usan: el material es un shader propio, asi
// que el empaquetador puede tirar casi toda la libreria. Este modulo se carga aparte y
// solo cuando el equipo da la talla; quien entra por el movil no descarga ni un byte.

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from "three";
import { useIdioma } from "../lib/idioma";
import {
  ACERCA,
  ALTURA,
  BRILLO,
  CENTRO_PILA,
  FLUJO,
  GUIAS,
  INCLINA,
  OBERTURA,
  PESOS,
  PESOS_MS,
  RAFAGA,
  SEP,
  VUELTA,
  forca,
  suau,
  tramos,
  tramos8
} from "./relat/despiece";
import { VIAJE, ventana } from "./relat/tabla";
import { FINESTRA, NOMS, ROTOLS } from "./relat/rotols";

/* ---------- Ajustes ---------- */

const CAMERA_Z = 9.5;
const INCLINACION = -0.98;   // rad, cuanto se tumba el chip hacia atras
const GIRO = 0.62;           // rad, giro sobre si mismo para verlo en rombo
const MIDA_RESPECTE_FOTO = 2.1;  // lado del encapsulado respecto al diametro de la foto
const SEPARACION_REPOSO = 0.22; // capas algo separadas aunque nadie se acerque
const RADIO_CERCA = 420;     // px de pantalla desde los que el cursor empieza a despiezarlo
const PISTAS_POR_LADO = 11;
const ALCANCE_PISTAS = 11;   // hasta donde llegan las pistas, en unidades de la escena

/** Color del acento, leido de la hoja de estilos para no tenerlo escrito en dos sitios. */
function accent(): Color {
  const reserva = new Color(0.373, 0.776, 0.831);
  try {
    const cru = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
    if (cru) return new Color(cru);
  } catch {
    // Se queda el de reserva.
  }
  return reserva;
}

/** Generador con semilla fija: el chip es el mismo en cada visita. */
function daus(llavor: number) {
  let estat = llavor;
  return () => {
    estat = (estat * 1103515245 + 12345) & 0x7fffffff;
    return estat / 0x7fffffff;
  };
}

/* ---------- Shaders ---------- */

// Cada vertice sabe a que capa pertenece (aCapa): con uSep cada capa sube o baja en proporcion,
// que es el despiece de la portada. En la pelicula ademas cada grupo de piezas (aGrup, de 0 a 7)
// tiene su altura (uAlt), su apertura en el plano (uObre, en la direccion aDir) y su brillo
// (uPes); aNivell multiplica la altura dentro de un grupo para que, por ejemplo, las tres capas
// de metal se separen entre ellas. Las piezas nuevas (aNou) solo se ven con uNou. Los vectores
// se leen con step y un producto escalar, sin indexar con una variable, que no todas las
// graficas aceptan. Fuera de la pelicula todos esos uniforms valen 0 o 1 y no cambian nada.
const DESPIECE = `
  uniform float uSep;
  uniform float uNou;
  uniform float uCentre;
  uniform vec4 uAltA;
  uniform vec4 uAltB;
  uniform vec4 uObreA;
  uniform vec4 uObreB;
  uniform vec4 uPesA;
  uniform vec4 uPesB;
  attribute float aCapa;
  attribute float aGrup;
  attribute float aNivell;
  attribute vec2 aDir;
  attribute float aNou;
  varying float vPes;
  varying float vVis;
  vec3 despiece(vec3 p) {
    vec4 ohA = step(abs(vec4(0.0, 1.0, 2.0, 3.0) - aGrup), vec4(0.5));
    vec4 ohB = step(abs(vec4(4.0, 5.0, 6.0, 7.0) - aGrup), vec4(0.5));
    vPes = dot(uPesA, ohA) + dot(uPesB, ohB);
    vVis = mix(1.0, uNou, aNou);
    p.xy += aDir * (dot(uObreA, ohA) + dot(uObreB, ohB));
    p.z += aCapa * uSep + aNivell * (dot(uAltA, ohA) + dot(uAltB, ohB)) - uCentre;
    return p;
  }
`;

const VS_LINIES = `
  ${DESPIECE}
  attribute float aT;
  attribute float aLlavor;
  attribute float aBase;
  attribute float aGuia;
  attribute float aFlux;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  void main() {
    vT = aT;
    vLlavor = aLlavor;
    vBase = aBase;
    vGuia = aGuia;
    vFlux = aFlux;
    vec3 p = despiece(position);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vProf = clamp((20.0 + mv.z) / 14.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

// El resplandor: las mismas lineas, dibujadas varias veces (instancias) corridas un pixel o dos en
// pantalla alrededor de la original. Solo lo que esta encendido (vPes alto) lleva resplandor.
const VS_HALO = VS_LINIES.replace(
  "void main() {",
  "attribute vec2 aDesp;\n  uniform vec2 uPx;\n  void main() {"
).replace(
  "gl_Position = projectionMatrix * mv;",
  "gl_Position = projectionMatrix * mv;\n    gl_Position.xy += aDesp * uPx * gl_Position.w;"
);

const FS_LINIES = `
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform float uTemps;
  uniform float uForca;
  uniform float uSep;
  uniform float uRafaga;
  uniform float uFlux;
  uniform float uGuies;
  uniform float uBrill;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  varying float vPes;
  varying float vVis;
  void main() {
    float alfa = vBase * uForca * vProf * vPes;
    if (vGuia > 0.5) {
      // Guias de montaje: discontinuas y solo cuando el chip esta despiezado.
      if (fract(vT * 14.0) > 0.5) discard;
      alfa *= max(smoothstep(0.3, 0.9, uSep), uGuies);
    }
    float pols = 0.0;
    if (vLlavor >= 0.0) {
      float lloc = fract(uTemps * 0.11 + vLlavor);
      pols = smoothstep(0.05, 0.0, abs(vT - lloc));
      // Rafaga del clic: un frente que sale del chip hacia fuera por todas las pistas.
      pols = max(pols, smoothstep(0.08, 0.0, abs(vT - (1.0 - uRafaga) * 1.1)) * step(0.001, uRafaga));
      // Las pistas que solo llevan pulso en la pelicula dependen de uFlux.
      pols *= mix(1.0, uFlux, vFlux);
      // Las pistas se apagan hacia fuera, donde ya las recoge la placa del fondo.
      if (vFlux < 0.5) alfa *= (1.0 - vT) * (1.0 - vT);
    }
    // Lo que esta encendido brilla mas y tira hacia el blanco.
    float llum = smoothstep(0.75, 1.0, vPes) * uBrill;
    vec3 color = mix(mix(uColor, uPols, pols), uPols, 0.4 * min(llum, 1.0));
    gl_FragColor = vec4(color, (alfa * (1.0 + 0.9 * llum) + pols * uForca * 0.8 * vProf) * vVis);
  }
`;

const FS_HALO = `
  uniform vec3 uPols;
  uniform float uForca;
  uniform float uBrill;
  uniform float uHalo;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  varying float vPes;
  varying float vVis;
  void main() {
    if (vGuia > 0.5) discard;
    float alfa = vBase * uForca * vProf * smoothstep(0.75, 1.0, vPes) * uBrill * uHalo * vVis;
    if (vLlavor >= 0.0 && vFlux < 0.5) alfa *= (1.0 - vT) * (1.0 - vT);
    if (alfa < 0.002) discard;
    gl_FragColor = vec4(uPols, alfa);
  }
`;

const VS_PUNTS = `
  ${DESPIECE}
  uniform float uPunt;
  uniform float uBrill;
  attribute float aMida;
  attribute float aBase;
  varying float vBase;
  varying float vLlum;
  void main() {
    vBase = aBase;
    vec3 p = despiece(position);
    vLlum = smoothstep(0.75, 1.0, vPes) * uBrill;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPunt * aMida / max(-mv.z, 0.001) * (1.0 + 0.6 * vLlum);
  }
`;

const FS_PUNTS = `
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform float uForca;
  varying float vBase;
  varying float vPes;
  varying float vVis;
  varying float vLlum;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    vec3 color = mix(uColor, uPols, 0.4 * min(vLlum, 1.0));
    gl_FragColor = vec4(color, smoothstep(0.25, 0.04, d2) * vBase * uForca * vPes * (1.0 + 0.9 * vLlum) * vVis);
  }
`;

/* ---------- Geometria del chip ---------- */

// Altura de cada capa al despiezar con uSep (sep), su altura en reposo (z) y su grupo (aGrup).
type Capa = { sep: number; z: number; grup: number };
const CAPA = {
  bolas: { sep: -0.9, z: -0.06, grup: 0 },
  sustrato: { sep: 0, z: 0, grup: 1 },
  pistas: { sep: 0, z: 0, grup: 2 },
  silicio: { sep: 0.75, z: 0.07, grup: 3 },
  metal: { sep: 0.85, z: 0.085, grup: 4 },
  pasta: { sep: 1.05, z: 0.11, grup: 5 },
  escudo: { sep: 1.3, z: 0.13, grup: 6 },
  tapa: { sep: 1.6, z: 0.16, grup: 7 }
} satisfies Record<string, Capa>;

/** Lo que lleva un vertice ademas de su capa: multiplicador de altura dentro del grupo, un poco
 *  de altura propia, direccion en la que se abre, si es pieza nueva (solo pelicula) y si su pulso
 *  depende de uFlux. */
type Extra = { nivell?: number; dz?: number; dir?: readonly [number, number]; nou?: number; flux?: number };

const S = 2.1;      // medio lado del sustrato
const DW = 1.7;     // ancho del silicio
const DH = 1.25;    // alto del silicio
const T = 1.55;     // medio lado de la tapa

function construir() {
  const atzar = daus(20260928);
  // Las piezas nuevas usan su propio generador: asi no cambian las de siempre.
  const nova = daus(20261008);

  const L = { p: [] as number[], capa: [] as number[], grup: [] as number[], nivell: [] as number[], dir: [] as number[],
    nou: [] as number[], flux: [] as number[], t: [] as number[], llavor: [] as number[], base: [] as number[], guia: [] as number[] };

  const vertex = (x: number, y: number, c: Capa, t: number, llavor: number, base: number, guia: number, e: Extra) => {
    L.p.push(x, y, c.z + (e.dz ?? 0));
    L.capa.push(c.sep);
    L.grup.push(c.grup);
    L.nivell.push(e.nivell ?? 1);
    L.dir.push(e.dir?.[0] ?? 0, e.dir?.[1] ?? 0);
    L.nou.push(e.nou ?? 0);
    L.flux.push(e.flux ?? 0);
    L.t.push(t);
    L.llavor.push(llavor);
    L.base.push(base);
    L.guia.push(guia);
  };

  const segment = (
    x1: number, y1: number, c1: Capa,
    x2: number, y2: number, c2: Capa,
    base: number, t1 = 0, t2 = 1, llavor = -1, guia = 0, e1: Extra = {}, e2: Extra = e1
  ) => {
    vertex(x1, y1, c1, t1, llavor, base, guia, e1);
    vertex(x2, y2, c2, t2, llavor, base, guia, e2);
  };

  /** Contorno cerrado de un poligono en una capa. */
  const contorn = (punts: [number, number][], capa: Capa, base: number, e: Extra = {}) => {
    for (let i = 0; i < punts.length; i++) {
      const [x1, y1] = punts[i];
      const [x2, y2] = punts[(i + 1) % punts.length];
      segment(x1, y1, capa, x2, y2, capa, base, 0, 1, -1, 0, e);
    }
  };

  const rect = (cx: number, cy: number, w: number, h: number, capa: Capa, base: number, e: Extra = {}) =>
    contorn([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], capa, base, e);

  /** Cuadrado con las esquinas achaflanadas; la primera, mas, que marca la patilla 1. */
  const xamfra = (m: number, c: number, capa: Capa, base: number, e: Extra = {}) =>
    contorn([[-m + c * 2, -m], [m - c, -m], [m, -m + c], [m, m - c], [m - c, m], [-m + c, m], [-m, m - c], [-m, -m + c * 2]], capa, base, e);

  /* --- Las piezas de siempre (portada y pelicula) --- */

  // Sustrato: la placa verde del procesador, con condensadores alrededor del silicio.
  xamfra(S, 0.12, CAPA.sustrato, 0.55);
  xamfra(S - 0.12, 0.1, CAPA.sustrato, 0.18);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 1.32 + (i % 2) * 0.12;
    const x = Math.cos(a) * r * 1.1;
    const y = Math.sin(a) * r * 0.9;
    const vertical = Math.abs(Math.cos(a)) > 0.7;
    rect(x, y, vertical ? 0.09 : 0.18, vertical ? 0.18 : 0.09, CAPA.sustrato, 0.45, { dir: [Math.cos(a) * 0.6, Math.sin(a) * 0.6] });
  }

  // Silicio: el nucleo, con ocho nucleos en dos filas y la cache en medio. En la pelicula cada
  // nucleo se aparta del centro (aDir).
  rect(0, 0, DW, DH, CAPA.silicio, 0.8);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 4; col++) {
      const cx = -DW / 2 + 0.24 + col * 0.41;
      const cy = fila === 0 ? -0.36 : 0.36;
      const dir = [cx / 0.85, cy / 0.6] as const;
      rect(cx, cy, 0.34, 0.4, CAPA.silicio, 0.5, { dir });
      rect(cx, cy + (fila === 0 ? -0.06 : 0.06), 0.18, 0.14, CAPA.silicio, 0.35, { dir });
    }
  }
  rect(0, 0, DW - 0.18, 0.2, CAPA.silicio, 0.45);
  for (let k = 0; k < 7; k++) {
    const x = -DW / 2 + 0.22 + k * 0.21;
    segment(x, -0.1, CAPA.silicio, x, 0.1, CAPA.silicio, 0.3);
  }

  // Tapa metalica: contorno con sus muescas y el triangulo de la patilla 1.
  xamfra(T, 0.18, CAPA.tapa, 0.7);
  xamfra(T - 0.14, 0.14, CAPA.tapa, 0.22);
  contorn([[-T + 0.25, -T + 0.45], [-T + 0.45, -T + 0.25], [-T + 0.25, -T + 0.25]], CAPA.tapa, 0.6);

  // Contorno de la capa de bolas, para que se lea como un plano.
  xamfra(S - 0.05, 0.1, CAPA.bolas, 0.28);

  // Guias de montaje entre esquinas, de la capa de bolas a la tapa.
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    segment(sx * (S - 0.3), sy * (S - 0.3), CAPA.bolas, sx * (T - 0.1), sy * (T - 0.1), CAPA.tapa, 0.5, 0, 1, -1, 1);
  }

  // Pistas: salen de los cuatro bordes del sustrato, rectas un tramo, giran 45 grados y
  // siguen hacia fuera, como el rutado de una placa alrededor de un zocalo. Las que no llevan
  // pulso en la portada reciben uno que solo se enciende en la pelicula (aFlux).
  const vies: number[] = [];
  for (let costat = 0; costat < 4; costat++) {
    for (let k = 0; k < PISTAS_POR_LADO; k++) {
      const u = (k / (PISTAS_POR_LADO - 1) - 0.5) * (S * 1.6);
      // Direccion hacia fuera y direccion a lo largo del borde, segun el lado.
      const [ox, oy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][costat];
      const [lx, ly] = [-oy, ox];
      const punts: [number, number][] = [];
      let x = ox * S + lx * u;
      let y = oy * S + ly * u;
      punts.push([x, y]);
      const recte = 0.35 + atzar() * 0.9;
      x += ox * recte;
      y += oy * recte;
      punts.push([x, y]);
      // Las del centro siguen rectas; las de los lados se abren en diagonal.
      const obrir = Math.sign(u) * (Math.abs(u) > 0.5 ? 1 : 0);
      const diag = 0.6 + atzar() * 1.8;
      x += (ox + lx * obrir) * diag;
      y += (oy + ly * obrir) * diag;
      punts.push([x, y]);
      const final = ALCANCE_PISTAS * (0.55 + atzar() * 0.45);
      x += ox * final;
      y += oy * final;
      punts.push([x, y]);

      let total = 0;
      for (let i = 1; i < punts.length; i++) total += Math.hypot(punts[i][0] - punts[i - 1][0], punts[i][1] - punts[i - 1][1]);
      const llavor = atzar() < 0.45 ? atzar() : -1;
      const flux = llavor < 0 ? 1 : 0;
      const llavorFinal = llavor < 0 ? nova() : llavor;
      let fet = 0;
      for (let i = 1; i < punts.length; i++) {
        const tram = Math.hypot(punts[i][0] - punts[i - 1][0], punts[i][1] - punts[i - 1][1]);
        segment(punts[i - 1][0], punts[i - 1][1], CAPA.pistas, punts[i][0], punts[i][1], CAPA.pistas, 0.36,
          fet / total, (fet + tram) / total, llavorFinal, 0, { flux });
        fet += tram;
      }
      // Via en el codo, donde la pista cambia de direccion.
      vies.push(punts[2][0], punts[2][1], 0);
    }
  }

  /* --- Piezas nuevas: solo en la pelicula --- */

  const NOU = { nou: 1 } as const;

  // Condensadores SMD a lo largo de los cuatro bordes del sustrato, con sus dos terminales.
  for (let costat = 0; costat < 4; costat++) {
    const [ox, oy] = [[1, 0], [0, 1], [-1, 0], [0, -1]][costat];
    for (const u of [-1.2, -0.6, 0, 0.6, 1.2]) {
      const desp = u + (nova() - 0.5) * 0.12;
      const cx = ox * 1.78 + oy * desp;
      const cy = oy * 1.78 + ox * desp;
      const llarg = ox !== 0; // en los lados verticales el condensador va en vertical
      const w = llarg ? 0.1 : 0.2;
      const h = llarg ? 0.2 : 0.1;
      const e = { ...NOU, dir: [ox, oy] as const };
      rect(cx, cy, w, h, CAPA.sustrato, 0.42, e);
      if (llarg) {
        segment(cx - w / 2, cy - 0.06, CAPA.sustrato, cx + w / 2, cy - 0.06, CAPA.sustrato, 0.42, 0, 1, -1, 0, e);
        segment(cx - w / 2, cy + 0.06, CAPA.sustrato, cx + w / 2, cy + 0.06, CAPA.sustrato, 0.42, 0, 1, -1, 0, e);
      } else {
        segment(cx - 0.06, cy - h / 2, CAPA.sustrato, cx - 0.06, cy + h / 2, CAPA.sustrato, 0.42, 0, 1, -1, 0, e);
        segment(cx + 0.06, cy - h / 2, CAPA.sustrato, cx + 0.06, cy + h / 2, CAPA.sustrato, 0.42, 0, 1, -1, 0, e);
      }
    }
  }

  // El silicio en bloques: controlador de memoria debajo de los nucleos y grafica a su lado.
  const IMC = { ...NOU, dir: [0, -1] as const };
  rect(0, -0.885, 1.2, 0.3, CAPA.silicio, 0.65, IMC);
  for (let k = 0; k < 6; k++) {
    const x = -0.5 + k * 0.2;
    segment(x, -0.98, CAPA.silicio, x, -0.79, CAPA.silicio, 0.32, 0, 1, -1, 0, IMC);
  }
  const GPU = { ...NOU, dir: [1, 0] as const };
  rect(1.2, 0, 0.48, 1.1, CAPA.silicio, 0.65, GPU);
  for (let fila = 0; fila < 5; fila++) {
    for (let col = 0; col < 2; col++) rect(1.09 + col * 0.22, -0.4 + fila * 0.2, 0.16, 0.13, CAPA.silicio, 0.3, GPU);
  }

  // Capas de metal sobre el silicio: tres planos de pistas internas, cada uno en otra direccion,
  // y las vias que los unen. Con la altura del grupo se separan entre ellos (aNivell).
  const capes = [
    { nivell: 1, dz: 0, linies: 9, vertical: false },
    { nivell: 1.8, dz: 0.008, linies: 11, vertical: true },
    { nivell: 2.6, dz: 0.016, linies: 5, vertical: false }
  ];
  for (const c of capes) {
    const e = { ...NOU, nivell: c.nivell, dz: c.dz };
    rect(0, 0, DW, DH, CAPA.metal, 0.5, e);
    for (let k = 0; k < c.linies; k++) {
      const f = (k + 1) / (c.linies + 1);
      if (c.vertical) {
        const x = -DW / 2 + f * DW;
        segment(x, -DH / 2 + 0.06, CAPA.metal, x, DH / 2 - 0.06, CAPA.metal, 0.26, 0, 1, -1, 0, e);
      } else {
        const y = -DH / 2 + f * DH;
        segment(-DW / 2 + 0.06, y, CAPA.metal, DW / 2 - 0.06, y, CAPA.metal, 0.26, 0, 1, -1, 0, e);
      }
    }
  }
  for (const [x, y] of [[-0.6, -0.4], [0.2, -0.4], [0.7, 0.3], [-0.3, 0.35], [0.5, -0.1], [-0.75, 0.1]]) {
    segment(x, y, CAPA.metal, x, y, CAPA.metal, 0.45, 0, 1, -1, 1, { ...NOU, nivell: 1 }, { ...NOU, nivell: 2.6, dz: 0.016 });
  }

  // Pasta termica: una mancha irregular sobre el silicio, con su borde interior.
  const MANCHA = 40;
  const mancha: [number, number][] = [];
  const interior: [number, number][] = [];
  for (let i = 0; i < MANCHA; i++) {
    const a = (i / MANCHA) * Math.PI * 2;
    const r = 1 + 0.07 * Math.sin(3 * a + 1.3) + 0.05 * Math.sin(5 * a + 0.4);
    mancha.push([Math.cos(a) * 0.95 * r, Math.sin(a) * 0.72 * r]);
    interior.push([Math.cos(a) * 0.62 * r, Math.sin(a) * 0.46 * r]);
  }
  contorn(mancha, CAPA.pasta, 0.5, NOU);
  contorn(interior, CAPA.pasta, 0.22, NOU);

  // Escudo: una malla hexagonal bajo la tapa y, en medio, un escudo con su cerradura.
  const R = 0.17;
  const fet = new Set<string>();
  const vores: [number, number, number, number][] = [];
  for (let col = -9; col <= 9; col++) {
    for (let fila = -8; fila <= 8; fila++) {
      const cx = col * R * 1.5;
      const cy = fila * R * Math.sqrt(3) + (col % 2 ? (R * Math.sqrt(3)) / 2 : 0);
      if (Math.abs(cx) > 1.22 || Math.abs(cy) > 1.22) continue;
      for (let k = 0; k < 6; k++) {
        const a1 = (k * Math.PI) / 3;
        const a2 = ((k + 1) * Math.PI) / 3;
        const x1 = cx + R * Math.cos(a1);
        const y1 = cy + R * Math.sin(a1);
        const x2 = cx + R * Math.cos(a2);
        const y2 = cy + R * Math.sin(a2);
        // Cada lado compartido se dibuja una sola vez.
        const clau = [Math.round((x1 + x2) * 500), Math.round((y1 + y2) * 500)].join(",");
        if (fet.has(clau)) continue;
        fet.add(clau);
        vores.push([x1, y1, x2, y2]);
      }
    }
  }
  for (const [x1, y1, x2, y2] of vores) segment(x1, y1, CAPA.escudo, x2, y2, CAPA.escudo, 0.3, 0, 1, -1, 0, NOU);
  const escut: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    escut.push([0.42 * Math.sin(t * Math.PI * 0.5) * (1 - 0.15 * t), 0.5 - t * 1.05]);
  }
  const silueta: [number, number][] = [[0, 0.58], ...escut, ...escut.slice(0, -1).reverse().map(([x, y]) => [-x, y] as [number, number])];
  contorn(silueta, CAPA.escudo, 0.75, NOU);
  const pany: [number, number][] = [];
  for (let i = 0; i < 12; i++) pany.push([0.1 * Math.cos((i / 12) * Math.PI * 2), 0.1 + 0.1 * Math.sin((i / 12) * Math.PI * 2)]);
  contorn(pany, CAPA.escudo, 0.75, NOU);
  segment(0, 0, CAPA.escudo, 0, -0.22, CAPA.escudo, 0.75, 0, 1, -1, 0, NOU);

  // Marcado de la tapa: un recuadro y tres lineas, como el texto grabado de un procesador.
  rect(0.25, 0.35, 0.9, 0.42, CAPA.tapa, 0.3, NOU);
  for (let k = 0; k < 3; k++) segment(-0.1, 0.24 + k * 0.11, CAPA.tapa, 0.6 - k * 0.12, 0.24 + k * 0.11, CAPA.tapa, 0.3, 0, 1, -1, 0, NOU);

  // Mas guias de montaje, entre cada par de capas, para leer el plano explotado.
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    segment(sx * (S - 0.3), sy * (S - 0.3), CAPA.bolas, sx * (S - 0.3), sy * (S - 0.3), CAPA.sustrato, 0.45, 0, 1, -1, 1, NOU);
    segment(sx * (DW / 2), sy * (DH / 2), CAPA.sustrato, sx * (DW / 2), sy * (DH / 2), CAPA.silicio, 0.45, 0, 1, -1, 1, NOU);
    segment(sx * (DW / 2), sy * (DH / 2), CAPA.silicio, sx * (DW / 2), sy * (DH / 2), CAPA.metal, 0.4, 0, 1, -1, 1, NOU, { ...NOU, nivell: 2.6, dz: 0.016 });
    segment(sx * 1.2, sy * 1.2, CAPA.escudo, sx * 1.2, sy * 1.2, CAPA.tapa, 0.4, 0, 1, -1, 1, NOU);
  }

  const linies = new BufferGeometry();
  linies.setAttribute("position", new Float32BufferAttribute(L.p, 3));
  linies.setAttribute("aCapa", new Float32BufferAttribute(L.capa, 1));
  linies.setAttribute("aGrup", new Float32BufferAttribute(L.grup, 1));
  linies.setAttribute("aNivell", new Float32BufferAttribute(L.nivell, 1));
  linies.setAttribute("aDir", new Float32BufferAttribute(L.dir, 2));
  linies.setAttribute("aNou", new Float32BufferAttribute(L.nou, 1));
  linies.setAttribute("aFlux", new Float32BufferAttribute(L.flux, 1));
  linies.setAttribute("aT", new Float32BufferAttribute(L.t, 1));
  linies.setAttribute("aLlavor", new Float32BufferAttribute(L.llavor, 1));
  linies.setAttribute("aBase", new Float32BufferAttribute(L.base, 1));
  linies.setAttribute("aGuia", new Float32BufferAttribute(L.guia, 1));

  // Puntos: la rejilla de bolas de soldadura por debajo, las vias de las pistas y, en la
  // pelicula, las pistas de contacto de las bolas en el sustrato y los grumos de la pasta.
  const P = { p: [] as number[], capa: [] as number[], grup: [] as number[], nivell: [] as number[], dir: [] as number[],
    nou: [] as number[], mida: [] as number[], base: [] as number[] };
  const punt = (x: number, y: number, c: Capa, mida: number, base: number, e: Extra = {}) => {
    P.p.push(x, y, c.z);
    P.capa.push(c.sep);
    P.grup.push(c.grup);
    P.nivell.push(e.nivell ?? 1);
    P.dir.push(e.dir?.[0] ?? 0, e.dir?.[1] ?? 0);
    P.nou.push(e.nou ?? 0);
    P.mida.push(mida);
    P.base.push(base);
  };
  const N = 15;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = (i / (N - 1) - 0.5) * (S * 1.7);
      const y = (j / (N - 1) - 0.5) * (S * 1.7);
      // Sin bolas en el centro, como en los encapsulados de verdad.
      if (Math.abs(x) < 0.55 && Math.abs(y) < 0.55) continue;
      punt(x, y, CAPA.bolas, 1, 0.55, { dir: [x / S, y / S] });
      punt(x, y, CAPA.sustrato, 0.6, 0.35, NOU);
    }
  }
  for (let i = 0; i < vies.length; i += 3) punt(vies[i], vies[i + 1], CAPA.pistas, 1.5, 0.5);
  for (let i = 0; i < 46; i++) {
    const a = nova() * Math.PI * 2;
    const r = Math.sqrt(nova()) * 0.85;
    punt(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.72, CAPA.pasta, 0.7, 0.4, NOU);
  }

  const punts = new BufferGeometry();
  punts.setAttribute("position", new Float32BufferAttribute(P.p, 3));
  punts.setAttribute("aCapa", new Float32BufferAttribute(P.capa, 1));
  punts.setAttribute("aGrup", new Float32BufferAttribute(P.grup, 1));
  punts.setAttribute("aNivell", new Float32BufferAttribute(P.nivell, 1));
  punts.setAttribute("aDir", new Float32BufferAttribute(P.dir, 2));
  punts.setAttribute("aNou", new Float32BufferAttribute(P.nou, 1));
  punts.setAttribute("aMida", new Float32BufferAttribute(P.mida, 1));
  punts.setAttribute("aBase", new Float32BufferAttribute(P.base, 1));

  // El resplandor comparte los atributos de las lineas: solo anade el desplazamiento de cada copia.
  const halo = new InstancedBufferGeometry();
  for (const nom of Object.keys(linies.attributes)) halo.setAttribute(nom, linies.getAttribute(nom));
  const desp: number[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + (k % 2) * 0.2;
    const r = k % 2 ? 2.4 : 1.2;
    desp.push(Math.cos(a) * r, Math.sin(a) * r);
  }
  halo.setAttribute("aDesp", new InstancedBufferAttribute(new Float32Array(desp), 2));
  halo.instanceCount = 8;

  return { linies, punts, halo };
}

/** Muelle con inercia: acelera hacia el destino y frena, no interpola en linea recta. */
type Moll = { valor: number; vel: number };
function empenyer(m: Moll, desti: number, dt: number, rigidesa = 34) {
  const fre = 2 * Math.sqrt(rigidesa) * 0.82;
  m.vel += ((desti - m.valor) * rigidesa - m.vel * fre) * dt;
  m.valor += m.vel * dt;
}

// La mascara apaga el chip hacia los bordes para que el texto nunca compita con el fondo. Su
// centro (--mx, --my) lo escribe situar(): el retrato en la portada y el chip en la pelicula,
// donde ademas la elipse se cierra (--rx, --ry) al llegar el chip a su sitio.
const MASCARA =
  "radial-gradient(ellipse 62% 90% at var(--mx, 78%) var(--my, 48%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)";
const MASCARA_PELICULA =
  "radial-gradient(ellipse var(--rx, 62%) var(--ry, 90%) at var(--mx, 50%) var(--my, 50%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)";

// Las etiquetas: texto pequeño en el acento, con un punto en la pieza y una linea con codo.
const ESTIL_ROTOL = {
  position: "absolute",
  top: 0,
  left: 0,
  opacity: 0,
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "16px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8CD9E4",
  textShadow: "0 0 10px #0C0C0C, 0 0 3px #0C0C0C",
  willChange: "transform, opacity"
} as const;

type Props = {
  onFalla: () => void;
  /** Pelicula: el retrato del que sale el chip. Sin el, se busca la primera <img> de la seccion. */
  ancla?: RefObject<HTMLElement | null>;
  /** Pelicula: q, la portada saliendo por arriba (0 a 1). */
  sortida?: MotionValue<number>;
  /** Pelicula: p, el recorrido de la historia fijada (0 a 1). Con el se enciende el modo. */
  progres?: MotionValue<number>;
};

export default function Escena({ onFalla, ancla, sortida, progres }: Props) {
  const quiet = useReducedMotion();
  const { idioma } = useIdioma();
  const llenc = useRef<HTMLCanvasElement>(null);
  const rotols = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = llenc.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      // Sin contexto no hay escena: la portada se queda con el fondo estatico.
      onFalla();
      return;
    }
    // Un shader que esta grafica no sabe compilar tampoco deja un hueco: se vuelve al fondo.
    renderer.debug.onShaderError = () => onFalla();

    const tope = () => Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(tope());
    renderer.setClearAlpha(0);

    const color = accent();
    const uniformes = {
      uTemps: { value: 0 },
      uForca: { value: 1 },
      uSep: { value: SEPARACION_REPOSO },
      uRafaga: { value: 0 },
      uColor: { value: color },
      uPols: { value: color.clone().lerp(new Color(1, 1, 1), 0.6) },
      uPunt: { value: 26 * tope() },
      // Despiece de la pelicula. Fuera de ella se quedan asi y no cambian nada.
      uAltA: { value: new Vector4(0, 0, 0, 0) },
      uAltB: { value: new Vector4(0, 0, 0, 0) },
      uObreA: { value: new Vector4(0, 0, 0, 0) },
      uObreB: { value: new Vector4(0, 0, 0, 0) },
      uPesA: { value: new Vector4(1, 1, 1, 1) },
      uPesB: { value: new Vector4(1, 1, 1, 1) },
      uNou: { value: 0 },
      uCentre: { value: 0 },
      uFlux: { value: 0 },
      uGuies: { value: 0 },
      uBrill: { value: 0 },
      uHalo: { value: 0.16 },
      uPx: { value: new Vector2(0, 0) }
    };

    const geo = construir();
    const comu = { uniforms: uniformes, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending };
    const matLinies = new ShaderMaterial({ ...comu, vertexShader: VS_LINIES, fragmentShader: FS_LINIES });
    const matPunts = new ShaderMaterial({ ...comu, vertexShader: VS_PUNTS, fragmentShader: FS_PUNTS });
    const matHalo = new ShaderMaterial({ ...comu, vertexShader: VS_HALO, fragmentShader: FS_HALO });

    const escena = new Scene();
    const suport = new Group();   // posicion y giro del cursor
    const chip = new Group();     // inclinacion fija del chip
    const halo = new LineSegments(geo.halo, matHalo);
    // El resplandor solo existe en la pelicula: en la portada no se dibuja ni una vez.
    halo.visible = !!progres;
    halo.frustumCulled = false;
    chip.add(halo);
    chip.add(new LineSegments(geo.linies, matLinies));
    chip.add(new Points(geo.punts, matPunts));
    chip.rotation.set(INCLINACION, 0, GIRO);
    suport.add(chip);
    escena.add(suport);

    const camera = new PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(0, 0, CAMERA_Z);

    const dimensionar = () => {
      const caixa = canvas.getBoundingClientRect();
      const ample = Math.max(1, Math.round(caixa.width));
      const alt = Math.max(1, Math.round(caixa.height));
      camera.aspect = ample / alt;
      camera.updateProjectionMatrix();
      renderer.setSize(ample, alt, false);
      uniformes.uPx.value.set(2 / ample, 2 / alt);
      situar();
    };

    /** Coloca el chip detras del retrato de la portada y lo escala a su medida. */
    const enSeccio = canvas.closest("section")?.querySelector("img");
    const retrat = () => ancla?.current ?? enSeccio;
    let maskX = "";
    let maskY = "";
    let maskRx = "";
    let maskRy = "";
    let qSituada = -1;
    // En la pelicula la escala que da situar() es la base; la camara la multiplica en cada fotograma.
    let escalaBase = 1;

    const mascara = (mx: string, my: string) => {
      // Solo se escribe si cambia, para no repintar la mascara en cada fotograma.
      if (mx !== maskX) canvas.style.setProperty("--mx", (maskX = mx));
      if (my !== maskY) canvas.style.setProperty("--my", (maskY = my));
    };

    /** Pelicula: el ancla va de donde esta el retrato con la pagina arriba al 62 % / 50 % de la
     *  capa, y el lado del chip, de 2,1 veces el retrato a min(58svh, 40vw), interpolado en
     *  logaritmo para que encoja igual de suave al principio que al final. El chip no sube con
     *  el scroll: se queda y se desliza mientras el retrato se va y lo deja a la vista. */
    const situarPelicula = (caixa: DOMRect, perPixel: number) => {
      const q = sortida ? sortida.get() : 1;
      qSituada = q;
      const s = suau(q);
      const fx = caixa.left + caixa.width * VIAJE.ancla[0];
      const fy = caixa.top + caixa.height * VIAJE.ancla[1];
      const ladoFinal = Math.max(1, Math.min(VIAJE.lado.svh * window.innerHeight, VIAJE.lado.vw * window.innerWidth));
      let x0 = fx;
      let y0 = fy;
      let lado0 = ladoFinal;
      const foto = retrat()?.getBoundingClientRect();
      if (foto && foto.width > 0) {
        // Se le suma lo que ha subido la pagina: es su sitio con el scroll arriba (con el iman).
        x0 = foto.left + foto.width / 2;
        y0 = foto.top + foto.height / 2 + window.scrollY;
        lado0 = foto.width * MIDA_RESPECTE_FOTO;
      }
      const x = x0 + (fx - x0) * s;
      const y = y0 + (fy - y0) * s;
      const lado = Math.exp(Math.log(lado0) + (Math.log(ladoFinal) - Math.log(lado0)) * s);
      const cx = x - (caixa.left + caixa.width / 2);
      const cy = y - (caixa.top + caixa.height / 2);
      suport.position.set(cx * perPixel, -cy * perPixel, 0);
      escalaBase = (lado * perPixel) / 2.1 / 2;
      chip.scale.setScalar(escalaBase);

      mascara(
        `${(((x - caixa.left) / caixa.width) * 100).toFixed(1)}%`,
        `${(((y - caixa.top) / caixa.height) * 100).toFixed(1)}%`
      );
      const { desde, hasta } = VIAJE.mascara;
      const rx = `${(desde[0] + (hasta[0] - desde[0]) * s).toFixed(1)}%`;
      const ry = `${(desde[1] + (hasta[1] - desde[1]) * s).toFixed(1)}%`;
      if (rx !== maskRx) canvas.style.setProperty("--rx", (maskRx = rx));
      if (ry !== maskRy) canvas.style.setProperty("--ry", (maskRy = ry));
    };

    const situar = () => {
      const caixa = canvas.getBoundingClientRect();
      // Unidades de escena por pixel en el plano z = 0.
      const perPixel = (2 * Math.tan((camera.fov * Math.PI) / 360) * CAMERA_Z) / Math.max(1, caixa.height);
      if (progres) {
        situarPelicula(caixa, perPixel);
        return;
      }
      const foto = retrat()?.getBoundingClientRect();
      if (!foto || foto.width === 0) {
        suport.position.set(2.2, 0, 0);
        return;
      }
      const cx = foto.left + foto.width / 2 - (caixa.left + caixa.width / 2);
      const cy = foto.top + foto.height / 2 - (caixa.top + caixa.height / 2);
      suport.position.set(cx * perPixel, -cy * perPixel, 0);
      chip.scale.setScalar((foto.width * perPixel * MIDA_RESPECTE_FOTO) / 2.1 / 2);

      // La mascara del lienzo se centra en el retrato. Antes era un 78 % / 48 % fijo, que era
      // donde caia el retrato; con el retrato en la columna central el chip se quedaba casi
      // apagado.
      mascara(
        `${(((caixa.width / 2 + cx) / caixa.width) * 100).toFixed(1)}%`,
        `${(((caixa.height / 2 + cy) / caixa.height) * 100).toFixed(1)}%`
      );
    };

    const alliberar = () => {
      geo.linies.dispose();
      geo.punts.dispose();
      geo.halo.dispose();
      matLinies.dispose();
      matPunts.dispose();
      matHalo.dispose();
      renderer.dispose();
    };

    try {
      dimensionar();
    } catch {
      alliberar();
      onFalla();
      return;
    }

    // Con movimiento reducido: un fotograma, algo despiezado para que se entienda, y ya.
    if (quiet) {
      uniformes.uSep.value = 0.6;
      renderer.render(escena, camera);
      const remesurar = () => {
        dimensionar();
        renderer.render(escena, camera);
      };
      window.addEventListener("resize", remesurar);
      return () => {
        window.removeEventListener("resize", remesurar);
        alliberar();
      };
    }

    const girX: Moll = { valor: 0, vel: 0 };
    const girY: Moll = { valor: 0, vel: 0 };
    const obrir: Moll = { valor: SEPARACION_REPOSO, vel: 0 };
    const baixada: Moll = { valor: 0, vel: 0 };
    let destiX = 0;
    let destiY = 0;
    let destiObrir = SEPARACION_REPOSO;
    let destiBaixada = 0;
    let rafaga = 0;
    const centre = new Vector3();

    // Estado de la pelicula. Todo sale de q y p con funciones continuas: el despiece comun va de
    // 0,22 a 0,36 durante el viaje y luego sigue SEP; el del puntero se apaga con curva entre q = 0
    // y 0,3, igual que la inclinacion baja a la mitad; cada grupo sigue sus tablas.
    let punterX = 0;
    let punterY = 0;
    let punterDins = false;
    let inclina = 1;
    let brillo = 1;
    let pAnterior = progres ? progres.get() : 0;
    let rafagaArmada = pAnterior < RAFAGA.en;
    const alt8 = [0, 0, 0, 0, 0, 0, 0, 0];
    const obre8 = [0, 0, 0, 0, 0, 0, 0, 0];
    const objectiu8 = [0, 0, 0, 0, 0, 0, 0, 0];
    const pes8 = [1, 1, 1, 1, 1, 1, 1, 1];
    if (progres) tramos8(PESOS, progres.get(), pes8);
    let camVolta = 0;
    let camInclina = 0;
    let camAcerca = 1;

    const pelicula = (dt: number) => {
      if (!progres) return;
      const q = sortida ? sortida.get() : 1;
      const p = progres.get();
      const enHistoria = q >= 1;
      const viatge = ventana(q, 0, VIAJE.puntero);

      // La cercania del raton se mide en cada fotograma: el chip se mueve aunque el raton no.
      let punter = 0;
      if (punterDins && viatge < 1) {
        const c = centrePantalla();
        const f = Math.max(0, 1 - Math.hypot(punterX - c.x, punterY - c.y) / RADIO_CERCA);
        punter = f * f * (1 - SEPARACION_REPOSO) * (1 - viatge);
      }
      const base = enHistoria ? tramos(SEP, p) : SEPARACION_REPOSO + (SEP[0][1] - SEPARACION_REPOSO) * suau(q);
      destiObrir = Math.min(1, base + punter);
      inclina = 1 - (1 - VIAJE.inclinacion) * viatge;
      brillo = forca(p);

      // Los ocho grupos: altura, apertura y brillo segun p. En la portada p vale 0 y todo esta en
      // su primera fila; las piezas nuevas entran poco a poco durante el viaje.
      tramos8(ALTURA, p, alt8);
      tramos8(OBERTURA, p, obre8);
      tramos8(PESOS, p, objectiu8);
      const k = 1 - Math.exp((-3000 * dt) / PESOS_MS);
      for (let g = 0; g < 8; g++) pes8[g] += (objectiu8[g] - pes8[g]) * k;
      uniformes.uAltA.value.set(alt8[0], alt8[1], alt8[2], alt8[3]);
      uniformes.uAltB.value.set(alt8[4], alt8[5], alt8[6], alt8[7]);
      uniformes.uObreA.value.set(obre8[0], obre8[1], obre8[2], obre8[3]);
      uniformes.uObreB.value.set(obre8[4], obre8[5], obre8[6], obre8[7]);
      uniformes.uPesA.value.set(pes8[0], pes8[1], pes8[2], pes8[3]);
      uniformes.uPesB.value.set(pes8[4], pes8[5], pes8[6], pes8[7]);
      uniformes.uNou.value = ventana(q, 0.15, 0.85);
      uniformes.uBrill.value = tramos(BRILLO, p);
      uniformes.uFlux.value = tramos(FLUJO, p);
      uniformes.uGuies.value = tramos(GUIAS, p);
      uniformes.uCentre.value = tramos(CENTRO_PILA, p);
      camVolta = tramos(VUELTA, p);
      camInclina = tramos(INCLINA, p);
      camAcerca = tramos(ACERCA, p);

      // El remate: al montarse el chip sale una rafaga por todas las pistas, una vez al pasar
      // bajando, y se rearma al volver por debajo (rondar el umbral no la dispara en bucle).
      if (rafagaArmada && pAnterior < RAFAGA.en && p >= RAFAGA.en) {
        rafaga = 1;
        rafagaArmada = false;
      } else if (!rafagaArmada && p < RAFAGA.en - RAFAGA.histeresis) {
        rafagaArmada = true;
      }
      pAnterior = p;
    };

    /* --- Etiquetas (solo pelicula) --- */
    const capaRotols = rotols.current;
    const grups = capaRotols ? [...capaRotols.querySelectorAll<SVGGElement>("g[data-rotol]")] : [];
    const textos = capaRotols ? [...capaRotols.querySelectorAll<HTMLSpanElement>("span[data-rotol]")] : [];
    const capes8 = Object.values(CAPA);
    const v = new Vector3();
    const visibles: { i: number; ax: number; ay: number; o: number; ty: number; w: number }[] = [];
    const opacitats = ROTOLS.map(() => -1);

    const etiquetes = () => {
      if (!progres || !capaRotols || !grups.length) return;
      const p = progres.get();
      const caixa = canvas.getBoundingClientRect();
      const w = caixa.width;
      const h = caixa.height;
      visibles.length = 0;
      for (let i = 0; i < ROTOLS.length; i++) {
        const r = ROTOLS[i];
        const [a, b, c, d] = FINESTRA[r.capitol];
        const o = ventana(p, a, b) * (1 - ventana(p, c, d));
        if (o < 0.01) {
          if (opacitats[i] !== 0) {
            opacitats[i] = 0;
            grups[i].setAttribute("opacity", "0");
            textos[i].style.opacity = "0";
          }
          continue;
        }
        // El mismo despiece que el shader le aplica a su grupo.
        const capa = capes8[r.grup];
        const dir = r.dir ?? [0, 0];
        const nivell = r.nivell ?? 1;
        v.set(
          r.punt[0] + dir[0] * obre8[r.grup],
          r.punt[1] + dir[1] * obre8[r.grup],
          capa.z + capa.sep * uniformes.uSep.value + nivell * alt8[r.grup] - uniformes.uCentre.value
        );
        v.applyMatrix4(chip.matrixWorld).project(camera);
        visibles.push({ i, ax: ((v.x + 1) / 2) * w, ay: ((1 - v.y) / 2) * h, o, ty: 0, w: textos[i].offsetWidth });
      }
      if (!visibles.length) return;
      // Columna de texto a la derecha, con el margen de la pagina; en vertical, en el orden de
      // sus piezas, con 30 px entre una y otra y lejos del rail de abajo.
      const marge = Math.max(24, Math.min(112, 0.034 * window.innerWidth));
      const dalt = 72;
      const baix = h - 150;
      visibles.sort((x, y) => x.ay - y.ay);
      let anterior = -Infinity;
      for (const e of visibles) {
        e.ty = Math.max(e.ay, anterior + 30, dalt);
        anterior = e.ty;
      }
      const sobra = visibles[visibles.length - 1].ty - baix;
      if (sobra > 0) for (const e of visibles) e.ty = Math.max(dalt, e.ty - sobra);
      for (const e of visibles) {
        const xText = w - marge - e.w;
        const colze = Math.min(xText - 28, Math.max(e.ax + 16, xText - 120));
        const g = grups[e.i];
        g.setAttribute("opacity", e.o.toFixed(3));
        g.firstElementChild?.setAttribute(
          "d",
          `M${e.ax.toFixed(1)} ${e.ay.toFixed(1)}H${colze.toFixed(1)}L${(xText - 8).toFixed(1)} ${e.ty.toFixed(1)}`
        );
        const [anell, nucli] = [g.children[1], g.children[2]];
        anell.setAttribute("cx", e.ax.toFixed(1));
        anell.setAttribute("cy", e.ay.toFixed(1));
        nucli.setAttribute("cx", e.ax.toFixed(1));
        nucli.setAttribute("cy", e.ay.toFixed(1));
        const t = textos[e.i];
        t.style.transform = `translate(${xText.toFixed(1)}px, ${(e.ty - 8).toFixed(1)}px)`;
        t.style.opacity = e.o.toFixed(3);
        opacitats[e.i] = e.o;
      }
    };

    let rid = 0;
    let anterior = 0;
    let rellotge = 0;
    let viu = true;
    let mitjana = 16.7;
    let mostres = 0;
    let rebaixat = false;

    const pas = (marca: number) => {
      let dt = anterior ? (marca - anterior) / 1000 : 1 / 60;
      anterior = marca;
      if (!(dt > 0) || dt > 0.25) dt = 1 / 60;

      // Si el equipo no llega, se baja la densidad de pixeles una vez y ya.
      mitjana += (dt * 1000 - mitjana) * 0.05;
      mostres += 1;
      if (!rebaixat && mostres > 120 && mitjana > 26) {
        rebaixat = true;
        renderer.setPixelRatio(1);
        uniformes.uPunt.value = 26;
        dimensionar();
      }

      rellotge += dt;
      pelicula(dt);
      empenyer(girX, destiX * inclina, dt);
      empenyer(girY, destiY * inclina, dt);
      empenyer(obrir, destiObrir, dt, 18);
      empenyer(baixada, destiBaixada, dt, 22);
      rafaga = Math.max(0, rafaga - dt * 0.9);

      uniformes.uTemps.value = rellotge;
      uniformes.uSep.value = Math.max(0, obrir.valor + Math.sin(rellotge * 0.8) * 0.04);
      uniformes.uRafaga.value = rafaga;
      uniformes.uForca.value = progres ? brillo : 1 - baixada.valor * 0.6;
      // Deriva lenta para que no se quede quieto si nadie toca el raton.
      suport.rotation.y = girX.valor * 0.5 + Math.sin(rellotge * 0.13) * 0.08;
      suport.rotation.x = girY.valor * 0.35;
      chip.rotation.z = GIRO + Math.sin(rellotge * 0.09) * 0.05 + camVolta;
      camera.position.z = CAMERA_Z + baixada.valor * 3;
      // La foto se mueve con el iman y con el scroll: el chip la sigue. En la pelicula el
      // lienzo esta fijado y la foto sube con la pagina, asi que durante el viaje se recoloca
      // en cada fotograma; si no, el chip se quedaria atras.
      if (progres) {
        const q = sortida ? sortida.get() : 1;
        if (q < 1 || q !== qSituada || mostres % 10 === 0) situar();
        // La camara de la pelicula: inclinacion y cercania segun p.
        chip.rotation.x = INCLINACION + camInclina;
        chip.scale.setScalar(escalaBase * camAcerca);
      } else if (mostres % 10 === 0) {
        situar();
      }
      renderer.render(escena, camera);
      etiquetes();
    };

    const parar = () => {
      if (rid) window.cancelAnimationFrame(rid);
      rid = 0;
    };

    const bucle = (marca: number) => {
      rid = 0;
      try {
        pas(marca);
      } catch {
        // Un fallo dentro del bucle no deja la escena a medias: se para y se vuelve al fondo.
        parar();
        viu = false;
        onFalla();
        return;
      }
      if (viu && !document.hidden) rid = window.requestAnimationFrame(bucle);
    };

    const arrancar = () => {
      if (rid || !viu || document.hidden) return;
      anterior = 0;
      rid = window.requestAnimationFrame(bucle);
    };

    /** Donde cae el centro del chip en la pantalla, en px. */
    const centrePantalla = () => {
      const caixa = canvas.getBoundingClientRect();
      suport.getWorldPosition(centre);
      centre.project(camera);
      return { x: caixa.left + (centre.x + 1) / 2 * caixa.width, y: caixa.top + (1 - centre.y) / 2 * caixa.height };
    };

    const moure = (event: PointerEvent) => {
      destiX = event.clientX / window.innerWidth - 0.5;
      destiY = event.clientY / window.innerHeight - 0.5;
      if (progres) {
        // En la pelicula la cercania se calcula en el bucle (ver pelicula()).
        punterX = event.clientX;
        punterY = event.clientY;
        punterDins = true;
        return;
      }
      // Cuanto mas cerca del chip, mas se despieza.
      const c = centrePantalla();
      const d = Math.hypot(event.clientX - c.x, event.clientY - c.y);
      const f = Math.max(0, 1 - d / RADIO_CERCA);
      destiObrir = SEPARACION_REPOSO + f * f * (1 - SEPARACION_REPOSO);
    };

    // La rafaga del clic es cosa de la portada. En la pelicula el lienzo cubre la ventana
    // entera, asi que se mira la seccion del retrato y no el lienzo.
    const zonaClic = progres ? (retrat()?.closest("section") ?? canvas) : canvas;

    const pulsar = (event: PointerEvent) => {
      const caixa = zonaClic.getBoundingClientRect();
      if (event.clientY < caixa.top || event.clientY > caixa.bottom) return;
      rafaga = 1;
      obrir.vel += 2.5;
    };

    const sortir = (event: MouseEvent) => {
      if (event.relatedTarget) return;
      if (progres) punterDins = false;
      else destiObrir = SEPARACION_REPOSO;
    };

    // En la pelicula no se usa: ahi el brillo y la distancia los marca p, no el scroll bruto.
    const baixar = () => {
      if (progres) return;
      destiBaixada = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    };

    const remesurar = () => {
      dimensionar();
      baixar();
    };

    // Fuera de pantalla no se pinta: la escena solo vive mientras se ve la portada (o, en la
    // pelicula, mientras la capa fijada sigue en pantalla).
    const vigilant = new IntersectionObserver(
      ([entrada]) => {
        viu = entrada.isIntersecting;
        if (viu) arrancar();
        else parar();
      },
      { threshold: 0 }
    );
    vigilant.observe(canvas);

    const visibilitat = () => (document.hidden ? parar() : arrancar());

    // Si el navegador se queda sin contexto se deja el fondo estatico en su sitio.
    const perdut = (event: Event) => {
      event.preventDefault();
      parar();
      onFalla();
    };

    window.addEventListener("pointermove", moure, { passive: true });
    window.addEventListener("pointerdown", pulsar, { passive: true });
    window.addEventListener("mouseout", sortir);
    window.addEventListener("scroll", baixar, { passive: true });
    window.addEventListener("resize", remesurar);
    document.addEventListener("visibilitychange", visibilitat);
    canvas.addEventListener("webglcontextlost", perdut);
    baixar();
    arrancar();

    return () => {
      parar();
      vigilant.disconnect();
      window.removeEventListener("pointermove", moure);
      window.removeEventListener("pointerdown", pulsar);
      window.removeEventListener("mouseout", sortir);
      window.removeEventListener("scroll", baixar);
      window.removeEventListener("resize", remesurar);
      document.removeEventListener("visibilitychange", visibilitat);
      canvas.removeEventListener("webglcontextlost", perdut);
      alliberar();
    };
  }, [quiet, onFalla, ancla, sortida, progres]);

  const mascara = progres ? MASCARA_PELICULA : MASCARA;
  const noms = NOMS[idioma];
  return (
    <>
      <canvas
        ref={llenc}
        aria-hidden
        className="pointer-events-none size-full"
        style={{ maskImage: mascara, WebkitMaskImage: mascara }}
      />
      {progres ? (
        <div ref={rotols} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 size-full" fill="none">
            {ROTOLS.map((r) => (
              <g key={r.id} data-rotol={r.id} opacity={0}>
                <path stroke="rgba(95,198,212,.55)" strokeWidth={1} />
                <circle r={7} stroke="rgba(95,198,212,.45)" strokeWidth={1} />
                <circle r={2.5} fill="#8CD9E4" />
              </g>
            ))}
          </svg>
          {ROTOLS.map((r) => (
            <span key={r.id} data-rotol={r.id} style={ESTIL_ROTOL}>
              {noms[r.id]}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
