// Si el trozo del portafolio o del curriculum no llega (sin conexion, o una pestana abierta antes
// de publicar una version nueva, cuyos ficheros ya no existen), la pagina no se queda en blanco:
// dice lo que ha pasado y deja recargar. Tambien recoge cualquier otro error de pintado.

import { Component } from "react";
import type { ReactNode } from "react";
import { useIdioma } from "../lib/idioma";

function Recarregar() {
  const { t } = useIdioma();
  return (
    <div role="alert" className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-[40ch]">
        <p className="text-[15px] leading-relaxed text-tinta-2 sm:text-base">{t("carrega.err")}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-[8px] bg-accent px-5 text-[15px] font-semibold text-sobre-accent transition-colors duration-200 hover:bg-accent-2"
        >
          {t("carrega.retry")}
        </button>
      </div>
    </div>
  );
}

export class LimitCarrega extends Component<{ children: ReactNode }, { trencat: boolean }> {
  state = { trencat: false };

  static getDerivedStateFromError() {
    return { trencat: true };
  }

  render() {
    return this.state.trencat ? <Recarregar /> : this.props.children;
  }
}
