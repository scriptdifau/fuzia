# Promemoria di progetto – sito Fuzia Jammali

Aggiornato al 20 ottobre 2026. Serve per riprendere il lavoro in una nuova sessione.

## Stato attuale
- Sito a pagina singola in HTML, CSS e JS, senza strumenti di compilazione. Online (prova) su https://scriptdifau.github.io/fuzia/.
- Si pubblica da solo a ogni unione in `main` (GitHub Actions, `.github/workflows/pages.yml`). Dopo un aggiornamento la pagina può restare vecchia in cache circa 10 minuti: ricaricare con Ctrl+Shift+R o aprire una finestra privata.
- `index.html` contiene `<meta name="robots" content="noindex, nofollow">`: **toglierlo al lancio**.
- Video dell'hero: `assets/video/hero.mp4` (provvisorio, 12 MB), parte da solo senza audio, con pulsante audio. Oltre i 1920 px di schermo occupa tutta la larghezza.
- Foto: 23 sostituite con le versioni ritoccate del 20 ottobre (vedi tabella sotto).

## Come si lavora
1. Si parte da `main` aggiornato su un ramo di lavoro.
2. Si apre una PR in bozza; chi gestisce il sito clicca "Ready for review", poi "Merge pull request" e "Confirm merge".
3. Dopo circa un minuto il sito è aggiornato.

Modifiche semplici senza assistente: su GitHub si apre `index.html` con la matita (Edit) per i testi, oppure si carica in `assets/img` una foto con lo stesso nome e le stesse proporzioni ("Add file" > "Upload files").

## Come è costruita l'impaginazione (essenziale)
- Desktop: composizione centrata di massimo 1920 px (`.page`), che scala in proporzione con le unità `cqw`. Ogni elemento ha posizione e misure inline (`--x --y --w --h`).
- Telefono (fino a 800 px): coordinate proprie (`--mx --my --mw --mh`), definite nello stesso elemento.
- Eccezione: l'hero (video) sta fuori da `.page` per essere a tutta larghezza.
- Movimento in `js/motion.js` (titoli che scendono, fascia che si apre, gruppi di foto che compaiono, parallasse su due foto). Disattivato se il sistema ha "riduci movimento".
- Slider "La forza della presenza" in `js/main.js`: foto elencate in `data-images`.
- Modulo contatti: apre il programma di posta; per l'invio vero va compilato `data-endpoint` (es. Formspree).

## Foto: dal file ritoccato al file del sito
Nomi nel file zip: "Fuzia Jammali - 28 Settembre 2026-NNN (Personalizzato).jpg".

| File del sito | NNN | | File del sito | NNN |
|---|---|---|---|---|
| dialogo-1 | 051 | | rigore-3 (bianco e nero) | 046-2 |
| dialogo-2 | 660 | | rigore-4 | 293 |
| dialogo-3 | 262 | | forza-1 | 444 |
| struttura-2 | 229 | | slider-1 | 631 |
| struttura-3 | 216 | | slider-2 | 093 |
| copertura-1 | 119 | | slider-3 | 517 |
| copertura-2 | 456 | | slider-4 | 654 |
| copertura-3 | 333 | | slider-5 | 180 (da verificare) |
| rigore-1 | 378 | | slider-6 | 371 |
| rigore-2 | 074 | | certi | 620 |
| atelier-1 | 193 | | atelier-2 (bianco e nero) | 353 |
| atelier-3 | 665 | | | |

Non ancora sostituite: `struttura-1` (non presente nello zip), `dialogo-bg` (candidata 501), `footer` (candidata 482).
Varianti non usate: 046, 119-2, 353-2, 362, 362-2, 371-2, 631-2, 245, 245-1. Scatti nuovi non nel layout: 219, 237, 295, 310, 341, 346, 449, 472, 525, 570, 595, 635, 639, 679.

## Da fare
1. Decidere come trattare gli elementi "a tutta larghezza" sugli schermi oltre 1920 px (footer nero, fascia del dialogo, foto di "Certi incontri"). Consigliato: allargare footer e fascia, lasciare le foto nella composizione centrata.
2. Chiarire le tre foto aperte (struttura 1, fondo del dialogo e footer) e la quinta dello slider.
3. Invio vero del modulo contatti; cookie banner e privacy (iubenda).
4. Versione in inglese (pagina `/en/`, selettore IT | EN). La sezione stampa c'è già (`data/news.json` + pannello Pages CMS, vedi README): foto e testi attuali sono segnaposto presi dal layout; il pannello va provato dopo il merge. Per l'inglese le news andranno duplicate (es. `news-en.json`).
5. Video definitivo (peso consigliato 10-15 MB; i file sopra 100 MB GitHub li rifiuta).
6. Passaggio al dominio definitivo: se il dominio è su Wix, tenere Wix solo per il dominio e puntare i record DNS a un hosting statico (GitHub Pages, Cloudflare Pages o Netlify). Non lasciare la posta senza i record MX.

## Note per i controlli
- Nel browser di prova (Chromium) il video MP4 non parte perché manca il codec H.264. Per provare la riproduzione si usa una copia WebM; nei browser veri funziona.
- Contatti: info@fuziajammali.com.
