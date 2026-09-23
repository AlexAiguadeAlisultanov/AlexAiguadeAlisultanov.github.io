import { useCallback, useState } from "react";
import { ProveidorIdioma } from "./lib/idioma";
import { oblidarSessio } from "./lib/acces";
import type { Rol } from "./lib/acces";
import { Porta } from "./components/Porta";
import { Portafoli } from "./components/Portafoli";
import { Anell, Fons } from "./components/Moviment";

export default function App() {
  const [rol, setRol] = useState<Rol | null>(null);
  const obrir = useCallback((nou: Rol) => setRol(nou), []);

  const sortir = useCallback(() => {
    oblidarSessio();
    // Recargar deja la pagina como recien abierta: sin listas, sin relojes y con la
    // pantalla de acceso delante. El idioma elegido se mantiene, que va aparte.
    window.location.replace(window.location.pathname + window.location.search);
  }, []);

  return (
    <ProveidorIdioma>
      <Fons />
      <Anell />
      {rol ? <Portafoli rol={rol} sortir={sortir} /> : <Porta obrir={obrir} />}
    </ProveidorIdioma>
  );
}
