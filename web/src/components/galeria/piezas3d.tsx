// Las piezas de las galerias que si usan three: la nube de particulas cian del nucleo y el campo
// de estrellas del fondo. Solo las importan orbita.tsx y galaxia.tsx, que ya van en trozos aparte
// (lazy), asi que three se queda ahi y no se cuela en el trozo del portafolio.
//
// Las dos son un unico <points> cada una (un solo dibujo, no mil mallas) para que sea ligero. Como
// el lienzo es transparente, las estrellas no tapan la placa base del fondo: solo la salpican.

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CIAN } from "./comu3d";

/** Punto redondo y blando: un degradado radial en un lienzo pequeno, reutilizado por las dos nubes. */
function discTextura(): THREE.CanvasTexture {
  const mida = 64;
  const c = document.createElement("canvas");
  c.width = c.height = mida;
  const g = c.getContext("2d");
  if (g) {
    const r = mida / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.75)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, mida, mida);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Particulas en cian repartidas por una esfera: el nucleo del orbit. */
export function Particules({
  compte = 1100,
  radi = 7,
  dispersio = 3.4,
  mida = 0.07,
  opacitat = 0.9,
  color = CIAN
}: {
  compte?: number;
  radi?: number;
  dispersio?: number;
  mida?: number;
  opacitat?: number;
  color?: string;
}) {
  const disc = useMemo(discTextura, []);
  const geo = useMemo(() => {
    const pos = new Float32Array(compte * 3);
    for (let i = 0; i < compte; i++) {
      const phi = Math.acos(-1 + (2 * i) / compte);
      const theta = Math.sqrt(compte * Math.PI) * phi;
      const r = radi + (Math.random() - 0.5) * dispersio;
      pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [compte, radi, dispersio]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        map={disc}
        color={color}
        size={mida}
        sizeAttenuation
        transparent
        opacity={opacitat}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Campo de estrellas lejano y tenue, limitado a la zona del lienzo (no un cielo a pantalla
 *  completa). Va detras de todo en cada galeria. */
export function Estrelles({ compte = 480, abast = 46 }: { compte?: number; abast?: number }) {
  const disc = useMemo(discTextura, []);
  const geo = useMemo(() => {
    const pos = new Float32Array(compte * 3);
    for (let i = 0; i < compte * 3; i++) pos[i] = (Math.random() - 0.5) * abast;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [compte, abast]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        map={disc}
        color="#ffffff"
        size={0.14}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Deja una textura de captura lista para usarse como `map`: en espacio sRGB y sin estirarse. */
export function prepararMapa(tex: THREE.Texture): THREE.Texture {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
