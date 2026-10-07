// La historia (#historia): como se llega de un equipo por dentro a protegerlo. Tres capitulos
// (hardware, software y seguridad), uno por capa del chip, y un cierre con las tres montadas.
// Esta es la version en flujo normal, la que ven el movil, la tableta, quien tiene movimiento
// reducido y quien no tiene WebGL: cada capitulo es una tarjeta con su capa dibujada en cian
// (XipCapes) y el texto es siempre DOM real, en orden de lectura.

import { useIdioma } from "../lib/idioma";
import type { Clau } from "../lib/idioma";
import { CORREU } from "../lib/contacte";
import { useProjectesCtx } from "../lib/ProveidorProjectes";
import { Entrada } from "./Moviment";
import { XipCapes } from "./XipCapes";
import type { Capa } from "./XipCapes";

type Xip = string | { clau: Clau };

type Capitol = {
  id: Exclude<Capa, "todo">;
  num: string;
  anys: string;
  titol: Clau;
  text: Clau;
  xips: Xip[];
};

// Las tres capas y los años de cada etapa. Las herramientas salen del curriculum.
const CAPITOLS: Capitol[] = [
  {
    id: "hw",
    num: "01",
    anys: "2020 · 2022",
    titol: "rail.hw",
    text: "hist.hw",
    xips: ["Windows · Ubuntu", "Hardware", { clau: "cv.c.soporte" }]
  },
  {
    id: "sw",
    num: "02",
    anys: "2022 · 2024",
    titol: "rail.sw",
    text: "hist.sw",
    xips: ["Java · Spring Boot", "PHP · MySQL", "React · TypeScript"]
  },
  {
    id: "seg",
    num: "03",
    anys: "2026",
    titol: "rail.seg",
    text: "hist.seg",
    xips: ["HackTheBox", "Kali Linux", "OSINT"]
  }
];

const BOTO =
  "inline-flex min-h-12 w-full items-center justify-center rounded-[8px] px-5 text-[15px] font-semibold " +
  "transition-colors duration-200 sm:w-auto";

export function Historia() {
  const { t } = useIdioma();
  const { compte } = useProjectesCtx();

  return (
    <section id="historia" className="historia">
      <div className="ample">
        <div className="historia__cap">
          <Entrada y={8} duracio={0.24}>
            <h2 className="titular titular--xl historia__titol">{t("hist.titol")}</h2>
          </Entrada>
        </div>

        {CAPITOLS.map((cap) => (
          <article key={cap.id} className="historia__bloc" aria-labelledby={`historia-${cap.id}`}>
            <Entrada y={8} duracio={0.24} className="historia__ent">
              <XipCapes activa={cap.id} className="historia__xip" />
              <div className="historia__tarjeta">
                <div className="flex items-baseline justify-between gap-4">
                  <span aria-hidden className="num">
                    {cap.num}
                  </span>
                  <span className="text-[14px] tabular-nums text-tinta-3">{cap.anys}</span>
                </div>
                <h3 id={`historia-${cap.id}`} className="titular historia__nom">
                  {t(cap.titol)}
                </h3>
                <p className="mt-4 text-[15px] leading-normal text-tinta-2 sm:text-[16px] sm:leading-relaxed">
                  {t(cap.text, { n: compte })}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {cap.xips.map((xip) => {
                    const text = typeof xip === "string" ? xip : t(xip.clau);
                    return (
                      <li
                        key={text}
                        className="rounded-[8px] border border-linia bg-fons-3 px-2.5 py-1 text-[14px] text-tinta-2"
                      >
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Entrada>
          </article>
        ))}

        {/* El cierre: las tres capas montadas y dos salidas, las demos o el correo. */}
        <div className="historia__bloc">
          <Entrada y={8} duracio={0.24} className="historia__ent historia__ent--fi">
            <XipCapes activa="todo" className="historia__xip" />
            <div className="historia__fi">
              <p className="text-[clamp(1.25rem,2.2vw,2rem)] font-semibold leading-snug tracking-tight text-tinta">
                {t("hist.fi")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#projectes" className={`${BOTO} bg-accent text-sobre-accent hover:bg-accent-2`}>
                  {t("hist.fi.demos")}
                </a>
                <a
                  href={"mailto:" + CORREU}
                  className={`${BOTO} border border-linia text-tinta-2 hover:border-accent/40 hover:text-tinta`}
                >
                  {t("hist.fi.mail")}
                </a>
              </div>
            </div>
          </Entrada>
        </div>
      </div>
    </section>
  );
}
