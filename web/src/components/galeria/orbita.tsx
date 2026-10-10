// La galeria de la portada: un anillo de tarjetas girando entre particulas cian, al estilo del
// orbit de la referencia pero con nuestro color y con las nueve demos. Cada pieza es la captura
// enmarcada como una tarjeta; al pulsarla se elige y aparece debajo su tarjeta con el boton de
// probar la demo, con sus fases de siempre, y se inicia desde ahi.
//
// Vive en la columna derecha de la portada: el lienzo es transparente (deja ver la placa base),
// las estrellas son un velo y el bucle se apaga cuando la portada sale de la vista. Con el raton
// encima se gira a gusto (arrastrar) y se hace zoom (rueda); al quitar el raton del lienzo la
// rueda vuelve a desplazar la pagina. Gira solo cuando no se toca.
//
// El teclado y el lector de pantalla no pasan por el 3D (va con aria-hidden): a su lado hay una
// lista equivalente, oculta a la vista pero con los mismos botones de probar la demo.

import { useMemo, useRef, useState } from "react";
import type { ComponentRef, ReactNode, RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { BotoDemo } from "../BotoDemo";
import { GitHub } from "../Icones";
import { CIAN, useBucle } from "./comu3d";
import { Estrelles, Particules, prepararMapa } from "./piezas3d";

const RADI = 6.8; // radio del anillo y de la nube de particulas (holgado, sin que se solapen)
const ALT = 2.2; // alto de la captura en el mundo; el ancho sale de su proporcion
const MARC = 0.16; // margen oscuro alrededor de la captura, para que parezca una tarjeta

const COLOR_TARGETA = new THREE.Color("#16181d");

type Peca = { projecte: Projecte; angle: number };

/** La camara gira alrededor del anillo (arrastrando o sola) y hace zoom con la rueda. Se para sola
 *  mientras el raton esta encima o justo despues de un arrastre, para no pelearse con quien la mueve. */
function Vista({ pausat }: { pausat: RefObject<boolean> }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const reactiva = useRef(0);

  useFrame((state) => {
    const c = controls.current;
    if (!c) return;
    c.autoRotate = !pausat.current && state.clock.elapsedTime > reactiva.current;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      // Con el raton encima del lienzo la rueda hace zoom y se gira a gusto; fuera del lienzo la
      // rueda no llega aqui y sigue desplazando la pagina.
      enableZoom
      minDistance={5}
      maxDistance={22}
      enablePan={false}
      enableRotate
      autoRotate
      autoRotateSpeed={0.6}
      rotateSpeed={0.5}
      minPolarAngle={Math.PI * 0.08}
      maxPolarAngle={Math.PI * 0.92}
      target={[0, 0, 0]}
      onStart={() => {
        reactiva.current = Infinity;
      }}
      onEnd={() => {
        reactiva.current = performance.now() / 1000 + 2.5;
      }}
    />
  );
}

/** Una tarjeta del anillo: mira siempre a la camara, la captura va enmarcada sobre un fondo oscuro
 *  y, al estar elegida, se agranda un poco y le sale un marco cian. */
function Targeta({
  peca,
  textura,
  ample,
  elegida,
  onTriar
}: {
  peca: Peca;
  textura: THREE.Texture;
  ample: number;
  elegida: boolean;
  onTriar: () => void;
}) {
  const grup = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    grup.current?.lookAt(camera.position);
  });

  const x = RADI * Math.cos(peca.angle);
  const z = RADI * Math.sin(peca.angle);
  const w = ALT * ample;

  return (
    <group ref={grup} position={[x, 0, z]} scale={elegida ? 1.1 : 1}>
      {/* Marco cian al elegirla. */}
      {elegida ? (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[w + MARC * 2 + 0.1, ALT + MARC * 2 + 0.1]} />
          <meshBasicMaterial color={CIAN} toneMapped={false} />
        </mesh>
      ) : null}
      {/* Fondo oscuro de la tarjeta (el margen alrededor de la captura). */}
      <mesh
        position={[0, 0, -0.01]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onTriar();
        }}
      >
        <planeGeometry args={[w + MARC * 2, ALT + MARC * 2]} />
        <meshBasicMaterial color={COLOR_TARGETA} toneMapped={false} />
      </mesh>
      {/* La captura. */}
      <mesh raycast={() => null}>
        <planeGeometry args={[w, ALT]} />
        <meshBasicMaterial map={textura} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Escena({
  peces,
  pausat,
  triada,
  onTriar
}: {
  peces: Peca[];
  pausat: RefObject<boolean>;
  triada: number | null;
  onTriar: (i: number) => void;
}) {
  const textures = useLoader(
    THREE.TextureLoader,
    peces.map((p) => p.projecte.captura)
  );
  const mapes = useMemo(() => textures.map((t) => prepararMapa(t)), [textures]);
  const amples = useMemo(
    () =>
      mapes.map((m) => {
        const img = m.image as { width?: number; height?: number } | undefined;
        return img && img.width && img.height ? img.width / img.height : 1.6;
      }),
    [mapes]
  );

  return (
    <>
      <Vista pausat={pausat} />
      <ambientLight intensity={0.9} />
      <pointLight position={[8, 8, 8]} intensity={0.5} />
      <Estrelles compte={460} abast={40} />
      <Particules compte={1400} radi={RADI} dispersio={4.4} mida={0.11} color={CIAN} opacitat={1} />
      {peces.map((peca, i) => (
        <Targeta
          key={peca.projecte.nom}
          peca={peca}
          textura={mapes[i]}
          ample={amples[i]}
          elegida={triada === i}
          onTriar={() => onTriar(i)}
        />
      ))}
    </>
  );
}

/**
 * La galeria entera: el lienzo con el anillo, la tarjeta del proyecto elegido con su boton de
 * probar, y la lista equivalente para teclado y lector de pantalla.
 */
export function OrbitaDemos({ projectes, acciones }: { projectes: Projecte[]; acciones?: ReactNode }) {
  const { t } = useIdioma();
  const caixa = useRef<HTMLDivElement>(null);
  const frameloop = useBucle(caixa);
  const pausat = useRef(false);

  // Una pieza por proyecto, repartidas por todo el anillo. No se repiten: con el radio holgado
  // queda sitio de sobra entre tarjetas para que no se solapen.
  const peces = useMemo<Peca[]>(() => {
    const amb = projectes.filter((p) => p.captura);
    return amb.map((projecte, i) => ({ projecte, angle: (i / amb.length) * Math.PI * 2 }));
  }, [projectes]);

  const [triada, setTriada] = useState<number | null>(null);
  const triat = triada != null ? peces[triada]?.projecte : undefined;

  if (!peces.length) return null;

  return (
    <div className="orbita">
      {acciones ? <div className="orbita__barra">{acciones}</div> : null}
      <div
        ref={caixa}
        aria-hidden
        className="orbita__llenc"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") pausat.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") pausat.current = false;
        }}
      >
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 1.8, 10], fov: 50 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Escena peces={peces} pausat={pausat} triada={triada} onTriar={setTriada} />
        </Canvas>
      </div>

      {/* La tarjeta del proyecto elegido: captura, nombre y el boton real de probar la demo. Aparece
          al pulsar una pieza del anillo; antes de elegir, una pista de que se puede pulsar. */}
      {triat ? (
        <div className="orbita__fitxa">
          {triat.captura ? <img className="orbita__fitxa-img" src={triat.captura} alt="" /> : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-tinta">{triat.curt}</p>
            <p className="mt-0.5 text-[13px] text-tinta-3">
              {triat.registre ? t("demos.registre") : t("card.try")}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              {triat.demo && !triat.tancat ? (
                <BotoDemo url={triat.demo} titol={triat.titol} mida="mini" />
              ) : null}
              {triat.url ? (
                <a
                  href={triat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-tinta-3 transition-colors duration-200 hover:text-tinta"
                >
                  <GitHub className="text-[15px]" />
                  {t("feed.code")}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <p className="orbita__pista">{t("orbita.pista")}</p>
      )}

      {/* La via de teclado y lector de pantalla: la misma lista, con el boton de cada demo. */}
      <ul className="sr-only">
        {projectes.map((p) => (
          <li key={p.nom}>
            <span>{p.titol}</span>
            {p.demo && !p.tancat ? <BotoDemo url={p.demo} titol={p.titol} mida="mini" /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrbitaDemos;
