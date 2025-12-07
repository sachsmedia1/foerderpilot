SELECT id, email, name, openId, role, tenantId, DATE_FORMAT(lastSignedIn, '%Y-%m-%d %H:%i:%s') as last_login
FROM users 
WHERE openId LIKE '%sachs%' OR email LIKE '%sachs%kompass%'
ORDER BY lastSignedIn DESC;
