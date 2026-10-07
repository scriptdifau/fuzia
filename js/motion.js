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

  /* --- parallasse dentro le due foto grandi (sfondo "Il dialogo tra opposti" e foto "Certi incontri") ---
     L'immagine è più alta del riquadro (+18%, vedi css) e scorre più piano della pagina. */
  var PAR = 0.85;          // quanto dell'extra disponibile si usa (0 = fermo, 1 = tutto)
  var EASE0 = 0.07;        // inerzia: più basso = più morbido
  var pars = Array.prototype.map.call(document.querySelectorAll('img[data-par]'), function (img) {
    return { img: img, frame: img.parentElement, cur: 0, tgt: 0 };
  });
  var parRun = false;
  function parTick() {
    var moving = false;
    pars.forEach(function (p) {
      var d = p.tgt - p.cur;
      if (Math.abs(d) > 0.05) { p.cur += d * EASE0; moving = true; } else { p.cur = p.tgt; }
      p.img.style.setProperty('--pp', p.cur.toFixed(2) + 'px');
    });
    if (moving) { requestAnimationFrame(parTick); } else { parRun = false; }
  }
  function parUpdate() {
    var vh = window.innerHeight;
    pars.forEach(function (p) {
      var r = p.frame.getBoundingClientRect();
      var prog = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // +1 entra in basso, -1 esce in alto
      prog = Math.max(-1, Math.min(1, prog));
      p.tgt = -prog * 0.09 * r.height * PAR;
    });
    if (!parRun) { parRun = true; requestAnimationFrame(parTick); }
  }
  if (pars.length) {
    window.addEventListener('scroll', parUpdate, { passive: true });
    window.addEventListener('resize', parUpdate);
    window.addEventListener('load', parUpdate);
    parUpdate();
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
