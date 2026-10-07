# Fuzia Jammali – sito monopagina

Sito statico (HTML + CSS + JS), nessuna dipendenza né build.

## Struttura
```
index.html        pagina unica
css/style.css     stili (palette, font, impaginazione)
js/main.js        video hero, slider foto, modulo contatti
assets/img/       immagini (ora segnaposto ritagliati dal design: da sostituire con gli originali)
assets/fonts/     Poiret One (titoli) e Nunito Light (testo), in locale
assets/icons/     icone social
design/           riferimenti di design leggeri (i .psd sono esclusi da git)
```

## Design
- Colori: `#f8f8f8` sfondo e testi chiari · `#111111` nero · `#ffffff`
- Font: Poiret One (titoli), Nunito Light (testo), ospitati in `assets/fonts` (nessuna chiamata a Google)
- Desktop: l'impaginazione scala in proporzione alla larghezza.
- Mobile: non ancora disegnato; c'è solo un adattamento provvisorio sotto gli 800 px.

## Sostituire i segnaposto
Sovrascrivi i file in `assets/img/` mantenendo gli stessi nomi (JPG, lato lungo ~2000 px, qualità 80–85).
- Video hero: in `index.html` imposta `data-video="assets/video/nome.mp4"` su `#hero`.
- Slider "La forza della presenza": nell'`<img data-slide>` aggiungi `data-images="a.jpg,b.jpg,..."`.
- Modulo contatti: imposta `data-endpoint` del form (es. Formspree); senza, apre il programma di posta.

## Pubblicazione di prova (GitHub Pages)
1. Unisci il lavoro nel ramo `main`.
2. Su GitHub: Settings → Pages → Source: **GitHub Actions**.
3. A ogni push su `main` il sito si aggiorna: `https://scriptdifau.github.io/fuzia/`

Il sito di prova ha `noindex` (non compare su Google).

**Cache**: a ogni pubblicazione il workflow aggiunge `?v=<codice>` ai riferimenti a stili, script e immagini, così il browser non usa copie vecchie. La pagina `index.html` può però restare in cache fino a ~10 minuti: dopo un aggiornamento ricarica con Ctrl+Maiusc+R (Cmd+Maiusc+R su Mac) o apri una finestra privata.

## Passaggio all'hosting definitivo
1. In `index.html` elimina la riga `<meta name="robots" content="noindex, nofollow">`.
2. Carica via FTP `index.html`, `css/`, `js/`, `assets/` nella radice del sito (non servono `design/`, `.github/`, `README.md`).
3. Aggiungi cookie banner/privacy (es. iubenda) e analytics solo se richiesti.
