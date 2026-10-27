/* Gestione news – pagina /admin/
   Accesso con email e password (Supabase Auth). Le regole di accesso del database (supabase/schema.sql)
   permettono di scrivere solo agli indirizzi nella tabella "admins". */
(function () {
  'use strict';

  var cfg = window.FUZIA || {};
  var $ = function (id) { return document.getElementById(id); };
  var sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  var BUCKET = 'news';
  var items = [];
  var editing = null;          // riga in modifica (null = nuova)

  function show(view) {
    ['login', 'list-view', 'edit-view'].forEach(function (id) { $(id).hidden = (id !== view); });
    $('user').hidden = (view === 'login');
  }
  function say(id, text, kind) { var m = $(id); m.textContent = text || ''; m.className = 'msg' + (kind ? ' ' + kind : ''); }
  function human(err) {
    var m = (err && err.message) || String(err);
    if (/Invalid login/i.test(m)) { return 'Email o password non corrette.'; }
    if (/row-level security|permission denied|not authorized/i.test(m)) { return 'Questo account non è autorizzato a modificare le news.'; }
    return m;
  }

  /* ---------- accesso ---------- */
  async function start() {
    var s = (await sb.auth.getSession()).data.session;
    if (!s) { show('login'); return; }
    $('user-email').textContent = s.user.email;
    var ok = await sb.rpc('is_admin');
    if (ok.error || ok.data !== true) {
      show('login');
      say('login-msg', 'Questo account (' + s.user.email + ') non è autorizzato. Chiedi di aggiungerlo all’elenco admin.', 'err');
      await sb.auth.signOut();
      return;
    }
    show('list-view');
    load();
  }
  $('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    say('login-msg', 'Accesso in corso…');
    var r = await sb.auth.signInWithPassword({ email: $('login-email').value.trim(), password: $('login-pass').value });
    if (r.error) { say('login-msg', human(r.error), 'err'); return; }
    $('login-pass').value = '';
    say('login-msg', '');
    start();
  });
  $('logout').addEventListener('click', async function () { await sb.auth.signOut(); items = []; show('login'); });

  /* ---------- elenco ---------- */
  async function load() {
    say('list-msg', 'Caricamento…');
    var r = await sb.from('news').select('*').order('posizione', { ascending: true }).order('created_at', { ascending: false });
    if (r.error) { say('list-msg', human(r.error), 'err'); return; }
    items = r.data;
    say('list-msg', items.length ? '' : 'Nessuna news: premi “Nuova news”.');
    render();
  }
  function thumb(it) {
    var u = it.immagine || '';
    return /^https?:\/\//i.test(u) ? u : (u ? '../' + u.replace(/^\//, '') : '');
  }
  function btn(label, cls, fn, disabled) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn btn--ghost btn--sm ' + (cls || ''); b.textContent = label;
    if (disabled) { b.disabled = true; }
    b.addEventListener('click', fn);
    return b;
  }
  function render() {
    var ol = $('items');
    ol.textContent = '';
    items.forEach(function (it, i) {
      var li = document.createElement('li');
      li.className = 'item' + (it.visibile ? '' : ' item--off');
      var img = document.createElement('img');
      img.className = 'item__img'; img.alt = ''; img.src = thumb(it);
      var box = document.createElement('div');
      var t = document.createElement('p'); t.className = 'item__t'; t.textContent = it.titolo;
      var s = document.createElement('p'); s.className = 'item__s'; s.textContent = it.testata || '';
      box.appendChild(t); box.appendChild(s);
      if (!it.visibile) { var tag = document.createElement('span'); tag.className = 'item__tag'; tag.textContent = 'Nascosta'; box.appendChild(tag); }
      var btns = document.createElement('div'); btns.className = 'item__btns';
      btns.appendChild(btn('↑', '', function () { move(i, -1); }, i === 0));
      btns.appendChild(btn('↓', '', function () { move(i, 1); }, i === items.length - 1));
      btns.appendChild(btn(it.visibile ? 'Nascondi' : 'Mostra', '', function () { toggle(it); }));
      btns.appendChild(btn('Modifica', '', function () { openEditor(it); }));
      btns.appendChild(btn('Elimina', '', function () { remove(it); }));
      li.appendChild(img); li.appendChild(box); li.appendChild(btns);
      ol.appendChild(li);
    });
  }
  async function move(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= items.length) { return; }
    var a = items.slice(); var t = a[i]; a[i] = a[j]; a[j] = t;
    say('list-msg', 'Salvataggio ordine…');
    var jobs = [];
    a.forEach(function (it, k) { if (it.posizione !== k) { jobs.push(sb.from('news').update({ posizione: k }).eq('id', it.id)); } });
    // posizioni uniche 0..n-1: aggiorna tutte quelle che cambiano
    var res = await Promise.all(jobs);
    var bad = res.find(function (r) { return r.error; });
    if (bad) { say('list-msg', human(bad.error), 'err'); return; }
    load();
  }
  async function toggle(it) {
    var r = await sb.from('news').update({ visibile: !it.visibile }).eq('id', it.id);
    if (r.error) { say('list-msg', human(r.error), 'err'); return; }
    load();
  }
  async function remove(it) {
    if (!window.confirm('Eliminare questa news?\n\n' + it.titolo)) { return; }
    var r = await sb.from('news').delete().eq('id', it.id);
    if (r.error) { say('list-msg', human(r.error), 'err'); return; }
    removeFile(it.immagine);
    load();
  }
  function storagePath(url) {
    var base = cfg.supabaseUrl + '/storage/v1/object/public/' + BUCKET + '/';
    return url && url.indexOf(base) === 0 ? decodeURIComponent(url.slice(base.length)) : '';
  }
  function removeFile(url) { var p = storagePath(url); if (p) { sb.storage.from(BUCKET).remove([p]); } }

  /* ---------- modifica ---------- */
  $('new').addEventListener('click', function () { openEditor(null); });
  $('cancel').addEventListener('click', function () { show('list-view'); });
  function openEditor(it) {
    editing = it;
    $('edit-title').textContent = it ? 'Modifica news' : 'Nuova news';
    $('f-testata').value = it ? (it.testata || '') : '';
    $('f-titolo').value = it ? it.titolo : '';
    $('f-descrizione').value = it ? (it.descrizione || '') : '';
    $('f-link').value = it ? (it.link || '') : '';
    $('f-visibile').checked = it ? !!it.visibile : true;
    $('f-file').value = '';
    var p = $('f-preview');
    if (it && it.immagine) { p.src = thumb(it); p.hidden = false; } else { p.removeAttribute('src'); p.hidden = true; }
    say('edit-msg', '');
    show('edit-view');
    $('f-titolo').focus();
  }
  $('f-file').addEventListener('change', function () {
    var f = this.files[0], p = $('f-preview');
    if (!f) { return; }
    p.src = URL.createObjectURL(f); p.hidden = false;
  });

  // ritaglio quadrato al centro, lato massimo 1400 px, JPEG
  function squareJpeg(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var side = Math.min(img.naturalWidth, img.naturalHeight), out = Math.min(side, 1400);
        var c = document.createElement('canvas'); c.width = c.height = out;
        c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Immagine non valida')); }, 'image/jpeg', 0.88);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Impossibile leggere la foto.')); };
      img.src = url;
    });
  }
  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'news';
  }

  $('edit-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    var link = $('f-link').value.trim();
    if (link && !/^https?:\/\//i.test(link)) { say('edit-msg', 'Il link deve iniziare con http:// o https://', 'err'); return; }
    var titolo = $('f-titolo').value.trim();
    if (!titolo) { say('edit-msg', 'Il titolo è obbligatorio.', 'err'); return; }
    var save = $('save'); save.disabled = true; say('edit-msg', 'Salvataggio…');
    try {
      var row = {
        testata: $('f-testata').value.trim() || null,
        titolo: titolo,
        descrizione: $('f-descrizione').value.trim() || null,
        link: link || null,
        visibile: $('f-visibile').checked
      };
      var oldImage = editing ? editing.immagine : null;
      var file = $('f-file').files[0];
      if (file) {
        say('edit-msg', 'Caricamento foto…');
        var blob = await squareJpeg(file);
        var path = Date.now() + '-' + slug(titolo) + '.jpg';
        var up = await sb.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (up.error) { throw up.error; }
        row.immagine = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }
      var r;
      if (editing) {
        r = await sb.from('news').update(row).eq('id', editing.id);
      } else {
        var first = items.length ? Math.min.apply(null, items.map(function (x) { return x.posizione; })) : 1;
        row.posizione = first - 1;                                   // la nuova news va in cima
        r = await sb.from('news').insert(row);
      }
      if (r.error) { throw r.error; }
      if (file && oldImage) { removeFile(oldImage); }
      show('list-view'); load();
    } catch (err) {
      say('edit-msg', human(err), 'err');
    } finally {
      save.disabled = false;
    }
  });

  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT') { show('login'); } });
  start();
})();
