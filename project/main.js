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
