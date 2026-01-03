-- Fix RLS Policy for Updating Posts
-- This ensures the author (admin) can update their own posts (toggle visibility, edit content)

BEGIN;

-- Drop existing update policy if it exists to avoid conflicts (safe to fail if not exists)
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."posts";
DROP POLICY IF EXISTS "Enable update for authors" ON "public"."posts";

-- Create a comprehensive update policy
CREATE POLICY "Enable update for authors" 
ON "public"."posts" 
FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

COMMIT;
