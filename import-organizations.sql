-- Import script for Robeson County Resources CSV
-- This handles the specific column names and order from your Google Sheet

-- First, create a temporary table matching your CSV structure exactly
CREATE TEMP TABLE IF NOT EXISTS temp_import (
  "Agency" TEXT,
  "Category" TEXT,
  "Service Type" TEXT,
  "Address" TEXT,
  "Latitude" TEXT,
  "Longitude" TEXT,
  "Phone" TEXT,
  "Email" TEXT,
  "Website" TEXT,
  "Hours" TEXT,
  "Services Offered" TEXT,
  "Cost/Payment" TEXT,
  "Description" TEXT,
  "Crisis Service" TEXT,
  "Languages" TEXT,
  "Special Notes" TEXT
);

-- After importing your CSV into temp_import table, run this to transfer to organizations:
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
    WHEN "Latitude" = '' OR "Latitude" IS NULL THEN NULL 
    ELSE CAST("Latitude" AS DECIMAL(10,8))
  END,
  CASE 
    WHEN "Longitude" = '' OR "Longitude" IS NULL THEN NULL 
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