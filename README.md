# Fuzia Jammali – sito monopagina

Sito statico (HTML + CSS + JS), nessuna dipendenza né strumenti di compilazione. Online su **https://www.fuziajammali.com** (versione inglese: `/en/`). Per chi lo segue senza programmare: `GUIDA.md`.

## Struttura
```
index.html          pagina unica (italiano; l'inglese si genera a ogni pubblicazione)
css/style.css       stili (palette, font, impaginazione desktop e telefono)
css/legal.css       stili delle pagine privacy e cookie
js/main.js          video hero, slider, notizie, titoli lunghi, modulo contatti, statistiche
js/motion.js        movimento (titoli, gruppi di foto, parallasse, sovrapposizioni su telefono)
js/config.js        configurazione pubblica: Supabase e token Cloudflare Web Analytics
privacy/ cookie/    informativa privacy e cookie policy (IT); en/privacy/ en/cookie/ (EN)
admin/              pannello per le notizie (login con email e password)
assets/img/         foto (+ versioni leggere -900 create in automatico), logo, favicon, immagine di condivisione (og.jpg)
assets/video/       hero.mp4 (desktop) e hero-mobile.mp4 (telefono)
assets/fonts/       Poiret One (titoli) e Nunito (testo), in locale
assets/icons/       icone social
data/news.json      copia di riserva delle notizie (se Supabase non risponde)
i18n/               traduzioni (traduzioni.csv) e istruzioni per tradurre
supabase/           schema.sql del database delle notizie
tools/              script: versioni leggere delle foto, traduzioni, ottimizzazione video
robots.txt sitemap.xml
GUIDA.md            guida per chi segue il sito
PROMEMORIA.md       stato del progetto e note tecniche
```
`PROMEMORIA.md`, `GUIDA.md`, `supabase/`, `README.md`, `design/`, `tools/` e `i18n/` non vengono pubblicati sul sito.

## Come si lavora e si pubblica
1. Si parte da `main` aggiornato su un ramo di lavoro.
2. Si apre una pull request (anche in bozza); chi gestisce il sito clicca "Ready for review", poi "Merge pull request" e "Confirm merge".
3. A ogni unione in `main` il workflow `.github/workflows/pages.yml` pubblica su GitHub Pages (circa un minuto). Il dominio personalizzato `www.fuziajammali.com` e HTTPS sono impostati in Settings → Pages.

**Cache**: a ogni pubblicazione il workflow aggiunge `?v=<codice>` ai riferimenti a stili, script e immagini. La pagina `index.html` può però restare in cache fino a ~10 minuti: ricaricare con Ctrl+Maiusc+R (Cmd+Maiusc+R su Mac) o finestra privata.

Prova in locale: `python -m http.server 8765` nella cartella del sito, poi `http://localhost:8765/`. Per vedere la pagina inglese: `python tools/i18n.py build --out .` e aprire `/en/` (la cartella `en/` generata non va committata). Per le versioni leggere delle foto: `python tools/make-variants.py` (serve Pillow).

## Impaginazione (essenziale)
- Desktop: composizione centrata di massimo 1920 px (`.page`), che scala in proporzione con le unità `cqw`. Ogni elemento ha posizione e misure inline (`--x --y --w --h`).
- Telefono (fino a 800 px): coordinate proprie (`--mx --my --mw --mh`), definite nello stesso elemento (`--um` è l'unità, con tetto a 520 px di larghezza).
- Eccezione: l'hero (video) sta fuori da `.page` per essere a tutta larghezza.
- Colori: `#f8f8f8` sfondo · `#111111` nero · `#ffffff`. Font: Poiret One (titoli), Nunito (testo).
- **Sovrapposizioni su telefono**: alcune foto hanno `data-drift` (fattore di spostamento durante lo scorrimento, massimo ±28 px), `data-drift-x` (scivolamento laterale) e `data-drift-down` (tetto verso il basso), gestiti da `js/motion.js`. A riposo (gruppo al centro dello schermo) il layout coincide con quello progettato; si disattiva con "riduci movimento" e sopra 800 px. Le foto piccole restano unite alla foto grande accanto (stesso fattore) o ferme.

## Sostituire foto, video, testi
Sovrascrivere i file in `assets/img/` mantenendo gli stessi nomi (JPG, lato lungo ~2000 px, qualità 80–85): le versioni `-900` per il telefono si creano da sole alla pubblicazione.
- **Video hero**: `assets/video/hero.mp4` (16:9, a tutta larghezza, parte da solo senza audio; pulsante audio in basso a destra) e `assets/video/hero-mobile.mp4`. Per cambiare la locandina: `assets/img/hero.jpg`.
- **Slider** «La forza della presenza»: nell'`<img data-slide>` l'elenco in `data-images="a.jpg,b.jpg,..."`.
- **Immagine di condivisione** (anteprima nei social, Google): `assets/img/og.jpg`, 1200×630.
- **Testi**: in `index.html`, con `data-i18n="chiave"`; dopo averli cambiati `python tools/i18n.py export` aggiorna `i18n/traduzioni.csv`.

## Notizie / stampa (Supabase)
Le card della sezione «Press» si leggono dalla tabella `news` del progetto Supabase `kmjaocqnzkqdfcgymbcl` (URL e chiave **pubblica** in `js/config.js`; mai la chiave secret/service_role nel repo). Se Supabase non risponde, il sito usa `data/news.json`.
- **Gestione**: pagina `/admin/` (`https://www.fuziajammali.com/admin/`), accesso con email e password. Si aggiunge, modifica, nasconde, riordina (↑ ↓) ed elimina; la foto viene ritagliata quadrata e ridimensionata (1400 px) in automatico. La prima voce è la card in alto a sinistra.
- **Database e permessi**: `supabase/schema.sql` (tabella `news`, tabella `admins` con le email autorizzate, regole di accesso, cartella foto `news`). Va eseguito una volta nel SQL Editor di Supabase.
- **Nuovo utente**: Supabase → Authentication → Users → Add user (con "Auto Confirm"), poi `insert into public.admins (email) values ('…');`. Le registrazioni libere sono disattivate (Authentication → Sign In / Providers → Email → "Allow new users to sign up" spento). Se si usano link di conferma, aggiungere `https://www.fuziajammali.com` in Authentication → URL Configuration.
- `admin/vendor/supabase.js` è la libreria `@supabase/supabase-js` 2.117.0 (build UMD), inclusa nel repo per non dipendere da CDN.
- **Piano gratuito**: il progetto va in pausa dopo circa una settimana senza attività; il sito ripiega su `data/news.json` (da tenere allineato) finché non si riattiva. Per un uso stabile valutare il piano a pagamento.
- Le notizie non sono tradotte in inglese (servirebbero campi `_en` e un aggiornamento di `/admin/`).

## Versione inglese
- I testi traducibili sono marcati con `data-i18n="chiave"` (testo) o `data-i18n-attr="attributo:chiave"` (es. segnaposto, `content`, `href`); i messaggi di `js/main.js` sono scritti `T(chiave, testo italiano)`.
- **Elenco da tradurre**: `i18n/traduzioni.csv` (chiave ; contesto ; italiano ; inglese). Chi traduce compila solo la colonna `inglese`; istruzioni in `i18n/COME-TRADURRE.md` (`|` = a capo, `¶` = nuovo paragrafo, `=` = uguale all'italiano).
- **Pubblicazione**: a ogni merge `tools/i18n.py build` crea `en/index.html` (indirizzi relativi alla radice con `<base href="../">`) e rende visibile il selettore IT | EN. Celle vuote: resta l'italiano, e il log della pubblicazione elenca le mancanti.
- I titoli grandi che in inglese escono dalla pagina si rimpiccioliscono da soli (`--fit`, in `js/main.js`).
- **Caricare una traduzione rivista** (.xlsx o .csv con le colonne `chiave` e `inglese`): `python tools/i18n.py import FILE` aggiorna `i18n/traduzioni.csv` usando solo la colonna `inglese` e segnala segnaposto o paragrafi che non corrispondono (per .xlsx: `pip install openpyxl`).
- Il titolo, la descrizione, l'indirizzo ufficiale (`meta.url`) e la lingua per le condivisioni (`meta.locale`) sono voci del CSV come le altre.
- Non tradotti da questo sistema: le notizie e il testo scritto dentro il video.

## Prestazioni (telefono)
- Ogni foto ha una versione leggera `nome-900.jpg` che il telefono sceglie da solo (`srcset`); le foto si caricano man mano che si scorre (`loading="lazy"`). Le versioni leggere si creano a ogni pubblicazione (`tools/make-variants.py`); se `index.html` cita una `-900` che non esiste, la pubblicazione si ferma e il sito resta com'è.
- Video hero: parte a pagina caricata e non con risparmio dati/rete lenta (resta la locandina). Su telefono (≤ 800 px) usa `hero-mobile.mp4` (720p, ~12 MB, attributo `data-src-mobile`); se non carica, si torna a `hero.mp4`. Per rifarlo: HandBrake, 720p, H.264, ~900 kbps in 2 passaggi, "Ottimizzato per il web"; se l'indice è in fondo al file basta `python tools/faststart.py assets/video/hero-mobile.mp4`.

## Privacy, cookie, statistiche
- Pagine `privacy/`, `cookie/`, `en/privacy/`, `en/cookie/` (HTML statico, `noindex`, non in sitemap). Titolare: Jammali Faouzia, info@fuziajammali.com (indirizzo di residenza volutamente non indicato). **Testi in bozza: da far validare dal consulente.** Conservazione dei messaggi: 24 mesi (confermata dal titolare).
- Il modulo di contatto apre il programma di posta (`data-endpoint` vuoto) e invia a `data-to` (info@fuziajammali.com): i dati non passano da un server del sito. **Se si collega un servizio esterno (es. Formspree) l'informativa va aggiornata.**
- Nessun cookie né local storage. **Cloudflare Web Analytics** (senza cookie) è caricato da `js/main.js` con il token `cfAnalyticsToken` di `js/config.js` (non parte in locale). Il token è per `www.fuziajammali.com`. Se si aggiungono altri strumenti o servizi di terzi vanno aggiornate privacy e cookie policy e va valutato il consenso.
- Da aggiornare quando cambiano: hosting (oggi GitHub Pages), fornitore o regione del database (Supabase), servizio di posta, periodo di conservazione. Mancano partita IVA ed eventuali dati societari da mostrare nel footer (riga `.legal` in `index.html`).

## SEO
Titolo, descrizione, `canonical`, `hreflang` it/en, Open Graph con `og.jpg`, favicon (48, 192, apple-touch), dati strutturati `Organization` in `index.html`; `robots.txt` (esclude `/admin/`) e `sitemap.xml` (home e `/en/`). Le pagine legali e `/admin/` sono `noindex`. In Google Search Console aggiungere `https://www.fuziajammali.com/` e inviare la sitemap.

## Dominio e posta
- Il dominio `fuziajammali.com` è registrato su Wix, che ne gestisce i DNS: `www` → CNAME `scriptdifau.github.io`; dominio senza www → quattro record A di GitHub Pages (`185.199.108.153` … `.111.153`). In GitHub Pages il dominio personalizzato è `www.fuziajammali.com` con HTTPS attivo.
- La posta `info@fuziajammali.com` è su Microsoft (record MX `…pamx1.hotmail.com`, SPF `spf.protection.outlook.com`): **non toccare MX, SPF e le verifiche Google/Facebook** nei DNS.
- Il proxy Cloudflare (nuvola arancione) non va attivato sul dominio senza rivedere le policy.
- **Cambio hosting**: il sito è statico e si sposta ovunque (Cloudflare Pages, Netlify, FTP). Si caricano `index.html`, `css/`, `js/`, `assets/`, `admin/`, `data/`, `privacy/`, `cookie/`, `robots.txt`, `sitemap.xml` e la cartella `en/` generata con `python tools/i18n.py build --out _site`. Poi aggiornare l'hosting nelle policy e rivedere i DNS.
