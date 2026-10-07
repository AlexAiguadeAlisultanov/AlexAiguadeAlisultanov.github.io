// Encabezado de seccion: numero en contorno y titular con degradado. Va aparte para que lo
// usen Portafoli.tsx y las secciones que viven en su propio fichero sin importarse en circulo.

export function Titol({
  numero,
  text,
  clar = false
}: {
  numero?: string;
  text: string;
  clar?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
      {numero ? (
        <span aria-hidden className={`num ${clar ? "num--clar" : ""}`}>
          {numero}
        </span>
      ) : null}
      <h2 className={`titular titular--l ${clar ? "titular--clar" : ""}`}>{text}</h2>
    </div>
  );
}
