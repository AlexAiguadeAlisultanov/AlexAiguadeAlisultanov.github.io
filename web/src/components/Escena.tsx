// Fondo de la portada: un procesador en 3D dibujado solo con lineas de luz, construido por
// codigo. No hay ningun modelo importado ni ninguna textura.
//
// Por que esta escena: el resto de la pagina lleva de fondo una placa base, asi que la
// portada enseña la pieza central de esa placa. El chip esta despiezado en sus cuatro
// capas (la rejilla de bolas de soldadura, el sustrato con sus condensadores, el silicio
// con sus nucleos y el disipador integrado) y de sus bordes salen pistas con corriente que
// se pierden hacia la placa de abajo.
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
// saliendo) y p (la historia). Con q el chip sale de detras del retrato y viaja al 62 % / 50 %
// de la capa; con p se despieza por capas, una por capitulo, y al final se vuelve a montar.
// Todo eso va detras de `if (progres)`: sin progres la portada se comporta como siempre. Las
// cifras de la coreografia estan en relat/tabla.ts.
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
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  Vector4,
  WebGLRenderer
} from "three";
import { PESOS, PESOS_MS, RAFAGA, SEP, VIAJE, forca, pesos, tramos, ventana } from "./relat/tabla";

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

// Cada vertice sabe a que capa pertenece (aCapa): al despiezar, cada capa sube o baja en
// proporcion. Las guias entre capas unen vertices de capas distintas, asi que se estiran
// solas. aGrup es el numero de la capa (0 bolas, 1 sustrato, 2 silicio, 3 tapa) y uPes el
// brillo de cada una: la pelicula enciende la del capitulo y deja las demas al 30 %. Fuera
// de la pelicula uPes vale 1 en las cuatro y no cambia nada. Se elige el peso con step y un
// producto escalar, sin indexar el vector con una variable, que no todas las graficas aceptan.
const VS_LINIES = `
  uniform float uSep;
  attribute float aCapa;
  attribute float aGrup;
  attribute float aT;
  attribute float aLlavor;
  attribute float aBase;
  attribute float aGuia;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vGrup;
  void main() {
    vT = aT;
    vLlavor = aLlavor;
    vBase = aBase;
    vGuia = aGuia;
    vGrup = aGrup;
    vec3 p = position;
    p.z += aCapa * uSep;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vProf = clamp((20.0 + mv.z) / 14.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FS_LINIES = `
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform vec4 uPes;
  uniform float uTemps;
  uniform float uForca;
  uniform float uSep;
  uniform float uRafaga;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vGrup;
  void main() {
    float alfa = vBase * uForca * vProf;
    alfa *= dot(uPes, step(abs(vec4(0.0, 1.0, 2.0, 3.0) - vGrup), vec4(0.5)));
    if (vGuia > 0.5) {
      // Guias de montaje: discontinuas y solo cuando el chip esta despiezado.
      if (fract(vT * 14.0) > 0.5) discard;
      alfa *= smoothstep(0.3, 0.9, uSep);
    }
    float pols = 0.0;
    if (vLlavor >= 0.0) {
      float lloc = fract(uTemps * 0.11 + vLlavor);
      pols = smoothstep(0.05, 0.0, abs(vT - lloc));
      // Rafaga del clic: un frente que sale del chip hacia fuera por todas las pistas.
      pols = max(pols, smoothstep(0.08, 0.0, abs(vT - (1.0 - uRafaga) * 1.1)) * step(0.001, uRafaga));
      // Las pistas se apagan hacia fuera, donde ya las recoge la placa del fondo.
      alfa *= (1.0 - vT) * (1.0 - vT);
    }
    gl_FragColor = vec4(mix(uColor, uPols, pols), alfa + pols * uForca * 0.8 * vProf);
  }
`;

const VS_PUNTS = `
  uniform float uSep;
  uniform float uPunt;
  attribute float aCapa;
  attribute float aGrup;
  attribute float aMida;
  attribute float aBase;
  varying float vBase;
  varying float vGrup;
  void main() {
    vBase = aBase;
    vGrup = aGrup;
    vec3 p = position;
    p.z += aCapa * uSep;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPunt * aMida / max(-mv.z, 0.001);
  }
`;

const FS_PUNTS = `
  uniform vec3 uColor;
  uniform vec4 uPes;
  uniform float uForca;
  varying float vBase;
  varying float vGrup;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float pes = dot(uPes, step(abs(vec4(0.0, 1.0, 2.0, 3.0) - vGrup), vec4(0.5)));
    gl_FragColor = vec4(uColor, smoothstep(0.25, 0.04, d2) * vBase * uForca * pes);
  }
`;

/* ---------- Geometria del chip ---------- */

// Altura de cada capa al despiezar (se multiplica por uSep), su altura en reposo y su numero
// de capa (aGrup).
const CAPA = {
  bolas: { sep: -0.9, z: -0.06, grup: 0 },
  sustrato: { sep: 0, z: 0, grup: 1 },
  silicio: { sep: 0.75, z: 0.07, grup: 2 },
  tapa: { sep: 1.6, z: 0.16, grup: 3 }
};
type Capa = (typeof CAPA)[keyof typeof CAPA];

function construir() {
  const atzar = daus(20260928);
  const lp: number[] = [];
  const lcapa: number[] = [];
  const lgrup: number[] = [];
  const lt: number[] = [];
  const lllavor: number[] = [];
  const lbase: number[] = [];
  const lguia: number[] = [];

  const segment = (
    x1: number, y1: number, c1: Capa,
    x2: number, y2: number, c2: Capa,
    base: number, t1 = 0, t2 = 1, llavor = -1, guia = 0
  ) => {
    lp.push(x1, y1, c1.z, x2, y2, c2.z);
    lcapa.push(c1.sep, c2.sep);
    lgrup.push(c1.grup, c2.grup);
    lt.push(t1, t2);
    lllavor.push(llavor, llavor);
    lbase.push(base, base);
    lguia.push(guia, guia);
  };

  /** Contorno cerrado de un poligono en una capa. */
  const contorn = (punts: [number, number][], capa: Capa, base: number) => {
    for (let i = 0; i < punts.length; i++) {
      const [x1, y1] = punts[i];
      const [x2, y2] = punts[(i + 1) % punts.length];
      segment(x1, y1, capa, x2, y2, capa, base);
    }
  };

  const rect = (cx: number, cy: number, w: number, h: number, capa: Capa, base: number) =>
    contorn([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], capa, base);

  /** Cuadrado con las esquinas achaflanadas; la primera, mas, que marca la patilla 1. */
  const xamfra = (m: number, c: number, capa: Capa, base: number) =>
    contorn([[-m + c * 2, -m], [m - c, -m], [m, -m + c], [m, m - c], [m - c, m], [-m + c, m], [-m, m - c], [-m, -m + c * 2]], capa, base);

  // Sustrato: la placa verde del procesador, con condensadores alrededor del silicio.
  const S = 2.1;
  xamfra(S, 0.12, CAPA.sustrato, 0.55);
  xamfra(S - 0.12, 0.1, CAPA.sustrato, 0.18);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 1.32 + (i % 2) * 0.12;
    const x = Math.cos(a) * r * 1.1;
    const y = Math.sin(a) * r * 0.9;
    const vertical = Math.abs(Math.cos(a)) > 0.7;
    rect(x, y, vertical ? 0.09 : 0.18, vertical ? 0.18 : 0.09, CAPA.sustrato, 0.45);
  }

  // Silicio: el nucleo, con ocho nucleos en dos filas y la cache en medio.
  const DW = 1.7;
  const DH = 1.25;
  rect(0, 0, DW, DH, CAPA.silicio, 0.8);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 4; col++) {
      const cx = -DW / 2 + 0.24 + col * 0.41;
      const cy = fila === 0 ? -0.36 : 0.36;
      rect(cx, cy, 0.34, 0.4, CAPA.silicio, 0.5);
      rect(cx, cy + (fila === 0 ? -0.06 : 0.06), 0.18, 0.14, CAPA.silicio, 0.35);
    }
  }
  rect(0, 0, DW - 0.18, 0.2, CAPA.silicio, 0.45);
  for (let k = 0; k < 7; k++) {
    const x = -DW / 2 + 0.22 + k * 0.21;
    segment(x, -0.1, CAPA.silicio, x, 0.1, CAPA.silicio, 0.3);
  }

  // Tapa metalica: contorno con sus muescas y el triangulo de la patilla 1.
  const T = 1.55;
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
  // siguen hacia fuera, como el rutado de una placa alrededor de un zocalo.
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
      let fet = 0;
      for (let i = 1; i < punts.length; i++) {
        const tram = Math.hypot(punts[i][0] - punts[i - 1][0], punts[i][1] - punts[i - 1][1]);
        segment(punts[i - 1][0], punts[i - 1][1], CAPA.sustrato, punts[i][0], punts[i][1], CAPA.sustrato, 0.36, fet / total, (fet + tram) / total, llavor);
        fet += tram;
      }
      // Via en el codo, donde la pista cambia de direccion.
      vies.push(punts[2][0], punts[2][1], 0);
    }
  }

  const linies = new BufferGeometry();
  linies.setAttribute("position", new Float32BufferAttribute(lp, 3));
  linies.setAttribute("aCapa", new Float32BufferAttribute(lcapa, 1));
  linies.setAttribute("aGrup", new Float32BufferAttribute(lgrup, 1));
  linies.setAttribute("aT", new Float32BufferAttribute(lt, 1));
  linies.setAttribute("aLlavor", new Float32BufferAttribute(lllavor, 1));
  linies.setAttribute("aBase", new Float32BufferAttribute(lbase, 1));
  linies.setAttribute("aGuia", new Float32BufferAttribute(lguia, 1));

  // Puntos: la rejilla de bolas de soldadura por debajo y las vias de las pistas.
  const pp: number[] = [];
  const pcapa: number[] = [];
  const pgrup: number[] = [];
  const pmida: number[] = [];
  const pbase: number[] = [];
  const N = 15;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = (i / (N - 1) - 0.5) * (S * 1.7);
      const y = (j / (N - 1) - 0.5) * (S * 1.7);
      // Sin bolas en el centro, como en los encapsulados de verdad.
      if (Math.abs(x) < 0.55 && Math.abs(y) < 0.55) continue;
      pp.push(x, y, CAPA.bolas.z);
      pcapa.push(CAPA.bolas.sep);
      pgrup.push(CAPA.bolas.grup);
      pmida.push(1);
      pbase.push(0.55);
    }
  }
  for (let i = 0; i < vies.length; i += 3) {
    pp.push(vies[i], vies[i + 1], 0);
    pcapa.push(CAPA.sustrato.sep);
    pgrup.push(CAPA.sustrato.grup);
    pmida.push(1.5);
    pbase.push(0.5);
  }
  const punts = new BufferGeometry();
  punts.setAttribute("position", new Float32BufferAttribute(pp, 3));
  punts.setAttribute("aCapa", new Float32BufferAttribute(pcapa, 1));
  punts.setAttribute("aGrup", new Float32BufferAttribute(pgrup, 1));
  punts.setAttribute("aMida", new Float32BufferAttribute(pmida, 1));
  punts.setAttribute("aBase", new Float32BufferAttribute(pbase, 1));

  return { linies, punts };
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
  const llenc = useRef<HTMLCanvasElement>(null);

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
      uPes: { value: new Vector4(1, 1, 1, 1) }
    };

    const geo = construir();
    const comu = { uniforms: uniformes, transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending };
    const matLinies = new ShaderMaterial({ ...comu, vertexShader: VS_LINIES, fragmentShader: FS_LINIES });
    const matPunts = new ShaderMaterial({ ...comu, vertexShader: VS_PUNTS, fragmentShader: FS_PUNTS });

    const escena = new Scene();
    const suport = new Group();   // posicion y giro del cursor
    const chip = new Group();     // inclinacion fija del chip
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

    const mascara = (mx: string, my: string) => {
      // Solo se escribe si cambia, para no repintar la mascara en cada fotograma.
      if (mx !== maskX) canvas.style.setProperty("--mx", (maskX = mx));
      if (my !== maskY) canvas.style.setProperty("--my", (maskY = my));
    };

    /** Pelicula: el ancla va del retrato al 62 % / 50 % de la capa, y el lado del chip, de 2,1
     *  veces el retrato a min(58svh, 40vw), interpolado en logaritmo para que el cambio de
     *  tamaño se vea igual de suave al principio que al final. */
    const situarPelicula = (caixa: DOMRect, perPixel: number) => {
      const q = sortida ? sortida.get() : 1;
      qSituada = q;
      const s = ventana(q, VIAJE.desde, 1);
      const fx = caixa.left + caixa.width * VIAJE.ancla[0];
      const fy = caixa.top + caixa.height * VIAJE.ancla[1];
      const ladoFinal = Math.max(1, Math.min(VIAJE.lado.svh * window.innerHeight, VIAJE.lado.vw * window.innerWidth));
      let x0 = fx;
      let y0 = fy;
      let lado0 = ladoFinal;
      const foto = retrat()?.getBoundingClientRect();
      if (foto && foto.width > 0) {
        x0 = foto.left + foto.width / 2;
        y0 = foto.top + foto.height / 2;
        lado0 = foto.width * MIDA_RESPECTE_FOTO;
      }
      const x = x0 + (fx - x0) * s;
      const y = y0 + (fy - y0) * s;
      const lado = Math.exp(Math.log(lado0) + (Math.log(ladoFinal) - Math.log(lado0)) * s);
      const cx = x - (caixa.left + caixa.width / 2);
      const cy = y - (caixa.top + caixa.height / 2);
      suport.position.set(cx * perPixel, -cy * perPixel, 0);
      chip.scale.setScalar((lado * perPixel) / 2.1 / 2);

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
      matLinies.dispose();
      matPunts.dispose();
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

    // Estado de la pelicula. El puntero despieza el chip solo al principio del viaje; despues
    // manda p. Los pesos se acercan a los del capitulo en unos 200 ms.
    let obrirPunter = SEPARACION_REPOSO;
    let inclina = 1;
    let brillo = 1;
    let pAnterior = progres ? progres.get() : 0;
    let rafagaArmada = pAnterior < RAFAGA.en;
    const pes = uniformes.uPes.value;

    const pelicula = (dt: number) => {
      if (!progres) return;
      const q = sortida ? sortida.get() : 1;
      const p = progres.get();
      const enHistoria = q >= 1;
      destiObrir = enHistoria ? tramos(SEP, p) : q < VIAJE.puntero ? obrirPunter : SEPARACION_REPOSO;
      inclina = q > VIAJE.puntero ? VIAJE.inclinacion : 1;
      brillo = enHistoria ? forca(p) : 1;

      const w = enHistoria ? pesos(p) : PESOS.todo.w;
      const k = 1 - Math.exp((-3000 * dt) / PESOS_MS);
      pes.set(pes.x + (w[0] - pes.x) * k, pes.y + (w[1] - pes.y) * k, pes.z + (w[2] - pes.z) * k, pes.w + (w[3] - pes.w) * k);

      // La rafaga sale una vez al pasar por 0,64 bajando y se rearma al volver por debajo de
      // 0,61: rondar el umbral con la rueda no la dispara en bucle.
      if (rafagaArmada && pAnterior < RAFAGA.en && p >= RAFAGA.en) {
        rafaga = 1;
        rafagaArmada = false;
      } else if (!rafagaArmada && p < RAFAGA.en - RAFAGA.histeresis) {
        rafagaArmada = true;
      }
      pAnterior = p;
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
      chip.rotation.z = GIRO + Math.sin(rellotge * 0.09) * 0.05;
      camera.position.z = CAMERA_Z + baixada.valor * 3;
      // La foto se mueve con el iman y con el scroll: el chip la sigue. En la pelicula el
      // lienzo esta fijado y la foto sube con la pagina, asi que durante el viaje se recoloca
      // en cada fotograma; si no, el chip se quedaria atras.
      if (progres) {
        const q = sortida ? sortida.get() : 1;
        if ((q > 0 && q < 1) || q !== qSituada || mostres % 10 === 0) situar();
      } else if (mostres % 10 === 0) {
        situar();
      }
      renderer.render(escena, camera);
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
      // Cuanto mas cerca del chip, mas se despieza.
      const c = centrePantalla();
      const d = Math.hypot(event.clientX - c.x, event.clientY - c.y);
      const f = Math.max(0, 1 - d / RADIO_CERCA);
      const separacio = SEPARACION_REPOSO + f * f * (1 - SEPARACION_REPOSO);
      if (progres) obrirPunter = separacio;
      else destiObrir = separacio;
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
      if (progres) obrirPunter = SEPARACION_REPOSO;
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
  return (
    <canvas
      ref={llenc}
      aria-hidden
      className="pointer-events-none size-full"
      style={{ maskImage: mascara, WebkitMaskImage: mascara }}
    />
  );
}
