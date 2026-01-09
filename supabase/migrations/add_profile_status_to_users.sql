-- Add profile_status column to users table
-- This column tracks account approval status: pending (awaiting admin approval), approved (can access platform), rejected

-- Add the column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint to ensure valid status values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_profile_status'
    ) THEN
        ALTER TABLE users
        ADD CONSTRAINT check_profile_status 
        CHECK (profile_status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

-- Create index for faster queries on profile_status
CREATE INDEX IF NOT EXISTS idx_users_profile_status 
ON users(profile_status);

-- Add comment to document the column
COMMENT ON COLUMN users.profile_status IS 'Account approval status: pending (awaiting admin approval after payment), approved (can access platform), rejected (admin rejected)';

-- Set existing users without profile_status to 'pending' (if any exist)
UPDATE users 
SET profile_status = 'pending' 
WHERE profile_status IS NULL;
