"""Crea le versioni leggere (-900.jpg, 900 px di larghezza) delle foto in assets/img.
Va rilanciato dopo aver sostituito una foto:   python tools/make-variants.py   (serve Pillow: pip install pillow)
Le fasce a tutta larghezza (hero, dialogo-bg, footer) e le foto già piccole (<= 1000 px) non hanno variante."""
import os
from PIL import Image

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img')
SKIP = {'hero.jpg', 'dialogo-bg.jpg', 'footer.jpg'}

for f in sorted(os.listdir(D)):
    if not f.endswith('.jpg') or f.endswith('-900.jpg') or f in SKIP:
        continue
    im = Image.open(os.path.join(D, f))
    w, h = im.size
    out = os.path.join(D, f[:-4] + '-900.jpg')
    if w <= 1000:
        if os.path.exists(out):
            os.remove(out)
        continue
    im.convert('RGB').resize((900, round(h * 900 / w)), Image.LANCZOS).save(out, quality=80, optimize=True, progressive=True)
    print('ok', os.path.basename(out))
