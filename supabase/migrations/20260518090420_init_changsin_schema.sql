-- Staff
create table public.cs_staff (
  id            text primary key,
  name          text not null,
  phone         text not null default '',
  role          text not null,
  login_id      text not null unique,
  password      text not null default '1234',
  is_active     boolean not null default true,
  commission_type text not null default 'fixed',
  commission_amount numeric not null default 0,
  last_active   timestamptz
);

-- Jobs
create table public.cs_jobs (
  id              text primary key,
  job_number      text not null,
  type            text not null,
  customer_name   text not null,
  customer_phone  text not null default '',
  customer_address text not null default '',
  product         text not null default '',
  assigned_staff  text[] not null default '{}',
  status          text not null default 'pending',
  work_result     text,
  remarks         text,
  photo_before    text,
  photo_after     text,
  photo_problem   text,
  photo_warranty  text,
  created_at      timestamptz not null default now(),
  verify_status   text not null default 'pending',
  warranty_active boolean not null default false,
  commission_amount numeric not null default 0
);

-- Job timeline events
create table public.cs_job_timeline (
  id       text primary key,
  job_id   text not null references public.cs_jobs(id) on delete cascade,
  label    text not null,
  ts       timestamptz not null default now(),
  actor    text not null default 'Staff'
);

-- Job type settings
create table public.cs_job_types (
  code          text primary key,
  label         text not null,
  active        boolean not null default true,
  allowed_roles text[] not null default '{}'
);

-- Role permission settings
create table public.cs_role_permissions (
  role        text primary key,
  label       text not null,
  permissions text[] not null default '{}'
);

-- Indexes
create index on public.cs_job_timeline(job_id);
create index on public.cs_jobs(created_at desc);

-- RLS: open policies
alter table public.cs_staff            enable row level security;
alter table public.cs_jobs             enable row level security;
alter table public.cs_job_timeline     enable row level security;
alter table public.cs_job_types        enable row level security;
alter table public.cs_role_permissions enable row level security;

create policy "allow all cs_staff"            on public.cs_staff            for all using (true) with check (true);
create policy "allow all cs_jobs"             on public.cs_jobs             for all using (true) with check (true);
create policy "allow all cs_job_timeline"     on public.cs_job_timeline     for all using (true) with check (true);
create policy "allow all cs_job_types"        on public.cs_job_types        for all using (true) with check (true);
create policy "allow all cs_role_permissions" on public.cs_role_permissions for all using (true) with check (true);
