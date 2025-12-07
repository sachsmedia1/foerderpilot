/**
 * Seed KOMPASS Standard Workflow Template
 * 
 * Erstellt das System-Default-Template mit 5 Standard-Begründungsfragen
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Seeding KOMPASS Standard Template...\n');

// Check if template already exists
const [existing] = await db
  .select()
  .from(schema.workflowTemplates)
  .where(eq(schema.workflowTemplates.name, 'KOMPASS Standard'))
  .limit(1);

if (existing) {
  console.log('✅ KOMPASS Standard Template already exists (ID:', existing.id, ')');
  process.exit(0);
}

// Create template
const [template] = await db
  .insert(schema.workflowTemplates)
  .values({
    tenantId: 1, // FörderPilot App
    name: 'KOMPASS Standard',
    description: 'Standard-Begründungsfragen für KOMPASS-Förderanträge',
    type: 'system',
    isActive: true,
  })
  .$returningId();

console.log('✅ Template created (ID:', template.id, ')');

// Create 5 standard questions
const questions = [
  {
    questionNumber: 1,
    title: 'Aktuelle berufliche Tätigkeit',
    description: 'Beschreiben Sie Ihre aktuelle berufliche Situation',
    aiPrompt: `Der Teilnehmer beschreibt seine aktuelle berufliche Tätigkeit. 
Schreibe einen professionellen Text in 3. Person Singular (Er/Sie), der die berufliche Situation des Teilnehmers beschreibt.
Verwende 8-10 Sätze. Beginne mit "Herr/Frau [Name]..." oder "Der/Die Teilnehmer/in...".

Beispiel-Struktur:
- Aktuelle Position und Unternehmen
- Hauptaufgaben und Verantwortlichkeiten
- Branche und Unternehmenskontext
- Berufserfahrung und Qualifikationen`,
    helpText: 'Beschreiben Sie: Ihre Position, Ihr Unternehmen, Ihre Hauptaufgaben, Ihre Branche',
    requiredSentencesMin: 8,
    requiredSentencesMax: 10,
    icon: 'briefcase',
    sortOrder: 0,
  },
  {
    questionNumber: 2,
    title: 'Warum diese Weiterbildung?',
    description: 'Erklären Sie, warum Sie diese Weiterbildung benötigen',
    aiPrompt: `Der Teilnehmer erklärt, warum er diese Weiterbildung benötigt.
Schreibe einen professionellen Text in 3. Person Singular, der die Notwendigkeit der Weiterbildung begründet.
Verwende 8-10 Sätze.

Beispiel-Struktur:
- Aktuelle Herausforderungen im Beruf
- Fehlende Kenntnisse oder Fähigkeiten
- Veränderungen in der Branche/im Unternehmen
- Konkrete Anforderungen des Arbeitgebers
- Persönliche Entwicklungsziele`,
    helpText: 'Erklären Sie: Welche Herausforderungen haben Sie? Was fehlt Ihnen aktuell? Was fordert Ihr Arbeitgeber?',
    requiredSentencesMin: 8,
    requiredSentencesMax: 10,
    icon: 'target',
    sortOrder: 1,
  },
  {
    questionNumber: 3,
    title: 'Nutzen für die berufliche Tätigkeit',
    description: 'Wie werden Sie das Gelernte in Ihrem Beruf anwenden?',
    aiPrompt: `Der Teilnehmer beschreibt, wie er das Gelernte in seiner beruflichen Tätigkeit anwenden wird.
Schreibe einen professionellen Text in 3. Person Singular, der den konkreten Nutzen der Weiterbildung beschreibt.
Verwende 8-10 Sätze.

Beispiel-Struktur:
- Direkte Anwendung im Arbeitsalltag
- Verbesserung bestehender Prozesse
- Neue Aufgaben und Verantwortlichkeiten
- Effizienzsteigerung
- Qualitätsverbesserung`,
    helpText: 'Beschreiben Sie: Welche konkreten Aufgaben werden einfacher? Welche Prozesse verbessern sich? Welche neuen Möglichkeiten eröffnen sich?',
    requiredSentencesMin: 8,
    requiredSentencesMax: 10,
    icon: 'lightbulb',
    sortOrder: 2,
  },
  {
    questionNumber: 4,
    title: 'Konkrete Anwendungsbeispiele',
    description: 'Nennen Sie konkrete Beispiele, wie Sie das Gelernte einsetzen werden',
    aiPrompt: `Der Teilnehmer nennt konkrete Beispiele für die Anwendung des Gelernten.
Schreibe einen professionellen Text in 3. Person Singular mit konkreten Anwendungsbeispielen.
Verwende 8-10 Sätze.

Beispiel-Struktur:
- Beispiel 1: Konkrete Situation und Anwendung
- Beispiel 2: Weiteres Anwendungsszenario
- Beispiel 3: Zusätzlicher Einsatzbereich
- Messbare Ergebnisse und Verbesserungen
- Zeitliche Perspektive der Umsetzung`,
    helpText: 'Geben Sie 2-3 konkrete Beispiele: In welchen Situationen werden Sie das Gelernte anwenden? Was wird sich dadurch verbessern?',
    requiredSentencesMin: 8,
    requiredSentencesMax: 10,
    icon: 'rocket',
    sortOrder: 3,
  },
  {
    questionNumber: 5,
    title: 'Langfristige berufliche Ziele',
    description: 'Welche langfristigen Ziele verfolgen Sie mit dieser Weiterbildung?',
    aiPrompt: `Der Teilnehmer beschreibt seine langfristigen beruflichen Ziele im Zusammenhang mit der Weiterbildung.
Schreibe einen professionellen Text in 3. Person Singular über die langfristigen Perspektiven.
Verwende 8-10 Sätze.

Beispiel-Struktur:
- Karriereziele und Entwicklungsperspektiven
- Geplante Positionsveränderungen
- Aufbau neuer Kompetenzbereiche
- Beitrag zur Unternehmensentwicklung
- Persönliche Weiterentwicklung
- Sicherung der Beschäftigungsfähigkeit`,
    helpText: 'Beschreiben Sie: Welche Position streben Sie an? Welche Verantwortung möchten Sie übernehmen? Wie sichern Sie Ihre berufliche Zukunft?',
    requiredSentencesMin: 8,
    requiredSentencesMax: 10,
    icon: 'trending-up',
    sortOrder: 4,
  },
];

for (const question of questions) {
  await db.insert(schema.workflowQuestions).values({
    templateId: template.id,
    ...question,
  });
  console.log(`✅ Question ${question.questionNumber}: ${question.title}`);
}

console.log('\n🎉 KOMPASS Standard Template successfully seeded!');
console.log(`   Template ID: ${template.id}`);
console.log(`   Questions: ${questions.length}`);

await connection.end();
