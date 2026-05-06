/* ════════════════════════════════════════════════
   ABOUT PAGE — interactions
   1. Three-options compare (tab cards)
   2. Wall of Agents (live grid w/ statuses + popovers)
   3. Origin timeline (animated counters on scroll)
   ════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ──────── 1. THREE-OPTIONS COMPARE ──────── */
  function initCompare(){
    const sec = document.getElementById('about-hero');
    if(!sec) return;
    const tabs = sec.querySelectorAll('.ah-tab');
    const cards = sec.querySelectorAll('.ah-card');

    let auto = setInterval(()=>{
      const cur = sec.querySelector('.ah-tab.active');
      const next = cur.nextElementSibling || tabs[0];
      next.click();
    }, 5500);

    tabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{
        tabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.dataset.key;
        cards.forEach(c=>c.classList.toggle('show', c.dataset.key === key));
      });
      tab.addEventListener('mouseenter', ()=>{ clearInterval(auto); });
    });
  }

  /* ──────── 2. WALL OF AGENTS ──────── */
  function initWall(){
    const sec = document.getElementById('about-wall');
    if(!sec) return;
    const grid = sec.querySelector('.aw-grid');
    const card = sec.querySelector('.aw-tile-card');
    const onCallEl = sec.querySelector('#awOnCall');
    const dialEl   = sec.querySelector('#awDialing');
    const bookEl   = sec.querySelector('#awBooked');

    const TOTAL = 160;
    // distribution: 38% on call, 42% dialing, 12% booking, 8% break
    const statuses = [];
    for(let i=0;i<TOTAL;i++){
      const r = Math.random();
      if(r<.38) statuses.push('call');
      else if(r<.80) statuses.push('dial');
      else if(r<.92) statuses.push('book');
      else statuses.push('break');
    }

    // names + cities
    const FIRSTS = ['Maya','Jordan','Aisha','Diego','Priya','Marcus','Elena','Tomás','Nadia','Kenji','Olivia','Rashid','Sofia','Devin','Yuki','Camila','Theo','Amaya','Luca','Saanvi','Brendan','Ines','Rohan','Layla','Felix','Imani','Owen','Zara','Mateo','Kira'];
    const LASTS  = ['Reyes','Park','Coleman','Vega','Okafor','Singh','Ortega','Nakamura','Tran','Brennan','Mendoza','Kowalski','Doyle','Patel','Castillo','Hayek','Roa','Adeyemi','Kim','Beltran'];
    const CITIES = ['Phoenix AZ','Tampa FL','Austin TX','Denver CO','Atlanta GA','San Diego CA','Las Vegas NV','Charlotte NC','Dallas TX','Sacramento CA'];

    const STATUS_COPY = {
      call:  {label:'On Call',  metric:'Live now', metricVal:'12 min in'},
      dial:  {label:'Dialing',  metric:'Calls today', metricVal:'87'},
      book:  {label:'Booking',  metric:'Booked today', metricVal:'4 appts'},
      break: {label:'On Break', metric:'Back at', metricVal:'2:15 PM'},
    };

    // build tiles
    const frag = document.createDocumentFragment();
    statuses.forEach((s,i)=>{
      const t = document.createElement('div');
      t.className = `aw-tile s-${s}`;
      t.dataset.idx = i;
      t.dataset.status = s;
      const f = FIRSTS[i % FIRSTS.length];
      const l = LASTS[(i*7) % LASTS.length];
      const c = CITIES[(i*3) % CITIES.length];
      t.dataset.name = `${f} ${l[0]}.`;
      t.dataset.city = c;
      t.dataset.tenure = (1 + ((i*13) % 36)) + ' months';
      t.dataset.calls = (40 + ((i*17) % 90));
      t.dataset.bookings = (1 + ((i*5) % 8));
      frag.appendChild(t);
    });
    grid.appendChild(frag);

    // counters
    function tally(){
      let c=0,d=0,b=0;
      statuses.forEach(s=>{ if(s==='call')c++; else if(s==='dial')d++; else if(s==='book')b++; });
      onCallEl.textContent = c;
      dialEl.textContent = d;
      bookEl.textContent = b;
    }
    tally();

    // popover on hover
    const tiles = grid.querySelectorAll('.aw-tile');
    tiles.forEach(t=>{
      t.addEventListener('mouseenter', e=>{
        const s = t.dataset.status;
        const sc = STATUS_COPY[s];
        const initials = t.dataset.name.split(' ').map(p=>p[0]).join('').slice(0,2);
        card.innerHTML = `
          <div class="aw-tile-card-head">
            <div class="aw-tile-avatar">${initials}</div>
            <div>
              <div class="aw-tile-name">${t.dataset.name}</div>
              <div class="aw-tile-role">${t.dataset.city}</div>
            </div>
          </div>
          <div class="aw-tile-row" style="border:none;padding-bottom:8px;">
            <span class="aw-tile-status s-${s}">● ${sc.label}</span>
          </div>
          <div class="aw-tile-row"><span>${sc.metric}</span><strong>${sc.metricVal}</strong></div>
          <div class="aw-tile-row"><span>Tenure</span><strong>${t.dataset.tenure}</strong></div>
          <div class="aw-tile-row"><span>Today's calls</span><strong>${t.dataset.calls}</strong></div>
          <div class="aw-tile-row"><span>Today's bookings</span><strong>${t.dataset.bookings}</strong></div>
        `;
        const r = t.getBoundingClientRect();
        const stage = sec.querySelector('.aw-stage').getBoundingClientRect();
        const left = r.left - stage.left + r.width/2;
        const top  = r.top  - stage.top + r.height + 14;
        card.style.left = Math.max(14, Math.min(stage.width - 260, left - 130)) + 'px';
        card.style.top  = top + 'px';
        card.classList.add('show');
      });
      t.addEventListener('mouseleave', ()=>{
        card.classList.remove('show');
      });
    });

    // live churn — every 1.4s flip a few tiles to a new status
    const STATES = ['call','dial','book','break'];
    setInterval(()=>{
      for(let k=0; k<6; k++){
        const idx = Math.floor(Math.random() * TOTAL);
        const cur = statuses[idx];
        // weighted move toward call/dial
        const r = Math.random();
        let next;
        if(r<.4) next='call'; else if(r<.8) next='dial';
        else if(r<.93) next='book'; else next='break';
        if(next === cur) continue;
        statuses[idx] = next;
        const tile = tiles[idx];
        tile.classList.remove(`s-${cur}`);
        tile.classList.add(`s-${next}`);
        tile.dataset.status = next;
      }
      tally();
    }, 1400);
  }

  /* ──────── 3. ORIGIN TIMELINE ──────── */
  function initTimeline(){
    const sec = document.getElementById('about-timeline');
    if(!sec) return;
    const stops = sec.querySelectorAll('.at-stop');
    const progress = sec.querySelector('.at-progress');

    function easeOutCubic(k){return 1 - Math.pow(1-k, 3);}
    function animateNum(el, target, dur=1400){
      const start = performance.now();
      const isFloat = String(target).includes('.');
      function tick(now){
        const k = Math.min(1, (now-start)/dur);
        const v = target * easeOutCubic(k);
        el.textContent = isFloat ? v.toFixed(1) : Math.round(v).toLocaleString();
        if(k<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const seen = new Set();
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const stop = e.target;
        if(seen.has(stop)) return;
        seen.add(stop);
        stop.classList.add('in');
        // animate counter
        const numEl = stop.querySelector('.at-stop-num span');
        if(numEl){
          const tgt = parseFloat(numEl.dataset.to);
          animateNum(numEl, tgt);
        }
        // grow progress line
        const idx = [...stops].indexOf(stop);
        const total = stops.length;
        if(progress){
          const pct = ((idx + 1) / total) * 100;
          progress.style.width = pct + '%';
        }
      });
    }, {threshold: .35});
    stops.forEach(s=>io.observe(s));
  }

  /* ──────── BOOT ──────── */
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{
      initCompare(); initWall(); initTimeline();
    });
  } else {
    initCompare(); initWall(); initTimeline();
  }
})();
