// Figura "placa": placa base de verdad. Chips con sus patillas, pistas trazadas a 90 y 45
// grados como en una PCB, y vias en los extremos. El cursor ilumina la placa, al pasar
// por encima de un chip este se enciende y suelta corriente por sus pistas, y un clic
// dispara corriente por todas las pistas del chip mas cercano.

import { elegir, MONO, pintarCola, pintarDestello, rgba } from "./motor";
import type { CrearFigura, Figura } from "./motor";

/* ---------- Ajustes ---------- */

const PASO = 18;               // px de la rejilla sobre la que se trazan las pistas
const ALFA_PISTA = 0.075;      // opacidad de las pistas en reposo
const ALFA_CHIP = 0.13;        // opacidad del contorno de los chips en reposo
const AREA_POR_CHIP = 420 * 420; // px cuadrados de pantalla por cada chip
const PISTAS_SUELTAS = 1 / 9000; // pistas sin chip por px cuadrado
const VELOCIDAD_CORRIENTE = 210; // px por segundo
const DISTANCIA_CORRIENTE = 130; // px de recorrido del cursor entre corriente y corriente
const DECAIMIENTO = 1.4;       // rapidez con la que se apaga un chip encendido
const CORRIENTES_AMBIENTE = 3;
const MAX_CORRIENTES = 36;

/* ---------- Tipos ---------- */

type Punto = { x: number; y: number };
type Traza = { puntos: Punto[]; acumulado: number[]; largo: number; chip: number };
type Chip = { x: number; y: number; w: number; h: number; nombre: string; trazas: number[] };
type Corriente = { traza: number; sentido: 1 | -1; recorrido: number; cola: Punto[]; apagandose: boolean; ambiente: boolean };
type Anillo = { x: number; y: number; r: number };

const DIRS: [number, number][] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const NOMBRES = ["CPU", "NIC", "TPM", "SSD", "RAM", "FPGA", "BIOS", "PHY", "SoC", "HSM", "U3", "U7", "ETH", "USB"];
const LARGO_COLA = 12;

export const crearPlaca: CrearFigura = ({ ample, alt, movil }) => {
  const cols = Math.ceil(ample / PASO) + 1;
  const filas = Math.ceil(alt / PASO) + 1;
  const ocupado = new Uint8Array(cols * filas);
  const libre = (i: number, j: number) => i >= 1 && j >= 1 && i < cols - 1 && j < filas - 1 && !ocupado[j * cols + i];
  const marcar = (i: number, j: number) => {
    if (i >= 0 && j >= 0 && i < cols && j < filas) ocupado[j * cols + i] = 1;
  };

  const chips: Chip[] = [];
  const trazas: Traza[] = [];
  const nombres = [...NOMBRES].sort(() => Math.random() - 0.5);

  // Chips: rectangulos que no se tocan, con un margen alrededor para que salgan pistas.
  const objetivoChips = Math.max(3, Math.round((ample * alt) / AREA_POR_CHIP));
  for (let intento = 0; chips.length < objetivoChips && intento < 200; intento++) {
    const w = 4 + Math.floor(Math.random() * 6);
    const h = 3 + Math.floor(Math.random() * 4);
    const i0 = 3 + Math.floor(Math.random() * Math.max(1, cols - w - 6));
    const j0 = 3 + Math.floor(Math.random() * Math.max(1, filas - h - 6));
    let cabe = true;
    for (let j = j0 - 4; j <= j0 + h + 4 && cabe; j++) {
      for (let i = i0 - 4; i <= i0 + w + 4 && cabe; i++) if (!libre(i, j)) cabe = false;
    }
    if (!cabe) continue;
    for (let j = j0 - 1; j <= j0 + h + 1; j++) for (let i = i0 - 1; i <= i0 + w + 1; i++) marcar(i, j);
    chips.push({ x: i0 * PASO, y: j0 * PASO, w: w * PASO, h: h * PASO, nombre: nombres[chips.length % nombres.length], trazas: [] });
  }

  function trazar(i: number, j: number, dir: number, largoMax: number, chip: number): void {
    const puntos: Punto[] = [{ x: i * PASO, y: j * PASO }];
    let pasosDiagonal = 0;
    for (let paso = 0; paso < largoMax; paso++) {
      const diagonal = dir % 2 === 1;
      // Las pistas van casi siempre rectas; cuando giran lo hacen a 45 grados y vuelven
      // a enderezarse al poco, que es como las traza un programa de rutado.
      if (diagonal && ++pasosDiagonal > 1 + Math.random() * 3) {
        dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8;
        pasosDiagonal = 0;
      } else if (!diagonal && paso > 1 && Math.random() < 0.12) {
        dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8;
      }
      const [di, dj] = DIRS[dir];
      if (!libre(i + di, j + dj)) break;
      i += di;
      j += dj;
      marcar(i, j);
      puntos.push({ x: i * PASO, y: j * PASO });
    }
    if (puntos.length < 4) return;
    const acumulado = [0];
    for (let k = 1; k < puntos.length; k++) {
      acumulado.push(acumulado[k - 1] + Math.hypot(puntos[k].x - puntos[k - 1].x, puntos[k].y - puntos[k - 1].y));
    }
    trazas.push({ puntos, acumulado, largo: acumulado[acumulado.length - 1], chip });
    if (chip >= 0) chips[chip].trazas.push(trazas.length - 1);
  }

  // Pistas que salen de las patillas de cada chip, hacia fuera.
  chips.forEach((c, k) => {
    const i0 = c.x / PASO;
    const j0 = c.y / PASO;
    const i1 = i0 + c.w / PASO;
    const j1 = j0 + c.h / PASO;
    const patillas: [number, number, number][] = [];
    for (let i = i0 + 1; i < i1; i++) patillas.push([i, j0 - 1, 6], [i, j1 + 1, 2]);
    for (let j = j0 + 1; j < j1; j++) patillas.push([i0 - 1, j, 4], [i1 + 1, j, 0]);
    for (const [i, j, dir] of patillas) {
      if (Math.random() < 0.7) {
        ocupado[j * cols + i] = 0;
        trazar(i, j, dir, 8 + Math.floor(Math.random() * 34), k);
        marcar(i, j);
      }
    }
  });

  // Y pistas sueltas entre vias, para rellenar la placa.
  const sueltas = Math.round(ample * alt * PISTAS_SUELTAS);
  for (let n = 0; n < sueltas; n++) {
    const i = 1 + Math.floor(Math.random() * (cols - 2));
    const j = 1 + Math.floor(Math.random() * (filas - 2));
    if (!libre(i, j)) continue;
    marcar(i, j);
    trazar(i, j, Math.floor(Math.random() * 4) * 2, 4 + Math.floor(Math.random() * 22), -1);
  }

  const energiaChip = new Float32Array(chips.length);
  let corrientes: Corriente[] = [];
  let anillos: Anillo[] = [];
  let recorridoCursor = 0;
  const maxAmbiente = movil ? 2 : CORRIENTES_AMBIENTE;

  function lanzar(traza: number, sentido: 1 | -1, ambiente: boolean): void {
    if (traza < 0 || corrientes.length >= MAX_CORRIENTES) return;
    corrientes.push({ traza, sentido, recorrido: 0, cola: [], apagandose: false, ambiente });
  }

  function puntoEn(t: Traza, d: number): Punto {
    let k = 1;
    while (k < t.acumulado.length - 1 && t.acumulado[k] < d) k++;
    const a = t.puntos[k - 1];
    const b = t.puntos[k];
    const tramo = t.acumulado[k] - t.acumulado[k - 1] || 1;
    const f = Math.min(1, Math.max(0, (d - t.acumulado[k - 1]) / tramo));
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  }

  function chipEn(x: number, y: number, margen: number): number {
    return chips.findIndex((c) => x > c.x - margen && x < c.x + c.w + margen && y > c.y - margen && y < c.y + c.h + margen);
  }

  function dispararChip(k: number, fuerza: number, cuantas: number): void {
    energiaChip[k] = Math.max(energiaChip[k], fuerza);
    const lista = [...chips[k].trazas].sort(() => Math.random() - 0.5).slice(0, cuantas);
    for (const t of lista) lanzar(t, 1, false);
  }

  function pintarPlaca(ctx: CanvasRenderingContext2D, alfaPista: number, alfaChip: number): void {
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(alfaPista);
    ctx.beginPath();
    for (const t of trazas) {
      ctx.moveTo(t.puntos[0].x, t.puntos[0].y);
      for (let k = 1; k < t.puntos.length; k++) ctx.lineTo(t.puntos[k].x, t.puntos[k].y);
    }
    ctx.stroke();

    // Vias: un anillo al final de cada pista, y al principio si no sale de un chip.
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = rgba(alfaPista * 1.6);
    ctx.beginPath();
    for (const t of trazas) {
      const fin = t.puntos[t.puntos.length - 1];
      ctx.moveTo(fin.x + 3, fin.y);
      ctx.arc(fin.x, fin.y, 3, 0, Math.PI * 2);
      if (t.chip < 0) {
        ctx.moveTo(t.puntos[0].x + 3, t.puntos[0].y);
        ctx.arc(t.puntos[0].x, t.puntos[0].y, 3, 0, Math.PI * 2);
      }
    }
    ctx.stroke();

    for (const c of chips) {
      ctx.fillStyle = "#0C0C0C";
      ctx.fillRect(c.x - PASO * 0.5, c.y - PASO * 0.5, c.w + PASO, c.h + PASO);
      ctx.strokeStyle = rgba(alfaChip);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(c.x - PASO * 0.5, c.y - PASO * 0.5, c.w + PASO, c.h + PASO, 3);
      ctx.stroke();
      ctx.fillStyle = rgba(alfaChip);
      ctx.beginPath();
      ctx.arc(c.x + 2, c.y + 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `600 11px ${MONO}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(c.nombre, c.x + c.w / 2, c.y + c.h / 2);
    }
    ctx.textAlign = "start";
  }

  const figura: Figura = {
    foco: { radio: 240, intensidad: 1 },
    ambiente: [900, 2600],

    pintar(base, encendida) {
      pintarPlaca(base, ALFA_PISTA, ALFA_CHIP);
      pintarPlaca(encendida, 0.55, 0.9);
    },

    avanzar(dt) {
      const apagar = Math.exp(-DECAIMIENTO * dt);
      let chipsVivos = false;
      for (let k = 0; k < energiaChip.length; k++) {
        energiaChip[k] *= apagar;
        if (energiaChip[k] < 0.01) energiaChip[k] = 0;
        else chipsVivos = true;
      }

      for (const a of anillos) a.r += 40 * dt;
      anillos = anillos.filter((a) => a.r < 14);

      for (const c of corrientes) {
        if (c.apagandose) {
          c.cola.shift();
          continue;
        }
        const t = trazas[c.traza];
        c.recorrido += VELOCIDAD_CORRIENTE * dt;
        const d = Math.min(c.recorrido, t.largo);
        c.cola.push(puntoEn(t, c.sentido === 1 ? d : t.largo - d));
        while (c.cola.length > LARGO_COLA) c.cola.shift();
        if (c.recorrido >= t.largo) {
          c.apagandose = true;
          const fin = c.sentido === 1 ? t.puntos[t.puntos.length - 1] : t.puntos[0];
          anillos.push({ x: fin.x, y: fin.y, r: 3 });
          // Si la corriente llega a un chip, el chip se enciende un poco.
          if (c.sentido === -1 && t.chip >= 0) energiaChip[t.chip] = Math.max(energiaChip[t.chip], 0.5);
        }
      }
      corrientes = corrientes.filter((c) => !c.apagandose || c.cola.length > 0);

      return chipsVivos || corrientes.length > 0 || anillos.length > 0;
    },

    dibujar(ctx) {
      chips.forEach((c, k) => {
        const e = energiaChip[k];
        if (e <= 0) return;
        ctx.fillStyle = rgba(e * 0.1);
        ctx.strokeStyle = rgba(e * 0.8);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(c.x - PASO * 0.5, c.y - PASO * 0.5, c.w + PASO, c.h + PASO, 3);
        ctx.fill();
        ctx.stroke();
        ctx.font = `600 11px ${MONO}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(0.3 + e * 0.7);
        ctx.fillText(c.nombre, c.x + c.w / 2, c.y + c.h / 2);
        ctx.textAlign = "start";
      });
      ctx.lineWidth = 1.2;
      for (const a of anillos) {
        ctx.strokeStyle = rgba((1 - a.r / 14) * 0.8);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (const c of corrientes) {
        pintarCola(ctx, c.cola, false);
        if (!c.apagandose && c.cola.length) {
          const p = c.cola[c.cola.length - 1];
          pintarDestello(ctx, p.x, p.y, 11);
        }
      }
    },

    mover(x, y, paso) {
      // Encima de un chip: se enciende y de vez en cuando suelta corriente.
      const k = chipEn(x, y, 10);
      if (k >= 0) {
        energiaChip[k] = Math.max(energiaChip[k], 0.8);
        if (Math.random() < 0.12) dispararChip(k, 0.8, 1);
      }
      recorridoCursor += paso;
      if (recorridoCursor < DISTANCIA_CORRIENTE) return;
      recorridoCursor = 0;
      // Corriente desde el extremo de pista mas cercano al cursor.
      let mejor = -1;
      let sentido: 1 | -1 = 1;
      let mejorD = 110 * 110;
      trazas.forEach((t, i) => {
        const ini = t.puntos[0];
        const fin = t.puntos[t.puntos.length - 1];
        const di = (ini.x - x) ** 2 + (ini.y - y) ** 2;
        const df = (fin.x - x) ** 2 + (fin.y - y) ** 2;
        if (di < mejorD) [mejor, sentido, mejorD] = [i, 1, di];
        if (df < mejorD) [mejor, sentido, mejorD] = [i, -1, df];
      });
      lanzar(mejor, sentido, false);
    },

    pulsar(x, y) {
      let mejor = chipEn(x, y, 0);
      if (mejor < 0) {
        let mejorD = 280 * 280;
        chips.forEach((c, k) => {
          const d = (c.x + c.w / 2 - x) ** 2 + (c.y + c.h / 2 - y) ** 2;
          if (d < mejorD) [mejor, mejorD] = [k, d];
        });
      }
      if (mejor >= 0) {
        dispararChip(mejor, 1, 14);
        return;
      }
      trazas
        .map((t, i) => ({ i, d: (t.puntos[0].x - x) ** 2 + (t.puntos[0].y - y) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 5)
        .forEach(({ i }) => lanzar(i, 1, false));
    },

    alAmbiente() {
      if (corrientes.filter((c) => c.ambiente).length >= maxAmbiente || trazas.length === 0) return;
      const i = Math.floor(Math.random() * trazas.length);
      lanzar(i, trazas[i].chip >= 0 || Math.random() < 0.5 ? 1 : -1, true);
      if (chips.length && Math.random() < 0.25) dispararChip(chips.indexOf(elegir(chips)), 0.6, 2);
    }
  };
  return figura;
};
