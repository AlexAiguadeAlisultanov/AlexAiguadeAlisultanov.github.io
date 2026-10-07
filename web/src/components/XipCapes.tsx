// Cuatro rombos apilados en isometrico: las capas del chip (bolas de soldadura, sustrato,
// silicio y tapa), de abajo arriba. Es la version quieta de lo que la escena 3D hace al
// despiezar el procesador, y sirve de marca de capitulo en la historia cuando no hay pelicula
// (movil, movimiento reducido). La capa del capitulo va en el acento y las demas en gris.
//
// Hardware son las dos de abajo (lo fisico), software el silicio (la logica) y seguridad la
// tapa (lo que protege). "todo" enciende las cuatro, para el cierre.

export type Capa = "hw" | "sw" | "seg" | "todo";

const ACTIVAS: Record<Capa, boolean[]> = {
  hw: [true, true, false, false],
  sw: [false, false, true, false],
  seg: [false, false, false, true],
  todo: [true, true, true, true]
};

// Centro vertical de cada rombo, de abajo arriba. Se solapan: el de arriba tapa al de abajo.
const CENTROS = [44, 35, 26, 17];

const rombo = (cy: number, rx: number, ry: number) =>
  `M32 ${cy - ry}L${32 + rx} ${cy}L32 ${cy + ry}L${32 - rx} ${cy}Z`;

export function XipCapes({ activa, className = "" }: { activa: Capa; className?: string }) {
  const encendidas = ACTIVAS[activa];
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={`size-16 ${className}`}
    >
      {CENTROS.map((cy, i) => (
        <g key={cy} className={encendidas[i] ? "stroke-accent" : "stroke-[#3C3C44]"}>
          {/* Relleno del color de la tarjeta, para que cada capa tape a la de abajo. */}
          <path d={rombo(cy, 22, 11)} className="fill-fons-2" strokeDasharray={i === 0 ? "0.1 4.4" : undefined} strokeLinecap="round" />
          {i === 2 ? <path d={rombo(cy, 9, 4.5)} /> : null}
          {i === 3 ? <path d={rombo(cy, 13, 6.5)} /> : null}
        </g>
      ))}
    </svg>
  );
}
