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
- Video hero: parte a pagina caricata e non con risparmio dati/rete lenta (resta la locandina, parte con un tocco). Su telefono (≤ 800 px) usa `assets/video/hero-mobile.mp4` (720p, ~12 MB, attributo `data-src-mobile` sul `<video>`); se non carica, si torna a `hero.mp4`. Per rifarlo: HandBrake, 720p, H.264, ~900 kbps in 2 passaggi, "Ottimizzato per il web"; se l'indice è in fondo al file (non ottimizzato) basta `python tools/faststart.py assets/video/hero-mobile.mp4` (senza ricodificare).

## Versione inglese
- I testi traducibili sono marcati in `index.html` con `data-i18n="chiave"` (testo) o `data-i18n-attr="attributo:chiave"` (es. segnaposto, descrizioni); i messaggi di `js/main.js` sono scritti `T(chiave, testo italiano)`.
- **Elenco da tradurre**: `i18n/traduzioni.csv` (chiave ; contesto ; italiano ; inglese). Chi traduce compila solo la colonna `inglese`; istruzioni in `i18n/COME-TRADURRE.md` (`|` = a capo, `¶` = nuovo paragrafo, `=` = uguale all'italiano).
- **Caricamento**: si sostituisce `i18n/traduzioni.csv` nel repo. A ogni pubblicazione `tools/i18n.py build` crea `en/index.html` (indirizzi relativi alla radice con `<base href="../">`) e rende visibile il selettore IT | EN. Senza traduzioni la pagina inglese non viene creata e il selettore resta nascosto. Celle vuote: resta l'italiano, e il log di pubblicazione elenca le mancanti.
- I titoli grandi che in inglese escono dalla pagina si rimpiccioliscono da soli (`--fit`, in `js/main.js`).
- **Caricare una traduzione rivista** (.xlsx o .csv con le colonne `chiave` e `inglese`): `python tools/i18n.py import FILE` aggiorna `i18n/traduzioni.csv` usando solo la colonna `inglese` (la colonna italiana del file non viene usata) e segnala segnaposto o paragrafi che non corrispondono. Per leggere un .xlsx serve `pip install openpyxl`.
- **Se si cambia un testo italiano o se ne aggiunge uno**: `python tools/i18n.py export` (aggiorna il CSV mantenendo le traduzioni esistenti). Anteprima locale della pagina inglese: `python tools/i18n.py build --out .` e aprire `/en/` (la cartella `en/` non va committata).
- **Bozza di traduzione inglese**: `i18n/bozza-traduzione-en.csv` (con una colonna `note`). Non viene usata dal sito: per adottarla, dopo la revisione, si copia come `i18n/traduzioni.csv` (la colonna `note` è ignorata) e dal merge successivo la pagina `/en/` esce online.
- Non tradotti da questo sistema: le news (Stampa) e il testo scritto dentro il video.

## Privacy e cookie
- Pagine `privacy/` e `cookie/` (italiano) ed `en/privacy/`, `en/cookie/` (inglese): HTML statico, stile in `css/legal.css`. Titolare: Jammali Faouzia, corso Racconigi 10, 10138 Torino, info@fuziajammali.com. **Testi in bozza, da far validare dal consulente prima della pubblicazione definitiva.**
- Il modulo di contatto apre il programma di posta (`data-endpoint` vuoto): i dati non passano da server del sito, e l'informativa lo dice. **Se si collega un servizio esterno (es. Formspree), l'informativa va aggiornata** (nuovo destinatario, eventuale trasferimento extra UE).
- Il sito non usa cookie né local storage; per le statistiche usa **Cloudflare Web Analytics** (senza cookie), quindi non c'è il banner del consenso. Si attiva incollando il token del sito in `cfAnalyticsToken` di `js/config.js` (Cloudflare → Web Analytics → Add a site → JS snippet; con hosting GitHub Pages non serve il proxy Cloudflare). Senza token non parte nulla; in locale non parte mai. **Se si aggiungono altri strumenti o servizi di terzi, vanno aggiornate privacy e cookie policy** e va valutato se serve il consenso.
- Link a privacy e cookie: nel footer e sotto il modulo (voci `footer.*` e `contatti.privacy*` in `i18n/traduzioni.csv`; per la pagina inglese l'indirizzo è `en/privacy/`, `en/cookie/`).
- Da aggiornare quando cambiano: hosting (oggi GitHub Pages), regione/fornitore del database (Supabase), servizio di posta, periodo di conservazione dei messaggi (24 mesi, confermati dal titolare). Mancano ancora partita IVA ed eventuali altri dati societari da mostrare nel footer.

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
