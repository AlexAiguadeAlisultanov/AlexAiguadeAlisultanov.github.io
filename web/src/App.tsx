import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { ProveidorIdioma } from "./lib/idioma";
import { oblidarSessio, sessioDesada } from "./lib/acces";
import type { Rol } from "./lib/acces";
import { LimitCarrega } from "./components/LimitCarrega";
import { Porta } from "./components/Porta";
import { Anell, Fons } from "./components/Moviment";
import { FonsCanvas } from "./components/fons/motor";
import { crearPlaca } from "./components/fons/placa";

// El portafolio y el curriculum son trozos aparte: la pantalla de acceso se pinta sin ellos, asi
// que lo primero que se descarga es lo que se ve. Las dos funciones se guardan para poder pedir
// el trozo antes de que haga falta.
const cargarPortafoli = () => import("./components/Portafoli").then((m) => ({ default: m.Portafoli }));
const cargarCurriculum = () => import("./components/Curriculum").then((m) => ({ default: m.Curriculum }));
const Portafoli = lazy(cargarPortafoli);
const Curriculum = lazy(cargarCurriculum);

// Con una sesion guardada lo normal es abrir el portafolio en cuanto la API la confirme: el trozo
// se pide ya, a la vez que la comprobacion, y no despues de ella.
if (sessioDesada()) void cargarPortafoli();

/** Ejecuta algo cuando el navegador esta libre. Safari no tiene requestIdleCallback. */
function alLliure(fer: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fer, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fer, 1200);
  return () => window.clearTimeout(id);
}

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

  // Con la pantalla de acceso ya pintada, el trozo del portafolio se baja mientras la persona
  // escribe, y el del curriculum cuando el portafolio ya esta delante. Asi, al entrar o al abrir
  // el CV, el trozo ya esta y no se ve ningun hueco.
  useEffect(() => alLliure(() => void (rol ? cargarCurriculum() : cargarPortafoli())), [rol]);

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
        // Mientras llega el trozo no se pinta nada: el fondo de la pagina ya es el color de siempre
        // y el alto de la ventana evita que la barra de scroll aparezca y desaparezca. Si no llega,
        // LimitCarrega lo cuenta y deja recargar.
        <LimitCarrega>
          <Suspense fallback={<div aria-hidden className="min-h-dvh" />}>
            {cv ? <Curriculum tornar={tornar} /> : <Portafoli rol={rol} sortir={sortir} />}
          </Suspense>
        </LimitCarrega>
      ) : (
        <Porta obrir={obrir} />
      )}
    </ProveidorIdioma>
  );
}
