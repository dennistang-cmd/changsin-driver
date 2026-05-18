-- Customers
create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  contact     text not null default '',
  email       text not null default '',
  phone       text not null default '',
  created_at  timestamptz not null default now()
);

-- Quotes
create table public.quotes (
  id           uuid primary key default gen_random_uuid(),
  quote_no     text not null unique,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  status       text not null default 'draft' check (status in ('draft','sent','closed','rejected')),
  total        numeric(12,2) not null default 0,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

-- Quote items
create table public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  name        text not null,
  qty         numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0,
  sort_order  int not null default 0
);

-- Indexes
create index on public.quotes(customer_id);
create index on public.quote_items(quote_id);

-- RLS: enabled, open policies (add auth later)
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

create policy "allow all customers"   on public.customers   for all using (true) with check (true);
create policy "allow all quotes"      on public.quotes      for all using (true) with check (true);
create policy "allow all quote_items" on public.quote_items for all using (true) with check (true);
