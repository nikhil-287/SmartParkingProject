-- Ensure profiles table exists with correct schema
-- This table stores user profile information and is linked by Supabase auth user ID

-- Drop existing table if needed (WARNING: This will delete all profiles!)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create or alter profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  given_name TEXT,
  family_name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'supabase',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint if profiles.id references auth.users.id
-- Note: This is implicit in Supabase - the 'id' UUID should match auth user IDs

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Allow inserts for new users (they can create their profile on signup)
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Create index on id (already primary key, but explicit for clarity)
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

COMMIT;
