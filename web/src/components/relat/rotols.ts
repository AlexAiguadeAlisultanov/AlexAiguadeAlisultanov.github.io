// Las etiquetas del despiece: nombres cortos junto a las piezas, con un punto y una linea guia,
// como en los recorridos de pre.cyberxiasec.com. Son decoracion (aria-hidden): lo que cuenta la
// historia ya esta en las tarjetas. Solo las importa Escena.tsx, asi que sus textos viajan en el
// trozo de la escena y no en el de la pagina.
//
// Cada etiqueta sale con su capitulo y apunta a un punto del chip en sus coordenadas propias
// (el sustrato va de -2,1 a 2,1). Escena le aplica el mismo despiece que a su grupo para que el
// punto siga a la pieza.

import type { Idioma } from "../../lib/idioma";

export type Capitol = "hw" | "sw" | "seg";

export type IdRotol =
  | "bga" | "smd" | "sustrat" | "pistes"
  | "nuclis" | "cache" | "gpu" | "imc" | "metall"
  | "tapa" | "escut" | "pasta";

export type Rotol = {
  id: IdRotol;
  capitol: Capitol;
  /** Punto en el plano del chip. */
  punt: readonly [number, number];
  /** Grupo de piezas (aGrup) y multiplicador de su altura, como en la geometria. */
  grup: number;
  nivell?: number;
  /** Direccion en la que se abre su pieza en el plano, si se abre. */
  dir?: readonly [number, number];
};

export const ROTOLS: readonly Rotol[] = [
  { id: "bga", capitol: "hw", punt: [1.53, -1.53], grup: 0, dir: [0.73, -0.73] },
  { id: "smd", capitol: "hw", punt: [1.78, -0.6], grup: 1, dir: [1, 0] },
  { id: "sustrat", capitol: "hw", punt: [2.1, 0.5], grup: 1 },
  { id: "pistes", capitol: "hw", punt: [2.75, -1.05], grup: 2 },
  { id: "nuclis", capitol: "sw", punt: [0.62, -0.36], grup: 3, dir: [0.73, -0.58] },
  { id: "cache", capitol: "sw", punt: [0.7, 0], grup: 3 },
  { id: "gpu", capitol: "sw", punt: [1.2, -0.45], grup: 3, dir: [1, 0] },
  { id: "imc", capitol: "sw", punt: [0.45, -0.9], grup: 3, dir: [0, -1] },
  { id: "metall", capitol: "sw", punt: [0.85, -0.62], grup: 4, nivell: 2.6 },
  { id: "tapa", capitol: "seg", punt: [1.05, -1.5], grup: 7 },
  { id: "escut", capitol: "seg", punt: [0.75, -1.1], grup: 6 },
  { id: "pasta", capitol: "seg", punt: [0.6, -0.62], grup: 5 }
];

/** Cuando se ve cada capitulo de etiquetas en p: entra entre los dos primeros valores y sale
 *  entre los dos ultimos, siempre con curva. Van un poco por dentro de su tarjeta. */
export const FINESTRA: Record<Capitol, readonly [number, number, number, number]> = {
  hw: [0.06, 0.12, 0.26, 0.32],
  sw: [0.36, 0.42, 0.54, 0.6],
  seg: [0.64, 0.7, 0.82, 0.88]
};

/** Los tres idiomas llevan exactamente las mismas claves: el tipo no deja que falte ninguna. */
export const NOMS: Record<Idioma, Record<IdRotol, string>> = {
  es: {
    bga: "Bolas BGA",
    smd: "Condensadores",
    sustrat: "Sustrato",
    pistes: "Pistas",
    nuclis: "Núcleos",
    cache: "Caché",
    gpu: "Gráfica",
    imc: "Controlador de memoria",
    metall: "Capas de metal",
    tapa: "Tapa IHS",
    escut: "Escudo",
    pasta: "Pasta térmica"
  },
  ca: {
    bga: "Boles BGA",
    smd: "Condensadors",
    sustrat: "Substrat",
    pistes: "Pistes",
    nuclis: "Nuclis",
    cache: "Memòria cau",
    gpu: "Gràfica",
    imc: "Controlador de memòria",
    metall: "Capes de metall",
    tapa: "Tapa IHS",
    escut: "Escut",
    pasta: "Pasta tèrmica"
  },
  en: {
    bga: "BGA balls",
    smd: "Capacitors",
    sustrat: "Substrate",
    pistes: "Traces",
    nuclis: "Cores",
    cache: "Cache",
    gpu: "Graphics",
    imc: "Memory controller",
    metall: "Metal layers",
    tapa: "IHS lid",
    escut: "Shield",
    pasta: "Thermal paste"
  }
};
