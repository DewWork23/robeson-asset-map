-- Drop and recreate temp table with CORRECT column names from your CSV
DROP TABLE IF EXISTS temp_import;

CREATE TABLE temp_import (
  "Organization Name" TEXT,
  "Category" TEXT,
  "Service Type" TEXT,
  "Address" TEXT,
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

-- Note: Your CSV does NOT have Latitude/Longitude columns!
-- After importing, we'll need to geocode the addresses or add coordinates separately