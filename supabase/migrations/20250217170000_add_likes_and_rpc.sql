-- Add likes column to posts if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes') THEN 
        ALTER TABLE posts ADD COLUMN likes INTEGER DEFAULT 0; 
    END IF; 
END $$;

-- Function to safely increment likes
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes = likes + 1
  WHERE id = post_id;
END;
$$;

-- Function to safely decrement likes (optional, if user unlikes)
CREATE OR REPLACE FUNCTION decrement_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes = GREATEST(0, likes - 1)
  WHERE id = post_id;
END;
$$;
