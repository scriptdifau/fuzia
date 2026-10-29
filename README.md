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

## News / stampa (backend Supabase)
Le card della sezione "Stampa" si leggono dalla tabella `news` del progetto Supabase `kmjaocqnzkqdfcgymbcl` (URL e chiave **pubblica** in `js/config.js`; mai la chiave secret/service_role nel repo). Se Supabase non risponde, il sito usa `data/news.json` come copia di riserva.
- **Gestione**: pagina `/admin/` (es. `https://scriptdifau.github.io/fuzia/admin/`), accesso con email e password. Si aggiunge, modifica, nasconde, riordina (↑ ↓) ed elimina; la foto viene ritagliata quadrata e ridimensionata in automatico. La prima voce è la card in alto a sinistra.
- **Database e permessi**: `supabase/schema.sql` (tabella `news`, tabella `admins` con le email autorizzate, regole di accesso, cartella foto `news`). Va eseguito una volta nel SQL Editor di Supabase.
- **Nuovo utente**: Supabase → Authentication → Users → Add user (con "Auto Confirm"), poi `insert into public.admins (email) values ('…');`. Le registrazioni libere vanno disattivate (Authentication → Sign In / Providers → Email → "Allow new users to sign up" spento).
- `admin/vendor/supabase.js` è la libreria `@supabase/supabase-js` 2.117.0 (build UMD), inclusa nel repo per non dipendere da CDN.
- **Cambio hosting**: il sito è statico, si sposta ovunque; Supabase resta com'è (basta aggiungere il nuovo dominio tra gli URL consentiti in Authentication → URL Configuration, se si usano link di conferma).
- Progetto gratuito: va in pausa dopo circa una settimana senza attività; per un uso stabile valutare il piano a pagamento.

## Prestazioni (telefono)
- Ogni foto ha una versione leggera `nome-900.jpg` (900 px) che il telefono sceglie da solo (`srcset` in `index.html`); le foto si caricano man mano che si scorre (`loading="lazy"`).
- **Le versioni leggere si creano da sole** a ogni pubblicazione (passo "Crea le versioni leggere delle foto" in `.github/workflows/pages.yml`, che usa `tools/make-variants.py`): per cambiare una foto basta sostituire l'originale mantenendo il nome. Se `index.html` cita una `-900` che non esiste, la pubblicazione si ferma e il sito resta com'è. Per provare il sito in locale: `python tools/make-variants.py` (serve Pillow).
- Video hero: parte a pagina caricata e non con risparmio dati/rete lenta (resta la locandina, parte con un tocco). Per telefono si può aggiungere una versione leggera (720p, 4-6 MB circa) `assets/video/hero-mobile.mp4` e l'attributo `data-src-mobile="assets/video/hero-mobile.mp4"` sul `<video>`: se il file non carica, si torna al video normale.

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
