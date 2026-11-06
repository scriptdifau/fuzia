#!/usr/bin/env python3
"""Versione inglese del sito: elenco dei testi da tradurre (CSV) e generazione della pagina /en/.

Come funziona
  - In index.html i testi traducibili hanno l'attributo data-i18n="chiave" (testo dentro l'elemento)
    oppure data-i18n-attr="attributo:chiave" (es. placeholder, aria-label). I messaggi di js/main.js
    sono scritti come T('chiave', 'italiano').
  - `export` crea/aggiorna i18n/traduzioni.csv: chiave ; contesto ; italiano ; inglese.
    Chi traduce compila solo la colonna "inglese". Le traduzioni già scritte non si perdono.
  - `build` legge il CSV e crea en/index.html (e rende visibile il selettore IT | EN).
    Una cella inglese vuota lascia l'italiano; "=" significa "uguale all'italiano" (es. Email, nomi propri).

Nel file CSV:   |  = a capo (solo desktop)      ¶  = nuovo paragrafo

Uso
  python tools/i18n.py export                  aggiorna i18n/traduzioni.csv
  python tools/i18n.py import FILE             carica le traduzioni da un .xlsx o .csv rivisto (ne usa solo la colonna "inglese")
  python tools/i18n.py build --out DIR         scrive DIR/en/index.html (DIR = cartella del sito, di solito _site)
  python tools/i18n.py build --out . --strict  anteprima locale in ./en/ ; con --strict fallisce se manca qualche traduzione
Solo libreria standard di Python 3.
"""
import argparse
import csv
import html
import io
import json
import os
import re
import sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC = os.path.join(ROOT, 'index.html')
JS = os.path.join(ROOT, 'js', 'main.js')
CSV_PATH = os.environ.get('FUZIA_I18N_CSV') or os.path.join(ROOT, 'i18n', 'traduzioni.csv')   # (la variabile serve solo per le prove)
SAME = '='                                   # "inglese uguale all'italiano"

CONTEXT = {
    'meta.titolo': 'Pagina · titolo della scheda del browser (e di Google)',
    'meta.descrizione': 'Pagina · breve descrizione per Google (non visibile nel sito)',
    'testata.logo': 'Testata · descrizione del logo per screen reader (non visibile)',
    'hero.aria': 'Video in alto · descrizione per screen reader (non visibile)',
    'dialogo.citazione': 'Il dialogo tra opposti · citazione (la firma «Fuzia Jammali» resta)',
    'dialogo.t1': 'Il dialogo tra opposti · titolo grande, riga 1',
    'dialogo.t2': 'Il dialogo tra opposti · titolo grande, riga 2',
    'dialogo.t3': 'Il dialogo tra opposti · titolo grande, riga 3',
    'dialogo.t4': 'Il dialogo tra opposti · titolo grande, riga 4 (nel riquadro nero)',
    'dialogo.testo': 'Il dialogo tra opposti · paragrafo',
    'struttura.t1': 'Struttura e morbidezza · titolo, riga 1 (nel riquadro nero)',
    'struttura.t2': 'Struttura e morbidezza · titolo, riga 2',
    'struttura.testo': 'Struttura e morbidezza · paragrafo',
    'copertura.t1': 'Copertura e trasparenza · titolo, riga 1 (nel riquadro nero)',
    'copertura.t2': 'Copertura e trasparenza · titolo, riga 2',
    'copertura.testo': 'Copertura e trasparenza · paragrafo',
    'rigore.t1': 'Rigore e creatività · titolo, riga 1 (nel riquadro nero)',
    'rigore.t2': 'Rigore e creatività · titolo, riga 2',
    'rigore.testo': 'Rigore e creatività · paragrafo',
    'presenza.t1': 'La forza della presenza · titolo grande, riga 1',
    'presenza.t2': 'La forza della presenza · titolo grande, riga 2',
    'presenza.t3': 'La forza della presenza · titolo grande, riga 3',
    'presenza.testo': 'La forza della presenza · paragrafo (a metà c\'è un nuovo paragrafo)',
    'slider.aria': 'Slider foto · descrizione per screen reader (non visibile)',
    'certi.t1': 'Certi incontri accadono · titolo grande, riga 1',
    'certi.t2': 'Certi incontri accadono · titolo grande, riga 2',
    'certi.t3': 'Certi incontri accadono · titolo grande, riga 3',
    'certi.fascia1': 'Certi incontri accadono · testo sulle bande nere, riga 1',
    'certi.fascia2': 'Certi incontri accadono · testo sulle bande nere, riga 2',
    'certi.fascia3': 'Certi incontri accadono · testo sulle bande nere, riga 3',
    'atelier.t1': 'L\'esperienza in atelier · titolo, riga 1',
    'atelier.t2': 'L\'esperienza in atelier · titolo, riga 2',
    'atelier.testo': 'L\'esperienza in atelier · paragrafo (a metà c\'è un nuovo paragrafo)',
    'stampa.titolo': 'Stampa · titolo della sezione (non visibile, per screen reader)',
    'contatti.titolo': 'Contatti · titolo del modulo',
    'contatti.nome': 'Contatti · campo «Nome» (etichetta e segnaposto)',
    'contatti.email': 'Contatti · campo «Email» (etichetta e segnaposto)',
    'contatti.oggetto': 'Contatti · campo «Oggetto» (etichetta e segnaposto)',
    'contatti.messaggio': 'Contatti · etichetta del campo messaggio (non visibile)',
    'contatti.messaggio_ph': 'Contatti · segnaposto del campo messaggio',
    'contatti.invia': 'Contatti · pulsante di invio',
    'js.audio_on': 'Video in alto · pulsante audio, descrizione (non visibile)',
    'js.audio_off': 'Video in alto · pulsante audio acceso, descrizione (non visibile)',
    'js.foto_n': 'Slider foto · descrizione dei pallini ({n} = numero, da lasciare)',
    'js.foto_prec': 'Slider foto · freccia sinistra, descrizione (non visibile)',
    'js.foto_succ': 'Slider foto · freccia destra, descrizione (non visibile)',
    'js.leggi': 'Stampa · descrizione del pulsante + ({titolo} = titolo della news, da lasciare)',
    'js.form_compila': 'Contatti · messaggio se mancano campi',
    'js.form_ok': 'Contatti · messaggio dopo l\'invio',
    'js.form_ko': 'Contatti · messaggio se l\'invio fallisce ({email} = indirizzo, da lasciare)',
    'js.mail_nome': 'Contatti · testo dell\'email generata: «Nome»',
    'js.mail_email': 'Contatti · testo dell\'email generata: «Email»',
    'js.mail_oggetto': 'Contatti · oggetto dell\'email se non ne è stato scritto uno',
}

VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'base', 'source', 'area', 'col', 'embed', 'wbr'}
TAG = re.compile(r'<!--.*?-->|<(script|style)\b[^>]*>.*?</\1\s*>|<(/?)([A-Za-z][A-Za-z0-9-]*)((?:"[^"]*"|\'[^\']*\'|[^\'">])*)>', re.S)
ATTR = re.compile(r'([:\w-]+)\s*=\s*(?:"([^"]*)"|\'([^\']*)\')')


class Err(Exception):
    pass


# ---------------------------------------------------------------- conversioni testo <-> html
def html_to_text(inner):
    s = inner
    s = re.sub(r'<br\s+class="p"\s*>\s*<br\s+class="p"\s*>\s*', '¶', s)
    s = re.sub(r'<br\s+class="d"\s*>\s*', '|', s)
    s = re.sub(r'<br[^>]*>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace(' ', ' ')
    s = re.sub(r'\s+', ' ', s)
    s = re.sub(r'\s*([|¶])\s*', r'\1', s)
    return s.strip()


def text_to_html(text):
    s = html.escape(text.strip(), quote=False)
    s = s.replace('¶', '<br class="p"><br class="p">')
    s = s.replace('|', '<br class="d"> ')
    return s


# ---------------------------------------------------------------- lettura dei marcatori in index.html
def scan(src):
    """Elenco dei marcatori: ('text', key, inner_start, inner_end) e ('attr', key, attr, val_start, val_end)."""
    found = []
    tags = [m for m in TAG.finditer(src) if m.group(3)]
    for i, m in enumerate(tags):
        if m.group(2):
            continue
        attrs = m.group(4)
        name = m.group(3).lower()
        for am in ATTR.finditer(attrs):
            a, v = am.group(1), am.group(2) if am.group(2) is not None else am.group(3)
            base = m.start(4)
            if a == 'data-i18n':
                if name in VOID:
                    raise Err('data-i18n su elemento senza contenuto: <%s>' % name)
                depth, end = 1, None
                for n in tags[i + 1:]:
                    if n.group(3).lower() != name:
                        continue
                    if n.group(2):
                        depth -= 1
                        if depth == 0:
                            end = n.start()
                            break
                    elif not n.group(0).endswith('/>'):
                        depth += 1
                if end is None:
                    raise Err('manca la chiusura di <%s data-i18n="%s">' % (name, v))
                found.append(('text', v, m.end(), end))
            elif a == 'data-i18n-attr':
                for pair in v.split(';'):
                    if not pair.strip():
                        continue
                    an, key = [x.strip() for x in pair.split(':', 1)]
                    vm = None
                    for bm in ATTR.finditer(attrs):
                        if bm.group(1) == an:
                            vm = bm
                    if vm is None:
                        raise Err('attributo %s non trovato per la chiave %s' % (an, key))
                    g = 2 if vm.group(2) is not None else 3
                    found.append(('attr', key, an, base + vm.start(g), base + vm.end(g)))
    return found


def read_js_strings():
    """Messaggi di main.js: T('chiave', 'italiano')."""
    code = open(JS, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r"""\bT\(\s*'([a-z0-9._]+)'\s*,\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*\)""", code):
        txt = m.group(2) if m.group(2) is not None else m.group(3)
        txt = re.sub(r'\\(.)', r'\1', txt)
        out.setdefault(m.group(1), txt)
    return out


def collect():
    """Tutti i testi traducibili: dict chiave -> italiano (ordine di apparizione)."""
    src = open(SRC, encoding='utf-8').read()
    items = {}
    for f in scan(src):
        key = f[1]
        it = html_to_text(src[f[2]:f[3]]) if f[0] == 'text' else html.unescape(src[f[3]:f[4]]).strip()
        if key in items and items[key] != it:
            raise Err('la chiave %s ha due testi italiani diversi: «%s» e «%s»' % (key, items[key], it))
        items.setdefault(key, it)
    for key, it in read_js_strings().items():
        if key in items and items[key] != it:
            raise Err('la chiave %s ha due testi italiani diversi: «%s» e «%s»' % (key, items[key], it))
        items.setdefault(key, it)
    return items


# ---------------------------------------------------------------- CSV
def sniff_reader(path):
    raw = open(path, 'rb').read()
    text = raw.decode('utf-8-sig', errors='replace')
    first = text.split('\n', 1)[0]
    delim = max((';', ',', '\t'), key=first.count)
    return list(csv.DictReader(io.StringIO(text, newline=''), delimiter=delim))


def read_translations():
    if not os.path.exists(CSV_PATH):
        return {}
    out = {}
    for row in sniff_reader(CSV_PATH):
        k = (row.get('chiave') or '').strip()
        if not k:
            continue
        out[k] = (row.get('inglese') or '').strip()
    return out


def write_csv(items, english):
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    with open(CSV_PATH, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, delimiter=';', lineterminator='\r\n')
        w.writerow(['chiave', 'contesto', 'italiano', 'inglese'])
        for k, it in items.items():
            w.writerow([k, CONTEXT.get(k, ''), it, english.get(k, '')])


def cmd_export(_args):
    items = collect()
    old = read_translations()
    write_csv(items, old)
    gone = [k for k in old if k not in items and old[k]]
    done = sum(1 for k in items if old.get(k))
    print('scritto %s: %d testi, %d già tradotti' % (os.path.relpath(CSV_PATH, ROOT), len(items), done))
    if gone:
        print('ATTENZIONE: traduzioni di chiavi che non esistono più (eliminate dal file):', ', '.join(gone))


# ---------------------------------------------------------------- import
def read_table(path):
    """Righe (dict) di un .xlsx (primo foglio) o di un .csv."""
    if path.lower().endswith(('.xlsx', '.xlsm')):
        try:
            import openpyxl
        except ImportError:
            raise Err('per leggere un .xlsx serve openpyxl (pip install openpyxl); oppure salva il file come CSV')
        ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
        rows = list(ws.iter_rows(values_only=True))
        head = [str(c or '').strip().lower() for c in rows[0]]
        return [dict(zip(head, ['' if c is None else str(c) for c in r])) for r in rows[1:]]
    return [{(k or '').strip().lower(): v for k, v in r.items()} for r in sniff_reader(path)]


def tidy(s):
    s = s.replace('\r\n', '\n').replace('\n', ' ').replace('\u00a0', ' ')
    s = re.sub(r'\s+', ' ', s)
    return re.sub(r'\s*([|¶])\s*', r'\1', s).strip()


def cmd_import(args):
    items = collect()
    rows = read_table(args.file)
    new, notes = {}, []
    for r in rows:
        k = (r.get('chiave') or '').strip()
        if not k:
            continue
        if k not in items:
            notes.append('chiave sconosciuta (ignorata): ' + k)
            continue
        en = tidy(r.get('inglese') or '')
        if not en:
            continue
        new[k] = en
        it = items[k]
        # la colonna italiana del file non viene usata: si segnala solo se differisce davvero dal sito (a parte maiuscole/minuscole)
        file_it = tidy(r.get('italiano') or '')
        if file_it and re.sub(r'\W+', '', file_it.lower()) != re.sub(r'\W+', '', it.lower()):
            notes.append('%s: l\'italiano nel file è diverso da quello del sito (si usa quello del sito)' % k)
        if en != SAME:
            if sorted(re.findall(r'\{\w+\}', it)) != sorted(re.findall(r'\{\w+\}', en)):
                notes.append('%s: segnaposto {…} diversi dall\'italiano: «%s»' % (k, en))
            if it.count('¶') != en.count('¶'):
                notes.append('%s: i paragrafi (¶) sono %d, in italiano %d' % (k, en.count('¶'), it.count('¶')))
    missing = [k for k in items if k not in new]
    old = read_translations()
    merged = dict(old)
    merged.update(new)
    write_csv(items, merged)
    print('importate %d traduzioni da %s -> %s' % (len(new), os.path.basename(args.file), os.path.relpath(CSV_PATH, ROOT)))
    if missing:
        print('senza traduzione nel file (resta quella già nel CSV, se c\'era):', ', '.join(missing))
    for n in notes:
        print('ATTENZIONE:', n)


# ---------------------------------------------------------------- build
def translated(items, tr):
    """Dict chiave -> inglese (solo quelle tradotte), con '=' risolto in italiano."""
    out = {}
    for k, it in items.items():
        v = tr.get(k, '')
        if v == SAME:
            out[k] = it
        elif v:
            out[k] = v
    return out


def cmd_build(args):
    src = open(SRC, encoding='utf-8').read()
    items = collect()
    tr = translated(items, read_translations())
    missing = [k for k in items if k not in tr]
    unknown = [k for k in read_translations() if k not in items]
    pct = 100 * len(tr) // max(1, len(items))
    print('traduzioni: %d/%d (%d%%)' % (len(tr), len(items), pct))
    if missing and tr:
        print('mancanti (resta l\'italiano):', ', '.join(missing))
    if unknown:
        print('nel CSV ma non nel sito (ignorate):', ', '.join(unknown))
    if args.strict and missing:
        sys.exit('--strict: mancano %d traduzioni' % len(missing))
    if not tr:
        print('nessuna traduzione inglese: la pagina /en/ non viene creata.')
        return

    # sostituzioni sul sorgente, dall'ultima alla prima per non spostare le posizioni
    edits = []
    for f in scan(src):
        key = f[1]
        if key not in tr:
            continue
        if f[0] == 'text':
            edits.append((f[2], f[3], text_to_html(tr[key])))
        else:
            edits.append((f[3], f[4], html.escape(tr[key], quote=True)))
    out = src
    for s, e, new in sorted(edits, key=lambda x: -x[0]):
        out = out[:s] + new + out[e:]

    def swap(old, new, count=1):
        nonlocal out
        if out.count(old) < 1:
            raise Err('non trovo nel sorgente: ' + old[:60])
        out = out.replace(old, new, count)

    # la pagina sta in /en/: tutti gli indirizzi relativi (css, js, foto, video, dati) partono dalla radice del sito
    swap('<html lang="it">', '<html lang="en">')
    swap('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="../">')
    swap('<a href="#" ', '<a href="en/" ')                       # logo: torna all'inizio della pagina inglese
    out = re.sub(r'<nav class="lang"([^>]*?)\s+hidden>', r'<nav class="lang"\1>', out)
    swap('hreflang="it" lang="it" aria-current="true"', 'hreflang="it" lang="it"')
    swap('hreflang="en" lang="en"', 'hreflang="en" lang="en" aria-current="true"')
    js_tr = {k: v for k, v in tr.items() if k.startswith('js.')}
    blob = json.dumps(js_tr, ensure_ascii=False).replace('</', '<\\/')
    swap('<script src="js/config.js">', '<script>window.FUZIA_STR=%s;</script>\n<script src="js/config.js">' % blob)

    out_dir = os.path.normpath(os.path.join(os.getcwd(), args.out))
    os.makedirs(os.path.join(out_dir, 'en'), exist_ok=True)
    target = os.path.join(out_dir, 'en', 'index.html')
    open(target, 'w', encoding='utf-8', newline='\n').write(out)
    print('scritto', os.path.relpath(target, os.getcwd()))

    # nella pagina italiana pubblicata appare il selettore IT | EN (nel sorgente è nascosto finché /en/ non esiste)
    it_page = os.path.join(out_dir, 'index.html')
    if os.path.exists(it_page) and os.path.normcase(os.path.abspath(it_page)) != os.path.normcase(SRC):
        page = open(it_page, encoding='utf-8').read()
        page2 = re.sub(r'<nav class="lang"([^>]*?)\s+hidden>', r'<nav class="lang"\1>', page)
        open(it_page, 'w', encoding='utf-8', newline='\n').write(page2)
        print('selettore IT | EN reso visibile in', os.path.relpath(it_page, os.getcwd()))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('export', help='crea/aggiorna i18n/traduzioni.csv')
    i = sub.add_parser('import', help='carica le traduzioni da un .xlsx o .csv rivisto')
    i.add_argument('file', help='file .xlsx o .csv con le colonne chiave e inglese')
    b = sub.add_parser('build', help='crea en/index.html dalle traduzioni')
    b.add_argument('--out', default='_site', help='cartella del sito (default: _site)')
    b.add_argument('--strict', action='store_true', help='errore se manca qualche traduzione')
    args = ap.parse_args()
    try:
        {'export': cmd_export, 'import': cmd_import, 'build': cmd_build}[args.cmd](args)
    except Err as e:
        sys.exit('ERRORE: %s' % e)


if __name__ == '__main__':
    main()
