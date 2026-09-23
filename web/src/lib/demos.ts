// Las demos viven en un plan gratuito que apaga el servicio a los quince minutos sin
// visitas, y volver a arrancarlo tarda cerca de un minuto. La pagina no llama a ninguna
// por su cuenta: cada peticion despierta un servicio, asi que sondear al cargar
// significaria cinco arranques por visita. Se enciende cuando alguien lo pide.
//
// Esos servidores no mandan cabeceras CORS, de modo que la respuesta llega opaca y no
// hay forma de leer ni el codigo ni el cuerpo. Lo unico que se sabe es si la peticion ha
// terminado, que resulta ser justo la senal que hace falta: termina cuando el servidor ya
// esta arriba. Por eso los textos hablan de contestar y no de estar bien.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Fase = "off" | "waking" | "on" | "fail";

type Reg = { fase: Fase; inici: number; quan: number; intent: number };

const DORMEN = ["onrender.com"];  // dominios cuyos servicios se apagan solos
const TOPE = 150000;              // espera maxima antes de dar una demo por fallida
const CADUCA = 900000;            // quince minutos, lo que tardan en volver a dormirse
const CLAU_DEMOS = "portafoli-demos";

/** Una demo alojada donde no se apaga nada sigue siendo un enlace normal. */
export function esAdormida(url: string): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  const amfitrio = (url.split("//")[1] || "").split("/")[0].split(":")[0].toLowerCase();
  return DORMEN.some(
    (domini) => amfitrio === domini || amfitrio.slice(-domini.length - 1) === "." + domini
  );
}

const nou = (): Reg => ({ fase: "off", inici: 0, quan: 0, intent: 0 });

function desar(estats: Record<string, Reg>): void {
  try {
    const desa: Record<string, number> = {};
    for (const url of Object.keys(estats)) {
      if (estats[url].fase === "on") desa[url] = estats[url].quan;
    }
    window.localStorage.setItem(CLAU_DEMOS, JSON.stringify(desa));
  } catch {
    // Sin almacenamiento el encendido vale solo para esta pestana.
  }
}

// Al cargar no se sondea nada, pero si hace menos de quince minutos que una demo
// contesto, sigue despierta. Eso es una respuesta medida hace un rato, no una suposicion,
// y ahorra un arranque de mas.
function recuperar(): Record<string, Reg> {
  const estats: Record<string, Reg> = {};
  try {
    const desa = JSON.parse(window.localStorage.getItem(CLAU_DEMOS) || "{}") as
      Record<string, number>;
    for (const url of Object.keys(desa)) {
      const quan = Number(desa[url]);
      if (quan > 0 && Date.now() - quan < CADUCA) {
        estats[url] = { fase: "on", inici: 0, quan, intent: 0 };
      }
    }
  } catch {
    // Si no hay nada que recuperar salen todas sin comprobar, que es lo seguro.
  }
  return estats;
}

export type Comptes = {
  total: number;
  off: number;
  waking: number;
  on: number;
  fail: number;
  segons: number;
};

export type Demos = {
  fase: (url: string) => Fase;
  /** Segundos que lleva arrancando, para el contador de la tarjeta. */
  segons: (url: string) => number;
  comptes: Comptes;
  despertar: (url: string) => void;
  /** Arranca todas las que no lo estan y devuelve cuantas ha llamado. */
  encendre: () => number;
  visita: (url: string) => void;
  /** Lo que se cuenta en voz alta a quien va con lector de pantalla. */
  viu: string;
  anunciar: (text: string) => void;
};

/**
 * @param adreces  las demos que hay ahora mismo en pantalla
 */
export function useDemos(adreces: string[]): Demos {
  const [estats, setEstats] = useState<Record<string, Reg>>(recuperar);
  const [ara, setAra] = useState(() => Date.now());
  const [viu, setViu] = useState("");
  const estatsRef = useRef(estats);
  estatsRef.current = estats;

  const llegir = useCallback((url: string) => estatsRef.current[url] || nou(), []);

  const canviar = useCallback((url: string, canvi: Partial<Reg>) => {
    setEstats((previ) => {
      const anterior = previ[url] || nou();
      const seguent = { ...anterior, ...canvi };
      if (seguent.fase === anterior.fase && seguent.quan === anterior.quan) {
        // Nada que contar: se deja el objeto de antes para no repintar por gusto.
        if (seguent.inici === anterior.inici && seguent.intent === anterior.intent) return previ;
      }
      const tots = { ...previ, [url]: seguent };
      desar(tots);
      return tots;
    });
  }, []);

  const despertar = useCallback(
    (url: string) => {
      const reg = llegir(url);
      if (reg.fase === "on" || reg.fase === "waking") return;
      const intent = reg.intent + 1;
      canviar(url, { fase: "waking", inici: Date.now(), intent });

      // Con no-cors la peticion sale igual aunque el servidor no deje leer la respuesta,
      // que es lo que despierta el servicio.
      fetch(url, { mode: "no-cors", cache: "no-store", credentials: "omit" })
        .then(() => {
          // Aunque llegue tarde, si ha contestado es que ya esta en marcha.
          if (llegir(url).fase !== "on") canviar(url, { fase: "on", quan: Date.now() });
        })
        .catch(() => {
          const actual = llegir(url);
          if (actual.intent === intent && actual.fase === "waking") {
            canviar(url, { fase: "fail" });
          }
        });
    },
    [canviar, llegir]
  );

  const encendre = useCallback(() => {
    let quantes = 0;
    for (const url of adreces) {
      const fase = llegir(url).fase;
      if (fase === "off" || fase === "fail") {
        despertar(url);
        quantes += 1;
      }
    }
    return quantes;
  }, [adreces, despertar, llegir]);

  const visita = useCallback(
    (url: string) => {
      // Abrir la demo cuenta como visita, asi que el reloj de los quince minutos vuelve
      // a empezar.
      canviar(url, { quan: Date.now() });
    },
    [canviar]
  );

  const comptes = useMemo<Comptes>(() => {
    const c: Comptes = { total: 0, off: 0, waking: 0, on: 0, fail: 0, segons: 0 };
    for (const url of adreces) {
      const reg = estats[url] || nou();
      c.total += 1;
      c[reg.fase] += 1;
      if (reg.fase === "waking" && reg.inici) {
        c.segons = Math.max(c.segons, Math.round((ara - reg.inici) / 1000));
      }
    }
    return c;
  }, [adreces, estats, ara]);

  // Mientras alguna despierta hace falta el segundero. El resto del tiempo basta con
  // mirar de vez en cuando si alguna ya se ha vuelto a dormir.
  const cadencia = comptes.waking ? 1000 : comptes.on ? 20000 : 0;

  useEffect(() => {
    if (!cadencia) return;
    const rellotge = window.setInterval(() => {
      const moment = Date.now();
      setAra(moment);
      for (const url of adreces) {
        const reg = estatsRef.current[url] || nou();
        if (reg.fase === "waking" && reg.inici && moment - reg.inici > TOPE) {
          // Se rinde y deja volver a intentarlo. Si la peticion acaba contestando mas
          // tarde, la tarjeta pasa sola a activa.
          canviar(url, { fase: "fail" });
        } else if (reg.fase === "on" && reg.quan && moment - reg.quan > CADUCA) {
          canviar(url, { fase: "off" });
        }
      }
    }, cadencia);
    return () => window.clearInterval(rellotge);
  }, [cadencia, adreces, canviar]);

  const fase = useCallback((url: string) => (estats[url] || nou()).fase, [estats]);

  const segons = useCallback(
    (url: string) => {
      const reg = estats[url] || nou();
      return reg.fase === "waking" && reg.inici
        ? Math.round((ara - reg.inici) / 1000)
        : 0;
    },
    [estats, ara]
  );

  return {
    fase,
    segons,
    comptes,
    despertar,
    encendre,
    visita,
    viu,
    anunciar: setViu
  };
}
