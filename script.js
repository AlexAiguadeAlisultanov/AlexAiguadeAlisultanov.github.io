// Mejoras pequeñas sobre una página que ya funciona sin JavaScript: el idioma, la
// lista de proyectos leída de GitHub, la sección donde estás marcada en el menú, la
// línea de la cabecera al bajar y el año del pie.

(function () {
  "use strict";

  /* ---------- Idiomas ---------- */

  // El castellano de las frases que ya están escritas en el HTML sale del propio HTML
  // al arrancar, así que solo hay una copia de cada una y la página se ve entera
  // aunque el script falle. En el bloque "es" de aquí abajo solo está el castellano de
  // lo que se pinta desde JavaScript, que no existe en el HTML.
  var TRADUCCIONES = {
    es: {
      "feed.loading": "Leyendo los repositorios de GitHub",
      "feed.cache": "GitHub no contesta ahora mismo, así que esta es la última lista guardada.",
      "feed.offline": "GitHub no contesta ahora mismo. Esta es la lista de siempre, con el enlace al código de cada proyecto.",
      "feed.nodesc": "Todavía no tiene descripción en GitHub. El código está publicado y se puede revisar.",
      "feed.updated": "Actualizado {t}",
      "feed.try": "Probar la app",
      "feed.code": "Código",
      "feed.soon": "Demo en camino",
      "feed.onlycode": "Solo código por ahora",
      "feed.desktop": "Se instala en Windows",
      "hero.count": "{n} proyectos publicados y uno en curso"
    },
    ca: {
      "doc.title": "Alex Aiguadé Alisultánov · Portafoli",
      "doc.desc": "Portafoli d'Alex Aiguadé Alisultánov, estudiant de grau superior a La Salle Mollerussa. Projectes en Java, PHP, VB.NET i bases de dades.",
      "og.desc": "Estudiant de grau superior a La Salle Mollerussa. Aplicacions web, d'escriptori i Android.",
      "skip": "Salta al contingut",
      "nav.aria": "Seccions",
      "nav.about": "Sobre mi",
      "nav.projects": "Projectes",
      "nav.skills": "Habilitats",
      "nav.contact": "Contacte",
      "lang.aria": "Idioma",
      "hero.eyebrow": "Grau superior · La Salle Mollerussa",
      "hero.lead": "Faig aplicacions web, d'escriptori i Android. M'agrada resoldre problemes i escriure codi, i busco una primera feina on aportar-ho tot i seguir aprenent.",
      "hero.cta": "Mira els projectes",
      "hero.note": "Set projectes publicats i un en curs",
      "hero.count": "{n} projectes publicats i un en curs",
      "hero.alt": "Retrat d'Alex Aiguadé Alisultánov",
      "about.h": "Sobre mi",
      "about.p1": "Sóc estudiant de grau superior a l'institut La Salle Mollerussa. Durant el grau mitjà i el superior he treballat amb MySQL, MongoDB, PHP, HTML, CSS, JavaScript i Java, i he anat fent projectes propis per posar a prova el que anava aprenent.",
      "about.p2": "Sempre intento aportar el cent per cent de la feina que faig. El que busco ara és una posició amb prou repte per créixer com a programador, on hi hagi coses noves per aprendre i gent de qui aprendre-les.",
      "proj.h": "Projectes",
      "proj.intro": "Tot el codi és obert i es pot revisar. Cada targeta porta les tecnologies amb què està fet.",
      "proj.stock": "Aplicació d'escriptori per controlar l'estoc de material d'una empresa d'informàtica: entrades, sortides i què queda a magatzem.",
      "proj.books": "Aplicació d'escriptori per gestionar una biblioteca de llibres. Permet inserir-ne de nous, actualitzar-los i consultar-los.",
      "proj.library": "Aplicació web que porta els llibres, els usuaris i els préstecs d'una biblioteca, amb les dades sobre MySQL.",
      "proj.qr": "Web que genera i llegeix codis QR per a entrades de partits, amb comptes d'usuari i el pagament de l'entrada.",
      "proj.issues": "Aplicació per registrar incidències i seguir-ne l'estat, organitzades per categories i amb els contactes de cadascuna.",
      "proj.crud": "Alta, consulta, edició i esborrat de productes amb patró MVC i peticions AJAX, perquè la pàgina no es recarregui. Funciona igual en mòbil.",
      "proj.clock": "Aplicació Android per fitxar l'entrada i la sortida de la jornada des del mòbil.",
      "proj.calc": "Calculadora per a Android amb un conjunt concret d'operacions. Encara hi estic treballant, així que de moment no hi ha res publicat.",
      "proj.code": "Codi a GitHub",
      "proj.wip": "En curs",
      "chips.aria": "Tecnologies",
      "chip.desktop": "Escriptori",
      "chip.qr": "Codis QR",
      "feed.loading": "Llegint els repositoris de GitHub",
      "feed.cache": "GitHub no contesta ara mateix, així que aquesta és l'última llista desada.",
      "feed.offline": "GitHub no contesta ara mateix. Aquesta és la llista de sempre, amb l'enllaç al codi de cada projecte.",
      "feed.nodesc": "Encara no té descripció a GitHub. El codi està publicat i es pot revisar.",
      "feed.updated": "Actualitzat {t}",
      "feed.try": "Provar l'aplicació",
      "feed.code": "Codi",
      "feed.soon": "Demo en camí",
      "feed.onlycode": "Només codi de moment",
      "feed.desktop": "S'instal·la a Windows",
      "skills.h": "Habilitats",
      "skills.intro": "Amb el que he treballat durant el grau mitjà, el superior i els projectes de dalt.",
      "skills.langs": "Llenguatges",
      "skills.db": "Bases de dades",
      "skills.tools": "Eines i entorns",
      "skill.git": "Git i GitHub",
      "contact.h": "Contacte",
      "contact.intro": "Si et quadra el meu perfil, escriu-me per on et vagi millor. Contesto de seguida.",
      "contact.mail": "Correu",
      "contact.li": "El perfil sencer, amb més detall",
      "contact.gh": "Tot el codi dels projectes",
      "foot.made": "Portafoli fet a mà amb HTML i CSS"
    },
    en: {
      "doc.title": "Alex Aiguadé Alisultánov · Portfolio",
      "doc.desc": "Portfolio of Alex Aiguadé Alisultánov, an advanced vocational training student at La Salle Mollerussa. Projects in Java, PHP, VB.NET and databases.",
      "og.desc": "Advanced vocational training student at La Salle Mollerussa. Web, desktop and Android applications.",
      "skip": "Skip to content",
      "nav.aria": "Sections",
      "nav.about": "About me",
      "nav.projects": "Projects",
      "nav.skills": "Skills",
      "nav.contact": "Contact",
      "lang.aria": "Language",
      "hero.eyebrow": "Advanced vocational training · La Salle Mollerussa",
      "hero.lead": "I build web, desktop and Android apps. I like solving problems and writing code, and I'm after a first job where I can give everything I have and keep learning.",
      "hero.cta": "See the projects",
      "hero.note": "Seven projects published and one in progress",
      "hero.count": "{n} projects published and one in progress",
      "hero.alt": "Portrait of Alex Aiguadé Alisultánov",
      "about.h": "About me",
      "about.p1": "I'm an advanced vocational training student at La Salle Mollerussa. Across both training levels I've worked with MySQL, MongoDB, PHP, HTML, CSS, JavaScript and Java, and I kept building my own projects to put what I was learning to the test.",
      "about.p2": "I always try to give everything to the work I take on. What I'm looking for now is a role with enough of a challenge to grow as a developer, where there are new things to learn and people to learn them from.",
      "proj.h": "Projects",
      "proj.intro": "All the code is open and you can go through it. Each card lists the technologies behind it.",
      "proj.stock": "Desktop app to keep track of the material stock of an IT company: what comes in, what goes out and what is left in the warehouse.",
      "proj.books": "Desktop app to manage a book library. You can add new books, update them and look them up.",
      "proj.library": "Web app that handles the books, the users and the loans of a library, with the data on MySQL.",
      "proj.qr": "Site that generates and reads QR codes for match tickets, with user accounts and ticket payment.",
      "proj.issues": "App to log issues and follow how they are going, sorted by category and with the contacts for each one.",
      "proj.crud": "Create, read, update and delete products with an MVC pattern and AJAX requests, so the page never reloads. Works the same on a phone.",
      "proj.clock": "Android app to clock in and out of the working day from your phone.",
      "proj.calc": "Android calculator with a specific set of operations. I'm still working on it, so there is nothing published yet.",
      "proj.code": "Code on GitHub",
      "proj.wip": "In progress",
      "chips.aria": "Technologies",
      "chip.desktop": "Desktop",
      "chip.qr": "QR codes",
      "feed.loading": "Reading the repositories from GitHub",
      "feed.cache": "GitHub is not answering right now, so this is the last list that was saved.",
      "feed.offline": "GitHub is not answering right now. This is the usual list, with a link to the code of every project.",
      "feed.nodesc": "No description on GitHub yet. The code is published and you can go through it.",
      "feed.updated": "Updated {t}",
      "feed.try": "Try the app",
      "feed.code": "Code",
      "feed.soon": "Demo on the way",
      "feed.onlycode": "Code only for now",
      "feed.desktop": "Runs on Windows",
      "skills.h": "Skills",
      "skills.intro": "What I have worked with across both training levels and the projects above.",
      "skills.langs": "Languages",
      "skills.db": "Databases",
      "skills.tools": "Tools and environments",
      "skill.git": "Git and GitHub",
      "contact.h": "Contact",
      "contact.intro": "If my profile fits what you need, write to me wherever suits you best. I answer quickly.",
      "contact.mail": "Email",
      "contact.li": "The full profile, in more detail",
      "contact.gh": "All the code from the projects",
      "foot.made": "Portfolio handmade with HTML and CSS"
    }
  };

  var ATRIBUTS = ["alt", "title", "aria-label", "content"];
  var CLAU_DESAT = "portafoli-idioma";
  var castella = {};
  var idiomaActual = "es";
  var oients = [];

  var cadaText = function (fn) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), fn);
  };

  var cadaAtribut = function (fn) {
    ATRIBUTS.forEach(function (attr) {
      var marca = "data-i18n-" + attr;
      Array.prototype.forEach.call(document.querySelectorAll("[" + marca + "]"), function (el) {
        fn(el, attr, el.getAttribute(marca));
      });
    });
  };

  // El castellano de partida sale del HTML, que es donde está escrito.
  cadaText(function (el) {
    var clau = el.getAttribute("data-i18n");
    if (!(clau in castella)) castella[clau] = el.textContent;
  });
  cadaAtribut(function (el, attr, clau) {
    if (!(clau in castella)) castella[clau] = el.getAttribute(attr) || "";
  });

  var frase = function (idioma, clau) {
    var diccionari = TRADUCCIONES[idioma];
    if (diccionari && typeof diccionari[clau] === "string") return diccionari[clau];
    return castella[clau] != null ? castella[clau] : "";
  };

  var botons = Array.prototype.slice.call(document.querySelectorAll(".lang__btn"));

  var aplicar = function (idioma) {
    idiomaActual = idioma;
    document.documentElement.lang = idioma;
    cadaText(function (el) {
      el.textContent = frase(idioma, el.getAttribute("data-i18n"));
    });
    cadaAtribut(function (el, attr, clau) {
      el.setAttribute(attr, frase(idioma, clau));
    });
    botons.forEach(function (boto) {
      boto.setAttribute("aria-pressed", String(boto.getAttribute("data-lang") === idioma));
    });
    // Lo que se pinta desde JavaScript no lleva data-i18n, así que se avisa aparte
    // para que se vuelva a dibujar en el idioma nuevo.
    oients.forEach(function (oient) {
      try {
        oient(idioma);
      } catch (e) {
        // Si algo falla al repintar, el resto de la página ya ha cambiado de idioma.
      }
    });
  };

  var recordar = function (idioma) {
    try {
      window.localStorage.setItem(CLAU_DESAT, idioma);
    } catch (e) {
      // Ventana privada o almacenamiento bloqueado: la elección solo dura esta visita.
    }
  };

  var recordat = function () {
    try {
      return window.localStorage.getItem(CLAU_DESAT);
    } catch (e) {
      return null;
    }
  };

  if (botons.length) {
    botons.forEach(function (boto) {
      boto.addEventListener("click", function () {
        var idioma = boto.getAttribute("data-lang");
        aplicar(idioma);
        recordar(idioma);
      });
    });

    var desat = recordat();
    aplicar(desat === "ca" || desat === "en" ? desat : "es");
  }

  /* ---------- Proyectos, leídos de GitHub ---------- */

  var USUARI = "AlexAiguadeAlisultanov";
  var API = "https://api.github.com/users/" + USUARI + "/repos?sort=updated&per_page=100";
  var CLAU_REPOS = "portafoli-repos";
  var NS_SVG = "http://www.w3.org/2000/svg";

  // Lo que ya sabemos de los proyectos de siempre: un título cuidado, el texto escrito
  // a mano en los tres idiomas, las tecnologías y, en cuanto estén desplegados, la
  // dirección de la demo. Un repositorio que no esté aquí sale igualmente con lo que
  // dé GitHub, y una ficha de aquí que la API no devuelva (un repositorio privado, por
  // ejemplo) simplemente no se pinta.
  var CONEGUTS = {
    "AlexAiguadeAlisultanov.github.io": {
      titol: { es: "Este portafolio", ca: "Aquest portafoli", en: "This portfolio" },
      tipus: "web",
      tec: ["HTML", "CSS", "JavaScript"],
      demo: "https://alexaiguadealisultanov.github.io",
      text: {
        es: "La página que estás leyendo. HTML, CSS y JavaScript escritos a mano, sin frameworks ni dependencias, con la lista de proyectos sacada de GitHub.",
        ca: "La pàgina que estàs llegint. HTML, CSS i JavaScript escrits a mà, sense frameworks ni dependències, amb la llista de projectes treta de GitHub.",
        en: "The page you are reading. Handwritten HTML, CSS and JavaScript, no frameworks and no dependencies, with the project list pulled from GitHub."
      }
    },
    "springboot-thymeleaf-web-master": {
      titol: { es: "Biblioteca web", ca: "Biblioteca web", en: "Library web app" },
      tipus: "web",
      tec: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
      demo: "",
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
      demo: "",
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
      demo: "",
      text: {
        es: "Aplicación para registrar las incidencias de un centro educativo y seguir su estado, organizadas por categorías y con los contactos de cada una.",
        ca: "Aplicació per registrar les incidències d'un centre educatiu i seguir-ne l'estat, organitzades per categories i amb els contactes de cadascuna.",
        en: "App to log the issues of a school and follow how they are going, sorted by category and with the contacts for each one."
      }
    },
    "GestioEstock": {
      titol: "Gestió Estock",
      tipus: "escriptori",
      tec: ["VB.NET", { clau: "chip.desktop" }],
      demo: "",
      text: {
        es: "Aplicación de escritorio para controlar el stock de material de una empresa de informática: entradas, salidas y qué queda en almacén.",
        ca: "Aplicació d'escriptori per controlar l'estoc de material d'una empresa d'informàtica: entrades, sortides i què queda a magatzem.",
        en: "Desktop app to keep track of the material stock of an IT company: what comes in, what goes out and what is left in the warehouse."
      }
    },
    "Exploracio": {
      titol: "Exploració",
      tipus: "escriptori",
      tec: ["VB.NET", { clau: "chip.desktop" }],
      demo: "",
      text: {
        es: "Aplicación de escritorio para gestionar una biblioteca de libros. Permite insertar nuevos, actualizarlos y consultarlos.",
        ca: "Aplicació d'escriptori per gestionar una biblioteca de llibres. Permet inserir-ne de nous, actualitzar-los i consultar-los.",
        en: "Desktop app to manage a book library. You can add new books, update them and look them up."
      }
    },
    "MVC-AJAX": {
      titol: { es: "Inventario de material", ca: "Inventari de material", en: "Material inventory" },
      tipus: "web",
      tec: ["PHP", "MVC", "AJAX"],
      demo: "",
      text: {
        es: "Alta, consulta, edición y borrado de productos con patrón MVC y peticiones AJAX, para que la página no se recargue. Funciona igual en móvil.",
        ca: "Alta, consulta, edició i esborrat de productes amb patró MVC i peticions AJAX, perquè la pàgina no es recarregui. Funciona igual en mòbil.",
        en: "Create, read, update and delete products with an MVC pattern and AJAX requests, so the page never reloads. Works the same on a phone."
      }
    }
  };

  var fitxes = {};
  Object.keys(CONEGUTS).forEach(function (nom) {
    fitxes[nom.toLowerCase()] = CONEGUTS[nom];
  });

  var llista = document.getElementById("llista-projectes");
  var estat = document.getElementById("estat-projectes");
  var estatText = estat ? estat.querySelector(".feed__text") : null;
  var nota = document.querySelector('[data-i18n="hero.note"]');
  var enCurs = llista ? llista.querySelector("[data-estatic]") : null;

  var repos = null;   // la última lista que hemos podido pintar
  var avis = "";      // qué dice la línea de estado, vacío si no hay nada que decir
  var estrena = true; // la entrada de las tarjetas solo se anima la primera vez

  var crear = function (etiqueta, classe) {
    var el = document.createElement(etiqueta);
    if (classe) el.className = classe;
    return el;
  };

  var icona = function (nom) {
    var svg = document.createElementNS(NS_SVG, "svg");
    svg.setAttribute("class", "ico");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var us = document.createElementNS(NS_SVG, "use");
    us.setAttribute("href", "#" + nom);
    svg.appendChild(us);
    return svg;
  };

  var enIdioma = function (valor, idioma) {
    if (typeof valor === "string") return valor;
    if (!valor) return "";
    return valor[idioma] || valor.es || "";
  };

  var esWeb = function (url) {
    return typeof url === "string" && /^https?:\/\//i.test(url);
  };

  // "hace 3 días", con las palabras del idioma que esté puesto.
  var quanFa = function (idioma, iso) {
    var moment = Date.parse(iso);
    if (isNaN(moment)) return "";

    var segons = Math.round((moment - Date.now()) / 1000);
    var passos = [
      [60, "second", 1],
      [3600, "minute", 60],
      [86400, "hour", 3600],
      [2592000, "day", 86400],
      [31536000, "month", 2592000]
    ];
    var unitat = "year";
    var divisor = 31536000;
    var absoluts = Math.abs(segons);

    for (var i = 0; i < passos.length; i++) {
      if (absoluts < passos[i][0]) {
        unitat = passos[i][1];
        divisor = passos[i][2];
        break;
      }
    }

    try {
      return new Intl.RelativeTimeFormat(idioma, { numeric: "auto" })
        .format(Math.round(segons / divisor), unitat);
    } catch (e) {
      // Navegador sin Intl.RelativeTimeFormat: la fecha suelta se entiende igual.
      try {
        return new Date(moment).toLocaleDateString(idioma);
      } catch (e2) {
        return "";
      }
    }
  };

  // Junta lo que dice GitHub con lo que ya teníamos escrito de ese repositorio.
  var projecte = function (repo, idioma) {
    var fitxa = fitxes[repo.nom.toLowerCase()];
    var dades = {
      titol: repo.nom,
      url: repo.url,
      text: "",
      tec: [],
      demo: esWeb(repo.web) ? repo.web : "",
      tipus: "",
      marca: "",
      data: repo.data
    };

    if (fitxa) {
      dades.titol = enIdioma(fitxa.titol, idioma) || repo.nom;
      dades.text = enIdioma(fitxa.text, idioma);
      dades.tec = fitxa.tec || [];
      dades.tipus = fitxa.tipus || "web";
      if (esWeb(fitxa.demo)) dades.demo = fitxa.demo;
    } else {
      dades.text = repo.desc || frase(idioma, "feed.nodesc");
      if (repo.llenguatge) dades.tec = [repo.llenguatge];
    }

    // Sin demo que abrir, la tarjeta dice en qué punto está en vez de dejar el hueco.
    // El día que una ficha estrene dirección, esa tarjeta pasa sola a "Probar la app".
    if (!dades.demo) {
      if (dades.tipus === "escriptori") {
        dades.marca = "feed.desktop";
      } else if (dades.tipus) {
        dades.marca = "feed.soon";
      } else {
        dades.marca = "feed.onlycode";
      }
    }

    return dades;
  };

  var targeta = function (dades, idioma, ordre) {
    var li = crear("li", "card");

    var h3 = crear("h3");
    var enllac = crear("a");
    // El título cubre la tarjeta entera, así que apunta a lo que se quiere abrir al
    // pulsarla: la aplicación si está en marcha, y si no el código.
    enllac.href = dades.demo || dades.url;
    enllac.target = "_blank";
    enllac.rel = "noopener";
    enllac.textContent = dades.titol;
    h3.appendChild(enllac);
    li.appendChild(h3);

    var descripcio = crear("p");
    descripcio.textContent = dades.text;
    li.appendChild(descripcio);

    if (dades.tec.length) {
      var chips = crear("ul", "chips");
      chips.setAttribute("aria-label", frase(idioma, "chips.aria"));
      dades.tec.forEach(function (tecnologia) {
        var chip = crear("li");
        chip.textContent = typeof tecnologia === "string"
          ? tecnologia
          : frase(idioma, tecnologia.clau);
        chips.appendChild(chip);
      });
      li.appendChild(chips);
    }

    var quan = dades.data ? quanFa(idioma, dades.data) : "";
    if (quan) {
      var meta = crear("p", "card__meta");
      var moment = crear("time");
      moment.setAttribute("datetime", dades.data);
      moment.textContent = frase(idioma, "feed.updated").replace("{t}", quan);
      meta.appendChild(moment);
      li.appendChild(meta);
    }

    var peu = crear("div", "card__foot");

    if (dades.demo) {
      // Aplicación en marcha: abrirla manda, y el código se queda de apoyo.
      var provar = crear("a", "btn btn--primary card__provar");
      provar.href = dades.demo;
      provar.target = "_blank";
      provar.rel = "noopener";
      provar.appendChild(document.createTextNode(frase(idioma, "feed.try")));
      provar.appendChild(icona("i-arrow"));
      peu.appendChild(provar);

      var codi = crear("a", "card__codi");
      codi.href = dades.url;
      codi.target = "_blank";
      codi.rel = "noopener";
      codi.appendChild(icona("i-github"));
      codi.appendChild(document.createTextNode(frase(idioma, "feed.code")));
      peu.appendChild(codi);
    } else {
      // Sin nada que abrir, el código es lo que hay que ver, y al lado una marca que
      // dice por qué no hay aplicación que probar.
      var codiSol = crear("span", "card__link");
      codiSol.appendChild(icona("i-github"));
      var codiText = crear("span");
      codiText.textContent = frase(idioma, "proj.code");
      codiSol.appendChild(codiText);
      peu.appendChild(codiSol);

      if (dades.marca) {
        var marca = crear("span", "badge");
        marca.textContent = frase(idioma, dades.marca);
        peu.appendChild(marca);
      }
    }

    li.appendChild(peu);

    if (estrena) {
      li.classList.add("card--nou");
      li.style.animationDelay = Math.min(ordre, 4) * 40 + "ms";
    }

    return li;
  };

  var missatge = function (idioma) {
    if (!estat || !estatText) return;
    if (!avis) {
      estat.hidden = true;
      estat.classList.remove("is-loading", "feed--avis");
      estatText.textContent = "";
      return;
    }
    estat.hidden = false;
    estat.classList.toggle("is-loading", avis === "feed.loading");
    estat.classList.toggle("feed--avis", avis !== "feed.loading");
    estatText.textContent = frase(idioma, avis);
  };

  var comptar = function (idioma) {
    // Con un solo proyecto la frase quedaría mal escrita, así que se deja la del HTML.
    if (!nota || !repos || repos.length < 2) return;
    nota.textContent = frase(idioma, "hero.count").replace("{n}", String(repos.length));
  };

  var pintar = function (idioma) {
    missatge(idioma);
    if (!llista || !repos) return;

    var caixa = document.createDocumentFragment();
    repos.forEach(function (repo, i) {
      caixa.appendChild(targeta(projecte(repo, idioma), idioma, i));
    });
    // La calculadora todavía no está en GitHub, así que su tarjeta se queda al final.
    if (enCurs) caixa.appendChild(enCurs);

    llista.textContent = "";
    llista.appendChild(caixa);
    estrena = false;
    comptar(idioma);
  };

  var carregant = function (si) {
    if (!llista) return;
    llista.classList.toggle("is-loading", si);
    if (si) {
      llista.setAttribute("aria-busy", "true");
    } else {
      llista.removeAttribute("aria-busy");
    }
  };

  var serveix = function (repo) {
    if (!repo || repo.archived) return false;
    if (typeof repo.name !== "string" || !esWeb(repo.html_url)) return false;
    // Un fork solo pasa si es un proyecto que ya damos por nuestro.
    return !repo.fork || !!fitxes[repo.name.toLowerCase()];
  };

  var netejar = function (repo) {
    return {
      nom: repo.name,
      url: repo.html_url,
      desc: typeof repo.description === "string" ? repo.description : "",
      llenguatge: repo.language || "",
      data: repo.pushed_at || repo.updated_at || "",
      // Un repositorio nuevo con la web puesta en GitHub ya enseña su demo sin tocar
      // nada aquí; los que están en la lista de arriba mandan con su propia dirección.
      web: esWeb(repo.homepage) ? repo.homepage : ""
    };
  };

  var perData = function (a, b) {
    return (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0);
  };

  var desar = function (nets) {
    try {
      window.localStorage.setItem(CLAU_REPOS, JSON.stringify({ quan: Date.now(), repos: nets }));
    } catch (e) {
      // Sin almacenamiento no hay copia de respaldo, pero la lista de hoy se ve igual.
    }
  };

  var desats = function () {
    try {
      var cru = window.localStorage.getItem(CLAU_REPOS);
      if (!cru) return null;
      var dades = JSON.parse(cru);
      if (!dades || !dades.repos || !dades.repos.length) return null;
      var bons = dades.repos.filter(function (repo) {
        return repo && typeof repo.nom === "string" && esWeb(repo.url);
      });
      return bons.length ? bons : null;
    } catch (e) {
      return null;
    }
  };

  // Último recurso: los proyectos que tenemos escritos aquí mismo. Sin fecha ni
  // lenguaje, pero con su enlace al código, que es lo que hay que poder abrir.
  var deCasa = function () {
    return Object.keys(CONEGUTS).map(function (nom) {
      return {
        nom: nom,
        url: "https://github.com/" + USUARI + "/" + nom,
        desc: "",
        llenguatge: "",
        data: "",
        web: ""
      };
    });
  };

  var fallar = function () {
    carregant(false);
    if (repos) {
      avis = "feed.cache";
    } else {
      avis = "feed.offline";
      repos = deCasa();
    }
    pintar(idiomaActual);
  };

  var demanar = function () {
    if (!window.fetch || !window.Promise) {
      fallar();
      return;
    }

    window.fetch(API, { headers: { Accept: "application/vnd.github+json" } })
      .then(function (resposta) {
        // El límite de la API anónima son 60 peticiones por hora y por IP: cuando se
        // pasa, GitHub contesta 403 y esto cae al respaldo como con cualquier fallo.
        if (!resposta.ok) throw new Error("GitHub ha contestado " + resposta.status);
        return resposta.json();
      })
      .then(function (dades) {
        if (!dades || !dades.length) throw new Error("respuesta vacía");
        var nets = dades.filter(serveix).map(netejar).sort(perData);
        if (!nets.length) throw new Error("ningún repositorio que enseñar");

        desar(nets);
        carregant(false);
        var canvia = !repos || JSON.stringify(nets) !== JSON.stringify(repos);
        repos = nets;
        avis = "";
        if (canvia) {
          pintar(idiomaActual);
        } else {
          missatge(idiomaActual);
        }
      })
      .catch(fallar);
  };

  if (llista) {
    var guardats = desats();
    if (guardats) {
      // Con la copia de la última visita la sección se ve al momento, y la lista de
      // verdad la sustituye en cuanto llega si es que ha cambiado algo.
      repos = guardats;
      pintar(idiomaActual);
    } else {
      avis = "feed.loading";
      carregant(true);
      missatge(idiomaActual);
    }
    oients.push(pintar);
    demanar();
  }

  /* ---------- Cabecera y navegación ---------- */

  var topbar = document.querySelector(".topbar");
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.topbar__nav a[href^="#"]')
  );

  // Línea bajo la cabecera solo cuando el contenido pasa por debajo.
  if (topbar) {
    var pending = false;
    var paintTopbar = function () {
      topbar.classList.toggle("is-stuck", window.scrollY > 8);
      pending = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!pending) {
          pending = true;
          window.requestAnimationFrame(paintTopbar);
        }
      },
      { passive: true }
    );
    paintTopbar();
  }

  // Sección activa en el menú.
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    var targets = [];

    links.forEach(function (link) {
      var section = document.getElementById(link.hash.slice(1));
      if (section) {
        byId[section.id] = link;
        targets.push(section);
      }
    });

    var setActive = function (id) {
      links.forEach(function (link) {
        if (byId[id] === link) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var header = topbar ? topbar.offsetHeight : 60;
    var visible = new Set();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        });

        var current = "";
        targets.forEach(function (section) {
          if (visible.has(section.id)) current = current || section.id;
        });
        setActive(current);
      },
      { rootMargin: "-" + (header + 1) + "px 0px -55% 0px", threshold: 0 }
    );

    targets.forEach(function (section) {
      observer.observe(section);
    });
  }

  var any = document.getElementById("any");
  if (any) any.textContent = String(new Date().getFullYear());
})();
