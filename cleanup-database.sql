-- FörderPilot Database Cleanup Script
-- Löscht alle Daten außer User info@stefan-sachs.de und System-Templates

-- 1. Finde User ID von info@stefan-sachs.de
SET @keep_user_id = (SELECT id FROM users WHERE email = 'info@stefan-sachs.de' LIMIT 1);

-- 2. Lösche alle Daten in abhängiger Reihenfolge

-- Workflow-Antworten löschen
DELETE FROM participantWorkflowAnswers WHERE participantId IN (
  SELECT id FROM participants WHERE userId != @keep_user_id
);

-- Dokumente löschen
DELETE FROM documents WHERE participantId IN (
  SELECT id FROM participants WHERE userId != @keep_user_id
);

-- Teilnehmer löschen (außer die vom behalten User)
DELETE FROM participants WHERE userId != @keep_user_id;

-- Kurstermine löschen
DELETE FROM courseSchedules;

-- Kurse löschen
DELETE FROM courses;

-- E-Mail-Templates löschen
DELETE FROM emailTemplates;

-- Workflow-Templates löschen (außer System-Template ID 1)
DELETE FROM workflowQuestions WHERE templateId != 1;
DELETE FROM workflowTemplates WHERE id != 1;

-- Mandanten löschen (außer Tenant ID 1 - FörderPilot App)
DELETE FROM tenants WHERE id != 1;

-- Alle User löschen außer info@stefan-sachs.de
DELETE FROM users WHERE id != @keep_user_id;

-- Zeige verbleibende Daten
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Participants', COUNT(*) FROM participants
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'WorkflowTemplates', COUNT(*) FROM workflowTemplates
UNION ALL
SELECT 'WorkflowQuestions', COUNT(*) FROM workflowQuestions;
