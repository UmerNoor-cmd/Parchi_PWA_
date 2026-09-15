-- Landing-page conversion forms: Become a Merchant + Become a Campus Ambassador.
-- Run once against the Parchi Supabase/Postgres instance.
--
-- RLS is enabled with NO public policies: inserts happen server-side only,
-- through app/api/applications/* using the service-role key.

create table if not exists public.merchant_applications (
    id            uuid primary key default gen_random_uuid(),
    business_name text        not null,
    contact_name  text        not null,
    email         text        not null,
    phone         text        not null,
    city          text        not null,
    category      text        not null,
    branch_count  text        not null,
    website       text,
    message       text,
    status        text        not null default 'new',
    created_at    timestamptz not null default now()
);

create table if not exists public.ambassador_applications (
    id            uuid primary key default gen_random_uuid(),
    full_name     text        not null,
    email         text        not null,
    phone         text        not null,
    institute     text        not null,
    year_of_study text        not null,
    city          text        not null,
    instagram     text,
    motivation    text        not null,
    status        text        not null default 'new',
    created_at    timestamptz not null default now()
);

create index if not exists merchant_applications_created_at_idx
    on public.merchant_applications (created_at desc);
create index if not exists merchant_applications_status_idx
    on public.merchant_applications (status);

create index if not exists ambassador_applications_created_at_idx
    on public.ambassador_applications (created_at desc);
create index if not exists ambassador_applications_status_idx
    on public.ambassador_applications (status);

alter table public.merchant_applications   enable row level security;
alter table public.ambassador_applications enable row level security;
