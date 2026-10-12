// La galeria de la seccion de proyectos: las tarjetas flotan repartidas por un espacio estrellado
// y se arrastra para mirar alrededor, al estilo del StellarCardGallery de la referencia pero con
// el cian de la web. Cada tarjeta lleva su captura y su nombre; al pulsarla se abre un modal con
// el detalle del proyecto (ano, individual o equipo, que hizo Alex, tecnologias, probar la demo y
// codigo), que se cierra con la X, con Escape o tocando fuera y atrapa el foco. Es el mismo modal
// que abre el anillo de las demos (ModalProjecte.tsx).
//
// Como el anillo de la banda de las demos: vive dentro de la pagina (no ocupa la pantalla), el
// lienzo es transparente con un velo de estrellas, y con el raton dentro se gira arrastrando. La
// rueda sola sigue moviendo la pagina, tambien sobre el lienzo, para que nadie se quede atascado al
// llegar aqui; el zoom es con Ctrl + rueda (ZoomRueda, en piezas3d.tsx). El bucle se apaga cuando la
// seccion sale de la vista. El 3D va con aria-hidden; el teclado y el lector de pantalla abren el
// mismo modal.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { ModalProjecte } from "./ModalProjecte";
import { Estrelles, ZoomRueda } from "./piezas3d";
import { CIAN, teclaZoom, useBucle } from "./comu3d";

type Lloc = { x: number; y: number; z: number };

/** Reparte las tarjetas por una esfera con el patron de la proporcion aurea (como la referencia),
 *  en tres capas de profundidad para que no queden todas a la misma distancia. */
function llocs(n: number): Lloc[] {
  const aureo = (1 + Math.sqrt(5)) / 2;
  const sortida: Lloc[] = [];
  for (let i = 0; i < n; i++) {
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0;
    const radiY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = (2 * Math.PI * i) / aureo;
    const capa = 10.5 + (i % 3) * 3.4;
    sortida.push({ x: Math.cos(theta) * radiY * capa, y: y * capa * 0.82, z: Math.sin(theta) * radiY * capa });
  }
  return sortida;
}

/** Una tarjeta flotante: un plano invisible que recibe el raton (clic y arrastre) y, encima, la
 *  tarjeta de verdad en DOM (captura y nombre), que mira siempre a la camara. */
function TargetaFlotant({
  projecte,
  lloc,
  onObrir
}: {
  projecte: Projecte;
  lloc: Lloc;
  onObrir: (p: Projecte) => void;
}) {
  const grup = useRef<THREE.Group>(null);
  const [sobre, setSobre] = useState(false);
  const { t } = useIdioma();

  useFrame(({ camera }) => {
    grup.current?.lookAt(camera.position);
  });

  return (
    <group ref={grup} position={[lloc.x, lloc.y, lloc.z]}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onObrir(projecte);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setSobre(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setSobre(false);
          document.body.style.cursor = "";
        }}
      >
        <planeGeometry args={[5, 6.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Html transform distanceFactor={9} position={[0, 0, 0.02]} pointerEvents="none" style={{ pointerEvents: "none" }}>
        <div className={`galaxia-card${sobre ? " galaxia-card--sobre" : ""}`}>
          <div className="galaxia-card__img">
            {projecte.captura ? (
              <img src={projecte.captura} alt="" draggable={false} />
            ) : (
              <span className="galaxia-card__buit" aria-hidden>
                {projecte.titol.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <p className="galaxia-card__nom">{projecte.curt}</p>
          <p className="galaxia-card__peu">{t("card.try")}</p>
        </div>
      </Html>
    </group>
  );
}

function Escena({ projectes, onObrir }: { projectes: Projecte[]; onObrir: (p: Projecte) => void }) {
  const llista = useMemo(() => llocs(projectes.length), [projectes.length]);
  const { camera } = useThree();

  // La camara arranca un poco por encima para que se vean varias capas; OrbitControls la deja
  // girar alrededor y acercarse o alejarse con la rueda (zoom), pero no desplazarse.
  useEffect(() => {
    camera.position.set(0, 1.5, 15.5);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[12, 12, 12]} intensity={0.4} />
      <Estrelles compte={620} abast={58} />
      {/* Dos esferas de alambre muy tenues en cian dan sensacion de volumen, como en la referencia. */}
      <mesh>
        <sphereGeometry args={[12, 24, 24]} />
        <meshBasicMaterial color={CIAN} wireframe transparent opacity={0.04} />
      </mesh>
      <mesh>
        <sphereGeometry args={[18, 24, 24]} />
        <meshBasicMaterial color={CIAN} wireframe transparent opacity={0.025} />
      </mesh>

      {projectes.map((p, i) => (
        <TargetaFlotant key={p.nom} projecte={p} lloc={llista[i]} onObrir={onObrir} />
      ))}

      <OrbitControls
        makeDefault
        // La rueda sola sigue moviendo la pagina, tambien sobre el lienzo; el zoom lo enciende
        // ZoomRueda solo con Ctrl (o Cmd) + rueda, y se queda entre minDistance y maxDistance.
        enableZoom={false}
        minDistance={7}
        maxDistance={40}
        enablePan={false}
        enableRotate
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.35}
        target={[0, 0, 0]}
      />
      <ZoomRueda />
    </>
  );
}

/* ---------- La galeria entera ---------- */

export function GalaxiaProjectes({ projectes }: { projectes: Projecte[] }) {
  const { t } = useIdioma();
  const caixa = useRef<HTMLDivElement>(null);
  const frameloop = useBucle(caixa);
  const [obert, setObert] = useState<Projecte | null>(null);
  // Un arrastre no debe abrir el modal: se mira cuanto se ha movido el puntero entre que baja y
  // que sube; si es mas que un dedo, fue un giro y no un clic.
  const baixa = useRef<{ x: number; y: number } | null>(null);
  const [arrossegant, setArrossegant] = useState(false);

  const obrir = (p: Projecte) => {
    const d = baixa.current;
    if (d) {
      // El clic de three llega con el pointerup; si el puntero se movio, era un giro.
      baixa.current = null;
    }
    setObert(p);
  };

  return (
    <>
      <div
        ref={caixa}
        aria-hidden
        className={`galaxia${arrossegant ? " galaxia--arrossega" : ""}${obert ? " galaxia--amagat" : ""}`}
        onPointerDown={(e) => {
          baixa.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          const d = baixa.current;
          if (d && !arrossegant && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) setArrossegant(true);
        }}
        onPointerUp={() => {
          baixa.current = null;
          if (arrossegant) window.setTimeout(() => setArrossegant(false), 0);
        }}
      >
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 1.5, 15.5], fov: 58 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Escena
            projectes={projectes}
            onObrir={(p) => {
              if (!arrossegant) obrir(p);
            }}
          />
        </Canvas>
      </div>

      {/* La rueda sola mueve la pagina; el zoom es con Ctrl (o Cmd) y la rueda. */}
      <p className="galaxia__pista">{t("zoom.pista", { k: teclaZoom() })}</p>

      {/* Via de teclado y lector de pantalla: abre el mismo modal, que si es accesible. */}
      <ul className="sr-only">
        {projectes.map((p) => (
          <li key={p.nom}>
            <button type="button" onClick={() => setObert(p)}>
              {t("car.aria")}: {p.titol}
            </button>
          </li>
        ))}
      </ul>

      {obert ? <ModalProjecte projecte={obert} onTancar={() => setObert(null)} /> : null}
    </>
  );
}

export default GalaxiaProjectes;
