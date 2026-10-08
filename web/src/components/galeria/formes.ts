// Las dos formas de colocar una tarjeta segun su distancia al frente (d, en pasos). Solo
// geometria: transform, opacidad y orden de apilado. El motor (Galeria3D) las llama por cada
// tarjeta en cada fotograma. Nada de desenfoque por fotograma.

import type { Colocar } from "./Galeria3D";

/**
 * Anillo giratorio (seccion de proyectos): las tarjetas van tendidas en un cilindro. La de
 * delante manda y las demas orbitan hacia los lados, se giran de canto y se apagan; las de
 * detras se esconden. El tamano lo da la perspectiva (las de delante, mas cerca, mas grandes).
 */
export const anell: Colocar = (d, { n, ample }) => {
  const pas = 360 / n;
  const ang = d * pas;
  const rad = (ang * Math.PI) / 180;
  const radi = ample * 1.7;
  const front = Math.cos(rad); // 1 delante, 0 de canto, -1 detras
  const cerca = Math.max(0, front);
  const transform = `translate(-50%,-50%) rotateY(${ang.toFixed(2)}deg) translateZ(${radi.toFixed(1)}px)`;
  // La de delante, entera; las vecinas se apagan rapido (cerca al cuadrado) para que no
  // ensucien el frente, y las de detras se esconden.
  const opacitat = front > 0 ? 0.12 + 0.88 * cerca * cerca : Math.max(0, 0.12 + 0.3 * front);
  return {
    transform,
    opacitat,
    z: Math.round(front * 100) + 100,
    actiu: front > 0.86 // solo la de delante recibe raton; a las demas se llega con arrastre, botones o Tab
  };
};

/**
 * Escaparate de profundidad (portada): la tarjeta del centro, de frente y entera; las vecinas
 * se inclinan, se van hacia atras y se apagan, asomando por los lados de la columna. Compacto.
 */
export const escaparata: Colocar = (d, { ample }) => {
  const ad = Math.abs(d);
  const dir = Math.sign(d);
  const x = dir * Math.min(ad, 2.5) * (ample * 0.4);
  const z = -Math.min(ad, 3) * 150;
  const ry = Math.max(-44, Math.min(44, -d * 26));
  const transform = `translate(-50%,-50%) translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg)`;
  const opacitat = ad < 0.6 ? 1 : Math.max(0, 1 - (ad - 0.6) * 0.62);
  return {
    transform,
    opacitat,
    z: Math.round(120 - ad * 20),
    actiu: ad < 0.55
  };
};
