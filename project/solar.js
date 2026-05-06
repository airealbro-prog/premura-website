// ════════════════════════════════════════════════
// SOLAR PAGE — interactive scripts
// ════════════════════════════════════════════════

// ── HERO: Sun arc with time-of-day control ──
(() => {
  const hero = document.getElementById('solar-hero');
  if (!hero) return;
  const sky = hero.querySelector('.sh-sky');
  const sun = hero.querySelector('.sh-sun');
  const track = hero.querySelector('.sh-time-track');
  const knob = hero.querySelector('.sh-time-knob');
  const label = hero.querySelector('.sh-time-label');
  const autoBtn = hero.querySelector('.sh-time-auto');
  const rooftops = hero.querySelectorAll('.sh-roof-panel');

  let t = 0.35; // 0=dawn, 1=dusk
  let playing = true;
  let last = performance.now();

  const labelFor = v => {
    if (v < 0.15) return 'Dawn';
    if (v < 0.4) return 'Morning';
    if (v < 0.6) return 'Noon';
    if (v < 0.85) return 'Afternoon';
    return 'Dusk';
  };

  const update = () => {
    // sun arc — parabola from left to right
    const x = 5 + t * 90; // %
    const y = 70 - Math.sin(t * Math.PI) * 55; // %
    if (sun) { sun.style.setProperty('--sun-x', x + '%'); sun.style.setProperty('--sun-y', y + '%'); }
    if (sky) { sky.style.setProperty('--sun-x', x + '%'); sky.style.setProperty('--sun-y', y + '%'); }
    if (knob) knob.style.left = (t * 100) + '%';
    if (label) label.textContent = labelFor(t);
    // rooftops glow when sun is up
    const intensity = Math.max(0, Math.sin(t * Math.PI));
    rooftops.forEach((p, i) => {
      const delay = i * 0.08;
      const local = Math.max(0, intensity - delay);
      p.style.opacity = local.toFixed(2);
    });
  };
  update();

  // Drag knob
  let dragging = false;
  const onMove = e => {
    if (!dragging || !track) return;
    const rect = track.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    t = Math.max(0, Math.min(1, px / rect.width));
    playing = false;
    if (autoBtn) autoBtn.classList.remove('playing');
    update();
  };
  if (track) {
    track.addEventListener('mousedown', e => { dragging = true; onMove(e); });
    track.addEventListener('touchstart', e => { dragging = true; onMove(e); }, { passive: true });
  }
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', () => dragging = false);
  window.addEventListener('touchend', () => dragging = false);

  if (autoBtn) {
    autoBtn.classList.add('playing');
    autoBtn.addEventListener('click', () => {
      playing = !playing;
      autoBtn.classList.toggle('playing', playing);
      autoBtn.textContent = playing ? 'Pause' : 'Auto';
    });
  }

  const tick = now => {
    const dt = (now - last) / 1000; last = now;
    if (playing) {
      t += dt * 0.04;
      if (t > 1) t = 0;
      update();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// ── QUALIFICATION FUNNEL ──
(() => {
  const funnel = document.getElementById('sf-funnel');
  if (!funnel) return;
  const vis = funnel.querySelector('.sf-funnel-vis');
  const rows = funnel.querySelectorAll('.sf-stage-row');
  const replayBtn = funnel.querySelector('.sf-funnel-replay');
  if (!vis) return;

  // stage definitions: y-pct, label, count
  const stages = [
    { y: 8, w: 92, label: 'Raw homeowner records', count: 10000, drop: 0 },
    { y: 26, w: 78, label: 'Homeownership verified', count: 5800, drop: 4200 },
    { y: 44, w: 62, label: 'No existing solar', count: 2900, drop: 2900 },
    { y: 62, w: 46, label: 'Credit range qualifies', count: 1200, drop: 1700 },
    { y: 80, w: 28, label: 'Roof condition + interest', count: 380, drop: 820 },
    { y: 95, w: 14, label: 'Booked appointments', count: 42, drop: 338 },
  ];

  // Build SVG funnel shape
  const W = 600, H = 560;
  vis.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('sf-funnel-svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  // Funnel outline path (smooth curve)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(168,85,247,0.06)"/>
      <stop offset="60%" stop-color="rgba(168,85,247,0.18)"/>
      <stop offset="100%" stop-color="rgba(233,182,255,0.55)"/>
    </linearGradient>
    <linearGradient id="funnelEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(168,85,247,0.4)"/>
      <stop offset="100%" stop-color="rgba(233,182,255,0.85)"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  // build the funnel polygon from stage widths
  const pts = [];
  stages.forEach(s => {
    const half = (s.w / 100) * (W / 2);
    const cx = W / 2;
    const y = (s.y / 100) * H;
    pts.push([cx - half, y]);
  });
  const ptsRight = stages.slice().reverse().map(s => {
    const half = (s.w / 100) * (W / 2);
    return [W / 2 + half, (s.y / 100) * H];
  });
  const polyPts = [...pts, ...ptsRight].map(p => p.join(',')).join(' ');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', polyPts);
  poly.setAttribute('fill', 'url(#funnelGrad)');
  poly.setAttribute('stroke', 'url(#funnelEdge)');
  poly.setAttribute('stroke-width', '1.5');
  svg.appendChild(poly);

  // Stage divider lines
  stages.forEach((s, i) => {
    if (i === 0 || i === stages.length - 1) return;
    const half = (s.w / 100) * (W / 2);
    const y = (s.y / 100) * H;
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ln.setAttribute('x1', W / 2 - half);
    ln.setAttribute('x2', W / 2 + half);
    ln.setAttribute('y1', y);
    ln.setAttribute('y2', y);
    ln.setAttribute('stroke', 'rgba(168,85,247,0.18)');
    ln.setAttribute('stroke-width', '1');
    ln.setAttribute('stroke-dasharray', '3 3');
    svg.appendChild(ln);
  });

  vis.appendChild(svg);

  // Stage pills
  stages.forEach((s, i) => {
    if (i === 0 || i === stages.length - 1) return;
    const pill = document.createElement('div');
    pill.className = 'sf-stage-pill';
    pill.textContent = s.label;
    pill.style.top = `calc(${s.y}% - 10px)`;
    vis.appendChild(pill);
  });

  // Counters at top and bottom
  const counterTop = document.createElement('div');
  counterTop.className = 'sf-funnel-counter';
  counterTop.style.top = '12px';
  counterTop.style.left = '50%';
  counterTop.style.transform = 'translateX(-50%)';
  counterTop.textContent = '10,000 records';
  vis.appendChild(counterTop);

  const counterBot = document.createElement('div');
  counterBot.className = 'sf-funnel-counter';
  counterBot.style.bottom = '12px';
  counterBot.style.left = '50%';
  counterBot.style.transform = 'translateX(-50%)';
  counterBot.style.background = 'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#e9b6ff 100%)';
  counterBot.style.color = '#fff';
  counterBot.style.borderColor = 'transparent';
  counterBot.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)';
  counterBot.textContent = '42 booked';
  vis.appendChild(counterBot);

  // Particles
  const particles = [];
  const NUM_PARTICLES = 26;

  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'sf-particle';
    if (Math.random() > 0.6) p.classList.add('house');
    vis.appendChild(p);
    return {
      el: p,
      y: -20,
      x: 50 + (Math.random() - 0.5) * 70, // start in top ~92% width
      vy: 0.5 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.2,
      life: 0,
      stageIdx: 0,
      dropped: false,
    };
  }

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(spawnParticle());
    particles[i].y = -20 - Math.random() * 200;
  }

  function widthAtY(yPct) {
    // linear interpolate width between stages
    for (let i = 0; i < stages.length - 1; i++) {
      if (yPct >= stages[i].y && yPct <= stages[i + 1].y) {
        const t = (yPct - stages[i].y) / (stages[i + 1].y - stages[i].y);
        return stages[i].w + (stages[i + 1].w - stages[i].w) * t;
      }
    }
    return stages[stages.length - 1].w;
  }

  let activeStage = 0;
  let animating = true;

  function step() {
    if (!animating) return;
    particles.forEach((p, idx) => {
      // Determine which stage band particle is in
      let curStage = 0;
      for (let i = 0; i < stages.length; i++) {
        if (p.y >= stages[i].y) curStage = i;
      }

      // At a band boundary, randomly drop based on cumulative survival rate
      if (curStage > p.stageIdx && !p.dropped) {
        const survivalRate = stages[curStage].count / stages[Math.max(0, curStage - 1)].count;
        if (Math.random() > survivalRate * 1.4) {
          p.dropped = true;
          p.el.classList.add('dropped');
          // Drift to side
          p.vx = (p.x < 50 ? -1 : 1) * (0.6 + Math.random() * 0.3);
          p.vy = 0.3;
        }
        p.stageIdx = curStage;
        if (curStage > activeStage) {
          activeStage = curStage;
          rows.forEach((r, ri) => r.classList.toggle('active', ri === Math.min(activeStage, rows.length - 1)));
        }
      }

      // Move
      p.y += p.vy;
      p.x += p.vx;

      // Constrain to funnel width
      if (!p.dropped) {
        const w = widthAtY(p.y);
        const halfPct = w / 2;
        const minX = 50 - halfPct + 2;
        const maxX = 50 + halfPct - 2;
        if (p.x < minX) { p.x = minX; p.vx = Math.abs(p.vx); }
        if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
      }

      // Position
      p.el.style.left = p.x + '%';
      p.el.style.top = p.y + '%';

      // Reset off-screen
      if (p.y > 105) {
        p.el.remove();
        const np = spawnParticle();
        np.y = -20 - Math.random() * 100;
        particles[idx] = np;
      }
    });
    requestAnimationFrame(step);
  }

  // Activate first row by default
  rows.forEach((r, i) => r.classList.toggle('active', i === 0));

  // Start when in view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !animating) {
        animating = true;
        requestAnimationFrame(step);
      } else if (!e.isIntersecting) {
        animating = false;
      }
    });
  }, { threshold: 0.1 });
  obs.observe(funnel);
  requestAnimationFrame(step);

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      particles.forEach(p => p.el.remove());
      particles.length = 0;
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const np = spawnParticle();
        np.y = -20 - Math.random() * 200;
        particles.push(np);
      }
      activeStage = 0;
      rows.forEach((r, i) => r.classList.toggle('active', i === 0));
    });
  }

  // Hover row → highlight stage
  rows.forEach((r, i) => {
    r.addEventListener('mouseenter', () => {
      rows.forEach(rr => rr.classList.remove('active'));
      r.classList.add('active');
    });
  });
})();

// ── CALENDAR popovers ──
(() => {
  const cal = document.querySelector('.sf-cal-mock');
  if (!cal) return;
  const popover = cal.querySelector('.sf-cal-popover');
  if (!popover) return;
  const cells = cal.querySelectorAll('.sf-cal-cell.filled');

  cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      const data = cell.dataset;
      popover.querySelector('.sf-cal-popover-name').textContent = data.name || '';
      popover.querySelector('.sf-cal-popover-addr').textContent = data.addr || '';
      popover.querySelector('[data-pf="own"]').textContent = data.own || '';
      popover.querySelector('[data-pf="solar"]').textContent = data.solar || '';
      popover.querySelector('[data-pf="credit"]').textContent = data.credit || '';
      popover.querySelector('[data-pf="roof"]').textContent = data.roof || '';

      const cellRect = cell.getBoundingClientRect();
      const calRect = cal.getBoundingClientRect();
      let left = cellRect.left - calRect.left + cellRect.width / 2 - 120;
      let top = cellRect.bottom - calRect.top + 8;
      // clamp
      left = Math.max(8, Math.min(left, cal.clientWidth - 248));
      // if too low, show above
      if (top + 180 > cal.clientHeight) {
        top = cellRect.top - calRect.top - 180;
      }
      popover.style.left = left + 'px';
      popover.style.top = top + 'px';
      popover.classList.add('show');
    });
    cell.addEventListener('mouseleave', () => {
      popover.classList.remove('show');
    });
  });
})();

// ── COST CALCULATOR ──
(() => {
  const card = document.querySelector('.sf-cost-card');
  if (!card) return;
  const rate = card.querySelector('#sf-cost-rate');
  const hours = card.querySelector('#sf-cost-hours');
  const closers = card.querySelector('#sf-cost-closers');
  const rateVal = card.querySelector('#sf-cost-rate-val');
  const hoursVal = card.querySelector('#sf-cost-hours-val');
  const closersVal = card.querySelector('#sf-cost-closers-val');
  const result = card.querySelector('#sf-cost-result');
  const recover = card.querySelector('#sf-cost-recover-val');

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function update() {
    const r = +rate.value;
    const h = +hours.value;
    const c = +closers.value;
    rateVal.textContent = '$' + r;
    hoursVal.textContent = h + ' hrs/wk';
    closersVal.textContent = c + (c === 1 ? ' closer' : ' closers');
    const annualLost = r * h * c * 50; // 50 working weeks
    result.textContent = fmt(annualLost);
    // Premura recovers ~85% of those hours
    const recovered = annualLost * 0.85;
    recover.textContent = fmt(recovered);
  }
  [rate, hours, closers].forEach(s => s && s.addEventListener('input', update));
  update();
})();

// ── TERRITORY HEATMAP (MapLibre) ──
(() => {
  const sec = document.getElementById('sf-territory');
  if (!sec) return;
  const mapEl = sec.querySelector('.sf-terr-map');
  const filters = sec.querySelectorAll('.sf-terr-filter');
  const readout = sec.querySelector('#sf-terr-count');
  if (!mapEl || !window.US_GEO || !window.PremuraMap) return;

  // Container for MapLibre — sits behind the chrome/readout overlays
  const mapBox = document.createElement('div');
  mapBox.id = 'sfTerrMaplibre';
  mapBox.style.cssText = 'position:absolute;inset:0;border-radius:inherit;overflow:hidden;';
  mapEl.insertBefore(mapBox, mapEl.firstChild);

  // tooltip
  const tip = document.createElement('div');
  tip.className = 'sf-terr-tooltip';
  mapEl.appendChild(tip);

  const baseCount = { rural: 1840000, gated: 720000, spanish: 2150000, highvalue: 1280000 };
  const active = new Set(['rural']);
  const TOP_LABEL = new Set(['Miami','NYC','Los Angeles','Chicago','Houston','Phoenix','Atlanta','Dallas','Seattle','Denver','Boston','San Francisco']);

  const markerEntries = [];

  function currentHeat(m) {
    let h = 0;
    active.forEach(k => { h = Math.max(h, m.w[k] || 0); });
    return h;
  }

  function applyFilters() {
    markerEntries.forEach(({ meta, halo, core, label }) => {
      const heat = currentHeat(meta);
      const haloSize = heat === 0 ? 0 : 18 + heat * 18; // 36, 54, 72
      const coreSize = heat === 0 ? 0 : 4 + heat * 1.8;
      halo.style.width = halo.style.height = haloSize + 'px';
      halo.style.opacity = heat === 0 ? '0' : (0.32 + heat * 0.18);
      core.style.width = core.style.height = coreSize + 'px';
      core.style.opacity = heat === 0 ? '0' : '1';
      if (label) label.style.opacity = heat >= 2 ? '1' : '0';
    });

    let total = 0;
    active.forEach(k => total += baseCount[k] || 0);
    if (readout) {
      const cur = +readout.dataset.cur || 0;
      const start = performance.now();
      const dur = 700;
      const animate = now => {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const v = Math.round(cur + (total - cur) * ease);
        readout.textContent = v.toLocaleString();
        if (t < 1) requestAnimationFrame(animate);
        else readout.dataset.cur = total;
      };
      requestAnimationFrame(animate);
    }
  }

  filters.forEach(btn => {
    const k = btn.dataset.filter;
    if (active.has(k)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      if (active.has(k)) active.delete(k);
      else active.add(k);
      btn.classList.toggle('active');
      applyFilters();
    });
  });

  // Init MapLibre with locked CONUS view
  PremuraMap.initPurpleMap({
    containerId: 'sfTerrMaplibre',
    center: [-96.5, 39.0],
    zoom: 3.4,
    locked: true
  }).then(map => {
    // Build markers for each metro
    US_GEO.metros.forEach(m => {
      if (typeof m.lng !== 'number') return;
      const wrap = document.createElement('div');
      wrap.className = 'sf-metro-marker';
      wrap.style.cssText = 'position:relative;width:0;height:0;display:flex;align-items:center;justify-content:center;cursor:pointer;';

      const halo = document.createElement('div');
      halo.className = 'sf-metro-halo-ml';
      halo.style.cssText = 'position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(233,182,255,.95) 0%,rgba(168,85,247,.55) 40%,rgba(124,58,237,0) 100%);transform:translate(-50%,-50%);transition:width .55s cubic-bezier(.4,0,.2,1),height .55s cubic-bezier(.4,0,.2,1),opacity .55s ease;pointer-events:none;width:0;height:0;opacity:0;';
      wrap.appendChild(halo);

      const core = document.createElement('div');
      core.className = 'sf-metro-core-ml';
      core.style.cssText = 'position:absolute;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(233,182,255,.9),0 0 16px rgba(168,85,247,.7);transform:translate(-50%,-50%);transition:width .35s ease,height .35s ease,opacity .35s ease;pointer-events:none;width:0;height:0;opacity:0;';
      wrap.appendChild(core);

      let label = null;
      if (TOP_LABEL.has(m.name)) {
        label = document.createElement('div');
        label.className = 'sf-metro-label-ml';
        label.textContent = m.name;
        label.style.cssText = 'position:absolute;left:10px;top:-6px;font-family:"JetBrains Mono",monospace;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.9);white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .35s ease;letter-spacing:.04em;';
        wrap.appendChild(label);
      }

      // hit area
      const hit = document.createElement('div');
      hit.style.cssText = 'position:absolute;width:32px;height:32px;left:-16px;top:-16px;border-radius:50%;';
      wrap.appendChild(hit);

      hit.addEventListener('mouseenter', e => {
        const heat = currentHeat(m);
        const est = Math.round(heat * 14000 + m.w.rural * 1500 + m.w.gated * 1200);
        tip.innerHTML = '<strong>' + m.name + '</strong>~' + est.toLocaleString() + ' in selected segments';
        const r = mapEl.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left + 12) + 'px';
        tip.style.top = (e.clientY - r.top + 12) + 'px';
        tip.classList.add('show');
      });
      hit.addEventListener('mousemove', e => {
        const r = mapEl.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left + 12) + 'px';
        tip.style.top = (e.clientY - r.top + 12) + 'px';
      });
      hit.addEventListener('mouseleave', () => tip.classList.remove('show'));

      new maplibregl.Marker({ element: wrap, anchor: 'center' })
        .setLngLat([m.lng, m.lat])
        .addTo(map);

      markerEntries.push({ meta: m, halo, core, label });
    });

    applyFilters();
  }).catch(err => {
    console.warn('[solar territory map]', err);
  });
})();
