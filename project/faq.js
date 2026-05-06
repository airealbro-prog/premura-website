/* FAQ — search, persona pivot, hot rank, chat stub */
(function(){
  'use strict';

  function init(){
    const search = document.getElementById('fqSearch');
    const clearBtn = document.getElementById('fqClear');
    const suggest = document.getElementById('fqSuggest');
    const items = document.querySelectorAll('.fq-item');
    const groups = document.querySelectorAll('.fq-group');
    const noResults = document.getElementById('fqNoResults');
    const personas = document.querySelectorAll('.fq-persona');
    const context = document.getElementById('fqContext');
    const sortBtn = document.getElementById('fqSort');
    const matchCountEl = document.getElementById('fqMatchCount');
    const chat = document.getElementById('fqChat');
    const chatClose = document.getElementById('fqChatClose');

    /* ── ACCORDIONS ── */
    items.forEach(item=>{
      const q = item.querySelector('.fq-q');
      const a = item.querySelector('.fq-ans');
      q.addEventListener('click', ()=>{
        const open = item.classList.toggle('open');
        a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
      });
    });

    /* ── SEARCH ── */
    function escapeRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
    function highlight(text, q){
      if(!q) return text;
      const re = new RegExp('('+escapeRe(q)+')','ig');
      return text.replace(re,'<mark>$1</mark>');
    }
    function clearHighlights(){
      items.forEach(it=>{
        const qEl = it.querySelector('.fq-q-text');
        qEl.innerHTML = qEl.dataset.original;
      });
    }
    items.forEach(it=>{
      const qEl = it.querySelector('.fq-q-text');
      qEl.dataset.original = qEl.textContent;
      const aEl = it.querySelector('.fq-ans-inner');
      it.dataset.search = (qEl.textContent + ' ' + aEl.textContent).toLowerCase();
    });

    function applySearch(query){
      const q = query.trim().toLowerCase();
      let matches = 0;
      if(!q){
        clearHighlights();
        items.forEach(it=>{
          it.classList.remove('match','dimmed','hidden');
        });
        groups.forEach(g=>g.style.display='');
        noResults.classList.remove('show');
        suggest.classList.remove('show');
        clearBtn.classList.remove('show');
        matchCountEl.textContent = items.length;
        return;
      }
      clearBtn.classList.add('show');
      items.forEach(it=>{
        const isMatch = it.dataset.search.includes(q);
        it.classList.toggle('match', isMatch);
        it.classList.toggle('dimmed', !isMatch);
        it.classList.toggle('hidden', !isMatch);
        if(isMatch){
          const qEl = it.querySelector('.fq-q-text');
          qEl.innerHTML = highlight(qEl.dataset.original, q);
          matches++;
        }
      });
      // hide groups with no matches
      groups.forEach(g=>{
        const visible = g.querySelectorAll('.fq-item:not(.hidden)').length;
        g.style.display = visible ? '' : 'none';
      });
      noResults.classList.toggle('show', matches === 0);
      matchCountEl.textContent = matches;

      // suggestions
      buildSuggest(q);
    }

    function buildSuggest(q){
      const matched = [...items].filter(it=>it.dataset.search.includes(q)).slice(0,5);
      if(matched.length === 0){
        suggest.innerHTML = '<div class="fq-suggest-empty">No matches — but our team can answer in a 5-min call.</div>';
        suggest.classList.add('show');
        return;
      }
      suggest.innerHTML = matched.map(it=>{
        const qEl = it.querySelector('.fq-q-text');
        const text = highlight(qEl.dataset.original, q);
        const hot = it.dataset.hot;
        return `<div class="fq-suggest-row" data-target="${it.id}">
          <span>${text}</span>
          <span class="fq-hot ${hot==='hot'?'':hot==='warm'?'warm':'mild'}" style="font-size:.6rem;">${it.dataset.pct}%</span>
        </div>`;
      }).join('');
      suggest.classList.add('show');
      suggest.querySelectorAll('.fq-suggest-row').forEach(row=>{
        row.addEventListener('click', ()=>{
          const target = document.getElementById(row.dataset.target);
          if(target){
            // open it and scroll
            const q = target.querySelector('.fq-q');
            if(!target.classList.contains('open')) q.click();
            target.scrollIntoView({behavior:'smooth', block:'center'});
            suggest.classList.remove('show');
          }
        });
      });
    }

    search.addEventListener('input', ()=>applySearch(search.value));
    search.addEventListener('focus', ()=>{
      if(search.value.trim()) buildSuggest(search.value.trim().toLowerCase());
    });
    document.addEventListener('click', e=>{
      if(!e.target.closest('.fq-search') && !e.target.closest('.fq-suggest')){
        suggest.classList.remove('show');
      }
    });
    clearBtn.addEventListener('click', ()=>{
      search.value = '';
      applySearch('');
      search.focus();
    });

    /* ── PERSONA PIVOT ── */
    const PERSONA_CONTEXT = {
      all: '',
      solar: 'Showing answers tinted for <strong>solar</strong> companies — typical campaigns book 5–8 qualified appointments per agent per week.',
      roofing: 'Showing answers tinted for <strong>roofing</strong> companies — storm-response queues activate within 24 hours of qualifying NOAA events.',
      curious: 'You\'re just exploring — start with the <strong>most-asked questions</strong>, sorted by frequency.',
    };

    const SOLAR_BOOST = ['q-diff','q-state','q-competitive','q-tech','q-calendar'];
    const ROOFING_BOOST = ['q-state','q-competitive','q-diff','q-perform','q-many'];

    let activePersona = 'all';
    function applyPersona(p){
      activePersona = p;
      personas.forEach(el=>el.classList.toggle('active', el.dataset.p === p));
      context.innerHTML = PERSONA_CONTEXT[p];
      context.classList.toggle('show', p !== 'all');

      // reorder items in their groups
      const order = p === 'solar' ? SOLAR_BOOST : p === 'roofing' ? ROOFING_BOOST : null;
      groups.forEach(g=>{
        const list = [...g.querySelectorAll('.fq-item')];
        if(p === 'curious'){
          // sort by hot percentage desc
          list.sort((a,b)=>parseInt(b.dataset.pct,10)-parseInt(a.dataset.pct,10));
        } else if(order){
          list.sort((a,b)=>{
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            const av = ai === -1 ? 999 : ai;
            const bv = bi === -1 ? 999 : bi;
            return av - bv;
          });
        } else {
          list.sort((a,b)=>parseInt(a.dataset.idx,10)-parseInt(b.dataset.idx,10));
        }
        list.forEach(li=>g.appendChild(li));
      });
    }

    personas.forEach(el=>{
      el.addEventListener('click', ()=>applyPersona(el.dataset.p));
    });

    /* ── SORT TOGGLE ── */
    let hotSort = false;
    sortBtn.addEventListener('click', ()=>{
      hotSort = !hotSort;
      sortBtn.classList.toggle('active', hotSort);
      sortBtn.textContent = hotSort ? '✓ Sorted by frequency' : 'Sort by most asked';
      groups.forEach(g=>{
        const list = [...g.querySelectorAll('.fq-item')];
        if(hotSort){
          list.sort((a,b)=>parseInt(b.dataset.pct,10)-parseInt(a.dataset.pct,10));
        } else {
          list.sort((a,b)=>parseInt(a.dataset.idx,10)-parseInt(b.dataset.idx,10));
        }
        list.forEach(li=>g.appendChild(li));
      });
    });

    matchCountEl.textContent = items.length;
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
