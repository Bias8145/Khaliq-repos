/*
# Secure RPC Function
Fixes security advisory regarding mutable search path in functions.

## Query Description:
Updates the increment_view_count function to explicitly set search_path to public.
This prevents potential privilege escalation attacks.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true
*/

CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;
