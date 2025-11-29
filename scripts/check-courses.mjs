import { getDb } from '../server/db.ts';
import { courses } from '../drizzle/schema.ts';

const db = await getDb();

if (!db) {
  console.log('❌ Database not available');
  process.exit(1);
}

const result = await db.select().from(courses);

console.log(`\n📊 Kurse in Datenbank: ${result.length}\n`);

if (result.length > 0) {
  result.forEach((course, index) => {
    console.log(`${index + 1}. ${course.name}`);
    console.log(`   Tenant ID: ${course.tenantId}`);
    console.log(`   Aktiv: ${course.isActive}`);
    console.log(`   Veröffentlicht: ${course.isPublished}`);
    console.log('');
  });
} else {
  console.log('⚠️  Keine Kurse gefunden');
}
