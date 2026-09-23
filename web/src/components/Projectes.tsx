import { useEffect, useMemo, useState } from "react";
import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { deCasa, demanar, desats, projecte, quanFa } from "../lib/projectes";
import type { EstatFeed, Projecte, Repo, Rol } from "../lib/projectes";
import { esAdormida, useDemos } from "../lib/demos";
import type { Demos, Fase } from "../lib/demos";
import { Entrada } from "./Moviment";
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

function Chips({ tec, etiqueta }: { tec: string[]; etiqueta: string }) {
  if (!tec.length) return null;
  return (
    <ul aria-label={etiqueta} className="mt-4 flex flex-wrap gap-2">
      {tec.map((una) => (
        <li
          key={una}
          className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1 text-[14px] text-tinta-2"
        >
          {una}
        </li>
      ))}
    </ul>
  );
}

function LiniaEstat({ fase, segons, id }: { fase: Fase; segons: number; id: string }) {
  const { t } = useIdioma();
  const nom = t(("estat." + fase) as Clau);
  const compta = fase === "waking" && segons ? " · " + t("estat.secs", { s: segons }) : "";
  return (
    <p id={id} className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[14px]">
      <span aria-hidden className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${COLOR_FASE[fase]}`} />
      <span className="font-medium text-tinta">{nom + compta}</span>
      <span className="text-tinta-3">{t(("estat." + fase + ".why") as Clau)}</span>
    </p>
  );
}

function Targeta({
  dades,
  demos,
  ordre
}: {
  dades: Projecte;
  demos: Demos;
  ordre: number;
}) {
  const { t, idioma } = useIdioma();
  const dorm = esAdormida(dades.demo);
  const fase = dorm ? demos.fase(dades.demo) : "on";
  const enMarxa = !dorm || fase === "on";

  // El titulo cubre la tarjeta entera, asi que apunta a lo que se quiere abrir al
  // pulsarla: la aplicacion si esta en marcha, y si no el codigo. Cuando el repositorio
  // es privado, o cuando la demo esta dormida y todavia no contesta, no hay nada que
  // abrir: el titulo se queda en texto.
  const obrir = enMarxa ? dades.demo || dades.url : dades.url;
  const quan = dades.data ? quanFa(idioma, dades.data) : "";
  const idEstat = "estat-demo-" + dades.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const titol = obrir ? (
    <a
      href={obrir}
      target="_blank"
      rel="noopener"
      onClick={() => dades.demo && demos.visita(dades.demo)}
      className="text-tinta transition-colors duration-200 hover:text-accent-2"
    >
      {dades.titol}
    </a>
  ) : (
    dades.titol
  );

  return (
    <Entrada retard={Math.min(ordre, 4) * 0.06} className="h-full">
      <li className="flex h-full list-none flex-col rounded-[20px] border border-linia bg-fons-2/70 p-6 backdrop-blur-sm transition-colors duration-200 hover:border-linia/0 hover:ring-1 hover:ring-accent/30 sm:p-8">
        <h3 className="text-[19px] font-semibold leading-snug tracking-tight sm:text-[21px]">
          {titol}
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-tinta-2 sm:text-[15px]">{dades.text}</p>

        <Chips tec={dades.tec} etiqueta={t("chips.aria")} />

        {/* Proyecto que este rol no puede abrir: la tarjeta se queda sin pie, con la
            linea que dice que esta a medias ocupando ese sitio. */}
        {dades.tancat ? (
          <p className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[14px]">
            <span aria-hidden className={`size-2 shrink-0 translate-y-[-1px] rounded-full ${COLOR_FASE.obres}`} />
            <span className="font-medium text-tinta">{t("obres.nom")}</span>
            <span className="text-tinta-3">{t("obres.why")}</span>
          </p>
        ) : (
          <>
            {quan ? (
              <p className="mt-5 text-[14px] text-tinta-3">
                <time dateTime={dades.data}>{t("feed.updated", { t: quan })}</time>
              </p>
            ) : null}

            {dorm ? (
              <LiniaEstat fase={fase} segons={demos.segons(dades.demo)} id={idEstat} />
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              {dades.demo ? (
                <>
                  {/* Mientras la demo no conteste, en su hueco esta el boton de
                      iniciarla, no el de probarla: los dos nunca se ven a la vez. */}
                  {enMarxa ? (
                    <a
                      href={dades.demo}
                      target="_blank"
                      rel="noopener"
                      onClick={() => demos.visita(dades.demo)}
                      className={`${BOTO} bg-accent text-sobre-accent hover:bg-accent-2`}
                    >
                      {t("feed.try")}
                      <Fletxa />
                    </a>
                  ) : (
                    <button
                      type="button"
                      aria-describedby={idEstat}
                      aria-disabled={fase === "waking"}
                      onClick={() => {
                        if (demos.fase(dades.demo) === "waking") return;
                        demos.anunciar(t("wake.live.starting", { t: dades.titol }));
                        demos.despertar(dades.demo);
                      }}
                      className={`${BOTO} bg-accent text-sobre-accent hover:bg-accent-2 aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:bg-accent`}
                    >
                      {t(
                        fase === "waking"
                          ? "estat.waking"
                          : fase === "fail"
                            ? "estat.again"
                            : "demo.start"
                      )}
                    </button>
                  )}

                  {/* Sin repositorio publico no hay codigo que ensenar: el enlace daria
                      un 404 a cualquiera que no sea del equipo. */}
                  {dades.url ? (
                    <a
                      href={dades.url}
                      target="_blank"
                      rel="noopener"
                      className={`${BOTO} border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta`}
                    >
                      <GitHub />
                      {t("feed.code")}
                    </a>
                  ) : null}
                </>
              ) : (
                <>
                  {dades.url ? (
                    <a
                      href={dades.url}
                      target="_blank"
                      rel="noopener"
                      className={`${BOTO} border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta`}
                    >
                      <GitHub />
                      {t("proj.code")}
                    </a>
                  ) : null}
                  {dades.marca ? (
                    <span className="rounded-[8px] border border-linia px-2.5 py-1 text-[14px] text-tinta-3">
                      {t(dades.marca)}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}
      </li>
    </Entrada>
  );
}

function Panell({ demos }: { demos: Demos }) {
  const { t } = useIdioma();
  const c = demos.comptes;
  if (!c.total) return null;

  let etiqueta: string;
  let pista: string;
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
    pista = t("wake.hint");
    apagat = false;
  }

  return (
    <div className="mb-10 grid gap-6 rounded-[20px] border border-linia bg-fons-2/60 p-6 backdrop-blur-sm sm:p-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-10 2xl:grid-cols-[minmax(0,72ch)_minmax(0,34ch)] 2xl:justify-between 2xl:gap-16">
      <div>
        <p className="text-[16px] font-semibold text-tinta">{t("wake.title")}</p>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-tinta-2">{t("wake.text")}</p>
      </div>
      <div>
        <button
          type="button"
          aria-disabled={apagat}
          aria-describedby="wake-pista"
          onClick={() => {
            if (apagat) return;
            const quantes = demos.encendre();
            if (quantes) {
              demos.anunciar(
                quantes === 1 ? t("wake.live.on.one") : t("wake.live.on", { n: quantes })
              );
            }
          }}
          className={`${BOTO} w-full bg-accent text-sobre-accent hover:bg-accent-2 aria-[disabled=true]:cursor-default aria-[disabled=true]:opacity-60 aria-[disabled=true]:hover:bg-accent`}
        >
          {etiqueta}
        </button>
        <p id="wake-pista" className="mt-3 text-[14px] leading-relaxed text-tinta-3">
          {pista}
        </p>
      </div>
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

      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
        {projectes.map((dades, i) => (
          <Targeta key={dades.nom} dades={dades} demos={demos} ordre={i} />
        ))}
      </ul>
    </>
  );
}
