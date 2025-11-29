-- Migration: Update documents table for Sprint 1.3
-- Date: 2025-11-30
-- Description: Add tenantId, rename columns, add validationStatus

-- Step 1: Add new columns
ALTER TABLE documents 
  ADD COLUMN tenantId INT NOT NULL DEFAULT 1 AFTER id,
  ADD COLUMN validationStatus VARCHAR(50) NOT NULL DEFAULT 'pending' AFTER fileSize,
  ADD COLUMN createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER validationResult;

-- Step 2: Rename columns
ALTER TABLE documents 
  CHANGE COLUMN fileName filename VARCHAR(255) NOT NULL;

-- Step 3: Update validationStatus based on isValidated
UPDATE documents 
SET validationStatus = CASE 
  WHEN isValidated = 1 THEN 'valid'
  ELSE 'pending'
END;

-- Step 4: Drop old columns (after data migration)
ALTER TABLE documents 
  DROP COLUMN isValidated,
  DROP COLUMN validationErrors;

-- Step 5: Add index for performance
CREATE INDEX idx_documents_tenant ON documents(tenantId);
CREATE INDEX idx_documents_participant ON documents(participantId);
CREATE INDEX idx_documents_status ON documents(validationStatus);
