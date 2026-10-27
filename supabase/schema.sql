-- Fuzia Jammali – schema Supabase per le news (sezione "Stampa").
-- Da incollare nel SQL Editor del progetto Supabase ed eseguire una volta sola (si può rieseguire senza danni).

-- 1) Chi può modificare: elenco di email autorizzate (la tabella non è leggibile dal sito).
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;   -- nessuna policy = nessun accesso dai client

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2) Tabella delle news
create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  posizione   integer not null default 0,        -- ordine di visualizzazione (0 = primo)
  visibile    boolean not null default true,
  testata     text,
  titolo      text not null,
  descrizione text,
  immagine    text,                              -- URL completo (Storage) o percorso relativo del sito
  link        text,
  created_at  timestamptz not null default now()
);
create index if not exists news_posizione_idx on public.news (posizione, created_at desc);

alter table public.news enable row level security;

drop policy if exists "news: lettura pubblica delle visibili" on public.news;
create policy "news: lettura pubblica delle visibili" on public.news
  for select using (visibile = true or public.is_admin());

drop policy if exists "news: scrittura admin" on public.news;
create policy "news: scrittura admin" on public.news
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3) Cartella (bucket) per le foto: lettura pubblica, scrittura solo admin
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news', 'news', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "news-foto: scrittura admin" on storage.objects;
create policy "news-foto: scrittura admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'news' and public.is_admin())
  with check (bucket_id = 'news' and public.is_admin());

-- 4) Le tre news di partenza (segnaposto, con le foto già nel sito). Solo se la tabella è vuota.
insert into public.news (posizione, testata, titolo, descrizione, immagine, link)
select * from (values
  (0, 'Vanity Fair', 'intervista a Fuzia Jammali',
      E'L’arte sartoriale della stilista\nFuzia Jammali: abiti che raccontano storie di libertà',
      'assets/img/news/vanity-fair-1.jpg', 'https://www.vanityfair.it/'),
  (1, 'Vanity Fair', 'L’arte sartoriale della stilista Fuzia Jammali: abiti che raccontano storie di libertà',
      'Dalla Tunisia a Torino, i suoi tessuti «plasmati» a mano e i suoi capi unici',
      'assets/img/news/vanity-fair-2.jpg', 'https://www.vanityfair.it/'),
  (2, 'Vanity Fair', 'intervista a Fuzia Jammali',
      E'L’arte sartoriale della stilista\nFuzia Jammali: abiti che raccontano storie di libertà',
      'assets/img/news/vanity-fair-1.jpg', 'https://www.vanityfair.it/')
) as v(posizione, testata, titolo, descrizione, immagine, link)
where not exists (select 1 from public.news);

-- 5) DA FARE A MANO dopo aver creato gli utenti in Authentication > Users:
--    insert into public.admins (email) values ('tua@email.it'), ('stilista@email.it');
