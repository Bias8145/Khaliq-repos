/*
  # Add Tags Support
  
  ## Changes
  - Adds `tags` column to `posts` table to support categorization.
  - Defaults to empty array.
  
  ## Safety
  - Uses IF NOT EXISTS to prevent errors.
  - Safe operation, no data loss.
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
    ALTER TABLE posts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;
