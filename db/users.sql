-- 已弃用：这是早期局部结构，缺少 notes、predictions、otp_codes 及安全权限。
-- 新建或恢复数据库请执行 db/schema.sql；保留本文件仅用于追溯旧版本。

create table if not exists users (
  id uuid primary key,
  phone varchar(20) unique not null,
  nickname varchar(20),
  birthday date,
  birthday_type varchar(10) default 'solar' check (birthday_type in ('solar', 'lunar')),
  lifestyle varchar(20) check (lifestyle in ('working', 'freelance', 'studying', 'uncertain')),
  initial_thought text,
  remind_time time,
  remind_enabled boolean default true,
  onboarding_completed boolean default false,
  preferred_lottery varchar(20) default 'double_color' check (
    preferred_lottery in ('double_color', 'super_lotto', 'arrangement_3')
  ),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table users
  add column if not exists preferred_lottery varchar(20) default 'double_color';

create table if not exists coin_flips (
  id uuid primary key,
  user_id uuid references users(id),
  option_a text not null,
  option_b text not null,
  result varchar(1) not null check (result in ('a', 'b')),
  bob_comment text,
  followed boolean,
  created_at timestamp default now()
);

create table if not exists records (
  id uuid primary key,
  user_id uuid references users(id),
  content text,
  input_type varchar(10) default 'text' check (input_type in ('text', 'voice')),
  audio_duration integer,
  created_at timestamp default now()
);

alter table records
  add column if not exists input_type varchar(10) default 'text';

alter table records
  add column if not exists audio_duration integer;
