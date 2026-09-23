// El portafolio entero se monta desde aquí. El HTML solo trae la pantalla de acceso:
// hasta que la API dice quién entra no existe ninguna sección, y el rol que devuelve
// decide qué proyectos se pueden abrir.

(function () {
  "use strict";

  /* ---------- Idiomas ---------- */

  // Todo lo que se ve, menos la pantalla de acceso, se pinta desde JavaScript, así que
  // el castellano de esas frases vive en el bloque "es" de aquí abajo. El de la pantalla
  // de acceso sale del propio HTML, que es donde está escrito.
  var TRADUCCIONES = {
    es: {
      "skip": "Salta al contenido",
      "nav.aria": "Secciones",
      "nav.about": "Sobre mí",
      "nav.projects": "Proyectos",
      "nav.edu": "Formación",
      "nav.skills": "Aptitudes",
      "nav.contact": "Contacto",
      "sortir": "Salir",
      "hero.eyebrow": "Técnico IT · Sistemas · Ciberseguridad",
      "hero.lead": "Técnico IT centrado en sistemas y ciberseguridad, con base en desarrollo de aplicaciones. Ahora curso el Máster en Ciberseguridad e IA y tengo la certificación eJPT v2. Busco incorporarme al departamento de IT de una empresa del sector.",
      "hero.where": "Anglesola, Cataluña, España",
      "hero.cta": "Mira los proyectos",
      "hero.note": "Cinco proyectos publicados",
      "hero.count": "{n} proyectos publicados",
      "hero.alt": "Retrato de Alex Aiguadé Alisultánov",
      "about.h": "Sobre mí",
      "about.p1": "Soy Técnico Superior en Desarrollo de Aplicaciones y ahora curso el Máster en Ciberseguridad e Inteligencia Artificial de Evolve. La base la traigo de la programación; lo que trabajo ahora es la protección de activos digitales y el uso de la IA para optimizar y asegurar procesos.",
      "about.p2": "Busco incorporarme al departamento de IT de una compañía del sector de la ciberseguridad, donde pueda aportar en la gestión de infraestructura, la automatización de tareas y el desarrollo de soluciones seguras. Tengo un inglés intermedio (B1-B2), suficiente para moverme en entornos técnicos.",
      "about.p3": "Lo que más me interesa: el desarrollo e integración de software seguro, la ciberseguridad operativa y la gestión de sistemas IT, la IA aplicada a entornos tecnológicos y automatizar lo que se repite. Los proyectos de aquí abajo son de desarrollo web, de la etapa del ciclo superior, y siguen explicando cómo trabajo.",
      "proj.h": "Proyectos",
      "proj.intro": "Cada tarjeta lleva las tecnologías con las que está hecho el proyecto y, si ya está desplegado, el enlace para probarlo.",
      "proj.code": "Código en GitHub",
      "chips.aria": "Tecnologías",
      "chip.qr": "Códigos QR",
      "chip.equip": "Proyecto de equipo",
      "obres.nom": "En obras",
      "obres.why": "Esto todavía está a medias. Mejor no mires debajo de la lona hasta que esté acabado.",
      "feed.loading": "Leyendo los repositorios de GitHub",
      "feed.cache": "GitHub no contesta ahora mismo, así que esta es la última lista guardada.",
      "feed.offline": "GitHub no contesta ahora mismo, así que esta es la lista de siempre, sin la fecha de cada repositorio.",
      "feed.nodesc": "Todavía no tiene descripción en GitHub. El código está publicado y se puede revisar.",
      "feed.updated": "Actualizado {t}",
      "feed.try": "Probar la app",
      "feed.code": "Código",
      "feed.soon": "Demo en camino",
      "feed.onlycode": "Solo código por ahora",
      "wake.title": "Las demos se duermen solas",
      "wake.text": "Están en un plan gratuito que las apaga a los quince minutos sin visitas. Arráncalas todas de una vez, o una a una desde su tarjeta, y cada una te va diciendo cómo está. Desde aquí solo se puede saber si el servidor contesta, no qué contesta.",
      "wake.on": "Iniciar las {n} demos",
      "wake.on.one": "Iniciar la demo",
      "wake.working": "Quedan {n} por contestar",
      "wake.working.one": "Queda 1 por contestar",
      "wake.retry": "Volver a intentarlo con {n}",
      "wake.retry.one": "Volver a intentarlo",
      "wake.done": "Las demos ya están en marcha",
      "wake.hint": "La primera arrancada tarda cerca de un minuto. Puedes seguir leyendo mientras.",
      "wake.hint.working": "Cerca de un minuto es lo normal. Llevan {s} s.",
      "wake.hint.done": "Se quedan despiertas mientras las uses. A los quince minutos sin visitas vuelven a dormirse.",
      "wake.hint.some": "Alguna no ha contestado a tiempo. Puedes volver a intentarlo desde su tarjeta o desde aquí.",
      "wake.live.on": "Iniciando {n} demos. Puede tardar cerca de un minuto.",
      "wake.live.on.one": "Iniciando una demo. Puede tardar cerca de un minuto.",
      "wake.live.ready": "{t}: ya contesta, la puedes abrir.",
      "wake.live.fail": "{t}: no ha contestado.",
      "wake.live.done": "Todas las demos contestan.",
      "wake.live.starting": "{t}: arrancando. Puede tardar cerca de un minuto.",
      "demo.start": "Iniciar la demo",
      "estat.off": "Sin comprobar",
      "estat.off.why": "Iníciala para poder abrirla.",
      "estat.waking": "Arrancando",
      "estat.waking.why": "El servidor está arrancando. Suele tardar cerca de un minuto.",
      "estat.on": "Activa",
      "estat.on.why": "Ya contesta, puedes abrirla.",
      "estat.fail": "No ha contestado",
      "estat.fail.why": "Se ha esperado dos minutos y medio sin respuesta. Prueba otra vez.",
      "estat.secs": "{s} s",
      "estat.again": "Volver a intentarlo",
      "edu.h": "Formación",
      "edu.intro": "De dónde vienen la base de desarrollo y la especialización en seguridad.",
      "edu.aria": "Contenidos",
      "cert.label": "Certificación",
      "edu.ev.when": "Abril de 2026 a diciembre de 2026",
      "edu.ev.tag": "En curso",
      "edu.ev.title": "Máster en Ciberseguridad e Inteligencia Artificial",
      "edu.ev.c1": "Hacking ético y metodología de auditoría",
      "edu.ev.c2": "Reconocimiento pasivo y activo",
      "edu.ev.c3": "OSINT y footprinting",
      "edu.ev.c4": "Protocolos de red, segmentación y arquitecturas de comunicación",
      "edu.ev.c5": "Explotación de vulnerabilidades",
      "edu.ev.c7": "Pivoting, movimiento lateral y escalada de privilegios",
      "edu.ev.c8": "Normativa, cumplimiento y marco legal",
      "edu.ev.c9": "Pentesting avanzado en entornos reales",
      "edu.ev.c11": "Blue Team, SOC y respuesta ante incidentes",
      "edu.ls.when": "Septiembre de 2022 a mayo de 2024",
      "edu.ls.title": "Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones",
      "edu.ls.note": "Nota media 6,313",
      "edu.eso.when": "2020 a 2024",
      "edu.eso.title": "Educación Secundaria Obligatoria",
      "skills.h": "Aptitudes",
      "skills.intro": "Agrupadas por familia, para que se vea de un vistazo de qué va cada parte.",
      "skills.g1": "Pentesting y ofensiva",
      "skills.g2": "Defensa",
      "skills.g3": "Metodologías y normativa",
      "skills.g4": "Programación y datos",
      "skills.g5": "Inteligencia artificial",
      "skills.g6": "Aptitudes personales",
      "skills.g7": "Idiomas",
      "sk.explo": "Explotación de vulnerabilidades",
      "sk.esc": "Escalada de privilegios",
      "sk.lat": "Movimiento lateral y pivoting",
      "sk.post": "Post-explotación",
      "sk.wifi": "Auditoría Wi-Fi y móvil",
      "sk.e2e": "Auditoría end-to-end",
      "sk.info": "Informe ejecutivo",
      "sk.inc": "Respuesta ante incidentes",
      "sk.cve": "CVE y NVD",
      "sk.rgpd": "RGPD",
      "sk.ag": "Agentes con Python",
      "sk.ml": "Aprendizaje automático",
      "sk.llm": "Modelos de lenguaje",
      "sk.iacyber": "IA aplicada a la ciberseguridad",
      "skills.soft": "De la etapa en La Salle Mollerussa: trabajo en equipo, resolución de problemas, responsabilidad, facilidad de adaptación, escucha activa, proactividad, empatía, respeto y tolerancia.",
      "lg.es": "Castellano",
      "lg.es.n": "Nativo o bilingüe",
      "lg.ru": "Ruso",
      "lg.ru.n": "Nativo o bilingüe",
      "lg.ca": "Catalán",
      "lg.ca.n": "Competencia profesional completa",
      "lg.en": "Inglés",
      "lg.en.n": "Intermedio, B1-B2",
      "contact.h": "Contacto",
      "contact.intro": "Si te encaja mi perfil, escríbeme por donde te vaya mejor. Contesto enseguida.",
      "contact.mail": "Correo",
      "contact.li": "El perfil entero, con más detalle",
      "contact.gh": "Todo el código de los proyectos",
      "foot.made": "Portafolio hecho a mano con HTML y CSS",
      "porta.enter": "Entrar",
      "porta.sending": "Entrando",
      "porta.retry": "Volver a intentarlo",
      "porta.checking": "Comprobando la sesión guardada.",
      "porta.slow": "El servidor estaba dormido y está arrancando. Cerca de un minuto es lo normal.",
      "porta.err.empty": "Escribe el usuario y la contraseña.",
      "porta.err.creds": "El usuario o la contraseña no cuadran.",
      "porta.err.net": "No se ha podido contactar con el servidor. Mira la conexión y vuelve a intentarlo.",
      "porta.err.time": "El servidor no ha contestado a tiempo. Vuelve a intentarlo.",
      "porta.err.server": "El servidor ha contestado con un error. Prueba otra vez dentro de un momento."
    },
    ca: {
      "doc.title": "Alex Aiguadé Alisultánov · Portafoli",
      "doc.desc": "Portafoli d'Alex Aiguadé Alisultánov. Cal entrar amb un compte per veure'l.",
      "skip": "Salta al contingut",
      "nav.aria": "Seccions",
      "nav.about": "Sobre mi",
      "nav.projects": "Projectes",
      "nav.edu": "Formació",
      "nav.skills": "Aptituds",
      "nav.contact": "Contacte",
      "sortir": "Sortir",
      "lang.aria": "Idioma",
      "hero.eyebrow": "Tècnic IT · Sistemes · Ciberseguretat",
      "hero.lead": "Tècnic IT centrat en sistemes i ciberseguretat, amb base en desenvolupament d'aplicacions. Ara curso el Màster en Ciberseguretat i IA i tinc la certificació eJPT v2. Busco incorporar-me al departament d'IT d'una empresa del sector.",
      "hero.where": "Anglesola, Catalunya, Espanya",
      "hero.cta": "Mira els projectes",
      "hero.note": "Cinc projectes publicats",
      "hero.count": "{n} projectes publicats",
      "hero.alt": "Retrat d'Alex Aiguadé Alisultánov",
      "about.h": "Sobre mi",
      "about.p1": "Sóc Tècnic Superior en Desenvolupament d'Aplicacions i ara curso el Màster en Ciberseguretat i Intel·ligència Artificial d'Evolve. La base la porto de la programació; el que treballo ara és la protecció d'actius digitals i l'ús de la IA per optimitzar i assegurar processos.",
      "about.p2": "Busco incorporar-me al departament d'IT d'una companyia del sector de la ciberseguretat, on pugui aportar en la gestió d'infraestructura, l'automatització de tasques i el desenvolupament de solucions segures. Tinc un anglès intermedi (B1-B2), prou per moure'm en entorns tècnics.",
      "about.p3": "El que més m'interessa: el desenvolupament i la integració de programari segur, la ciberseguretat operativa i la gestió de sistemes IT, la IA aplicada a entorns tecnològics i automatitzar el que es repeteix. Els projectes d'aquí sota són de desenvolupament web, de l'etapa del cicle superior, i segueixen explicant com treballo.",
      "proj.h": "Projectes",
      "proj.intro": "Cada targeta porta les tecnologies amb què està fet el projecte i, si ja està desplegat, l'enllaç per provar-lo.",
      "proj.code": "Codi a GitHub",
      "chips.aria": "Tecnologies",
      "chip.qr": "Codis QR",
      "chip.equip": "Projecte d'equip",
      "obres.nom": "En obres",
      "obres.why": "Això encara està a mitges. Val més no mirar sota la lona fins que estigui acabat.",
      "feed.loading": "Llegint els repositoris de GitHub",
      "feed.cache": "GitHub no contesta ara mateix, així que aquesta és l'última llista desada.",
      "feed.offline": "GitHub no contesta ara mateix, així que aquesta és la llista de sempre, sense la data de cada repositori.",
      "feed.nodesc": "Encara no té descripció a GitHub. El codi està publicat i es pot revisar.",
      "feed.updated": "Actualitzat {t}",
      "feed.try": "Provar l'aplicació",
      "feed.code": "Codi",
      "feed.soon": "Demo en camí",
      "feed.onlycode": "Només codi de moment",
      "wake.title": "Les demos s'adormen soles",
      "wake.text": "Són en un pla gratuït que les apaga als quinze minuts sense visites. Arrenca-les totes de cop, o una a una des de la seva targeta, i cadascuna et va dient com està. Des d'aquí només es pot saber si el servidor contesta, no pas què contesta.",
      "wake.on": "Iniciar les {n} demos",
      "wake.on.one": "Iniciar la demo",
      "wake.working": "En queden {n} per contestar",
      "wake.working.one": "En queda 1 per contestar",
      "wake.retry": "Tornar-ho a provar amb {n}",
      "wake.retry.one": "Tornar-ho a provar",
      "wake.done": "Les demos ja són en marxa",
      "wake.hint": "La primera arrencada triga prop d'un minut. Pots seguir llegint mentrestant.",
      "wake.hint.working": "Prop d'un minut és el normal. Porten {s} s.",
      "wake.hint.done": "Es queden despertes mentre les facis servir. Als quinze minuts sense visites tornen a adormir-se.",
      "wake.hint.some": "Alguna no ha contestat a temps. Pots tornar-ho a provar des de la seva targeta o des d'aquí.",
      "wake.live.on": "Iniciant {n} demos. Pot trigar prop d'un minut.",
      "wake.live.on.one": "Iniciant una demo. Pot trigar prop d'un minut.",
      "wake.live.ready": "{t}: ja contesta, la pots obrir.",
      "wake.live.fail": "{t}: no ha contestat.",
      "wake.live.done": "Totes les demos contesten.",
      "wake.live.starting": "{t}: arrencant. Pot trigar prop d'un minut.",
      "demo.start": "Iniciar la demo",
      "estat.off": "Sense comprovar",
      "estat.off.why": "Inicia-la per poder obrir-la.",
      "estat.waking": "Arrencant",
      "estat.waking.why": "El servidor està arrencant. Sol trigar prop d'un minut.",
      "estat.on": "Activa",
      "estat.on.why": "Ja contesta, la pots obrir.",
      "estat.fail": "No ha contestat",
      "estat.fail.why": "S'han esperat dos minuts i mig sense resposta. Prova-ho un altre cop.",
      "estat.secs": "{s} s",
      "estat.again": "Tornar-ho a provar",
      "edu.h": "Formació",
      "edu.intro": "D'on venen la base de desenvolupament i l'especialització en seguretat.",
      "edu.aria": "Continguts",
      "cert.label": "Certificació",
      "edu.ev.when": "Abril de 2026 a desembre de 2026",
      "edu.ev.tag": "En curs",
      "edu.ev.title": "Màster en Ciberseguretat i Intel·ligència Artificial",
      "edu.ev.c1": "Hacking ètic i metodologia d'auditoria",
      "edu.ev.c2": "Reconeixement passiu i actiu",
      "edu.ev.c3": "OSINT i footprinting",
      "edu.ev.c4": "Protocols de xarxa, segmentació i arquitectures de comunicació",
      "edu.ev.c5": "Explotació de vulnerabilitats",
      "edu.ev.c7": "Pivoting, moviment lateral i escalada de privilegis",
      "edu.ev.c8": "Normativa, compliment i marc legal",
      "edu.ev.c9": "Pentesting avançat en entorns reals",
      "edu.ev.c11": "Blue Team, SOC i resposta davant incidents",
      "edu.ls.when": "Setembre de 2022 a maig de 2024",
      "edu.ls.title": "Cicle Formatiu de Grau Superior en Desenvolupament d'Aplicacions",
      "edu.ls.note": "Nota mitjana 6,313",
      "edu.eso.when": "2020 a 2024",
      "edu.eso.title": "Educació Secundària Obligatòria",
      "skills.h": "Aptituds",
      "skills.intro": "Agrupades per família, perquè es vegi d'un cop d'ull de què va cada part.",
      "skills.g1": "Pentesting i ofensiva",
      "skills.g2": "Defensa",
      "skills.g3": "Metodologies i normativa",
      "skills.g4": "Programació i dades",
      "skills.g5": "Intel·ligència artificial",
      "skills.g6": "Aptituds personals",
      "skills.g7": "Idiomes",
      "sk.explo": "Explotació de vulnerabilitats",
      "sk.esc": "Escalada de privilegis",
      "sk.lat": "Moviment lateral i pivoting",
      "sk.post": "Post-explotació",
      "sk.wifi": "Auditoria Wi-Fi i mòbil",
      "sk.e2e": "Auditoria end-to-end",
      "sk.info": "Informe executiu",
      "sk.inc": "Resposta davant incidents",
      "sk.cve": "CVE i NVD",
      "sk.rgpd": "RGPD",
      "sk.ag": "Agents amb Python",
      "sk.ml": "Aprenentatge automàtic",
      "sk.llm": "Models de llenguatge",
      "sk.iacyber": "IA aplicada a la ciberseguretat",
      "skills.soft": "De l'etapa a La Salle Mollerussa: treball en equip, resolució de problemes, responsabilitat, facilitat d'adaptació, escolta activa, proactivitat, empatia, respecte i tolerància.",
      "lg.es": "Castellà",
      "lg.es.n": "Natiu o bilingüe",
      "lg.ru": "Rus",
      "lg.ru.n": "Natiu o bilingüe",
      "lg.ca": "Català",
      "lg.ca.n": "Competència professional completa",
      "lg.en": "Anglès",
      "lg.en.n": "Intermedi, B1-B2",
      "contact.h": "Contacte",
      "contact.intro": "Si et quadra el meu perfil, escriu-me per on et vagi millor. Contesto de seguida.",
      "contact.mail": "Correu",
      "contact.li": "El perfil sencer, amb més detall",
      "contact.gh": "Tot el codi dels projectes",
      "foot.made": "Portafoli fet a mà amb HTML i CSS",
      "porta.eyebrow": "Portafoli",
      "porta.titular": "Tècnic IT · Sistemes · Ciberseguretat",
      "porta.user": "Usuari",
      "porta.pass": "Contrasenya",
      "porta.nota": "El compte de convidat ja ve posat. La contrasenya te la passa l'Alex.",
      "porta.enter": "Entrar",
      "porta.sending": "Entrant",
      "porta.retry": "Tornar-ho a provar",
      "porta.checking": "Comprovant la sessió desada.",
      "porta.slow": "El servidor estava adormit i s'està engegant. Prop d'un minut és el normal.",
      "porta.err.empty": "Escriu l'usuari i la contrasenya.",
      "porta.err.creds": "L'usuari o la contrasenya no quadren.",
      "porta.err.net": "No s'ha pogut contactar amb el servidor. Mira la connexió i torna-ho a provar.",
      "porta.err.time": "El servidor no ha contestat a temps. Torna-ho a provar.",
      "porta.err.server": "El servidor ha contestat amb un error. Prova-ho un altre cop d'aquí a un moment."
    },
    en: {
      "doc.title": "Alex Aiguadé Alisultánov · Portfolio",
      "doc.desc": "Portfolio of Alex Aiguadé Alisultánov. You need an account to see it.",
      "skip": "Skip to content",
      "nav.aria": "Sections",
      "nav.about": "About me",
      "nav.projects": "Projects",
      "nav.edu": "Education",
      "nav.skills": "Skills",
      "nav.contact": "Contact",
      "sortir": "Sign out",
      "lang.aria": "Language",
      "hero.eyebrow": "IT technician · Systems · Cybersecurity",
      "hero.lead": "IT technician focused on systems and cybersecurity, with a background in application development. I'm taking the Master's in Cybersecurity and AI right now and I hold the eJPT v2 certification. I'm looking to join the IT department of a company in the field.",
      "hero.where": "Anglesola, Catalonia, Spain",
      "hero.cta": "See the projects",
      "hero.note": "Five projects published",
      "hero.count": "{n} projects published",
      "hero.alt": "Portrait of Alex Aiguadé Alisultánov",
      "about.h": "About me",
      "about.p1": "I'm a Higher Technician in Application Development and I'm currently taking the Master's in Cybersecurity and Artificial Intelligence at Evolve. My base is programming; what I work on now is protecting digital assets and using AI to make processes safer and leaner.",
      "about.p2": "I'm looking to join the IT department of a company in the cybersecurity field, where I can contribute to infrastructure management, task automation and building secure solutions. My English is intermediate (B1-B2), enough to work inside a technical team.",
      "about.p3": "What interests me most: developing and integrating secure software, hands-on cybersecurity and IT systems management, AI applied to technical environments, and automating whatever repeats. The projects below are web development, from my vocational training years, and they still say how I work.",
      "proj.h": "Projects",
      "proj.intro": "Each card lists the technologies behind the project and, once it is deployed, the link to try it.",
      "proj.code": "Code on GitHub",
      "chips.aria": "Technologies",
      "chip.qr": "QR codes",
      "chip.equip": "Team project",
      "obres.nom": "Under construction",
      "obres.why": "This one is still halfway there. Better not to peek under the tarp until it is finished.",
      "feed.loading": "Reading the repositories from GitHub",
      "feed.cache": "GitHub is not answering right now, so this is the last list that was saved.",
      "feed.offline": "GitHub is not answering right now, so this is the usual list, without the date of each repository.",
      "feed.nodesc": "No description on GitHub yet. The code is published and you can go through it.",
      "feed.updated": "Updated {t}",
      "feed.try": "Try the app",
      "feed.code": "Code",
      "feed.soon": "Demo on the way",
      "feed.onlycode": "Code only for now",
      "wake.title": "The demos fall asleep on their own",
      "wake.text": "They run on a free plan that shuts them down after fifteen minutes without visits. Start them all at once, or one at a time from its card, and each one tells you how it is doing. From here all you can know is whether the server answers, not what it answers.",
      "wake.on": "Start the {n} demos",
      "wake.on.one": "Start the demo",
      "wake.working": "{n} still to answer",
      "wake.working.one": "1 still to answer",
      "wake.retry": "Try {n} again",
      "wake.retry.one": "Try it again",
      "wake.done": "The demos are up",
      "wake.hint": "The first start takes close to a minute. You can keep reading meanwhile.",
      "wake.hint.working": "Close to a minute is normal. {s} s so far.",
      "wake.hint.done": "They stay up while you use them. After fifteen minutes without visits they go back to sleep.",
      "wake.hint.some": "One of them did not answer in time. You can try again from its card or from here.",
      "wake.live.on": "Starting {n} demos. It can take close to a minute.",
      "wake.live.on.one": "Starting one demo. It can take close to a minute.",
      "wake.live.ready": "{t}: answering now, you can open it.",
      "wake.live.fail": "{t}: no answer.",
      "wake.live.done": "Every demo answers.",
      "wake.live.starting": "{t}: starting up. It can take close to a minute.",
      "demo.start": "Start the demo",
      "estat.off": "Not checked",
      "estat.off.why": "Start it to be able to open it.",
      "estat.waking": "Starting up",
      "estat.waking.why": "The server is starting up. It usually takes close to a minute.",
      "estat.on": "Up",
      "estat.on.why": "It answers, you can open it.",
      "estat.fail": "No answer",
      "estat.fail.why": "Two and a half minutes went by with no answer. Give it another go.",
      "estat.secs": "{s} s",
      "estat.again": "Try again",
      "edu.h": "Education",
      "edu.intro": "Where the development base and the security specialisation come from.",
      "edu.aria": "Contents",
      "cert.label": "Certification",
      "edu.ev.when": "April 2026 to December 2026",
      "edu.ev.tag": "In progress",
      "edu.ev.title": "Master's in Cybersecurity and Artificial Intelligence",
      "edu.ev.c1": "Ethical hacking and audit methodology",
      "edu.ev.c2": "Passive and active reconnaissance",
      "edu.ev.c3": "OSINT and footprinting",
      "edu.ev.c4": "Network protocols, segmentation and communication architectures",
      "edu.ev.c5": "Vulnerability exploitation",
      "edu.ev.c7": "Pivoting, lateral movement and privilege escalation",
      "edu.ev.c8": "Regulation, compliance and the legal framework",
      "edu.ev.c9": "Advanced pentesting in real environments",
      "edu.ev.c11": "Blue Team, SOC and incident response",
      "edu.ls.when": "September 2022 to May 2024",
      "edu.ls.title": "Advanced vocational training in Application Development",
      "edu.ls.note": "Average grade 6.313",
      "edu.eso.when": "2020 to 2024",
      "edu.eso.title": "Compulsory secondary education",
      "skills.h": "Skills",
      "skills.intro": "Grouped by family, so you can tell at a glance what each part is about.",
      "skills.g1": "Pentesting and offensive security",
      "skills.g2": "Defence",
      "skills.g3": "Methodologies and regulation",
      "skills.g4": "Programming and data",
      "skills.g5": "Artificial intelligence",
      "skills.g6": "Personal skills",
      "skills.g7": "Languages",
      "sk.explo": "Vulnerability exploitation",
      "sk.esc": "Privilege escalation",
      "sk.lat": "Lateral movement and pivoting",
      "sk.post": "Post-exploitation",
      "sk.wifi": "Wi-Fi and mobile auditing",
      "sk.e2e": "End-to-end audits",
      "sk.info": "Executive reporting",
      "sk.inc": "Incident response",
      "sk.cve": "CVE and NVD",
      "sk.rgpd": "GDPR",
      "sk.ag": "Agents with Python",
      "sk.ml": "Machine learning",
      "sk.llm": "Language models",
      "sk.iacyber": "AI applied to cybersecurity",
      "skills.soft": "From my years at La Salle Mollerussa: teamwork, problem solving, responsibility, easy adaptation, active listening, initiative, empathy, respect and tolerance.",
      "lg.es": "Spanish",
      "lg.es.n": "Native or bilingual",
      "lg.ru": "Russian",
      "lg.ru.n": "Native or bilingual",
      "lg.ca": "Catalan",
      "lg.ca.n": "Full professional proficiency",
      "lg.en": "English",
      "lg.en.n": "Intermediate, B1-B2",
      "contact.h": "Contact",
      "contact.intro": "If my profile fits what you need, write to me wherever suits you best. I answer quickly.",
      "contact.mail": "Email",
      "contact.li": "The full profile, in more detail",
      "contact.gh": "All the code from the projects",
      "foot.made": "Portfolio handmade with HTML and CSS",
      "porta.eyebrow": "Portfolio",
      "porta.titular": "IT technician · Systems · Cybersecurity",
      "porta.user": "Username",
      "porta.pass": "Password",
      "porta.nota": "The guest account is already filled in. Alex gives you the password.",
      "porta.enter": "Sign in",
      "porta.sending": "Signing in",
      "porta.retry": "Try again",
      "porta.checking": "Checking the saved session.",
      "porta.slow": "The server was asleep and is starting up. Close to a minute is normal.",
      "porta.err.empty": "Type the username and the password.",
      "porta.err.creds": "That username and password do not match.",
      "porta.err.net": "Could not reach the server. Check your connection and try again.",
      "porta.err.time": "The server did not answer in time. Try again.",
      "porta.err.server": "The server answered with an error. Give it another go in a moment."
    }
  };

  var ATRIBUTS = ["alt", "title", "aria-label", "content"];
  var CLAU_IDIOMA = "portafoli-idioma";
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

  // El castellano de la pantalla de acceso sale del HTML, que es donde está escrito.
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
    if (typeof TRADUCCIONES.es[clau] === "string") return TRADUCCIONES.es[clau];
    return castella[clau] != null ? castella[clau] : "";
  };

  var aplicar = function (idioma) {
    idiomaActual = idioma;
    document.documentElement.lang = idioma;
    cadaText(function (el) {
      el.textContent = frase(idioma, el.getAttribute("data-i18n"));
    });
    cadaAtribut(function (el, attr, clau) {
      el.setAttribute(attr, frase(idioma, clau));
    });
    // Los botones se buscan cada vez porque los hay en la pantalla de acceso y, después,
    // en la cabecera del portafolio.
    Array.prototype.forEach.call(document.querySelectorAll(".lang__btn"), function (boto) {
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

  var recordarIdioma = function (idioma) {
    try {
      window.localStorage.setItem(CLAU_IDIOMA, idioma);
    } catch (e) {
      // Ventana privada o almacenamiento bloqueado: la elección solo dura esta visita.
    }
  };

  var idiomaRecordat = function () {
    try {
      return window.localStorage.getItem(CLAU_IDIOMA);
    } catch (e) {
      return null;
    }
  };

  document.addEventListener("click", function (event) {
    var boto = event.target && event.target.closest ? event.target.closest(".lang__btn") : null;
    if (!boto) return;
    var idioma = boto.getAttribute("data-lang");
    if (!idioma || idioma === idiomaActual) return;
    aplicar(idioma);
    recordarIdioma(idioma);
  });

  var desatIdioma = idiomaRecordat();
  aplicar(desatIdioma === "ca" || desatIdioma === "en" ? desatIdioma : "es");

  /* ---------- El portafolio, montado desde aquí ---------- */

  // Todo esto estaba en index.html. Se mueve al script porque el contenido solo tiene
  // que existir cuando la API ha dicho quién entra: dejarlo en el HTML significaría que
  // se lee entero sin pasar por la pantalla de acceso.
  var PLANTILLA = `
<a class="skip" href="#contingut" data-i18n="skip">Salta al contenido</a>

<header class="topbar">
  <div class="topbar__inner">
    <a class="topbar__name" href="#dalt">Alex Aiguadé</a>

    <nav class="topbar__nav" aria-label="Secciones" data-i18n-aria-label="nav.aria">
      <ul>
        <li><a href="#sobre-mi" data-i18n="nav.about">Sobre mí</a></li>
        <li><a href="#projectes" data-i18n="nav.projects">Proyectos</a></li>
        <li><a href="#formacio" data-i18n="nav.edu">Formación</a></li>
        <li><a href="#habilitats" data-i18n="nav.skills">Aptitudes</a></li>
        <li><a href="#contacte" data-i18n="nav.contact">Contacto</a></li>
      </ul>
    </nav>

    <div class="topbar__eines">
      <div class="lang" role="group" aria-label="Idioma" data-i18n-aria-label="lang.aria">
        <button class="lang__btn" type="button" data-lang="es" aria-pressed="true">
          <svg class="flag" aria-hidden="true" focusable="false"><use href="#f-es"/></svg>
          <span>Castellano</span>
        </button>
        <button class="lang__btn" type="button" data-lang="ca" aria-pressed="false">
          <svg class="flag" aria-hidden="true" focusable="false"><use href="#f-ca"/></svg>
          <span>Català</span>
        </button>
        <button class="lang__btn" type="button" data-lang="en" aria-pressed="false">
          <svg class="flag" aria-hidden="true" focusable="false"><use href="#f-gb"/></svg>
          <span>English</span>
        </button>
      </div>
      <button class="sortir" type="button" id="sortir" data-i18n="sortir">Salir</button>
    </div>
  </div>
</header>

<main id="contingut">

  <section class="hero" id="dalt">
    <div class="wrap hero__grid">
      <div class="hero__text">
        <p class="eyebrow" data-i18n="hero.eyebrow">Técnico IT · Sistemas · Ciberseguridad</p>
        <h1>Alex Aiguadé Alisultánov</h1>
        <p class="lead" data-i18n="hero.lead"></p>
        <p class="hero__lloc" data-i18n="hero.where">Anglesola, Cataluña, España</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#projectes" data-i18n="hero.cta">Mira los proyectos</a>
          <a class="btn btn--ghost" href="https://www.linkedin.com/in/alex-aiguade-alisultanov-076706230/" target="_blank" rel="noopener">
            LinkedIn<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>
          </a>
        </div>
        <p class="hero__note" data-i18n="hero.note">Cinco proyectos publicados</p>
      </div>
      <div class="hero__photo">
        <img src="Img/alex.png" width="400" height="400" alt="" data-i18n-alt="hero.alt" fetchpriority="high" decoding="async">
      </div>
    </div>
  </section>

  <section class="section" id="sobre-mi" aria-labelledby="t-sobre">
    <div class="wrap">
      <p class="eyebrow">01</p>
      <h2 id="t-sobre" data-i18n="about.h">Sobre mí</h2>
      <div class="prose">
        <p data-i18n="about.p1"></p>
        <p data-i18n="about.p2"></p>
        <p data-i18n="about.p3"></p>
      </div>
    </div>
  </section>

  <section class="section" id="projectes" aria-labelledby="t-projectes">
    <div class="wrap">
      <p class="eyebrow">02</p>
      <h2 id="t-projectes" data-i18n="proj.h">Proyectos</h2>
      <p class="section__intro" data-i18n="proj.intro"></p>

      <p class="feed" id="estat-projectes" role="status" hidden>
        <span class="feed__dot" aria-hidden="true"></span>
        <span class="feed__text"></span>
      </p>

      <ul class="cards" id="llista-projectes"></ul>
    </div>
  </section>

  <section class="section" id="formacio" aria-labelledby="t-formacio">
    <div class="wrap">
      <p class="eyebrow">03</p>
      <h2 id="t-formacio" data-i18n="edu.h">Formación</h2>
      <p class="section__intro" data-i18n="edu.intro"></p>

      <div class="cert">
        <svg class="ico ico--lead" aria-hidden="true" focusable="false"><use href="#i-shield"/></svg>
        <div class="cert__cos">
          <p class="cert__etiqueta" data-i18n="cert.label">Certificación</p>
          <p class="cert__nom">eJPT v2</p>
          <p class="cert__org">INE · eLearnSecurity Junior Penetration Tester</p>
        </div>
      </div>

      <ol class="timeline">
        <li>
          <div class="timeline__quan">
            <p data-i18n="edu.ev.when"></p>
            <p class="badge badge--ara" data-i18n="edu.ev.tag">En curso</p>
          </div>
          <div class="timeline__cos">
            <h3 data-i18n="edu.ev.title"></h3>
            <p class="timeline__lloc">Evolve</p>
            <ul class="chips" aria-label="Contenidos" data-i18n-aria-label="edu.aria">
              <li data-i18n="edu.ev.c1"></li>
              <li data-i18n="edu.ev.c2"></li>
              <li data-i18n="edu.ev.c3"></li>
              <li data-i18n="edu.ev.c4"></li>
              <li data-i18n="edu.ev.c5"></li>
              <li>Metasploit</li>
              <li data-i18n="edu.ev.c7"></li>
              <li data-i18n="edu.ev.c8"></li>
              <li data-i18n="edu.ev.c9"></li>
              <li data-i18n="sk.iacyber"></li>
              <li data-i18n="edu.ev.c11"></li>
            </ul>
          </div>
        </li>
        <li>
          <div class="timeline__quan">
            <p data-i18n="edu.ls.when"></p>
          </div>
          <div class="timeline__cos">
            <h3 data-i18n="edu.ls.title"></h3>
            <p class="timeline__lloc">La Salle Mollerussa</p>
            <p class="timeline__nota" data-i18n="edu.ls.note"></p>
          </div>
        </li>
        <li>
          <div class="timeline__quan">
            <p data-i18n="edu.eso.when"></p>
          </div>
          <div class="timeline__cos">
            <h3 data-i18n="edu.eso.title"></h3>
            <p class="timeline__lloc">Ins Alfons Costafreda</p>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <section class="section" id="habilitats" aria-labelledby="t-habilitats">
    <div class="wrap">
      <p class="eyebrow">04</p>
      <h2 id="t-habilitats" data-i18n="skills.h">Aptitudes</h2>
      <p class="section__intro" data-i18n="skills.intro"></p>

      <div class="stack">
        <div class="stack__group">
          <h3 data-i18n="skills.g1">Pentesting y ofensiva</h3>
          <ul class="chips chips--lg">
            <li>Kali Linux</li><li>Nmap</li><li>Burp Suite</li><li>SQLMap</li><li>Metasploit</li><li>Wireshark</li><li>OSINT</li>
            <li data-i18n="sk.explo"></li>
            <li data-i18n="sk.esc"></li>
            <li data-i18n="sk.lat"></li>
            <li data-i18n="sk.post"></li>
            <li>Payloads</li>
            <li data-i18n="sk.wifi"></li>
            <li data-i18n="sk.e2e"></li>
            <li data-i18n="sk.info"></li>
          </ul>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g2">Defensa</h3>
          <ul class="chips chips--lg">
            <li>Blue Team</li><li>Purple Team</li><li>SOC</li>
            <li data-i18n="sk.inc"></li>
            <li>SIEM</li>
            <li data-i18n="sk.cve"></li>
          </ul>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g3">Metodologías y normativa</h3>
          <ul class="chips chips--lg">
            <li>OWASP</li><li>PTES</li><li>ENS</li><li>NIS2</li>
            <li data-i18n="sk.rgpd"></li>
          </ul>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g4">Programación y datos</h3>
          <ul class="chips chips--lg">
            <li>Python</li><li>Java</li><li>MariaDB</li><li>TCP/IP</li>
          </ul>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g5">Inteligencia artificial</h3>
          <ul class="chips chips--lg">
            <li data-i18n="sk.ag"></li>
            <li data-i18n="sk.ml"></li>
            <li data-i18n="sk.llm"></li>
            <li data-i18n="sk.iacyber"></li>
          </ul>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g6">Aptitudes personales</h3>
          <p class="stack__nota" data-i18n="skills.soft"></p>
        </div>
        <div class="stack__group">
          <h3 data-i18n="skills.g7">Idiomas</h3>
          <ul class="langs">
            <li>
              <span class="langs__nom" data-i18n="lg.es">Castellano</span>
              <span class="langs__niv" data-i18n="lg.es.n"></span>
            </li>
            <li>
              <span class="langs__nom" data-i18n="lg.ru">Ruso</span>
              <span class="langs__niv" data-i18n="lg.ru.n"></span>
            </li>
            <li>
              <span class="langs__nom" data-i18n="lg.ca">Catalán</span>
              <span class="langs__niv" data-i18n="lg.ca.n"></span>
            </li>
            <li>
              <span class="langs__nom" data-i18n="lg.en">Inglés</span>
              <span class="langs__niv" data-i18n="lg.en.n"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--last" id="contacte" aria-labelledby="t-contacte">
    <div class="wrap">
      <p class="eyebrow">05</p>
      <h2 id="t-contacte" data-i18n="contact.h">Contacto</h2>
      <p class="section__intro" data-i18n="contact.intro"></p>

      <ul class="contact">
        <li>
          <a href="mailto:alexaiguade@gmail.com">
            <svg class="ico ico--lead" aria-hidden="true" focusable="false"><use href="#i-mail"/></svg>
            <span class="contact__label" data-i18n="contact.mail">Correo</span>
            <span class="contact__value">alexaiguade@gmail.com</span>
            <svg class="ico ico--end" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>
          </a>
        </li>
        <li>
          <a href="https://wa.me/34684258353" target="_blank" rel="noopener">
            <svg class="ico ico--lead" aria-hidden="true" focusable="false"><use href="#i-chat"/></svg>
            <span class="contact__label">WhatsApp</span>
            <span class="contact__value">684 258 353</span>
            <svg class="ico ico--end" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/alex-aiguade-alisultanov-076706230/" target="_blank" rel="noopener">
            <svg class="ico ico--lead" aria-hidden="true" focusable="false"><use href="#i-linkedin"/></svg>
            <span class="contact__label">LinkedIn</span>
            <span class="contact__value" data-i18n="contact.li"></span>
            <svg class="ico ico--end" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>
          </a>
        </li>
        <li>
          <a href="https://github.com/AlexAiguadeAlisultanov" target="_blank" rel="noopener">
            <svg class="ico ico--lead" aria-hidden="true" focusable="false"><use href="#i-github"/></svg>
            <span class="contact__label">GitHub</span>
            <span class="contact__value" data-i18n="contact.gh"></span>
            <svg class="ico ico--end" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg>
          </a>
        </li>
      </ul>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot__inner">
    <p>Alex Aiguadé Alisultánov</p>
    <p><span data-i18n="foot.made">Portafolio hecho a mano con HTML y CSS</span> · <span id="any">2026</span></p>
  </div>
</footer>
`;

  /* ---------- Proyectos, leídos de GitHub ---------- */

  var USUARI = "AlexAiguadeAlisultanov";
  var API = "https://api.github.com/users/" + USUARI + "/repos?sort=updated&per_page=100";
  var CLAU_REPOS = "portafoli-repos";
  var NS_SVG = "http://www.w3.org/2000/svg";

  // Quién ha entrado. Lo dice la API al validar, nunca el navegador.
  var rol = "invitado";

  // Proyectos que solo puede abrir quien entra como admin. Al resto se le enseña la
  // tarjeta con el aviso de que está a medias, sin enlace ni botón de arrancar.
  var NOMES_ADMIN = ["jondasiviz"];

  var bloquejat = function (nom) {
    return rol !== "admin" && NOMES_ADMIN.indexOf(String(nom).toLowerCase()) !== -1;
  };

  // Lo que ya sabemos de los proyectos que se enseñan: un título cuidado, el texto
  // escrito a mano en los tres idiomas, las tecnologías y, en cuanto estén desplegados,
  // la dirección de la demo. Un repositorio que no esté aquí sale igualmente con lo que
  // dé GitHub, así que subir uno nuevo basta para que aparezca.
  var CONEGUTS = {
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
      // El repositorio es privado: la API pública no lo devuelve, así que esta ficha
      // es la única fuente de la tarjeta, y no se enseña enlace al código porque
      // daría un 404 a quien no sea el dueño. La demo sí es pública.
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
      titol: { es: "Planificador de preparación Volkswagen", ca: "Planificador de preparació Volkswagen", en: "Volkswagen build planner" },
      tipus: "web",
      // Proyecto de equipo, con el repositorio privado. La ficha es la única fuente
      // de la tarjeta y no se enseña enlace al código: daría un 404 a quien no sea
      // del equipo.
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
  // proyectos de escritorio. Todo lo demás que haya en la cuenta sí sale.
  var FORA = ["alexaiguadealisultanov.github.io", "gestioestock", "exploracio"];

  // Y al revés: los que tienen que salir aunque la API no los traiga, porque el
  // repositorio es privado. Cuando se haga público llegará por la API con su fecha y
  // su enlace, y este añadido dejará de hacer nada.
  var SEMPRE = ["MVC-AJAX", "jondasiviz"];

  var fitxes = {};
  Object.keys(CONEGUTS).forEach(function (nom) {
    fitxes[nom.toLowerCase()] = CONEGUTS[nom];
  });

  var esFora = function (nom) {
    return FORA.indexOf(String(nom).toLowerCase()) !== -1;
  };

  var urlRepo = function (nom) {
    var fitxa = fitxes[nom.toLowerCase()];
    if (fitxa && fitxa.privat) return "";
    return "https://github.com/" + USUARI + "/" + nom;
  };

  var deFitxa = function (nom) {
    return { nom: nom, url: urlRepo(nom), desc: "", llenguatge: "", data: "", web: "" };
  };

  // Añade al final los que tienen que salir sí o sí y la lista no trae.
  var ambForcats = function (llistat) {
    SEMPRE.forEach(function (nom) {
      var hi = llistat.some(function (repo) {
        return String(repo.nom).toLowerCase() === nom.toLowerCase();
      });
      if (!hi) llistat.push(deFitxa(nom));
    });
    return llistat;
  };

  var llista = null;
  var estat = null;
  var estatText = null;
  var nota = null;

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

  // La dirección de la demo sale de la ficha del proyecto y, si no la tiene, de la web
  // que lleve puesta el repositorio en GitHub. Para estrenar una demo nueva basta con
  // rellenar el campo "demo" de ahí arriba: todo lo demás va solo.
  var adrecaDemo = function (repo) {
    var fitxa = fitxes[repo.nom.toLowerCase()];
    if (fitxa && esWeb(fitxa.demo)) return fitxa.demo;
    return esWeb(repo.web) ? repo.web : "";
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
      nom: repo.nom,
      titol: repo.nom,
      url: repo.url,
      text: "",
      tec: [],
      demo: adrecaDemo(repo),
      tipus: "",
      marca: "",
      tancat: bloquejat(repo.nom),
      data: repo.data
    };

    if (fitxa) {
      dades.titol = enIdioma(fitxa.titol, idioma) || repo.nom;
      dades.text = enIdioma(fitxa.text, idioma);
      dades.tec = fitxa.tec || [];
      dades.tipus = fitxa.tipus || "web";
    } else {
      dades.text = repo.desc || frase(idioma, "feed.nodesc");
      if (repo.llenguatge) dades.tec = [repo.llenguatge];
    }

    // Sin el rol que toca no hay nada que abrir: ni demo ni código.
    if (dades.tancat) {
      dades.demo = "";
      dades.url = "";
    }

    // Sin demo que abrir, la tarjeta dice en qué punto está en vez de dejar el hueco.
    // El día que una ficha estrene dirección, esa tarjeta pasa sola a "Probar la app".
    if (!dades.demo && !dades.tancat) dades.marca = dades.tipus ? "feed.soon" : "feed.onlycode";

    return dades;
  };

  var targeta = function (dades, idioma, ordre) {
    var li = crear("li", "card");

    var h3 = crear("h3");
    // El título cubre la tarjeta entera, así que apunta a lo que se quiere abrir al
    // pulsarla: la aplicación si está en marcha, y si no el código. Cuando el
    // repositorio es privado, o cuando la demo está dormida y todavía no contesta, no
    // hay nada que abrir: el título se queda en texto y la tarjeta deja de ser enlace.
    var dorm = esAdormida(dades.demo);
    var obrir = dorm && !enMarxa(dades.demo) ? "" : (dades.demo || dades.url);
    if (obrir) {
      var enllac = crear("a");
      enllac.href = obrir;
      enllac.target = "_blank";
      enllac.rel = "noopener";
      enllac.textContent = dades.titol;
      h3.appendChild(enllac);
    } else {
      h3.appendChild(document.createTextNode(dades.titol));
      li.classList.add("card--fix");
    }
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

    // Proyecto que este rol no puede abrir: la tarjeta se queda sin peu, con la línea
    // que dice que está a medias ocupando ese sitio.
    if (dades.tancat) {
      var obres = crear("p", "card__estat card__estat--obres estat--obres");
      var puntObres = crear("span", "estat__punt");
      puntObres.setAttribute("aria-hidden", "true");
      var nomObres = crear("span", "estat__nom");
      nomObres.textContent = frase(idioma, "obres.nom");
      var notaObres = crear("span", "estat__nota");
      notaObres.textContent = frase(idioma, "obres.why");
      obres.appendChild(puntObres);
      obres.appendChild(nomObres);
      obres.appendChild(notaObres);
      li.appendChild(obres);

      if (estrena) {
        li.classList.add("card--nou");
        li.style.animationDelay = Math.min(ordre, 4) * 40 + "ms";
      }
      return li;
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

    // Qué sabemos de la demo y por qué no se puede abrir todavía. Solo la llevan las
    // que se duermen.
    var linia = dorm ? liniaEstat(li) : null;

    var peu = crear("div", "card__foot");

    var accio = null;

    if (dades.demo) {
      // Aplicación en marcha: abrirla manda, y el código se queda de apoyo. La acción
      // vive dentro de un hueco propio porque cambia de botón de iniciar a enlace de
      // probar según conteste la demo o no, y así solo se rehace esa pieza.
      accio = crear("span", "card__accio");
      if (!dorm) accio.appendChild(enllacDemo(dades.demo, idioma));
      peu.appendChild(accio);

      // Sin repositorio público no hay código que enseñar: el enlace daría un 404 a
      // cualquiera que no sea del equipo.
      if (dades.url) {
        var codi = crear("a", "card__codi");
        codi.href = dades.url;
        codi.target = "_blank";
        codi.rel = "noopener";
        codi.appendChild(icona("i-github"));
        codi.appendChild(document.createTextNode(frase(idioma, "feed.code")));
        peu.appendChild(codi);
      }
    } else {
      // Sin nada que abrir, el código es lo que hay que ver, y al lado una marca que
      // dice por qué no hay aplicación que probar.
      if (dades.url) {
        var codiSol = crear("span", "card__link");
        codiSol.appendChild(icona("i-github"));
        var codiText = crear("span");
        codiText.textContent = frase(idioma, "proj.code");
        codiSol.appendChild(codiText);
        peu.appendChild(codiSol);
      }

      if (dades.marca) {
        var marca = crear("span", "badge");
        marca.textContent = frase(idioma, dades.marca);
        peu.appendChild(marca);
      }
    }

    li.appendChild(peu);

    if (dorm) {
      apuntarDemo({
        url: dades.demo,
        nom: dades.titol,
        li: li,
        titol: h3,
        linia: linia,
        accio: accio
      });
    }

    if (estrena) {
      li.classList.add("card--nou");
      li.style.animationDelay = Math.min(ordre, 4) * 40 + "ms";
    }

    return li;
  };

  /* ---------- Encender las demos ---------- */

  // Las demos viven en un plan gratuito que apaga el servicio a los quince minutos sin
  // visitas, y volver a arrancarlo tarda cerca de un minuto. La página no llama a
  // ninguna por su cuenta: cada petición despierta un servicio, así que sondear al
  // cargar significaría cinco arranques por visita. Se enciende cuando alguien lo pide.
  //
  // Esos servidores no mandan cabeceras CORS, de modo que la respuesta llega opaca y no
  // hay forma de leer ni el código ni el cuerpo. Lo único que se sabe es si la petición
  // ha terminado, que resulta ser justo la señal que hace falta: termina cuando el
  // servidor ya está arriba. Por eso los textos hablan de contestar y no de estar bien.

  var DORMEN = ["onrender.com"];  // dominios cuyos servicios se apagan solos
  var TOPE = 150000;              // espera máxima antes de dar una demo por fallida
  var CADUCA = 900000;            // quince minutos, lo que tardan en volver a dormirse
  var CLAU_DEMOS = "portafoli-demos";

  var hiHaFetch = !!(window.fetch && window.Promise);
  var estats = {};    // dirección de la demo, con lo que sabemos de ella
  var titols = {};    // dirección y nombre del proyecto, para los avisos hablados
  var carnets = [];   // los trozos de cada tarjeta que hay que ir actualizando
  var adreces = [];   // las demos que hay ahora mismo en pantalla
  var panell = null, panellTitol = null, panellText = null, panellBoto = null,
      panellPista = null, panellViu = null;
  var rellotge = null, cadencia = 0, totesLlestes = false, comptadorLinies = 0;

  // Una demo alojada donde no se apaga nada sigue siendo un enlace normal. Sin fetch
  // tampoco hay forma de encender nada, así que la página se queda como siempre.
  var esAdormida = function (url) {
    if (!hiHaFetch || !esWeb(url)) return false;
    var amfitrio = (String(url).split("//")[1] || "").split("/")[0].split(":")[0].toLowerCase();
    return DORMEN.some(function (domini) {
      return amfitrio === domini || amfitrio.slice(-domini.length - 1) === "." + domini;
    });
  };

  var registre = function (url) {
    if (!estats[url]) estats[url] = { fase: "off", inici: 0, quan: 0, intent: 0 };
    return estats[url];
  };

  var enMarxa = function (url) {
    return registre(url).fase === "on";
  };

  var desarDemos = function () {
    try {
      var desa = {};
      Object.keys(estats).forEach(function (url) {
        if (estats[url].fase === "on") desa[url] = estats[url].quan;
      });
      window.localStorage.setItem(CLAU_DEMOS, JSON.stringify(desa));
    } catch (e) {
      // Sin almacenamiento el encendido vale solo para esta pestaña.
    }
  };

  // Al cargar no se sondea nada, pero si hace menos de quince minutos que una demo
  // contestó, sigue despierta. Eso es una respuesta medida hace un rato, no una
  // suposición, y ahorra un arranque de más.
  var recuperarDemos = function () {
    try {
      var desa = JSON.parse(window.localStorage.getItem(CLAU_DEMOS) || "{}");
      Object.keys(desa).forEach(function (url) {
        var quan = Number(desa[url]);
        if (quan > 0 && Date.now() - quan < CADUCA) {
          var reg = registre(url);
          reg.fase = "on";
          reg.quan = quan;
        }
      });
    } catch (e) {
      // Si no hay nada que recuperar salen todas sin comprobar, que es lo seguro.
    }
  };

  var comptes = function () {
    var ara = Date.now();
    var c = { total: 0, off: 0, waking: 0, on: 0, fail: 0, segons: 0 };
    adreces.forEach(function (url) {
      var reg = registre(url);
      c.total += 1;
      c[reg.fase] += 1;
      if (reg.fase === "waking" && reg.inici) {
        c.segons = Math.max(c.segons, Math.round((ara - reg.inici) / 1000));
      }
    });
    return c;
  };

  // Un aviso corto para quien va con lector de pantalla, sin tocar nada de lo que se ve.
  var dir = function (clau, url) {
    if (!panellViu) return;
    panellViu.textContent = frase(idiomaActual, clau).replace("{t}", titols[url] || "");
  };

  var compte = function (idioma, clau, n) {
    return frase(idioma, n === 1 ? clau + ".one" : clau).replace("{n}", String(n));
  };

  var marcar = function (url, nova) {
    var reg = registre(url);
    if (reg.fase === nova) return;
    reg.fase = nova;
    if (nova === "on") reg.quan = Date.now();
    desarDemos();
    refrescar();
  };

  var visita = function (url) {
    // Abrir la demo cuenta como visita, así que el reloj de los quince minutos vuelve
    // a empezar.
    registre(url).quan = Date.now();
    desarDemos();
  };

  var despertar = function (url) {
    var reg = registre(url);
    if (reg.fase === "on" || reg.fase === "waking") return;
    reg.fase = "waking";
    reg.inici = Date.now();
    reg.intent += 1;
    var intent = reg.intent;

    // Con no-cors la petición sale igual aunque el servidor no deje leer la respuesta,
    // que es lo que despierta el servicio.
    window.fetch(url, { mode: "no-cors", cache: "no-store", credentials: "omit" })
      .then(function () {
        // Aunque llegue tarde, si ha contestado es que ya está en marcha.
        if (registre(url).fase !== "on") {
          dir("wake.live.ready", url);
          marcar(url, "on");
        }
      })
      .catch(function () {
        var ara = registre(url);
        if (ara.intent === intent && ara.fase === "waking") {
          dir("wake.live.fail", url);
          marcar(url, "fail");
        }
      });
  };

  var encendre = function () {
    var quantes = 0;
    adreces.forEach(function (url) {
      var fase = registre(url).fase;
      if (fase === "off" || fase === "fail") {
        despertar(url);
        quantes += 1;
      }
    });
    if (!quantes) return;
    if (panellViu) {
      panellViu.textContent = compte(idiomaActual, "wake.live.on", quantes);
    }
    refrescar();
  };

  var tic = function () {
    var ara = Date.now();
    adreces.forEach(function (url) {
      var reg = registre(url);
      if (reg.fase === "waking" && reg.inici && ara - reg.inici > TOPE) {
        // Se rinde y deja volver a intentarlo. Si la petición acaba contestando más
        // tarde, la tarjeta pasa sola a activa.
        dir("wake.live.fail", url);
        marcar(url, "fail");
      } else if (reg.fase === "on" && reg.quan && ara - reg.quan > CADUCA) {
        marcar(url, "off");
      }
    });
    refrescar();
  };

  // Mientras alguna despierta hace falta el segundero. El resto del tiempo basta con
  // mirar de vez en cuando si alguna ya se ha vuelto a dormir.
  var ritme = function () {
    var c = comptes();
    var vol = c.waking ? 1000 : (c.on ? 20000 : 0);
    if (vol === cadencia) return;
    if (rellotge) window.clearInterval(rellotge);
    rellotge = vol ? window.setInterval(tic, vol) : null;
    cadencia = vol;
  };

  var liniaEstat = function (li) {
    var linia = crear("p", "card__estat");
    comptadorLinies += 1;
    linia.id = "estat-demo-" + comptadorLinies;
    var punt = crear("span", "estat__punt");
    punt.setAttribute("aria-hidden", "true");
    linia.appendChild(punt);
    linia.appendChild(crear("span", "estat__nom"));
    linia.appendChild(crear("span", "estat__nota"));
    li.appendChild(linia);
    return linia;
  };

  var enllacDemo = function (url, idioma) {
    var a = crear("a", "btn btn--primary card__provar");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.appendChild(document.createTextNode(frase(idioma, "feed.try")));
    a.appendChild(icona("i-arrow"));
    a.addEventListener("click", function () {
      visita(url);
    });
    return a;
  };

  // El mismo botón de siempre, pero apagado, y la línea de estado de al lado dice por
  // qué lo está.
  // Mientras la demo no conteste, en su hueco está el botón de iniciarla, no el de
  // probarla: los dos nunca se ven a la vez, uno sustituye al otro.
  var botoIniciar = function (carnet, idioma) {
    var fase = registre(carnet.url).fase;
    var arrencant = fase === "waking";
    var boto = document.createElement("button");
    boto.type = "button";
    boto.className = "btn btn--primary card__iniciar" + (arrencant ? " is-bloquejat" : "");
    boto.setAttribute("aria-describedby", carnet.linia.id);
    boto.textContent = frase(idioma, arrencant
      ? "estat.waking"
      : (fase === "fail" ? "estat.again" : "demo.start"));

    if (arrencant) boto.setAttribute("aria-disabled", "true");

    boto.addEventListener("click", function () {
      if (registre(carnet.url).fase === "waking") return;
      dir("wake.live.starting", carnet.url);
      despertar(carnet.url);
      refrescar();
    });
    return boto;
  };

  // El título de la tarjeta abre la demo, pero solo cuando la demo contesta.
  var pintarTitol = function (carnet, obre) {
    carnet.titol.textContent = "";
    if (obre) {
      var enllac = crear("a");
      enllac.href = carnet.url;
      enllac.target = "_blank";
      enllac.rel = "noopener";
      enllac.textContent = carnet.nom;
      enllac.addEventListener("click", function () {
        visita(carnet.url);
      });
      carnet.titol.appendChild(enllac);
      carnet.li.classList.remove("card--fix");
    } else {
      carnet.titol.appendChild(document.createTextNode(carnet.nom));
      carnet.li.classList.add("card--fix");
    }
  };

  var pintarCarnet = function (carnet) {
    var idioma = idiomaActual;
    var reg = registre(carnet.url);
    var nom = frase(idioma, "estat." + reg.fase);

    if (reg.fase === "waking" && reg.inici) {
      nom += " · " + frase(idioma, "estat.secs")
        .replace("{s}", String(Math.round((Date.now() - reg.inici) / 1000)));
    }

    carnet.linia.className = "card__estat estat--" + reg.fase;
    carnet.nomEl.textContent = nom;
    carnet.notaEl.textContent = frase(idioma, "estat." + reg.fase + ".why");

    // Lo único que cambia cada segundo es el contador. El título y el botón solo se
    // rehacen cuando la demo cambia de estado, para no tirar abajo el foco de nadie.
    if (carnet.fase === reg.fase) return;
    var mode = reg.fase === "on" ? "on" : "off";
    var canviaTitol = carnet.fase === undefined || carnet.mode !== mode;
    carnet.fase = reg.fase;
    carnet.mode = mode;

    var teniaFoco = carnet.accio.contains(document.activeElement);

    if (canviaTitol) pintarTitol(carnet, mode === "on");

    carnet.accio.textContent = "";
    carnet.accio.appendChild(mode === "on"
      ? enllacDemo(carnet.url, idioma)
      : botoIniciar(carnet, idioma));

    if (teniaFoco && carnet.accio.firstChild) {
      try {
        carnet.accio.firstChild.focus();
      } catch (e) {
        // Si no se puede devolver el foco, el orden de tabulación no se ha movido.
      }
    }
  };

  var apuntarDemo = function (carnet) {
    carnet.nomEl = carnet.linia.querySelector(".estat__nom");
    carnet.notaEl = carnet.linia.querySelector(".estat__nota");
    titols[carnet.url] = carnet.nom;
    carnets.push(carnet);
    pintarCarnet(carnet);
  };

  var ferPanell = function () {
    panell = crear("div", "wake");

    var cos = crear("div", "wake__cos");
    panellTitol = crear("p", "wake__titol");
    panellText = crear("p", "wake__text");
    cos.appendChild(panellTitol);
    cos.appendChild(panellText);

    var costat = crear("div", "wake__costat");
    panellBoto = document.createElement("button");
    panellBoto.type = "button";
    panellBoto.className = "btn btn--primary wake__boto";
    panellPista = crear("p", "wake__pista");
    panellPista.id = "wake-pista";
    panellBoto.setAttribute("aria-describedby", "wake-pista");
    costat.appendChild(panellBoto);
    costat.appendChild(panellPista);

    // Los cambios de estado se cuentan aquí para quien no los ve.
    panellViu = crear("p", "nomes-lector");
    panellViu.setAttribute("role", "status");
    panellViu.setAttribute("aria-live", "polite");

    panellBoto.addEventListener("click", function () {
      if (panellBoto.getAttribute("aria-disabled") === "true") return;
      encendre();
    });

    panell.appendChild(cos);
    panell.appendChild(costat);
    panell.appendChild(panellViu);
    llista.parentNode.insertBefore(panell, llista);
  };

  var refrescar = function () {
    var idioma = idiomaActual;
    var c = comptes();

    if (panell) {
      panell.hidden = !c.total;
      panellTitol.textContent = frase(idioma, "wake.title");
      panellText.textContent = frase(idioma, "wake.text");

      var etiqueta, pista, apagat;
      if (c.waking) {
        etiqueta = compte(idioma, "wake.working", c.waking);
        pista = frase(idioma, "wake.hint.working").replace("{s}", String(c.segons));
        apagat = true;
      } else if (c.total && c.on === c.total) {
        etiqueta = frase(idioma, "wake.done");
        pista = frase(idioma, "wake.hint.done");
        apagat = true;
      } else if (c.fail) {
        etiqueta = compte(idioma, "wake.retry", c.off + c.fail);
        pista = frase(idioma, "wake.hint.some");
        apagat = false;
      } else {
        etiqueta = compte(idioma, "wake.on", c.off);
        pista = frase(idioma, "wake.hint");
        apagat = false;
      }

      panellBoto.textContent = etiqueta;
      panellPista.textContent = pista;
      panellBoto.setAttribute("aria-disabled", String(apagat));
      panellBoto.classList.toggle("is-bloquejat", apagat);

      if (c.total && c.on === c.total) {
        if (!totesLlestes) {
          totesLlestes = true;
          panellViu.textContent = frase(idioma, "wake.live.done");
        }
      } else {
        totesLlestes = false;
      }
    }

    carnets.forEach(pintarCarnet);
    ritme();
  };

  // Cada vez que se repinta la lista hay que volver a mirar qué demos han quedado en
  // pantalla. El estado de cada una no se pierde: va por dirección, no por tarjeta.
  var sincronitzarDemos = function () {
    var vistes = [];
    carnets.forEach(function (carnet) {
      if (vistes.indexOf(carnet.url) === -1) vistes.push(carnet.url);
    });
    adreces = vistes;
    if (!panell && adreces.length) ferPanell();
    refrescar();
  };

  if (hiHaFetch) recuperarDemos();

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
    // Con un solo proyecto la frase quedaría mal escrita, así que se deja la de siempre.
    if (!nota || !repos || repos.length < 2) return;
    nota.textContent = frase(idioma, "hero.count").replace("{n}", String(repos.length));
  };

  var pintar = function (idioma) {
    missatge(idioma);
    if (!llista || !repos) return;

    carnets = [];
    var caixa = document.createDocumentFragment();
    repos.forEach(function (repo, i) {
      caixa.appendChild(targeta(projecte(repo, idioma), idioma, i));
    });

    llista.textContent = "";
    llista.appendChild(caixa);
    estrena = false;
    comptar(idioma);
    sincronitzarDemos();
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
    if (esFora(repo.name)) return false;
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
        return repo && typeof repo.nom === "string" && esWeb(repo.url) && !esFora(repo.nom);
      });
      return bons.length ? ambForcats(bons) : null;
    } catch (e) {
      return null;
    }
  };

  // Último recurso: los proyectos que tenemos escritos aquí mismo. Sin fecha ni
  // lenguaje, pero con su enlace al código, que es lo que hay que poder abrir.
  var deCasa = function () {
    return Object.keys(CONEGUTS).map(function (nom) {
      return deFitxa(nom);
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
        var nets = ambForcats(dades.filter(serveix).map(netejar).sort(perData));
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

  var muntarProjectes = function () {
    llista = document.getElementById("llista-projectes");
    estat = document.getElementById("estat-projectes");
    estatText = estat ? estat.querySelector(".feed__text") : null;
    nota = document.querySelector('[data-i18n="hero.note"]');
    if (!llista) return;

    var guardats = desats();
    if (guardats) {
      // Con la copia de la última visita la sección se ve al momento, y la lista de
      // verdad la sustituye en cuanto llega si es que ha cambiado algo.
      repos = guardats;
      pintar(idiomaActual);
    } else {
      // Sin copia de la última visita se pintan los proyectos escritos aquí mismo. Así
      // las tarjetas salen desde el primer momento con su estado y su botón, en vez de
      // dejar enlaces vivos a demos dormidas hasta que conteste GitHub.
      avis = "feed.loading";
      repos = deCasa();
      carregant(true);
      pintar(idiomaActual);
    }
    oients.push(pintar);
    demanar();
  };

  /* ---------- Cabecera y navegación ---------- */

  var muntarCapcalera = function () {
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
  };

  /* ---------- Pantalla de acceso ---------- */

  // Quién puede entrar lo decide la API, no esta página: aquí no hay ninguna
  // contraseña, ni en claro ni cifrada. El navegador manda usuario y contraseña, y lo
  // que vuelve es un token y el rol.
  var API_ACCES = "https://portfolio-acceso.onrender.com";
  var CLAU_SESSIO = "portafoli-sessio";
  var ESPERA = 120000;   // el servidor duerme en un plan gratuito: hay que darle margen
  var AVIS_LENT = 5000;  // a partir de aquí se dice en voz alta que está arrancando

  var porta = document.getElementById("porta");
  var app = document.getElementById("app");
  var formulari = document.getElementById("porta-form");
  var campUsuari = document.getElementById("porta-usuari");
  var campClau = document.getElementById("porta-clau");
  var botoPorta = document.getElementById("porta-entrar");
  var avisPorta = document.getElementById("porta-avis");
  var pistaPorta = document.getElementById("porta-pista");
  var pistaText = pistaPorta ? pistaPorta.querySelector(".porta__pista-text") : null;

  var enviant = false;    // hay una petición de entrada en marcha
  var errorPorta = "";    // clave del último fallo, vacío si no hay ninguno
  var pistaClau = "";     // clave de la línea de debajo del botón
  var rellotgeLent = null;
  var sessioViva = false; // se está comprobando el token guardado

  var desarSessio = function (token, expira) {
    try {
      window.localStorage.setItem(CLAU_SESSIO, JSON.stringify({
        token: token,
        expira: Number(expira) || 0
      }));
    } catch (e) {
      // Ventana privada o almacenamiento bloqueado: la sesión dura lo que la pestaña.
    }
  };

  var oblidarSessio = function () {
    try {
      window.localStorage.removeItem(CLAU_SESSIO);
    } catch (e) {
      // Si no se puede borrar, el token caduca solo en el servidor.
    }
  };

  var sessioDesada = function () {
    try {
      var cru = window.localStorage.getItem(CLAU_SESSIO);
      if (!cru) return null;
      var dades = JSON.parse(cru);
      if (!dades || typeof dades.token !== "string" || !dades.token) return null;
      // Si ya sabemos que ha caducado, ni se pregunta.
      if (dades.expira && Date.now() > Number(dades.expira)) return null;
      return dades;
    } catch (e) {
      return null;
    }
  };

  // Una llamada a la API con su propio límite de tiempo, porque el servidor puede estar
  // dormido y tardar cerca de un minuto en despertar.
  var cridarAcces = function (cami, opcions) {
    var config = opcions || {};
    var control = window.AbortController ? new window.AbortController() : null;
    var perTemps = false;

    if (control) config.signal = control.signal;
    var limit = window.setTimeout(function () {
      perTemps = true;
      if (control) control.abort();
    }, ESPERA);

    return window.fetch(API_ACCES + cami, config).then(function (resposta) {
      window.clearTimeout(limit);
      return resposta;
    }, function (error) {
      window.clearTimeout(limit);
      throw perTemps ? new Error("temps") : error;
    });
  };

  var rolValid = function (valor) {
    return String(valor) === "admin" ? "admin" : "invitado";
  };

  var pintarPorta = function () {
    if (!porta || !botoPorta) return;
    var idioma = idiomaActual;
    var reintent = errorPorta === "net" || errorPorta === "time" || errorPorta === "server";

    botoPorta.textContent = frase(idioma, enviant
      ? "porta.sending"
      : (reintent ? "porta.retry" : "porta.enter"));
    botoPorta.setAttribute("aria-disabled", String(enviant));
    botoPorta.classList.toggle("is-bloquejat", enviant);

    if (errorPorta) {
      avisPorta.hidden = false;
      avisPorta.textContent = frase(idioma, "porta.err." + errorPorta);
    } else {
      avisPorta.hidden = true;
      avisPorta.textContent = "";
    }

    if (pistaClau) {
      pistaPorta.hidden = false;
      pistaText.textContent = frase(idioma, pistaClau);
    } else {
      pistaPorta.hidden = true;
      pistaText.textContent = "";
    }
  };

  var marcarCamps = function (malament) {
    [campUsuari, campClau].forEach(function (camp) {
      if (malament) {
        camp.setAttribute("aria-invalid", "true");
      } else {
        camp.removeAttribute("aria-invalid");
      }
    });
  };

  var pararRellotgeLent = function () {
    if (rellotgeLent) window.clearTimeout(rellotgeLent);
    rellotgeLent = null;
  };

  // El portafolio entra en escena. La pantalla de acceso se va del documento entera:
  // ya no hace falta y así no queda un formulario colgando detrás.
  var obrir = function (nouRol, animar) {
    rol = rolValid(nouRol);
    pararRellotgeLent();

    if (porta && porta.parentNode) porta.parentNode.removeChild(porta);
    porta = null;

    app.innerHTML = PLANTILLA;
    app.hidden = false;
    if (animar) app.className = "app--entra";

    aplicar(idiomaActual);
    muntarProjectes();
    muntarCapcalera();

    var boto = document.getElementById("sortir");
    if (boto) {
      boto.addEventListener("click", function () {
        oblidarSessio();
        // Recargar deja la página como recién abierta: sin listas, sin relojes y con la
        // pantalla de acceso delante. El idioma elegido se mantiene, que va aparte.
        window.location.replace(window.location.pathname + window.location.search);
      });
    }
  };

  var acabarEnviament = function (clau) {
    enviant = false;
    errorPorta = clau || "";
    pistaClau = "";
    pararRellotgeLent();
    formulari.removeAttribute("aria-busy");
    marcarCamps(!!clau);
    pintarPorta();
    if (clau) campClau.focus();
  };

  var enviar = function (event) {
    event.preventDefault();
    if (enviant) return;

    // Si había una comprobación del token guardado en marcha, manda lo que se escribe.
    sessioViva = false;

    var usuari = campUsuari.value.trim();
    var clau = campClau.value;

    if (!usuari || !clau) {
      acabarEnviament("empty");
      return;
    }

    enviant = true;
    errorPorta = "";
    pistaClau = "";
    formulari.setAttribute("aria-busy", "true");
    marcarCamps(false);
    pintarPorta();

    pararRellotgeLent();
    rellotgeLent = window.setTimeout(function () {
      if (!enviant) return;
      pistaClau = "porta.slow";
      pintarPorta();
    }, AVIS_LENT);

    cridarAcces("/api/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ usuario: usuari, contrasena: clau }),
      cache: "no-store",
      credentials: "omit"
    }).then(function (resposta) {
      if (resposta.status === 401) return { fallada: "creds" };
      if (!resposta.ok) return { fallada: "server" };
      return resposta.json().then(function (dades) {
        if (!dades || dades.ok !== true || typeof dades.token !== "string" || !dades.token) {
          return { fallada: "server" };
        }
        return { rol: dades.rol, token: dades.token, expira: dades.expira };
      }, function () {
        return { fallada: "server" };
      });
    }, function (error) {
      return { fallada: error && error.message === "temps" ? "time" : "net" };
    }).then(function (resultat) {
      if (resultat.fallada) {
        acabarEnviament(resultat.fallada);
        return;
      }
      desarSessio(resultat.token, resultat.expira);
      enviant = false;
      campClau.value = "";
      obrir(resultat.rol, true);
    });
  };

  // Al cargar, si hay un token guardado se le pregunta a la API si todavía vale. No se
  // bloquea el formulario mientras tanto: quien quiera entrar a mano puede hacerlo y
  // esta comprobación se deja de lado.
  var mirarSessio = function () {
    var desada = sessioDesada();
    if (!desada) return;

    sessioViva = true;
    pistaClau = "porta.checking";
    pintarPorta();

    rellotgeLent = window.setTimeout(function () {
      if (!sessioViva) return;
      pistaClau = "porta.slow";
      pintarPorta();
    }, AVIS_LENT);

    cridarAcces("/api/yo", {
      headers: { "Authorization": "Bearer " + desada.token, "Accept": "application/json" },
      cache: "no-store",
      credentials: "omit"
    }).then(function (resposta) {
      if (!sessioViva) return null;
      if (resposta.status === 401) {
        // El token ya no vale: se tira y se pide entrar otra vez.
        oblidarSessio();
        return null;
      }
      if (!resposta.ok) return null;
      return resposta.json().then(function (dades) {
        return dades && dades.ok === true ? dades : null;
      }, function () {
        return null;
      });
    }, function () {
      // Sin red o sin respuesta a tiempo se deja el token donde está: puede valer en la
      // próxima visita. Aquí solo se aparta el aviso y se deja entrar a mano.
      return null;
    }).then(function (dades) {
      if (!sessioViva) return;
      sessioViva = false;
      pararRellotgeLent();
      if (dades) {
        obrir(dades.rol, false);
        return;
      }
      pistaClau = "";
      pintarPorta();
    });
  };

  if (porta && formulari) {
    oients.push(pintarPorta);
    formulari.addEventListener("submit", enviar);

    // Al escribir se retira el aviso: el mensaje de antes ya no describe lo que hay.
    [campUsuari, campClau].forEach(function (camp) {
      camp.addEventListener("input", function () {
        if (!errorPorta) return;
        errorPorta = "";
        marcarCamps(false);
        pintarPorta();
      });
    });

    pintarPorta();
    // El usuario ya viene puesto, así que el foco va donde queda algo por escribir.
    try {
      campClau.focus({ preventScroll: true });
    } catch (e) {
      campClau.focus();
    }
    mirarSessio();
  }
})();
