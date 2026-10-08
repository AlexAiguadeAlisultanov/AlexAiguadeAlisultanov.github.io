# Portafolio de Alex Aiguadé, versión nueva

Este es el proyecto de Vite que va a sustituir a la web publicada. Mientras tanto vive
aparte: la raíz del repositorio (`index.html`, `script.js`, `styles.css`, `Img/`, `api/`)
sigue siendo la web que está en marcha y no se toca.

React 19, TypeScript, Tailwind 4 y Framer Motion. El fondo de la portada es una escena
de Three.js construida por código, que se carga aparte y solo en equipos que puedan con
ella.

## Arrancarlo en local

```
cd web
npm install
npm run dev
```

Se abre en `http://localhost:5199`.

El servidor de desarrollo lleva un proxy en `/acceso-dev` que reenvía las llamadas a la
API de acceso (`https://portfolio-acceso.onrender.com`) poniendo el `Origin` del dominio
publicado. Hace falta porque esa API solo acepta peticiones desde `alexaiguadealisultanov.github.io`
y desde `http://localhost:4200`, así que desde el 5199 el navegador las bloquearía. No se
salta ningún control: el usuario y la contraseña se siguen comprobando en el servidor. En
producción la aplicación llama a la API directamente, sin proxy de por medio.

## Comprobarlo

```
npm run comprobar    # TypeScript, sin generar nada
npm run build        # compila a web/dist, que es de usar y tirar
npm run preview      # sirve lo compilado, también en el 5199
```

## Publicarlo

GitHub Pages sirve ficheros estáticos desde la raíz del repositorio, así que la
compilación tiene que acabar allí. **Este paso pisa el `index.html` de la raíz**, que es
la web que está funcionando ahora mismo. Hazlo cuando la nueva esté aprobada, no antes.

```
npm run publicar
```

Eso es `vite build --outDir ../`, que escribe en la raíz `index.html` y la carpeta
`assets/` con el JavaScript, el CSS y el retrato ya con su huella en el nombre.

Antes de lanzarlo, dos cosas:

1. Borra la carpeta `assets/` de la raíz si ya existe. Vite no vacía un directorio de
   salida que esté fuera de su raíz, así que los ficheros viejos se quedarían ahí
   ocupando sitio (no rompen nada, porque el `index.html` nuevo apunta a los nuevos).
2. Guarda una copia de `index.html`, `script.js` y `styles.css` si quieres poder volver
   atrás. `script.js` y `styles.css` dejan de usarse en cuanto se publique lo nuevo, pero
   el `index.html` sí se sobrescribe.

`Img/` se queda donde está: el proyecto nuevo trae su propia copia del retrato dentro de
`assets/`, y los iconos de pestaña (`Img/icono-32.png` y `Img/icono-180.png`) los publica
desde `web/public/Img/` con el mismo contenido que ya había.

El `base` está en `/` porque el repositorio es el sitio de usuario
(`alexaiguadealisultanov.github.io`) y se sirve desde la raíz del dominio. Si algún día
pasa a ser un repositorio de proyecto, hay que cambiarlo en `vite.config.ts`.

## Cómo está montado

```
web/
  index.html            solo el esqueleto: ni una frase del portafolio
  src/
    main.tsx
    App.tsx             decide si se ve la puerta o el portafolio
    index.css           tokens de color, tipografía y las clases de titular
    lib/
      idioma.tsx        las tres traducciones y el contexto de idioma
      acces.ts          entrar, comprobar la sesión guardada, guardarla y olvidarla
      projectes.ts      diccionario de fichas + lectura de la API de GitHub
      demos.ts          estado de las demos que se duermen
      ProveidorProjectes.tsx  la lista de proyectos y el estado de las demos, una sola vez
                        para toda la página (portada y proyectos leen de aquí)
      contacte.ts       correo, WhatsApp, LinkedIn y GitHub
      cv.ts             el PDF del currículum
    components/
      Porta.tsx         pantalla de acceso
      Portafoli.tsx     cabecera, contacto, pie y el montaje de la página
      MenuMobil.tsx     la hoja del menú en el móvil
      Portada.tsx       la portada: ficha, contacto rápido, retrato y carrusel de demos
      XipCapes.tsx      las capas del chip dibujadas en SVG, marca de cada capítulo
      Projectes.tsx     tarjetas de proyecto y panel de arranque de las demos
      Carrusel.tsx      la cinta de tarjetas: la de proyectos y la compacta de la portada
      BotoDemo.tsx      el botón de una demo con sus fases (probar, arrancando, abrir)
      Trajectoria.tsx   experiencia y formación con línea de tiempo, herramientas e idiomas
      Fila.tsx          fila de lista con fecha; con `hito` es un nodo de la línea de tiempo
      Titol.tsx         encabezado de sección con el número en contorno
      Curriculum.tsx    la vista #cv
      Moviment.tsx      entrada escalonada, imán, fondo y anillo del puntero
      Fons3D.tsx        decide si hay escena o fondo estático y carga three; exporta capac()
      Escena.tsx        el procesador en 3D, con sus shaders y su bucle (portada y película)
      relat/            la historia y el modo película
        Escenari.tsx    #escenari: la capa fijada con la escena, los recorridos q y p y RelatCtx
        Historia.tsx    #historia en los dos modos: película (380svh) o bloques en flujo normal
        Rail.tsx        los cuatro segmentos de capítulo y «Saltar a los proyectos»
        tabla.ts        la coreografía: cuándo se ve cada tarjeta y cuánto se despieza cada capa
        usePelicula.ts  cuándo hay película y cuándo se vuelve al modo normal
      fons/             el fondo animado de placa base (motor.tsx y placa.ts)
      Idiomes.tsx       selector de idioma
      Icones.tsx        iconos de línea y banderas, todo dibujado a mano
```

El contenido protegido no está en `index.html`. Va dentro del JavaScript compilado, que
es lo máximo que se puede hacer sin un servidor que renderice: quien mire el fuente de la
página no lo ve, quien abra el bundle sí. La comprobación de quién entra la sigue haciendo
la API, no el navegador.

## Cosas que conviene no romper

- **El rol manda sobre lo que se puede abrir.** `invitado` ve el Planificador Volkswagen
  sin enlaces ni botón, con el aviso de que está en obras. La lista está en
  `lib/projectes.ts`, en `NOMES_ADMIN`.
- **Las demos no se sondean al cargar.** Cada petición despierta un servicio de Render, y
  sondear al entrar serían nueve arranques por visita. Se encienden cuando alguien lo pide
  (una por una o con "Despertar todas").
- **Los dos botones de una demo nunca conviven**: o está el de iniciar o está el de
  probar, en el mismo hueco.
- **Las banderas van dibujadas en SVG.** Windows no pinta los emoji de bandera y la
  senyera ni siquiera existe como emoji.
- **`prefers-reduced-motion` deja todo quieto, no lento.** Imán, entrada escalonada, línea
  de tiempo, carruseles y anillo del puntero se apagan enteros.
- **El retrato es la primera `<img>` de `#dalt` y no puede haber otra antes.** `Escena.tsx`
  se coloca buscándola y escala el chip con su ancho, y su máscara se centra en ella. Por eso
  es un solo elemento que cambia de sitio con la rejilla de la portada, y por eso el webp está
  recortado al círculo (sin margen transparente): el chip sale a 2,1 veces el retrato.
  `alex-400.webp` y `alex-800.webp` salen de `Img/alex.png` (el de la raíz del repositorio, que
  es el original) pasado por un canvas, recortado a su círculo y codificado a calidad 0,85.
  En la película la escena no lo busca: `Escenari` le pasa la ref `retrat`, que la portada
  pone en ese mismo `<img>`.
- **Hay dos carruseles y comparten código.** El de `#projectes` sangra hasta los bordes de la
  ventana; el de la portada es la variante `compacte` de `Carrusel.tsx`, contenida en su
  columna. En el móvil la de la portada es la fila quieta con snap (`quieta`). Cualquier
  cambio en la lógica del carrusel vale para los dos, y lo que solo es de uno va en el CSS:
  `.carrusel--compacte` y `.portada__*` para la portada, nada que el grande lea.
- **Cada paso del carrusel de la portada es una columna de dos proyectos**, uno encima de
  otro. Para `Carrusel.tsx` la columna es una sola pieza, así que «siguiente», Tab y el
  resaltado del ratón trabajan por columna, y Tab recorre primero la tarjeta de arriba y
  luego la de abajo. La tarjeta mini es horizontal: captura 16:10 a la izquierda (entre 88 y
  168 px, lo que sobra después de reservar 192 px para el texto, 190 en el móvil) y a la
  derecha nombre, stack y `BotoDemo`. Van primero incidencias, inventario, Volkswagen y CRM,
  y luego el resto. Detrás del último proyecto va la tarjeta «Ver todos los proyectos»
  (`TargetaTots`), que baja a `#projectes`: con nueve proyectos completa la última columna y,
  si la cuenta fuera par, ocupa ella sola la columna entera. Las filas de todas las columnas
  miden lo mismo (la nota «Pide crear cuenta» del Volkswagen es la que fija la altura), así
  que los bordes quedan alineados. Un título largo que parta en dos líneas en la tarjeta
  mini se arregla con `curt` en la ficha de `lib/projectes.ts`.
- **Las columnas de la portada entran por la derecha y salen por la izquierda** (`entra="dreta"`
  en `Carrusel.tsx`): tras la primera llega la segunda, y «Ver todos» queda al final del
  recorrido. Lo que hace la prop es cambiar el signo de la velocidad de la cinta, nada más; el
  de `#projectes` no la pasa y sigue entrando por la izquierda. «Siguiente» y la flecha
  derecha traen la columna que viene por la derecha en los dos carruseles.
- **El anillo que sigue al ratón no sustituye al puntero del sistema**, lo acompaña, y
  desaparece en pantallas táctiles.
- **El ancho de la página lo fija `.ample` en `index.css`**, no un contenedor con tope
  fijo. El margen lateral crece con la ventana (`--marc`) y lo que sujeta la lectura es
  la medida de cada bloque de texto, no una columna que encierre la página entera. Si hace
  falta más aire en un sitio concreto, se reparte ahí, no se estrecha todo.
- **La escena 3D no se carga en el móvil ni sin WebGL.** `Fons3D` mira ancho, puntero,
  núcleos y memoria antes de pedir el módulo; debajo siempre hay un fondo estático de CSS
  que ya es un fondo acabado. Con `prefers-reduced-motion` se dibuja un fotograma y se
  para, y el bucle se detiene con la pestaña oculta o cuando la portada sale de pantalla.
- **El modo película solo existe en escritorio y siempre tiene salida.** `relat/usePelicula.ts`
  lo enciende con 1024 px o más, ratón, sin movimiento reducido y con `capac()`. Si la escena
  falla (contexto perdido, un shader que no compila, el módulo que no llega o una excepción en
  el bucle), la página vuelve al modo normal en el mismo fotograma y deja a la vista lo que se
  estaba leyendo: nunca puede quedar el hueco de 380svh sin escena. En `Escena.tsx` todo lo de
  la película va detrás de `if (progres)`; sin esa prop la portada sale idéntica, píxel a
  píxel, a la de antes.
- **q y p se calculan en un listener de scroll propio, en `Escenari`, y no con `useScroll`.**
  Framer actualiza `useScroll` en su propio fotograma, después de que la escena haya leído el
  valor, y el chip se quedaba un fotograma por detrás del retrato. El evento de scroll llega
  antes que los `requestAnimationFrame` del mismo fotograma.
- **La capa fijada va dentro de una pista absoluta (`.escenari__pista`) del alto de
  `#escenari`**, no en el flujo con un margen inferior negativo. Chrome limita el sticky por la
  caja de margen, y con ese margen la capa se salía 844 px del escenario y seguía fijada encima
  de Proyectos. La pista no puede llevar `overflow`: sería el contenedor del sticky y la capa
  dejaría de fijarse a la ventana.
- **`relat/tabla.ts` es la única fuente de la coreografía, y sus cifras salen de los altos de la
  historia** (titular de 60svh y cuatro bloques de 80svh, 380svh en total). Si cambia un alto en
  `index.css`, hay que recalcular `CENTRO` y `OPACIDAD` con la cuenta que explica el fichero.
  Todo lo que mueve el chip es una función continua de q y p (posición, tamaño, máscara,
  despiece, peso de cada capa y brillo): entre punto y punto se pasa con curva y lo que acaba
  la portada empalma con lo que empieza la historia. Un escalón en una tabla se ve como un salto
  del chip. Por eso tampoco sube con el scroll: sale de donde estaba el retrato y se desliza.
- **La placa del fondo no se pinta detrás de `[data-tapa]`.** `#dalt` lo lleva siempre; en la
  película `#escenari` lleva `data-tapa="tot"`, que tapa hasta su final aunque quede por debajo
  de la ventana. Así la placa no asoma durante la historia y vuelve con el fundido de 160 px
  cuando la capa se suelta. Si lo tapado cubre la ventana entera, `motor.tsx` ni pinta.
- **El rail va abajo a la derecha a propósito.** Las tarjetas suben por la columna de la
  izquierda y un rail fijo en esa esquina se cruzaba con todas. Fuera de la historia se apaga y
  queda `inert`, así que el tabulador no se para en botones que no se ven.
- **El trozo de `three` pesa unos 130 kB comprimidos y va en su propio fichero.** Se pide
  después de pintar la página, así que la primera carga sigue costando lo mismo que antes.
  Si se importa three desde cualquier otro sitio, ese trozo se cuela en el bundle principal.
