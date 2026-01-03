-- Migration: Fix Posts Update Policy
-- Description: Re-creates the update policy for posts to ensure authors can update visibility and content without RLS violations.

BEGIN;

-- Drop existing update policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.posts;

-- Create a comprehensive update policy
-- This allows the author to update ANY column in their own row
CREATE POLICY "Authors can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

COMMIT;
