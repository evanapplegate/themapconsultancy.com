// Small page behaviours, no libraries:
//  - phone menu toggle
//  - fade / fade-up as blocks scroll in (what AOS did on the Dorik site; desktop only, off for reduced motion)
//  - videos marked data-autoplay start when they scroll into view, instead of all downloading on load
//  - Calendly and the interactive maps load only when they come near the viewport
//  - decorative page backgrounds are added after the page has loaded (html.bg-ready)
(() => {
  addEventListener('load', () => document.documentElement.classList.add('bg-ready'));

  const whenNear = (el, fn, margin) => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          fn(e.target);
        }
      }
    }, { rootMargin: margin });
    io.observe(el);
  };
  const loaded = {};
  const load = (url) => loaded[url] || (loaded[url] = new Promise((resolve, reject) => {
    const css = url.endsWith('.css');
    const el = document.createElement(css ? 'link' : 'script');
    if (css) { el.rel = 'stylesheet'; el.href = url; } else { el.src = url; }
    el.onload = resolve;
    el.onerror = reject;
    document.head.append(el);
  }));

  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const reveal = document.querySelectorAll('[data-reveal]');
  if (reveal.length && matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -120px 0px' });
    for (const el of reveal) {
      // anything already on screen when the page opens shows at once
      if (el.getBoundingClientRect().top < innerHeight - 120) el.classList.add('revealed');
      else io.observe(el);
    }
    document.documentElement.classList.add('reveal-ready');
  }

  for (const v of document.querySelectorAll('video[data-autoplay]')) {
    whenNear(v, () => {
      v.autoplay = true;
      v.play().catch(() => {});
    }, '200px');
  }

  for (const el of document.querySelectorAll('.calendly[data-url]')) {
    whenNear(el, () => {
      load('https://assets.calendly.com/assets/external/widget.js').then(() => {
        window.Calendly.initInlineWidget({ url: el.dataset.url, parentElement: el });
      });
    }, '400px');
  }

  const LIBS = {
    leaflet: ['/assets/vendor/leaflet-1.9.4.css', '/assets/vendor/leaflet-1.9.4.js'],
    chart: ['/assets/vendor/chart-4.5.1.umd.min.js'],
    d3: ['/assets/vendor/d3-7.9.0.min.js'],
    topojson: ['/assets/vendor/topojson-client-3.1.0.min.js'],
    papaparse: ['/assets/vendor/papaparse-5.4.1.min.js'],
  };
  for (const el of document.querySelectorAll('[data-viz]')) {
    whenNear(el, async () => {
      for (const lib of el.dataset.libs.split(' ')) {
        for (const url of LIBS[lib]) await load(url);
      }
      await load(`/assets/js/${el.dataset.viz}.js`);
    }, '800px');
  }
})();
