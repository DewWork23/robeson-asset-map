-- Step 1: Drop existing temp table if it exists and recreate
DROP TABLE IF EXISTS temp_import;

-- Create temporary import table that matches your CSV headers exactly
-- IMPORTANT: All columns are TEXT to handle empty values in CSV
CREATE TABLE temp_import (
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

-- After running this, import your CSV into the temp_import table using Supabase's CSV import feature
-- Make sure all columns are mapped as TEXT type during import