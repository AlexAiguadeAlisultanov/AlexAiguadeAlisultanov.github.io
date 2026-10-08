// La galeria de la portada: un anillo de capturas girando entre particulas cian, al estilo del
// orbit de la referencia pero con nuestro color y con las capturas reales de las nueve demos.
// Gira solo; al posar el raton se para y la pieza de delante (o la que se senala) manda; al
// pulsar una pieza se despierta o se abre esa demo, con las mismas fases de siempre.
//
// Vive en la columna derecha de la portada, dentro de su hueco: el lienzo es transparente (deja
// ver la placa base), las estrellas son un velo y el bucle se apaga cuando la portada sale de la
// vista. Nada de pantalla completa ni de secuestrar el scroll: no hay OrbitControls, el anillo
// gira por su cuenta y la rueda del raton sigue moviendo la pagina.
//
// El teclado y el lector de pantalla no pasan por el 3D (va con aria-hidden): a su lado hay una
// lista equivalente, oculta a la vista pero con los mismos botones de probar la demo.

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { esAdormida } from "../../lib/demos";
import { useDespertar, useProjectesCtx } from "../../lib/ProveidorProjectes";
import { BotoDemo } from "../BotoDemo";
import { CIAN, useBucle } from "./comu3d";
import { Estrelles, Particules, prepararMapa } from "./piezas3d";

const RADI = 6; // radio del anillo y de la nube de particulas
const ALT_IMATGE = 2.05; // alto de cada captura en el mundo; el ancho sale de su proporcion
const DIR_CAMARA = new THREE.Vector3(0, 0.46, 1).normalize(); // por encima, para que el anillo se abra

/** Encuadra el anillo dentro del lienzo, mida lo que mida la columna: aleja la camara lo justo
 *  para que la vuelta entera llene el hueco tanto de ancho como de alto, con poco margen. */
function Encuadre() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspecte = Math.max(0.3, size.width / size.height);
    const vFov = (cam.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspecte);
    const fov = Math.min(vFov, hFov);
    const radi = RADI + ALT_IMATGE * 0.5;
    // El 0,9 deja un dedo de margen pero hace que el anillo llene casi toda la columna.
    const dist = (radi / Math.sin(fov / 2)) * 0.9;
    cam.position.copy(DIR_CAMARA.clone().multiplyScalar(dist));
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type Peca = { projecte: Projecte; angle: number; ample: number };

/** El anillo de capturas. Gira solo y, cuando el raton esta sobre el lienzo, se queda quieto para
 *  que la pieza de delante no se escape. */
function Anell({
  peces,
  textures,
  pausat,
  onFront,
  onSobre,
  onFora,
  onTriarPeca
}: {
  peces: Peca[];
  textures: THREE.Texture[];
  pausat: RefObject<boolean>;
  onFront: (i: number) => void;
  onSobre: (i: number) => void;
  onFora: () => void;
  onTriarPeca: (i: number) => void;
}) {
  const grup = useRef<THREE.Group>(null);
  const vel = useRef(0);
  const front = useRef(-1);

  useFrame((_, dt) => {
    const g = grup.current;
    if (!g) return;
    const pas = Math.min(0.05, dt);
    const objectiu = pausat.current ? 0 : 0.17;
    vel.current += (objectiu - vel.current) * (1 - Math.exp(-pas / 0.4));
    g.rotation.y += vel.current * pas;

    // La pieza de delante es la que queda mas cerca de mirar a la camara (angulo pi/2 en el
    // plano del anillo). Se avisa solo cuando cambia, no cada fotograma.
    const objetiu = Math.PI / 2 - g.rotation.y;
    let millor = 0;
    let menor = Infinity;
    for (let i = 0; i < peces.length; i++) {
      let d = Math.abs(((peces[i].angle - objetiu + Math.PI) % (2 * Math.PI)) - Math.PI);
      d = Math.min(d, 2 * Math.PI - d);
      if (d < menor) {
        menor = d;
        millor = i;
      }
    }
    if (millor !== front.current) {
      front.current = millor;
      onFront(millor);
    }
  });

  return (
    <group ref={grup}>
      {peces.map((peca, i) => {
        const x = RADI * Math.cos(peca.angle);
        const z = RADI * Math.sin(peca.angle);
        // La captura mira hacia afuera del anillo (tangente), como en el orbit.
        const rotY = -peca.angle + Math.PI / 2;
        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              onSobre(i);
            }}
            onPointerOut={() => onFora()}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onTriarPeca(i);
            }}
          >
            <planeGeometry args={[ALT_IMATGE * peca.ample, ALT_IMATGE]} />
            <meshBasicMaterial map={textures[i]} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function Escena({
  peces,
  pausat,
  onFront,
  onSobre,
  onFora,
  onTriarPeca
}: {
  peces: Peca[];
  pausat: RefObject<boolean>;
  onFront: (i: number) => void;
  onSobre: (i: number) => void;
  onFora: () => void;
  onTriarPeca: (i: number) => void;
}) {
  const textures = useLoader(
    THREE.TextureLoader,
    peces.map((p) => p.projecte.captura)
  );
  const mapes = useMemo(() => textures.map((t) => prepararMapa(t)), [textures]);
  // El ancho de cada pieza sale de la proporcion real de su captura, para que no se estire.
  const amb = useMemo(
    () =>
      peces.map((p, i) => {
        const img = mapes[i].image as { width?: number; height?: number } | undefined;
        const prop = img && img.width && img.height ? img.width / img.height : 1.6;
        return { ...p, ample: prop };
      }),
    [peces, mapes]
  );

  return (
    <>
      <Encuadre />
      <ambientLight intensity={0.9} />
      <pointLight position={[8, 8, 8]} intensity={0.5} />
      <Estrelles compte={460} abast={40} />
      <Particules compte={1400} radi={RADI} dispersio={4.4} mida={0.11} color={CIAN} opacitat={1} />
      <Anell
        peces={amb}
        textures={mapes}
        pausat={pausat}
        onFront={onFront}
        onSobre={onSobre}
        onFora={onFora}
        onTriarPeca={onTriarPeca}
      />
    </>
  );
}

/**
 * La galeria entera: el lienzo con el anillo, una leyenda con el proyecto de delante y su boton de
 * probar, y la lista equivalente para teclado y lector de pantalla.
 */
export function OrbitaDemos({ projectes, acciones }: { projectes: Projecte[]; acciones?: ReactNode }) {
  const { t } = useIdioma();
  const { demos } = useProjectesCtx();
  const despertar = useDespertar();
  const caixa = useRef<HTMLDivElement>(null);
  const frameloop = useBucle(caixa);
  const pausat = useRef(false);

  // Nueve proyectos llenan poco el anillo: se repiten hasta dar la vuelta con holgura, pero cada
  // pieza sigue apuntando a su proyecto, asi que pulsar cualquier copia abre esa demo.
  const peces = useMemo<Peca[]>(() => {
    const amb = projectes.filter((p) => p.captura);
    if (!amb.length) return [];
    const total = amb.length >= 12 ? amb.length : amb.length * 2;
    const llista: Peca[] = [];
    for (let i = 0; i < total; i++) {
      llista.push({
        projecte: amb[i % amb.length],
        angle: (i / total) * Math.PI * 2,
        ample: 1.6
      });
    }
    return llista;
  }, [projectes]);

  const [front, setFront] = useState(0);
  const [sobre, setSobre] = useState<number | null>(null);

  // El sujeto de la leyenda: la pieza que se senala o, si no, la de delante (que esta quieta
  // porque el raton para el giro). Nunca cambia mientras alcanzas su boton.
  const triat = peces[sobre ?? front]?.projecte ?? peces[0]?.projecte;

  const activar = (p: Projecte | undefined) => {
    if (!p || !p.demo || p.tancat) return;
    const dorm = esAdormida(p.demo);
    const fase = dorm ? demos.fase(p.demo) : "on";
    if (!dorm || fase === "on") {
      demos.visita(p.demo);
      window.open(p.demo, "_blank", "noopener");
    } else if (fase !== "waking") {
      despertar(p.demo, p.titol);
    }
  };

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
          if (e.pointerType === "mouse") {
            pausat.current = false;
            setSobre(null);
          }
        }}
      >
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 2, 13], fov: 50 }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Escena
            peces={peces}
            pausat={pausat}
            onFront={setFront}
            onSobre={setSobre}
            onFora={() => setSobre(null)}
            onTriarPeca={(i) => {
              setSobre(i);
              activar(peces[i].projecte);
            }}
          />
        </Canvas>
      </div>

      {/* Leyenda: el proyecto de delante y su boton real de probar la demo. */}
      {triat ? (
        <div className="orbita__peu">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-tinta">{triat.curt}</p>
            <p className="text-[13px] text-tinta-3">
              {triat.registre ? t("demos.registre") : t("orbita.pista")}
            </p>
          </div>
          <div className="orbita__boto">
            {triat.demo && !triat.tancat ? (
              <BotoDemo url={triat.demo} titol={triat.titol} mida="mini" />
            ) : null}
          </div>
        </div>
      ) : null}

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
