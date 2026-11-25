# Il sito di Fuzia Jammali – Guida per chi lo segue

*Aggiornata a novembre 2026 · www.fuziajammali.com*

Il sito è online e funziona. **Non serve fare nulla perché resti online**: non ci sono programmi da aggiornare né abbonamenti da rinnovare per il sito in sé (restano il dominio e la posta, vedi più sotto). Questa guida spiega com'è fatto, dove sta ogni cosa e cosa fare quando serve cambiare qualcosa.

## 1. Il sito in breve

- È un sito **statico**: una sola pagina, in italiano e in inglese (www.fuziajammali.com e www.fuziajammali.com/en/). Non ha un pannello per modificare tutto: foto e testi sono nei file del sito.
- Le **notizie della sezione Press** si gestiscono da un pannello a parte, semplice, con email e password (vedi punto 3).
- Il **modulo di contatto** apre il programma di posta di chi scrive e il messaggio arriva a info@fuziajammali.com (punto 5).
- Il sito **non usa cookie** e non mostra banner. Misura le visite in forma anonima (punto 6).

## 2. Dove sta ogni cosa

| Cosa | Dove | Note |
|---|---|---|
| Nome del sito (dominio) | Wix | Il dominio fuziajammali.com è registrato su Wix, che ne gestisce anche i DNS. Il sito non è più su Wix: i DNS puntano a GitHub. |
| Posta info@fuziajammali.com | Microsoft (Outlook / Microsoft 365) | Non c'entra con il sito. I record di posta nel pannello del dominio non vanno toccati. |
| File del sito (testi, foto, video) | GitHub, repository «fuzia» | Il sito si pubblica da solo, circa un minuto dopo ogni modifica approvata. |
| Notizie (Press) | Supabase | Database e foto delle notizie, con il pannello /admin/. |
| Statistiche delle visite | Cloudflare Web Analytics | Senza cookie, in forma anonima. |
| Modulo contatti | Posta di chi scrive | Nessun servizio esterno: i messaggi non passano da un server del sito. |

> Gli accessi a GitHub, Supabase e Cloudflare sono gestiti da Fausto. Per qualunque modifica o problema scrivere a lui (contatti in fondo alla guida): non serve avere un account per usare il sito.

## 3. Aggiornare le notizie (sezione Press)

Le tre card sotto il titolo «Press» si cambiano da un pannello, senza toccare il sito.

1. Aprire **www.fuziajammali.com/admin/** e accedere con email e password (le credenziali le dà Fausto).
2. **Aggiungere** una notizia: scrivere testata (es. «Vanity Fair»), titolo, descrizione, il link all'articolo e caricare una foto. La foto viene ritagliata quadrata e ridimensionata in automatico.
3. **Modificare, nascondere o eliminare** una notizia dall'elenco. «Nascondere» la toglie dal sito senza cancellarla, «eliminare» la cancella.
4. **Cambiare l'ordine** con le frecce ↑ ↓: la prima voce è la card in alto a sinistra.
5. Le modifiche compaiono sul sito subito, ricaricando la pagina.

> Le notizie sono solo in italiano (anche nella versione inglese del sito). Se servono in inglese va aggiunto un campo al pannello: chiedere a Fausto.

## 4. Cambiare foto, testi o traduzioni

Queste modifiche si fanno sui file del sito e le fa Fausto. Per chiederle basta una mail con:

- **Foto**: il file nuovo (JPG, lato lungo almeno 2000 px) e dove va. Basta dire, per esempio, «la terza foto della sezione Rigore e creatività» oppure inviare uno screenshot con un cerchio sulla foto. Le versioni leggere per il telefono si creano da sole.
- **Testi**: il testo nuovo, scritto per intero, e dove va. Se è un titolo grande, tenere presente che in inglese un titolo molto lungo viene rimpicciolito in automatico.
- **Video** in apertura: oggi ha il testo italiano scritto dentro. Per la versione inglese serve un video con il testo tradotto.
- **Traduzioni inglesi**: stanno in un unico file Excel/CSV (`i18n/traduzioni.csv`) con tre colonne: chiave, italiano, inglese. Chi traduce compila solo la colonna «inglese».

Dopo l'approvazione, la modifica è online in circa un minuto. Se non la si vede, ricaricare la pagina con **Ctrl+Maiusc+R** (Cmd+Maiusc+R su Mac) o aprire una finestra privata: può restare una copia vecchia per qualche minuto.

## 5. Messaggi dal modulo contatti

- Quando una persona preme «Invia», **si apre il suo programma di posta** con un messaggio già scritto e indirizzato a info@fuziajammali.com. Il messaggio arriva da lei, dal suo indirizzo, direttamente nella casella.
- Se la persona non ha un programma di posta configurato (per esempio usa solo Gmail nel browser), il pulsante può non fare nulla. Per questo in fondo alla pagina c'è anche l'indirizzo **info@fuziajammali.com** scritto per esteso.
- Se in futuro si volesse un modulo che invia da solo (con servizi come Formspree), basta chiederlo, ma **vanno aggiornate privacy e cookie policy**.

## 6. Statistiche delle visite

Il sito usa **Cloudflare Web Analytics**: conta le visite, le pagine viste e la provenienza (Paese, dispositivo) senza cookie e senza seguire le persone. Per leggerle serve l'accesso all'account Cloudflare (gestito da Fausto). Chi blocca la pubblicità può non essere contato, quindi i numeri sono un po' più bassi della realtà.

## 7. Privacy e cookie

- Il sito ha l'**Informativa sulla privacy** e la **Cookie Policy**, in italiano e in inglese, collegate dal fondo pagina e sotto il modulo. Non c'è banner dei cookie perché il sito non ne usa.
- I testi sono una bozza preparata per il progetto: **vanno fatti vedere al consulente** prima di considerarli definitivi.
- **Vanno aggiornati** quando si aggiunge qualcosa di nuovo: Google Analytics o altri strumenti di statistica, pixel di Facebook/Instagram, mappe o video incorporati, newsletter, un servizio esterno per il modulo, un nuovo hosting. In questi casi **avvisare Fausto prima**: potrebbe servire il banner di consenso.
- Nel fondo pagina, accanto al nome, si possono aggiungere partita IVA e dati societari: comunicarli a Fausto.

## 8. Se qualcosa non va

| Problema | Cosa controllare / fare |
|---|---|
| Ho cambiato qualcosa ma non lo vedo | Aspettare un minuto e ricaricare con Ctrl+Maiusc+R o da finestra privata. |
| Le notizie non compaiono o sono vecchie | Il piano gratuito del database va in pausa dopo circa una settimana senza visite. Il sito mostra allora le notizie di riserva. Scrivere a Fausto: si riattiva in pochi minuti. |
| Il sito non si apre o dice «errore» | Verificare da telefono con i dati mobili (non Wi-Fi). Se non va nemmeno così, scrivere a Fausto: può essere un problema del dominio o di GitHub. |
| Le email non arrivano più | Quasi certamente sono stati toccati i record di posta nel pannello DNS del dominio su Wix. Non cambiare nulla e scrivere a Fausto. |
| Il modulo non apre la posta | Normale se la persona non ha un programma di posta: usare l'indirizzo scritto in fondo alla pagina. |
| Il video non parte su un telefono | Con la modalità risparmio dati o la rete lenta il video resta fermo e parte con un tocco. Non è un guasto. |

## 9. Cose da non fare

- **Non cambiare i DNS del dominio** nel pannello di Wix e non cancellare record: ne dipendono sito e posta.
- **Non attivare il proxy di Cloudflare** (la «nuvola arancione») sul dominio senza parlarne prima con Fausto.
- **Non condividere la password di /admin/** con chi non deve aggiornare le notizie.
- **Non cambiare hosting né collegare servizi esterni** (statistiche, moduli, newsletter) senza avvisare: vanno aggiornate privacy e cookie policy.

## 10. Rinnovi e costi

| Voce | Costo / scadenza |
|---|---|
| Dominio fuziajammali.com (Wix) | Si rinnova ogni anno sul pannello di Wix: controllare la scadenza e tenere attivo il rinnovo automatico. |
| Posta (Microsoft) | Già in essere, indipendente dal sito. |
| Hosting del sito (GitHub Pages) | Gratuito. |
| Notizie (Supabase) | Gratuito. Se serve più stabilità c'è un piano a pagamento (indicativamente 25 dollari al mese). |
| Statistiche (Cloudflare) | Gratuito. |

## Contatti per modifiche e problemi

Fausto Trucillo – [inserire email e telefono]
