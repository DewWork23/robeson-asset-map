-- Step 1: Drop existing temp table if it exists and recreate
DROP TABLE IF EXISTS temp_import;

-- Create temporary import table with lowercase column names
-- But we'll use the CSV header names as aliases
CREATE TABLE temp_import (
  agency TEXT,
  category TEXT,
  service_type TEXT,
  address TEXT,
  latitude TEXT,
  longitude TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  services_offered TEXT,
  cost_payment TEXT,
  description TEXT,
  crisis_service TEXT,
  languages TEXT,
  special_notes TEXT
);

-- IMPORTANT: When importing CSV in Supabase:
-- 1. Click "Import data from CSV"
-- 2. Upload your CSV file
-- 3. In the column mapping screen, map:
--    "Agency" -> agency
--    "Category" -> category
--    "Service Type" -> service_type
--    "Address" -> address
--    "Latitude" -> latitude
--    "Longitude" -> longitude
--    "Phone" -> phone
--    "Email" -> email
--    "Website" -> website
--    "Hours" -> hours
--    "Services Offered" -> services_offered
--    "Cost/Payment" -> cost_payment
--    "Description" -> description
--    "Crisis Service" -> crisis_service
--    "Languages" -> languages
--    "Special Notes" -> special_notes