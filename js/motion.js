/* Movimento: comparsa dei contenuti + parallasse. Solo JS nativo, nessuna libreria.
   Velocità parallasse: positiva = l'elemento "rimane indietro" (sembra scendere rispetto alla pagina),
   negativa = sale più in fretta. Valori piccoli (0.03–0.15) per un effetto elegante. */
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('js')) { return; }

  var SPEED = {
    title: 0.07,                                   // titoli (stessa velocità dei testi: restano uniti)
    text: 0.07,                                    // paragrafi
    photos: [-0.06, 0.05, -0.1, 0.03, -0.04]       // foto, a rotazione
  };
  var MOBILE = 800;                                // sotto questa larghezza niente parallasse

  /* --- titoli: ogni riga in un contenitore animabile --- */
  Array.prototype.forEach.call(document.querySelectorAll('.t .l'), function (l) {
    var w = document.createElement('span');
    w.className = 'rv';
    while (l.firstChild) { w.appendChild(l.firstChild); }
    l.appendChild(w);
    w.style.setProperty('--i', Array.prototype.indexOf.call(l.parentNode.children, l));
  });

  /* --- comparsa allo scorrimento --- */
  var targets = document.querySelectorAll('.t, .body, figure.it, .slider');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  } else {
    Array.prototype.forEach.call(targets, function (t) { t.classList.add('is-in'); });
  }

  /* --- parallasse --- */
  var items = [], photoIdx = 0;
  Array.prototype.forEach.call(document.querySelectorAll('.sec .it'), function (el) {
    var s;
    if (el.hasAttribute('data-speed')) { s = parseFloat(el.getAttribute('data-speed')); }
    else if (el.classList.contains('t')) { s = SPEED.title; }
    else if (el.classList.contains('body')) { s = SPEED.text; }
    else { s = SPEED.photos[photoIdx++ % SPEED.photos.length]; }
    el.setAttribute('data-px', '');
    items.push({ el: el, speed: s, base: 0 });
  });

  var hero = document.getElementById('hero');
  var poster = hero && hero.querySelector('.hero__poster');
  var vh = window.innerHeight, ticking = false;

  function measure() {
    vh = window.innerHeight;
    var sy = window.pageYOffset;
    items.forEach(function (it) {
      var top = 0, n = it.el;
      while (n) { top += n.offsetTop; n = n.offsetParent; }   // ignora le trasformazioni
      it.base = top + it.el.offsetHeight / 2;
    });
    update(sy);
  }

  function update(sy) {
    ticking = false;
    var on = window.innerWidth > MOBILE;
    items.forEach(function (it) {
      var diff = Math.max(-vh, Math.min(vh, it.base - sy - vh / 2));
      it.el.style.setProperty('--py', on ? (-diff * it.speed).toFixed(1) + 'px' : '0px');
    });
    if (poster) {
      var p = on ? Math.min(sy, hero.offsetHeight + 200) : 0;
      poster.style.transform = 'translate3d(0,' + (p * 0.28).toFixed(1) + 'px,0) scale(1.18)';
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { update(window.pageYOffset); }); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
})();
