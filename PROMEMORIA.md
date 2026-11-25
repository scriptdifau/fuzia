# Promemoria di progetto – sito Fuzia Jammali

Aggiornato al 25 novembre 2026. Serve per riprendere il lavoro in una nuova sessione. Dettagli tecnici nel `README.md`; guida per chi segue il sito in `GUIDA.md`.

## Stato attuale: consegnato e online
- Sito online su **https://www.fuziajammali.com** (inglese: `/en/`). Si pubblica da solo a ogni unione in `main` (GitHub Actions, `.github/workflows/pages.yml`). Il vecchio indirizzo `scriptdifau.github.io/fuzia` rimanda al dominio nuovo.
- Il dominio è su Wix (registrazione e DNS), puntato a GitHub Pages. La posta `info@fuziajammali.com` è su Microsoft: **non toccare i record MX, SPF e di verifica**.
- Funziona: italiano e inglese (selettore IT | EN), sezione Press da Supabase con pannello `/admin/`, modulo contatti via email, Cloudflare Web Analytics (token in `js/config.js`), privacy e cookie policy IT/EN, SEO (titolo e descrizione, Open Graph, favicon, hreflang, dati strutturati, robots, sitemap), sovrapposizioni delle foto su telefono.
- Controlli fatti il 25 novembre: 74 file collegati dalle sei pagine rispondono 200; nessun errore in console; nessun cookie né local storage; nessuno scorrimento orizzontale tra 320 e 1920 px (IT ed EN); notizie lette da Supabase; beacon Cloudflare attivo; pubblicazioni su GitHub Actions tutte riuscite.

## Come si lavora
1. Si parte da `main` aggiornato su un ramo di lavoro.
2. Si apre una PR in bozza; chi gestisce il sito clicca "Ready for review", poi "Merge pull request" e "Confirm merge".
3. Dopo circa un minuto il sito è aggiornato (la pagina può restare in cache ~10 minuti: Ctrl+Maiusc+R).

Modifiche semplici: su GitHub si apre il file con la matita (Edit) per i testi, oppure si carica in `assets/img` una foto con lo stesso nome e le stesse proporzioni ("Add file" > "Upload files"). Se si cambia un testo, rigenerare il file traduzioni: `python tools/i18n.py export`.

## Accessi e proprietà (gestiti da Fausto, i clienti non devono fare nulla)
- GitHub: repository `scriptdifau/fuzia` (pubblico), GitHub Pages con dominio `www.fuziajammali.com`.
- Supabase: progetto `kmjaocqnzkqdfcgymbcl` (notizie, foto, utenti di `/admin/`); piano gratuito.
- Cloudflare: account con Web Analytics per `www.fuziajammali.com`.
- Dominio: Wix (clienti). Posta: Microsoft (clienti).
- Le credenziali non stanno nel repository.

## Da fare / aperto
1. **Partita IVA e dati societari** nel footer: da chiedere ai clienti (unica richiesta aperta). Nel footer c'è la riga `Jammali Faouzia` (classe `.legal` in `index.html`).
2. Privacy e cookie policy sono bozze: da far validare dal consulente dei clienti quando possibile. Vanno aggiornate se cambiano hosting, database, posta o si aggiungono strumenti di terzi.
3. Opzionali, non richiesti: versione inglese del video dell'hero (ha il testo italiano dentro), notizie in inglese (campi `_en` in Supabase e in `/admin/`), eventuale modulo con invio vero (servizio esterno, da dichiarare nelle policy), piano a pagamento di Supabase (il gratuito va in pausa dopo ~1 settimana senza attività; il sito ripiega su `data/news.json`).
4. Il repository è pubblico e la sua cronologia contiene l'indirizzo di casa del titolare (commit delle prime PR privacy): deciso di lasciarla così.

## Note per i controlli
- Nel browser di prova (Chromium) il video MP4 non parte perché manca il codec H.264, e i frame si renderizzano solo quando si fa uno screenshot (lazy loading, animazioni e scroll si verificano misurando gli elementi). Per la prova locale serve `python -m http.server` (senza supporto Range: non si possono provare i salti nel video).
- Le misure dei layout su telefono sono in unità `--um` (390 px = 1 unità per punto); a riposo il layout deve coincidere con quello progettato, durante lo scorrimento le foto si spostano al massimo di 28 px.

## Foto: dal file ritoccato al file del sito
Nomi nel file zip: "Fuzia Jammali - 28 Settembre 2026-NNN (Personalizzato).jpg". Nel repository sono presenti solo i file del sito, non gli originali.

| File del sito | NNN | | File del sito | NNN |
|---|---|---|---|---|
| dialogo-1 | 051 | | rigore-3 (bianco e nero) | 046-2 |
| dialogo-2 | 660 | | rigore-4 | 293 |
| dialogo-3 | 262 | | forza-1 | 444 |
| struttura-2 | 229 | | slider-1 | 631 |
| struttura-3 | 216 | | slider-2 | 093 |
| copertura-1 | 119 | | slider-3 | 517 |
| copertura-2 | 456 | | slider-4 | 654 |
| copertura-3 | 333 | | slider-5 | 180 |
| rigore-1 | 378 | | slider-6 | 371 |
| rigore-2 | 074 | | certi | 620 |
| atelier-1 | 193 | | atelier-2 (bianco e nero) | 353 |
| atelier-3 | 665 | | footer | ritaglio dello scatto della figura incappucciata |

`struttura-1` e lo sfondo del dialogo (`dialogo-bg`) non risultano dallo zip originale (origine non documentata). Foto di condivisione (`og.jpg`): ritaglio di `certi`.
