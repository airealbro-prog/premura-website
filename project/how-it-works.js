// ═══ HOW IT WORKS — Mission Control scroll engine ═══
(function(){
  const track = document.getElementById('mcTrack');
  if (!track) return;

  const scenes      = Array.from(document.querySelectorAll('.mc-scene'));
  const railFill    = document.getElementById('mcRailFill');
  const railStops   = Array.from(document.querySelectorAll('.mc-rail-stop'));
  const dayNum      = document.getElementById('mcDayNum');
  const dayFill     = document.getElementById('mcDayFill');
  const phaseTitle  = document.getElementById('mcPhaseTitle');
  const progFill    = document.getElementById('mcProgressFill');
  const progPct     = document.getElementById('mcProgressPct');
  const bigNum      = document.getElementById('mcBigNum');
  const systems     = Array.from(document.querySelectorAll('.mc-system'));

  const s5Calls = document.getElementById('s5Calls');
  const s5Appts = document.getElementById('s5Appts');
  const s5Show  = document.getElementById('s5Show');

  // Phase data
  const PHASES = [
    { title:'01 — Strategy Call',          day: 0,  bigNum:'01',
      systems:{strategy:'queued'} },
    { title:'02 — Onboarding',             day: 3,  bigNum:'02',
      systems:{strategy:'live', crm:'queued'} },
    { title:'03 — Recruit & Train',        day: 8,  bigNum:'03',
      systems:{strategy:'live', crm:'live', agents:'queued'} },
    { title:'04 — Launch',                 day: 14, bigNum:'04',
      systems:{strategy:'live', crm:'live', agents:'live', dialer:'queued'} },
    { title:'05 — Ongoing Optimization',   day: 30, bigNum:'05',
      systems:{strategy:'live', crm:'live', agents:'live', dialer:'live', appts:'live'} },
  ];

  let currentPhase = -1;
  let ticking = false;

  function setPhase(idx) {
    if (idx === currentPhase) return;
    currentPhase = idx;
    scenes.forEach((s, i) => s.classList.toggle('active', i === idx));
    railStops.forEach((s, i) => s.classList.toggle('active', i <= idx));
    const p = PHASES[idx];
    phaseTitle.textContent = p.title;
    bigNum.textContent = p.bigNum;

    // Scene 2: interview feed — flip status to Approved after checks animate
    if (idx === 2) {
      const statusEl = document.getElementById('s3Status');
      if (statusEl) {
        statusEl.classList.remove('approved');
        statusEl.innerHTML = '<span class="s3-status-dot"></span>Under review';
        setTimeout(() => {
          statusEl.classList.add('approved');
          statusEl.innerHTML = '<span class="s3-status-dot"></span>Approved ✓';
        }, 1800);
      }
    }

    // Update systems
    systems.forEach(sys => {
      const key = sys.dataset.sys;
      const state = p.systems[key];
      sys.classList.remove('queued','live');
      const stateEl = sys.querySelector('.mc-sys-state');
      if (state === 'queued') { sys.classList.add('queued'); stateEl.textContent = 'BUILD'; }
      else if (state === 'live') { sys.classList.add('live'); stateEl.textContent = 'LIVE'; }
      else { stateEl.textContent = '—'; }
    });
  }

  function update() {
    const rect = track.getBoundingClientRect();
    const scrollable = track.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));

    // Map progress to a phase index (0..4) — split scroll into 5 equal zones
    const phaseFloat = progress * 5;
    const phaseIdx = Math.min(4, Math.floor(phaseFloat));
    setPhase(phaseIdx);

    // Day counter — interpolate between phase day markers
    const phaseFrac = phaseFloat - phaseIdx;
    const startDay = PHASES[phaseIdx].day;
    const endDay   = phaseIdx < 4 ? PHASES[phaseIdx + 1].day : 30;
    const day = Math.round(startDay + (endDay - startDay) * phaseFrac);
    dayNum.textContent = String(Math.min(day, 14)).padStart(2, '0') + (day > 14 ? '+' : '');
    dayFill.style.width = Math.min(100, (Math.min(day,14) / 14) * 85 + (day > 14 ? 15 : 0)) + '%';

    // Rail + progress
    const pct = Math.round(progress * 100);
    railFill.style.width = pct + '%';
    progFill.style.width = pct + '%';
    progPct.textContent = pct + '%';

    // Live counters in scene 5
    if (phaseIdx === 4) {
      const t = phaseFrac;
      s5Calls.textContent = Math.round(80 + t * 240);
      s5Appts.textContent = Math.round(2 + t * 11);
      s5Show.textContent  = Math.round(72 + t * 18) + '%';
    }
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });

  // Init
  setPhase(0);
  update();
})();
