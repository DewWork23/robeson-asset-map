# Supabase Organizations Setup

## 1. Create the Organizations Table

1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Copy and paste the entire contents of `supabase-organizations-setup.sql`
4. Click "Run" to create the organizations table, indexes, and policies

## 2. Import Your CSV Data

### Option 1: Using Supabase Table Editor (Easiest)
1. In Supabase dashboard, go to "Table Editor"
2. Click on the "organizations" table
3. Click "Insert" → "Import data from CSV"
4. Upload your `consolidated_robeson.csv` file
5. Map the columns:
   - Organization Name → organization_name
   - Category → category
   - Service Type → service_type
   - Address → address
   - Phone → phone
   - Email → email
   - Website → website
   - Hours → hours
   - Services Offered → services_offered
   - Cost/Payment → cost_payment
   - Description → description
   - Crisis Service → crisis_service (map "TRUE" to true, "FALSE" to false)
   - Languages → languages
   - Special Notes → special_notes
   - Latitude → latitude
   - Longitude → longitude

### Option 2: Using SQL (More Control)
1. First, create a temporary import table in SQL Editor:
```sql
CREATE TEMP TABLE import_orgs (
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
  "Special Notes" TEXT,
  "Latitude" TEXT,
  "Longitude" TEXT
);
```

2. Import your CSV using the Supabase UI into the temp table

3. Then run this to transfer to the main table:
```sql
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
  "Email",
  "Website",
  "Hours",
  "Services Offered",
  "Cost/Payment",
  "Description",
  CASE WHEN "Crisis Service" = 'TRUE' THEN true ELSE false END,
  "Languages",
  "Special Notes",
  CAST(NULLIF("Latitude", '') AS DECIMAL),
  CAST(NULLIF("Longitude", '') AS DECIMAL)
FROM import_orgs;
```

## 3. Verify the Import

Run this query to check:
```sql
-- Count total organizations
SELECT COUNT(*) FROM organizations;

-- Check categories
SELECT category, COUNT(*) 
FROM organizations 
GROUP BY category 
ORDER BY COUNT(*) DESC;

-- Check crisis services
SELECT COUNT(*) FROM organizations WHERE crisis_service = true;
```

## 4. Test Search Function

```sql
-- Test the search function
SELECT * FROM search_organizations('food');
SELECT * FROM search_organizations('mental health');
```

## Benefits of Database Migration

1. **Better Search**: Full-text search across all fields
2. **Real-time Updates**: Changes appear immediately
3. **Better Performance**: Indexed queries instead of parsing CSV
4. **Data Integrity**: Proper types and constraints
5. **Scalability**: Can handle thousands of organizations
6. **Advanced Features**: Geospatial queries, analytics, etc.

## Next Steps

After importing, we'll update the React app to:
- Use Supabase for all organization queries
- Implement real-time search
- Add admin interface for managing organizations
- Enable filtering by distance using PostGIS