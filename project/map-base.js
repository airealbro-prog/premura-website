/* ═══════════════════════════════════════════════════════════
   MAP BASE — shared MapLibre setup with purple/black theme
   Uses OpenFreeMap (free, no API key) for vector tiles.
   Overlays a custom style: black water, purple land+roads.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Wait for MapLibre to be available
  function whenReady(cb) {
    if (window.maplibregl) return cb();
    const i = setInterval(() => {
      if (window.maplibregl) { clearInterval(i); cb(); }
    }, 50);
  }

  /* PURPLE / BLACK STYLE — built on top of OpenFreeMap's "liberty" vector tiles.
     OpenFreeMap is a free, no-API-key vector tile service.
     We override fill/line paint to match our brand. */
  const PURPLE_STYLE = {
    version: 8,
    name: 'Premura Purple',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet'
      }
    },
    layers: [
      // ── BACKGROUND (default LAND color — purple) ──
      // Everything not explicitly water/lake is land by default.
      { id: 'bg', type: 'background', paint: { 'background-color': '#1a0c38' } },

      // ── WATER (ocean, big lakes) ── deep black with faint sheen
      {
        id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water',
        paint: { 'fill-color': '#04020a', 'fill-opacity': 1 }
      },
      {
        id: 'waterway', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway',
        paint: { 'line-color': '#04020a', 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 2.5] }
      },

      // ── LANDCOVER (parks, forests, glaciers) ── slightly darker purple
      {
        id: 'landcover-park', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
        filter: ['in', 'class', 'wood', 'grass', 'scrub'],
        paint: { 'fill-color': '#0e0625', 'fill-opacity': 0.6 }
      },
      {
        id: 'landcover-sand', type: 'fill', source: 'openmaptiles', 'source-layer': 'landcover',
        filter: ['==', 'class', 'sand'],
        paint: { 'fill-color': '#241452', 'fill-opacity': 0.6 }
      },

      // ── LANDUSE (residential / commercial / parks within cities) ──
      {
        id: 'landuse-residential', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['==', 'class', 'residential'],
        paint: { 'fill-color': '#241452', 'fill-opacity': 0.55 }
      },
      {
        id: 'landuse-commercial', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['in', 'class', 'commercial', 'industrial'],
        paint: { 'fill-color': '#2c1862', 'fill-opacity': 0.55 }
      },
      {
        id: 'landuse-park', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse',
        filter: ['in', 'class', 'park', 'cemetery'],
        paint: { 'fill-color': '#0e0625', 'fill-opacity': 0.55 }
      },

      // ── BUILDINGS ── faint purple hint
      {
        id: 'building', type: 'fill', source: 'openmaptiles', 'source-layer': 'building',
        minzoom: 12,
        paint: {
          'fill-color': '#2a1456',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.2, 16, 0.55],
          'fill-outline-color': 'rgba(139,60,247,0.35)'
        }
      },

      // ── COUNTRY / STATE BORDERS (thin purple lines) ──
      {
        id: 'admin-state', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary',
        filter: ['==', 'admin_level', 4],
        paint: {
          'line-color': 'rgba(168,85,247,0.45)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.4, 8, 1.1],
          'line-dasharray': [3, 2]
        }
      },
      {
        id: 'admin-country', type: 'line', source: 'openmaptiles', 'source-layer': 'boundary',
        filter: ['<=', 'admin_level', 2],
        paint: {
          'line-color': 'rgba(192,132,252,0.7)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.7, 8, 1.6]
        }
      },

      // ── ROADS — different purple intensities by class ──
      {
        id: 'road-minor', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', 'class', 'minor', 'service', 'track', 'path'],
        minzoom: 13,
        paint: {
          'line-color': 'rgba(139,60,247,0.28)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 18, 1.2]
        }
      },
      {
        id: 'road-secondary', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', 'class', 'secondary', 'tertiary'],
        paint: {
          'line-color': 'rgba(168,85,247,0.5)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.4, 14, 1.6, 18, 3]
        }
      },
      {
        id: 'road-primary', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['in', 'class', 'primary', 'trunk'],
        paint: {
          'line-color': 'rgba(192,132,252,0.7)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.6, 14, 2.2, 18, 4]
        }
      },
      {
        id: 'road-motorway', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation',
        filter: ['==', 'class', 'motorway'],
        paint: {
          'line-color': '#c084fc',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.8, 10, 2, 14, 3.5, 18, 5.5]
        }
      },

      // ── PLACE LABELS ──
      {
        id: 'place-state', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['==', 'class', 'state'],
        layout: {
          'text-field': ['get', 'name:en'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 9, 6, 13],
          'text-letter-spacing': 0.18,
          'text-transform': 'uppercase'
        },
        paint: {
          'text-color': 'rgba(220,200,255,0.5)',
          'text-halo-color': 'rgba(4,2,10,0.9)',
          'text-halo-width': 1.2
        }
      },
      {
        id: 'place-city', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['in', 'class', 'city', 'town'],
        layout: {
          'text-field': ['get', 'name:en'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 9, 12, 14],
          'text-letter-spacing': 0.06
        },
        paint: {
          'text-color': 'rgba(232,220,255,0.8)',
          'text-halo-color': 'rgba(4,2,10,0.95)',
          'text-halo-width': 1.5
        }
      },
      {
        id: 'place-suburb', type: 'symbol', source: 'openmaptiles', 'source-layer': 'place',
        filter: ['in', 'class', 'suburb', 'neighbourhood', 'village'],
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name:en'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 9, 16, 12],
          'text-letter-spacing': 0.1,
          'text-transform': 'uppercase'
        },
        paint: {
          'text-color': 'rgba(192,132,252,0.65)',
          'text-halo-color': 'rgba(4,2,10,0.9)',
          'text-halo-width': 1
        }
      }
    ]
  };

  /**
   * Initialize a purple MapLibre map in the given container.
   * @param {Object} opts { containerId, center: [lng,lat], zoom, pitch, bearing, locked }
   * @returns {Promise<maplibregl.Map>}
   */
  function initPurpleMap(opts) {
    return new Promise((resolve, reject) => {
      whenReady(() => {
        try {
          const map = new maplibregl.Map({
            container: opts.containerId,
            style: PURPLE_STYLE,
            center: opts.center || [-80.21, 25.78],
            zoom: opts.zoom || 9.5,
            pitch: opts.pitch || 0,
            bearing: opts.bearing || 0,
            interactive: !opts.locked,
            attributionControl: false,
            preserveDrawingBuffer: false,
            antialias: true,
            fadeDuration: 200
          });

          // Disable all interactions if locked
          if (opts.locked) {
            map.boxZoom.disable();
            map.scrollZoom.disable();
            map.dragPan.disable();
            map.dragRotate.disable();
            map.keyboard.disable();
            map.doubleClickZoom.disable();
            map.touchZoomRotate.disable();
          }

          // Tiny attribution strip (legally required for OSM data)
          map.addControl(new maplibregl.AttributionControl({
            compact: true,
            customAttribution: '© OSM · OpenFreeMap'
          }), 'bottom-left');

          map.on('load', () => resolve(map));
          map.on('error', e => {
            // Tile fetch errors are non-fatal — log and keep going
            console.warn('[map]', e && e.error ? e.error.message : e);
          });
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  // Expose
  window.PremuraMap = { initPurpleMap, PURPLE_STYLE };
})();
