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
- Video hero: file `assets/video/hero.mp4` (16:9, a tutta larghezza, parte da solo senza audio; pulsante audio in basso a destra). Per cambiarlo sostituisci il file e, se serve, la locandina `assets/img/hero.jpg`.
- Slider "La forza della presenza": nell'`<img data-slide>` aggiungi `data-images="a.jpg,b.jpg,..."`.
- Modulo contatti: imposta `data-endpoint` del form (es. Formspree); senza, apre il programma di posta.

## News / stampa (da pannello)
Le card della sezione "Stampa" si leggono da `data/news.json` (campi: testata, titolo, descrizione, immagine, link; il primo elemento è la card in alto a sinistra). Foto in `assets/img/news/`, quadrate, almeno 1000 px.
- **Dal pannello**: <https://pagescms.org> → accesso con GitHub → repo `fuzia` → "News / Stampa". La configurazione è in `.pages.yml`. Salvando, il pannello fa un commit su `main` e il sito si aggiorna da solo dopo circa un minuto. Chi usa il pannello deve avere accesso in scrittura al repo.
- **A mano**: si modifica `data/news.json` su GitHub (matita) e si carica la foto in `assets/img/news/`.
- Senza voci nel file la sezione resta nascosta. Il pulsante + e il titolo aprono il link in una nuova scheda; senza link non compaiono.

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
