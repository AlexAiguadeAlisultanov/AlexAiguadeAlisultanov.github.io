import { IDIOMAS, useIdioma } from "../lib/idioma";
import type { Idioma } from "../lib/idioma";
import { BanderaCA, BanderaES, BanderaGB } from "./Icones";

const BANDERES: Record<Idioma, (props: { className?: string }) => React.ReactElement> = {
  es: BanderaES,
  ca: BanderaCA,
  en: BanderaGB
};

// El nombre largo se lee siempre en voz alta; en pantallas estrechas lo que se ve es el
// codigo de dos letras, para que los tres botones quepan en una fila.
const NOMS: Record<Idioma, { llarg: string; curt: string }> = {
  es: { llarg: "Castellano", curt: "ES" },
  ca: { llarg: "Català", curt: "CA" },
  en: { llarg: "English", curt: "EN" }
};

export function Idiomes({ clar = false }: { clar?: boolean }) {
  const { idioma, canviar, t } = useIdioma();

  const vora = clar ? "border-clar-linia" : "border-linia";
  const actiu = clar
    ? "bg-clar-accent/10 text-clar-accent"
    : "bg-accent-bg text-accent-2";
  const repos = clar
    ? "text-clar-tinta-2 hover:text-clar-tinta"
    : "text-tinta-3 hover:text-tinta";

  return (
    <div
      role="group"
      aria-label={t("lang.aria")}
      className={`inline-flex items-center gap-1 rounded-[12px] border ${vora} p-1`}
    >
      {IDIOMAS.map((codi) => {
        const Bandera = BANDERES[codi];
        const posat = codi === idioma;
        return (
          <button
            key={codi}
            type="button"
            aria-pressed={posat}
            onClick={() => canviar(codi)}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-[8px] px-2.5 text-[14px] font-medium transition-colors duration-200 sm:px-3 ${
              posat ? actiu : repos
            }`}
          >
            <Bandera />
            <span className="hidden lg:inline">{NOMS[codi].llarg}</span>
            <span className="lg:hidden" aria-hidden>
              {NOMS[codi].curt}
            </span>
            <span className="sr-only lg:hidden">{NOMS[codi].llarg}</span>
          </button>
        );
      })}
    </div>
  );
}
