-- Fix RLS policies for organizations table
-- First, let's check and update the policies

-- For organizations table, we need to fix the authenticated policies
-- These policies should actually allow public role for read-only access

-- Drop existing incorrect policies (if they exist)
DROP POLICY IF EXISTS "Authenticated users can delete organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can update organizations" ON organizations;

-- Create proper policies for organizations
-- Keep the SELECT policy as is (public can read)
-- Create admin-only policies for modifications (optional - only if you want to restrict edits)

-- If you want to allow public modifications (like events table):
CREATE POLICY "Anyone can insert organizations" ON organizations
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Anyone can update organizations" ON organizations
    FOR UPDATE TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anyone can delete organizations" ON organizations
    FOR DELETE TO public
    USING (true);

-- For temp_import table - enable RLS and create policies or drop the table
-- Since this was just for import, we should drop it:
DROP TABLE IF EXISTS temp_import;

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('events', 'organizations')
ORDER BY tablename, policyname;