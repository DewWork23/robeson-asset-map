-- Transfer data from temp_import to organizations table
INSERT INTO organizations (
  organization_name,
  category,
  service_type,
  address,
  phone,
  email,
  website,
  hours,
  services_offered,
  cost_payment,
  description,
  crisis_service,
  languages,
  special_notes,
  latitude,
  longitude
)
SELECT 
  "Organization Name",
  "Category",
  "Service Type",
  "Address",
  "Phone",
  NULLIF("Email", ''),
  NULLIF("Website", ''),
  "Hours",
  "Services Offered",
  "Cost/Payment",
  "Description",
  CASE 
    WHEN UPPER("Crisis Service") IN ('TRUE', 'YES', 'Y') THEN true 
    ELSE false 
  END,
  "Languages",
  "Special Notes",
  NULL, -- No latitude in CSV
  NULL  -- No longitude in CSV
FROM temp_import
WHERE "Organization Name" IS NOT NULL AND "Organization Name" != '';

-- Verify the import
SELECT COUNT(*) as total_imported FROM organizations;

-- Show some sample data
SELECT organization_name, category, address 
FROM organizations 
LIMIT 10;

-- Check categories
SELECT category, COUNT(*) as count 
FROM organizations 
GROUP BY category 
ORDER BY count DESC;