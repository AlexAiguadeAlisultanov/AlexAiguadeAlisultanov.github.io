import type { ReactNode } from "react";
import { useIdioma } from "../lib/idioma";
import type { Projecte } from "../lib/projectes";
import { useDespertar, useEstatDemo, useProjectesCtx } from "../lib/ProveidorProjectes";
import type { Demos, Fase } from "../lib/demos";
import { BotoDemo, CTA } from "./BotoDemo";
import { Carrusel } from "./Carrusel";
import { GitHub } from "./Icones";

const COLOR_FASE: Record<Fase | "obres", string> = {
  off: "bg-tinta-3",
  waking: "bg-espera",
  on: "bg-be",
  fail: "bg-malament",
  obres: "bg-espera"
};

const BOTO =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[8px] px-4 text-[14px] " +
  "font-semibold transition-colors duration-200";

function Chips({ tec, etiqueta }: { tec: string[]; etiqueta: string }) {
  if (!tec.length) return null;
  return (
    <ul aria-label={etiqueta} className="mt-4 flex flex-wrap gap-2">
      {tec.map((una) => (
        <li
          key={una}
          className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-0.5 text-[14px] text-tinta-2"
        >
          {una}
        </li>
      ))}
    </ul>
  );
}

/** Proyecto sin captura: sus iniciales en contorno sobre un halo del acento. */
function Composicio({ titol }: { titol: string }) {
  const inicials = titol
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return (
    <div className="composicio absolute inset-0 grid place-items-center" aria-hidden>
      <span className="composicio__lletres">{inicials || titol.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

function Targeta({ dades }: { dades: Projecte }) {
  const { t } = useIdioma();
  const { demos, dorm, fase, enMarxa, segons } = useEstatDemo(dades.demo);
  const despertarDemo = useDespertar();
  const idEstat = "estat-demo-" + dades.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const despertar = () => despertarDemo(dades.demo, dades.titol);

  const imatge = dades.captura ? (
    <img
      src={dades.captura}
      alt={t("card.shot", { t: dades.titol })}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`captura ${dades.alta ? "captura--alta" : "captura--plana"}`}
    />
  ) : (
    <Composicio titol={dades.titol} />
  );

  // Etiqueta sobre la captura solo cuando hay algo que contar: arrancando, lista o sin
  // respuesta. Dormida sin tocar no lleva nada, el boton ya lo dice.
  const pastilla =
    dorm && fase !== "off" ? (
      <span className="absolute left-3 top-3 flex items-center gap-2 rounded-[8px] bg-fons/85 px-2.5 py-1 text-[14px] font-medium text-tinta">
        <span aria-hidden className={`size-2 rounded-full ${COLOR_FASE[fase]}`} />
        {fase === "waking"
          ? t("card.waking", { s: segons })
          : fase === "on"
            ? t("card.ready")
            : t("estat.fail")}
      </span>
    ) : null;

  // La captura tambien abre la demo, pero solo con el raton o el dedo: para el teclado y
  // los lectores de pantalla ya esta el boton, y asi no hay dos paradas iguales.
  let marc: ReactNode;
  const classeMarc = "captura-marc relative block aspect-[16/10] overflow-hidden border-b border-linia bg-fons-3";
  if (dades.demo && enMarxa) {
    marc = (
      <a
        href={dades.demo}
        target="_blank"
        rel="noopener"
        tabIndex={-1}
        aria-hidden
        onClick={() => demos.visita(dades.demo)}
        className={classeMarc}
      >
        {imatge}
        {pastilla}
      </a>
    );
  } else {
    marc = (
      <div
        className={`${classeMarc} ${dades.demo && !dades.tancat ? "cursor-pointer" : ""}`}
        onClick={dades.demo && !dades.tancat ? despertar : undefined}
      >
        {imatge}
        {pastilla}
      </div>
    );
  }

  return (
    <article className="targeta flex h-full flex-col overflow-hidden rounded-[20px] border border-linia bg-fons-2">
      {marc}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-tinta sm:text-[21px]">
          {dades.titol}
        </h3>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-tinta-2">{dades.lema}</p>

        <Chips tec={dades.tec.slice(0, 3)} etiqueta={t("chips.aria")} />

        {/* Proyecto que este rol no puede abrir: la tarjeta se queda sin pie, con la
            linea que dice que esta a medias ocupando ese sitio. */}
        {dades.tancat ? (
          <p className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-6 text-[14px]">
            <span aria-hidden className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${COLOR_FASE.obres}`} />
            <span className="font-medium text-tinta">{t("obres.nom")}</span>
            <span className="text-tinta-3">{t("obres.why")}</span>
          </p>
        ) : (
          <div className="mt-auto pt-6">
            {dades.demo ? (
              // Mientras la demo no conteste, el boton la despierta y cuenta los segundos; cuando
              // contesta, el mismo hueco pasa a ser el enlace que la abre. Nunca los dos a la vez.
              <BotoDemo url={dades.demo} titol={dades.titol} descrit={idEstat} />
            ) : dades.url ? (
              <a
                href={dades.url}
                target="_blank"
                rel="noopener"
                className={`${CTA} border border-linia text-tinta hover:border-accent/40`}
              >
                <GitHub />
                {t("proj.code")}
              </a>
            ) : null}

            {dorm && !enMarxa ? (
              <p id={idEstat} className="mt-3 text-[14px] leading-relaxed text-tinta-3">
                {fase === "fail" ? t("estat.fail.why") : t("card.note")}
              </p>
            ) : null}

            {dades.demo && dades.url ? (
              <a
                href={dades.url}
                target="_blank"
                rel="noopener"
                className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-[14px] text-tinta-3 transition-colors duration-200 hover:text-tinta"
              >
                <GitHub />
                {t("feed.code")}
              </a>
            ) : null}

            {!dades.demo && dades.marca ? (
              <p className="mt-3 text-[14px] text-tinta-3">{t(dades.marca)}</p>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

function Panell({ demos }: { demos: Demos }) {
  const { t } = useIdioma();
  const c = demos.comptes;
  if (!c.total) return null;

  let etiqueta: string;
  let pista = "";
  let apagat: boolean;

  if (c.waking) {
    etiqueta = c.waking === 1 ? t("wake.working.one") : t("wake.working", { n: c.waking });
    pista = t("wake.hint.working", { s: c.segons });
    apagat = true;
  } else if (c.on === c.total) {
    etiqueta = t("wake.done");
    pista = t("wake.hint.done");
    apagat = true;
  } else if (c.fail) {
    const queden = c.off + c.fail;
    etiqueta = queden === 1 ? t("wake.retry.one") : t("wake.retry", { n: queden });
    pista = t("wake.hint.some");
    apagat = false;
  } else {
    etiqueta = c.off === 1 ? t("wake.on.one") : t("wake.on", { n: c.off });
    apagat = false;
  }

  // Compacto y en segundo plano: el gesto principal de la seccion es probar una demo, y
  // ese boton esta en cada tarjeta.
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[20px] border border-linia bg-fons-2/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
      <div>
        <p className="text-[16px] font-semibold text-tinta">{t("wake.title")}</p>
        <p className="mt-1 max-w-[64ch] text-[14px] leading-relaxed text-tinta-2">{t("wake.text")}</p>
        {pista ? (
          <p id="wake-pista" className="mt-2 text-[14px] leading-relaxed text-tinta-3">
            {pista}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-disabled={apagat}
        aria-describedby={pista ? "wake-pista" : undefined}
        onClick={() => {
          if (apagat) return;
          const quantes = demos.encendre();
          if (quantes) {
            demos.anunciar(
              quantes === 1 ? t("wake.live.on.one") : t("wake.live.on", { n: quantes })
            );
          }
        }}
        className={`${BOTO} shrink-0 border border-accent/50 text-accent-2 hover:border-accent hover:bg-accent-bg aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:bg-transparent sm:min-w-[14rem]`}
      >
        {etiqueta}
      </button>
    </div>
  );
}

// La lista, el aviso de donde sale y el estado de las demos vienen de ProveidorProjectes: lo
// que se despierte en la portada se ve aqui, y la lista se pide una sola vez.
export function Projectes() {
  const { t } = useIdioma();
  const { llista, estat, demos } = useProjectesCtx();

  return (
    <>
      {estat ? (
        <p
          role="status"
          className="mb-8 flex items-center gap-2.5 text-[14px] text-tinta-2"
        >
          <span
            aria-hidden
            className={`size-2 rounded-full ${estat === "feed.loading" ? "bg-accent" : "bg-espera"}`}
          />
          {t(estat)}
        </p>
      ) : null}

      <Panell demos={demos} />

      <Carrusel>
        {llista.map((dades) => (
          <Targeta key={dades.nom} dades={dades} />
        ))}
      </Carrusel>
    </>
  );
}
