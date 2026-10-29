"""Crea le versioni leggere (-900.jpg, 900 px di larghezza) delle foto in assets/img.
Le foto in index.html usano srcset: il telefono sceglie la versione -900, il desktop quella grande.

Parte da solo a ogni pubblicazione (vedi .github/workflows/pages.yml), quindi basta sostituire la foto originale
mantenendo il nome: la versione leggera si rigenera da sola. In locale (per provare il sito):
    python tools/make-variants.py        (serve Pillow: pip install pillow)

Le fasce a tutta larghezza (hero, dialogo-bg, footer) non hanno variante.
Una foto già piccola (<= 900 px) non viene ingrandita: la variante è una copia dell'originale."""
import os
import shutil
import sys
from PIL import Image

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img')
SKIP = {'hero.jpg', 'dialogo-bg.jpg', 'footer.jpg'}
WIDTH = 900

made = 0
for f in sorted(os.listdir(D)):
    if not f.endswith('.jpg') or f.endswith('-900.jpg') or f in SKIP:
        continue
    src = os.path.join(D, f)
    out = os.path.join(D, f[:-4] + '-900.jpg')
    with Image.open(src) as im:
        w, h = im.size
        if w <= WIDTH:
            shutil.copyfile(src, out)
        else:
            im.convert('RGB').resize((WIDTH, round(h * WIDTH / w)), Image.LANCZOS).save(
                out, quality=80, optimize=True, progressive=True)
    made += 1
print('versioni leggere create:', made)
if not made:
    sys.exit('nessuna foto trovata in assets/img')
