/* ═══════════════════════════════════════════════════════════════════════
   SHARED testimonial data + helpers. Used by BOTH:
   • sales-testimonials.html  (internal directory, grouped by state)
   • sales-testimonial.html   (clean single-client page a rep sends to a lead)

   TO ASSIGN A STATE: change a client's  state:'TBD'  to their state name
   (e.g. state:'Florida'). TO ADD A QUOTE: fill the  quote:'...'  field.
   TO ADD A CLIENT: copy a block, give it a unique  id  (used in the share
   link, e.g. ?c=jorge) and its video (vimeo+hash+poster, or wistia+poster).
   ═══════════════════════════════════════════════════════════════════════ */
window.ST_DATA = [
  { id:'scott',   name:'Scott Kelly',      industry:'Solar', state:'Massachusetts',
    stat:'17 deals in his first 30 days, virtually, from the call center',
    quote:'Closed 17 deals in his first 30 days, virtually, straight from the call center.', vimeo:'1072241851', hash:'26fcdbbedd', poster:'assets/review-scott.jpg' },
  { id:'leicer',  name:'Leicer',           industry:'Solar', state:'Florida', area:'Miami & Broward County',
    stat:'$152,000 in payouts',
    quote:'22 deals in a single 30-day stretch, and $152,000 in payouts from his call center.', vimeo:'1072244795', hash:'5d8bc1fb19', poster:'assets/review-leicer.jpg' },
  { id:'caesar',  name:'Caesar',           industry:'Solar', state:'Florida', area:'South Florida',
    stat:'8–10 installs a month',
    quote:'Booking 8 to 10 solar installs a month with his call center.', vimeo:'1072251232', hash:'50162c383c', poster:'assets/review-caesar.jpg' },
  { id:'rafa',    name:'Rafa',             industry:'Solar', state:'California',
    stat:'12+ deals a month',
    quote:'12+ deals a month, every month, from the call center.', vimeo:'1091678713', hash:'243b833aa0', poster:'assets/review-rafa.jpg' },
  { id:'rossey',  name:'Mitchell Rossey',  industry:'Solar', state:'Pennsylvania',
    stat:'50–60 appointments a month',
    quote:"We're gonna do probably fifty to sixty appointments, twenty more than what I expected. Definitely outperforming where I assumed it would go.", wistia:'mevvlasmcv', poster:'assets/review-rossey.jpg' },
  { id:'jorge',   name:'Jorge',            industry:'Solar', state:'TBD',
    stat:'20+ deals a month',
    quote:'20+ deals a month running his own call center.', vimeo:'1072247746', hash:'d493e53744', poster:'assets/review-jorge.jpg' },
  { id:'velardi', name:'Michael Velardi',  industry:'Solar', state:'New York',
    stat:'18 sales a month',
    quote:"In the last ten days, I think I had six sales. That's eighteen sales in a month, probably a forty percent close rate based on appointments.", wistia:'7wj6qo1loi', poster:'assets/review-velardi.jpg' }
];

window.ST_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

window.ST = (function(){
  var PLAY="<svg viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>";
  function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}
  function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
  function find(id){for(var i=0;i<window.ST_DATA.length;i++){if(window.ST_DATA[i].id===id)return window.ST_DATA[i];}return null;}
  function loc(c){return (c.state&&c.state.toUpperCase()!=='TBD')?(c.state+(c.area?' · '+c.area:'')):'';}
  function baseIframe(src,title){
    var f=document.createElement('iframe');f.src=src;f.title=(title||'Premura')+' testimonial';
    f.allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share';
    f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';f.frameBorder='0';return f;
  }
  function facade(c){
    var href,srcFor;
    if(c.vimeo){href='https://vimeo.com/'+c.vimeo+'/'+c.hash;srcFor=function(){return 'https://player.vimeo.com/video/'+c.vimeo+'?h='+c.hash+'&autoplay=1&title=0&byline=0&portrait=0';};}
    else{href='https://premura.wistia.com/medias/'+c.wistia;srcFor=function(){return 'https://fast.wistia.net/embed/iframe/'+c.wistia+'?autoPlay=true';};}
    var a=document.createElement('a');a.className='st-embed';a.href=href;a.target='_blank';a.rel='noopener';
    a.setAttribute('role','button');a.setAttribute('aria-label','Play '+c.name);
    a.innerHTML="<img class='st-poster' loading='lazy' decoding='async' src='"+c.poster+"' alt='"+esc(c.name)+" testimonial'><span class='st-play' aria-hidden='true'>"+PLAY+"</span>";
    a.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();
      if(a.classList.contains('is-playing'))return;
      a.classList.add('is-playing');var f=baseIframe(srcFor(),c.name);a.appendChild(f);f.focus();
    });
    return a;
  }
  // link to the clean single-client page a rep sends to a lead
  function shareLink(id){var clean=!/\.html$/.test(location.pathname);return location.origin+'/sales-testimonial'+(clean?'':'.html')+'?c='+encodeURIComponent(id);}
  return {PLAY:PLAY,esc:esc,slug:slug,find:find,loc:loc,facade:facade,shareLink:shareLink};
})();

/* ── Geo matching: pick the client testimonial nearest to a prospect ──
   Prospect location arrives from GHL email merge fields (?state=FL&city=…).
   GHL stores 2-letter codes; ST.nearest accepts codes or full names.
   No usable location → the default testimonial (leicer). */
window.ST_GEO=(function(){
  // state centroids, lat/lng
  var C={AL:[32.8,-86.8],AK:[64.7,-152.3],AZ:[34.3,-111.7],AR:[34.9,-92.4],CA:[37.2,-119.5],
  CO:[39.0,-105.5],CT:[41.6,-72.7],DE:[39.0,-75.5],DC:[38.9,-77.0],FL:[28.6,-82.4],GA:[32.6,-83.4],
  HI:[20.3,-156.4],ID:[44.4,-114.6],IL:[40.0,-89.2],IN:[39.9,-86.3],IA:[42.1,-93.5],KS:[38.5,-98.4],
  KY:[37.5,-85.3],LA:[31.0,-92.0],ME:[45.4,-69.2],MD:[39.0,-76.8],MA:[42.3,-71.8],MI:[44.3,-85.4],
  MN:[46.3,-94.3],MS:[32.7,-89.7],MO:[38.4,-92.5],MT:[47.0,-109.6],NE:[41.5,-99.8],NV:[39.3,-116.6],
  NH:[43.7,-71.6],NJ:[40.2,-74.7],NM:[34.4,-106.1],NY:[42.9,-75.5],NC:[35.5,-79.4],ND:[47.4,-100.5],
  OH:[40.3,-82.8],OK:[35.6,-97.5],OR:[43.9,-120.6],PA:[40.9,-77.8],RI:[41.7,-71.6],SC:[33.9,-80.9],
  SD:[44.4,-100.2],TN:[35.9,-86.4],TX:[31.5,-99.4],UT:[39.3,-111.7],VT:[44.1,-72.7],VA:[37.5,-78.9],
  WA:[47.4,-120.4],WV:[38.6,-80.6],WI:[44.6,-90.0],WY:[43.0,-107.6]};
  var NAME2CODE={};
  var CODES=['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  for(var i=0;i<window.ST_STATES.length;i++)NAME2CODE[window.ST_STATES[i].toLowerCase()]=CODES[i];
  return {C:C,NAME2CODE:NAME2CODE};
})();
window.ST.DEFAULT_ID='leicer';
window.ST.stateCode=function(s){
  if(!s)return null;s=String(s).trim();
  if(/^[A-Za-z]{2}$/.test(s)&&window.ST_GEO.C[s.toUpperCase()])return s.toUpperCase();
  return window.ST_GEO.NAME2CODE[s.toLowerCase()]||null;
};
window.ST.nearest=function(state){
  var code=window.ST.stateCode(state);
  var candidates=window.ST_DATA.filter(function(c){return window.ST.stateCode(c.state);});
  if(!code||!candidates.length)return window.ST.find(window.ST.DEFAULT_ID)||window.ST_DATA[0];
  var p=window.ST_GEO.C[code],best=null,bestD=Infinity;
  candidates.forEach(function(c){
    var q=window.ST_GEO.C[window.ST.stateCode(c.state)];
    var d=Math.pow((p[0]-q[0]),2)+Math.pow((p[1]-q[1])*Math.cos(p[0]*Math.PI/180),2);
    if(d<bestD){bestD=d;best=c;}
  });
  return best;
};
