// La banda de las demos (#demos): una seccion a todo el ancho entre la portada y la historia, con
// los nueve proyectos para probarlos ahi mismo. El titulo y "Despertar todas" van arriba, a los
// lados de la cabecera, y debajo el contenido cambia segun lo que aguante el equipo:
//   - Escritorio con WebGL: el anillo de verdad en 3D (galeria/orbita.tsx), grande y centrado.
//   - Escritorio sin WebGL: un escaparate de profundidad hecho con CSS (Galeria3D).
//   - Movil o movimiento reducido: la fila plana de siempre (Carrusel.tsx), con columnas de dos
//     tarjetas verticales que entran por la derecha y "Ver todos" al final.
//
// La banda es transparente a proposito: detras tiene que verse la animacion de la placa base
// (fons/motor.tsx), con sus pistas que el cursor ilumina, y por delante solo van las tarjetas y la
// ficha, que llevan su propio fondo. Por eso no lleva data-tapa (la placa se corta bajo la portada y
// bajo la historia, pero aqui no) ni fondo ni contorno. En la pelicula (relat/Escenari.tsx) la capa
// fijada del chip esta detras de todo el escenario; mientras pasa esta banda, esa capa se funde a
// transparente para que se vea la placa y no el chip, y vuelve al acabar.
//
// Las tarjetas de la fila plana y del escaparate (TargetaMini y TargetaTots) siguen usando las clases
// .portada__* de index.css, que son de tarjeta y no de la portada: la rejilla de la portada ya no
// las contiene, pero su estilo se queda donde estaba.

import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useIdioma } from "../lib/idioma";
import type { Projecte } from "../lib/projectes";
import { useDespertarTotes, useEstatDemo, useProjectesCtx } from "../lib/ProveidorProjectes";
import { BotoDemo, progres } from "./BotoDemo";
import { Captura } from "./Captura";
import { Carrusel } from "./Carrusel";
import { Galeria3D } from "./galeria/Galeria3D";
import { escaparata } from "./galeria/formes";
import { Limit, useCapaz } from "./galeria/comu3d";
import { Dreta, GitHub } from "./Icones";
import { Entrada, useMovil } from "./Moviment";

// El anillo de verdad en 3D (three + react-three-fiber) va en su propio trozo: solo se pide en
// escritorio con WebGL, nunca en la pantalla de acceso ni en el resto del portafolio.
const OrbitaDemos = lazy(() => import("./galeria/orbita"));

/* ---------- Las tarjetas de la fila plana y del escaparate ---------- */

/**
 * La tarjeta vertical: la captura arriba, tan ancha como la tarjeta, y debajo el nombre, el stack y
 * el boton de la demo. En la fila plana del movil, dos de estas una encima de otra son cada paso
 * del carrusel. El alto de la captura lo fija index.css (.portada__captura).
 */
function TargetaMini({ dades, prioritaria }: { dades: Projecte; prioritaria: boolean }) {
  const { t } = useIdioma();
  const quiet = useReducedMotion();
  const { fase, segons } = useEstatDemo(dades.demo);

  // La marca de equipo no es una tecnologia: en la tarjeta va en una sola palabra.
  const equip = t("chip.equip");
  const stack = dades.tec.slice(0, 3).map((una) => (una === equip ? t("demos.equip") : una));

  // Lo que va a la derecha del stack, en la misma linea para no sumar alto a todas las tarjetas
  // (las filas del carrusel miden lo que mide la mas alta): la nota de que la demo pide crear
  // una cuenta o, si no hay demo que abrir, en que punto esta el proyecto.
  const nota = dades.registre
    ? t("demos.registre")
    : !dades.demo && !dades.tancat && dades.marca
      ? t(dades.marca)
      : "";

  // Lo mismo que la tarjeta grande: si el rol no puede abrirla, lo dice; si no tiene demo,
  // lleva al codigo o cuenta en que punto esta.
  let pie: ReactNode = null;
  if (dades.tancat) {
    pie = (
      <p className="flex items-baseline gap-2 text-[13px] leading-snug">
        <span aria-hidden className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-espera" />
        <span className="font-medium text-tinta">{t("obres.nom")}</span>
      </p>
    );
  } else if (dades.demo) {
    pie = <BotoDemo url={dades.demo} titol={dades.titol} mida="mini" />;
  } else if (dades.url) {
    pie = (
      <a
        href={dades.url}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-linia px-3 text-[14px] font-semibold text-tinta transition-colors duration-200 hover:border-accent/40 pointer-coarse:min-h-11"
      >
        <GitHub />
        {t("feed.code")}
      </a>
    );
  }

  return (
    <article className="targeta portada__targeta rounded-[20px] border border-linia bg-fons-2">
      <div className="portada__captura relative overflow-hidden rounded-[8px] border border-linia bg-fons-3">
        {dades.captura ? (
          <Captura src={dades.captura} titol={dades.titol} alta={dades.alta} prioritaria={prioritaria} />
        ) : (
          <span aria-hidden className="composicio absolute inset-0" />
        )}
        {/* Mientras la demo arranca, una linea de 2 px en la base de la captura avanza con los
            segundos y se queda al 90 % hasta que contesta. Con movimiento reducido no se pinta. */}
        {fase === "waking" && !quiet ? (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-[1] h-[2px] origin-left bg-accent transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${progres(segons)})` }}
          />
        ) : null}
      </div>

      <div className="portada__text">
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-[22px] text-tinta">{dades.curt}</h3>
        {/* El stack a la izquierda y, si la hay, la nota a la derecha, siempre en una linea: una
            nota que bajara de linea alargaria la fila de todas las columnas. El stack ocupa lo que
            deja la nota y ensena las piezas enteras que caben (index.css, .portada__pila-lista). */}
        <div className="portada__pila">
          <p className="portada__pila-lista">
            {stack.map((una) => (
              <span key={una}>{una}</span>
            ))}
          </p>
          {nota ? <p className="shrink-0 whitespace-nowrap text-tinta-2">{nota}</p> : null}
        </div>
        {pie ? <div className="mt-auto pt-2">{pie}</div> : null}
      </div>
    </article>
  );
}

/**
 * Cierra la fila con la salida hacia la seccion de proyectos. Mide lo mismo que una tarjeta, para
 * que la columna en la que cae no cambie de altura: el numero de proyectos en contorno, como el de
 * las secciones, y abajo el enlace.
 */
function TargetaTots({ n }: { n: number }) {
  const { t } = useIdioma();
  return (
    <a href="#projectes" className="targeta portada__tots rounded-[20px] border border-linia bg-fons-2">
      <span aria-hidden className="num portada__tots-num">
        {n}
      </span>
      <span className="portada__tots-pie">
        <span className="text-[16px] font-semibold leading-snug text-tinta">{t("demos.tots")}</span>
        <span aria-hidden className="portada__tots-fletxa">
          <Dreta className="text-[18px]" />
        </span>
      </span>
    </a>
  );
}

type Peca = { clau: string; dades?: Projecte };

/* ---------- La banda ---------- */

export function Demos() {
  const { t } = useIdioma();
  const { llista, destacats, compte } = useProjectesCtx();
  // "Despertar todas" toca todas las demos de la lista, no solo las que se ven.
  const { comptes: c, apagat, despertarTotes } = useDespertarTotes();
  const quiet = useReducedMotion();
  const movil = useMovil();
  const capaz = useCapaz();
  // En escritorio con WebGL, el anillo de verdad en 3D (orbita.tsx). Sin WebGL pero con raton, el
  // escaparate de profundidad hecho con CSS (Galeria3D), que tambien da sensacion de 3D. En el
  // movil o con movimiento reducido, la fila plana de siempre, con scroll y snap.
  const escriptori = !quiet && !movil;
  const ambWebGL = escriptori && capaz;

  // Primero las cuatro destacadas, en su orden fijo, y despues el resto de la lista: la banda
  // lleva todos los proyectos. Detras del ultimo va la tarjeta que baja a #projectes.
  const destacades = new Set(destacats.map((p) => p.nom));
  const totes = [...destacats, ...llista.filter((p) => !destacades.has(p.nom))];

  if (!totes.length) return null;

  // Boton de despertarlas todas, el mismo en las tres versiones. Va en la cabecera de la banda.
  const despertarBtn =
    c.total > 0 ? (
      <button
        type="button"
        aria-disabled={apagat}
        onClick={despertarTotes}
        className="inline-flex min-h-11 items-center rounded-[8px] border border-accent/50 px-3 text-[14px] font-medium text-accent-2 transition-colors duration-200 hover:border-accent hover:bg-accent-bg aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:border-accent/50 aria-[disabled=true]:hover:bg-transparent"
      >
        {apagat ? t("proj.compte", { k: c.on, n: c.total }) : t("proj.totes")}
      </button>
    ) : null;

  const targetes = totes.map((dades, i) => <TargetaMini key={dades.nom} dades={dades} prioritaria={i < 2} />);

  // La fila plana del movil y del movimiento reducido: columnas de dos tarjetas, que entran por
  // la derecha. "Ver todos" cierra el recorrido.
  const peces: Peca[] = [...totes.map((dades) => ({ clau: dades.nom, dades })), { clau: "tots" }];
  const columnes: Peca[][] = [];
  for (let i = 0; i < peces.length; i += 2) columnes.push(peces.slice(i, i + 2));

  // Escaparate de CSS: la del centro de frente y entera, las vecinas inclinadas y hacia atras. Es
  // DOM de verdad (captura, nombre, stack y boton de la demo) y hace de respaldo del anillo 3D
  // cuando el equipo no tiene WebGL o el lienzo se cae.
  const escaparate = (
    <div className="ample demos__cos">
      <Galeria3D
        variant="gal3d--escaparata"
        colocar={escaparata}
        perspectiva={1050}
        autoPasos={0.11}
        alturaEscenari={(alt) => Math.round(alt * 1.06 + 20)}
        etiqueta={t("demos.titol")}
        barraDalt
      >
        {targetes}
        <TargetaTots key="tots" n={compte} />
      </Galeria3D>
    </div>
  );

  let cos: ReactNode;
  if (ambWebGL) {
    // Mientras llega el trozo del anillo se reserva su hueco entero (lienzo y pie), para que la
    // banda no crezca de golpe cuando aparece.
    const reserva = (
      <div aria-hidden className="orbita">
        <div className="orbita__llenc" />
        <div className="ample orbita__peu" />
      </div>
    );
    cos = (
      <Limit respaldo={escaparate}>
        <Suspense fallback={reserva}>
          <OrbitaDemos projectes={totes} />
        </Suspense>
      </Limit>
    );
  } else if (escriptori) {
    cos = escaparate;
  } else {
    cos = (
      <div className="ample demos__cos">
        <Carrusel compacte entra="dreta" quieta={movil} etiqueta={t("demos.titol")}>
          {columnes.map((columna, col) => (
            <div key={columna.map((peca) => peca.clau).join("+")} className="portada__col">
              {columna.map((peca) =>
                peca.dades ? (
                  <TargetaMini key={peca.clau} dades={peca.dades} prioritaria={col < 2} />
                ) : (
                  <TargetaTots key={peca.clau} n={compte} />
                )
              )}
            </div>
          ))}
        </Carrusel>
      </div>
    );
  }

  return (
    <section id="demos" aria-labelledby="demos-titol" className="demos">
      <div className="ample demos__cap">
        <Entrada y={8} duracio={0.24}>
          <h2 id="demos-titol" className="titular titular--l demos__titol">
            {t("demos.titol")}
          </h2>
          <p className="demos__nota">{t("demos.nota")}</p>
        </Entrada>
        <Entrada y={8} duracio={0.24} retard={0.06} className="demos__accions">
          {despertarBtn}
          <a
            href="#projectes"
            className="-my-3 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-[14px] text-accent-2 transition-colors duration-200 hover:text-tinta"
          >
            {t("demos.totes", { n: compte })}
            <Dreta className="text-[16px]" />
          </a>
        </Entrada>
      </div>

      {cos}
    </section>
  );
}
