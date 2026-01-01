/*
  # Add Categories and Subcategories
  
  ## Query Description:
  Adds category and subcategory columns to the posts table to support the new classification system (Catatan, Penelitian, Bahasan).
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: posts
  - New Column: category (text)
  - New Column: subcategory (text)
*/

ALTER TABLE posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'Catatan';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subcategory text;

-- Update existing posts to have a default category if null
UPDATE posts SET category = 'Catatan' WHERE category IS NULL;
