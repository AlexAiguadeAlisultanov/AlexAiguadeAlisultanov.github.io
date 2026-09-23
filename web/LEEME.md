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
    components/
      Porta.tsx         pantalla de acceso
      Portafoli.tsx     cabecera, portada, sobre mí, formación, aptitudes y contacto
      Projectes.tsx     tarjetas de proyecto y panel de arranque de las demos
      Moviment.tsx      imán, revelado, tira, apilado, fondo y anillo del puntero
      Fons3D.tsx        decide si la portada lleva escena o fondo estático, y carga three
      Escena.tsx        la malla de nodos en 3D, con sus shaders y su bucle
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
  sondear al entrar serían cinco arranques por visita. Se encienden cuando alguien lo pide.
- **Los dos botones de una demo nunca conviven**: o está el de iniciar o está el de
  probar, en el mismo hueco.
- **Las banderas van dibujadas en SVG.** Windows no pinta los emoji de bandera y la
  senyera ni siquiera existe como emoji.
- **`prefers-reduced-motion` deja todo quieto, no lento.** Imán, revelado, tira, apilado y
  anillo del puntero se apagan enteros.
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
- **El trozo de `three` pesa unos 130 kB comprimidos y va en su propio fichero.** Se pide
  después de pintar la página, así que la primera carga sigue costando lo mismo que antes.
  Si se importa three desde cualquier otro sitio, ese trozo se cuela en el bundle principal.
