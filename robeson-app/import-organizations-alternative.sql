-- Alternative: Manual import if CSV upload fails
-- This assumes you've created the temp_import table from import-organizations-direct.sql

-- Step 1: First, let's check what we're working with
SELECT COUNT(*) FROM temp_import;

-- Step 2: If the table is still empty and CSV import isn't working,
-- you can manually insert a few test records to verify the process:
INSERT INTO temp_import (
  "Agency", "Category", "Service Type", "Address", 
  "Latitude", "Longitude", "Phone", "Email", "Website", 
  "Hours", "Services Offered", "Cost/Payment", "Description", 
  "Crisis Service", "Languages", "Special Notes"
) VALUES 
  ('Test Organization', 'Healthcare Services', 'Medical', '123 Main St', 
   '34.6', '-79.1', '910-555-0123', 'test@example.com', 'https://example.com',
   '9-5 Mon-Fri', 'Medical services', 'Insurance accepted', 'Test description',
   'FALSE', 'English', 'Test note');

-- Step 3: Transfer to organizations table (same as before)
INSERT INTO organizations (
  organization_name,
  category,
  service_type,
  address,
  latitude,
  longitude,
  phone,
  email,
  website,
  hours,
  services_offered,
  cost_payment,
  description,
  crisis_service,
  languages,
  special_notes
)
SELECT 
  "Agency",
  "Category",
  "Service Type",
  "Address",
  CASE 
    WHEN "Latitude" = '' OR "Latitude" IS NULL OR TRIM("Latitude") = '' THEN NULL 
    WHEN "Latitude" !~ '^-?[0-9]+\.?[0-9]*$' THEN NULL
    ELSE CAST("Latitude" AS DECIMAL(10,8))
  END,
  CASE 
    WHEN "Longitude" = '' OR "Longitude" IS NULL OR TRIM("Longitude") = '' THEN NULL 
    WHEN "Longitude" !~ '^-?[0-9]+\.?[0-9]*$' THEN NULL
    ELSE CAST("Longitude" AS DECIMAL(11,8))
  END,
  "Phone",
  NULLIF("Email", ''),
  NULLIF("Website", ''),
  "Hours",
  "Services Offered",
  "Cost/Payment",
  "Description",
  CASE 
    WHEN UPPER("Crisis Service") = 'TRUE' THEN true 
    WHEN UPPER("Crisis Service") = 'YES' THEN true
    ELSE false 
  END,
  "Languages",
  "Special Notes"
FROM temp_import
WHERE "Agency" IS NOT NULL AND "Agency" != '';

-- Verify the import
SELECT COUNT(*) as total_imported FROM organizations;
SELECT organization_name, category FROM organizations LIMIT 5;