-- A promo code never lowers a live membership: redeeming a Lite code on an active Max plan used to
-- replace Max with Lite. A code for a lower plan is now refused while the higher plan is live; the
-- same plan extends as before, and a higher plan replaces the lower one.
create or replace function kronos._plan_rank(p_plan text) returns integer
language sql immutable set search_path = '' as $$
  select case p_plan when 'lite' then 1 when 'pro' then 2 when 'max' then 3 when 'max5' then 4 else 0 end
$$;
revoke all on function kronos._plan_rank(text) from public, anon, authenticated;

create or replace function public.kronos_redeem(p_secret text, p_user_id text, p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  c kronos.promo_codes%rowtype;
  a kronos.accounts%rowtype;
  v_live boolean;
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
  v_live := a.plan is not null and (a.plan_expires_at is null or a.plan_expires_at > now());
  if v_live and kronos._plan_rank(a.plan) > kronos._plan_rank(c.plan) then return jsonb_build_object('error', 'higher_plan'); end if;
  if c.duration_days is null then
    v_expires := null;
  else
    v_base := case when v_live and a.plan = c.plan and a.plan_expires_at is not null then a.plan_expires_at else now() end;
    -- a plan without an end date stays without one
    v_expires := case when v_live and a.plan = c.plan and a.plan_expires_at is null then null else v_base + make_interval(days => c.duration_days) end;
  end if;
  update kronos.accounts set plan = c.plan, plan_expires_at = v_expires, updated_at = now() where user_id = p_user_id;
  update kronos.promo_codes set uses = uses + 1 where code = c.code;
  insert into kronos.redemptions (code, user_id) values (c.code, p_user_id);
  return jsonb_build_object('ok', true, 'plan', c.plan, 'plan_expires_at', v_expires, 'account', kronos._account_json(p_user_id));
end $$;
revoke all on function public.kronos_redeem(text, text, text) from public, authenticated;
grant execute on function public.kronos_redeem(text, text, text) to anon, service_role;
