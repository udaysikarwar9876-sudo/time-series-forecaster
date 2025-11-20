-- Add gold and silver model types and remove disease
ALTER TYPE model_type ADD VALUE IF NOT EXISTS 'gold';
ALTER TYPE model_type ADD VALUE IF NOT EXISTS 'silver';

-- Note: PostgreSQL doesn't support removing enum values directly
-- The 'disease' value will remain in the enum but won't be used in the UI