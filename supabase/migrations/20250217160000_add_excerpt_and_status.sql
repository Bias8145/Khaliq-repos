/*
  # Add Excerpt and Status Columns
  
  ## Query Description:
  This migration adds the missing 'excerpt' column that caused the save error.
  It also adds a 'status' column to support Draft/Published workflows.
  
  ## Metadata:
  - Schema-Category: Structural
  - Impact-Level: Low
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - posts: add column 'excerpt' (TEXT)
  - posts: add column 'status' (TEXT, default 'published')
*/

ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Update existing rows to have a status based on is_public
UPDATE posts SET status = 'published' WHERE is_public = true AND status IS NULL;
UPDATE posts SET status = 'draft' WHERE is_public = false AND status IS NULL;
