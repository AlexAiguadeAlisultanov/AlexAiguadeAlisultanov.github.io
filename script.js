// Mejoras pequeñas sobre una página que ya funciona sin JavaScript:
// idioma, marca la sección donde estás, dibuja la línea de la cabecera al bajar
// y pone el año en el pie.

(function () {
  "use strict";

  /* ---------- Idiomas ---------- */

  // El castellano no está aquí: se lee del propio HTML al arrancar, así que solo
  // hay una copia de cada frase y la página se ve entera aunque el script falle.
  var TRADUCCIONES = {
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
