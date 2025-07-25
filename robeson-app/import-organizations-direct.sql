-- Direct import approach: Create table with exact CSV column names
DROP TABLE IF EXISTS temp_import;

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

-- After creating this table, import your CSV
-- The columns should match exactly now