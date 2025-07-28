-- Check if RLS is enabled on tables
SELECT tablename, 
       CASE 
         WHEN rowsecurity = true THEN 'RLS Enabled'
         ELSE 'RLS DISABLED - THIS IS A PROBLEM'
       END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'events');

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('events', 'organizations')
ORDER BY tablename, policyname;

-- Verify anon role has proper permissions
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name IN ('organizations', 'events')
AND grantee IN ('anon', 'public')
ORDER BY table_name, grantee, privilege_type;

-- Grant necessary permissions to anon role if missing
GRANT SELECT ON organizations TO anon;
GRANT SELECT ON events TO anon;
GRANT INSERT ON organizations TO anon;
GRANT UPDATE ON organizations TO anon;
GRANT DELETE ON organizations TO anon;
GRANT INSERT ON events TO anon;
GRANT UPDATE ON events TO anon;
GRANT DELETE ON events TO anon;