-- Enable Row Level Security on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- Ensure user_id column is UUID type (or convert if TEXT)
-- If user_id is TEXT, convert to UUID for proper comparison with auth.uid()
-- ALTER TABLE bookings ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Policy: Users can only view their own bookings
-- Compares auth.uid() (uuid) with user_id (should be uuid)
CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
USING (auth.uid() = user_id::uuid);

-- Policy: Users can only insert their own bookings
CREATE POLICY "Users can create their own bookings"
ON bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id::uuid);

-- Policy: Users can only update their own bookings
CREATE POLICY "Users can update their own bookings"
ON bookings
FOR UPDATE
USING (auth.uid() = user_id::uuid)
WITH CHECK (auth.uid() = user_id::uuid);

-- Policy: Users can only delete their own bookings
CREATE POLICY "Users can delete their own bookings"
ON bookings
FOR DELETE
USING (auth.uid() = user_id::uuid);

-- Enforce RLS on all operations
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;
