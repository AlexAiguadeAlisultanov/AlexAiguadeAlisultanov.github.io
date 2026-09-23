// Los proyectos no van escritos a mano. Se leen en vivo de la API publica de GitHub, se
// descartan los archivados y una lista corta de nombres, y se enriquecen con el
// diccionario de fichas de aqui abajo, que aporta titulo, texto en tres idiomas,
// tecnologias y la direccion de la demo.

import type { Clau, Idioma } from "./idioma";
import { traduir } from "./idioma";

export const USUARI = "AlexAiguadeAlisultanov";
const API = "https://api.github.com/users/" + USUARI + "/repos?sort=updated&per_page=100";
const CLAU_REPOS = "portafoli-repos";

export type Rol = "invitado" | "admin";

/** Una tecnologia es texto fijo o una clave que se traduce. */
export type Tec = string | { clau: Clau };

type Multi = Record<Idioma, string>;

type Fitxa = {
  titol: Multi;
  tipus?: string;
  /** Repositorio privado: la API no lo devuelve y no se ensena enlace al codigo. */
  privat?: boolean;
  tec: Tec[];
  demo?: string;
  text: Multi;
};

const CONEGUTS: Record<string, Fitxa> = {
  "springboot-thymeleaf-web-master": {
    titol: {
      es: "Gestor de inventario de libros",
      ca: "Gestor d'inventari de llibres",
      en: "Book inventory manager"
    },
    tipus: "web",
    tec: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    demo: "https://inventario-de-libros.onrender.com/llibres",
    text: {
      es: "Aplicación web que lleva los libros, los usuarios y los préstamos de una biblioteca, con los datos sobre MySQL.",
      ca: "Aplicació web que porta els llibres, els usuaris i els préstecs d'una biblioteca, amb les dades sobre MySQL.",
      en: "Web app that handles the books, the users and the loans of a library, with the data on MySQL."
    }
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
    }
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
    }
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
    }
  },
  "jondasiviz": {
    titol: {
      es: "Planificador de preparación Volkswagen",
      ca: "Planificador de preparació Volkswagen",
      en: "Volkswagen build planner"
    },
    tipus: "web",
    // Proyecto de equipo, con el repositorio privado. La ficha es la unica fuente de la
    // tarjeta y no se ensena enlace al codigo: daria un 404 a quien no sea del equipo.
    privat: true,
    tec: ["TypeScript", "React", "Vite", { clau: "chip.equip" }],
    demo: "https://planificador-volkswagen.onrender.com",
    text: {
      es: "Herramienta que planifica la preparación de un Volkswagen: eliges modelo, presupuesto y objetivos, y devuelve las piezas que caben en ese dinero. Proyecto de equipo de nueve personas, con su catálogo, su motor de cálculo y su aplicación de escritorio.",
      ca: "Eina que planifica la preparació d'un Volkswagen: tries model, pressupost i objectius, i retorna les peces que caben en aquells diners. Projecte d'equip de nou persones, amb el seu catàleg, el seu motor de càlcul i la seva aplicació d'escriptori.",
      en: "A tool that plans a Volkswagen build: pick the model, the budget and what you are after, and it returns the parts that fit the money. A nine-person team project, with its own catalogue, calculation engine and desktop app."
    }
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
const NOMES_ADMIN = ["jondasiviz"];

const fitxes: Record<string, Fitxa> = {};
for (const nom of Object.keys(CONEGUTS)) fitxes[nom.toLowerCase()] = CONEGUTS[nom];

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
  url: string;
  text: string;
  tec: string[];
  demo: string;
  marca: Clau | "";
  tancat: boolean;
  data: string;
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
    tec = (fitxa.tec || []).map((una) =>
      typeof una === "string" ? una : traduir(idioma, una.clau)
    );
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

  return { nom: repo.nom, titol, url, text, tec, demo, marca, tancat, data: repo.data };
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
