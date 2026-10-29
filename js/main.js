(function () {
  'use strict';

  /* ---- Video hero: parte da solo (senza audio, come richiedono i browser) ----
     Pulsante in basso a destra per attivare/disattivare l'audio; un clic sul video lo mette in pausa. */
  var hero = document.getElementById('hero');
  if (hero) {
    var video = hero.querySelector('video');
    var sound = hero.querySelector('.hero__sound');
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var small = window.matchMedia && window.matchMedia('(max-width: 800px)').matches;
    var conn = navigator.connection || {};
    var slow = conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
    // su telefono: se c'è una versione leggera (data-src-mobile) si usa quella; se manca o non carica, resta il video normale
    var mobileSrc = video.getAttribute('data-src-mobile');
    if (small && mobileSrc) {
      var desktopSrc = video.getAttribute('src');
      video.addEventListener('error', function () { if (video.getAttribute('src') !== desktopSrc) { video.src = desktopSrc; start(); } }, { once: true });
      video.src = mobileSrc;
    }
    // parte a pagina caricata (così foto e testi hanno la precedenza sulla rete); con risparmio dati o rete lenta resta la locandina e parte con un tocco
    function start() { var p = video.play(); if (p && p.catch) { p.catch(function () {}); } }
    if (calm) { video.pause(); video.controls = true; }
    else if (!slow) { if (document.readyState === 'complete') { start(); } else { window.addEventListener('load', start); } }
    sound.addEventListener('click', function () {
      video.muted = !video.muted;
      sound.setAttribute('aria-pressed', !video.muted);
      sound.setAttribute('aria-label', video.muted ? "Attiva l'audio" : "Disattiva l'audio");
      if (video.paused && !calm) { video.play(); }
    });
    video.addEventListener('click', function () { if (video.paused) { video.play(); } else { video.pause(); } });
  }

  /* ---- Slider foto (sezione "La forza della presenza") ----
     Elenco foto: attributo data-images sull'<img data-slide> in index.html (percorsi separati da virgola).
     Cambio con dissolvenza; scorre da solo ogni 5,5 s e si ferma con il mouse sopra
     (e del tutto se il sistema ha "riduci movimento"). */
  var slider = document.getElementById('slider');
  if (slider) {
    var img = slider.querySelector('[data-slide]');
    var dots = slider.querySelector('.slider__dots');
    var slides = (img.getAttribute('data-images') || img.getAttribute('src')).split(',').map(function (s) { return s.trim(); });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0, timer;
    // su telefono foto più leggere (-900); il resto si carica una alla volta (la successiva)
    var smallScr = window.matchMedia && window.matchMedia('(max-width: 800px)').matches;
    if (smallScr) { slides = slides.map(function (s) { return s.replace(/\.jpg$/, '-900.jpg'); }); }
    else if (img.getAttribute('src') !== slides[0]) { img.src = slides[0]; }
    function warm(i) { if (slides.length > 1) { new Image().src = slides[(i + 1) % slides.length]; } }
    if (document.readyState === 'complete') { warm(0); } else { window.addEventListener('load', function () { warm(0); }); }
    function markDots() {
      Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute('aria-selected', k === current); });
    }
    function show(i) {
      current = (i + slides.length) % slides.length;
      markDots();
      warm(current);
      if (reduce) { img.src = slides[current]; return; }
      img.style.opacity = 0;
      setTimeout(function () { img.src = slides[current]; img.style.opacity = 1; }, 450);
    }
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Foto ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); });
      dots.appendChild(b);
    });
    // frecce ai lati della foto
    [['prev', -1, 'Foto precedente', 'M14 5l-7 7 7 7'], ['next', 1, 'Foto successiva', 'M10 5l7 7-7 7']].forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'slider__arrow slider__arrow--' + a[0]; b.setAttribute('aria-label', a[2]);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + a[3] + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      b.addEventListener('click', function () { show(current + a[1]); restart(); });
      slider.appendChild(b);
    });
    function stop() { clearInterval(timer); }
    function restart() { stop(); if (slides.length > 1 && !reduce) { timer = setInterval(function () { show(current + 1); }, 5500); } }
    // clic sulla foto = foto successiva; su telefono si scorre con un dito (destra/sinistra)
    img.addEventListener('click', function () { show(current + 1); restart(); });
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', restart);
    markDots(); restart();
  }

  /* ---- News / stampa ----
     Le card si leggono dalla tabella "news" di Supabase (si modificano da /admin/, vedi supabase/schema.sql).
     Se Supabase non risponde, si usa data/news.json come copia di riserva.
     Ogni voce: testata, titolo, descrizione, immagine, link. Senza voci la sezione resta nascosta. */
  var newsList = document.getElementById('news-list');
  if (newsList && window.fetch) {
    var safeUrl = function (u) { return /^https?:\/\//i.test(u || '') ? u : ''; };
    var el = function (tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) { n.className = cls; }
      if (text) { n.textContent = text; }
      return n;
    };
    var cfg = window.FUZIA || {};
    var fromFile = function () {
      return fetch(newsList.getAttribute('data-src'), { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : { items: [] }; });
    };
    var loadNews = function () {
      if (!cfg.supabaseUrl || !cfg.supabaseKey) { return fromFile(); }
      return fetch(cfg.supabaseUrl + '/rest/v1/news?select=testata,titolo,descrizione,immagine,link&visibile=eq.true&order=posizione.asc,created_at.desc',
        { headers: { apikey: cfg.supabaseKey }, cache: 'no-store' })
        .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
        .then(function (rows) { return { items: rows }; })
        .catch(fromFile);
    };
    loadNews()
      .then(function (data) {
        var items = (data && data.items) || [];
        items.forEach(function (it) {
          var card = el('article', 'news__card');
          if (it.immagine) {
            var im = el('img', 'news__img');
            im.src = String(it.immagine).replace(/^\//, '');     // percorso relativo anche se il pannello scrive "/assets/…"
            im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
            card.appendChild(im);
          }
          var url = safeUrl(it.link);
          var head = el('h3', 'news__head');
          var wrap = url ? document.createElement('a') : head;
          if (url) { wrap.href = url; wrap.target = '_blank'; wrap.rel = 'noopener noreferrer'; head.appendChild(wrap); }
          if (it.testata) { wrap.appendChild(el('span', 'news__src', it.testata)); }
          wrap.appendChild(document.createTextNode(it.titolo || ''));
          card.appendChild(head);
          if (it.descrizione) { card.appendChild(el('p', 'news__text', it.descrizione)); }
          if (url) {
            var more = el('a', 'news__more');
            more.href = url; more.target = '_blank'; more.rel = 'noopener noreferrer';
            more.setAttribute('aria-label', 'Leggi l’articolo: ' + (it.titolo || it.testata || ''));
            card.appendChild(more);
          }
          newsList.appendChild(card);
        });
        if (items.length) { newsList.closest('.news').hidden = false; }
      })
      .catch(function () { /* senza news la sezione resta nascosta */ });
  }

  /* ---- Modulo contatti ----
     Con data-endpoint (es. Formspree) invia via fetch; altrimenti apre il client di posta. */
  var form = document.getElementById('contact-form');
  if (form) {
    var msg = form.querySelector('.form__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.sito.value) { return; }            // anti-spam (honeypot)
      if (!form.checkValidity()) { msg.textContent = 'Compila nome, email e messaggio.'; return; }
      var data = new FormData(form);
      var endpoint = form.getAttribute('data-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) { throw new Error(); } form.reset(); msg.textContent = 'Messaggio inviato. Grazie!'; })
          .catch(function () { msg.textContent = 'Invio non riuscito. Scrivi a ' + form.getAttribute('data-to'); });
      } else {
        var body = 'Nome: ' + data.get('nome') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('messaggio');
        window.location.href = 'mailto:' + form.getAttribute('data-to') +
          '?subject=' + encodeURIComponent(data.get('oggetto') || 'Contatto dal sito') + '&body=' + encodeURIComponent(body);
      }
    });
  }
})();
