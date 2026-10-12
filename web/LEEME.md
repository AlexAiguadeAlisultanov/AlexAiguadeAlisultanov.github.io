# Portafolio de Alex Aiguadé, versión nueva

Este es el proyecto de Vite que va a sustituir a la web publicada. Mientras tanto vive
aparte: la raíz del repositorio (`index.html`, `script.js`, `styles.css`, `Img/`, `api/`)
sigue siendo la web que está en marcha y no se toca.

React 19, TypeScript, Tailwind 4 y Framer Motion. El fondo de la portada es una escena
de Three.js construida por código, que se carga aparte y solo en equipos que puedan con
ella. Las galerías 3D (el anillo de `#demos` y la galaxia de `#projectes`) usan react-three-fiber y
drei, también en trozos aparte.

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
      projectes.ts      diccionario de fichas (con los datos de la tarjeta grande) + lectura de
                        la API de GitHub
      demos.ts          estado de las demos que se duermen
      ProveidorProjectes.tsx  la lista de proyectos y el estado de las demos, una sola vez
                        para toda la página (portada y proyectos leen de aquí)
      contacte.ts       correo, WhatsApp, LinkedIn y GitHub
      cv.ts             el PDF del currículum
    components/
      Porta.tsx         pantalla de acceso
      Portafoli.tsx     cabecera, contacto, pie y el montaje de la página
      MenuMobil.tsx     la hoja del menú en el móvil
      Portada.tsx       la portada: ficha, contacto rápido y el retrato con el chip detrás
      Demos.tsx         #demos: la banda a todo el ancho entre la portada y la historia (el anillo 3D,
                        su respaldo de CSS o la fila plana) y las tarjetas de esa fila
      XipCapes.tsx      las capas del chip dibujadas en SVG, marca de cada capítulo
      Projectes.tsx     la cabecera de #projectes (nota, contador y «Despertar todas») y las
                        tarjetas detalladas del carrusel grande
      Carrusel.tsx      la cinta plana de tarjetas (respaldo de móvil y movimiento reducido)
      galeria/          las galerías 3D
        orbita.tsx      el anillo de #demos (WebGL): tarjetas enmarcadas, encuadre automático, nombre al pasar
        galaxia.tsx     la galaxia de #projectes (WebGL)
        ModalProjecte.tsx  el modal de proyecto, el mismo para las dos
        piezas3d.tsx    lo de three que comparten: estrellas, partículas y ZoomRueda (Ctrl + rueda)
        comu3d.tsx      lo que comparten sin tocar three: useCapaz, Limit, useBucle y teclaZoom
        Galeria3D.tsx   el escaparate de CSS, respaldo del anillo sin WebGL: giro, pausa, arrastre,
                        botones, teclado y foco (solo transforms, sin WebGL)
        formes.ts       dónde va cada tarjeta del escaparate (y del anillo de CSS, ya sin uso)
      BotoDemo.tsx      el botón de una demo con sus fases (probar, arrancando, abrir)
      Trajectoria.tsx   experiencia y formación con línea de tiempo, herramientas e idiomas
      Fila.tsx          fila de lista con fecha; con `hito` es un nodo de la línea de tiempo
      Titol.tsx         encabezado de sección con el número en contorno
      Curriculum.tsx    la vista #cv
      Moviment.tsx      entrada escalonada, imán, fondo y anillo del puntero
      Fons3D.tsx        decide si hay escena o fondo estático y carga three; exporta capac()
      Escena.tsx        el procesador en 3D: geometría, shaders, bucle y etiquetas de la película
      relat/            la historia y el modo película
        Escenari.tsx    #escenari: la capa fijada con la escena, los recorridos q y p, RelatCtx y la
                        máscara con la que la capa se funde mientras pasa #demos
        Historia.tsx    #historia en los dos modos: película (380svh) o bloques en flujo normal
        Rail.tsx        los cuatro segmentos de capítulo y «Saltar a los proyectos»
        tabla.ts        lo que comparten tarjetas, rail y escena: centros, opacidades y el viaje
        despiece.ts     la coreografía del chip: altura, apertura y brillo de cada grupo, cámara
        rotols.ts       las etiquetas de las piezas, con sus textos en es, ca y en
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
- **Lo que cuenta cada tarjeta grande sale de la ficha, y es verdad comprobada.** Cada ficha de
  `lib/projectes.ts` lleva `anyInici` (el año del primer commit del repositorio), `persones`
  (quienes lo hicieron según el historial; sin el campo es individual), `pila` (el stack de los
  chips de la tarjeta grande, de 5 o 6 como mucho para que quepan en una fila a partir de 1280
  px; `tec` se queda corta para las pequeñas) y `aportacio` (qué hizo Alex; en los de equipo, su
  parte). El reparto del Volkswagen es el del README de ese proyecto. No se anuncia
  lo que el código no hace: el inventario no pide nada al servidor al buscar, ordenar o filtrar
  (pasa en el navegador) y sus altas son formularios de siempre, así que ni `pila`, ni `tec`, ni
  la descripción larga hablan de AJAX. El `MVC-AJAX` de su clave es solo el nombre del
  repositorio y del servicio: no se enseña en ninguna pantalla. Una frase por línea en
  escritorio (unos 50 caracteres) para que las tarjetas salgan parejas; en el móvil se ven las
  dos primeras.
- **El pie de las tarjetas grandes es igual en todas.** Solo lleva `BotoDemo`. El enlace
  «Código» va a la derecha de la fila de arriba (año y equipo), porque los repositorios privados
  (inventario y Volkswagen) no lo tienen y con el enlace abajo su botón quedaba más bajo que el
  de las demás. El estado de la demo lo cuenta el botón (los mismos colores y fases que el mini)
  y una línea de 2 px en la base de la captura; ya no hay pastilla ni nota sobre la tarjeta. Si
  la demo falla, la explicación solo se oye (`sr-only`) para que la tarjeta no crezca.
- **La cabecera de `#projectes` es una sola nota, el contador y el botón.** `useDespertarTotes`
  (en `ProveidorProjectes`) da el contador y el gesto de despertar todas, con la misma regla que
  el botón del carrusel de la portada.
- **Las banderas van dibujadas en SVG.** Windows no pinta los emoji de bandera y la
  senyera ni siquiera existe como emoji.
- **`prefers-reduced-motion` deja todo quieto, no lento.** Imán, entrada escalonada, línea
  de tiempo, carruseles, galerías 3D (que caen al carrusel plano) y anillo del puntero se
  apagan enteros.
- **El menú sigue el orden de la página.** `SECCIONS`, en `Portafoli.tsx`: Historia, Proyectos,
  Trayectoria y Contacto, que es el orden real (portada, demos, historia, proyectos...). Las demos no
  tienen entrada propia: son lo primero que sale tras la portada y Proyectos ya las recoge. La
  sección activa (`aria-current`) vigila también `#dalt` y `#demos`, que no tienen enlace, para que
  al volver hacia arriba no se quede marcada la última que se vio.
- **El retrato es la primera `<img>` de `#dalt` y no puede haber otra antes.** `Escena.tsx`
  se coloca buscándola y escala el chip con su ancho, y su máscara se centra en ella. Por eso
  es un solo elemento que cambia de sitio con la rejilla de la portada, y por eso el webp está
  recortado al círculo (sin margen transparente): el chip sale a 2,1 veces el retrato.
  `alex-400.webp` y `alex-800.webp` salen de `Img/alex.png` (el de la raíz del repositorio, que
  es el original) pasado por un canvas, recortado a su círculo y codificado a calidad 0,85.
  En la película la escena no lo busca: `Escenari` le pasa la ref `retrat`, que la portada
  pone en ese mismo `<img>`.
- **Hay dos galerías 3D de verdad y una de respaldo.** El anillo de `#demos` (`galeria/orbita.tsx`) y
  la galaxia de `#projectes` (`galeria/galaxia.tsx`) son WebGL con react-three-fiber y drei, en trozos
  aparte (lazy) que solo se piden en escritorio con WebGL (`useCapaz` y `Limit`, de `comu3d.tsx`).
  Cada una pausa su bucle fuera de pantalla con `useBucle`, así que no hay dos lienzos de galería
  pintando a la vez, y la capa del chip también se para mientras `#demos` la cubre entera. Si el
  anillo no puede montarse (sin WebGL, o el lienzo se cae) la banda cae al escaparate de CSS
  (`Galeria3D.tsx` y `formes.ts`: DOM de verdad con `perspective` y `transform`, un solo bucle sin pasar
  por el estado de React); en móvil y con movimiento reducido, a la fila plana de siempre. Mientras
  llega el trozo del anillo se reserva su hueco entero, para que la banda no crezca de golpe. Las
  piezas que usan three y comparten las dos (estrellas, partículas y `ZoomRueda`) están en
  `piezas3d.tsx`; `comu3d.tsx` no puede importar three ni fiber, o su peso se colaría en el trozo del
  portafolio. El lienzo de r3f necesita **altura explícita** en su caja (no `min-height`) o sale
  minúsculo: `.orbita__llenc` y `.galaxia`, en `index.css`.
- **Qué versión se monta lo decide `Demos.tsx`** (y `Projectes.tsx` para la galaxia) con
  `!useReducedMotion() && !useMovil()` y, para WebGL, `useCapaz()`. En el móvil (menos de 768 px) y con
  `prefers-reduced-motion` cae la fila plana (`Carrusel.tsx`, variante `compacte` en columnas de dos,
  con la fila quieta y snap en el móvil: `quieta`); en escritorio sin WebGL, el escaparate de CSS. El
  carrusel de `#projectes` sangra a los bordes de la ventana y el de `#demos` va dentro del margen de
  la página.
- **`#demos` es una banda a todo el ancho, transparente y sin contorno.** Va entre `#dalt` y `#historia`,
  dentro de `#escenari`. Detrás tiene que verse la animación de la placa base (la que ilumina el
  cursor) y por delante solo van las tarjetas y la ficha, que llevan su propio fondo: no hay fondo de
  sección, ni filetes, ni `data-tapa` en ella, y un recuadro negro es justo lo que no se quiere. El lienzo
  del anillo también es transparente (alpha y `setClearColor(0, 0)`), con una máscara en los cuatro
  lados para que no se note dónde empieza. Desde 1024 px la banda mide `100svh - 56 px` y su contenido
  se centra; el anillo se lleva el resto de la ventana: `calc(100svh - 296px)`, con tope de 52vw y de
  880 px. Esos 296 px son la cabecera de la página (56), el relleno de la banda (56), su cabecera (unos
  100, algo más con el titular grande de 1920 px), el hueco (16) y la pista (56), así que si cambia el
  alto de alguna de esas piezas hay que retocar ese número en `.orbita__llenc`.
- **En la película la capa fijada del chip se enmascara mientras pasa `#demos`.** Como la banda es
  transparente, sin esto se vería el chip por detrás en vez de la placa. `Escenari` calcula en su
  listener de scroll dónde cae la banda en coordenadas de la capa y le pone una `mask-image`
  (`mascaraBanda`, otro `MotionValue`, sin pasar por React) que la deja transparente solo ahí, con un
  fundido de `FUNDIDO_PORTADA` (160 px, el de `motor.tsx`) a cada lado: el chip se apaga a la vez que la
  placa asoma bajo la portada, y al salir la banda pasa lo contrario. Para eso `#historia` lleva
  `data-tapa="tot"` (la placa no se pinta mientras la capa cubre la ventana) y `data-tapa-entra` (la
  placa se apaga con fundido por arriba, ver `zonasTapadas` en `motor.tsx`), y `#escenari` ya no lleva
  `data-tapa`, porque taparía también la banda. Si la banda cubre la capa entera, `Escenari` marca
  `oculta` y la escena no pinta (el bucle sigue, no cuesta nada, y retoma en el mismo fotograma).
- **El modal de proyecto es uno solo** (`galeria/ModalProjecte.tsx`): lo abren el anillo y la galaxia al
  pulsar una tarjeta, o el teclado desde su lista oculta (un botón por proyecto). Lleva la captura, el
  detalle, «Probar la demo» (la demo se inicia desde ahí) y «Código», se cierra con la X, con Escape o
  tocando fuera, y atrapa el foco. Va en un portal al `<body>`: la banda tiene su propio contexto de
  apilado (`z-index: 10` en la película) y, sin el portal, la cabecera (`z-index: 50`) quedaría por
  encima del modal. Con el modal abierto cada galería se esconde (`.orbita__llenc--amagat` y
  `.galaxia--amagat`, `visibility: hidden`) y el anillo además deja de dibujar. Pulsar una tarjeta solo
  cuenta si el puntero no se movió (`e.delta`): react-three-fiber dispara el clic al soltar un arrastre
  encima de una tarjeta, y los controles giran con cualquier movimiento.
- **La rueda sola siempre mueve la página, también sobre las galerías; el zoom es con Ctrl (o ⌘) +
  rueda.** Antes OrbitControls cancelaba toda rueda sobre el lienzo y, con el anillo a todo el ancho,
  quien bajaba por la página se quedaba atascado. `ZoomRueda` (`piezas3d.tsx`) enciende
  `controls.enableZoom` solo si el evento lleva `ctrlKey` o `metaKey`, antes de que lo vean los
  controles: sin tecla no se cancela nada, y con ella OrbitControls hace el zoom (con sus topes) y
  cancela el evento, de modo que tampoco hay zoom del navegador. El pellizco del trackpad llega como
  rueda con Ctrl y vale igual. La pista de cada galería lleva la tecla que toca (`teclaZoom`, en
  `comu3d.tsx`). Para comprobarlo hace falta un `WheelEvent` real y cancelable
  (`new WheelEvent("wheel", { ctrlKey: true, cancelable: true })`) y mirar `defaultPrevented`: la rueda
  de CDP no es cancelable y da un falso negativo.
- **El anillo se encuadra solo** (`encuadre`, en `orbita.tsx`): prueba las tarjetas en su círculo con la
  cámara cada vez más lejos y coge la primera distancia con la que el anillo cabe de lado a lado
  (`AIRE_X`) y de arriba abajo (`AIRE_Y`), centrado en vertical, sea cual sea la forma del lienzo. Se
  recalcula al cambiar el tamaño, conservando el zoom y la dirección en que esté la cámara. Los topes del
  zoom son `ZOOM_PROP` (sin atravesar la tarjeta de delante) y `ZOOM_LLUNY` veces la distancia de
  encuadre. La primera tarjeta empieza de cara a la cámara y la niebla (`scene.fog`) sigue a la cámara
  para apagar las del fondo a cualquier zoom.
- **En la versión plana, cada paso del carrusel de `#demos` es una columna de dos proyectos**,
  uno encima de otro. Para `Carrusel.tsx` la columna es una sola pieza, así que «siguiente», Tab y el
  resaltado del ratón trabajan por columna, y Tab recorre primero la tarjeta de arriba y
  luego la de abajo. La tarjeta es vertical: la captura arriba, tan ancha como la tarjeta, y
  debajo el nombre, el stack y `BotoDemo` a todo el ancho. La nota «Pide crear cuenta» del
  Volkswagen va a la derecha del stack, en su misma línea (si no caben juntos, baja a la
  siguiente). Va así a propósito: las filas de todas las columnas miden lo mismo (manda la
  tarjeta más alta) y una línea propia para la nota sumaría 18 px a todas. Van primero
  incidencias, inventario, Volkswagen y CRM, y luego el resto. Detrás del último proyecto va
  la tarjeta «Ver todos los proyectos» (`TargetaTots`: el número de proyectos en contorno,
  como el de las secciones, y el enlace abajo), que baja a `#projectes`: con nueve proyectos
  completa la última columna y, si la cuenta fuera par, ocupa ella sola la columna entera.
  Un título largo que parta en dos líneas se arregla con `curt` en la ficha de
  `lib/projectes.ts`. Las tarjetas (`TargetaMini` y `TargetaTots`, en `Demos.tsx`) siguen con las
  clases `.portada__*` de `index.css`, que son de tarjeta y no de la portada.
- **El alto de las capturas de la fila plana sale de la ventana, no es fijo.** La pieza del carrusel
  mide `--col`, que declara `.carrusel--compacte` (la ventana menos 56 px, entre 15 y 40 rem; en el
  móvil, la ventana menos el margen y 32 px, hasta 28 rem) y que `.demos` acota desde 768 px a
  `clamp(18rem, 30cqw, 26rem)`, para que no se estire en una banda a todo el ancho. Con `--col`,
  `.portada__captura` calcula su alto: 16:9, pero sin pasar de lo que deja la ventana (`100svh` menos
  la cabecera de 56 px, `--pad-v` y `--cap`, que declara `.demos` y son el relleno y la cabecera de la
  banda, y 132 px por cada tarjeta sin su captura) y sin bajar de 2,8:1. Así las dos tarjetas de una
  columna caben enteras, con sus botones, en la ventana. En el móvil no se resta nada: la página baja y
  la captura es 16:9 de lo que mida la columna. **Si cambia el alto de algo que no es captura en la
  banda** (la cabecera, el texto o el relleno de la tarjeta), hay que retocar `--cap`, `--pad-v` o los
  132 px en `index.css`; si no, la segunda tarjeta se corta por abajo o sobra hueco. Las capturas altas
  (800 × 750) recorren al pasar el ratón justo lo que les sobra (`--alt` menos su alto).
- **Las columnas de la fila plana entran por la derecha y salen por la izquierda** (`entra="dreta"`
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
- **La coreografía vive en dos ficheros y en ningún otro sitio.** `relat/tabla.ts` lleva lo que
  comparten las tarjetas, el rail y la escena, y sus cifras salen de los altos de la historia
  (titular de 60svh y cuatro bloques de 80svh, 380svh en total): si cambia un alto en
  `index.css`, hay que recalcular `CENTRO` y `OPACIDAD` con la cuenta que explica el fichero.
  `relat/despiece.ts` lleva lo que solo mueve el chip. Están separados por peso: lo que importa
  la página va en el trozo inicial y lo que solo importa la escena, en el suyo. No importar
  `despiece.ts` desde fuera de `Escena.tsx`.
- **Todo lo que mueve el chip es una función continua de q y p** (posición, tamaño, máscara,
  despiece de cada grupo, peso, brillo y cámara): entre fila y fila de cada tabla se pasa con
  curva y lo que acaba la portada empalma con lo que empieza la historia. Un escalón en una
  tabla se ve como un salto del chip. Por eso tampoco sube con el scroll: sale de donde estaba
  el retrato y se desliza. Entre capítulos, el grupo que entra se enciende antes de que se
  apague el que sale, para que el chip no pase nunca por un momento a oscuras.
- **El chip tiene ocho grupos de piezas** (bolas BGA, sustrato con condensadores, pistas,
  silicio en bloques, capas de metal, pasta térmica, escudo y tapa IHS), cada uno con su número
  `aGrup` en los shaders. Las piezas nuevas llevan `aNou` y solo se ven en la película
  (`uNou`), así que la portada normal sale igual que antes, píxel a píxel. El resplandor son
  las mismas líneas instanciadas un píxel o dos alrededor (un solo dibujo más), y en la portada
  no se dibuja. Tres llamadas de dibujo en total.
- **Las etiquetas de las piezas son decoración** (`aria-hidden`) y llevan su propio diccionario
  en `relat/rotols.ts`, no en `idioma.tsx`, para que sus textos viajen con la escena y no
  engorden el trozo inicial. El tipo obliga a que es, ca y en tengan las mismas claves. Van en
  una columna a la derecha, por encima del rail y lejos de las tarjetas.
- **La placa del fondo no se pinta detrás de `[data-tapa]`.** `#dalt` lo lleva siempre; en la película
  `#historia` lleva `data-tapa="tot"` (se borra hasta su final de verdad, aunque quede por debajo de la
  ventana) y `data-tapa-entra` (el borrado crece con un fundido de 160 px por arriba, tras la banda de
  las demos). Así la placa no asoma durante la historia fijada y vuelve con el fundido de 160 px
  cuando la capa se suelta. `#demos` no lleva nada: ahí la placa se ve entera. Si lo tapado cubre la
  ventana entera, `motor.tsx` ni pinta.
- **El rail va abajo a la derecha a propósito.** Las tarjetas suben por la columna de la
  izquierda y un rail fijo en esa esquina se cruzaba con todas. Fuera de la historia se apaga y
  queda `inert`, así que el tabulador no se para en botones que no se ven.
- **El trozo de `three` pesa unos 187 kB comprimidos y va en su propio fichero** (y otros 62 kB el de
  react-three-fiber y drei, `piezas3d`, que solo piden las galerías). Se pide después de pintar la
  página, así que la primera carga sigue costando lo mismo que antes: el trozo inicial queda en unos
  120 kB comprimidos. Si se importa three o fiber desde cualquier otro sitio (`comu3d.tsx`, por ejemplo),
  ese peso se cuela en el bundle principal.
