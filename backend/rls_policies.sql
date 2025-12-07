
alter table public.leads enable row level security;


create policy "leads_select_policy"
on public.leads
for select
using (
  -- Must belong to the same tenant
  tenant_id = (
    current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'
  )::uuid
  AND
  (
    -- Admin: full access inside tenant
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'admin'

    OR

    owner_id = (
      current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
    )::uuid

    OR

    -- Counselor: leads assigned to teams the user is part of
    EXISTS (
      SELECT 1
      FROM public.user_teams ut
      JOIN public.teams t ON t.id = ut.team_id
      WHERE ut.user_id = (
        current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
      )::uuid
      AND t.tenant_id = public.leads.tenant_id
      AND public.leads.team_id = t.id   -- adjust if your schema uses a different team column
    )
  )
);



create policy "leads_insert_policy"
on public.leads
for insert
with check (
  (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    IN ('counselor', 'admin')

  AND

  tenant_id = (
    current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'
  )::uuid
);
