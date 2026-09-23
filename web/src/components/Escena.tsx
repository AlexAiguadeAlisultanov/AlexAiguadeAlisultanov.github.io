// Fondo de la portada: una malla de nodos conectados en tres dimensiones, construida por
// codigo. No hay ningun modelo importado ni ninguna textura; son posiciones calculadas al
// arrancar y dos llamadas de dibujo por fotograma, una para los enlaces y otra para los
// nodos.
//
// Por que esta escena y no otra: la pagina es de alguien que trabaja en sistemas y redes,
// asi que el fondo habla de eso. Capas de profundidad que se leen como armarios, enlaces
// entre nodos con pulsos que recorren la linea como si fuera trafico, y una rejilla de
// suelo que da el plano de referencia.
//
// De three se importan solo las piezas que se usan. Nada de escenas de materiales, luces,
// sombras ni cargadores: el material es un shader propio de veinte lineas, asi que el
// empaquetador puede tirar casi toda la libreria.
//
// Este modulo se carga aparte, con import dinamico, y solo cuando el equipo da la talla.
// Quien entra por el movil o sin WebGL no descarga ni un byte de esto.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer
} from "three";

/* ---------- Medidas de la malla ---------- */

const COLUMNES = 11;
const FILES = 6;
const CAPES = 5;

const AMPLA = 7.6;
const ALTA = 4.0;
const FONDA = 6.2;

const CAMERA_Z = 5.6;
const A_PROP = 4.2;    // desde aqui los nodos se ven enteros
const AL_LLUNY = 13.5; // y aqui ya se han apagado del todo

const SOL_Y = -2.75;   // altura de la rejilla de suelo
const SOL_PAS = 1.6;
const SOL_ABAST = 6;   // casillas a cada lado

/** Color del acento, leido de la hoja de estilos para no tenerlo escrito en dos sitios. */
function accent(): Color {
  const reserva = new Color(0.373, 0.776, 0.831);
  try {
    const cru = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    if (cru) return new Color(cru);
  } catch {
    // Se queda el de reserva.
  }
  return reserva;
}

/** Generador con semilla fija: la composicion es la misma en cada visita. */
function daus(llavor: number) {
  let estat = llavor;
  return () => {
    estat = (estat * 1103515245 + 12345) & 0x7fffffff;
    return estat / 0x7fffffff;
  };
}

const VERTEX_COMU = `
  uniform float uTemps;
  uniform float uAmp;
  uniform float uProp;
  uniform float uLluny;
  attribute float aFase;
  attribute float aVel;
  attribute float aAmp;
  varying float vAlfa;

  vec4 situar() {
    vec3 p = position;
    p.x += sin(uTemps * aVel + aFase) * uAmp * aAmp;
    p.y += cos(uTemps * aVel * 0.83 + aFase * 1.7) * uAmp * 0.85 * aAmp;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    float f = clamp((uLluny - dist) / (uLluny - uProp), 0.0, 1.0);
    vAlfa = f * f;
    return mv;
  }
`;

const VS_NODES = `
  ${VERTEX_COMU}
  uniform float uPunt;
  void main() {
    vec4 mv = situar();
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPunt / max(-mv.z, 0.001);
  }
`;

const FS_NODES = `
  uniform vec3 uColor;
  uniform float uForca;
  varying float vAlfa;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float vora = smoothstep(0.25, 0.02, d2);
    gl_FragColor = vec4(uColor, vora * vAlfa * uForca * 0.72);
  }
`;

const VS_ENLLACOS = `
  ${VERTEX_COMU}
  attribute float aT;
  attribute float aLlavor;
  attribute float aBase;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  void main() {
    vT = aT;
    vLlavor = aLlavor;
    vBase = aBase;
    gl_Position = projectionMatrix * situar();
  }
`;

const FS_ENLLACOS = `
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform float uTemps;
  uniform float uForca;
  varying float vAlfa;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  void main() {
    float alfa = vAlfa * vBase * uForca * 0.38;
    float pols = 0.0;
    if (vLlavor >= 0.0) {
      float lloc = fract(uTemps * 0.12 + vLlavor);
      float d = abs(vT - lloc);
      d = min(d, 1.0 - d);
      pols = smoothstep(0.07, 0.0, d);
    }
    gl_FragColor = vec4(mix(uColor, uPols, pols), alfa + pols * vAlfa * uForca * 0.45);
  }
`;

type Malla = {
  nodes: BufferGeometry;
  enllacos: BufferGeometry;
  tallNodes: number[];    // cuantos vertices quedan si se quitan las capas del fondo
  tallEnllacos: number[];
};

/** Construye la malla entera. Las capas van de cerca a lejos, para poder cortar el fondo
    sin tocar lo que se ve delante. */
function construir(): Malla {
  const atzar = daus(20260924);

  type Vertex = { x: number; y: number; z: number; fase: number; vel: number };
  const punts: Vertex[] = [];
  const index = (i: number, j: number, k: number) => (k * FILES + j) * COLUMNES + i;

  for (let k = 0; k < CAPES; k++) {
    for (let j = 0; j < FILES; j++) {
      for (let i = 0; i < COLUMNES; i++) {
        punts.push({
          x: (i / (COLUMNES - 1) - 0.5) * AMPLA + (atzar() - 0.5) * 0.34,
          y: (j / (FILES - 1) - 0.5) * ALTA + (atzar() - 0.5) * 0.3,
          z: -(k / (CAPES - 1)) * FONDA + (atzar() - 0.5) * 0.36,
          fase: atzar() * Math.PI * 2,
          vel: 0.14 + atzar() * 0.22
        });
      }
    }
  }

  // Nodos, ordenados por capa: cortar por el final quita lo mas lejano.
  const pos: number[] = [];
  const fase: number[] = [];
  const vel: number[] = [];
  const amp: number[] = [];
  const tallNodes: number[] = [];
  for (let k = 0; k < CAPES; k++) {
    for (let j = 0; j < FILES; j++) {
      for (let i = 0; i < COLUMNES; i++) {
        const n = punts[index(i, j, k)];
        pos.push(n.x, n.y, n.z);
        fase.push(n.fase);
        vel.push(n.vel);
        amp.push(1);
      }
    }
    tallNodes.push(pos.length / 3);
  }

  const nodes = new BufferGeometry();
  nodes.setAttribute("position", new Float32BufferAttribute(pos, 3));
  nodes.setAttribute("aFase", new Float32BufferAttribute(fase, 1));
  nodes.setAttribute("aVel", new Float32BufferAttribute(vel, 1));
  nodes.setAttribute("aAmp", new Float32BufferAttribute(amp, 1));

  // Enlaces. Primero el suelo, que se queda siempre, y despues capa por capa.
  const lp: number[] = [];
  const lfase: number[] = [];
  const lvel: number[] = [];
  const lamp: number[] = [];
  const lt: number[] = [];
  const lllavor: number[] = [];
  const lbase: number[] = [];

  const barra = (a: Vertex, b: Vertex, llavor: number, base: number, mou: number) => {
    lp.push(a.x, a.y, a.z, b.x, b.y, b.z);
    lfase.push(a.fase, b.fase);
    lvel.push(a.vel, b.vel);
    lamp.push(mou, mou);
    lt.push(0, 1);
    lllavor.push(llavor, llavor);
    lbase.push(base, base);
  };

  const quiet = (x: number, y: number, z: number): Vertex => ({ x, y, z, fase: 0, vel: 0 });

  for (let i = -SOL_ABAST; i <= SOL_ABAST; i++) {
    const d = SOL_ABAST * SOL_PAS;
    barra(quiet(i * SOL_PAS, SOL_Y, -d), quiet(i * SOL_PAS, SOL_Y, d), -1, 0.5, 0);
    barra(quiet(-d, SOL_Y, i * SOL_PAS), quiet(d, SOL_Y, i * SOL_PAS), -1, 0.5, 0);
  }

  const tallEnllacos: number[] = [];
  for (let k = 0; k < CAPES; k++) {
    for (let j = 0; j < FILES; j++) {
      for (let i = 0; i < COLUMNES; i++) {
        const a = punts[index(i, j, k)];
        // Un enlace de cada tres lleva pulso: con todos encendidos parece una guirnalda.
        const amb = (n: number) => (n % 3 === 0 ? atzar() : -1);
        if (i + 1 < COLUMNES) barra(a, punts[index(i + 1, j, k)], amb(i + j + k), 1, 1);
        if (j + 1 < FILES) barra(a, punts[index(i, j + 1, k)], -1, 0.72, 1);
        if (k + 1 < CAPES) barra(a, punts[index(i, j, k + 1)], amb(i + j + k + 2), 0.85, 1);
      }
    }
    tallEnllacos.push(lp.length / 3);
  }

  const enllacos = new BufferGeometry();
  enllacos.setAttribute("position", new Float32BufferAttribute(lp, 3));
  enllacos.setAttribute("aFase", new Float32BufferAttribute(lfase, 1));
  enllacos.setAttribute("aVel", new Float32BufferAttribute(lvel, 1));
  enllacos.setAttribute("aAmp", new Float32BufferAttribute(lamp, 1));
  enllacos.setAttribute("aT", new Float32BufferAttribute(lt, 1));
  enllacos.setAttribute("aLlavor", new Float32BufferAttribute(lllavor, 1));
  enllacos.setAttribute("aBase", new Float32BufferAttribute(lbase, 1));

  return { nodes, enllacos, tallNodes, tallEnllacos };
}

/** Muelle con inercia: acelera hacia el destino y frena, no interpola en linea recta. */
type Moll = { valor: number; vel: number };
function empenyer(m: Moll, desti: number, dt: number, rigidesa = 34) {
  const fre = 2 * Math.sqrt(rigidesa) * 0.82;
  m.vel += ((desti - m.valor) * rigidesa - m.vel * fre) * dt;
  m.valor += m.vel * dt;
}

export default function Escena({ onFalla }: { onFalla: () => void }) {
  const quiet = useReducedMotion();
  const llenc = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = llenc.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power"
      });
    } catch {
      // Sin contexto no hay escena: la portada se queda con el fondo estatico.
      onFalla();
      return;
    }

    /** true si quien pinta es la CPU (SwiftShader, llvmpipe). Va a ir justo de sobra, asi
        que la escena arranca ya recortada en vez de esperar a que el contador lo note. */
    const perProgramari = () => {
      try {
        const gl = renderer.getContext();
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (!info) return false;
        const nom = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || "");
        return /swiftshader|llvmpipe|software|basic render/i.test(nom);
      } catch {
        return false;
      }
    };

    const tope = () => Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(tope());
    renderer.setClearAlpha(0);

    const color = accent();
    const pols = color.clone().lerp(new Color(1, 1, 1), 0.55);

    const uniformes = {
      uTemps: { value: 0 },
      uAmp: { value: 0.09 },
      uProp: { value: A_PROP },
      uLluny: { value: AL_LLUNY },
      uForca: { value: 1 },
      uColor: { value: color },
      uPols: { value: pols },
      uPunt: { value: 16 * tope() }
    };

    const malla = construir();

    const matNodes = new ShaderMaterial({
      uniforms: uniformes,
      vertexShader: VS_NODES,
      fragmentShader: FS_NODES,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending
    });

    const matEnllacos = new ShaderMaterial({
      uniforms: uniformes,
      vertexShader: VS_ENLLACOS,
      fragmentShader: FS_ENLLACOS,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending
    });

    const escena = new Scene();
    const grup = new Group();
    const enllacos = new LineSegments(malla.enllacos, matEnllacos);
    const nodes = new Points(malla.nodes, matNodes);
    grup.add(enllacos);
    grup.add(nodes);
    grup.position.x = 0.5;   // la malla se corre a la derecha, donde no hay titular
    escena.add(grup);

    const camera = new PerspectiveCamera(50, 1, 0.1, 40);
    camera.position.set(0, 0, CAMERA_Z);

    const dimensionar = () => {
      const caixa = canvas.getBoundingClientRect();
      const ample = Math.max(1, Math.round(caixa.width));
      const alt = Math.max(1, Math.round(caixa.height));
      camera.aspect = ample / alt;
      camera.updateProjectionMatrix();
      renderer.setSize(ample, alt, false);
    };

    dimensionar();

    // Con movimiento reducido se dibuja un fotograma y se acaba. La estructura se ve, la
    // profundidad tambien, y no se mueve nada.
    if (quiet) {
      renderer.render(escena, camera);
      const remesurar = () => {
        dimensionar();
        renderer.render(escena, camera);
      };
      window.addEventListener("resize", remesurar);
      return () => {
        window.removeEventListener("resize", remesurar);
        malla.nodes.dispose();
        malla.enllacos.dispose();
        matNodes.dispose();
        matEnllacos.dispose();
        renderer.dispose();
      };
    }

    const girX: Moll = { valor: 0, vel: 0 };
    const girY: Moll = { valor: 0, vel: 0 };
    const baixada: Moll = { valor: 0, vel: 0 };
    let destiX = 0;
    let destiY = 0;
    let destiBaixada = 0;

    let rid = 0;
    let anterior = 0;
    let rellotge = 0;
    let viu = true;          // la portada esta en pantalla
    let mitjana = 16.7;      // coste medio de un fotograma, en milisegundos
    let mostres = 0;
    let nivell = 0;          // 0 completo, 1 sin densidad de pixeles, 2 sin la capa del
                             // fondo, 3 a la mitad de fotogramas
    const PRESSUPOST = 26;   // por encima de esto el equipo no da y se recorta

    // Si pinta la CPU se arranca ya en el segundo escalon, sin esperar a que el contador
    // de fotogramas lo descubra.
    if (perProgramari()) {
      nivell = 1;
      renderer.setPixelRatio(1);
      uniformes.uPunt.value = 16;
      dimensionar();
    }

    const rebaixar = () => {
      if (nivell === 0) {
        nivell = 1;
        renderer.setPixelRatio(1);
        uniformes.uPunt.value = 16;
        dimensionar();
      } else if (nivell === 1) {
        nivell = 2;
        malla.nodes.setDrawRange(0, malla.tallNodes[CAPES - 2]);
        malla.enllacos.setDrawRange(0, malla.tallEnllacos[CAPES - 2]);
      } else if (nivell === 2) {
        nivell = 3;
      }
      mostres = 0;
      mitjana = 16.7;
    };

    const bucle = (marca: number) => {
      rid = 0;
      let dt = anterior ? (marca - anterior) / 1000 : 1 / 60;
      anterior = marca;
      if (!(dt > 0) || dt > 0.25) dt = 1 / 60;   // veniamos de una pausa, no dar el salto

      mitjana += (dt * 1000 - mitjana) * 0.05;
      mostres += 1;
      if (mostres > 120 && nivell < 3 && mitjana > PRESSUPOST) rebaixar();

      rellotge += dt;
      empenyer(girX, destiX, dt);
      empenyer(girY, destiY, dt);
      empenyer(baixada, destiBaixada, dt, 22);

      if (nivell < 3 || mostres % 2 === 0) {
        uniformes.uTemps.value = rellotge;
        // Deriva lenta, para que la escena no se quede parada si nadie toca el raton.
        grup.rotation.y = girX.valor * 0.46 + Math.sin(rellotge * 0.07) * 0.06;
        grup.rotation.x = girY.valor * 0.28 + baixada.valor * 0.14;
        grup.position.x = 0.5 - girX.valor * 0.55;
        grup.position.y = -girY.valor * 0.3;
        camera.position.z = CAMERA_Z + baixada.valor * 2.6;
        uniformes.uForca.value = 1 - baixada.valor * 0.55;
        renderer.render(escena, camera);
      }

      if (viu && !document.hidden) rid = window.requestAnimationFrame(bucle);
    };

    const arrancar = () => {
      if (rid || !viu || document.hidden) return;
      anterior = 0;
      rid = window.requestAnimationFrame(bucle);
    };

    const parar = () => {
      if (rid) window.cancelAnimationFrame(rid);
      rid = 0;
    };

    const moure = (event: PointerEvent) => {
      destiX = event.clientX / window.innerWidth - 0.5;
      destiY = event.clientY / window.innerHeight - 0.5;
    };

    const baixar = () => {
      destiBaixada = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
    };

    const remesurar = () => {
      dimensionar();
      baixar();
    };

    // Fuera de pantalla no se pinta: el fondo solo vive mientras se ve la portada.
    const vigilant = new IntersectionObserver(
      ([entrada]) => {
        viu = entrada.isIntersecting;
        if (viu) arrancar();
        else parar();
      },
      { threshold: 0 }
    );
    vigilant.observe(canvas);

    const visibilitat = () => (document.hidden ? parar() : arrancar());

    // Si el navegador se queda sin contexto (otra pestana lo reclama, el portatil cambia
    // de tarjeta) se deja el fondo estatico en su sitio en vez de un hueco negro.
    const perdut = (event: Event) => {
      event.preventDefault();
      parar();
      onFalla();
    };

    window.addEventListener("pointermove", moure, { passive: true });
    window.addEventListener("scroll", baixar, { passive: true });
    window.addEventListener("resize", remesurar);
    document.addEventListener("visibilitychange", visibilitat);
    canvas.addEventListener("webglcontextlost", perdut);
    baixar();
    arrancar();

    return () => {
      parar();
      vigilant.disconnect();
      window.removeEventListener("pointermove", moure);
      window.removeEventListener("scroll", baixar);
      window.removeEventListener("resize", remesurar);
      document.removeEventListener("visibilitychange", visibilitat);
      canvas.removeEventListener("webglcontextlost", perdut);
      malla.nodes.dispose();
      malla.enllacos.dispose();
      matNodes.dispose();
      matEnllacos.dispose();
      renderer.dispose();
    };
  }, [quiet, onFalla]);

  return (
    <canvas
      ref={llenc}
      aria-hidden
      className="pointer-events-none size-full"
      style={{
        // La malla se apaga hacia los bordes y, sobre todo, por la izquierda, que es donde
        // cae el titular. Asi el texto nunca compite con el fondo.
        maskImage:
          "radial-gradient(ellipse 72% 82% at 70% 46%, #000 8%, rgba(0,0,0,.5) 48%, transparent 84%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 72% 82% at 70% 46%, #000 8%, rgba(0,0,0,.5) 48%, transparent 84%)"
      }}
    />
  );
}
