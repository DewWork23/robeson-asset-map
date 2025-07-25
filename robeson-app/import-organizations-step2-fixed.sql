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
  agency,
  category,
  service_type,
  address,
  CASE 
    WHEN latitude = '' OR latitude IS NULL OR TRIM(latitude) = '' THEN NULL 
    WHEN latitude !~ '^-?[0-9]+\.?[0-9]*$' THEN NULL
    ELSE CAST(latitude AS DECIMAL(10,8))
  END,
  CASE 
    WHEN longitude = '' OR longitude IS NULL OR TRIM(longitude) = '' THEN NULL 
    WHEN longitude !~ '^-?[0-9]+\.?[0-9]*$' THEN NULL
    ELSE CAST(longitude AS DECIMAL(11,8))
  END,
  phone,
  NULLIF(email, ''),
  NULLIF(website, ''),
  hours,
  services_offered,
  cost_payment,
  description,
  CASE 
    WHEN UPPER(crisis_service) = 'TRUE' THEN true 
    WHEN UPPER(crisis_service) = 'YES' THEN true
    ELSE false 
  END,
  languages,
  special_notes
FROM temp_import
WHERE agency IS NOT NULL AND agency != '';

-- Verify the import
SELECT COUNT(*) as total_imported FROM organizations;
SELECT category, COUNT(*) FROM organizations GROUP BY category ORDER BY COUNT(*) DESC;

-- Check some sample data
SELECT organization_name, category, latitude, longitude 
FROM organizations 
LIMIT 10;