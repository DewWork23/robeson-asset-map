-- Update the crisis_organizations view to use SECURITY INVOKER
-- This ensures the view runs with the privileges of the querying user
CREATE OR REPLACE VIEW crisis_organizations 
WITH (security_invoker = true) AS
SELECT * FROM organizations 
WHERE crisis_service = true
ORDER BY organization_name;