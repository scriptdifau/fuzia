(function () {
  'use strict';

  /* ---- Video hero: parte da solo (senza audio, come richiedono i browser) ----
     Pulsante in basso a destra per attivare/disattivare l'audio; un clic sul video lo mette in pausa. */
  var hero = document.getElementById('hero');
  if (hero) {
    var video = hero.querySelector('video');
    var sound = hero.querySelector('.hero__sound');
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) { video.removeAttribute('autoplay'); video.pause(); video.controls = true; }
    else { var p = video.play(); if (p && p.catch) { p.catch(function () {}); } }
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
    slides.forEach(function (s) { new Image().src = s; });             // precarica
    function markDots() {
      Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute('aria-selected', k === current); });
    }
    function show(i) {
      current = (i + slides.length) % slides.length;
      markDots();
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
