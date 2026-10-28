-- Upstream cost across every member in the last 24 hours, for the service-wide daily cap the
-- chat proxy enforces (KRONOS_GLOBAL_DAY_USD), so a bad day cannot drain the OpenRouter balance.
create index if not exists usage_log_at_idx on kronos.usage_log (at desc);

create or replace function public.kronos_global_spend(p_secret text) returns bigint
language plpgsql security definer set search_path = '' as $$
begin
  perform kronos._check(p_secret);
  return (select coalesce(sum(cost_micro), 0) from kronos.usage_log where at > now() - interval '24 hours');
end $$;
revoke all on function public.kronos_global_spend(text) from public, authenticated;
grant execute on function public.kronos_global_spend(text) to anon, service_role;
