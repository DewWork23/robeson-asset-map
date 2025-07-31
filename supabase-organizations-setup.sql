-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  category TEXT NOT NULL,
  service_type TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  services_offered TEXT,
  cost_payment TEXT,
  description TEXT,
  crisis_service BOOLEAN DEFAULT false,
  languages TEXT,
  special_notes TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_category ON organizations(category);
CREATE INDEX idx_organizations_crisis ON organizations(crisis_service);
CREATE INDEX idx_organizations_name ON organizations(organization_name);
CREATE INDEX idx_organizations_location ON organizations(latitude, longitude);

-- Create full text search index
CREATE INDEX idx_organizations_search ON organizations 
USING GIN (to_tsvector('english', 
  coalesce(organization_name, '') || ' ' || 
  coalesce(services_offered, '') || ' ' || 
  coalesce(description, '') || ' ' ||
  coalesce(category, '')
));

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read organizations
CREATE POLICY "Organizations are viewable by everyone" ON organizations
  FOR SELECT USING (true);

-- Allow authenticated users to insert (optional - you can make this admin only)
CREATE POLICY "Authenticated users can insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update (optional - you can make this admin only)
CREATE POLICY "Authenticated users can update organizations" ON organizations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete (optional - you can make this admin only)
CREATE POLICY "Authenticated users can delete organizations" ON organizations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations
  FOR EACH ROW 
  EXECUTE FUNCTION update_organizations_updated_at();

-- Create a function for full text search
CREATE OR REPLACE FUNCTION search_organizations(search_query TEXT)
RETURNS SETOF organizations AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM organizations
  WHERE to_tsvector('english', 
    coalesce(organization_name, '') || ' ' || 
    coalesce(services_offered, '') || ' ' || 
    coalesce(description, '') || ' ' ||
    coalesce(category, '')
  ) @@ plainto_tsquery('english', search_query)
  OR organization_name ILIKE '%' || search_query || '%'
  OR services_offered ILIKE '%' || search_query || '%'
  OR description ILIKE '%' || search_query || '%';
END;
$$ LANGUAGE plpgsql;

-- Create a view for crisis services for quick access
-- Using SECURITY INVOKER to ensure the view runs with the privileges of the querying user
CREATE OR REPLACE VIEW crisis_organizations 
WITH (security_invoker = true) AS
SELECT * FROM organizations 
WHERE crisis_service = true
ORDER BY organization_name;