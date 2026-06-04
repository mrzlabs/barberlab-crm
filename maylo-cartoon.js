/* ============================================================
   MAYLO — el operabot de MRZLabs (robot ilustrado)
   window.maylo(opts) -> SVG markup string
   opts:
     eyes  : 'open'|'blink'|'wink'|'happy'   (default open)
     mouth : 'smile'|'grin'|'flat'|'talk'     (default smile)
     arms  : 'wave'|'welcome'|'point'         (default wave)
     glow  : true|false                       (default true)
     body  : main color override              (default brand violet -> gradient)
     panel : show chest LED panel             (default true)
   Dance hooks (CSS targets): .my-wave .my-armL .my-legL .my-legR
   ============================================================ */
(function(){
  const C = {
    violet:'#7F77DD', violetHi:'#9A92EA', violetLo:'#5A4BCB', violetDk:'#41339C',
    stroke:'#1F1750', yellow:'#F5C400', yellowHi:'#FFE780', cyan:'#27C3D8',
    mag:'#B57BE0', ink:'#16113A'
  };
  let _uid = 0;

  function maylo(opts){
    const o = Object.assign({eyes:'open', mouth:'smile', arms:'wave', glow:true, panel:true, body:C.violet}, opts||{});
    const id = 'my'+(_uid++);
    const grad = (o.body === C.violet);
    const main   = grad ? `url(#${id}b)` : o.body;
    const limb   = grad ? C.violetLo : o.body;
    const knob   = grad ? C.violetDk : o.body;
    const stroke = grad ? C.stroke : 'rgba(0,0,0,.16)';
    const sw = 3.2;
    const S = `stroke="${stroke}" stroke-width="${sw}"`;

    const defs = `<defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${grad?'#8273F4':o.body}"/>
        <stop offset="1" stop-color="${grad?'#473AAE':o.body}"/>
      </linearGradient>
      <filter id="${id}g" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="3" result="bl"/>
        <feMerge><feMergeNode in="bl"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
    const gf = o.glow ? `filter="url(#${id}g)"` : '';

    /* ---- antenna (bent stem + tilted cyan tip) ---- */
    const antenna = `
      <path d="M120 58 C 117 46 127 42 125 30" fill="none" stroke="${knob}" stroke-width="5" stroke-linecap="round"/>
      <g ${gf}><rect x="118" y="16" width="17" height="15" rx="5" fill="${C.cyan}" transform="rotate(18 126 23)"/></g>`;

    /* ---- ears / head bolts ---- */
    const ears = `
      <rect x="33" y="90" width="14" height="28" rx="7" fill="${knob}" ${S}/>
      <rect x="193" y="90" width="14" height="28" rx="7" fill="${knob}" ${S}/>`;

    /* ---- legs ---- */
    const legs = `
      <rect class="my-legL" x="84"  y="256" width="27" height="32" rx="13" fill="${limb}" ${S} style="transform-box:fill-box;transform-origin:50% 0"/>
      <rect class="my-legR" x="129" y="256" width="27" height="32" rx="13" fill="${limb}" ${S} style="transform-box:fill-box;transform-origin:50% 0"/>`;

    /* ---- arms ---- */
    let arms='';
    if(o.arms==='wave'){
      // viewer-left arm down; viewer-right raised with V (peace) hand
      arms = `
        <rect class="my-armL" x="40" y="190" width="23" height="52" rx="11.5" fill="${limb}" ${S} transform="rotate(-9 51 196)"/>
        <g class="my-wave" style="transform-box:fill-box;transform-origin:50% 90%">
          <rect x="174" y="138" width="23" height="74" rx="11.5" fill="${limb}" ${S} transform="rotate(26 185 205)"/>
          <g transform="translate(202 134) rotate(20)">
            <rect x="-13" y="-30" width="10" height="34" rx="5" fill="${limb}" ${S} transform="rotate(-13)"/>
            <rect x="3"  y="-30" width="10" height="34" rx="5" fill="${limb}" ${S} transform="rotate(13)"/>
            <circle cx="0" cy="2" r="11" fill="${limb}" ${S}/>
          </g>
        </g>`;
    } else if(o.arms==='point'){
      arms = `
        <rect class="my-armL" x="40" y="186" width="23" height="54" rx="11.5" fill="${limb}" ${S} transform="rotate(-14 51 196)"/>
        <rect x="180" y="196" width="48" height="22" rx="11" fill="${limb}" ${S} transform="rotate(6 182 207)"/>`;
    } else { // welcome
      arms = `
        <rect class="my-armL" x="38" y="184" width="23" height="56" rx="11.5" fill="${limb}" ${S} transform="rotate(-17 49 192)"/>
        <rect x="179" y="184" width="23" height="56" rx="11.5" fill="${limb}" ${S} transform="rotate(17 190 192)"/>`;
    }

    /* ---- body + neck ---- */
    const neck = `<rect x="103" y="148" width="34" height="22" rx="9" fill="${knob}" ${S}/>`;
    const body = `
      <rect x="56" y="160" width="128" height="104" rx="30" fill="${main}" ${S}/>
      <rect x="66" y="167" width="108" height="26" rx="13" fill="#ffffff" opacity=".11"/>`;

    /* ---- shoulder joints ---- */
    const shoulders = `
      <circle cx="64"  cy="186" r="17" fill="${knob}" ${S}/>
      <circle cx="176" cy="186" r="17" fill="${knob}" ${S}/>`;

    /* ---- head ---- */
    const head = `
      <rect x="44" y="54" width="152" height="100" rx="34" fill="${main}" ${S}/>
      <rect x="56" y="61" width="128" height="26" rx="13" fill="#ffffff" opacity=".12"/>`;

    /* ---- chest LED panel ---- */
    let panel='';
    if(o.panel){
      panel = `
        <rect x="85" y="204" width="70" height="36" rx="12" fill="${C.ink}" stroke="${stroke}" stroke-width="2.5"/>
        <circle cx="100" cy="222" r="5.5" fill="${C.cyan}"/>
        <rect x="113" y="217" width="12" height="9" rx="4.5" fill="${C.yellow}"/>
        <circle cx="137" cy="222" r="5.5" fill="${C.mag}"/>`;
    }

    /* ---- eyes (gold ring, glowing) ---- */
    function ringEye(cx){
      return `<g ${gf}>
        <circle cx="${cx}" cy="103" r="23" fill="${C.yellow}"/>
        <circle cx="${cx}" cy="103" r="12.5" fill="${C.ink}"/>
        <circle cx="${cx-6}" cy="96" r="4" fill="${C.yellowHi}"/>
      </g>`;
    }
    let eyesSvg='';
    if(o.eyes==='blink'){
      eyesSvg = `<g ${gf}><rect x="78" y="99" width="36" height="8" rx="4" fill="${C.yellow}"/><rect x="126" y="99" width="36" height="8" rx="4" fill="${C.yellow}"/></g>`;
    } else if(o.eyes==='happy'){
      eyesSvg = `<g ${gf}><path d="M78 109 Q96 85 114 109" fill="none" stroke="${C.yellow}" stroke-width="9" stroke-linecap="round"/><path d="M126 109 Q144 85 162 109" fill="none" stroke="${C.yellow}" stroke-width="9" stroke-linecap="round"/></g>`;
    } else if(o.eyes==='wink'){
      eyesSvg = `<g ${gf}><rect x="78" y="99" width="36" height="8" rx="4" fill="${C.yellow}"/></g>` + ringEye(144);
    } else {
      eyesSvg = ringEye(96)+ringEye(144);
    }

    /* ---- mouth (cyan accent) ---- */
    let mouth='';
    switch(o.mouth){
      case 'flat': mouth=`<rect x="106" y="131" width="28" height="6" rx="3" fill="${C.cyan}"/>`; break;
      case 'grin': mouth=`<path d="M100 129 Q120 149 140 129 Z" fill="${C.cyan}"/>`; break;
      case 'talk': mouth=`<rect x="109" y="127" width="22" height="15" rx="7" fill="${C.cyan}"/>`; break;
      default:     mouth=`<path d="M110 132 Q120 138 130 132" fill="none" stroke="${C.cyan}" stroke-width="5" stroke-linecap="round"/>`;
    }

    return `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Maylo">
      ${defs}
      ${antenna}
      ${ears}
      ${legs}
      ${arms}
      ${neck}
      ${body}
      ${shoulders}
      ${panel}
      ${head}
      <g class="my-face">${eyesSvg}${mouth}</g>
    </svg>`;
  }

  window.maylo = maylo;
  window.MAYLO_COLORS = C;
})();
