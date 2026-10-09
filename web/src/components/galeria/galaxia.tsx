// La galeria de la seccion de proyectos: las tarjetas flotan repartidas por un espacio estrellado
// y se arrastra para mirar alrededor, al estilo del StellarCardGallery de la referencia pero con
// el cian de la web. Cada tarjeta lleva su captura y su nombre; al pulsarla se abre un modal con
// el detalle del proyecto (ano, individual o equipo, que hizo Alex, tecnologias, probar la demo y
// codigo), que se cierra con la X, con Escape o tocando fuera y atrapa el foco.
//
// Como la de la portada: vive dentro de la pagina (no ocupa la pantalla), el lienzo es
// transparente con un velo de estrellas, OrbitControls solo gira (sin zoom ni desplazamiento, asi
// la rueda sigue moviendo la pagina) y el bucle se apaga cuando la seccion sale de la vista. El
// 3D va con aria-hidden; el teclado y el lector de pantalla abren el mismo modal desde una lista.

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useIdioma } from "../../lib/idioma";
import type { Projecte } from "../../lib/projectes";
import { BotoDemo, CTA, progres } from "../BotoDemo";
import { useEstatDemo } from "../../lib/ProveidorProjectes";
import { Captura } from "../Captura";
import { GitHub, Tancar } from "../Icones";
import { Estrelles } from "./piezas3d";
import { CIAN, useBucle } from "./comu3d";

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
  // girar alrededor pero no acercarse ni desplazarse.
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
        enableZoom={false}
        enablePan={false}
        enableRotate
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.35}
        target={[0, 0, 0]}
      />
    </>
  );
}

/* ---------- El modal con el detalle del proyecto ---------- */

const ETIQUETA = "text-[12px] font-medium uppercase leading-normal tracking-[0.14em] text-tinta-3";

function ModalProjecte({ projecte, onTancar }: { projecte: Projecte; onTancar: () => void }) {
  const { t } = useIdioma();
  const { dorm, fase, segons } = useEstatDemo(projecte.demo);
  const quiet = useRef<boolean>(false);
  const dialeg = useRef<HTMLDivElement>(null);
  const idTitol = "modal-titol-" + projecte.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const individual = projecte.persones <= 1;

  // Atrapa el foco dentro del dialogo, cierra con Escape y devuelve el foco a donde estaba.
  useEffect(() => {
    quiet.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const abans = document.activeElement as HTMLElement | null;
    const node = dialeg.current;
    const focos = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const primero = focos()[0] ?? node;
    primero?.focus();

    const alTeclat = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onTancar();
        return;
      }
      if (e.key !== "Tab") return;
      const llista = focos();
      if (!llista.length) return;
      const primer = llista[0];
      const ultim = llista[llista.length - 1];
      if (e.shiftKey && document.activeElement === primer) {
        e.preventDefault();
        ultim.focus();
      } else if (!e.shiftKey && document.activeElement === ultim) {
        e.preventDefault();
        primer.focus();
      }
    };

    document.addEventListener("keydown", alTeclat, true);
    const abansOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alTeclat, true);
      document.body.style.overflow = abansOverflow;
      abans?.focus?.();
    };
  }, [onTancar]);

  const avanc =
    projecte.demo && dorm && fase === "waking" && !quiet.current ? (
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
        style={{ transform: `scaleX(${progres(segons)})` }}
      />
    ) : null;

  return (
    <div
      className="galaxia-modal"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onTancar();
      }}
    >
      <div
        ref={dialeg}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitol}
        className="galaxia-modal__cos targeta rounded-[20px] border border-linia bg-fons-2"
      >
        <button
          type="button"
          onClick={onTancar}
          aria-label={t("nav.close")}
          className="absolute right-3 top-3 z-[2] inline-grid size-10 place-items-center rounded-[12px] border border-linia bg-fons-2/80 text-[18px] text-tinta-2 backdrop-blur transition-colors duration-200 hover:border-accent/40 hover:text-tinta"
        >
          <Tancar />
        </button>

        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[20px] border-b border-linia bg-fons-3">
          {projecte.captura ? (
            <Captura src={projecte.captura} titol={projecte.titol} alta={projecte.alta} prioritaria />
          ) : (
            <span className="composicio absolute inset-0" aria-hidden />
          )}
          {avanc}
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className={`${ETIQUETA} flex flex-wrap items-center gap-x-2`}>
              {projecte.anyInici ? <span>{projecte.anyInici}</span> : null}
              {projecte.anyInici && projecte.persones ? <span aria-hidden>·</span> : null}
              {projecte.persones ? (
                <span>{individual ? t("proj.sol") : t("proj.equip", { n: projecte.persones })}</span>
              ) : null}
            </p>
            {projecte.demo && projecte.url ? (
              <a
                href={projecte.url}
                target="_blank"
                rel="noopener"
                className="-my-2 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[8px] px-2 text-[14px] text-tinta-3 transition-colors duration-200 hover:text-tinta"
              >
                <GitHub />
                {t("feed.code")}
              </a>
            ) : null}
          </div>

          <h3 id={idTitol} className="mt-2 text-[21px] font-semibold leading-snug tracking-tight text-tinta">
            {projecte.titol}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-tinta-2">{projecte.lema}</p>

          {projecte.aportacio.length ? (
            <>
              <p className={`${ETIQUETA} mt-5`}>{t(individual ? "proj.paper.sol" : "proj.paper.equip")}</p>
              <ul className="mt-2 space-y-1.5">
                {projecte.aportacio.map((frase) => (
                  <li
                    key={frase}
                    className="relative pl-4 text-[14px] leading-5 text-tinta-2 before:absolute before:left-0 before:top-2.5 before:h-px before:w-2 before:bg-accent"
                  >
                    {frase}
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {projecte.pila.length ? (
            <ul aria-label={t("chips.aria")} className="mt-5 flex flex-wrap gap-1.5">
              {projecte.pila.map((una) => (
                <li
                  key={una}
                  className="rounded-[8px] border border-linia bg-fons-3 px-1.5 py-[3px] text-[12px] leading-snug text-tinta-2"
                >
                  {una}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6">
            {projecte.demo ? (
              <BotoDemo url={projecte.demo} titol={projecte.titol} />
            ) : projecte.url ? (
              <a
                href={projecte.url}
                target="_blank"
                rel="noopener"
                className={`${CTA} border border-linia text-tinta hover:border-accent/40`}
              >
                <GitHub />
                {t("proj.code")}
              </a>
            ) : null}
            {/* La nota de que la demo pide crear cuenta (el Volkswagen), donde toca. */}
            {projecte.registre ? <p className="mt-3 text-[13px] text-tinta-3">{t("demos.registre")}</p> : null}
          </div>
        </div>
      </div>
    </div>
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
        className={`galaxia${arrossegant ? " galaxia--arrossega" : ""}`}
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
