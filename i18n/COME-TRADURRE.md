# Come tradurre il sito in inglese

Si lavora su un solo file: `traduzioni.csv` (in questa cartella). Si apre con **Excel** o **Google Sheets**.

## Le colonne
| colonna | cosa contiene | cosa fare |
|---|---|---|
| `chiave` | codice interno del testo | **non toccare** |
| `contesto` | dove compare il testo nel sito | serve solo per capire |
| `italiano` | il testo italiano | **non toccare** |
| `inglese` | la traduzione | **da compilare** |

## Regole
- Compila solo la colonna `inglese`. Una cella vuota lascia il testo in italiano.
- Se il testo è identico in inglese (per esempio «Email», un nome proprio) scrivi `=` nella cella.
- **`|` significa «vai a capo»** (si vede solo su computer: su telefono il testo scorre da solo). Metti i ritorni a capo più o meno dove sono nell'italiano, in modo che le righe abbiano una lunghezza simile e non siano più larghe dell'originale.
- **`¶` significa «nuovo paragrafo»** (riga vuota). Mantienilo dove c'è nell'italiano.
- Le parti tra graffe, come `{n}`, `{titolo}` o `{email}`, vanno **lasciate così com'è**: il sito le sostituisce.
- Scrivi testo semplice, senza codice HTML. Gli apostrofi e le virgolette normali vanno bene.
- I titoli grandi sono su righe separate (riga 1, riga 2…): ogni riga ha la sua cella. Un titolo inglese più lungo si adatta da solo riducendo un po' il carattere, ma è meglio che sia breve.
- Le voci segnate «(non visibile)» sono descrizioni per chi usa uno screen reader, o testi per Google: vanno tradotte comunque.

## Come consegnare il file
Salva il file come **CSV** (con Excel: «CSV UTF-8 (delimitato da virgole)» o «delimitato dal punto e virgola»; con Google Sheets: File → Scarica → CSV) con lo stesso nome, `traduzioni.csv`, e caricalo nel repository GitHub nella cartella `i18n/` (Add file → Upload files), sostituendo quello esistente. Dopo il caricamento il sito si aggiorna da solo in circa un minuto: la versione inglese compare su `/en/` e in alto a destra appare il selettore **IT | EN**.

Le maiuscole nei titoli grandi non cambiano l'aspetto: sul sito i titoli sono sempre mostrati in maiuscolo. Contano solo per gli screen reader e per Google, quindi si può scrivere «The Strength of Presence» come si preferisce.

## Cosa non si traduce da questo file
- Le **news** della sezione Stampa (si gestiscono da `/admin/`).
- Il testo scritto **dentro il video** in alto («Ogni intuizione nasce da un movimento»): serve una versione inglese del video.

## Se cambia il testo italiano del sito
Chi sviluppa il sito esegue `python tools/i18n.py export`, che aggiunge le nuove righe e mantiene le traduzioni già scritte.
