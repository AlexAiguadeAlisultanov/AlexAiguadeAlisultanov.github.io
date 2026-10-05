import { useCallback, useEffect, useState } from "react";
import { ProveidorIdioma } from "./lib/idioma";
import { oblidarSessio } from "./lib/acces";
import type { Rol } from "./lib/acces";
import { Porta } from "./components/Porta";
import { Portafoli } from "./components/Portafoli";
import { Curriculum } from "./components/Curriculum";
import { Anell, Fons } from "./components/Moviment";
import { FonsCanvas } from "./components/fons/motor";
import { crearPlaca } from "./components/fons/placa";

const veCurriculum = () => window.location.hash === "#cv";

export default function App() {
  const [rol, setRol] = useState<Rol | null>(null);
  const obrir = useCallback((nou: Rol) => setRol(nou), []);

  // El curriculum es la vista #cv. No hay router: basta con leer el hash, y asi el boton
  // de atras del navegador tambien vuelve al portafolio.
  const [cv, setCv] = useState(veCurriculum);
  useEffect(() => {
    const alCanviar = () => setCv(veCurriculum());
    window.addEventListener("hashchange", alCanviar);
    return () => window.removeEventListener("hashchange", alCanviar);
  }, []);

  const tornar = useCallback((id = "contacte") => {
    history.pushState(null, "", window.location.pathname + window.location.search);
    setCv(false);
    // El portafolio se monta de nuevo: se espera a que pinte para colocarse en su sitio.
    const anar = () => document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    window.requestAnimationFrame(anar);
    window.setTimeout(anar, 500);
  }, []);

  const sortir = useCallback(() => {
    oblidarSessio();
    // Recargar deja la pagina como recien abierta: sin listas, sin relojes y con la
    // pantalla de acceso delante. El idioma elegido se mantiene, que va aparte.
    window.location.replace(window.location.pathname + window.location.search);
  }, []);

  return (
    <ProveidorIdioma>
      <Fons />
      {/* Fondo animado (components/fons). Para quitarlo basta con borrar esta linea. */}
      <FonsCanvas crear={crearPlaca} />
      <Anell />
      {rol ? (
        cv ? (
          <Curriculum tornar={tornar} />
        ) : (
          <Portafoli rol={rol} sortir={sortir} />
        )
      ) : (
        <Porta obrir={obrir} />
      )}
    </ProveidorIdioma>
  );
}
