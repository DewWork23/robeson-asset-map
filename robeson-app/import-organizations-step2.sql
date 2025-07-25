-- Step 2: After importing CSV into temp_import, run this to transfer to organizations table
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
SELECT category, COUNT(*) FROM organizations GROUP BY category ORDER BY COUNT(*) DESC;