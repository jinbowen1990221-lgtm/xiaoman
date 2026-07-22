-- ============================================================
-- 小满 · 完整数据库结构（Supabase / Postgres）
-- 一次性可跑：建表 + 补列 + 索引 + 服务端权限。生产环境在 Supabase SQL Editor 执行。
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

-- 小满的预感（应验闭环）
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  basis text not null default '',
  status varchar(10) not null default 'pending' check (status in ('pending','hit','partial','miss')),
  created_at timestamptz default now(),
  verified_at timestamptz,
  category varchar(10) not null default 'other'
    check (category in ('mood','behavior','sleep','other')),
  confidence integer not null default 55
    check (confidence between 0 and 100)
);
create index if not exists predictions_user_created_idx on predictions (user_id, created_at desc);
alter table predictions add column if not exists category varchar(10) not null default 'other';
alter table predictions add column if not exists confidence integer not null default 55;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'predictions_category_check') then
    alter table predictions add constraint predictions_category_check
      check (category in ('mood','behavior','sleep','other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'predictions_confidence_check') then
    alter table predictions add constraint predictions_confidence_check
      check (confidence between 0 and 100);
  end if;
end
$$;

-- 短信验证码（serverless 多实例共享，TTL 由应用层判断）
create table if not exists otp_codes (
  phone varchar(20) primary key,
  code varchar(10) not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  last_sent_at timestamptz not null default now()
);

-- ============================================================
-- 数据只由 Next.js 服务端通过 service_role 访问。
-- 浏览器端角色不应读取手机号、验证码或用户内容。
-- ============================================================
alter table users enable row level security;
alter table records enable row level security;
alter table notes enable row level security;
alter table coin_flips enable row level security;
alter table predictions enable row level security;
alter table otp_codes enable row level security;

revoke all privileges on table users, records, notes, coin_flips, predictions, otp_codes
  from public, anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update on table users to service_role;
grant select, insert on table records to service_role;
grant select, insert on table notes to service_role;
grant select, insert, update on table coin_flips to service_role;
grant select, insert, update on table predictions to service_role;
grant select, insert, update, delete on table otp_codes to service_role;

-- 原子校验、计数并消费验证码，避免并发请求绕过尝试次数或重复使用。
create or replace function verify_otp_code(p_phone varchar, p_code varchar)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  stored otp_codes%rowtype;
begin
  select * into stored from otp_codes where phone = p_phone for update;
  if not found then return 'expired'; end if;
  if now() > stored.expires_at then
    delete from otp_codes where phone = p_phone;
    return 'expired';
  end if;
  if stored.attempts >= 5 then return 'too_many'; end if;
  if stored.code <> p_code then
    update otp_codes set attempts = stored.attempts + 1 where phone = p_phone;
    return 'mismatch';
  end if;
  delete from otp_codes where phone = p_phone;
  return 'ok';
end;
$$;

revoke all on function verify_otp_code(varchar, varchar) from public, anon, authenticated;
grant execute on function verify_otp_code(varchar, varchar) to service_role;
