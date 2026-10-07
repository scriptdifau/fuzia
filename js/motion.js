/* Movimento: solo titoli grandi, immagini a tutta larghezza e gruppi di foto (come blocco unico).
   Nessuno zoom nelle immagini, nessun movimento sui paragrafi.
   Tempi e curve: variabili --dur e --ease in css/style.css (sezione MOVIMENTO). */
(function () {
  'use strict';
  if (!document.documentElement.classList.contains('js')) { return; }

  /* --- titoli grandi: ogni riga in un contenitore animabile --- */
  Array.prototype.forEach.call(document.querySelectorAll('h2.t:not(.t--sm) .l'), function (l) {
    var w = document.createElement('span');
    w.className = 'rv';
    while (l.firstChild) { w.appendChild(l.firstChild); }
    l.appendChild(w);
    w.style.setProperty('--i', Array.prototype.indexOf.call(l.parentNode.children, l));
  });

  /* --- comparsa allo scorrimento --- */
  var single = document.querySelectorAll('h2.t:not(.t--sm), .bgband, .solo');
  var groups = document.querySelectorAll('.grp');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var t = en.target.closest('.grp') || en.target;   // un gruppo compare in blocco, appena ne entra una parte
        t.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(single, function (t) { io.observe(t); });
    Array.prototype.forEach.call(groups, function (g) {
      Array.prototype.forEach.call(g.children, function (c) { io.observe(c); });
    });
  } else {
    Array.prototype.forEach.call(single, function (t) { t.classList.add('is-in'); });
    Array.prototype.forEach.call(groups, function (g) { g.classList.add('is-in'); });
  }

  /* --- video/immagine hero: leggero parallasse (solo desktop) --- */
  var hero = document.getElementById('hero');
  var poster = hero && hero.querySelector('.hero__poster');
  if (!poster) { return; }
  var MOBILE = 800, SPEED = 0.12, EASE = 0.06, cur = 0, tgt = 0, running = false;

  function tick() {
    var d = tgt - cur;
    if (Math.abs(d) > 0.05) { cur += d * EASE; } else { cur = tgt; }
    poster.style.transform = 'translate3d(0,' + cur.toFixed(2) + 'px,0) scale(1.12)';
    if (cur !== tgt) { requestAnimationFrame(tick); } else { running = false; }
  }
  function onScroll() {
    var on = window.innerWidth > MOBILE;
    tgt = on ? Math.min(window.pageYOffset, hero.offsetHeight + 200) * SPEED : 0;
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
