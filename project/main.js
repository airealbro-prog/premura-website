// Scroll progress
const scrollProgress = document.getElementById('scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = pct + '%';
  }, { passive: true });
}

// Navbar pill
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('nav-scrolled', window.scrollY > 80);
  }, { passive: true });
}

// Mobile menu
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile-menu');
const mobileClose = document.querySelector('.nav-mobile-close');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  if (mobileClose) mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// Count-up
function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function countUp(el, target, suffix, duration) {
  duration = duration || 2000;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const v = easeOutExpo(p) * target;
    el.textContent = (isDecimal ? v.toFixed(1) : Math.floor(v)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-count]').forEach((el, i) => {
      setTimeout(() => {
        countUp(el, parseFloat(el.dataset.count), el.dataset.suffix || '', 2000);
      }, i * 150);
    });
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats-bar, .metrics-grid').forEach(el => countObserver.observe(el));

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Floating CTA
const floatingCTA = document.getElementById('floating-cta');
if (floatingCTA) {
  window.addEventListener('scroll', () => {
    floatingCTA.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

// Fade-in on scroll
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.glass-card, .phase, .diff-card, .step-card, .pain-card, .tool-card, .tool-card-big, .metric-card, .team-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity .55s ease ${(i % 4) * 80}ms, transform .55s ease ${(i % 4) * 80}ms`;
  fadeObs.observe(el);
});

if (window.lucide) lucide.createIcons();

// ---------------------------------------------------------------------------
// Intent gate on the strategy-call CTAs.
//
// People searching for a JOB find this site and click "Book a Strategy Call",
// which drops them into the B2B sales funnel. The CTA now asks which they are
// first: job seekers go to callunit.org/junior, buyers carry on to the VSL
// exactly as before.
//
// Delegated, so it covers every CTA on every page (253 links across 61 pages)
// without touching any HTML. Attribution params on the current URL are carried
// to whichever destination they pick — FormFlow's embed.js reads them off the
// landing page URL on both sides, so an ad click survives the detour.
// ---------------------------------------------------------------------------
(function () {
  var VSL_MATCH = 'callcenter.premura.org/video-sales-page';
  var JOB_URL = 'https://www.callunit.org/junior';
  var KEEP = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content',
              'email','fbclid','gclid','ttclid','msclkid','li_fat_id'];

  function withParams (url) {
    try {
      var out = new URL(url, window.location.href);
      var page = new URLSearchParams(window.location.search);
      KEEP.forEach(function (k) {
        var v = page.get(k);
        if (v && !out.searchParams.get(k)) out.searchParams.set(k, v);
      });
      page.forEach(function (v, k) {
        if (v && k.lastIndexOf('utm_', 0) === 0 && !out.searchParams.get(k)) out.searchParams.set(k, v);
      });
      return out.toString();
    } catch (e) { return url; }
  }

  function track (intent) {
    try { if (typeof fbq === 'function') fbq('trackCustom', 'IntentSelected', { intent: intent }); } catch (e) {}
    try { if (window.dataLayer && window.dataLayer.push) window.dataLayer.push({ event: 'intent_selected', intent: intent }); } catch (e) {}
  }

  var open = null;

  function close () {
    if (!open) return;
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = open.prevOverflow;
    open.el.remove();
    if (open.opener && open.opener.focus) open.opener.focus();
    open = null;
  }
  function onKey (e) { if (e.key === 'Escape') close(); }

  function choice (title, sub, onPick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pm-gate-choice';
    b.innerHTML = '<span class="pm-gate-choice-t"></span><span class="pm-gate-choice-s"></span>';
    b.firstChild.textContent = title;
    b.lastChild.textContent = sub;
    b.addEventListener('click', onPick);
    return b;
  }

  function openGate (href, target, opener) {
    if (open) return;
    var veil = document.createElement('div');
    veil.className = 'pm-gate-veil';
    veil.setAttribute('role', 'dialog');
    veil.setAttribute('aria-modal', 'true');
    veil.setAttribute('aria-label', 'Which one are you?');

    var card = document.createElement('div');
    card.className = 'pm-gate-card';

    var h = document.createElement('h2');
    h.className = 'pm-gate-title';
    h.textContent = 'Which one are you?';
    card.appendChild(h);

    card.appendChild(choice(
      'I want to build a call center',
      'Book a strategy call with our team.',
      function () {
        track('b2b');
        var url = withParams(href);
        close();
        if (target === '_blank') window.open(url, '_blank', 'noopener');
        else window.location.href = url;
      }
    ));
    card.appendChild(choice(
      "I'm looking for a job",
      'See open agent roles at Call Unit.',
      function () { track('job'); window.location.href = withParams(JOB_URL); }
    ));

    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'pm-gate-close';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '\u2715';
    x.addEventListener('click', close);
    card.appendChild(x);

    veil.appendChild(card);
    veil.addEventListener('click', function (e) { if (e.target === veil) close(); });
    document.body.appendChild(veil);

    open = { el: veil, opener: opener, prevOverflow: document.documentElement.style.overflow };
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    var first = card.querySelector('.pm-gate-choice');
    if (first) first.focus();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="' + VSL_MATCH + '"]') : null;
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;  // let modified clicks through
    e.preventDefault();
    openGate(a.getAttribute('href'), a.getAttribute('target'), a);
  });
})();
