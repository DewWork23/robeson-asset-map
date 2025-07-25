-- Step 1: Create temporary import table that matches your CSV headers exactly
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

-- After running this, import your CSV into the temp_import table using Supabase's CSV import feature