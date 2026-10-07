(function () {
  'use strict';

  /* ---- Video hero: imposta data-video="percorso/video.mp4" su #hero ---- */
  var hero = document.getElementById('hero');
  if (hero) {
    var video = hero.querySelector('video');
    var play = hero.querySelector('.hero__play');
    play.addEventListener('click', function () {
      var src = hero.getAttribute('data-video');
      if (!src) { return; }                       // video non ancora disponibile
      if (!video.getAttribute('src')) { video.setAttribute('src', src); }
      video.hidden = false;
      hero.classList.add('is-playing');
      video.play();
    });
  }

  /* ---- Slider foto (sezione "La forza della presenza") ---- */
  var slider = document.getElementById('slider');
  if (slider) {
    var img = slider.querySelector('[data-slide]');
    var dots = slider.querySelector('.slider__dots');
    var slides = (img.getAttribute('data-images') || img.getAttribute('src')).split(',').map(function (s) { return s.trim(); });
    var current = 0, timer;
    function show(i) {
      current = (i + slides.length) % slides.length;
      img.src = slides[current];
      Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute('aria-selected', k === current); });
    }
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Foto ' + (i + 1));
      b.addEventListener('click', function () { show(i); restart(); });
      dots.appendChild(b);
    });
    function restart() { clearInterval(timer); if (slides.length > 1) { timer = setInterval(function () { show(current + 1); }, 5000); } }
    show(0); restart();
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
