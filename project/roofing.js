/* ════════════════════════════════════════════════
   ROOFING PAGE — interactions
   1. Storm radar hero (auto-cycle, scrubber)
   2. 72-hour storm-response window (interactive curve)
   3. Hail map (filterable cells, animated)
   4. Storm calendar (static visual w/ hover detail)
   ════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ──────────── 1. STORM RADAR HERO ──────────── */
  function initHero(){
    const hero = document.getElementById('roof-hero');
    if(!hero) return;
    const clouds = hero.querySelector('.rh-clouds');
    const rain   = hero.querySelector('.rh-rain');
    const flash  = hero.querySelector('.rh-flash');
    const radar  = hero.querySelector('.rh-radar');
    const sweep  = hero.querySelector('.rh-radar-sweep');
    const stormCell = hero.querySelector('.rh-storm-cell');
    const stage  = hero.querySelector('.rh-storm-stage');
    const track  = hero.querySelector('.rh-storm-track');
    const knob   = hero.querySelector('.rh-storm-knob');
    const auto   = hero.querySelector('.rh-storm-auto');
    const dmgs   = hero.querySelectorAll('.rh-damage-marker');
    const sky    = hero.querySelector('.rh-sky');

    // build cloud puffs
    const cloudPuffs = [
      {l:'10%',t:'8%',w:280,h:120,o:.6},
      {l:'42%',t:'4%',w:340,h:140,o:.75},
      {l:'68%',t:'12%',w:300,h:130,o:.65},
      {l:'82%',t:'2%',w:260,h:110,o:.55},
      {l:'25%',t:'18%',w:240,h:100,o:.5},
    ];
    cloudPuffs.forEach(c=>{
      const div = document.createElement('div');
      div.className = 'rh-cloud';
      div.style.cssText = `left:${c.l};top:${c.t};width:${c.w}px;height:${c.h}px;opacity:${c.o};`;
      clouds.appendChild(div);
    });

    // 5 stages: 0=clear, 1=approaching, 2=hitting, 3=damage, 4=premura calling
    const stages = [
      {label:'CLEAR · 6 AM',  cloud:0,  rain:0, sweep:0,   stormX:-30,  flash:0, dmg:0},
      {label:'INCOMING · 11 AM', cloud:.5, rain:.1, sweep:.4,  stormX:18,   flash:0, dmg:0},
      {label:'IMPACT · 3 PM',  cloud:1,  rain:1, sweep:.85, stormX:48,   flash:1, dmg:0},
      {label:'AFTERMATH · 6 PM', cloud:.6, rain:.2, sweep:.55, stormX:78,   flash:0, dmg:1},
      {label:'PREMURA CALLING · NEXT MORNING', cloud:.15, rain:0, sweep:.3, stormX:120,  flash:0, dmg:1},
    ];

    let t = 0; // 0..1 across stages
    let playing = true;
    let last = performance.now();
    const DURATION = 14000; // total cycle ms

    function applyT(t){
      const seg = t * (stages.length - 1);
      const i = Math.floor(seg);
      const f = seg - i;
      const a = stages[i];
      const b = stages[Math.min(i+1, stages.length-1)];
      const lerp = (p,q)=>p+(q-p)*f;

      clouds.style.opacity = lerp(a.cloud, b.cloud);
      rain.style.opacity = lerp(a.rain, b.rain) * .6;
      stormCell.style.setProperty('--storm-x', lerp(a.stormX, b.stormX) + '%');
      stormCell.style.setProperty('--storm-op', Math.min(1, lerp(a.cloud, b.cloud) * 1.2));

      // sweep rotates continuously
      const rotation = (performance.now() / 18) % 360;
      sweep.style.setProperty('--sweep', rotation + 'deg');
      sweep.style.opacity = lerp(a.sweep, b.sweep);

      // sky tint
      sky.style.opacity = .4 + lerp(a.cloud, b.cloud) * .6;

      // damage markers — show after stage 2
      const showDmg = lerp(a.dmg, b.dmg);
      dmgs.forEach((d,k)=>{
        if(showDmg > .15 + k*.08) d.classList.add('show');
        else d.classList.remove('show');
      });

      // lightning flashes during impact
      if(f > .3 && f < .5 && i === 2 && !flash._lastFlash){
        flash.classList.add('flash');
        flash._lastFlash = true;
        setTimeout(()=>{flash.classList.remove('flash');flash._lastFlash=false;},900);
      }

      // label
      const cur = Math.min(stages.length - 1, Math.max(0, Math.round(seg)));
      stage.textContent = stages[cur].label;

      // knob
      knob.style.left = (t * 100) + '%';
    }

    function tick(now){
      const dt = now - last;
      last = now;
      if(playing){
        t += dt / DURATION;
        if(t > 1) t = 0;
      }
      applyT(t);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // scrubber
    let dragging = false;
    function setFromX(clientX){
      const r = track.getBoundingClientRect();
      t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      applyT(t);
    }
    track.addEventListener('pointerdown', e=>{
      dragging=true; playing=false; auto.classList.remove('playing');
      auto.textContent = 'Play'; setFromX(e.clientX);
    });
    window.addEventListener('pointermove', e=>{ if(dragging) setFromX(e.clientX); });
    window.addEventListener('pointerup', ()=>{ dragging=false; });
    auto.addEventListener('click', ()=>{
      playing = !playing;
      auto.textContent = playing ? 'Pause' : 'Play';
      auto.classList.toggle('playing', playing);
    });
    auto.classList.add('playing');
  }

  /* ──────────── 2. 72-HOUR WINDOW ──────────── */
  function initWindow(){
    const sec = document.getElementById('rf-window');
    if(!sec) return;
    const chart = sec.querySelector('.rf-win-chart');
    const hourEl = sec.querySelector('.rf-win-readout-cell.hour .rf-win-readout-val');
    const rateEl = sec.querySelector('.rf-win-readout-cell.rate .rf-win-readout-val');
    const dealsEl = sec.querySelector('.rf-win-readout-cell.deals .rf-win-readout-val');
    const subEl = sec.querySelector('.rf-win-readout-cell.deals .rf-win-readout-sub');

    // close-rate as a fn of hour (0..120). bell-ish curve, peak near hour 18
    function rateAt(h){
      // sharp ramp up first 24, plateau hours 18-36, then steady decay
      if(h < 18) return 18 + (h/18)*38; // 18%→56%
      if(h < 36) return 56 - ((h-18)/18)*8; // 56→48
      // exponential decay to ~3%
      const decay = Math.exp(-(h-36)/30);
      return 3 + 45 * decay;
    }
    function dealsAt(h){
      // 100 leads at hour 0; rate% become deals
      return Math.round(rateAt(h));
    }

    const W = 1000, H = 300;
    const PAD_L = 50, PAD_R = 30, PAD_T = 30, PAD_B = 40;
    const w = W - PAD_L - PAD_R;
    const h = H - PAD_T - PAD_B;

    function xAt(hr){ return PAD_L + (hr/120)*w; }
    function yAt(rate){ return PAD_T + h - (rate/65)*h; } // 0..65%

    // build path
    let pts = [];
    for(let hr=0; hr<=120; hr+=2){ pts.push([hr, rateAt(hr)]); }
    const pathD = pts.map((p,i)=>{
      return (i===0?'M':'L') + xAt(p[0]).toFixed(1) + ',' + yAt(p[1]).toFixed(1);
    }).join(' ');
    const fillD = pathD + ` L ${xAt(120)},${PAD_T+h} L ${xAt(0)},${PAD_T+h} Z`;

    // checkpoints
    const checkpoints = [
      {hr:6,   label:'6 hr',  rate:rateAt(6)},
      {hr:24,  label:'1 day', rate:rateAt(24)},
      {hr:72,  label:'3 day', rate:rateAt(72)},
      {hr:120, label:'5 day', rate:rateAt(120)},
    ];

    // y-axis labels
    const yLabels = [0, 20, 40, 60];
    const xLabels = [0, 24, 48, 72, 96, 120];

    let svgHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rfCurveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,92,122,.4)"/>
            <stop offset="50%" stop-color="rgba(168,85,247,.25)"/>
            <stop offset="100%" stop-color="rgba(94,177,255,.05)"/>
          </linearGradient>
          <linearGradient id="rfCurveStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ff5c7a"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#5eb1ff"/>
          </linearGradient>
        </defs>
        <!-- y-grid -->
        ${yLabels.map(y=>`
          <line x1="${PAD_L}" y1="${yAt(y)}" x2="${W-PAD_R}" y2="${yAt(y)}" stroke="rgba(168,85,247,.08)" stroke-width="1"/>
          <text class="rf-win-axis" x="${PAD_L-8}" y="${yAt(y)+3}" text-anchor="end">${y}%</text>
        `).join('')}
        <!-- x-axis labels -->
        ${xLabels.map(hr=>`
          <text class="rf-win-axis" x="${xAt(hr)}" y="${H-PAD_B+18}" text-anchor="middle">${hr}h</text>
        `).join('')}
        <!-- curve fill -->
        <path d="${fillD}" fill="url(#rfCurveFill)" stroke="none"/>
        <!-- curve stroke -->
        <path d="${pathD}" fill="none" stroke="url(#rfCurveStroke)" stroke-width="2.5"/>
        <!-- checkpoints -->
        ${checkpoints.map(c=>`
          <circle class="rf-win-checkpoint" cx="${xAt(c.hr)}" cy="${yAt(c.rate)}" r="5"/>
          <text class="rf-win-checkpoint-label" x="${xAt(c.hr)}" y="${yAt(c.rate)-22}" text-anchor="middle">${c.label}</text>
          <text class="rf-win-checkpoint-val" x="${xAt(c.hr)}" y="${yAt(c.rate)-10}" text-anchor="middle">${Math.round(c.rate)}%</text>
        `).join('')}
        <!-- marker -->
        <line class="rf-win-marker-line" id="rfMarkerLine" x1="${xAt(18)}" y1="${PAD_T}" x2="${xAt(18)}" y2="${PAD_T+h}"/>
        <circle class="rf-win-marker-dot" id="rfMarkerDot" cx="${xAt(18)}" cy="${yAt(rateAt(18))}" r="7"/>
      </svg>
    `;
    chart.innerHTML = svgHTML;

    const markerLine = chart.querySelector('#rfMarkerLine');
    const markerDot  = chart.querySelector('#rfMarkerDot');

    function update(hr){
      const r = rateAt(hr);
      hourEl.textContent = Math.round(hr) + ' hr';
      rateEl.textContent = Math.round(r) + '%';
      const deals = Math.round(r); // out of 100
      dealsEl.textContent = deals + ' / 100';
      // sub copy
      if(hr <= 24) subEl.textContent = 'within the golden window';
      else if(hr <= 72) subEl.textContent = 'window closing fast';
      else subEl.textContent = 'most prospects already signed';

      const x = xAt(hr);
      const y = yAt(r);
      markerLine.setAttribute('x1', x);
      markerLine.setAttribute('x2', x);
      markerDot.setAttribute('cx', x);
      markerDot.setAttribute('cy', y);
    }
    update(18);

    // drag along chart
    let dragging = false;
    function setFromEvent(e){
      const rect = chart.getBoundingClientRect();
      const xPx = e.clientX - rect.left;
      // map to viewBox x via percent
      const pct = Math.max(0, Math.min(1, (xPx / rect.width)));
      // viewbox x range corresponds to PAD_L..W-PAD_R
      const vbx = pct * W;
      const hr = Math.max(0, Math.min(120, ((vbx - PAD_L) / w) * 120));
      update(hr);
    }
    chart.addEventListener('pointerdown', e=>{ dragging=true; setFromEvent(e); chart.setPointerCapture(e.pointerId); });
    chart.addEventListener('pointermove', e=>{ if(dragging) setFromEvent(e); });
    chart.addEventListener('pointerup', e=>{ dragging=false; });
    chart.addEventListener('pointerleave', ()=>{ dragging=false; });
  }

  /* ──────────── 3. HAIL MAP (MapLibre) ──────────── */
  function initHail(){
    const sec = document.getElementById('rf-hail');
    if(!sec) return;
    const wrap = sec.querySelector('.rf-hail-map-wrap');
    const tooltip = sec.querySelector('.rf-hail-tooltip');
    const readoutVal = sec.querySelector('.rf-hail-readout-val');
    const readoutSub = sec.querySelector('.rf-hail-readout-sub');
    const tickrText = sec.querySelector('.rf-hail-tickr-text');
    const sliderEl = sec.querySelector('#rfHailDays');
    const sliderVal = sec.querySelector('#rfHailDaysVal');

    // Hail cells with real lat/lng coordinates
    const cells = [
      {lng:-101.85,lat:33.58,size:'lg',region:'Lubbock TX',ct:248,d:1},
      {lng:-101.84,lat:35.22,size:'lg',region:'Amarillo TX',ct:312,d:0},
      {lng:-97.52, lat:35.47,size:'md',region:'Oklahoma City',ct:189,d:1},
      {lng:-97.34, lat:37.69,size:'lg',region:'Wichita KS',ct:267,d:2},
      {lng:-97.03, lat:32.78,size:'md',region:'Dallas-Fort Worth',ct:421,d:0},
      {lng:-97.75, lat:30.27,size:'md',region:'Austin TX',ct:156,d:1},
      {lng:-95.37, lat:29.76,size:'sm',region:'Houston TX',ct:92,d:3},
      {lng:-104.99,lat:39.74,size:'lg',region:'Denver CO',ct:298,d:0},
      {lng:-104.82,lat:38.83,size:'md',region:'Colorado Springs',ct:174,d:1},
      {lng:-95.93, lat:41.26,size:'md',region:'Omaha NE',ct:142,d:2},
      {lng:-93.62, lat:41.60,size:'sm',region:'Des Moines IA',ct:88,d:4},
      {lng:-94.58, lat:39.10,size:'md',region:'Kansas City',ct:167,d:1},
      {lng:-90.20, lat:38.63,size:'sm',region:'St. Louis MO',ct:73,d:3},
      {lng:-84.39, lat:33.75,size:'md',region:'Atlanta GA',ct:201,d:0},
      {lng:-80.84, lat:35.23,size:'sm',region:'Charlotte NC',ct:94,d:2},
      {lng:-82.46, lat:27.95,size:'sm',region:'Tampa FL',ct:67,d:5},
      {lng:-81.38, lat:28.54,size:'sm',region:'Orlando FL',ct:52,d:6},
      {lng:-112.07,lat:33.45,size:'md',region:'Phoenix AZ',ct:133,d:1},
      {lng:-87.63, lat:41.88,size:'sm',region:'Chicago IL',ct:48,d:5},
      {lng:-86.16, lat:39.77,size:'sm',region:'Indianapolis',ct:62,d:4},
      {lng:-78.64, lat:35.79,size:'sm',region:'Raleigh NC',ct:81,d:3},
      {lng:-104.82,lat:41.14,size:'sm',region:'Cheyenne WY',ct:38,d:6},
      {lng:-96.73, lat:43.55,size:'sm',region:'Sioux Falls SD',ct:44,d:5},
      {lng:-90.05, lat:35.15,size:'sm',region:'Memphis TN',ct:71,d:2},
      {lng:-86.80, lat:33.52,size:'sm',region:'Birmingham AL',ct:58,d:3},
      {lng:-79.93, lat:32.78,size:'md',region:'Charleston SC',ct:112,d:1},
    ];

    const markerEls = [];
    let activeSizes = new Set(['sm','md','lg']);
    let maxDays = parseInt(sliderEl.value, 10);

    if(!window.PremuraMap){
      console.warn('[roofing hail] PremuraMap not loaded');
      return;
    }

    PremuraMap.initPurpleMap({
      containerId: 'rfHailMap',
      center: [-96, 38],
      zoom: 3.6,
      locked: true,
    }).then(map => {
      cells.forEach(c => {
        const sizeR = c.size === 'lg' ? 28 : c.size === 'md' ? 20 : 14;
        const color = c.size === 'lg'
          ? 'rgba(220,38,69,.85)'
          : c.size === 'md'
          ? 'rgba(168,85,247,.85)'
          : 'rgba(255,255,255,.55)';

        const el = document.createElement('div');
        el.style.cssText = `width:${sizeR}px;height:${sizeR}px;border-radius:50%;background:${color};box-shadow:0 0 12px ${color};border:1.5px solid rgba(255,255,255,.25);cursor:pointer;transition:opacity .3s ease,transform .3s ease;`;
        el.dataset.size = c.size;
        el.dataset.d = c.d;
        el.dataset.ct = c.ct;
        el.dataset.region = c.region;

        el.addEventListener('mouseenter', e => {
          if(el.style.opacity === '0') return;
          const sizeText = c.size==='lg'?'2"+ hail':c.size==='md'?'1.5–2" hail':'<1.5" hail';
          tooltip.innerHTML = `<strong>${c.region}</strong>${parseInt(c.ct).toLocaleString()} qualifying homeowners<br>${sizeText} · ${c.d===0?'today':(c.d+' days ago')}`;
          tooltip.classList.add('show');
        });
        el.addEventListener('mousemove', e => {
          const r = wrap.getBoundingClientRect();
          tooltip.style.left = (e.clientX - r.left + 14) + 'px';
          tooltip.style.top  = (e.clientY - r.top - 14) + 'px';
        });
        el.addEventListener('mouseleave', () => tooltip.classList.remove('show'));

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([c.lng, c.lat])
          .addTo(map);

        markerEls.push(el);
      });

      applyFilters();
    }).catch(err => console.warn('[roofing hail map]', err));

    // chip filters
    const sizeChips = sec.querySelectorAll('.rf-hail-chip[data-size]');
    sizeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const s = chip.dataset.size;
        if(activeSizes.has(s)){
          if(activeSizes.size === 1) return;
          activeSizes.delete(s);
          chip.classList.remove('active');
        } else {
          activeSizes.add(s);
          chip.classList.add('active');
        }
        applyFilters();
      });
    });

    sliderEl.addEventListener('input', () => {
      maxDays = parseInt(sliderEl.value, 10);
      sliderVal.textContent = maxDays + (maxDays===1?' day':' days');
      applyFilters();
    });

    function applyFilters(){
      let total = 0;
      let visibleCells = 0;
      markerEls.forEach(el => {
        const s = el.dataset.size;
        const d = parseInt(el.dataset.d, 10);
        const visible = activeSizes.has(s) && d <= maxDays;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        if(visible){ total += parseInt(el.dataset.ct, 10); visibleCells++; }
      });
      readoutVal.textContent = total.toLocaleString();
      readoutSub.textContent = `${visibleCells} active cells · last ${maxDays} day${maxDays===1?'':'s'}`;
      tickrText.innerHTML = `<strong>${total.toLocaleString()}</strong> qualifying homeowners in your filter — ready to dial.`;
    }

    // init readout ticker
    applyFilters();
    const targetVal = parseInt(readoutVal.textContent.replace(/,/g,''), 10);
    let cur = 0;
    const tickStart = performance.now();
    function tickReadout(now){
      const k = Math.min(1, (now - tickStart) / 1400);
      const ease = 1 - Math.pow(1-k, 3);
      cur = Math.round(targetVal * ease);
      readoutVal.textContent = cur.toLocaleString();
      if(k<1) requestAnimationFrame(tickReadout);
    }
    requestAnimationFrame(tickReadout);
  }

  /* ──────────── BOOT ──────────── */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      initHero(); initWindow(); initHail();
    });
  } else {
    initHero(); initWindow(); initHail();
  }
})();
