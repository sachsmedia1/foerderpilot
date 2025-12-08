/**
 * Seed Standard KOMPASS Workflow Template
 * 
 * Run with: node server/seed-kompass-template.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { workflowTemplates, workflowQuestions } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('🌱 Seeding Standard KOMPASS Template...\n');

// Check if template already exists
const existing = await db
  .select()
  .from(workflowTemplates)
  .where(eq(workflowTemplates.name, 'KOMPASS Standard'))
  .limit(1);

if (existing.length > 0) {
  console.log('ℹ️  Standard KOMPASS Template already exists (ID:', existing[0].id, ')');
  console.log('   Skipping seed...\n');
  await connection.end();
  process.exit(0);
}

// Create template
const [templateResult] = await db
  .insert(workflowTemplates)
  .values({
    tenantId: null, // System template (no tenant)
    name: 'KOMPASS Standard',
    description: 'Standard-Vorlage für KOMPASS-Förderanträge mit 5 Begründungsfragen',
    type: 'system',
    isActive: true,
  });

const templateId = Number(templateResult.insertId);

console.log('✅ Created template:', templateId);

// Create 5 standard questions
const questions = [
  {
    templateId,
    questionNumber: 1,
    title: 'Berufliche Situation und Qualifikation',
    description: 'Beschreiben Sie Ihre aktuelle berufliche Situation und Ihre bisherigen Qualifikationen.',
    aiPrompt: 'Formuliere einen professionellen Text über die berufliche Situation und Qualifikationen des Teilnehmers. Verwende 3. Person Singular.',
    helpText: 'Sprechen Sie über Ihren aktuellen Job, Ihre Ausbildung und relevante Berufserfahrung.',
    requiredSentencesMin: 4,
    requiredSentencesMax: 8,
    sortOrder: 1,
  },
  {
    templateId,
    questionNumber: 2,
    title: 'Motivation für die Weiterbildung',
    description: 'Warum möchten Sie an dieser Weiterbildung teilnehmen?',
    aiPrompt: 'Formuliere einen überzeugenden Text über die Motivation des Teilnehmers für die Weiterbildung. Verwende 3. Person Singular.',
    helpText: 'Erklären Sie, warum diese Weiterbildung wichtig für Sie ist und was Sie damit erreichen möchten.',
    requiredSentencesMin: 4,
    requiredSentencesMax: 8,
    sortOrder: 2,
  },
  {
    templateId,
    questionNumber: 3,
    title: 'Berufliche Ziele',
    description: 'Welche beruflichen Ziele verfolgen Sie mit dieser Weiterbildung?',
    aiPrompt: 'Formuliere einen klaren Text über die beruflichen Ziele des Teilnehmers nach der Weiterbildung. Verwende 3. Person Singular.',
    helpText: 'Beschreiben Sie, welche Position oder Tätigkeit Sie nach der Weiterbildung anstreben.',
    requiredSentencesMin: 4,
    requiredSentencesMax: 8,
    sortOrder: 3,
  },
  {
    templateId,
    questionNumber: 4,
    title: 'Relevanz der Weiterbildung',
    description: 'Wie hilft Ihnen diese Weiterbildung bei Ihrer beruflichen Entwicklung?',
    aiPrompt: 'Formuliere einen überzeugenden Text darüber, wie die Weiterbildung die berufliche Entwicklung des Teilnehmers fördert. Verwende 3. Person Singular.',
    helpText: 'Erklären Sie den Zusammenhang zwischen der Weiterbildung und Ihren beruflichen Zielen.',
    requiredSentencesMin: 4,
    requiredSentencesMax: 8,
    sortOrder: 4,
  },
  {
    templateId,
    questionNumber: 5,
    title: 'Persönliche Voraussetzungen',
    description: 'Welche persönlichen Stärken und Erfahrungen bringen Sie mit?',
    aiPrompt: 'Formuliere einen positiven Text über die persönlichen Voraussetzungen und Stärken des Teilnehmers. Verwende 3. Person Singular.',
    helpText: 'Beschreiben Sie Ihre Stärken, Soft Skills und relevante Erfahrungen.',
    requiredSentencesMin: 4,
    requiredSentencesMax: 8,
    sortOrder: 5,
  },
];

for (const question of questions) {
  await db.insert(workflowQuestions).values(question);
  console.log(`✅ Created question ${question.questionNumber}: ${question.title}`);
}

console.log('\n✨ Seed completed successfully!\n');

await connection.end();
