-- Find user by email
SELECT 'USER DATA:' as info;
SELECT id, email, name, openId, role, tenantId 
FROM users 
WHERE email = 's.sachs+kompass@sachs-media.com';

-- Find participant by this user's ID
SELECT 'PARTICIPANT BY USER ID:' as info;
SELECT p.id, p.userId, p.firstName, p.lastName, p.email, p.tenantId, p.courseId
FROM participants p
JOIN users u ON p.userId = u.id
WHERE u.email = 's.sachs+kompass@sachs-media.com';

-- Find ALL participants with this email
SELECT 'ALL PARTICIPANTS WITH THIS EMAIL:' as info;
SELECT id, userId, firstName, lastName, email, tenantId, courseId
FROM participants
WHERE email = 's.sachs+kompass@sachs-media.com';

-- Check if there's a mismatch
SELECT 'MISMATCH CHECK:' as info;
SELECT 
  u.id as user_id,
  u.email as user_email,
  p.id as participant_id,
  p.userId as participant_userId,
  p.email as participant_email,
  CASE 
    WHEN u.id = p.userId THEN 'MATCH ✓'
    ELSE 'MISMATCH ✗'
  END as status
FROM users u
LEFT JOIN participants p ON u.email = p.email
WHERE u.email = 's.sachs+kompass@sachs-media.com';
