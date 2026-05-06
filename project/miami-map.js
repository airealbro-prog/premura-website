/* ═══════════════════════════════════════════════════════════
   MIAMI MAP — real MapLibre tiles + territory markers
   Replaces the hand-drawn SVG with a live purple/black map.
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  // Real Miami-Dade neighborhood coordinates
  // Each territory has multiple anchor points; main one + supporting markers
  const TERRITORIES = [
    {
      id: 0,
      name: 'Gated Communities',
      color: '#c084fc',
      pins: [
        { lng: -80.2553, lat: 25.6712, label: 'Gables Estates' },
        { lng: -80.3068, lat: 25.6584, label: 'Pinecrest' },
        { lng: -80.1632, lat: 25.6912, label: 'Key Biscayne' },
        { lng: -80.1411, lat: 25.9565, label: 'Aventura' }
      ]
    },
    {
      id: 1,
      name: 'Rural Territories',
      color: '#a855f7',
      pins: [
        { lng: -80.4776, lat: 25.4687, label: 'Homestead' },
        { lng: -80.5230, lat: 25.4150, label: 'Redland' },
        { lng: -80.5800, lat: 25.5800, label: 'SW Dade' }
      ]
    },
    {
      id: 2,
      name: 'Spanish-Speaking Markets',
      color: '#e9b6ff',
      pins: [
        { lng: -80.2784, lat: 25.8576, label: 'Hialeah' },
        { lng: -80.2196, lat: 25.7657, label: 'Little Havana' },
        { lng: -80.3553, lat: 25.8195, label: 'Doral' },
        { lng: -80.3267, lat: 25.7556, label: 'Westchester' }
      ]
    }
  ];

  // Bounds that show all of Miami-Dade in a way that matches the panel aspect
  const MIAMI_BOUNDS = [
    [-80.85, 25.35], // SW
    [-80.05, 26.00]  // NE
  ];

  function init() {
    const container = document.getElementById('miamiMap');
    if (!container || !window.PremuraMap) return;

    const loader = document.getElementById('miamiMapLoader');
    const overlayHost = document.getElementById('miamiTerrLayer');

    window.PremuraMap.initPurpleMap({
      containerId: 'miamiMap',
      center: [-80.30, 25.72],
      zoom: 9.7,
      locked: true
    }).then(map => {
      // Fit to Miami-Dade bounds
      try {
        map.fitBounds(MIAMI_BOUNDS, { padding: 20, animate: false });
      } catch (e) { /* noop */ }

      // Build territory markers (HTML elements positioned by MapLibre)
      const allMarkers = [];

      TERRITORIES.forEach(terr => {
        terr.pins.forEach(pin => {
          const wrap = document.createElement('div');
          wrap.className = `mm-marker mm-terr-${terr.id}`;
          wrap.dataset.terr = terr.id;
          wrap.innerHTML = `
            <div class="mm-dot"></div>
            <div class="mm-chip">${pin.label}</div>
          `;
          const marker = new maplibregl.Marker({ element: wrap, anchor: 'center' })
            .setLngLat([pin.lng, pin.lat])
            .addTo(map);
          allMarkers.push({ marker, el: wrap, terrId: terr.id });
        });
      });

      // Wire to the existing .usmap-btn buttons
      const btns = Array.from(document.querySelectorAll('.usmap-btn'));
      let activeTerr = 0;
      let auto = true;
      let timer;

      function setActive(i){
        activeTerr = i;
        btns.forEach((b, n) => b.classList.toggle('active', n === i));
        // Only the selected territory's markers are visible
        allMarkers.forEach(m => {
          const isActive = m.terrId === i;
          m.el.classList.toggle('active', isActive);
          m.el.style.display = isActive ? '' : 'none';
        });
      }

      setActive(0);

      function loop(){
        clearInterval(timer);
        timer = setInterval(() => {
          if (!auto) return;
          setActive((activeTerr + 1) % TERRITORIES.length);
        }, 3600);
      }
      loop();

      btns.forEach((b, n) => {
        b.addEventListener('mouseenter', () => { auto = false; setActive(n); });
        b.addEventListener('click', () => { auto = false; setActive(n); });
      });

      // Hide loader
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
      }
    }).catch(err => {
      console.warn('[miami-map] init failed', err);
      if (loader) {
        loader.querySelector('.miami-map-loader-txt').textContent = 'Map unavailable.';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
