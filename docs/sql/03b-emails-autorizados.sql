-- ============================================================================
-- Fase 3b — Whitelist de e-mails autorizados no banco
-- ============================================================================
-- Rode este script UMA VEZ no Supabase:
--   Painel Supabase > SQL Editor > New query > cole tudo > Run
--
-- O que ele faz:
--   1. Cria a tabela public.emails_autorizados
--   2. Cria a funcao is_admin() (usuario logado e GP ou Presidencia?)
--   3. Liga RLS: so admin le/adiciona/remove e-mails da tabela
--   4. Cria a funcao publica email_autorizado(email) -> boolean
--      (a tela de cadastro chama isso ANTES do login; nao expoe a lista toda)
--   5. Popula a tabela com a lista atual que estava no codigo
-- ============================================================================

-- 1. Tabela ---------------------------------------------------------------------
create table if not exists public.emails_autorizados (
  email          text primary key,
  adicionado_por uuid references auth.users (id) on delete set null,
  criado_em      timestamptz not null default now()
);

alter table public.emails_autorizados enable row level security;

-- 2. Helper: o usuario logado tem acesso de gestao? --------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and perfil in ('Gestão de Pessoas', 'Presidência')
  );
$$;

-- 3. Policies: apenas admin mexe na tabela ----------------------------------
drop policy if exists "emails_autorizados_select_admin" on public.emails_autorizados;
create policy "emails_autorizados_select_admin"
  on public.emails_autorizados for select
  using (public.is_admin());

drop policy if exists "emails_autorizados_insert_admin" on public.emails_autorizados;
create policy "emails_autorizados_insert_admin"
  on public.emails_autorizados for insert
  with check (public.is_admin());

drop policy if exists "emails_autorizados_delete_admin" on public.emails_autorizados;
create policy "emails_autorizados_delete_admin"
  on public.emails_autorizados for delete
  using (public.is_admin());

-- 4. Funcao publica de verificacao (nao expoe a lista) ---------------------
create or replace function public.email_autorizado(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.emails_autorizados
    where email = lower(trim(p_email))
  );
$$;

grant execute on function public.email_autorizado(text) to anon, authenticated;

-- 5. Popula com a lista que estava fixa no codigo -------------------------
insert into public.emails_autorizados (email) values
  ('alexandre.marculino@ufv.br'),
  ('alisson.anastacio@ufv.br'),
  ('ariane.cespedes@ufv.br'),
  ('arthur.p.correa@ufv.br'),
  ('arthur.madeira@ufv.br'),
  ('barbara.more@ufv.br'),
  ('bernardo.matos@ufv.br'),
  ('jeong.changyoung@ufv.br'),
  ('danilo.s.ribeiro@ufv.br'),
  ('enzo.goyata@ufv.br'),
  ('fabricio.gibbert@ufv.br'),
  ('gabriel.mariosa@ufv.br'),
  ('gabriel.h.olimpio@ufv.br'),
  ('gabriel.s.prado@ufv.br'),
  ('gabriela.silva.oliveira@ufv.br'),
  ('gabriella.conceicao@ufv.br'),
  ('ian.sousa@ufv.br'),
  ('joao.molina@ufv.br'),
  ('kawa.santos@ufv.br'),
  ('marcos.a.rocha@ufv.br'),
  ('maria.makiyama@ufv.br'),
  ('mariana.s.vieira@ufv.br'),
  ('matheus.f.andrade@ufv.br'),
  ('otto.dias@ufv.br'),
  ('rafael.severino@ufv.br'),
  ('rhayssa.joaquim@ufv.br'),
  ('joao.p.paula@ufv.br')
on conflict (email) do nothing;

-- Conferir:
--   select count(*) from public.emails_autorizados;   -- deve dar 27
--   select public.email_autorizado('bernardo.matos@ufv.br');  -- true
--   select public.email_autorizado('ninguem@ufv.br');         -- false
