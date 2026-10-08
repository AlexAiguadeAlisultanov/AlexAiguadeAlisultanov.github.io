// Cuando la historia es una pelicula y cuando son bloques normales.
//
// Pelicula solo si se cumple todo: 1024 px de ancho o mas, raton de verdad, sin movimiento
// reducido, WebGL con un equipo que lo mueva (capac) y que la escena no haya fallado. En
// cualquier otro caso (movil, tableta, tactil, movimiento reducido, sin WebGL) la historia va
// en flujo normal. Se escuchan los cambios de las tres consultas, asi que estrechar la ventana
// o activar el movimiento reducido cambia de modo en el momento.
//
// Antes de cambiar de modo se llama a `abans`: Escenari apunta ahi que se estaba leyendo para
// devolverlo al mismo sitio, porque la historia pasa de 380svh a su alto natural.

import { useCallback, useEffect, useRef, useState } from "react";
import { capac } from "../Fons3D";

const CONSULTES = [
  "(min-width: 1024px)",
  "(hover: hover) and (pointer: fine)",
  "(prefers-reduced-motion: no-preference)"
];

export function usePelicula(abans: () => void): { pelicula: boolean; fallar: () => void } {
  const [apta, setApta] = useState(false);
  const [fallida, setFallida] = useState(false);
  const enMarxa = useRef(false);
  const caiguda = useRef(false);
  const avisar = useRef(abans);

  useEffect(() => {
    avisar.current = abans;
  }, [abans]);

  useEffect(() => {
    const consultes = CONSULTES.map((c) => window.matchMedia(c));
    const mirar = () => {
      // capac() vuelve a mirar ancho y puntero; la prueba de WebGL solo se hace la primera vez.
      const ara = consultes.every((c) => c.matches) && capac();
      if (ara === enMarxa.current) return;
      if (!caiguda.current) avisar.current();
      enMarxa.current = ara;
      setApta(ara);
    };
    mirar();
    consultes.forEach((c) => c.addEventListener("change", mirar));
    return () => consultes.forEach((c) => c.removeEventListener("change", mirar));
  }, []);

  // Si la escena falla (sin contexto, un shader que no compila, el modulo que no llega o un
  // error en el bucle), la pagina vuelve en el acto al modo normal, sin hueco de 280svh.
  const fallar = useCallback(() => {
    if (caiguda.current) return;
    if (enMarxa.current) avisar.current();
    caiguda.current = true;
    setFallida(true);
  }, []);

  return { pelicula: apta && !fallida, fallar };
}
