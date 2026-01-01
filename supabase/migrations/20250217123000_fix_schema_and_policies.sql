/*
  # Fix Schema and Policies
  
  ## Query Description:
  1. Safely sets up the 'posts' table if it doesn't exist.
  2. Drops existing policies to prevent "already exists" errors.
  3. Re-creates policies for Public Read and Authenticated Write access.
  4. Ensures the view counting function exists.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Reversible: true
*/

-- Create table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tags TEXT[]
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;

-- Re-create Policies
CREATE POLICY "Public posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING ( is_public = true );

CREATE POLICY "Authenticated users can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update posts"
  ON public.posts FOR UPDATE
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete posts"
  ON public.posts FOR DELETE
  USING ( auth.role() = 'authenticated' );

-- Function to increment view count securely
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
