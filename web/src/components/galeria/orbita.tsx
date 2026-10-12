// La galeria de las demos: un anillo de tarjetas girando entre particulas cian, a todo el ancho de
// la banda #demos (components/Demos.tsx). Cada pieza es la captura enmarcada como una tarjeta de
// esquinas redondeadas; al pasar el raton por encima sale su nombre, y al pulsarla se abre el mismo
// modal de proyecto que la galaxia de abajo (ModalProjecte.tsx): la captura, el detalle, "Probar la
// demo" y "Codigo", y la demo se inicia desde ahi. Con el modal abierto el anillo se queda quieto
// detras: no gasta GPU animando algo que queda bajo un velo.
//
// El lienzo es transparente y llega de borde a borde de la ventana: detras se ve la placa base del
// fondo, y los bordes se funden con una mascara. El bucle se apaga cuando la banda sale de la vista
// (useBucle). La camara se encuadra sola segun la forma del lienzo (encuadre), asi que el anillo
// entra de lado a lado a cualquier ancho. Con el raton encima se gira a gusto (arrastrar). La rueda
// sola sigue moviendo la pagina, tambien sobre el lienzo, para que nadie se quede atascado al llegar
// aqui; el zoom es con Ctrl + rueda (ZoomRueda, en piezas3d.tsx). Gira solo cuando no se toca.
//
// El teclado y el lector de pantalla no pasan por el 3D (va con aria-hidden): a su lado hay una
// lista equivalente, oculta a la vista, con un boton por proyecto que abre el mismo modal.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentRef, RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { CIAN, teclaZoom, useBucle } from "./comu3d";
import { ModalProjecte } from "./ModalProjecte";
import { Estrelles, Particules, ZoomRueda, prepararMapa } from "./piezas3d";

const RADI = 6.8; // radio del anillo y de la nube de particulas (holgado, sin que se solapen)
const ALT = 2.2; // alto de la captura en el mundo; el ancho sale de su proporcion
const MARC = 0.16; // margen oscuro alrededor de la captura, para que parezca una tarjeta
const CANTO = 0.14; // radio de las esquinas de la captura (la tarjeta lleva ese mas el margen)

const FOV = 36;
const ELEVACIO = THREE.MathUtils.degToRad(16); // cuanto mira la camara desde arriba al anillo
const AIRE_X = 0.95; // hasta donde llega el anillo de lado a lado (1 es el borde del lienzo)
const AIRE_Y = 0.9; // y de arriba abajo: la mascara del lienzo apaga el ultimo 10 %
const ZOOM_PROP = RADI + 2.4; // lo mas que se acerca con la rueda: sin atravesar la tarjeta de delante
const ZOOM_LLUNY = 1.45; // lo mas que se aleja, en veces la distancia de encuadre

const COLOR_TARGETA = new THREE.Color("#16181d");
const COLOR_BOIRA = "#0C0C0C";

type Peca = { projecte: Projecte; angle: number };

/**
 * El encuadre del anillo: a que distancia del centro se pone la camara y a que altura mira para que
 * el anillo entre entero en el lienzo, sea cual sea su forma (ancho y bajo en un portatil, casi
 * cuadrado en una tableta). Se prueban las tarjetas en su circulo, vistas desde la elevacion de
 * siempre, con la camara cada vez mas lejos, y se coge la primera distancia con la que caben de lado
 * a lado y de arriba abajo; en cada intento se centra en vertical. Cuenta con que la tarjeta que
 * tiene el raton encima crece un 4 %. Se calcula al montar y al cambiar el tamano del lienzo, no en
 * cada fotograma.
 */
function encuadre(aspecte: number, ampleMax: number): { dist: number; objectiu: number } {
  const tanV = Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
  const tanH = tanV * aspecte;
  const sen = Math.sin(ELEVACIO);
  const cos = Math.cos(ELEVACIO);
  // Medias medidas de una tarjeta con su margen y su marco, y un poco mas por si crece.
  const mw = (ampleMax / 2 + MARC + 0.065) * 1.06;
  const mh = (ALT / 2 + MARC + 0.065) * 1.06;
  const PASSOS = 36;

  let millor = { dist: 60, objectiu: 0 };
  for (let dist = 9; dist <= 60; dist += 0.25) {
    let objectiu = 0;
    let ample = 0; // lo que ocupa de lado a lado, en medios lienzos (1 es el borde)
    let alt = 0; // y de arriba abajo
    let propera = false; // alguna tarjeta queda casi pegada a la camara
    for (let intent = 0; intent < 4 && !propera; intent++) {
      // La camara esta en (0, objectiu + dist * sen, dist * cos) y mira a (0, objectiu, 0).
      ample = 0;
      let dalt = -Infinity;
      let baix = Infinity;
      for (let k = 0; k < PASSOS; k++) {
        const angle = (k / PASSOS) * Math.PI * 2;
        const cx = RADI * Math.cos(angle);
        const cz = RADI * Math.sin(angle);
        const dy = -objectiu - dist * sen;
        const dz = cz - dist * cos;
        const fons = -dy * sen - dz * cos; // cuanto queda por delante de la camara
        if (fons < 1.5) {
          propera = true;
          break;
        }
        const y = dy * cos - dz * sen; // a que altura del eje de la camara cae su centro
        ample = Math.max(ample, (Math.abs(cx) + mw) / (fons * tanH));
        dalt = Math.max(dalt, (y + mh) / (fons * tanV));
        baix = Math.min(baix, (y - mh) / (fons * tanV));
      }
      if (propera) break;
      alt = (dalt - baix) / 2;
      // Si el conjunto queda alto o bajo, se sube o se baja la mirada (y con ella la camara).
      objectiu += (((dalt + baix) / 2) * dist * tanV) / cos;
    }
    if (propera) continue;
    millor = { dist, objectiu };
    if (ample <= AIRE_X && alt <= AIRE_Y) break;
  }
  return millor;
}

/** Rectangulo de esquinas redondeadas, centrado en el origen. */
function formaArrodonida(w: number, h: number, r: number): THREE.Shape {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** La geometria de una tarjeta, con las UV de 0 a 1 sobre el rectangulo para que la captura llegue
 *  justo a los bordes. */
function geometriaTargeta(w: number, h: number, r: number): THREE.ShapeGeometry {
  const geo = new THREE.ShapeGeometry(formaArrodonida(w, h, r), 8);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  uv.needsUpdate = true;
  return geo;
}

/** Un degradado radial blanco que se apaga hacia el borde, para el resplandor del suelo. */
function textureResplandor(): THREE.CanvasTexture {
  const mida = 128;
  const c = document.createElement("canvas");
  c.width = c.height = mida;
  const g = c.getContext("2d");
  if (g) {
    const r = mida / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, mida, mida);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** La camara gira alrededor del anillo (arrastrando o sola) y hace zoom con Ctrl + rueda. Se para
 *  sola mientras el raton esta encima, para no pelearse con quien la mueve. */
function Vista({
  pausat,
  ampleMax
}: {
  pausat: RefObject<boolean>;
  /** La tarjeta mas ancha, en unidades del mundo. */
  ampleMax: number;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, scene } = useThree();
  // Distancia de encuadre con la que se puso la camara la ultima vez: sirve para conservar el zoom
  // de la persona cuando cambia la forma del lienzo.
  const base = useRef(0);

  const encuadrar = () => {
    const c = controls.current;
    if (!c) return;
    const { dist, objectiu } = encuadre(size.width / Math.max(1, size.height), ampleMax);
    const zoom = base.current ? camera.position.distanceTo(c.target) / base.current : 1;
    base.current = dist;
    // La direccion en la que esta la camara se conserva: si alguien ha girado el anillo, sigue
    // viendolo desde donde lo dejo.
    const dir = camera.position.clone().sub(c.target).normalize();
    c.target.set(0, objectiu, 0);
    camera.position.copy(c.target).addScaledVector(dir, dist * zoom);
    c.minDistance = ZOOM_PROP;
    c.maxDistance = dist * ZOOM_LLUNY;
    c.update();
  };

  // Al montar y cada vez que cambia el tamano del lienzo.
  useLayoutEffect(encuadrar, [camera, size.width, size.height, ampleMax]);

  useFrame(() => {
    const c = controls.current;
    if (!c) return;
    // Por si los controles aun no existian cuando se monto el efecto de arriba.
    if (!base.current) encuadrar();
    // Gira solo salvo mientras el raton esta encima (para leer, pulsar o arrastrar). Al sacar el
    // raton del lienzo vuelve a girar, aunque hayas pulsado una tarjeta.
    c.autoRotate = !pausat.current;

    // La niebla sigue a la camara: las tarjetas de delante quedan limpias y las del fondo se
    // apagan hacia el color de la banda, igual a cualquier zoom.
    const boira = scene.fog as THREE.Fog | null;
    if (boira) {
      const d = camera.position.distanceTo(c.target);
      boira.near = d - RADI * 0.4;
      boira.far = d + RADI * 2.6;
    }
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        makeDefault
        // El zoom lo enciende ZoomRueda solo con Ctrl (o Cmd) + rueda; con la rueda sola, que sigue
        // moviendo la pagina, esta apagado. Los topes de distancia los ponen minDistance y
        // maxDistance en encuadrar().
        enableZoom={false}
        enablePan={false}
        enableRotate
        autoRotate
        autoRotateSpeed={0.3}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.08}
        maxPolarAngle={Math.PI * 0.92}
      />
      <ZoomRueda />
    </>
  );
}

/** La pista del suelo: un aro fino bajo las tarjetas y otro mas tenue por fuera, y un resplandor
 *  blando debajo de todo. Le da al anillo un sitio donde estar, sin competir con las capturas. */
function Suelo() {
  const glow = useMemo(textureResplandor, []);
  useEffect(() => () => glow.dispose(), [glow]);
  const y = -ALT / 2 - MARC - 0.35;
  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[RADI * 3.1, RADI * 3.1]} />
        <meshBasicMaterial
          map={glow}
          color={CIAN}
          transparent
          opacity={0.26}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[RADI - 0.03, RADI + 0.03, 160]} />
        <meshBasicMaterial color={CIAN} transparent opacity={0.38} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[RADI + 0.7, RADI + 0.73, 160]} />
        <meshBasicMaterial color={CIAN} transparent opacity={0.14} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Una tarjeta del anillo: mira siempre a la camara, la captura va enmarcada sobre un fondo oscuro
 *  de esquinas redondeadas y, con el raton encima, se agranda un poco y le sale un marco cian. */
function Targeta({
  peca,
  textura,
  ample,
  sobre,
  onObrir,
  onSobre
}: {
  peca: Peca;
  textura: THREE.Texture;
  ample: number;
  sobre: boolean;
  onObrir: () => void;
  onSobre: (dins: boolean) => void;
}) {
  const grup = useRef<THREE.Group>(null);
  const escala = useRef(1);
  const w = ALT * ample;

  const geoCaptura = useMemo(() => geometriaTargeta(w, ALT, CANTO), [w]);
  const geoFons = useMemo(() => geometriaTargeta(w + MARC * 2, ALT + MARC * 2, CANTO + MARC), [w]);
  const geoMarc = useMemo(() => geometriaTargeta(w + MARC * 2 + 0.13, ALT + MARC * 2 + 0.13, CANTO + MARC + 0.065), [w]);
  useEffect(
    () => () => {
      geoCaptura.dispose();
      geoFons.dispose();
      geoMarc.dispose();
    },
    [geoCaptura, geoFons, geoMarc]
  );

  useFrame(({ camera }, dt) => {
    const g = grup.current;
    if (!g) return;
    g.lookAt(camera.position);
    // Crece con suavidad, no de golpe: un 4 % con el raton encima.
    const objectiu = sobre ? 1.04 : 1;
    escala.current += (objectiu - escala.current) * (1 - Math.exp(-dt * 12));
    g.scale.setScalar(escala.current);
  });

  const x = RADI * Math.cos(peca.angle);
  const z = RADI * Math.sin(peca.angle);

  return (
    <group ref={grup} position={[x, 0, z]}>
      {/* Marco cian, solo con el raton encima. */}
      <mesh geometry={geoMarc} position={[0, 0, -0.02]} visible={sobre} raycast={() => null}>
        <meshBasicMaterial color={CIAN} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* Fondo oscuro de la tarjeta (el margen alrededor de la captura). Es lo que recibe el raton. */}
      <mesh
        geometry={geoFons}
        position={[0, 0, -0.01]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onSobre(true);
        }}
        onPointerOut={() => onSobre(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // Soltar un arrastre encima de una tarjeta no es pulsarla: react-three-fiber dispara el clic
          // igualmente y solo cuenta cuanto se movio el puntero (delta). Con unos pocos pixeles de
          // margen para el temblor de la mano.
          if (e.delta > 4) return;
          onObrir();
        }}
      >
        <meshBasicMaterial color={COLOR_TARGETA} toneMapped={false} />
      </mesh>
      {/* La captura. */}
      <mesh geometry={geoCaptura} raycast={() => null}>
        <meshBasicMaterial map={textura} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Escena({
  peces,
  pausat,
  sobre,
  onObrir,
  onSobre
}: {
  peces: Peca[];
  pausat: RefObject<boolean>;
  sobre: number | null;
  onObrir: (i: number) => void;
  /** El raton entra (dins) o sale de la tarjeta i. */
  onSobre: (i: number, dins: boolean) => void;
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
      {/* La niebla va del color de la pagina: las tarjetas del fondo se apagan sin dejar un halo claro.
          Sus distancias las pone Vista en cada fotograma. */}
      <fog attach="fog" args={[COLOR_BOIRA, 20, 40]} />
      <Vista pausat={pausat} ampleMax={ALT * Math.max(...amples)} />
      <Estrelles compte={1500} abast={60} />
      <Particules compte={1400} radi={RADI} dispersio={4.4} mida={0.11} color={CIAN} opacitat={1} />
      <Suelo />
      {peces.map((peca, i) => (
        <Targeta
          key={peca.projecte.nom}
          peca={peca}
          textura={mapes[i]}
          ample={amples[i]}
          sobre={sobre === i}
          onObrir={() => onObrir(i)}
          onSobre={(dins) => onSobre(i, dins)}
        />
      ))}
    </>
  );
}

/**
 * La galeria entera: el lienzo con el anillo, a todo el ancho; la pista de lo que se puede hacer
 * debajo, centrada; la lista equivalente para teclado y lector de pantalla; y, si se ha pulsado un
 * proyecto, el modal de proyecto (el mismo que el de la galaxia de #projectes).
 */
export function OrbitaDemos({ projectes }: { projectes: Projecte[] }) {
  const { t } = useIdioma();
  const caixa = useRef<HTMLDivElement>(null);
  const etiqueta = useRef<HTMLSpanElement>(null);
  const bucle = useBucle(caixa);
  const pausat = useRef(false);

  // Una pieza por proyecto, repartidas por todo el anillo, con la primera de cara a la camara al
  // empezar. No se repiten: con el radio holgado queda sitio de sobra entre tarjetas.
  const peces = useMemo<Peca[]>(() => {
    const amb = projectes.filter((p) => p.captura);
    return amb.map((projecte, i) => ({ projecte, angle: Math.PI / 2 + (i / amb.length) * Math.PI * 2 }));
  }, [projectes]);

  // El proyecto que se esta viendo en el modal. Con el modal abierto el anillo se esconde y se
  // para detras del velo, igual que hace la galaxia: ni se ve por encima ni gasta GPU.
  const [obert, setObert] = useState<Projecte | null>(null);
  const tancar = useCallback(() => setObert(null), []);
  const frameloop = obert ? "never" : bucle;

  // La tarjeta que tiene el raton encima y la ultima que lo tuvo: el nombre se queda escrito
  // mientras se desvanece.
  const [sobre, setSobre] = useState<number | null>(null);
  const [ultima, setUltima] = useState(0);
  const alSobre = (i: number, dins: boolean) => {
    setSobre((actual) => (dins ? i : actual === i ? null : actual));
    if (dins) setUltima(i);
  };

  if (!peces.length) return null;

  return (
    <div className="orbita">
      <div
        ref={caixa}
        aria-hidden
        className={`orbita__llenc${sobre != null ? " orbita__llenc--sobre" : ""}${obert ? " orbita__llenc--amagat" : ""}`}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") pausat.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") pausat.current = false;
        }}
        onPointerMove={(e) => {
          // El nombre sigue al raton sin pasar por el estado de React.
          const nom = etiqueta.current;
          if (!nom) return;
          const r = e.currentTarget.getBoundingClientRect();
          nom.style.transform = `translate(${Math.round(e.clientX - r.left)}px, ${Math.round(e.clientY - r.top)}px)`;
        }}
      >
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{
            position: [0, 16 * Math.sin(ELEVACIO), 16 * Math.cos(ELEVACIO)],
            fov: FOV,
            near: 1,
            far: 120
          }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Escena
            peces={peces}
            pausat={pausat}
            sobre={sobre}
            onObrir={(i) => setObert(peces[i].projecte)}
            onSobre={alSobre}
          />
        </Canvas>
        <span ref={etiqueta} className="orbita__nom" data-visible={sobre != null}>
          {peces[ultima]?.projecte.curt}
        </span>
      </div>

      <div className="ample orbita__peu">
        <p className="orbita__pista">{t("orbita.pista", { k: teclaZoom() })}</p>
      </div>

      {/* La via de teclado y lector de pantalla: un boton por proyecto que abre el mismo modal. */}
      <ul className="sr-only">
        {projectes.map((p) => (
          <li key={p.nom}>
            <button type="button" onClick={() => setObert(p)}>
              {t("car.aria")}: {p.titol}
            </button>
          </li>
        ))}
      </ul>

      {obert ? <ModalProjecte projecte={obert} onTancar={tancar} /> : null}
    </div>
  );
}

export default OrbitaDemos;
