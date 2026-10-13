import{c as e,l as t,p as n,t as r,u as i}from"./use-reduced-motion-Bg0kmBuu.js";import{D as a,F as o,I as s,L as c,O as l,d as u,f as d,i as f,l as p,m,s as h,t as g,u as _,x as v,y}from"./three.module-DUcbiZkM.js";import{d as ee,f as b,l as x,u as S}from"./Portafoli-BrfoQtAI.js";var C=n(i(),1),w=[[0,.36],[.1,.4],[.86,.4],[.94,.26],[1,.22]],T=[[0,[0,0,0,0,0,0,0,0]],[.1,[-.7,0,0,.15,.2,.22,.24,.26]],[.26,[-1.45,0,0,.3,.35,.4,.45,.5]],[.38,[-.6,-.45,-.45,.25,.55,1.6,1.75,1.9]],[.52,[-.7,-.6,-.6,.45,.85,2.1,2.3,2.5]],[.7,[-.35,-.25,-.25,-.1,0,.3,.6,1.2]],[.82,[-.3,-.25,-.25,-.1,0,.4,.95,2.3]],[.93,[0,0,0,0,0,0,0,0]]],E=[[0,[0,0,0,0,0,0,0,0]],[.1,[.06,.05,0,0,0,0,0,0]],[.26,[.12,.1,0,.04,0,0,0,0]],[.38,[.06,.05,0,.25,0,0,0,0]],[.52,[.06,.05,0,.5,0,0,0,0]],[.7,[.03,.03,0,.14,0,0,0,0]],[.82,[.03,.03,0,.1,0,0,0,0]],[.93,[0,0,0,0,0,0,0,0]]],te=[[0,[1,1,1,1,.2,.3,.3,1]],[.08,[1,1,1,.16,.12,.12,.12,.16]],[.29,[1,1,1,.16,.12,.12,.12,.16]],[.33,[1,1,1,1,1,.12,.12,.16]],[.37,[.16,.16,.2,1,1,.12,.12,.16]],[.57,[.16,.16,.2,1,1,.12,.12,.16]],[.61,[.16,.16,.2,1,1,.7,1,1]],[.65,[.16,.16,.16,.18,.14,.7,1,1]],[.85,[.16,.16,.16,.18,.14,.7,1,1]],[.92,[1,1,1,1,.6,.6,.6,1]]],ne=[[0,0],[.08,1],[.86,1],[.93,1.5],[1,.6]],re=[[0,0],[.06,1],[.3,1],[.38,.25],[.86,.25],[.93,1],[1,1]],ie=[[0,0],[.08,1],[.86,1],[.93,0]],ae=[[0,0],[.18,.15],[.46,.35],[.75,.55],[1,.65]],oe=[[0,0],[.18,-.1],[.46,-.16],[.75,-.12],[.93,0]],se=[[0,1],[.18,.96],[.46,1.4],[.75,1.12],[.93,1]],ce=[[0,0],[.18,-.55],[.46,1],[.75,1.6],[.93,0]],D={en:.93,histeresis:.03},O={desde:.95,hasta:1,valor:[1,.35]};function le(e){let t=S(e);return t*t*t*(t*(t*6-15)+10)}function k(e,t){if(t<=e[0][0])return e[0][1];for(let n=1;n<e.length;n++){let[r,i]=e[n];if(t<=r){let[a,o]=e[n-1];return o+(i-o)*b(t,a,r)}}return e[e.length-1][1]}function ue(e,t,n){let r=1;for(;r<e.length-1&&t>e[r][0];)r++;let[i,a]=e[r-1],[o,s]=e[r],c=b(t,i,o);for(let e=0;e<8;e++)n[e]=a[e]+(s[e]-a[e])*c}var de=e=>O.valor[0]+(O.valor[1]-O.valor[0])*b(e,O.desde,O.hasta),A=[{id:`bga`,capitol:`hw`,punt:[1.53,-1.53],grup:0,dir:[.73,-.73]},{id:`smd`,capitol:`hw`,punt:[1.78,-.6],grup:1,dir:[1,0]},{id:`sustrat`,capitol:`hw`,punt:[2.1,.5],grup:1},{id:`pistes`,capitol:`hw`,punt:[2.75,-1.05],grup:2},{id:`nuclis`,capitol:`sw`,punt:[.62,-.36],grup:3,dir:[.73,-.58]},{id:`cache`,capitol:`sw`,punt:[.7,0],grup:3},{id:`gpu`,capitol:`sw`,punt:[1.2,-.45],grup:3,dir:[1,0]},{id:`imc`,capitol:`sw`,punt:[.45,-.9],grup:3,dir:[0,-1]},{id:`metall`,capitol:`sw`,punt:[.85,-.62],grup:4,nivell:2.6},{id:`tapa`,capitol:`seg`,punt:[1.05,-1.5],grup:7},{id:`escut`,capitol:`seg`,punt:[.75,-1.1],grup:6},{id:`pasta`,capitol:`seg`,punt:[.6,-.62],grup:5}],fe={hw:[.06,.12,.26,.32],sw:[.36,.42,.54,.6],seg:[.64,.7,.82,.88]},j={es:{bga:`Bolas BGA`,smd:`Condensadores`,sustrat:`Sustrato`,pistes:`Pistas`,nuclis:`Núcleos`,cache:`Caché`,gpu:`Gráfica`,imc:`Controlador de memoria`,metall:`Capas de metal`,tapa:`Tapa IHS`,escut:`Escudo`,pasta:`Pasta térmica`},ca:{bga:`Boles BGA`,smd:`Condensadors`,sustrat:`Substrat`,pistes:`Pistes`,nuclis:`Nuclis`,cache:`Memòria cau`,gpu:`Gràfica`,imc:`Controlador de memòria`,metall:`Capes de metall`,tapa:`Tapa IHS`,escut:`Escut`,pasta:`Pasta tèrmica`},en:{bga:`BGA balls`,smd:`Capacitors`,sustrat:`Substrate`,pistes:`Traces`,nuclis:`Cores`,cache:`Cache`,gpu:`Graphics`,imc:`Memory controller`,metall:`Metal layers`,tapa:`IHS lid`,escut:`Shield`,pasta:`Thermal paste`}},M=t(),pe=9.5,me=-.98,he=.62,ge=2.1,N=.22,_e=420,P=11,ve=11;function ye(){let e=new h(.373,.776,.831);try{let e=getComputedStyle(document.documentElement).getPropertyValue(`--color-accent`).trim();if(e)return new h(e)}catch{}return e}function F(e){let t=e;return()=>(t=t*1103515245+12345&2147483647,t/2147483647)}var be=`
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
`,xe=`
  ${be}
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
`,Se=xe.replace(`void main() {`,`attribute vec2 aDesp;
  uniform vec2 uPx;
  void main() {`).replace(`gl_Position = projectionMatrix * mv;`,`gl_Position = projectionMatrix * mv;
    gl_Position.xy += aDesp * uPx * gl_Position.w;`),Ce=`
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
`,we=`
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
`,Te=`
  ${be}
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
`,Ee=`
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
`,I={bolas:{sep:-.9,z:-.06,grup:0},sustrato:{sep:0,z:0,grup:1},pistas:{sep:0,z:0,grup:2},silicio:{sep:.75,z:.07,grup:3},metal:{sep:.85,z:.085,grup:4},pasta:{sep:1.05,z:.11,grup:5},escudo:{sep:1.3,z:.13,grup:6},tapa:{sep:1.6,z:.16,grup:7}},L=2.1,R=1.7,z=1.25,De=1.55;function Oe(){let e=F(20260928),t=F(20261008),n={p:[],capa:[],grup:[],nivell:[],dir:[],nou:[],flux:[],t:[],llavor:[],base:[],guia:[]},r=(e,t,r,i,a,o,s,c)=>{n.p.push(e,t,r.z+(c.dz??0)),n.capa.push(r.sep),n.grup.push(r.grup),n.nivell.push(c.nivell??1),n.dir.push(c.dir?.[0]??0,c.dir?.[1]??0),n.nou.push(c.nou??0),n.flux.push(c.flux??0),n.t.push(i),n.llavor.push(a),n.base.push(o),n.guia.push(s)},i=(e,t,n,i,a,o,s,c=0,l=1,u=-1,d=0,f={},p=f)=>{r(e,t,n,c,u,s,d,f),r(i,a,o,l,u,s,d,p)},a=(e,t,n,r={})=>{for(let a=0;a<e.length;a++){let[o,s]=e[a],[c,l]=e[(a+1)%e.length];i(o,s,t,c,l,t,n,0,1,-1,0,r)}},o=(e,t,n,r,i,o,s={})=>a([[e-n/2,t-r/2],[e+n/2,t-r/2],[e+n/2,t+r/2],[e-n/2,t+r/2]],i,o,s),s=(e,t,n,r,i={})=>a([[-e+t*2,-e],[e-t,-e],[e,-e+t],[e,e-t],[e-t,e],[-e+t,e],[-e,e-t],[-e,-e+t*2]],n,r,i);s(L,.12,I.sustrato,.55),s(1.98,.1,I.sustrato,.18);for(let e=0;e<14;e++){let t=e/14*Math.PI*2,n=1.32+e%2*.12,r=Math.cos(t)*n*1.1,i=Math.sin(t)*n*.9,a=Math.abs(Math.cos(t))>.7;o(r,i,a?.09:.18,a?.18:.09,I.sustrato,.45,{dir:[Math.cos(t)*.6,Math.sin(t)*.6]})}o(0,0,R,z,I.silicio,.8);for(let e=0;e<2;e++)for(let t=0;t<4;t++){let n=-.61+t*.41,r=e===0?-.36:.36,i=[n/.85,r/.6];o(n,r,.34,.4,I.silicio,.5,{dir:i}),o(n,r+(e===0?-.06:.06),.18,.14,I.silicio,.35,{dir:i})}o(0,0,1.52,.2,I.silicio,.45);for(let e=0;e<7;e++){let t=-.63+e*.21;i(t,-.1,I.silicio,t,.1,I.silicio,.3)}s(De,.18,I.tapa,.7),s(1.4100000000000001,.14,I.tapa,.22),a([[-1.3,-1.1],[-1.1,-1.3],[-1.3,-1.3]],I.tapa,.6),s(2.0500000000000003,.1,I.bolas,.28);for(let[e,t]of[[-1,-1],[1,-1],[1,1],[-1,1]])i(e*1.8,t*1.8,I.bolas,e*1.45,t*1.45,I.tapa,.5,0,1,-1,1);let c=[];for(let n=0;n<4;n++)for(let r=0;r<P;r++){let a=(r/10-.5)*(L*1.6),[o,s]=[[1,0],[0,1],[-1,0],[0,-1]][n],[l,u]=[-s,o],d=[],f=o*L+l*a,p=s*L+u*a;d.push([f,p]);let m=.35+e()*.9;f+=o*m,p+=s*m,d.push([f,p]);let h=Math.sign(a)*+(Math.abs(a)>.5),g=.6+e()*1.8;f+=(o+l*h)*g,p+=(s+u*h)*g,d.push([f,p]);let _=ve*(.55+e()*.45);f+=o*_,p+=s*_,d.push([f,p]);let v=0;for(let e=1;e<d.length;e++)v+=Math.hypot(d[e][0]-d[e-1][0],d[e][1]-d[e-1][1]);let y=e()<.45?e():-1,ee=+(y<0),b=y<0?t():y,x=0;for(let e=1;e<d.length;e++){let t=Math.hypot(d[e][0]-d[e-1][0],d[e][1]-d[e-1][1]);i(d[e-1][0],d[e-1][1],I.pistas,d[e][0],d[e][1],I.pistas,.36,x/v,(x+t)/v,b,0,{flux:ee}),x+=t}c.push(d[2][0],d[2][1],0)}let l={nou:1};for(let e=0;e<4;e++){let[n,r]=[[1,0],[0,1],[-1,0],[0,-1]][e];for(let e of[-1.2,-.6,0,.6,1.2]){let a=e+(t()-.5)*.12,s=n*1.78+r*a,c=r*1.78+n*a,u=n!==0,d=u?.1:.2,f=u?.2:.1,p={...l,dir:[n,r]};o(s,c,d,f,I.sustrato,.42,p),u?(i(s-d/2,c-.06,I.sustrato,s+d/2,c-.06,I.sustrato,.42,0,1,-1,0,p),i(s-d/2,c+.06,I.sustrato,s+d/2,c+.06,I.sustrato,.42,0,1,-1,0,p)):(i(s-.06,c-f/2,I.sustrato,s-.06,c+f/2,I.sustrato,.42,0,1,-1,0,p),i(s+.06,c-f/2,I.sustrato,s+.06,c+f/2,I.sustrato,.42,0,1,-1,0,p))}}let m={...l,dir:[0,-1]};o(0,-.885,1.2,.3,I.silicio,.65,m);for(let e=0;e<6;e++){let t=-.5+e*.2;i(t,-.98,I.silicio,t,-.79,I.silicio,.32,0,1,-1,0,m)}let h={...l,dir:[1,0]};o(1.2,0,.48,1.1,I.silicio,.65,h);for(let e=0;e<5;e++)for(let t=0;t<2;t++)o(1.09+t*.22,-.4+e*.2,.16,.13,I.silicio,.3,h);for(let e of[{nivell:1,dz:0,linies:9,vertical:!1},{nivell:1.8,dz:.008,linies:11,vertical:!0},{nivell:2.6,dz:.016,linies:5,vertical:!1}]){let t={...l,nivell:e.nivell,dz:e.dz};o(0,0,R,z,I.metal,.5,t);for(let n=0;n<e.linies;n++){let r=(n+1)/(e.linies+1);if(e.vertical){let e=-1.7/2+r*R;i(e,-.565,I.metal,e,z/2-.06,I.metal,.26,0,1,-1,0,t)}else{let e=-1.25/2+r*z;i(-.79,e,I.metal,R/2-.06,e,I.metal,.26,0,1,-1,0,t)}}}for(let[e,t]of[[-.6,-.4],[.2,-.4],[.7,.3],[-.3,.35],[.5,-.1],[-.75,.1]])i(e,t,I.metal,e,t,I.metal,.45,0,1,-1,1,{...l,nivell:1},{...l,nivell:2.6,dz:.016});let g=[],_=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=1+.07*Math.sin(3*t+1.3)+.05*Math.sin(5*t+.4);g.push([Math.cos(t)*.95*n,Math.sin(t)*.72*n]),_.push([Math.cos(t)*.62*n,Math.sin(t)*.46*n])}a(g,I.pasta,.5,l),a(_,I.pasta,.22,l);let v=.17,y=new Set,ee=[];for(let e=-9;e<=9;e++)for(let t=-8;t<=8;t++){let n=e*v*1.5,r=t*v*Math.sqrt(3)+(e%2?v*Math.sqrt(3)/2:0);if(!(Math.abs(n)>1.22||Math.abs(r)>1.22))for(let e=0;e<6;e++){let t=e*Math.PI/3,i=(e+1)*Math.PI/3,a=n+v*Math.cos(t),o=r+v*Math.sin(t),s=n+v*Math.cos(i),c=r+v*Math.sin(i),l=[Math.round((a+s)*500),Math.round((o+c)*500)].join(`,`);y.has(l)||(y.add(l),ee.push([a,o,s,c]))}}for(let[e,t,n,r]of ee)i(e,t,I.escudo,n,r,I.escudo,.3,0,1,-1,0,l);let b=[];for(let e=0;e<=12;e++){let t=e/12;b.push([.42*Math.sin(t*Math.PI*.5)*(1-.15*t),.5-t*1.05])}a([[0,.58],...b,...b.slice(0,-1).reverse().map(([e,t])=>[-e,t])],I.escudo,.75,l);let x=[];for(let e=0;e<12;e++)x.push([.1*Math.cos(e/12*Math.PI*2),.1+.1*Math.sin(e/12*Math.PI*2)]);a(x,I.escudo,.75,l),i(0,0,I.escudo,0,-.22,I.escudo,.75,0,1,-1,0,l),o(.25,.35,.9,.42,I.tapa,.3,l);for(let e=0;e<3;e++)i(-.1,.24+e*.11,I.tapa,.6-e*.12,.24+e*.11,I.tapa,.3,0,1,-1,0,l);for(let[e,t]of[[-1,-1],[1,-1],[1,1],[-1,1]])i(e*1.8,t*1.8,I.bolas,e*1.8,t*1.8,I.sustrato,.45,0,1,-1,1,l),i(R/2*e,z/2*t,I.sustrato,R/2*e,z/2*t,I.silicio,.45,0,1,-1,1,l),i(R/2*e,z/2*t,I.silicio,R/2*e,z/2*t,I.metal,.4,0,1,-1,1,l,{...l,nivell:2.6,dz:.016}),i(e*1.2,t*1.2,I.escudo,e*1.2,t*1.2,I.tapa,.4,0,1,-1,1,l);let S=new f;S.setAttribute(`position`,new p(n.p,3)),S.setAttribute(`aCapa`,new p(n.capa,1)),S.setAttribute(`aGrup`,new p(n.grup,1)),S.setAttribute(`aNivell`,new p(n.nivell,1)),S.setAttribute(`aDir`,new p(n.dir,2)),S.setAttribute(`aNou`,new p(n.nou,1)),S.setAttribute(`aFlux`,new p(n.flux,1)),S.setAttribute(`aT`,new p(n.t,1)),S.setAttribute(`aLlavor`,new p(n.llavor,1)),S.setAttribute(`aBase`,new p(n.base,1)),S.setAttribute(`aGuia`,new p(n.guia,1));let C={p:[],capa:[],grup:[],nivell:[],dir:[],nou:[],mida:[],base:[]},w=(e,t,n,r,i,a={})=>{C.p.push(e,t,n.z),C.capa.push(n.sep),C.grup.push(n.grup),C.nivell.push(a.nivell??1),C.dir.push(a.dir?.[0]??0,a.dir?.[1]??0),C.nou.push(a.nou??0),C.mida.push(r),C.base.push(i)};for(let e=0;e<15;e++)for(let t=0;t<15;t++){let n=(e/14-.5)*(L*1.7),r=(t/14-.5)*(L*1.7);Math.abs(n)<.55&&Math.abs(r)<.55||(w(n,r,I.bolas,1,.55,{dir:[n/L,r/L]}),w(n,r,I.sustrato,.6,.35,l))}for(let e=0;e<c.length;e+=3)w(c[e],c[e+1],I.pistas,1.5,.5);for(let e=0;e<46;e++){let e=t()*Math.PI*2,n=Math.sqrt(t())*.85;w(Math.cos(e)*n*.95,Math.sin(e)*n*.72,I.pasta,.7,.4,l)}let T=new f;T.setAttribute(`position`,new p(C.p,3)),T.setAttribute(`aCapa`,new p(C.capa,1)),T.setAttribute(`aGrup`,new p(C.grup,1)),T.setAttribute(`aNivell`,new p(C.nivell,1)),T.setAttribute(`aDir`,new p(C.dir,2)),T.setAttribute(`aNou`,new p(C.nou,1)),T.setAttribute(`aMida`,new p(C.mida,1)),T.setAttribute(`aBase`,new p(C.base,1));let E=new d;for(let e of Object.keys(S.attributes))E.setAttribute(e,S.getAttribute(e));let te=[];for(let e=0;e<8;e++){let t=e/8*Math.PI*2+e%2*.2,n=e%2?2.4:1.2;te.push(Math.cos(t)*n,Math.sin(t)*n)}return E.setAttribute(`aDesp`,new u(new Float32Array(te),2)),E.instanceCount=8,{linies:S,punts:T,halo:E}}function ke(e,t,n,r=34){let i=2*Math.sqrt(r)*.82;e.vel+=((t-e.valor)*r-e.vel*i)*n,e.valor+=e.vel*n}var B=`radial-gradient(ellipse 62% 90% at var(--mx, 78%) var(--my, 48%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)`,V=`radial-gradient(ellipse var(--rx, 62%) var(--ry, 90%) at var(--mx, 50%) var(--my, 50%), #000 25%, rgba(0,0,0,.5) 55%, transparent 88%)`,Ae={position:`absolute`,top:0,left:0,opacity:0,whiteSpace:`nowrap`,fontSize:12,fontWeight:500,lineHeight:`16px`,letterSpacing:`0.14em`,textTransform:`uppercase`,color:`#8CD9E4`,textShadow:`0 0 10px #0C0C0C, 0 0 3px #0C0C0C`,willChange:`transform, opacity`};function je({onFalla:t,ancla:n,sortida:i,progres:u,oculta:d}){let f=r(),{idioma:p}=e(),S=(0,C.useRef)(null),O=(0,C.useRef)(null);(0,C.useEffect)(()=>{let e=S.current;if(!e)return;let r;try{r=new g({canvas:e,alpha:!0,antialias:!0,powerPreference:`low-power`})}catch{t();return}r.debug.onShaderError=()=>t();let p=()=>Math.min(window.devicePixelRatio||1,1.5);r.setPixelRatio(p()),r.setClearAlpha(0);let C=ye(),j={uTemps:{value:0},uForca:{value:1},uSep:{value:N},uRafaga:{value:0},uColor:{value:C},uPols:{value:C.clone().lerp(new h(1,1,1),.6)},uPunt:{value:26*p()},uAltA:{value:new c(0,0,0,0)},uAltB:{value:new c(0,0,0,0)},uObreA:{value:new c(0,0,0,0)},uObreB:{value:new c(0,0,0,0)},uPesA:{value:new c(1,1,1,1)},uPesB:{value:new c(1,1,1,1)},uNou:{value:0},uCentre:{value:0},uFlux:{value:0},uGuies:{value:0},uBrill:{value:0},uHalo:{value:.16},uPx:{value:new o(0,0)}},M=Oe(),P={uniforms:j,transparent:!0,depthTest:!1,depthWrite:!1,blending:2},ve=new l({...P,vertexShader:xe,fragmentShader:Ce}),F=new l({...P,vertexShader:Te,fragmentShader:Ee}),be=new l({...P,vertexShader:Se,fragmentShader:we}),L=new a,R=new _,z=new _,De=new m(M.halo,be);De.visible=!!u,De.frustumCulled=!1,z.add(De),z.add(new m(M.linies,ve)),z.add(new v(M.punts,F)),z.rotation.set(me,0,he),R.add(z),L.add(R);let B=new y(40,1,.1,60);B.position.set(0,0,pe);let V=()=>{let t=e.getBoundingClientRect(),n=Math.max(1,Math.round(t.width)),i=Math.max(1,Math.round(t.height));B.aspect=n/i,B.updateProjectionMatrix(),r.setSize(n,i,!1),j.uPx.value.set(2/n,2/i),Be()},Ae=e.closest(`section`)?.querySelector(`img`),je=()=>n?.current??Ae,Me=``,Ne=``,Pe=``,Fe=``,Ie=-1,Le=1,Re=(t,n)=>{t!==Me&&e.style.setProperty(`--mx`,Me=t),n!==Ne&&e.style.setProperty(`--my`,Ne=n)},ze=(t,n)=>{let r=i?i.get():1;Ie=r;let a=le(r),o=ee(window.innerWidth),s=t.left+t.width*o.ancla,c=t.top+t.height*x.ancla[1],l=Math.max(1,Math.min(x.lado.svh*window.innerHeight,o.vw*window.innerWidth)),u=s,d=c,f=l,p=je()?.getBoundingClientRect();p&&p.width>0&&(u=p.left+p.width/2,d=p.top+p.height/2+window.scrollY,f=p.width*ge);let m=u+(s-u)*a,h=d+(c-d)*a,g=Math.exp(Math.log(f)+(Math.log(l)-Math.log(f))*a),_=m-(t.left+t.width/2),v=h-(t.top+t.height/2);R.position.set(_*n,-v*n,0),Le=g*n/2.1/2,z.scale.setScalar(Le),Re(`${((m-t.left)/t.width*100).toFixed(1)}%`,`${((h-t.top)/t.height*100).toFixed(1)}%`);let{desde:y,hasta:b}=x.mascara,S=`${(y[0]+(b[0]-y[0])*a).toFixed(1)}%`,C=`${(y[1]+(b[1]-y[1])*a).toFixed(1)}%`;S!==Pe&&e.style.setProperty(`--rx`,Pe=S),C!==Fe&&e.style.setProperty(`--ry`,Fe=C)},Be=()=>{let t=e.getBoundingClientRect(),n=2*Math.tan(B.fov*Math.PI/360)*pe/Math.max(1,t.height);if(u){ze(t,n);return}let r=je()?.getBoundingClientRect();if(!r||r.width===0){R.position.set(2.2,0,0);return}let i=r.left+r.width/2-(t.left+t.width/2),a=r.top+r.height/2-(t.top+t.height/2);R.position.set(i*n,-a*n,0),z.scale.setScalar(r.width*n*ge/2.1/2),Re(`${((t.width/2+i)/t.width*100).toFixed(1)}%`,`${((t.height/2+a)/t.height*100).toFixed(1)}%`)},Ve=()=>{M.linies.dispose(),M.punts.dispose(),M.halo.dispose(),ve.dispose(),F.dispose(),be.dispose(),r.dispose()};try{V()}catch{Ve(),t();return}if(f){j.uSep.value=.6,r.render(L,B);let e=()=>{V(),r.render(L,B)};return window.addEventListener(`resize`,e),()=>{window.removeEventListener(`resize`,e),Ve()}}let He={valor:0,vel:0},Ue={valor:0,vel:0},We={valor:N,vel:0},Ge={valor:0,vel:0},Ke=0,qe=0,Je=N,Ye=0,H=0,Xe=new s,Ze=0,Qe=0,$e=!1,et=1,tt=1,nt=u?u.get():0,rt=nt<D.en,U=[0,0,0,0,0,0,0,0],W=[0,0,0,0,0,0,0,0],it=[0,0,0,0,0,0,0,0],G=[1,1,1,1,1,1,1,1];u&&ue(te,u.get(),G);let at=0,ot=0,st=1,ct=e=>{if(!u)return;let t=i?i.get():1,n=u.get(),r=t>=1,a=b(t,0,x.puntero),o=0;if($e&&a<1){let e=xt(),t=Math.max(0,1-Math.hypot(Ze-e.x,Qe-e.y)/_e);o=t*t*.78*(1-a)}let s=r?k(w,n):N+(w[0][1]-N)*le(t);Je=Math.min(1,s+o),et=1-(1-x.inclinacion)*a,tt=de(n),ue(T,n,U),ue(E,n,W),ue(te,n,it);let c=1-Math.exp(-3e3*e/120);for(let e=0;e<8;e++)G[e]+=(it[e]-G[e])*c;j.uAltA.value.set(U[0],U[1],U[2],U[3]),j.uAltB.value.set(U[4],U[5],U[6],U[7]),j.uObreA.value.set(W[0],W[1],W[2],W[3]),j.uObreB.value.set(W[4],W[5],W[6],W[7]),j.uPesA.value.set(G[0],G[1],G[2],G[3]),j.uPesB.value.set(G[4],G[5],G[6],G[7]),j.uNou.value=b(t,.15,.85),j.uBrill.value=k(ne,n),j.uFlux.value=k(re,n),j.uGuies.value=k(ie,n),j.uCentre.value=k(ce,n),at=k(ae,n),ot=k(oe,n),st=k(se,n),rt&&nt<D.en&&n>=D.en?(H=1,rt=!1):!rt&&n<D.en-D.histeresis&&(rt=!0),nt=n},K=O.current,lt=K?[...K.querySelectorAll(`g[data-rotol]`)]:[],ut=K?[...K.querySelectorAll(`span[data-rotol]`)]:[],dt=Object.values(I),ft=new s,q=[],pt=A.map(()=>-1),mt=()=>{if(!u||!K||!lt.length)return;let t=u.get(),n=e.getBoundingClientRect(),r=n.width,i=n.height;q.length=0;for(let e=0;e<A.length;e++){let n=A[e],[a,o,s,c]=fe[n.capitol],l=b(t,a,o)*(1-b(t,s,c));if(l<.01){pt[e]!==0&&(pt[e]=0,lt[e].setAttribute(`opacity`,`0`),ut[e].style.opacity=`0`);continue}let u=dt[n.grup],d=n.dir??[0,0],f=n.nivell??1;ft.set(n.punt[0]+d[0]*W[n.grup],n.punt[1]+d[1]*W[n.grup],u.z+u.sep*j.uSep.value+f*U[n.grup]-j.uCentre.value),ft.applyMatrix4(z.matrixWorld).project(B),q.push({i:e,ax:(ft.x+1)/2*r,ay:(1-ft.y)/2*i,o:l,ty:0,w:ut[e].offsetWidth})}if(!q.length)return;let a=Math.max(24,Math.min(112,.034*window.innerWidth)),o=i-150;q.sort((e,t)=>e.ay-t.ay);let s=-1/0;for(let e of q)e.ty=Math.max(e.ay,s+30,72),s=e.ty;let c=q[q.length-1].ty-o;if(c>0)for(let e of q)e.ty=Math.max(72,e.ty-c);for(let e of q){let t=r-a-e.w,n=Math.min(t-28,Math.max(e.ax+16,t-120)),i=lt[e.i];i.setAttribute(`opacity`,e.o.toFixed(3)),i.firstElementChild?.setAttribute(`d`,`M${e.ax.toFixed(1)} ${e.ay.toFixed(1)}H${n.toFixed(1)}L${(t-8).toFixed(1)} ${e.ty.toFixed(1)}`);let[o,s]=[i.children[1],i.children[2]];o.setAttribute(`cx`,e.ax.toFixed(1)),o.setAttribute(`cy`,e.ay.toFixed(1)),s.setAttribute(`cx`,e.ax.toFixed(1)),s.setAttribute(`cy`,e.ay.toFixed(1));let c=ut[e.i];c.style.transform=`translate(${t.toFixed(1)}px, ${(e.ty-8).toFixed(1)}px)`,c.style.opacity=e.o.toFixed(3),pt[e.i]=e.o}},J=0,Y=0,X=0,Z=!0,ht=16.7,gt=0,_t=!1,vt=e=>{let t=Y?(e-Y)/1e3:1/60;if(Y=e,(!(t>0)||t>.25)&&(t=1/60),ht+=(t*1e3-ht)*.05,gt+=1,!_t&&gt>120&&ht>26&&(_t=!0,r.setPixelRatio(1),j.uPunt.value=26,V()),X+=t,ct(t),ke(He,Ke*et,t),ke(Ue,qe*et,t),ke(We,Je,t,18),ke(Ge,Ye,t,22),H=Math.max(0,H-t*.9),j.uTemps.value=X,j.uSep.value=Math.max(0,We.valor+Math.sin(X*.8)*.04),j.uRafaga.value=H,j.uForca.value=u?tt:1-Ge.valor*.6,R.rotation.y=He.valor*.5+Math.sin(X*.13)*.08,R.rotation.x=Ue.valor*.35,z.rotation.z=he+Math.sin(X*.09)*.05+at,B.position.z=pe+Ge.valor*3,u){let e=i?i.get():1;(e<1||e!==Ie||gt%10==0)&&Be(),z.rotation.x=me+ot,z.scale.setScalar(Le*st)}else gt%10==0&&Be();r.render(L,B),mt()},Q=()=>{J&&window.cancelAnimationFrame(J),J=0},yt=e=>{J=0;try{d?.current?Y=0:vt(e)}catch{Q(),Z=!1,t();return}Z&&!document.hidden&&(J=window.requestAnimationFrame(yt))},bt=()=>{J||!Z||document.hidden||(Y=0,J=window.requestAnimationFrame(yt))},xt=()=>{let t=e.getBoundingClientRect();return R.getWorldPosition(Xe),Xe.project(B),{x:t.left+(Xe.x+1)/2*t.width,y:t.top+(1-Xe.y)/2*t.height}},St=e=>{if(Ke=e.clientX/window.innerWidth-.5,qe=e.clientY/window.innerHeight-.5,u){Ze=e.clientX,Qe=e.clientY,$e=!0;return}let t=xt(),n=Math.hypot(e.clientX-t.x,e.clientY-t.y),r=Math.max(0,1-n/_e);Je=N+r*r*.78},Ct=u?je()?.closest(`section`)??e:e,wt=e=>{let t=Ct.getBoundingClientRect();e.clientY<t.top||e.clientY>t.bottom||(H=1,We.vel+=2.5)},Tt=e=>{e.relatedTarget||(u?$e=!1:Je=N)},$=()=>{u||(Ye=Math.min(1,Math.max(0,window.scrollY/Math.max(1,window.innerHeight))))},Et=()=>{V(),$()},Dt=new IntersectionObserver(([e])=>{Z=e.isIntersecting,Z?bt():Q()},{threshold:0});Dt.observe(e);let Ot=()=>document.hidden?Q():bt(),kt=e=>{e.preventDefault(),Q(),t()};return window.addEventListener(`pointermove`,St,{passive:!0}),window.addEventListener(`pointerdown`,wt,{passive:!0}),window.addEventListener(`mouseout`,Tt),window.addEventListener(`scroll`,$,{passive:!0}),window.addEventListener(`resize`,Et),document.addEventListener(`visibilitychange`,Ot),e.addEventListener(`webglcontextlost`,kt),$(),bt(),()=>{Q(),Dt.disconnect(),window.removeEventListener(`pointermove`,St),window.removeEventListener(`pointerdown`,wt),window.removeEventListener(`mouseout`,Tt),window.removeEventListener(`scroll`,$),window.removeEventListener(`resize`,Et),document.removeEventListener(`visibilitychange`,Ot),e.removeEventListener(`webglcontextlost`,kt),Ve()}},[f,t,n,i,u,d]);let P=u?V:B,ve=j[p];return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(`canvas`,{ref:S,"aria-hidden":!0,className:`pointer-events-none size-full`,style:{maskImage:P,WebkitMaskImage:P}}),u?(0,M.jsxs)(`div`,{ref:O,"aria-hidden":!0,className:`pointer-events-none absolute inset-0 overflow-hidden`,children:[(0,M.jsx)(`svg`,{className:`absolute inset-0 size-full`,fill:`none`,children:A.map(e=>(0,M.jsxs)(`g`,{"data-rotol":e.id,opacity:0,children:[(0,M.jsx)(`path`,{stroke:`rgba(95,198,212,.55)`,strokeWidth:1}),(0,M.jsx)(`circle`,{r:7,stroke:`rgba(95,198,212,.45)`,strokeWidth:1}),(0,M.jsx)(`circle`,{r:2.5,fill:`#8CD9E4`})]},e.id))}),A.map(e=>(0,M.jsx)(`span`,{"data-rotol":e.id,style:Ae,children:ve[e.id]},e.id))]}):null]})}export{je as default};