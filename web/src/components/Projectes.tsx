import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useIdioma } from "../lib/idioma";
import { deCasa, demanar, desats, projecte } from "../lib/projectes";
import type { EstatFeed, Projecte, Repo, Rol } from "../lib/projectes";
import { esAdormida, useDemos } from "../lib/demos";
import type { Demos, Fase } from "../lib/demos";
import { Carrusel } from "./Carrusel";
import { Fletxa, GitHub } from "./Icones";

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

// El boton principal de cada tarjeta, en el cian de la web como el resto de acciones.
const CTA =
  "inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[12px] px-5 " +
  "text-[15px] font-semibold transition-[background-color,border-color,transform] duration-200 " +
  "active:scale-[0.98] aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-70 " +
  "aria-[disabled=true]:active:scale-100";

const CTA_PLE = `${CTA} bg-accent text-sobre-accent hover:bg-accent-2 aria-[disabled=true]:hover:bg-accent`;

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

function Targeta({ dades, demos }: { dades: Projecte; demos: Demos }) {
  const { t } = useIdioma();
  const dorm = esAdormida(dades.demo);
  const fase = dorm ? demos.fase(dades.demo) : "on";
  const enMarxa = !dorm || fase === "on";
  const segons = demos.segons(dades.demo);
  const idEstat = "estat-demo-" + dades.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const despertar = () => {
    if (demos.fase(dades.demo) === "waking") return;
    demos.anunciar(t("wake.live.starting", { t: dades.titol }));
    demos.despertar(dades.demo);
  };

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
              enMarxa ? (
                <a
                  href={dades.demo}
                  target="_blank"
                  rel="noopener"
                  onClick={() => demos.visita(dades.demo)}
                  className={CTA_PLE}
                >
                  {t("card.try")}
                  <Fletxa />
                </a>
              ) : (
                <button
                  type="button"
                  aria-describedby={idEstat}
                  aria-disabled={fase === "waking"}
                  onClick={despertar}
                  className={CTA_PLE}
                >
                  {fase === "waking"
                    ? t("card.waking", { s: segons })
                    : fase === "fail"
                      ? t("estat.again")
                      : t("card.try")}
                </button>
              )
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
      {/* Los cambios de estado se cuentan aqui para quien no los ve. */}
      <p role="status" aria-live="polite" className="sr-only">
        {demos.viu}
      </p>
    </div>
  );
}

export function Projectes({ rol, onCompte }: { rol: Rol; onCompte: (n: number) => void }) {
  const { t, idioma } = useIdioma();

  // Con la copia de la ultima visita la seccion se ve al momento, y la lista de verdad la
  // sustituye en cuanto llega. Sin copia se pintan los proyectos escritos en el
  // diccionario, para que las tarjetas salgan ya con su estado y su boton.
  const [repos, setRepos] = useState<Repo[]>(() => desats() || deCasa());
  const [avis, setAvis] = useState<EstatFeed>(() => (desats() ? "" : "feed.loading"));

  useEffect(() => {
    let viu = true;
    demanar()
      .then((nets) => {
        if (!viu) return;
        setRepos(nets);
        setAvis("");
      })
      .catch(() => {
        if (!viu) return;
        // El limite de la API anonima son 60 peticiones por hora y por IP: cuando se
        // pasa, GitHub contesta 403 y esto cae al respaldo como con cualquier fallo.
        setAvis(desats() ? "feed.cache" : "feed.offline");
      });
    return () => {
      viu = false;
    };
  }, []);

  const projectes = useMemo(
    () => repos.map((repo) => projecte(repo, idioma, rol)),
    [repos, idioma, rol]
  );

  const adreces = useMemo(
    () => projectes.map((p) => p.demo).filter((url) => esAdormida(url)),
    [projectes]
  );

  const demos = useDemos(adreces);

  useEffect(() => {
    onCompte(projectes.length);
  }, [projectes.length, onCompte]);

  return (
    <>
      {avis ? (
        <p
          role="status"
          className="mb-8 flex items-center gap-2.5 text-[14px] text-tinta-2"
        >
          <span
            aria-hidden
            className={`size-2 rounded-full ${avis === "feed.loading" ? "bg-accent" : "bg-espera"}`}
          />
          {t(avis)}
        </p>
      ) : null}

      <Panell demos={demos} />

      <Carrusel>
        {projectes.map((dades) => (
          <Targeta key={dades.nom} dades={dades} demos={demos} />
        ))}
      </Carrusel>
    </>
  );
}
