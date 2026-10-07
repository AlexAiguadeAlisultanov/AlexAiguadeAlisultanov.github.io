// Un solo sitio donde se piden los proyectos y se despiertan las demos. La portada y el
// carrusel leen de aqui: si cada uno llamara a demanar() y a useDemos por su cuenta, una
// demo despertada en la portada seguiria dormida en el carrusel y GitHub recibiria dos
// peticiones por visita.
//
// Al montarse no llama a ninguna demo. Lo unico que sale de aqui es la lista de GitHub; las
// demos se despiertan cuando alguien pulsa el boton de una (ver demos.ts).

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useIdioma } from "./idioma";
import { deCasa, demanar, desats, destacats as triarDestacats, projecte } from "./projectes";
import type { EstatFeed, Projecte, Repo, Rol } from "./projectes";
import { esAdormida, useDemos } from "./demos";
import type { Demos, Fase } from "./demos";

export type ContextProjectes = {
  /** Todos los proyectos, ya en el idioma y con el rol de ahora. */
  llista: Projecte[];
  /** De donde sale la lista: "" cuando es la de GitHub al dia, o el aviso que toque. */
  estat: EstatFeed;
  compte: number;
  /** El unico estado de demos de toda la pagina. */
  demos: Demos;
  /** Las cuatro destacadas, que abren el carrusel de la portada, en su orden fijo. */
  destacats: Projecte[];
};

const Contexte = createContext<ContextProjectes | null>(null);

export function ProveidorProjectes({ rol, children }: { rol: Rol; children: ReactNode }) {
  const { idioma } = useIdioma();

  // Con la copia de la ultima visita la lista se ve al momento, y la de verdad la sustituye
  // en cuanto llega. Sin copia se usan los proyectos escritos en el diccionario, para que
  // las tarjetas salgan ya con su estado y su boton.
  const [inici] = useState(() => {
    const desada = desats();
    return { repos: desada || deCasa(), estat: (desada ? "" : "feed.loading") as EstatFeed };
  });
  const [repos, setRepos] = useState<Repo[]>(inici.repos);
  const [estat, setEstat] = useState<EstatFeed>(inici.estat);

  useEffect(() => {
    let viu = true;
    demanar()
      .then((nets) => {
        if (!viu) return;
        setRepos(nets);
        setEstat("");
      })
      .catch(() => {
        if (!viu) return;
        // El limite de la API anonima son 60 peticiones por hora y por IP: cuando se
        // pasa, GitHub contesta 403 y esto cae al respaldo como con cualquier fallo.
        setEstat(desats() ? "feed.cache" : "feed.offline");
      });
    return () => {
      viu = false;
    };
  }, []);

  const llista = useMemo(
    () => repos.map((repo) => projecte(repo, idioma, rol)),
    [repos, idioma, rol]
  );
  const destacats = useMemo(() => triarDestacats(llista), [llista]);
  const adreces = useMemo(
    () => llista.map((p) => p.demo).filter((url) => esAdormida(url)),
    [llista]
  );

  const demos = useDemos(adreces);

  const valor: ContextProjectes = { llista, estat, compte: llista.length, demos, destacats };

  return (
    <Contexte value={valor}>
      {children}
      {/* Los cambios de estado de las demos se cuentan aqui, una sola vez para toda la
          pagina, a quien no los ve. */}
      <p role="status" aria-live="polite" className="sr-only">
        {demos.viu}
      </p>
    </Contexte>
  );
}

export function useProjectesCtx(): ContextProjectes {
  const valor = useContext(Contexte);
  if (!valor) throw new Error("useProjectesCtx necesita estar dentro de ProveidorProjectes");
  return valor;
}

export type EstatDemo = {
  demos: Demos;
  /** La demo vive en un servicio que se duerme. */
  dorm: boolean;
  fase: Fase;
  /** Contesta ya: o no se duerme nunca, o acaba de contestar. */
  enMarxa: boolean;
  /** Segundos que lleva arrancando. */
  segons: number;
};

/** Lo que necesita saber cualquier boton o tarjeta sobre una demo concreta. */
export function useEstatDemo(url: string): EstatDemo {
  const { demos } = useProjectesCtx();
  const dorm = esAdormida(url);
  const fase: Fase = dorm ? demos.fase(url) : "on";
  return { demos, dorm, fase, enMarxa: !dorm || fase === "on", segons: demos.segons(url) };
}

/** Despierta una demo y lo cuenta en voz alta. Si ya esta arrancando no hace nada. */
export function useDespertar(): (url: string, titol: string) => void {
  const { t } = useIdioma();
  const { demos } = useProjectesCtx();
  return (url, titol) => {
    if (demos.fase(url) === "waking") return;
    demos.anunciar(t("wake.live.starting", { t: titol }));
    demos.despertar(url);
  };
}
