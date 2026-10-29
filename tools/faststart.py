"""Fast start per un MP4 senza ricodificare: sposta l'indice (moov) prima dei dati (mdat).
Serve se il video è stato esportato senza "Ottimizzato per il web" (HandBrake: Sommario > Ottimizzato per il web).
    python tools/faststart.py assets/video/hero-mobile.mp4
Il file viene riscritto sul posto (copia di sicurezza: <nome>.bak accanto al file, da cancellare dopo)."""
import os
import shutil
import struct
import sys


def boxes(buf, start, end):
    p = start
    while p + 8 <= end:
        size, kind = struct.unpack('>I4s', buf[p:p + 8])
        hdr = 8
        if size == 1:
            size = struct.unpack('>Q', buf[p + 8:p + 16])[0]
            hdr = 16
        elif size == 0:
            size = end - p
        yield kind.decode('latin1'), p, size, hdr
        p += size


def shift_offsets(moov, delta):
    """Aggiunge delta a tutti i chunk offset (stco/co64) dentro moov."""
    def walk(start, end):
        for kind, p, size, hdr in boxes(moov, start, end):
            if kind in ('trak', 'mdia', 'minf', 'stbl'):
                walk(p + hdr, p + size)
            elif kind == 'stco':
                n = struct.unpack('>I', moov[p + hdr + 4:p + hdr + 8])[0]
                for i in range(n):
                    o = p + hdr + 8 + 4 * i
                    v = struct.unpack('>I', moov[o:o + 4])[0] + delta
                    if v > 0xFFFFFFFF:
                        sys.exit('offset troppo grande per stco: file non supportato')
                    moov[o:o + 4] = struct.pack('>I', v)
            elif kind == 'co64':
                n = struct.unpack('>I', moov[p + hdr + 4:p + hdr + 8])[0]
                for i in range(n):
                    o = p + hdr + 8 + 8 * i
                    moov[o:o + 8] = struct.pack('>Q', struct.unpack('>Q', moov[o:o + 8])[0] + delta)
    walk(8, len(moov))


def main(path):
    buf = open(path, 'rb').read()
    top = list(boxes(buf, 0, len(buf)))
    order = [k for k, _, _, _ in top]
    if 'moov' not in order or 'mdat' not in order:
        sys.exit('non è un MP4 valido')
    if order.index('moov') < order.index('mdat'):
        print('già ottimizzato per il web:', order)
        return
    _, mp, ms, _ = next(b for b in top if b[0] == 'moov')
    moov = bytearray(buf[mp:mp + ms])
    shift_offsets(moov, ms)                      # moov passa davanti ai dati: tutti gli offset avanzano di len(moov)
    head = b''.join(buf[p:p + s] for k, p, s, _ in top if k not in ('moov', 'mdat'))
    data = b''.join(buf[p:p + s] for k, p, s, _ in top if k == 'mdat')
    # ordine finale: ftyp, moov, (free ecc.), mdat
    first = [(k, p, s) for k, p, s, _ in top if k == 'ftyp']
    rest = [(k, p, s) for k, p, s, _ in top if k not in ('moov', 'mdat', 'ftyp')]
    # gli offset erano calcolati con "free" prima di mdat: restano validi perché la loro dimensione non cambia
    out = b''.join(buf[p:p + s] for _, p, s in first) + bytes(moov) + b''.join(buf[p:p + s] for _, p, s in rest) + data
    assert len(out) == len(buf)
    shutil.copyfile(path, path + '.bak')
    open(path, 'wb').write(out)
    print('ok:', [k for k, _, _, _ in boxes(out, 0, len(out))])


if __name__ == '__main__':
    main(sys.argv[1])
