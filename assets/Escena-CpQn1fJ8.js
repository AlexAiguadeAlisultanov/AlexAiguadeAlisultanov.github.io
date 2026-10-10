import{a as e,i as t,l as n,o as r}from"./idioma-BItQqvNc.js";import{S as i}from"./index-B5Y4VdyO.js";import{D as a,E as o,M as s,N as c,P as l,b as u,d,f,i as p,l as m,m as h,s as g,t as _,u as v,v as y}from"./three.module-DcdbW-uq.js";import{c as b,d as x,l as S,u as C}from"./Portafoli-C5ITZq7A.js";var w=n(r(),1),T=[[0,.36],[.1,.4],[.86,.4],[.94,.26],[1,.22]],E=[[0,[0,0,0,0,0,0,0,0]],[.1,[-.7,0,0,.15,.2,.22,.24,.26]],[.26,[-1.45,0,0,.3,.35,.4,.45,.5]],[.38,[-.6,-.45,-.45,.25,.55,1.6,1.75,1.9]],[.52,[-.7,-.6,-.6,.45,.85,2.1,2.3,2.5]],[.7,[-.35,-.25,-.25,-.1,0,.3,.6,1.2]],[.82,[-.3,-.25,-.25,-.1,0,.4,.95,2.3]],[.93,[0,0,0,0,0,0,0,0]]],D=[[0,[0,0,0,0,0,0,0,0]],[.1,[.06,.05,0,0,0,0,0,0]],[.26,[.12,.1,0,.04,0,0,0,0]],[.38,[.06,.05,0,.25,0,0,0,0]],[.52,[.06,.05,0,.5,0,0,0,0]],[.7,[.03,.03,0,.14,0,0,0,0]],[.82,[.03,.03,0,.1,0,0,0,0]],[.93,[0,0,0,0,0,0,0,0]]],ee=[[0,[1,1,1,1,.2,.3,.3,1]],[.08,[1,1,1,.16,.12,.12,.12,.16]],[.29,[1,1,1,.16,.12,.12,.12,.16]],[.33,[1,1,1,1,1,.12,.12,.16]],[.37,[.16,.16,.2,1,1,.12,.12,.16]],[.57,[.16,.16,.2,1,1,.12,.12,.16]],[.61,[.16,.16,.2,1,1,.7,1,1]],[.65,[.16,.16,.16,.18,.14,.7,1,1]],[.85,[.16,.16,.16,.18,.14,.7,1,1]],[.92,[1,1,1,1,.6,.6,.6,1]]],te=[[0,0],[.08,1],[.86,1],[.93,1.5],[1,.6]],ne=[[0,0],[.06,1],[.3,1],[.38,.25],[.86,.25],[.93,1],[1,1]],re=[[0,0],[.08,1],[.86,1],[.93,0]],ie=[[0,0],[.18,.15],[.46,.35],[.75,.55],[1,.65]],ae=[[0,0],[.18,-.1],[.46,-.16],[.75,-.12],[.93,0]],oe=[[0,1],[.18,.96],[.46,1.4],[.75,1.12],[.93,1]],se=[[0,0],[.18,-.55],[.46,1],[.75,1.6],[.93,0]],O={en:.93,histeresis:.03},k={desde:.95,hasta:1,valor:[1,.35]};function ce(e){let t=S(e);return t*t*t*(t*(t*6-15)+10)}function A(e,t){if(t<=e[0][0])return e[0][1];for(let n=1;n<e.length;n++){let[r,i]=e[n];if(t<=r){let[a,o]=e[n-1];return o+(i-o)*x(t,a,r)}}return e[e.length-1][1]}function j(e,t,n){let r=1;for(;r<e.length-1&&t>e[r][0];)r++;let[i,a]=e[r-1],[o,s]=e[r],c=x(t,i,o);for(let e=0;e<8;e++)n[e]=a[e]+(s[e]-a[e])*c}var le=e=>k.valor[0]+(k.valor[1]-k.valor[0])*x(e,k.desde,k.hasta),M=[{id:`bga`,capitol:`hw`,punt:[1.53,-1.53],grup:0,dir:[.73,-.73]},{id:`smd`,capitol:`hw`,punt:[1.78,-.6],grup:1,dir:[1,0]},{id:`sustrat`,capitol:`hw`,punt:[2.1,.5],grup:1},{id:`pistes`,capitol:`hw`,punt:[2.75,-1.05],grup:2},{id:`nuclis`,capitol:`sw`,punt:[.62,-.36],grup:3,dir:[.73,-.58]},{id:`cache`,capitol:`sw`,punt:[.7,0],grup:3},{id:`gpu`,capitol:`sw`,punt:[1.2,-.45],grup:3,dir:[1,0]},{id:`imc`,capitol:`sw`,punt:[.45,-.9],grup:3,dir:[0,-1]},{id:`metall`,capitol:`sw`,punt:[.85,-.62],grup:4,nivell:2.6},{id:`tapa`,capitol:`seg`,punt:[1.05,-1.5],grup:7},{id:`escut`,capitol:`seg`,punt:[.75,-1.1],grup:6},{id:`pasta`,capitol:`seg`,punt:[.6,-.62],grup:5}],ue={hw:[.06,.12,.26,.32],sw:[.36,.42,.54,.6],seg:[.64,.7,.82,.88]},N={es:{bga:`Bolas BGA`,smd:`Condensadores`,sustrat:`Sustrato`,pistes:`Pistas`,nuclis:`Núcleos`,cache:`Caché`,gpu:`Gráfica`,imc:`Controlador de memoria`,metall:`Capas de metal`,tapa:`Tapa IHS`,escut:`Escudo`,pasta:`Pasta térmica`},ca:{bga:`Boles BGA`,smd:`Condensadors`,sustrat:`Substrat`,pistes:`Pistes`,nuclis:`Nuclis`,cache:`Memòria cau`,gpu:`Gràfica`,imc:`Controlador de memòria`,metall:`Capes de metall`,tapa:`Tapa IHS`,escut:`Escut`,pasta:`Pasta tèrmica`},en:{bga:`BGA balls`,smd:`Capacitors`,sustrat:`Substrate`,pistes:`Traces`,nuclis:`Cores`,cache:`Cache`,gpu:`Graphics`,imc:`Memory controller`,metall:`Metal layers`,tapa:`IHS lid`,escut:`Shield`,pasta:`Thermal paste`}},P=e(),de=9.5,fe=-.98,pe=.62,me=2.1,F=.22,he=420,ge=11,_e=11;function ve(){let e=new g(.373,.776,.831);try{let e=getComputedStyle(document.documentElement).getPropertyValue(`--color-accent`).trim();if(e)return new g(e)}catch{}return e}function ye(e){let t=e;return()=>(t=t*1103515245+12345&2147483647,t/2147483647)}var I=`
  uniform float uSep;
  uniform float uNou;
  uniform float uCentre;
  uniform vec4 uAltA;
  uniform vec4 uAltB;
  uniform vec4 uObreA;
  uniform vec4 uObreB;
  uniform vec4 uPesA;
  uniform vec4 uPesB;
  attribute float aCapa;
  attribute float aGrup;
  attribute float aNivell;
  attribute vec2 aDir;
  attribute float aNou;
  varying float vPes;
  varying float vVis;
  vec3 despiece(vec3 p) {
    vec4 ohA = step(abs(vec4(0.0, 1.0, 2.0, 3.0) - aGrup), vec4(0.5));
    vec4 ohB = step(abs(vec4(4.0, 5.0, 6.0, 7.0) - aGrup), vec4(0.5));
    vPes = dot(uPesA, ohA) + dot(uPesB, ohB);
    vVis = mix(1.0, uNou, aNou);
    p.xy += aDir * (dot(uObreA, ohA) + dot(uObreB, ohB));
    p.z += aCapa * uSep + aNivell * (dot(uAltA, ohA) + dot(uAltB, ohB)) - uCentre;
    return p;
  }
`,be=`
  ${I}
  attribute float aT;
  attribute float aLlavor;
  attribute float aBase;
  attribute float aGuia;
  attribute float aFlux;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  void main() {
    vT = aT;
    vLlavor = aLlavor;
    vBase = aBase;
    vGuia = aGuia;
    vFlux = aFlux;
    vec3 p = despiece(position);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vProf = clamp((20.0 + mv.z) / 14.0, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`,xe=be.replace(`void main() {`,`attribute vec2 aDesp;
  uniform vec2 uPx;
  void main() {`).replace(`gl_Position = projectionMatrix * mv;`,`gl_Position = projectionMatrix * mv;
    gl_Position.xy += aDesp * uPx * gl_Position.w;`),Se=`
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform float uTemps;
  uniform float uForca;
  uniform float uSep;
  uniform float uRafaga;
  uniform float uFlux;
  uniform float uGuies;
  uniform float uBrill;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  varying float vPes;
  varying float vVis;
  void main() {
    float alfa = vBase * uForca * vProf * vPes;
    if (vGuia > 0.5) {
      // Guias de montaje: discontinuas y solo cuando el chip esta despiezado.
      if (fract(vT * 14.0) > 0.5) discard;
      alfa *= max(smoothstep(0.3, 0.9, uSep), uGuies);
    }
    float pols = 0.0;
    if (vLlavor >= 0.0) {
      float lloc = fract(uTemps * 0.11 + vLlavor);
      pols = smoothstep(0.05, 0.0, abs(vT - lloc));
      // Rafaga del clic: un frente que sale del chip hacia fuera por todas las pistas.
      pols = max(pols, smoothstep(0.08, 0.0, abs(vT - (1.0 - uRafaga) * 1.1)) * step(0.001, uRafaga));
      // Las pistas que solo llevan pulso en la pelicula dependen de uFlux.
      pols *= mix(1.0, uFlux, vFlux);
      // Las pistas se apagan hacia fuera, donde ya las recoge la placa del fondo.
      if (vFlux < 0.5) alfa *= (1.0 - vT) * (1.0 - vT);
    }
    // Lo que esta encendido brilla mas y tira hacia el blanco.
    float llum = smoothstep(0.75, 1.0, vPes) * uBrill;
    vec3 color = mix(mix(uColor, uPols, pols), uPols, 0.4 * min(llum, 1.0));
    gl_FragColor = vec4(color, (alfa * (1.0 + 0.9 * llum) + pols * uForca * 0.8 * vProf) * vVis);
  }
`,Ce=`
  uniform vec3 uPols;
  uniform float uForca;
  uniform float uBrill;
  uniform float uHalo;
  varying float vT;
  varying float vLlavor;
  varying float vBase;
  varying float vGuia;
  varying float vProf;
  varying float vFlux;
  varying float vPes;
  varying float vVis;
  void main() {
    if (vGuia > 0.5) discard;
    float alfa = vBase * uForca * vProf * smoothstep(0.75, 1.0, vPes) * uBrill * uHalo * vVis;
    if (vLlavor >= 0.0 && vFlux < 0.5) alfa *= (1.0 - vT) * (1.0 - vT);
    if (alfa < 0.002) discard;
    gl_FragColor = vec4(uPols, alfa);
  }
`,we=`
  ${I}
  uniform float uPunt;
  uniform float uBrill;
  attribute float aMida;
  attribute float aBase;
  varying float vBase;
  varying float vLlum;
  void main() {
    vBase = aBase;
    vec3 p = despiece(position);
    vLlum = smoothstep(0.75, 1.0, vPes) * uBrill;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPunt * aMida / max(-mv.z, 0.001) * (1.0 + 0.6 * vLlum);
  }
`,Te=`
  uniform vec3 uColor;
  uniform vec3 uPols;
  uniform float uForca;
  varying float vBase;
  varying float vPes;
  varying float vVis;
  varying float vLlum;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    vec3 color = mix(uColor, uPols, 0.4 * min(vLlum, 1.0));
    gl_FragColor = vec4(color, smoothstep(0.25, 0.04, d2) * vBase * uForca * vPes * (1.0 + 0.9 * vLlum) * vVis);
  }
`,L={bolas:{sep:-.9,z:-.06,grup:0},sustrato:{sep:0,z:0,grup:1},pistas:{sep:0,z:0,grup:2},silicio:{sep:.75,z:.07,grup:3},metal:{sep:.85,z:.085,grup:4},pasta:{sep:1.05,z:.11,grup:5},escudo:{sep:1.3,z:.13,grup:6},tapa:{sep:1.6,z:.16,grup:7}},R=2.1,z=1.7,B=1.25,V=1.55;function Ee(){let e=ye(20260928),t=ye(20261008),n={p:[],capa:[],grup:[],nivell:[],dir:[],nou:[],flux:[],t:[],llavor:[],base:[],guia:[]},r=(e,t,r,i,a,o,s,c)=>{n.p.push(e,t,r.z+(c.dz??0)),n.capa.push(r.sep),n.grup.push(r.grup),n.nivell.push(c.nivell??1),n.dir.push(c.dir?.[0]??0,c.dir?.[1]??0),n.nou.push(c.nou??0),n.flux.push(c.flux??0),n.t.push(i),n.llavor.push(a),n.base.push(o),n.guia.push(s)},i=(e,t,n,i,a,o,s,c=0,l=1,u=-1,d=0,f={},p=f)=>{r(e,t,n,c,u,s,d,f),r(i,a,o,l,u,s,d,p)},a=(e,t,n,r={})=>{for(let a=0;a<e.length;a++){let[o,s]=e[a],[c,l]=e[(a+1)%e.length];i(o,s,t,c,l,t,n,0,1,-1,0,r)}},o=(e,t,n,r,i,o,s={})=>a([[e-n/2,t-r/2],[e+n/2,t-r/2],[e+n/2,t+r/2],[e-n/2,t+r/2]],i,o,s),s=(e,t,n,r,i={})=>a([[-e+t*2,-e],[e-t,-e],[e,-e+t],[e,e-t],[e-t,e],[-e+t,e],[-e,e-t],[-e,-e+t*2]],n,r,i);s(R,.12,L.sustrato,.55),s(1.98,.1,L.sustrato,.18);for(let e=0;e<14;e++){let t=e/14*Math.PI*2,n=1.32+e%2*.12,r=Math.cos(t)*n*1.1,i=Math.sin(t)*n*.9,a=Math.abs(Math.cos(t))>.7;o(r,i,a?.09:.18,a?.18:.09,L.sustrato,.45,{dir:[Math.cos(t)*.6,Math.sin(t)*.6]})}o(0,0,z,B,L.silicio,.8);for(let e=0;e<2;e++)for(let t=0;t<4;t++){let n=-.61+t*.41,r=e===0?-.36:.36,i=[n/.85,r/.6];o(n,r,.34,.4,L.silicio,.5,{dir:i}),o(n,r+(e===0?-.06:.06),.18,.14,L.silicio,.35,{dir:i})}o(0,0,1.52,.2,L.silicio,.45);for(let e=0;e<7;e++){let t=-.63+e*.21;i(t,-.1,L.silicio,t,.1,L.silicio,.3)}s(V,.18,L.tapa,.7),s(1.4100000000000001,.14,L.tapa,.22),a([[-1.3,-1.1],[-1.1,-1.3],[-1.3,-1.3]],L.tapa,.6),s(2.0500000000000003,.1,L.bolas,.28);for(let[e,t]of[[-1,-1],[1,-1],[1,1],[-1,1]])i(e*1.8,t*1.8,L.bolas,e*1.45,t*1.45,L.tapa,.5,0,1,-1,1);let c=[];for(let n=0;n<4;n++)for(let r=0;r<ge;r++){let a=(r/10-.5)*(R*1.6),[o,s]=[[1,0],[0,1],[-1,0],[0,-1]][n],[l,u]=[-s,o],d=[],f=o*R+l*a,p=s*R+u*a;d.push([f,p]);let m=.35+e()*.9;f+=o*m,p+=s*m,d.push([f,p]);let h=Math.sign(a)*+(Math.abs(a)>.5),g=.6+e()*1.8;f+=(o+l*h)*g,p+=(s+u*h)*g,d.push([f,p]);let _=_e*(.55+e()*.45);f+=o*_,p+=s*_,d.push([f,p]);let v=0;for(let e=1;e<d.length;e++)v+=Math.hypot(d[e][0]-d[e-1][0],d[e][1]-d[e-1][1]);let y=e()<.45?e():-1,b=+(y<0),x=y<0?t():y,S=0;for(let e=1;e<d.length;e++){let t=Math.hypot(d[e][0]-d[e-1][0],d[e][1]-d[e-1][1]);i(d[e-1][0],d[e-1][1],L.pistas,d[e][0],d[e][1],L.pistas,.36,S/v,(S+t)/v,x,0,{flux:b}),S+=t}c.push(d[2][0],d[2][1],0)}let l={nou:1};for(let e=0;e<4;e++){let[n,r]=[[1,0],[0,1],[-1,0],[0,-1]][e];for(let e of[-1.2,-.6,0,.6,1.2]){let a=e+(t()-.5)*.12,s=n*1.78+r*a,c=r*1.78+n*a,u=n!==0,d=u?.1:.2,f=u?.2:.1,p={...l,dir:[n,r]};o(s,c,d,f,L.sustrato,.42,p),u?(i(s-d/2,c-.06,L.sustrato,s+d/2,c-.06,L.sustrato,.42,0,1,-1,0,p),i(s-d/2,c+.06,L.sustrato,s+d/2,c+.06,L.sustrato,.42,0,1,-1,0,p)):(i(s-.06,c-f/2,L.sustrato,s-.06,c+f/2,L.sustrato,.42,0,1,-1,0,p),i(s+.06,c-f/2,L.sustrato,s+.06,c+f/2,L.sustrato,.42,0,1,-1,0,p))}}let u={...l,dir:[0,-1]};o(0,-.885,1.2,.3,L.silicio,.65,u);for(let e=0;e<6;e++){let t=-.5+e*.2;i(t,-.98,L.silicio,t,-.79,L.silicio,.32,0,1,-1,0,u)}let h={...l,dir:[1,0]};o(1.2,0,.48,1.1,L.silicio,.65,h);for(let e=0;e<5;e++)for(let t=0;t<2;t++)o(1.09+t*.22,-.4+e*.2,.16,.13,L.silicio,.3,h);for(let e of[{nivell:1,dz:0,linies:9,vertical:!1},{nivell:1.8,dz:.008,linies:11,vertical:!0},{nivell:2.6,dz:.016,linies:5,vertical:!1}]){let t={...l,nivell:e.nivell,dz:e.dz};o(0,0,z,B,L.metal,.5,t);for(let n=0;n<e.linies;n++){let r=(n+1)/(e.linies+1);if(e.vertical){let e=-1.7/2+r*z;i(e,-.565,L.metal,e,B/2-.06,L.metal,.26,0,1,-1,0,t)}else{let e=-1.25/2+r*B;i(-.79,e,L.metal,z/2-.06,e,L.metal,.26,0,1,-1,0,t)}}}for(let[e,t]of[[-.6,-.4],[.2,-.4],[.7,.3],[-.3,.35],[.5,-.1],[-.75,.1]])i(e,t,L.metal,e,t,L.metal,.45,0,1,-1,1,{...l,nivell:1},{...l,nivell:2.6,dz:.016});let g=[],_=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=1+.07*Math.sin(3*t+1.3)+.05*Math.sin(5*t+.4);g.push([Math.cos(t)*.95*n,Math.sin(t)*.72*n]),_.push([Math.cos(t)*.62*n,Math.sin(t)*.46*n])}a(g,L.pasta,.5,l),a(_,L.pasta,.22,l);let v=.17,y=new Set,b=[];for(let e=-9;e<=9;e++)for(let t=-8;t<=8;t++){let n=e*v*1.5,r=t*v*Math.sqrt(3)+(e%2?v*Math.sqrt(3)/2:0);if(!(Math.abs(n)>1.22||Math.abs(r)>1.22))for(let e=0;e<6;e++){let t=e*Math.PI/3,i=(e+1)*Math.PI/3,a=n+v*Math.cos(t),o=r+v*Math.sin(t),s=n+v*Math.cos(i),c=r+v*Math.sin(i),l=[Math.round((a+s)*500),Math.round((o+c)*500)].join(`,`);y.has(l)||(y.add(l),b.push([a,o,s,c]))}}for(let[e,t,n,r]of b)i(e,t,L.escudo,n,r,L.escudo,.3,0,1,-1,0,l);let x=[];for(let e=0;e<=12;e++){let t=e/12;x.push([.42*Math.sin(t*Math.PI*.5)*(1-.15*t),.5-t*1.05])}a([[0,.58],...x,...x.slice(0,-1).reverse().map(([e,t])=>[-e,t])],L.escudo,.75,l);let S=[];for(let e=0;e<12;e++)S.push([.1*Math.cos(e/12*Math.PI*2),.1+.1*Math.sin(e/12*Math.PI*2)]);a(S,L.escudo,.75,l),i(0,0,L.escudo,0,-.22,L.escudo,.75,0,1,-1,0,l),o(.25,.35,.9,.42,L.tapa,.3,l);for(let e=0;e<3;e++)i(-.1,.24+e*.11,L.tapa,.6-e*.12,.24+e*.11,L.tapa,.3,0,1,-1,0,l);for(let[e,t]of[[-1,-1],[1,-1],[1,1],[-1,1]])i(e*1.8,t*1.8,L.bolas,e*1.8,t*1.8,L.sustrato,.45,0,1,-1,1,l),i(z/2*e,B/2*t,L.sustrato,z/2*e,B/2*t,L.silicio,.45,0,1,-1,1,l),i(z/2*e,B/2*t,L.silicio,z/2*e,B/2*t,L.metal,.4,0,1,-1,1,l,{...l,nivell:2.6,dz:.016}),i(e*1.2,t*1.2,L.escudo,e*1.2,t*1.2,L.tapa,.4,0,1,-1,1,l);let C=new p;C.setAttribute(`position`,new m(n.p,3)),C.setAttribute(`aCapa`,new m(n.capa,1)),C.setAttribute(`aGrup`,new m(n.grup,1)),C.setAttribute(`aNivell`,new m(n.nivell,1)),C.setAttribute(`aDir`,new m(n.dir,2)),C.setAttribute(`aNou`,new m(n.nou,1)),C.setAttribute(`aFlux`,new m(n.flux,1)),C.setAttribute(`aT`,new m(n.t,1)),C.setAttribute(`aLlavor`,new m(n.llavor,1)),C.setAttribute(`aBase`,new m(n.base,1)),C.setAttribute(`aGuia`,new m(n.guia,1));let w={p:[],capa:[],grup:[],nivell:[],dir:[],nou:[],mida:[],base:[]},T=(e,t,n,r,i,a={})=>{w.p.push(e,t,n.z),w.capa.push(n.sep),w.grup.push(n.grup),w.nivell.push(a.nivell??1),w.dir.push(a.dir?.[0]??0,a.dir?.[1]??0),w.nou.push(a.nou??0),w.mida.push(r),w.base.push(i)};for(let e=0;e<15;e++)for(let t=0;t<15;t++){let n=(e/14-.5)*(R*1.7),r=(t/14-.5)*(R*1.7);Math.abs(n)<.55&&Math.abs(r)<.55||(T(n,r,L.bolas,1,.55,{dir:[n/R,r/R]}),T(n,r,L.sustrato,.6,.35,l))}for(let e=0;e<c.length;e+=3)T(c[e],c[e+1],L.pistas,1.5,.5);for(let e=0;e<46;e++){let e=t()*Math.PI*2,n=Math.sqrt(t())*.85;T(Math.cos(e)*n*.95,Math.sin(e)*n*.72,L.pasta,.7,.4,l)}let E=new p;E.setAttribute(`position`,new m(w.p,3)),E.setAttribute(`aCapa`,new m(w.capa,1)),E.setAttribute(`aGrup`,new m(w.grup,1)),E.setAttribute(`aNivell`,new m(w.nivell,1)),E.setAttribute(`aDir`,new m(w.dir,2)),E.setAttribute(`aNou`,new m(w.nou,1)),E.setAttribute(`aMida`,new m(w.mida,1)),E.setAttribute(`aBase`,new m(w.base,1));let D=new f;for(let e of Object.keys(C.attributes))D.setAttribute(e,C.getAttribute(e));let ee=[];for(let e=0;e<8;e++){let t=e/8*Math.PI*2+e%2*.2,n=e%2?2.4:1.2;ee.push(Math.cos(t)*n,Math.sin(t)*n)}return D.setAttribute(`aDesp`,new d(new Float32Array(ee),2)),D.instanceCount=8,{linies:C,punts:E,halo:D}}function De(e,t,n,r=34){let i=2*Math.sqrt(r)*.82;e.vel+=((t-e.valor)*r-e.vel*i)*n,e.valor+=e.vel*n}var H=`radial-gradient(ellipse 62% 90% at var(--mx, 78%) var(--my, 48%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)`,Oe=`radial-gradient(ellipse var(--rx, 62%) var(--ry, 90%) at var(--mx, 50%) var(--my, 50%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)`,ke={position:`absolute`,top:0,left:0,opacity:0,whiteSpace:`nowrap`,fontSize:12,fontWeight:500,lineHeight:`16px`,letterSpacing:`0.14em`,textTransform:`uppercase`,color:`#8CD9E4`,textShadow:`0 0 10px #0C0C0C, 0 0 3px #0C0C0C`,willChange:`transform, opacity`};function Ae({onFalla:e,ancla:n,sortida:r,progres:d}){let f=i(),{idioma:p}=t(),m=(0,w.useRef)(null),S=(0,w.useRef)(null);(0,w.useEffect)(()=>{let t=m.current;if(!t)return;let i;try{i=new _({canvas:t,alpha:!0,antialias:!0,powerPreference:`low-power`})}catch{e();return}i.debug.onShaderError=()=>e();let p=()=>Math.min(window.devicePixelRatio||1,1.5);i.setPixelRatio(p()),i.setClearAlpha(0);let w=ve(),k={uTemps:{value:0},uForca:{value:1},uSep:{value:F},uRafaga:{value:0},uColor:{value:w},uPols:{value:w.clone().lerp(new g(1,1,1),.6)},uPunt:{value:26*p()},uAltA:{value:new l(0,0,0,0)},uAltB:{value:new l(0,0,0,0)},uObreA:{value:new l(0,0,0,0)},uObreB:{value:new l(0,0,0,0)},uPesA:{value:new l(1,1,1,1)},uPesB:{value:new l(1,1,1,1)},uNou:{value:0},uCentre:{value:0},uFlux:{value:0},uGuies:{value:0},uBrill:{value:0},uHalo:{value:.16},uPx:{value:new s(0,0)}},N=Ee(),P={uniforms:k,transparent:!0,depthTest:!1,depthWrite:!1,blending:2},ge=new a({...P,vertexShader:be,fragmentShader:Se}),_e=new a({...P,vertexShader:we,fragmentShader:Te}),ye=new a({...P,vertexShader:xe,fragmentShader:Ce}),I=new o,R=new v,z=new v,B=new h(N.halo,ye);B.visible=!!d,B.frustumCulled=!1,z.add(B),z.add(new h(N.linies,ge)),z.add(new u(N.punts,_e)),z.rotation.set(fe,0,pe),R.add(z),I.add(R);let V=new y(40,1,.1,60);V.position.set(0,0,de);let H=()=>{let e=t.getBoundingClientRect(),n=Math.max(1,Math.round(e.width)),r=Math.max(1,Math.round(e.height));V.aspect=n/r,V.updateProjectionMatrix(),i.setSize(n,r,!1),k.uPx.value.set(2/n,2/r),Re()},Oe=t.closest(`section`)?.querySelector(`img`),ke=()=>n?.current??Oe,Ae=``,je=``,Me=``,Ne=``,Pe=-1,Fe=1,Ie=(e,n)=>{e!==Ae&&t.style.setProperty(`--mx`,Ae=e),n!==je&&t.style.setProperty(`--my`,je=n)},Le=(e,n)=>{let i=r?r.get():1;Pe=i;let a=ce(i),o=C(window.innerWidth),s=e.left+e.width*o.ancla,c=e.top+e.height*b.ancla[1],l=Math.max(1,Math.min(b.lado.svh*window.innerHeight,o.vw*window.innerWidth)),u=s,d=c,f=l,p=ke()?.getBoundingClientRect();p&&p.width>0&&(u=p.left+p.width/2,d=p.top+p.height/2+window.scrollY,f=p.width*me);let m=u+(s-u)*a,h=d+(c-d)*a,g=Math.exp(Math.log(f)+(Math.log(l)-Math.log(f))*a),_=m-(e.left+e.width/2),v=h-(e.top+e.height/2);R.position.set(_*n,-v*n,0),Fe=g*n/2.1/2,z.scale.setScalar(Fe),Ie(`${((m-e.left)/e.width*100).toFixed(1)}%`,`${((h-e.top)/e.height*100).toFixed(1)}%`);let{desde:y,hasta:x}=b.mascara,S=`${(y[0]+(x[0]-y[0])*a).toFixed(1)}%`,w=`${(y[1]+(x[1]-y[1])*a).toFixed(1)}%`;S!==Me&&t.style.setProperty(`--rx`,Me=S),w!==Ne&&t.style.setProperty(`--ry`,Ne=w)},Re=()=>{let e=t.getBoundingClientRect(),n=2*Math.tan(V.fov*Math.PI/360)*de/Math.max(1,e.height);if(d){Le(e,n);return}let r=ke()?.getBoundingClientRect();if(!r||r.width===0){R.position.set(2.2,0,0);return}let i=r.left+r.width/2-(e.left+e.width/2),a=r.top+r.height/2-(e.top+e.height/2);R.position.set(i*n,-a*n,0),z.scale.setScalar(r.width*n*me/2.1/2),Ie(`${((e.width/2+i)/e.width*100).toFixed(1)}%`,`${((e.height/2+a)/e.height*100).toFixed(1)}%`)},ze=()=>{N.linies.dispose(),N.punts.dispose(),N.halo.dispose(),ge.dispose(),_e.dispose(),ye.dispose(),i.dispose()};try{H()}catch{ze(),e();return}if(f){k.uSep.value=.6,i.render(I,V);let e=()=>{H(),i.render(I,V)};return window.addEventListener(`resize`,e),()=>{window.removeEventListener(`resize`,e),ze()}}let Be={valor:0,vel:0},Ve={valor:0,vel:0},He={valor:F,vel:0},Ue={valor:0,vel:0},We=0,Ge=0,Ke=F,qe=0,U=0,Je=new c,Ye=0,Xe=0,Ze=!1,Qe=1,$e=1,et=d?d.get():0,tt=et<O.en,W=[0,0,0,0,0,0,0,0],G=[0,0,0,0,0,0,0,0],nt=[0,0,0,0,0,0,0,0],K=[1,1,1,1,1,1,1,1];d&&j(ee,d.get(),K);let rt=0,it=0,at=1,ot=e=>{if(!d)return;let t=r?r.get():1,n=d.get(),i=t>=1,a=x(t,0,b.puntero),o=0;if(Ze&&a<1){let e=yt(),t=Math.max(0,1-Math.hypot(Ye-e.x,Xe-e.y)/he);o=t*t*.78*(1-a)}let s=i?A(T,n):F+(T[0][1]-F)*ce(t);Ke=Math.min(1,s+o),Qe=1-(1-b.inclinacion)*a,$e=le(n),j(E,n,W),j(D,n,G),j(ee,n,nt);let c=1-Math.exp(-3e3*e/120);for(let e=0;e<8;e++)K[e]+=(nt[e]-K[e])*c;k.uAltA.value.set(W[0],W[1],W[2],W[3]),k.uAltB.value.set(W[4],W[5],W[6],W[7]),k.uObreA.value.set(G[0],G[1],G[2],G[3]),k.uObreB.value.set(G[4],G[5],G[6],G[7]),k.uPesA.value.set(K[0],K[1],K[2],K[3]),k.uPesB.value.set(K[4],K[5],K[6],K[7]),k.uNou.value=x(t,.15,.85),k.uBrill.value=A(te,n),k.uFlux.value=A(ne,n),k.uGuies.value=A(re,n),k.uCentre.value=A(se,n),rt=A(ie,n),it=A(ae,n),at=A(oe,n),tt&&et<O.en&&n>=O.en?(U=1,tt=!1):!tt&&n<O.en-O.histeresis&&(tt=!0),et=n},q=S.current,st=q?[...q.querySelectorAll(`g[data-rotol]`)]:[],ct=q?[...q.querySelectorAll(`span[data-rotol]`)]:[],lt=Object.values(L),ut=new c,J=[],dt=M.map(()=>-1),ft=()=>{if(!d||!q||!st.length)return;let e=d.get(),n=t.getBoundingClientRect(),r=n.width,i=n.height;J.length=0;for(let t=0;t<M.length;t++){let n=M[t],[a,o,s,c]=ue[n.capitol],l=x(e,a,o)*(1-x(e,s,c));if(l<.01){dt[t]!==0&&(dt[t]=0,st[t].setAttribute(`opacity`,`0`),ct[t].style.opacity=`0`);continue}let u=lt[n.grup],d=n.dir??[0,0],f=n.nivell??1;ut.set(n.punt[0]+d[0]*G[n.grup],n.punt[1]+d[1]*G[n.grup],u.z+u.sep*k.uSep.value+f*W[n.grup]-k.uCentre.value),ut.applyMatrix4(z.matrixWorld).project(V),J.push({i:t,ax:(ut.x+1)/2*r,ay:(1-ut.y)/2*i,o:l,ty:0,w:ct[t].offsetWidth})}if(!J.length)return;let a=Math.max(24,Math.min(112,.034*window.innerWidth)),o=i-150;J.sort((e,t)=>e.ay-t.ay);let s=-1/0;for(let e of J)e.ty=Math.max(e.ay,s+30,72),s=e.ty;let c=J[J.length-1].ty-o;if(c>0)for(let e of J)e.ty=Math.max(72,e.ty-c);for(let e of J){let t=r-a-e.w,n=Math.min(t-28,Math.max(e.ax+16,t-120)),i=st[e.i];i.setAttribute(`opacity`,e.o.toFixed(3)),i.firstElementChild?.setAttribute(`d`,`M${e.ax.toFixed(1)} ${e.ay.toFixed(1)}H${n.toFixed(1)}L${(t-8).toFixed(1)} ${e.ty.toFixed(1)}`);let[o,s]=[i.children[1],i.children[2]];o.setAttribute(`cx`,e.ax.toFixed(1)),o.setAttribute(`cy`,e.ay.toFixed(1)),s.setAttribute(`cx`,e.ax.toFixed(1)),s.setAttribute(`cy`,e.ay.toFixed(1));let c=ct[e.i];c.style.transform=`translate(${t.toFixed(1)}px, ${(e.ty-8).toFixed(1)}px)`,c.style.opacity=e.o.toFixed(3),dt[e.i]=e.o}},Y=0,pt=0,X=0,Z=!0,mt=16.7,Q=0,ht=!1,gt=e=>{let t=pt?(e-pt)/1e3:1/60;if(pt=e,(!(t>0)||t>.25)&&(t=1/60),mt+=(t*1e3-mt)*.05,Q+=1,!ht&&Q>120&&mt>26&&(ht=!0,i.setPixelRatio(1),k.uPunt.value=26,H()),X+=t,ot(t),De(Be,We*Qe,t),De(Ve,Ge*Qe,t),De(He,Ke,t,18),De(Ue,qe,t,22),U=Math.max(0,U-t*.9),k.uTemps.value=X,k.uSep.value=Math.max(0,He.valor+Math.sin(X*.8)*.04),k.uRafaga.value=U,k.uForca.value=d?$e:1-Ue.valor*.6,R.rotation.y=Be.valor*.5+Math.sin(X*.13)*.08,R.rotation.x=Ve.valor*.35,z.rotation.z=pe+Math.sin(X*.09)*.05+rt,V.position.z=de+Ue.valor*3,d){let e=r?r.get():1;(e<1||e!==Pe||Q%10==0)&&Re(),z.rotation.x=fe+it,z.scale.setScalar(Fe*at)}else Q%10==0&&Re();i.render(I,V),ft()},$=()=>{Y&&window.cancelAnimationFrame(Y),Y=0},_t=t=>{Y=0;try{gt(t)}catch{$(),Z=!1,e();return}Z&&!document.hidden&&(Y=window.requestAnimationFrame(_t))},vt=()=>{Y||!Z||document.hidden||(pt=0,Y=window.requestAnimationFrame(_t))},yt=()=>{let e=t.getBoundingClientRect();return R.getWorldPosition(Je),Je.project(V),{x:e.left+(Je.x+1)/2*e.width,y:e.top+(1-Je.y)/2*e.height}},bt=e=>{if(We=e.clientX/window.innerWidth-.5,Ge=e.clientY/window.innerHeight-.5,d){Ye=e.clientX,Xe=e.clientY,Ze=!0;return}let t=yt(),n=Math.hypot(e.clientX-t.x,e.clientY-t.y),r=Math.max(0,1-n/he);Ke=F+r*r*.78},xt=d?ke()?.closest(`section`)??t:t,St=e=>{let t=xt.getBoundingClientRect();e.clientY<t.top||e.clientY>t.bottom||(U=1,He.vel+=2.5)},Ct=e=>{e.relatedTarget||(d?Ze=!1:Ke=F)},wt=()=>{d||(qe=Math.min(1,Math.max(0,window.scrollY/Math.max(1,window.innerHeight))))},Tt=()=>{H(),wt()},Et=new IntersectionObserver(([e])=>{Z=e.isIntersecting,Z?vt():$()},{threshold:0});Et.observe(t);let Dt=()=>document.hidden?$():vt(),Ot=t=>{t.preventDefault(),$(),e()};return window.addEventListener(`pointermove`,bt,{passive:!0}),window.addEventListener(`pointerdown`,St,{passive:!0}),window.addEventListener(`mouseout`,Ct),window.addEventListener(`scroll`,wt,{passive:!0}),window.addEventListener(`resize`,Tt),document.addEventListener(`visibilitychange`,Dt),t.addEventListener(`webglcontextlost`,Ot),wt(),vt(),()=>{$(),Et.disconnect(),window.removeEventListener(`pointermove`,bt),window.removeEventListener(`pointerdown`,St),window.removeEventListener(`mouseout`,Ct),window.removeEventListener(`scroll`,wt),window.removeEventListener(`resize`,Tt),document.removeEventListener(`visibilitychange`,Dt),t.removeEventListener(`webglcontextlost`,Ot),ze()}},[f,e,n,r,d]);let k=d?Oe:H,ge=N[p];return(0,P.jsxs)(P.Fragment,{children:[(0,P.jsx)(`canvas`,{ref:m,"aria-hidden":!0,className:`pointer-events-none size-full`,style:{maskImage:k,WebkitMaskImage:k}}),d?(0,P.jsxs)(`div`,{ref:S,"aria-hidden":!0,className:`pointer-events-none absolute inset-0 overflow-hidden`,children:[(0,P.jsx)(`svg`,{className:`absolute inset-0 size-full`,fill:`none`,children:M.map(e=>(0,P.jsxs)(`g`,{"data-rotol":e.id,opacity:0,children:[(0,P.jsx)(`path`,{stroke:`rgba(95,198,212,.55)`,strokeWidth:1}),(0,P.jsx)(`circle`,{r:7,stroke:`rgba(95,198,212,.45)`,strokeWidth:1}),(0,P.jsx)(`circle`,{r:2.5,fill:`#8CD9E4`})]},e.id))}),M.map(e=>(0,P.jsx)(`span`,{"data-rotol":e.id,style:ke,children:ge[e.id]},e.id))]}):null]})}export{Ae as default};