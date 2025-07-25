-- Create events table
CREATE TABLE events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  organizer TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an index on date for faster queries
CREATE INDEX idx_events_date ON events(date);

-- Create an index on category
CREATE INDEX idx_events_category ON events(category);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert events (optional - you can make this public)
CREATE POLICY "Anyone can insert events" ON events
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows authenticated users to update events (optional)
CREATE POLICY "Anyone can update events" ON events
  FOR UPDATE USING (true);

-- Create a policy that allows authenticated users to delete events (optional)
CREATE POLICY "Anyone can delete events" ON events
  FOR DELETE USING (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();