-- ============================================================
-- 小满 · 完整数据库结构（Supabase / Postgres）
-- 一次性可跑：建表 + 补列 + 索引。生产环境在 Supabase SQL Editor 执行。
-- ============================================================

-- 用户
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) unique not null,
  nickname varchar(20),
  birthday date,
  birthday_type varchar(10) default 'solar' check (birthday_type in ('solar','lunar')),
  lifestyle varchar(20) check (lifestyle in ('working','freelance','studying','uncertain')),
  initial_thought text,
  remind_time time,
  remind_enabled boolean default true,
  onboarding_completed boolean default false,
  onboarding_step varchar(20) default 'intro',
  preferred_lottery varchar(20) default 'double_color'
    check (preferred_lottery in ('double_color','super_lotto','arrangement_3')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table users add column if not exists onboarding_step varchar(20) default 'intro';

-- 日记记录
create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null default '',
  images text[] not null default '{}',
  input_type varchar(10) default 'text' check (input_type in ('text','voice')),
  audio_duration integer,
  mood varchar(20),
  created_at timestamptz default now()
);
alter table records add column if not exists images text[] not null default '{}';
alter table records add column if not exists mood varchar(20);
create index if not exists records_user_created_idx on records (user_id, created_at desc);

-- 收下的预感
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  choice varchar(40) not null,
  text text not null,
  possibility integer not null default 0,
  created_at timestamptz default now()
);
create index if not exists notes_user_created_idx on notes (user_id, created_at desc);

-- 抛硬币
create table if not exists coin_flips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  option_a text not null,
  option_b text not null,
  result varchar(1) not null check (result in ('a','b')),
  bob_comment text,
  followed boolean,
  created_at timestamptz default now()
);
create index if not exists coin_flips_user_created_idx on coin_flips (user_id, created_at desc);

-- ============================================================
-- RLS（行级安全）：服务端用 service_role key 绕过 RLS 写入；
-- 若前端直连 Supabase，请按 auth.uid() 配每用户隔离策略。
-- ============================================================
-- alter table records enable row level security;
-- create policy "own records" on records for all using (user_id = auth.uid());
-- （notes / coin_flips 同理）

-- 小满的预感（应验闭环）
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  basis text not null default '',
  status varchar(10) not null default 'pending' check (status in ('pending','hit','partial','miss')),
  created_at timestamptz default now(),
  verified_at timestamptz
);
create index if not exists predictions_user_created_idx on predictions (user_id, created_at desc);
alter table predictions add column if not exists category varchar(10) not null default 'other';
alter table predictions add column if not exists confidence integer not null default 55;
