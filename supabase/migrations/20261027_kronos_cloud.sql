-- Kronos Cloud: accounts, memberships, promo codes, app tokens and usage.
--
-- The tables live in their own schema, which the Data API does not expose. The
-- site reaches them only through the kronos_* functions below; every one of
-- them takes the server's shared secret first, so the public (anon) key alone
-- can do nothing. The secret is stored in kronos.settings and set by the
-- operator, never in this file.

create schema if not exists kronos;

create table if not exists kronos.settings (
  key text primary key,
  value text not null
);

create table if not exists kronos.accounts (
  user_id text primary key,                    -- Clerk user id
  email text,
  plan text check (plan in ('lite', 'pro', 'max', 'max5')),
  plan_expires_at timestamptz,                 -- null with a plan = no end date
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kronos.promo_codes (
  code text primary key,                       -- stored upper-case
  plan text not null check (plan in ('lite', 'pro', 'max', 'max5')),
  duration_days integer check (duration_days is null or duration_days > 0),  -- null = no end date
  max_uses integer check (max_uses is null or max_uses > 0),                 -- null = unlimited
  uses integer not null default 0,
  expires_at timestamptz,                      -- last day the code can be redeemed
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists kronos.redemptions (
  code text not null references kronos.promo_codes (code) on delete cascade,
  user_id text not null references kronos.accounts (user_id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);

create table if not exists kronos.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references kronos.accounts (user_id) on delete cascade,
  token_hash text not null unique,             -- sha-256 hex of the token; the token itself is never stored
  label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked boolean not null default false
);
create index if not exists tokens_user_idx on kronos.tokens (user_id);

-- One row per user and window kind; a window starts at the first request after the previous one ended.
create table if not exists kronos.usage_windows (
  user_id text not null references kronos.accounts (user_id) on delete cascade,
  kind text not null check (kind in ('5h', 'week')),
  window_start timestamptz not null,
  spent_micro bigint not null default 0,       -- millionths of a US dollar
  primary key (user_id, kind)
);

create table if not exists kronos.usage_log (
  id bigint generated always as identity primary key,
  user_id text not null references kronos.accounts (user_id) on delete cascade,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_micro bigint not null default 0,
  at timestamptz not null default now()
);
create index if not exists usage_log_user_at_idx on kronos.usage_log (user_id, at desc);

alter table kronos.settings enable row level security;
alter table kronos.accounts enable row level security;
alter table kronos.promo_codes enable row level security;
alter table kronos.redemptions enable row level security;
alter table kronos.tokens enable row level security;
alter table kronos.usage_windows enable row level security;
alter table kronos.usage_log enable row level security;

revoke all on schema kronos from public, anon, authenticated;

-- ---------------------------------------------------------------------------

create or replace function kronos._check(p_secret text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_secret is null or p_secret <> (select value from kronos.settings where key = 'api_secret') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
end $$;

-- The account with its live plan (an expired plan reads as none) and current usage.
create or replace function kronos._account_json(p_user_id text) returns jsonb
language sql security definer set search_path = '' as $$
  select jsonb_build_object(
    'user_id', a.user_id,
    'email', a.email,
    'plan', case when a.plan is not null and (a.plan_expires_at is null or a.plan_expires_at > now()) then a.plan end,
    'plan_expires_at', a.plan_expires_at,
    'usage', jsonb_build_object(
      '5h', (select jsonb_build_object('start', w.window_start, 'spent_micro', w.spent_micro)
             from kronos.usage_windows w where w.user_id = a.user_id and w.kind = '5h' and w.window_start > now() - interval '5 hours'),
      'week', (select jsonb_build_object('start', w.window_start, 'spent_micro', w.spent_micro)
               from kronos.usage_windows w where w.user_id = a.user_id and w.kind = 'week' and w.window_start > now() - interval '7 days')
    )
  )
  from kronos.accounts a where a.user_id = p_user_id
$$;

create or replace function public.kronos_upsert_account(p_secret text, p_user_id text, p_email text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  insert into kronos.accounts (user_id, email) values (p_user_id, p_email)
  on conflict (user_id) do update set email = coalesce(excluded.email, kronos.accounts.email), updated_at = now();
  return kronos._account_json(p_user_id);
end $$;

create or replace function public.kronos_issue_token(p_secret text, p_user_id text, p_token_hash text, p_label text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  perform kronos._check(p_secret);
  insert into kronos.tokens (user_id, token_hash, label) values (p_user_id, p_token_hash, left(p_label, 120)) returning id into v_id;
  return v_id;
end $$;

-- Resolves an app token to its account; null when unknown or revoked.
create or replace function public.kronos_auth(p_secret text, p_token_hash text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_user text; v_id uuid;
begin
  perform kronos._check(p_secret);
  select id, user_id into v_id, v_user from kronos.tokens where token_hash = p_token_hash and not revoked;
  if v_user is null then return null; end if;
  update kronos.tokens set last_used_at = now() where id = v_id and (last_used_at is null or last_used_at < now() - interval '1 minute');
  return kronos._account_json(v_user) || jsonb_build_object('token_id', v_id);
end $$;

create or replace function public.kronos_account(p_secret text, p_user_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return kronos._account_json(p_user_id);
end $$;

create or replace function public.kronos_list_tokens(p_secret text, p_user_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'label', label, 'created_at', created_at, 'last_used_at', last_used_at) order by created_at desc)
                   from kronos.tokens where user_id = p_user_id and not revoked), '[]'::jsonb);
end $$;

create or replace function public.kronos_revoke_token(p_secret text, p_user_id text, p_token_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  update kronos.tokens set revoked = true where id = p_token_id and user_id = p_user_id;
  return found;
end $$;

-- Adds a request's cost to both windows, opening a new window when the last one has ended.
create or replace function public.kronos_record_usage(p_secret text, p_user_id text, p_model text, p_input integer, p_output integer, p_cost_micro bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  insert into kronos.usage_log (user_id, model, input_tokens, output_tokens, cost_micro)
  values (p_user_id, left(p_model, 120), greatest(p_input, 0), greatest(p_output, 0), greatest(p_cost_micro, 0));
  insert into kronos.usage_windows as w (user_id, kind, window_start, spent_micro)
  values (p_user_id, '5h', now(), greatest(p_cost_micro, 0)), (p_user_id, 'week', now(), greatest(p_cost_micro, 0))
  on conflict (user_id, kind) do update set
    window_start = case when w.window_start <= now() - (case when w.kind = '5h' then interval '5 hours' else interval '7 days' end) then now() else w.window_start end,
    spent_micro = case when w.window_start <= now() - (case when w.kind = '5h' then interval '5 hours' else interval '7 days' end) then excluded.spent_micro else w.spent_micro + excluded.spent_micro end;
  return kronos._account_json(p_user_id);
end $$;

-- Redeems a promo code: the same plan extends the current end date, another plan replaces it.
create or replace function public.kronos_redeem(p_secret text, p_user_id text, p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  c kronos.promo_codes%rowtype;
  a kronos.accounts%rowtype;
  v_base timestamptz;
  v_expires timestamptz;
begin
  perform kronos._check(p_secret);
  select * into c from kronos.promo_codes where code = upper(trim(p_code)) for update;
  if not found or not c.active then return jsonb_build_object('error', 'invalid'); end if;
  if c.expires_at is not null and c.expires_at < now() then return jsonb_build_object('error', 'expired'); end if;
  if c.max_uses is not null and c.uses >= c.max_uses then return jsonb_build_object('error', 'used_up'); end if;
  if exists (select 1 from kronos.redemptions where code = c.code and user_id = p_user_id) then return jsonb_build_object('error', 'already_redeemed'); end if;
  select * into a from kronos.accounts where user_id = p_user_id for update;
  if not found then return jsonb_build_object('error', 'no_account'); end if;
  if c.duration_days is null then
    v_expires := null;
  else
    v_base := case when a.plan = c.plan and a.plan_expires_at is not null and a.plan_expires_at > now() then a.plan_expires_at else now() end;
    -- a plan without an end date stays without one
    v_expires := case when a.plan = c.plan and a.plan_expires_at is null then null else v_base + make_interval(days => c.duration_days) end;
  end if;
  update kronos.accounts set plan = c.plan, plan_expires_at = v_expires, updated_at = now() where user_id = p_user_id;
  update kronos.promo_codes set uses = uses + 1 where code = c.code;
  insert into kronos.redemptions (code, user_id) values (c.code, p_user_id);
  return jsonb_build_object('ok', true, 'plan', c.plan, 'plan_expires_at', v_expires, 'account', kronos._account_json(p_user_id));
end $$;

-- --- operator ---------------------------------------------------------------

create or replace function public.kronos_admin_create_promo(p_secret text, p_code text, p_plan text, p_duration_days integer, p_max_uses integer, p_expires_at timestamptz, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  insert into kronos.promo_codes (code, plan, duration_days, max_uses, expires_at, note)
  values (upper(trim(p_code)), p_plan, p_duration_days, p_max_uses, p_expires_at, left(p_note, 300));
  return (select to_jsonb(p) from kronos.promo_codes p where code = upper(trim(p_code)));
exception when unique_violation then
  return jsonb_build_object('error', 'exists');
end $$;

create or replace function public.kronos_admin_list_promos(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at desc) from kronos.promo_codes p), '[]'::jsonb);
end $$;

create or replace function public.kronos_admin_set_promo_active(p_secret text, p_code text, p_active boolean) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  update kronos.promo_codes set active = p_active where code = upper(trim(p_code));
  return found;
end $$;

create or replace function public.kronos_admin_list_accounts(p_secret text, p_query text, p_limit integer, p_offset integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return jsonb_build_object(
    'total', (select count(*) from kronos.accounts a where p_query is null or a.email ilike '%' || p_query || '%' or a.user_id = p_query),
    'rows', coalesce((
      select jsonb_agg(kronos._account_json(a.user_id) || jsonb_build_object(
        'created_at', a.created_at,
        'spent_30d_micro', (select coalesce(sum(cost_micro), 0) from kronos.usage_log l where l.user_id = a.user_id and l.at > now() - interval '30 days')
      ) order by a.created_at desc)
      from (select * from kronos.accounts a
            where p_query is null or a.email ilike '%' || p_query || '%' or a.user_id = p_query
            order by a.created_at desc limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0)) a
    ), '[]'::jsonb)
  );
end $$;

create or replace function public.kronos_admin_set_plan(p_secret text, p_user_id text, p_plan text, p_expires_at timestamptz) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  update kronos.accounts set plan = p_plan, plan_expires_at = case when p_plan is null then null else p_expires_at end, updated_at = now() where user_id = p_user_id;
  return kronos._account_json(p_user_id);
end $$;

create or replace function public.kronos_admin_stats(p_secret text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return jsonb_build_object(
    'accounts', (select count(*) from kronos.accounts),
    'members', (select jsonb_object_agg(plan, n) from (select plan, count(*) n from kronos.accounts
                where plan is not null and (plan_expires_at is null or plan_expires_at > now()) group by plan) s),
    'spent_7d_micro', (select coalesce(sum(cost_micro), 0) from kronos.usage_log where at > now() - interval '7 days'),
    'requests_7d', (select count(*) from kronos.usage_log where at > now() - interval '7 days'),
    'by_model_7d', (select jsonb_object_agg(model, jsonb_build_object('requests', n, 'cost_micro', c)) from
                    (select model, count(*) n, sum(cost_micro) c from kronos.usage_log where at > now() - interval '7 days' group by model) m)
  );
end $$;

-- Only the gated functions are callable over the Data API.
revoke all on all functions in schema kronos from public, anon, authenticated;
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'kronos\_%' loop
    execute format('revoke all on function %s from public, authenticated', f.sig);
    execute format('grant execute on function %s to anon, service_role', f.sig);
  end loop;
end $$;
