/* ════════════════════════════════════════════════
   TECHNOLOGY PAGE — interactivity
   ════════════════════════════════════════════════ */

(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',init);

  function init(){
    initStackPulses();
    initCRM();
    initDialer();
    initCalendar();
    initChat();
  }

  /* ── 1. Hero stack pulses ── */
  function initStackPulses(){
    const nodes=document.querySelectorAll('.tk-node');
    if(!nodes.length)return;
    let i=0;
    setInterval(()=>{
      nodes.forEach(n=>n.removeAttribute('data-pulse'));
      nodes[i%nodes.length].setAttribute('data-pulse','active');
      // animate the SVG path
      const paths=document.querySelectorAll('.tk-wire');
      paths.forEach((p,idx)=>{
        if(idx===i%paths.length){
          p.style.animation='none';
          requestAnimationFrame(()=>{p.style.animation='tkWire 1.4s ease-out';});
        }
      });
      i++;
    },1400);
  }

  /* ── 2. CRM populating cards ── */
  function initCRM(){
    const newCol=document.querySelector('[data-col="new"]');
    const qualCol=document.querySelector('[data-col="qual"]');
    const bookedCol=document.querySelector('[data-col="booked"]');
    const counterEl=document.querySelector('[data-counter]');
    if(!newCol||!qualCol||!bookedCol)return;

    const leads=[
      {name:'Marcus T.',meta:'Phoenix, AZ',tags:['homeowner','high-bill'],time:'just now'},
      {name:'Janet R.',meta:'Tucson, AZ',tags:['credit ✓','roof ✓'],time:'1m ago'},
      {name:'Devon K.',meta:'Mesa, AZ',tags:['homeowner'],time:'3m ago'},
      {name:'Priya S.',meta:'Chandler, AZ',tags:['credit ✓','interest hi'],time:'5m ago'},
      {name:'Omar H.',meta:'Scottsdale, AZ',tags:['homeowner','SRP'],time:'7m ago'},
      {name:'Lina C.',meta:'Glendale, AZ',tags:['credit ✓'],time:'9m ago'},
      {name:'Rafael G.',meta:'Tempe, AZ',tags:['roof ✓'],time:'11m ago'},
      {name:'Sasha B.',meta:'Gilbert, AZ',tags:['homeowner','high-bill'],time:'14m ago'},
    ];

    const counter={today:127};
    const renderCounter=()=>{counterEl.innerHTML=`<span>${counter.today}</span> appointments today`;};
    renderCounter();

    // pre-populate
    addCard(newCol,leads[0],'');addCard(newCol,leads[2],'');
    addCard(qualCol,leads[1],'qualified');addCard(qualCol,leads[3],'qualified');
    addCard(bookedCol,leads[4],'booked');addCard(bookedCol,leads[5],'booked');addCard(bookedCol,leads[6],'booked');

    // animate progression
    let step=0;
    setInterval(()=>{
      step++;
      if(step%3===0){
        // promote a "new" card to qualified
        const card=newCol.firstElementChild;
        if(card){
          card.remove();
          card.classList.add('qualified');
          card.style.animation='tkCardIn .4s ease-out';
          qualCol.prepend(card);
          while(qualCol.children.length>4)qualCol.lastElementChild.remove();
        }
      }else if(step%3===1){
        // promote a qualified to booked
        const card=qualCol.firstElementChild;
        if(card){
          card.remove();
          card.classList.remove('qualified');
          card.classList.add('booked');
          card.style.animation='tkCardIn .4s ease-out';
          bookedCol.prepend(card);
          while(bookedCol.children.length>4)bookedCol.lastElementChild.remove();
          counter.today++;renderCounter();
        }
      }else{
        // add a new lead
        const lead=leads[Math.floor(Math.random()*leads.length)];
        addCard(newCol,{...lead,time:'just now'},'');
        while(newCol.children.length>4)newCol.lastElementChild.remove();
      }
    },2400);
  }

  function addCard(col,lead,extra){
    const div=document.createElement('div');
    div.className='tk-crm-card '+(extra||'');
    div.innerHTML=`
      <div class="tkc-name">${lead.name}</div>
      <div class="tkc-meta"><span>${lead.meta}</span><span>${lead.time}</span></div>
      <div class="tkc-tags">${lead.tags.map(t=>`<span class="tkc-tag">${t}</span>`).join('')}</div>
    `;
    col.appendChild(div);
  }

  /* ── 3. Dialer live counters + queue ── */
  function initDialer(){
    const stats={
      calls:document.querySelector('[data-stat="calls"]'),
      connect:document.querySelector('[data-stat="connect"]'),
      agents:document.querySelector('[data-stat="agents"]'),
      booked:document.querySelector('[data-stat="booked"]'),
    };
    const clock=document.querySelector('[data-dialer-clock]');
    const queue=document.querySelector('[data-queue]');
    if(!queue)return;

    const state={calls:1247,connect:38,agents:14,booked:23};

    const seedNames=[
      ['Robert M.','Phoenix, AZ'],['Anita W.','Tucson, AZ'],['Carlos D.','Mesa, AZ'],
      ['Yuki T.','Tempe, AZ'],['Brenda L.','Chandler, AZ'],['Hassan O.','Glendale, AZ'],
      ['Patricia G.','Scottsdale, AZ'],['Ethan J.','Gilbert, AZ'],['Sonia A.','Surprise, AZ']
    ];
    const statuses=['Dialing…','Connected','Wrap-up','Ringing','Connected','Voicemail','Connected'];

    function addCall(live=false){
      const [name,city]=seedNames[Math.floor(Math.random()*seedNames.length)];
      const status=live?'Connected':statuses[Math.floor(Math.random()*statuses.length)];
      const isLive=live||status==='Connected';
      const sec=Math.floor(Math.random()*180)+5;
      const t=`${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;
      const row=document.createElement('div');
      row.className='tk-call-row '+(isLive?'live':'');
      row.innerHTML=`
        <span class="tk-call-status-dot"></span>
        <span class="tk-call-name">${name} <span class="tk-call-meta">· ${city}</span></span>
        <span class="tk-call-status">${status}</span>
        <span class="tk-call-time">${t}</span>
      `;
      queue.prepend(row);
      while(queue.children.length>5)queue.lastElementChild.remove();
    }

    // seed
    for(let i=0;i<5;i++)addCall(i%2===0);

    // tick stats
    setInterval(()=>{
      state.calls+=Math.floor(Math.random()*4)+1;
      if(stats.calls)stats.calls.textContent=state.calls.toLocaleString();
      // bounce connect rate
      state.connect=Math.max(32,Math.min(44,state.connect+(Math.random()<.5?-1:1)));
      if(stats.connect)stats.connect.textContent=state.connect+'%';
      // occasionally add a booked
      if(Math.random()<.18){state.booked++;if(stats.booked)stats.booked.textContent=state.booked;}
      if(stats.agents)stats.agents.textContent=state.agents;
    },2200);

    // add new calls
    setInterval(()=>addCall(Math.random()<.5),2800);

    // clock
    if(clock){
      const update=()=>{
        const d=new Date();
        clock.textContent=d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+' MST';
      };
      update();setInterval(update,1000);
    }
  }

  /* ── 4. Calendar — appointments dropping in ── */
  function initCalendar(){
    const grid=document.querySelector('[data-cal-grid]');
    if(!grid)return;

    // 5 days × 4 hour slots → cells already exist in HTML
    // Periodically inject new appointments
    const slots=[
      {col:1,row:1,name:'Marcus T.',time:'9:00 AM'},
      {col:2,row:2,name:'Janet R.',time:'10:00 AM'},
      {col:3,row:0,name:'Devon K.',time:'8:00 AM'},
      {col:4,row:3,name:'Priya S.',time:'11:00 AM'},
      {col:1,row:3,name:'Omar H.',time:'11:00 AM'},
      {col:5,row:1,name:'Lina C.',time:'9:00 AM'},
      {col:2,row:0,name:'Rafael G.',time:'8:00 AM'},
      {col:3,row:2,name:'Sasha B.',time:'10:00 AM'},
    ];

    let idx=0;
    const placeNext=()=>{
      const slot=slots[idx%slots.length];
      const cell=grid.querySelector(`[data-col="${slot.col}"][data-row="${slot.row}"]`);
      if(cell&&!cell.querySelector('.tk-appt')){
        const a=document.createElement('div');
        a.className='tk-appt new';
        a.innerHTML=`<strong>${slot.name}</strong><small>${slot.time}</small>`;
        cell.appendChild(a);
      }
      idx++;
    };
    // pre-fill 4 immediately, then drop one every 3s
    placeNext();placeNext();placeNext();placeNext();
    setInterval(placeNext,3200);
  }

  /* ── 5. Chat thread ── */
  function initChat(){
    const body=document.querySelector('[data-chat]');
    if(!body)return;

    const messages=[
      {name:'Maya R.',role:'AGENT',av:['#a855f7','#7c3aed'],text:'Just booked Marcus T. in Phoenix for Tuesday 10am. Homeowner, $340 SRP bill, owns outright.',time:'2:14',alert:false},
      {name:'Premura',role:'SYSTEM',av:['#10b981','#059669'],text:'<strong>📅 Appointment booked</strong> · Marcus T. · Tue 10:00 AM · Calendar synced',time:'2:14',alert:true},
      {name:'You',role:'OPERATOR',av:['#e9b6ff','#c084fc'],text:'Nice — that\'s 4 today. Closer is briefed. Keep going on the SRP territory list.',time:'2:15',alert:false},
      {name:'James K.',role:'AGENT',av:['#f59e0b','#d97706'],text:'Working through Tucson now. Connect rate looks strong this hour.',time:'2:18',alert:false},
      {name:'Maya R.',role:'AGENT',av:['#a855f7','#7c3aed'],text:'Got Janet R. — credit qualified, roof under 10 yrs. Booking her for Thursday.',time:'2:21',alert:false},
    ];

    let i=0;
    const renderNext=()=>{
      if(i>=messages.length){
        body.innerHTML='';i=0;
      }
      const m=messages[i];
      const div=document.createElement('div');
      div.className='tk-msg';
      div.innerHTML=`
        <div class="tk-msg-avatar" style="--av1:${m.av[0]};--av2:${m.av[1]}">${m.name.split(' ').map(s=>s[0]).join('').slice(0,2)}</div>
        <div class="tk-msg-body">
          <div class="tk-msg-head">
            <span class="tk-msg-name">${m.name}</span>
            <span class="tk-msg-role">${m.role}</span>
            <span class="tk-msg-time">${m.time} PM</span>
          </div>
          <div class="tk-msg-text ${m.alert?'alert':''}">${m.text}</div>
        </div>
      `;
      body.appendChild(div);
      // keep last 5
      while(body.children.length>5)body.firstElementChild.remove();
      i++;
    };
    // seed 4
    renderNext();renderNext();renderNext();renderNext();
    setInterval(renderNext,3500);
  }
})();
