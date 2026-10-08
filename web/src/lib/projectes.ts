// Los proyectos no van escritos a mano. Se leen en vivo de la API publica de GitHub, se
// descartan los archivados y una lista corta de nombres, y se enriquecen con el
// diccionario de fichas de aqui abajo, que aporta titulo, texto en tres idiomas,
// tecnologias y la direccion de la demo.

import type { Clau, Idioma } from "./idioma";
import { traduir } from "./idioma";

// Capturas reales de cada demo, sacadas con la sesion ya iniciada. Las "altas" son mas
// largas que el marco de la tarjeta y al pasar el raton se recorren hacia abajo.
import capAusencias from "../assets/demos/ausencias.webp";
import capCrm from "../assets/demos/crm.webp";
import capGastos from "../assets/demos/gastos.webp";
import capIncidencias from "../assets/demos/incidencias.webp";
import capInventario from "../assets/demos/inventario.webp";
import capLibros from "../assets/demos/libros.webp";
import capReservas from "../assets/demos/reservas.webp";
import capTaquilla from "../assets/demos/taquilla.webp";
import capVolkswagen from "../assets/demos/volkswagen.webp";

export const USUARI = "AlexAiguadeAlisultanov";
const API = "https://api.github.com/users/" + USUARI + "/repos?sort=updated&per_page=100";
const CLAU_REPOS = "portafoli-repos";

export type Rol = "invitado" | "admin";

/** Una tecnologia es texto fijo o una clave que se traduce. */
export type Tec = string | { clau: Clau };

type Multi = Record<Idioma, string>;

type Fitxa = {
  titol: Multi;
  /** Titulo corto para las tarjetas pequenas de la portada, cuando el entero no cabe en una linea. */
  curt?: Multi;
  tipus?: string;
  /** Repositorio privado: la API no lo devuelve y no se ensena enlace al codigo. */
  privat?: boolean;
  tec: Tec[];
  demo?: string;
  text: Multi;
  /** Una linea, lo que se lee en la tarjeta. El texto largo queda para quien lo pida. */
  lema?: Multi;
  /** Captura de la demo y si es mas alta que el marco. */
  captura?: string;
  alta?: boolean;
  /** Sitio entre las cuatro destacadas, que abren el carrusel de la portada siempre en este orden. */
  destacat?: 1 | 2 | 3 | 4;
  /** Para probar la demo hay que crear una cuenta. */
  registre?: true;
  /** Año en que empezó: el del primer commit del repositorio. */
  anyInici?: number;
  /** Cuántas personas lo hicieron, contando a Alex. Sin el campo, individual. */
  persones?: number;
  /** La pila entera, para los chips de la tarjeta grande. `tec` se queda corta a propósito: la leen las pequeñas. */
  pila?: Tec[];
  /** Lo que hizo Alex, dos o tres frases cortas. En los proyectos de equipo, su parte. */
  aportacio?: Multi[];
};

const CONEGUTS: Record<string, Fitxa> = {
  "springboot-thymeleaf-web-master": {
    titol: {
      es: "Gestor de inventario de libros",
      ca: "Gestor d'inventari de llibres",
      en: "Book inventory manager"
    },
    // Con el titulo entero la tarjeta pequena de la portada lo parte en dos lineas y deja
    // "libros" suelto en la segunda.
    curt: {
      es: "Inventario de libros",
      ca: "Inventari de llibres",
      en: "Book inventory"
    },
    tipus: "web",
    tec: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    demo: "https://inventario-de-libros.onrender.com/llibres",
    text: {
      es: "Aplicación web que lleva los libros, los usuarios y los préstamos de una biblioteca, con los datos sobre MySQL.",
      ca: "Aplicació web que porta els llibres, els usuaris i els préstecs d'una biblioteca, amb les dades sobre MySQL.",
      en: "Web app that handles the books, the users and the loans of a library, with the data on MySQL."
    },
    lema: {
      es: "Libros, usuarios y préstamos de una biblioteca.",
      ca: "Llibres, usuaris i préstecs d'una biblioteca.",
      en: "Books, members and loans for a library."
    },
    captura: capLibros,
    alta: true,
    anyInici: 2024,
    pila: ["Java", "Spring Boot", "JPA", "Thymeleaf", "MySQL"],
    aportacio: [
      {
        es: "Libros, usuarios y los préstamos entre ellos",
        ca: "Llibres, usuaris i els préstecs entre ells",
        en: "Books, members and the loans between them"
      },
      {
        es: "Buscar, filtrar y ordenar sin recargar",
        ca: "Cercar, filtrar i ordenar sense recarregar",
        en: "Search, filter and sort with no reload"
      },
      {
        es: "Interfaz rehecha en 2026, en tres idiomas",
        ca: "Interfície refeta el 2026, en tres idiomes",
        en: "Interface rebuilt in 2026, in three languages"
      }
    ]
  },
  "qrcodegenerator": {
    titol: { es: "Taquilla de fútbol", ca: "Taquilla de futbol", en: "Football ticket office" },
    tipus: "web",
    tec: ["Java", "Spring Boot", { clau: "chip.qr" }],
    demo: "https://taquilla-de-futbol.onrender.com",
    text: {
      es: "Web que genera y lee códigos QR para entradas de partidos, con cuentas de usuario y el pago de la entrada.",
      ca: "Web que genera i llegeix codis QR per a entrades de partits, amb comptes d'usuari i el pagament de l'entrada.",
      en: "Site that generates and reads QR codes for match tickets, with user accounts and ticket payment."
    },
    lema: {
      es: "Entradas de fútbol con un código QR para la puerta.",
      ca: "Entrades de futbol amb un codi QR per a la porta.",
      en: "Football tickets with a QR code for the gate."
    },
    captura: capTaquilla,
    alta: true,
    anyInici: 2024,
    persones: 2,
    pila: ["Java", "Spring Boot", "MySQL", "ZXing", "Stripe"],
    aportacio: [
      {
        es: "Cada entrada lleva su propio código QR",
        ca: "Cada entrada porta el seu propi codi QR",
        en: "Every ticket carries its own QR code"
      },
      {
        es: "Cámara en la puerta: solo vale el día del partido",
        ca: "Càmera a la porta: només val el dia del partit",
        en: "Camera at the gate: valid on match day only"
      },
      {
        es: "Interfaz rehecha en 2026, en tres idiomas",
        ca: "Interfície refeta el 2026, en tres idiomes",
        en: "Interface rebuilt in 2026, in three languages"
      }
    ]
  },
  "app-gestio-incidencies": {
    titol: { es: "Gestor de incidencias", ca: "Gestor d'incidències", en: "Issue tracker" },
    tipus: "web",
    tec: ["PHP", "Laravel"],
    demo: "https://gestor-de-incidencias.onrender.com",
    text: {
      es: "Aplicación para registrar las incidencias de un centro educativo y seguir su estado, organizadas por categorías y con los contactos de cada una.",
      ca: "Aplicació per registrar les incidències d'un centre educatiu i seguir-ne l'estat, organitzades per categories i amb els contactes de cadascuna.",
      en: "App to log the issues of a school and follow how they are going, sorted by category and with the contacts for each one."
    },
    lema: {
      es: "Las averías de un centro, del aviso al arreglo.",
      ca: "Les avaries d'un centre, de l'avís a l'arranjament.",
      en: "A school's breakdowns, from report to fix."
    },
    captura: capIncidencias,
    alta: true,
    destacat: 1,
    anyInici: 2024,
    persones: 2,
    pila: ["PHP", "Laravel", "MySQL", "Tailwind", "Alpine.js"],
    aportacio: [
      {
        es: "Altas, cambios y bajas, con categoría y estado",
        ca: "Altes, canvis i baixes, amb categoria i estat",
        en: "Create, edit and delete, with category and status"
      },
      {
        es: "Cada profesor ve las suyas y avisa por WhatsApp",
        ca: "Cada professor veu les seves i avisa per WhatsApp",
        en: "Teachers see their own and alert via WhatsApp"
      },
      {
        es: "Interfaz rehecha en 2026, en tres idiomas",
        ca: "Interfície refeta el 2026, en tres idiomes",
        en: "Interface rebuilt in 2026, in three languages"
      }
    ]
  },
  "MVC-AJAX": {
    titol: { es: "Gestor de inventario", ca: "Gestor d'inventari", en: "Inventory manager" },
    tipus: "web",
    // El repositorio es privado: la API publica no lo devuelve, asi que esta ficha es la
    // unica fuente de la tarjeta, y no se ensena enlace al codigo porque daria un 404 a
    // quien no sea el dueno. La demo si es publica.
    privat: true,
    tec: ["PHP", "MVC", "AJAX"],
    demo: "https://mvc-ajax.onrender.com",
    text: {
      es: "Alta, consulta, edición y borrado de productos con patrón MVC y peticiones AJAX, para que la página no se recargue. Funciona igual en móvil.",
      ca: "Alta, consulta, edició i esborrat de productes amb patró MVC i peticions AJAX, perquè la pàgina no es recarregui. Funciona igual en mòbil.",
      en: "Create, read, update and delete products with an MVC pattern and AJAX requests, so the page never reloads. Works the same on a phone."
    },
    lema: {
      es: "Qué material hay, cuánto queda y dónde está.",
      ca: "Quin material hi ha, quant en queda i on és.",
      en: "What gear there is, how much is left and where."
    },
    captura: capInventario,
    alta: false,
    destacat: 2,
    anyInici: 2023,
    persones: 2,
    // Sin AJAX a proposito: en la version actual buscar, ordenar y filtrar pasan en el
    // navegador y las altas son formularios de siempre, asi que no se anuncia.
    pila: ["PHP", "MVC", "MySQL", "JavaScript"],
    aportacio: [
      {
        es: "Alta, edición y archivo, con foto validada",
        ca: "Alta, edició i arxiu, amb foto validada",
        en: "Add, edit and archive, with a validated photo"
      },
      {
        es: "Buscar, ordenar y filtrar lo que hay que reponer",
        ca: "Cercar, ordenar i filtrar el que cal reposar",
        en: "Search, sort and filter what needs restocking"
      },
      {
        es: "Interfaz rehecha en 2026, en tres idiomas",
        ca: "Interfície refeta el 2026, en tres idiomes",
        en: "Interface rebuilt in 2026, in three languages"
      }
    ]
  },
  // Las cuatro herramientas de empresa de septiembre de 2026.
  "gestor-ausencias": {
    titol: { es: "Gestor de ausencias", ca: "Gestor d'absències", en: "Time-off manager" },
    tipus: "web",
    tec: ["TypeScript", "React", "Node", "SQLite"],
    demo: "https://gestor-ausencias.onrender.com",
    text: {
      es: "Vacaciones, permisos y bajas de una plantilla. El saldo cuenta solo días laborables, sin fines de semana ni festivos, y el responsable ve cuánta gente de su equipo falta esos días antes de aprobar.",
      ca: "Vacances, permisos i baixes d'una plantilla. El saldo compta només dies laborables, sense caps de setmana ni festius, i el responsable veu quanta gent del seu equip falta aquells dies abans d'aprovar.",
      en: "Holidays, leave and sick days for a whole staff. The balance counts working days only, skipping weekends and bank holidays, and managers see who else on the team is off before they approve."
    },
    lema: {
      es: "Vacaciones y permisos sobre el calendario del equipo.",
      ca: "Vacances i permisos sobre el calendari de l'equip.",
      en: "Holidays and leave on the team calendar."
    },
    captura: capAusencias,
    alta: false,
    anyInici: 2026,
    pila: ["TypeScript", "React", "Express", "SQLite", "Vitest"],
    aportacio: [
      {
        es: "El saldo cuenta solo días laborables",
        ca: "El saldo compta només dies laborables",
        en: "The balance counts working days only"
      },
      {
        es: "El responsable ve quién falta antes de aprobar",
        ca: "El responsable veu qui falta abans d'aprovar",
        en: "Managers see who else is off before approving"
      },
      {
        es: "Nadie aprueba lo suyo: lo impone el servidor",
        ca: "Ningú aprova el que és seu: ho imposa el servidor",
        en: "Nobody approves their own: the server enforces it"
      }
    ]
  },
  "reserva-espacios": {
    titol: { es: "Reserva de espacios", ca: "Reserva d'espais", en: "Desk and room booking" },
    tipus: "web",
    tec: ["TypeScript", "React", "Node", "SQLite"],
    // Con sufijo: "reserva-espacios" ya lo tenia otra cuenta en Render.
    demo: "https://reserva-espacios-qvsd.onrender.com",
    text: {
      es: "Salas y puestos de una oficina híbrida sobre el plano de cada planta. Reservas que se repiten cada semana, check-in que libera el sitio si nadie aparece y un panel con la ocupación real.",
      ca: "Sales i llocs d'una oficina híbrida sobre el plànol de cada planta. Reserves que es repeteixen cada setmana, check-in que allibera el lloc si ningú no apareix i un tauler amb l'ocupació real.",
      en: "Rooms and desks in a hybrid office, booked on the floor plan. Weekly repeating bookings, a check-in that frees the spot when nobody shows up, and a panel with real occupancy."
    },
    lema: {
      es: "Salas y puestos que se reservan sobre el plano.",
      ca: "Sales i llocs que es reserven sobre el plànol.",
      en: "Rooms and desks you book on the floor plan."
    },
    captura: capReservas,
    alta: false,
    anyInici: 2026,
    pila: ["TypeScript", "React", "Express", "SQLite", "Vitest"],
    aportacio: [
      {
        es: "Plano SVG: se reserva pulsando el sitio",
        ca: "Plànol SVG: es reserva clicant el lloc",
        en: "SVG floor plan: pick a spot to book it"
      },
      {
        es: "Reservas semanales: todas o ninguna",
        ca: "Reserves setmanals: totes o cap",
        en: "Weekly bookings: all or nothing"
      },
      {
        es: "Check-in en 15 minutos o el sitio se libera solo",
        ca: "Check-in en 15 minuts o el lloc s'allibera sol",
        en: "Check in within 15 minutes or it frees up"
      }
    ]
  },
  "notas-de-gasto": {
    titol: { es: "Notas de gasto", ca: "Notes de despesa", en: "Expense reports" },
    tipus: "web",
    tec: ["TypeScript", "React", "Node", "SQLite"],
    demo: "https://notas-de-gasto.onrender.com",
    text: {
      es: "Gastos de empleados con la foto del ticket, kilometraje y topes por categoría. Pasan por el responsable, finanzas los paga por lotes y los exporta en CSV para contabilidad, con el IVA desglosado.",
      ca: "Despeses d'empleats amb la foto del tiquet, quilometratge i límits per categoria. Passen pel responsable, finances les paga per lots i les exporta en CSV per a comptabilitat, amb l'IVA desglossat.",
      en: "Employee expenses with a photo of the receipt, mileage and per-category limits. Managers review them, finance pays them in batches and exports a CSV for the books, with VAT broken down."
    },
    lema: {
      es: "Tickets, kilómetros y aprobaciones en un solo sitio.",
      ca: "Tiquets, quilòmetres i aprovacions en un sol lloc.",
      en: "Receipts, mileage and approvals in one place."
    },
    captura: capGastos,
    alta: false,
    anyInici: 2026,
    pila: ["TypeScript", "React", "Express", "SQLite", "Vitest"],
    aportacio: [
      {
        es: "Ticket en foto o PDF, comprobado por su contenido",
        ca: "Tiquet en foto o PDF, comprovat pel contingut",
        en: "Receipt photo or PDF, checked by its contents"
      },
      {
        es: "IVA en céntimos: base y cuota siempre cuadran",
        ca: "IVA en cèntims: base i quota sempre quadren",
        en: "VAT in cents: net plus VAT always add up"
      },
      {
        es: "El tope diario avisa, pero no bloquea el envío",
        ca: "El límit diari avisa i no bloqueja l'enviament",
        en: "The daily limit warns but never blocks"
      }
    ]
  },
  "crm-ventas": {
    titol: { es: "CRM de ventas", ca: "CRM de vendes", en: "Sales CRM" },
    tipus: "web",
    tec: ["TypeScript", "React", "Node", "SQLite"],
    // Con sufijo por lo mismo que la reserva de espacios.
    demo: "https://crm-ventas-3kc8.onrender.com",
    text: {
      es: "Clientes, contactos y oportunidades de un equipo comercial. Tablero por etapas con arrastrar y soltar, lo que toca hacer hoy, previsión de ventas ponderada y buscador con Ctrl+K.",
      ca: "Clients, contactes i oportunitats d'un equip comercial. Tauler per etapes amb arrossegar i deixar anar, el que toca fer avui, previsió de vendes ponderada i cercador amb Ctrl+K.",
      en: "Customers, contacts and deals for a sales team. A drag-and-drop stage board, what needs doing today, a weighted sales forecast and Ctrl+K search."
    },
    lema: {
      es: "Oportunidades de venta en un tablero por etapas.",
      ca: "Oportunitats de venda en un tauler per etapes.",
      en: "Sales deals on a stage-by-stage board."
    },
    captura: capCrm,
    alta: true,
    destacat: 4,
    anyInici: 2026,
    pila: ["TypeScript", "React", "Express", "SQLite", "Vitest"],
    aportacio: [
      {
        es: "Tablero de seis etapas, con arrastrar y soltar",
        ca: "Tauler de sis etapes, amb arrossegar i deixar anar",
        en: "Six-stage board with drag and drop"
      },
      {
        es: "Previsión ponderada, con gráficos SVG propios",
        ca: "Previsió ponderada, amb gràfics SVG propis",
        en: "Weighted forecast with hand-written SVG charts"
      },
      {
        es: "CIF con dígito de control e importación de CSV",
        ca: "CIF amb dígit de control i importació de CSV",
        en: "Tax ID (CIF) check digit and CSV import"
      }
    ]
  },
  "jondasiviz": {
    titol: {
      es: "Planificador de preparación Volkswagen",
      ca: "Planificador de preparació Volkswagen",
      en: "Volkswagen build planner"
    },
    curt: {
      es: "Planificador Volkswagen",
      ca: "Planificador Volkswagen",
      en: "Volkswagen build planner"
    },
    tipus: "web",
    // Proyecto de equipo, con el repositorio privado. La ficha es la unica fuente de la
    // tarjeta y no se ensena enlace al codigo: daria un 404 a quien no sea del equipo.
    privat: true,
    tec: ["TypeScript", "React", { clau: "chip.equip" }, "Vite"],
    demo: "https://planificador-volkswagen.onrender.com",
    text: {
      es: "Dos herramientas para un Volkswagen. El planificador prepara el coche: eliges modelo, presupuesto y objetivos, y devuelve las piezas que caben en ese dinero. Recambios busca por número de bastidor o matrícula las piezas de mantenimiento de ese coche, por categorías y con buscador. Proyecto de equipo de seis personas, con aplicación de escritorio.",
      ca: "Dues eines per a un Volkswagen. El planificador prepara el cotxe: tries model, pressupost i objectius, i retorna les peces que caben en aquells diners. Recanvis busca per número de bastidor o matrícula les peces de manteniment d'aquell cotxe, per categories i amb cercador. Projecte d'equip de sis persones, amb aplicació d'escriptori.",
      en: "Two tools for a Volkswagen. The planner builds the car: pick the model, the budget and what you are after, and it returns the parts that fit the money. Spare parts looks up the maintenance parts for that car by VIN or number plate, by category and with search. A six-person team project, with a desktop app."
    },
    lema: {
      es: "Le dices el presupuesto y te dice qué piezas caben.",
      ca: "Li dius el pressupost i et diu quines peces hi caben.",
      en: "Give it a budget and it tells you which parts fit."
    },
    captura: capVolkswagen,
    alta: false,
    destacat: 3,
    registre: true,
    anyInici: 2026,
    persones: 6,
    pila: ["TypeScript", "React", "Vite", "Node", "SQLite", "Tauri"],
    // El reparto de cada uno sale del historial del repositorio y esta en el README del proyecto.
    aportacio: [
      {
        es: "El motor de presupuestos y la primera interfaz",
        ca: "El motor de pressupostos i la primera interfície",
        en: "The budget engine and the first interface"
      },
      {
        es: "Base de datos, API, cuentas y suscripción",
        ca: "Base de dades, API, comptes i subscripció",
        en: "Database, API, accounts and subscriptions"
      },
      {
        es: "Recambios, app de escritorio y despliegue",
        ca: "Recanvis, app d'escriptori i desplegament",
        en: "Spare parts, desktop app and deployment"
      }
    ]
  }
};

// Fuera de la lista aunque GitHub los devuelva: este mismo portafolio y los dos
// proyectos de escritorio. Todo lo demas que haya en la cuenta si sale.
const FORA = ["alexaiguadealisultanov.github.io", "gestioestock", "exploracio"];

// Y al reves: los que tienen que salir aunque la API no los traiga, porque el
// repositorio es privado. Cuando se haga publico llegara por la API con su fecha y su
// enlace, y este anadido dejara de hacer nada.
const SEMPRE = ["MVC-AJAX", "jondasiviz"];

// Proyectos que solo puede abrir quien entra como admin. Al resto se le ensena la
// tarjeta con el aviso de que esta a medias, sin enlace ni boton de arrancar.
// Vacia desde el 30 sep 2026: el planificador de Volkswagen ya lo ven los invitados.
const NOMES_ADMIN: string[] = [];

const fitxes: Record<string, Fitxa> = {};
for (const nom of Object.keys(CONEGUTS)) fitxes[nom.toLowerCase()] = CONEGUTS[nom];

/** Titulo y demo de un proyecto conocido, para enlazarlo desde otras vistas (el curriculum). */
export function enllacProjecte(nom: string, idioma: Idioma): { titol: string; demo: string } {
  const fitxa = fitxes[nom.toLowerCase()];
  return { titol: fitxa ? fitxa.titol[idioma] : nom, demo: fitxa?.demo ?? "" };
}

export type Repo = {
  nom: string;
  url: string;
  desc: string;
  llenguatge: string;
  data: string;
  web: string;
};

export type Projecte = {
  nom: string;
  titol: string;
  /** El titulo corto si la ficha lo tiene; si no, el de siempre. */
  curt: string;
  url: string;
  text: string;
  tec: string[];
  demo: string;
  marca: Clau | "";
  tancat: boolean;
  data: string;
  lema: string;
  captura: string;
  alta: boolean;
  destacat?: 1 | 2 | 3 | 4;
  registre: boolean;
  /** Año en que empezó. 0 si la ficha no lo dice (un repositorio nuevo que aun no esta escrito). */
  anyInici: number;
  /** Personas que lo hicieron: 1 individual, 0 si la ficha no lo dice. */
  persones: number;
  /** La pila entera. Sin ficha, lo mismo que `tec`. */
  pila: string[];
  /** Lo que hizo Alex. Vacio si la ficha no lo cuenta. */
  aportacio: string[];
};

export type EstatFeed = "" | "feed.loading" | "feed.cache" | "feed.offline";

const esWeb = (url: unknown): url is string =>
  typeof url === "string" && /^https?:\/\//i.test(url);

const esFora = (nom: string) => FORA.indexOf(nom.toLowerCase()) !== -1;

function urlRepo(nom: string): string {
  const fitxa = fitxes[nom.toLowerCase()];
  if (fitxa && fitxa.privat) return "";
  return "https://github.com/" + USUARI + "/" + nom;
}

const deFitxa = (nom: string): Repo => ({
  nom,
  url: urlRepo(nom),
  desc: "",
  llenguatge: "",
  data: "",
  web: ""
});

/** Anade al final los que tienen que salir si o si y la lista no trae. */
function ambForcats(llistat: Repo[]): Repo[] {
  const eixida = llistat.slice();
  for (const nom of SEMPRE) {
    const hi = eixida.some((repo) => repo.nom.toLowerCase() === nom.toLowerCase());
    if (!hi) eixida.push(deFitxa(nom));
  }
  return eixida;
}

/** Ultimo recurso: los proyectos que tenemos escritos aqui mismo. */
export const deCasa = (): Repo[] => Object.keys(CONEGUTS).map(deFitxa);

type RepoCru = {
  name?: unknown;
  html_url?: unknown;
  description?: unknown;
  language?: unknown;
  pushed_at?: unknown;
  updated_at?: unknown;
  homepage?: unknown;
  archived?: unknown;
  fork?: unknown;
};

function serveix(repo: RepoCru): boolean {
  if (!repo || repo.archived) return false;
  if (typeof repo.name !== "string" || !esWeb(repo.html_url)) return false;
  if (esFora(repo.name)) return false;
  // Un fork solo pasa si es un proyecto que ya damos por nuestro.
  return !repo.fork || !!fitxes[repo.name.toLowerCase()];
}

function netejar(repo: RepoCru): Repo {
  return {
    nom: String(repo.name),
    url: String(repo.html_url),
    desc: typeof repo.description === "string" ? repo.description : "",
    llenguatge: typeof repo.language === "string" ? repo.language : "",
    data: String(repo.pushed_at || repo.updated_at || ""),
    // Un repositorio nuevo con la web puesta en GitHub ya ensena su demo sin tocar nada
    // aqui; los que estan en el diccionario mandan con su propia direccion.
    web: esWeb(repo.homepage) ? repo.homepage : ""
  };
}

const perData = (a: Repo, b: Repo) =>
  (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0);

function desar(nets: Repo[]): void {
  try {
    window.localStorage.setItem(
      CLAU_REPOS,
      JSON.stringify({ quan: Date.now(), repos: nets })
    );
  } catch {
    // Sin almacenamiento no hay copia de respaldo, pero la lista de hoy se ve igual.
  }
}

export function desats(): Repo[] | null {
  try {
    const cru = window.localStorage.getItem(CLAU_REPOS);
    if (!cru) return null;
    const dades = JSON.parse(cru) as { repos?: Repo[] };
    if (!dades || !dades.repos || !dades.repos.length) return null;
    const bons = dades.repos.filter(
      (repo) => repo && typeof repo.nom === "string" && esWeb(repo.url) && !esFora(repo.nom)
    );
    return bons.length ? ambForcats(bons) : null;
  } catch {
    return null;
  }
}

/** Pide la lista a GitHub. El limite anonimo son 60 peticiones por hora y por IP. */
export async function demanar(): Promise<Repo[]> {
  const resposta = await fetch(API, { headers: { Accept: "application/vnd.github+json" } });
  if (!resposta.ok) throw new Error("GitHub ha contestado " + resposta.status);
  const dades = (await resposta.json()) as RepoCru[];
  if (!dades || !dades.length) throw new Error("respuesta vacia");

  const nets = ambForcats(dades.filter(serveix).map(netejar).sort(perData));
  if (!nets.length) throw new Error("ningun repositorio que ensenar");
  desar(nets);
  return nets;
}

const enIdioma = (valor: Multi | undefined, idioma: Idioma) =>
  valor ? valor[idioma] || valor.es : "";

const textTec = (una: Tec, idioma: Idioma) =>
  typeof una === "string" ? una : traduir(idioma, una.clau);

// La direccion de la demo sale de la ficha y, si no la tiene, de la web que lleve puesta
// el repositorio en GitHub. Para estrenar una demo nueva basta con rellenar "demo".
function adrecaDemo(repo: Repo): string {
  const fitxa = fitxes[repo.nom.toLowerCase()];
  if (fitxa && esWeb(fitxa.demo)) return fitxa.demo;
  return esWeb(repo.web) ? repo.web : "";
}

/** Junta lo que dice GitHub con lo que ya teniamos escrito de ese repositorio. */
export function projecte(repo: Repo, idioma: Idioma, rol: Rol): Projecte {
  const fitxa = fitxes[repo.nom.toLowerCase()];
  const tancat = rol !== "admin" && NOMES_ADMIN.indexOf(repo.nom.toLowerCase()) !== -1;

  let titol = repo.nom;
  let text = "";
  let tec: string[] = [];
  let tipus = "";

  if (fitxa) {
    titol = enIdioma(fitxa.titol, idioma) || repo.nom;
    text = enIdioma(fitxa.text, idioma);
    tec = (fitxa.tec || []).map((una) => textTec(una, idioma));
    tipus = fitxa.tipus || "web";
  } else {
    text = repo.desc || traduir(idioma, "feed.nodesc");
    if (repo.llenguatge) tec = [repo.llenguatge];
  }

  // Sin el rol que toca no hay nada que abrir: ni demo ni codigo.
  const demo = tancat ? "" : adrecaDemo(repo);
  const url = tancat ? "" : repo.url;

  // Sin demo que abrir, la tarjeta dice en que punto esta en vez de dejar el hueco.
  let marca: Clau | "" = "";
  if (!demo && !tancat) marca = tipus ? "feed.soon" : "feed.onlycode";

  // Sin linea corta propia, la tarjeta usa la descripcion: la de la ficha o la de GitHub.
  const lema = enIdioma(fitxa?.lema, idioma) || text;

  return {
    nom: repo.nom,
    titol,
    curt: enIdioma(fitxa?.curt, idioma) || titol,
    url,
    text,
    tec,
    demo,
    marca,
    tancat,
    data: repo.data,
    lema,
    captura: fitxa?.captura ?? "",
    alta: !!fitxa?.alta,
    destacat: fitxa?.destacat,
    registre: !!fitxa?.registre,
    anyInici: fitxa?.anyInici ?? 0,
    persones: fitxa ? (fitxa.persones ?? 1) : 0,
    pila: fitxa?.pila ? fitxa.pila.map((una) => textTec(una, idioma)) : tec,
    aportacio: (fitxa?.aportacio ?? []).map((frase) => enIdioma(frase, idioma)).filter(Boolean)
  };
}

/**
 * Las cuatro destacadas, que abren el carrusel de la portada, en su orden fijo. Si alguna falta en la lista (el
 * repositorio ya no sale, o la demo esta cerrada a este rol), su sitio lo ocupa la primera
 * demo abierta de la lista que no este ya puesta.
 */
export function destacats(llista: Projecte[]): Projecte[] {
  const obertes = (p: Projecte) => !!p.demo && !p.tancat;
  const fixes = ([1, 2, 3, 4] as const).map((lloc) =>
    llista.find((p) => p.destacat === lloc && obertes(p))
  );
  const posats = new Set(fixes.filter((p): p is Projecte => !!p).map((p) => p.nom));
  const reserva = llista.filter((p) => obertes(p) && !posats.has(p.nom));
  return fixes
    .map((p) => p ?? reserva.shift())
    .filter((p): p is Projecte => !!p);
}

/** "hace 3 dias", con las palabras del idioma que este puesto. */
export function quanFa(idioma: Idioma, iso: string): string {
  const moment = Date.parse(iso);
  if (isNaN(moment)) return "";

  const segons = Math.round((moment - Date.now()) / 1000);
  const passos: [number, Intl.RelativeTimeFormatUnit, number][] = [
    [60, "second", 1],
    [3600, "minute", 60],
    [86400, "hour", 3600],
    [2592000, "day", 86400],
    [31536000, "month", 2592000]
  ];

  let unitat: Intl.RelativeTimeFormatUnit = "year";
  let divisor = 31536000;
  const absoluts = Math.abs(segons);
  for (const pas of passos) {
    if (absoluts < pas[0]) {
      unitat = pas[1];
      divisor = pas[2];
      break;
    }
  }

  try {
    return new Intl.RelativeTimeFormat(idioma, { numeric: "auto" })
      .format(Math.round(segons / divisor), unitat);
  } catch {
    try {
      return new Date(moment).toLocaleDateString(idioma);
    } catch {
      return "";
    }
  }
}
