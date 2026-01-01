/*
  # Initial Schema for Bias Repository

  ## Query Description: 
  Creates the posts table and a secure function for incrementing view counts.
  This setup allows public reading of posts but restricts writing to authenticated users.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: posts (id, title, content, is_public, view_count, etc.)
  - Function: increment_view_count (RPC)
*/

-- Create Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  excerpt text,
  is_public boolean default true,
  view_count bigint default 0,
  author_id uuid default auth.uid(),
  tags text[] default '{}'::text[]
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies
-- 1. Everyone can read public posts
create policy "Public posts are viewable by everyone"
  on public.posts for select
  using ( is_public = true );

-- 2. Authenticated users (The Admin) can do everything
create policy "Admin can do everything"
  on public.posts for all
  using ( auth.role() = 'authenticated' );

-- Function to safely increment view count without giving update permissions to public
create or replace function increment_view_count(post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set view_count = view_count + 1
  where id = post_id;
end;
$$;
