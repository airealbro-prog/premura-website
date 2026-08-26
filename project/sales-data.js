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
  { id:'velardi', name:'Michael Velardi',  industry:'Solar', state:'TBD',
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
